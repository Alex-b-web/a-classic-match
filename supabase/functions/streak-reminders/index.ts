// Supabase Edge Function: streak-reminders
// Runs every hour (scheduled in Supabase with pg_cron — see supabase/schedule-reminders.sql).
// Emails readers who switched on streak reminders, whose streak is still alive but who haven't
// logged any pages yet today, at the hour they picked in their own time zone.
// Self-contained: can be pasted into the Supabase dashboard editor.
//   • Turn OFF "Verify JWT" / "Enforce JWT verification" for this function — it is protected by
//     the CRON_SECRET header instead.
//   • Secrets: RESEND_API_KEY, CRON_SECRET, optional REMINDER_FROM and SITE_URL.
import { createClient } from "npm:@supabase/supabase-js@2";

/* ---- Book titles and page counts (from src/data/books.ts) ---- */
const BOOKS: Record<string, [title: string, pages: number]> = {
  "1984": ["Nineteen Eighty-Four", 328],
  pride: ["Pride and Prejudice", 432],
  "jane-eyre": ["Jane Eyre", 532],
  wuthering: ["Wuthering Heights", 416],
  frankenstein: ["Frankenstein", 280],
  dracula: ["Dracula", 488],
  dorian: ["The Picture of Dorian Gray", 256],
  moby: ["Moby-Dick", 720],
  crime: ["Crime and Punishment", 671],
  karamazov: ["The Brothers Karamazov", 824],
  anna: ["Anna Karenina", 864],
  "war-peace": ["War and Peace", 1296],
  gatsby: ["The Great Gatsby", 180],
  "brave-new-world": ["Brave New World", 288],
  mockingbird: ["To Kill a Mockingbird", 336],
  catcher: ["The Catcher in the Rye", 277],
  "mrs-dalloway": ["Mrs Dalloway", 194],
  middlemarch: ["Middlemarch", 880],
  "great-expectations": ["Great Expectations", 544],
  "les-mis": ["Les Misérables", 1488],
  "monte-cristo": ["The Count of Monte Cristo", 1276],
  "madame-bovary": ["Madame Bovary", 368],
  "don-quixote": ["Don Quixote", 1072],
  odyssey: ["The Odyssey", 560],
  gulliver: ["Gulliver's Travels", 336],
  "farewell-arms": ["A Farewell to Arms", 332],
  "quiet-western": ["All Quiet on the Western Front", 296],
  "invisible-man": ["Invisible Man", 581],
  "their-eyes": ["Their Eyes Were Watching God", 219],
  sherlock: ["The Adventures of Sherlock Holmes", 307],
  hamlet: ["Hamlet", 289],
  macbeth: ["Macbeth", 249],
  "paradise-lost": ["Paradise Lost", 453],
  iliad: ["The Iliad", 704],
  aeneid: ["The Aeneid", 442],
  inferno: ["The Divine Comedy: Inferno", 432],
  meditations: ["Meditations", 254],
  republic: ["The Republic", 416],
  oedipus: ["The Three Theban Plays", 432],
  canterbury: ["The Canterbury Tales", 504],
  robinson: ["Robinson Crusoe", 320],
  tristram: ["The Life and Opinions of Tristram Shandy", 704],
  "sense-sensibility": ["Sense and Sensibility", 409],
  emma: ["Emma", 474],
  persuasion: ["Persuasion", 249],
  "tale-two-cities": ["A Tale of Two Cities", 489],
  "oliver-twist": ["Oliver Twist", 554],
  "bleak-house": ["Bleak House", 1017],
  tess: ["Tess of the d'Urbervilles", 592],
  jude: ["Jude the Obscure", 512],
  "vanity-fair": ["Vanity Fair", 912],
  "north-south": ["North and South", 521],
  moonstone: ["The Moonstone", 528],
  "woman-white": ["The Woman in White", 672],
  jekyll: ["The Strange Case of Dr Jekyll and Mr Hyde", 144],
  "treasure-island": ["Treasure Island", 311],
  "heart-darkness": ["Heart of Darkness", 188],
  "time-machine": ["The Time Machine", 118],
  "portrait-lady": ["The Portrait of a Lady", 656],
  "huck-finn": ["Adventures of Huckleberry Finn", 366],
  "scarlet-letter": ["The Scarlet Letter", 279],
  "little-women": ["Little Women", 449],
  walden: ["Walden", 352],
  "notes-underground": ["Notes from Underground", 136],
  idiot: ["The Idiot", 667],
  "fathers-sons": ["Fathers and Sons", 226],
  "dead-souls": ["Dead Souls", 464],
  "cherry-orchard": ["The Cherry Orchard and Other Plays", 384],
  "master-margarita": ["The Master and Margarita", 384],
  swann: ["In Search of Lost Time: Swann's Way", 496],
  stranger: ["The Stranger", 123],
  nausea: ["Nausea", 178],
  "red-black": ["The Red and the Black", 576],
  hunchback: ["The Hunchback of Notre-Dame", 512],
  faust: ["Faust", 503],
  "magic-mountain": ["The Magic Mountain", 706],
  trial: ["The Trial", 255],
  metamorphosis: ["The Metamorphosis", 201],
  siddhartha: ["Siddhartha", 152],
  ulysses: ["Ulysses", 783],
  "portrait-artist": ["A Portrait of the Artist as a Young Man", 329],
  dubliners: ["Dubliners", 224],
  godot: ["Waiting for Godot", 109],
  "to-lighthouse": ["To the Lighthouse", 209],
  orlando: ["Orlando", 333],
  "howards-end": ["Howards End", 336],
  "passage-india": ["A Passage to India", 368],
  brideshead: ["Brideshead Revisited", 402],
  "lord-flies": ["Lord of the Flies", 224],
  "animal-farm": ["Animal Farm", 141],
  "sun-also-rises": ["The Sun Also Rises", 251],
  "old-man-sea": ["The Old Man and the Sea", 127],
  "grapes-wrath": ["The Grapes of Wrath", 464],
  "of-mice-men": ["Of Mice and Men", 107],
  "east-eden": ["East of Eden", 601],
  "sound-fury": ["The Sound and the Fury", 326],
  "as-i-lay-dying": ["As I Lay Dying", 267],
  "native-son": ["Native Son", 504],
  beloved: ["Beloved", 324],
  "bell-jar": ["The Bell Jar", 288],
  rebecca: ["Rebecca", 449],
  fahrenheit: ["Fahrenheit 451", 194],
  handmaids: ["The Handmaid's Tale", 311],
  "hundred-years": ["One Hundred Years of Solitude", 417],
  cholera: ["Love in the Time of Cholera", 348],
  "pedro-paramo": ["Pedro Páramo", 124],
  ficciones: ["Labyrinths", 288],
  kokoro: ["Kokoro", 248],
  "snow-country": ["Snow Country", 175],
  genji: ["The Tale of Genji", 1216],
  rashomon: ["Rashōmon and Seventeen Other Stories", 268],
  "things-fall-apart": ["Things Fall Apart", 209],
  "cry-beloved": ["Cry, the Beloved Country", 316],
  "doll-house": ["A Doll's House and Other Plays", 384],
  hunger: ["Hunger", 240],
  "leaves-grass": ["Leaves of Grass", 624],
  "mansfield-park": ["Mansfield Park", 480],
  northanger: ["Northanger Abbey", 288],
  shirley: ["Shirley", 624],
  "tenant-wildfell": ["The Tenant of Wildfell Hall", 512],
  villette: ["Villette", 576],
  "mill-floss": ["The Mill on the Floss", 608],
  "silas-marner": ["Silas Marner", 224],
  "daniel-deronda": ["Daniel Deronda", 880],
  "david-copperfield": ["David Copperfield", 896],
  "hard-times": ["Hard Times", 336],
  "our-mutual-friend": ["Our Mutual Friend", 800],
  "far-madding": ["Far from the Madding Crowd", 464],
  "return-native": ["The Return of the Native", 480],
  "way-all-flesh": ["The Way of All Flesh", 448],
  "secret-agent": ["The Secret Agent", 288],
  nostromo: ["Nostromo", 480],
  "war-worlds": ["The War of the Worlds", 208],
  "invisible-man-wells": ["The Invisible Man", 176],
  "importance-earnest": ["The Importance of Being Earnest", 96],
  "man-who-was-thursday": ["The Man Who Was Thursday", 208],
  "good-soldier": ["The Good Soldier", 256],
  "sons-lovers": ["Sons and Lovers", 480],
  "women-in-love": ["Women in Love", 576],
  "point-counter-point": ["Point Counter Point", 448],
  "burmese-days": ["Burmese Days", 320],
  "goodbye-berlin": ["Goodbye to Berlin", 256],
  "day-of-locust": ["The Day of the Locust", 192],
  winesburg: ["Winesburg, Ohio", 240],
  "my-antonia": ["My Ántonia", 240],
  "death-comes-archbishop": ["Death Comes for the Archbishop", 320],
  "age-innocence": ["The Age of Innocence", 320],
  "house-mirth": ["The House of Mirth", 368],
  awakening: ["The Awakening", 208],
  "ethan-frome": ["Ethan Frome", 128],
  "call-of-wild": ["The Call of the Wild", 176],
  "sister-carrie": ["Sister Carrie", 576],
  "main-street": ["Main Street", 560],
  "light-in-august": ["Light in August", 512],
  absalom: ["Absalom, Absalom!", 384],
  "wise-blood": ["Wise Blood", 256],
  "go-tell-mountain": ["Go Tell It on the Mountain", 256],
  "giovannis-room": ["Giovanni's Room", 176],
  "on-the-road": ["On the Road", 320],
  "one-flew-cuckoo": ["One Flew Over the Cuckoo's Nest", 336],
  "catch-22": ["Catch-22", 544],
  "slaughterhouse-five": ["Slaughterhouse-Five", 288],
  "song-of-solomon": ["Song of Solomon", 400],
  "beloved-country-none": ["A Room of One's Own", 128],
  waves: ["The Waves", 240],
  "berlin-alexanderplatz": ["Berlin Alexanderplatz", 464],
  "man-without-qualities": ["The Man Without Qualities", 1130],
  steppenwolf: ["Steppenwolf", 256],
  buddenbrooks: ["Buddenbrooks", 736],
  "death-in-venice": ["Death in Venice", 144],
  castle: ["The Castle", 352],
  plague: ["The Plague", 320],
  germinal: ["Germinal", 592],
  "therese-raquin": ["Thérèse Raquin", 256],
  "bel-ami": ["Bel-Ami", 400],
  candide: ["Candide", 144],
  "dangerous-liaisons": ["Les Liaisons Dangereuses", 448],
  "essays-montaigne": ["The Essays: A Selection", 480],
  decameron: ["The Decameron", 909],
  "the-prince": ["The Prince", 144],
  "confessions-augustine": ["Confessions", 384],
  nicomachean: ["Nicomachean Ethics", 352],
  metamorphoses: ["Metamorphoses", 723],
  "histories-herodotus": ["The Histories", 784],
  peloponnesian: ["History of the Peloponnesian War", 648],
  oresteia: ["The Oresteia", 336],
  medea: ["Medea and Other Plays", 240],
  lysistrata: ["Lysistrata and Other Plays", 288],
  "king-lear": ["King Lear", 400],
  othello: ["Othello", 368],
  tempest: ["The Tempest", 240],
  "doctor-faustus": ["Doctor Faustus", 128],
  beowulf: ["Beowulf", 256],
  "morte-darthur": ["Le Morte d'Arthur", 528],
  oblomov: ["Oblomov", 576],
  "eugene-onegin": ["Eugene Onegin", 240],
  "hero-of-our-time": ["A Hero of Our Time", 208],
  "death-ivan-ilyich": ["The Death of Ivan Ilyich", 128],
  "doctor-zhivago": ["Doctor Zhivago", 592],
  "quiet-flows-don": ["One Day in the Life of Ivan Denisovich", 208],
  "we-zamyatin": ["We", 240],
  petersburg: ["Petersburg", 368],
  leopard: ["The Leopard", 336],
  "if-this-is-a-man": ["If This Is a Man", 400],
  zorba: ["Zorba the Greek", 336],
  "cairo-trilogy": ["Palace Walk", 512],
  "season-migration": ["Season of Migration to the North", 176],
  "no-longer-human": ["No Longer Human", 176],
  "some-prefer-nettles": ["Some Prefer Nettles", 208],
  "temple-golden-pavilion": ["The Temple of the Golden Pavilion", 272],
  "i-am-a-cat": ["I Am a Cat", 480],
  "journey-west": ["Monkey: A Journey to the West", 352],
  "dream-red-chamber": ["The Story of the Stone, Vol. 1", 544],
  rubaiyat: ["The Rubáiyát of Omar Khayyám", 96],
  "thousand-nights": ["The Arabian Nights", 1088],
  mahabharata: ["The Bhagavad Gita", 176],
  "epic-gilgamesh": ["The Epic of Gilgamesh", 128],
  kalevala: ["Independent People", 560],
  "growth-of-soil": ["Growth of the Soil", 448],
  "kristin-lavransdatter": ["Kristin Lavransdatter", 1144],
  "good-soldier-svejk": ["The Good Soldier Švejk", 784],
  ferdydurke: ["Ferdydurke", 288],
  hopscotch: ["Hopscotch", 576],
  "death-artemio-cruz": ["The Death of Artemio Cruz", 320],
  "house-spirits": ["The House of the Spirits", 496],
  "kiss-spider-woman": ["Kiss of the Spider Woman", 288],
  "critique-pure-reason": ["Critique of Pure Reason", 796],
  "phenomenology-spirit": ["Phenomenology of Spirit", 640],
  "thus-spoke-zarathustra": ["Thus Spoke Zarathustra", 352],
  "beyond-good-evil": ["Beyond Good and Evil", 240],
  "genealogy-morals": ["On the Genealogy of Morals", 208],
  "being-and-time": ["Being and Time", 608],
  "second-sex": ["The Second Sex", 800],
  "myth-sisyphus": ["The Myth of Sisyphus", 212],
  leviathan: ["Leviathan", 736],
  "second-treatise": ["Two Treatises of Government", 464],
  "social-contract": ["The Social Contract", 192],
  "on-liberty": ["On Liberty", 192],
  "communist-manifesto": ["The Communist Manifesto", 96],
  "capital-one": ["Capital, Volume I", 1152],
  "wealth-of-nations": ["The Wealth of Nations", 1264],
  "democracy-in-america": ["Democracy in America", 992],
  "reflections-revolution": ["Reflections on the Revolution in France", 400],
  "vindication-rights-woman": ["A Vindication of the Rights of Woman", 320],
  "origin-of-species": ["On the Origin of Species", 512],
  "interpretation-dreams": ["The Interpretation of Dreams", 704],
  "civilization-discontents": ["Civilization and Its Discontents", 144],
  "protestant-ethic": ["The Protestant Ethic and the Spirit of Capitalism", 320],
  "suicide-durkheim": ["Suicide: A Study in Sociology", 416],
  "golden-bough": ["The Golden Bough", 928],
  "hero-thousand-faces": ["The Hero with a Thousand Faces", 432],
  orientalism: ["Orientalism", 432],
  "wretched-earth": ["The Wretched of the Earth", 320],
  "discipline-punish": ["Discipline and Punish", 352],
  "structure-scientific-revolutions": ["The Structure of Scientific Revolutions", 264],
  tractatus: ["Tractatus Logico-Philosophicus", 128],
  "philosophical-investigations": ["Philosophical Investigations", 320],
  "meditations-descartes": ["Meditations on First Philosophy", 128],
  "ethics-spinoza": ["Ethics", 384],
  "enquiry-hume": ["An Enquiry Concerning Human Understanding", 224],
  symposium: ["The Symposium", 128],
  "apology-plato": ["The Last Days of Socrates", 272],
  poetics: ["Poetics", 144],
  "politics-aristotle": ["Politics", 512],
  "nature-of-things": ["On the Nature of Things", 288],
  "letters-stoic": ["Letters from a Stoic", 254],
  "discourses-epictetus": ["Discourses and Selected Writings", 288],
  "consolation-philosophy": ["The Consolation of Philosophy", 208],
  "city-of-god": ["The City of God", 1184],
  "lives-plutarch": ["The Rise and Fall of Athens: Nine Greek Lives", 320],
  "annals-tacitus": ["The Annals of Imperial Rome", 464],
  "gallic-war": ["The Conquest of Gaul", 272],
  anabasis: ["The Persian Expedition", 384],
  "decline-fall": ["The History of the Decline and Fall of the Roman Empire (Abridged)", 848],
  "the-histories-livy": ["The Early History of Rome", 464],
  "art-of-war": ["The Art of War", 128],
  analects: ["The Analects", 256],
  "tao-te-ching": ["Tao Te Ching", 128],
  "essay-experience": ["The Souls of Black Folk", 288],
  "narrative-douglass": ["Narrative of the Life of Frederick Douglass", 160],
  "eichmann-jerusalem": ["Eichmann in Jerusalem", 336],
  "origins-totalitarianism": ["The Origins of Totalitarianism", 704],
  "open-society": ["The Open Society and Its Enemies", 800],
  "road-to-serfdom": ["The Road to Serfdom", 288],
  "theory-of-justice": ["A Theory of Justice", 624],
  mimesis: ["Mimesis: The Representation of Reality in Western Literature", 616],
  "anatomy-criticism": ["Anatomy of Criticism", 400],
  "seven-types-ambiguity": ["Seven Types of Ambiguity", 288],
  "aspects-novel": ["Aspects of the Novel", 176],
  "rise-of-novel": ["The Rise of the Novel", 336],
  "madwoman-attic": ["The Madwoman in the Attic", 768],
  "praise-of-folly": ["Praise of Folly", 208],
  utopia: ["Utopia", 160],
  "novum-organum": ["The New Organon", 288],
  areopagitica: ["Areopagitica and Other Writings", 464],
  "rights-of-man": ["Rights of Man", 288],
  federalist: ["The Federalist Papers", 528],
  "civil-disobedience": ["Civil Disobedience and Other Essays", 128],
  "self-reliance": ["Self-Reliance and Other Essays", 128],
  "culture-anarchy": ["Culture and Anarchy", 256],
  "renaissance-pater": ["The Renaissance: Studies in Art and Poetry", 224],
  "fear-and-trembling": ["Fear and Trembling", 192],
  "either-or": ["Either/Or: A Fragment of Life", 640],
  "world-as-will": ["The World as Will and Representation, Vol. 1", 592],
  "essay-concerning": ["An Essay Concerning Human Understanding", 848],
  "life-of-johnson": ["The Life of Samuel Johnson", 1360],
  "confessions-rousseau": ["The Confessions of Jean-Jacques Rousseau", 656],
  "prison-notebooks": ["Selections from the Prison Notebooks", 592],
  "dialectic-enlightenment": ["Dialectic of Enlightenment", 304],
  "gift-mauss": ["The Gift", 176],
  "savage-mind": ["The Savage Mind", 320],
};

/* ---- Email wording and design (same as src/lib/reminder-email.ts) ---- */
/** Builds the streak reminder email. Shared by the Record page preview and the hourly job. */

/** Where readers' replies and questions go (the site's Outlook mailbox). */
export const CONTACT_EMAIL = "hello@aclassicmatch.com";

export type ReminderInput = {
  streak: number;
  bookTitle: string | null;
  pagesLeft: number | null;
  siteUrl: string;
};

export function suggestedPages(pagesLeft: number | null): number {
  if (pagesLeft === null) return 20;
  return Math.max(1, Math.min(20, pagesLeft));
}

export function reminderSubject({ streak, bookTitle }: ReminderInput): string {
  return bookTitle
    ? `${streak} ${streak === 1 ? "day" : "days"} with ${bookTitle}. Keep it going?`
    : `Your ${streak}-day reading streak ends at midnight`;
}

export function reminderText(input: ReminderInput): string {
  const { streak, bookTitle, pagesLeft, siteUrl } = input;
  const pages = suggestedPages(pagesLeft);
  const lead = bookTitle
    ? `You're on a ${streak}-day streak with ${bookTitle}. ${pages} pages tonight?`
    : `You're on a ${streak}-day reading streak. ${pages} pages tonight keeps it alive.`;
  return `${lead}

Log tonight's pages: ${siteUrl}/reading

Happy reading,
Alex

You get this email because streak reminders are on. Turn them off any time: ${siteUrl}/account
Questions? Write to ${CONTACT_EMAIL}`;
}

export function reminderHtml(input: ReminderInput): string {
  const { streak, bookTitle, pagesLeft, siteUrl } = input;
  const pages = suggestedPages(pagesLeft);
  const esc = (s: string) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const lead = bookTitle
    ? `You&rsquo;re on a <strong>${streak}-day streak</strong> with <em>${esc(bookTitle)}</em>. ${pages} pages tonight?`
    : `You&rsquo;re on a <strong>${streak}-day reading streak</strong>. ${pages} pages tonight keeps it alive.`;
  return `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#ffffff">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#f8f2e6;border:1px solid #e3d6bd;border-radius:8px"><tr><td style="padding:36px 32px 32px;font-family:Georgia,'Times New Roman',serif;color:#3a2a1e">
  <p style="margin:0;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#7d6a56">A Classic Match</p>
  <p style="margin:28px 0 0;font-size:22px;line-height:1.4;color:#2e2218">${lead}</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0"><tr><td style="border-radius:999px;background:#9a2f22">
    <a href="${siteUrl}/reading" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#fbf6ec;text-decoration:none;border-radius:999px">Log tonight&rsquo;s pages</a>
  </td></tr></table>
  <div style="height:1px;width:96px;background:#c9a24a;margin:32px 0 0;line-height:1px;font-size:1px">&nbsp;</div>
  <p style="margin:24px 0 0;font-size:17px;line-height:1.5">Happy reading,<br><em style="font-size:22px">Alex</em></p>
</td></tr></table>
<p style="max-width:520px;margin:16px auto 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a7a68;text-align:center">
  You get this email because streak reminders are on. <a href="${siteUrl}/account" style="color:#8a7a68">Turn them off</a> any time.<br>
  Questions? Write to <a href="mailto:${CONTACT_EMAIL}" style="color:#8a7a68">${CONTACT_EMAIL}</a>
</p>
</td></tr></table></body></html>`;
}

/* ---- Streak logic ---- */
type Log = Record<string, Record<string, number>>;
type State = { log?: Log; reminders?: { on?: boolean; hour?: number; tz?: string } };

function localDate(tz: string, offsetDays = 0): string {
  const d = new Date(Date.now() - offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d); // YYYY-MM-DD
}
function localHour(tz: string): number {
  return (
    Number(
      new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(
        new Date(),
      ),
    ) % 24
  );
}
const pagesOnDay = (log: Log, date: string) =>
  Object.values(log).reduce((n, days) => n + (days[date] ?? 0), 0);
const total = (days: Record<string, number> = {}) => Object.values(days).reduce((n, p) => n + p, 0);

/** Streak counted back from yesterday — today hasn't been logged, which is why we're writing. */
function streakAtRisk(log: Log, tz: string): number {
  let count = 0;
  for (let i = 1; i < 400 && pagesOnDay(log, localDate(tz, i)) > 0; i++) count++;
  return count;
}

/** The unfinished book the reader logged most recently. */
function currentBook(log: Log): { title: string | null; pagesLeft: number | null } {
  let best: { id: string; last: string } | null = null;
  for (const [id, days] of Object.entries(log)) {
    const book = BOOKS[id];
    if (!book || total(days) >= book[1]) continue;
    const last = Object.keys(days).sort().pop() ?? "";
    if (!best || last > best.last) best = { id, last };
  }
  if (!best) return { title: null, pagesLeft: null };
  const [title, pages] = BOOKS[best.id]!;
  return { title, pagesLeft: pages - total(log[best.id]) };
}

Deno.serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return new Response("RESEND_API_KEY is not set", { status: 500 });
  const from = Deno.env.get("REMINDER_FROM") ?? `A Classic Match <${CONTACT_EMAIL}>`;
  const siteUrl = (Deno.env.get("SITE_URL") ?? "https://www.aclassicmatch.com").replace(/\/$/, "");

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: { persistSession: false },
    },
  );
  const { data: rows, error } = await admin
    .from("reader_state")
    .select("user_id, data")
    .eq("data->reminders->>on", "true");
  if (error) return new Response(error.message, { status: 500 });

  let sent = 0;
  let failed = 0;
  for (const row of rows ?? []) {
    // One reader's bad data or a failed send never stops the others.
    try {
      const state = (row.data ?? {}) as State;
      const tz = state.reminders?.tz || "Europe/London";
      const hour = state.reminders?.hour ?? 19;
      const log = state.log ?? {};

      if (localHour(tz) !== hour) continue; // not their chosen time yet
      if (pagesOnDay(log, localDate(tz)) > 0) continue; // already read today
      const streak = streakAtRisk(log, tz);
      if (streak < 1) continue; // nothing to keep alive

      const { data: u } = await admin.auth.admin.getUserById(row.user_id);
      const to = u?.user?.email;
      if (!to) continue;

      const book = currentBook(log);
      const input = { streak, bookTitle: book.title, pagesLeft: book.pagesLeft, siteUrl };
      const res = await fetch(Deno.env.get("RESEND_API_URL") ?? "https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          reply_to: CONTACT_EMAIL,
          subject: reminderSubject(input),
          html: reminderHtml(input),
          text: reminderText(input),
          headers: { "List-Unsubscribe": `<${siteUrl}/account>` },
        }),
      });
      if (res.ok) sent++;
    } catch (e) {
      failed++;
      console.error(`Reminder for ${row.user_id} failed:`, e);
    }
  }

  return Response.json({ checked: rows?.length ?? 0, sent, failed });
});
