/** Short, human bios for the authors readers meet most often. */
export const AUTHOR_BIOS: Record<string, string> = {
  "Jane Austen": "English novelist (1775–1817) who turned drawing-room manners into sharp comedy.",
  "Charles Dickens":
    "Victorian storyteller (1812–1870) famous for crowded London streets and big-hearted plots.",
  "William Shakespeare":
    "English playwright (1564–1616), still the measure for verse drama and tragedy.",
  "Virginia Woolf":
    "Modernist writer (1882–1941) who followed thought and memory as they actually move.",
  "Charlotte Brontë": "Yorkshire novelist (1816–1855) whose heroines refuse to be small.",
  "Emily Brontë": "Poet-novelist (1818–1848) who wrote one wild, weather-beaten masterpiece.",
  "George Eliot":
    "Pen name of Mary Ann Evans (1819–1880), the great English novelist of moral choice.",
  "Thomas Hardy": "English novelist and poet (1840–1928) drawn to fate and country life.",
  "Fyodor Dostoevsky":
    "Russian novelist (1821–1881) who put guilt, faith and obsession under the microscope.",
  "Leo Tolstoy": "Russian novelist (1828–1910), unmatched at vast casts and ordinary feeling.",
  "Anton Chekhov": "Russian doctor turned writer (1860–1904), master of the quiet short story.",
  "Ivan Turgenev": "Russian novelist (1818–1883) of generational change and gentle irony.",
  "Nikolai Gogol": "Ukrainian-born Russian satirist (1809–1852) with a taste for the absurd.",
  "Franz Kafka": "Prague writer (1883–1924) whose bureaucratic nightmares gave us 'Kafkaesque'.",
  "Thomas Mann": "German novelist (1875–1955) of ideas, illness and cultural decline.",
  "Hermann Hesse": "German-Swiss novelist (1877–1962) drawn to spiritual searching.",
  "Johann Wolfgang von Goethe": "German poet and polymath (1749–1832), founder of modern German letters.",
  "James Joyce": "Irish modernist (1882–1941) who rebuilt the novel around a single Dublin day.",
  "Oscar Wilde": "Irish wit (1854–1900), the finest epigram writer in English.",
  "George Orwell": "English essayist and novelist (1903–1950) with a plain style and a political nerve.",
  "Aldous Huxley": "English novelist (1894–1963) who imagined comfort as its own kind of prison.",
  "H. G. Wells": "English pioneer of science fiction (1866–1946) and social prophecy.",
  "Joseph Conrad": "Polish-born sailor turned English novelist (1857–1924) of moral fog at sea.",
  "E. M. Forster": "English novelist (1879–1970) writing about class, empire and connection.",
  "D. H. Lawrence": "English novelist (1885–1930) of bodies, instinct and industrial England.",
  "Ernest Hemingway": "American novelist (1899–1961) whose short sentences changed prose.",
  "F. Scott Fitzgerald": "American novelist (1896–1940), chronicler of the Jazz Age and its hangover.",
  "William Faulkner": "American modernist (1897–1962) mapping one Mississippi county forever.",
  "John Steinbeck": "American novelist (1902–1968) who wrote working people with dignity.",
  "Mark Twain": "American humorist (1835–1910) and the voice of the Mississippi.",
  "Herman Melville": "American novelist (1819–1891) of whales, work and metaphysics.",
  "Nathaniel Hawthorne": "American novelist (1804–1864) haunted by Puritan guilt.",
  "Edith Wharton": "American novelist (1862–1937) dissecting old New York from the inside.",
  "Henry James": "Anglo-American novelist (1843–1916), subtle to the last comma.",
  "Toni Morrison": "American Nobel laureate (1931–2019) writing Black life with mythic force.",
  "James Baldwin": "American essayist and novelist (1924–1987) on race, love and exile.",
  "Ralph Ellison": "American novelist (1913–1994) whose one great book on invisibility says everything.",
  "Zora Neale Hurston": "American novelist and folklorist (1891–1960) with a superb ear for speech.",
  "Victor Hugo": "French novelist and poet (1802–1885) of grand plots and public conscience.",
  "Gustave Flaubert": "French novelist (1821–1880) who made the perfect sentence a duty.",
  "Émile Zola": "French novelist (1840–1902) documenting poverty and appetite without flinching.",
  "Albert Camus": "French-Algerian writer (1913–1960) on absurdity and stubborn decency.",
  "Marcel Proust": "French novelist (1871–1922) whose subject is memory itself.",
  "Alexandre Dumas": "French storyteller (1802–1870), still the best at adventure and revenge.",
  "Stendhal": "French novelist (1783–1842) of ambition and self-invention.",
  "Homer": "Greek poet of the eighth century BC, source of Western epic.",
  "Virgil": "Roman poet (70–19 BC) who gave Rome its founding epic.",
  "Sophocles": "Athenian tragedian (c. 497–406 BC) and author of the tightest plots in drama.",
  "Plato": "Athenian philosopher (c. 428–348 BC) who wrote philosophy as conversation.",
  "Dante Alighieri": "Florentine poet (1265–1321) who mapped the afterlife in terza rima.",
  "Miguel de Cervantes": "Spanish novelist (1547–1616) who invented the modern novel by parodying romance.",
  "Gabriel García Márquez": "Colombian Nobel laureate (1927–2014), the great voice of magical realism.",
  "Jorge Luis Borges": "Argentine writer (1899–1986) of labyrinths, libraries and paradox.",
  "Natsume Sōseki": "Japanese novelist (1867–1916) of quiet modern loneliness.",
  "Yukio Mishima": "Japanese novelist (1925–1970), beautiful and unsettling in equal measure.",
  "Yasunari Kawabata": "Japanese Nobel laureate (1899–1972), spare and snow-lit.",
  "Osamu Dazai": "Japanese novelist (1909–1948) writing shame with terrible honesty.",
  "Chinua Achebe": "Nigerian novelist (1930–2013) who told the colonial encounter from inside.",
  "Robert Louis Stevenson": "Scottish novelist (1850–1894), a born adventure writer.",
  "Mary Shelley": "English novelist (1797–1851) who invented science fiction at nineteen.",
  "Bram Stoker": "Irish novelist (1847–1912) whose vampire never quite dies.",
  "Wilkie Collins": "English novelist (1824–1889), inventor of the sensation mystery.",
  "Willa Cather": "American novelist (1873–1947) of prairie light and quiet grit.",
  "Sylvia Plath": "American poet and novelist (1932–1963), fierce and exact.",
  "Kurt Vonnegut": "American satirist (1922–2007), funny about the very worst things.",
  "Knut Hamsun": "Norwegian novelist (1859–1952) who wrote hunger from the inside.",
  "Samuel Beckett": "Irish writer (1906–1989) who reduced theatre to waiting.",
  "Primo Levi": "Italian chemist and writer (1919–1987), a calm witness to Auschwitz.",
  "Anonymous": "Author unknown — a work carried down by generations of readers.",
};

const ERAS: [string, string][] = [
  ["ancient", "the ancient world"],
  ["early-modern", "the early modern age"],
  ["19c", "the nineteenth century"],
  ["20c", "the twentieth century"],
];

const TRADITIONS: [string, string][] = [
  ["british", "British"],
  ["irish", "Irish"],
  ["russian", "Russian"],
  ["german", "German"],
  ["french", "French"],
  ["american", "American"],
  ["japanese", "Japanese"],
  ["latin", "Latin American"],
  ["african", "African"],
];

/** A one-line bio: curated where we have one, otherwise built from the book itself. */
export function authorBio(author: string, tags: string[]): string {
  const known = AUTHOR_BIOS[author];
  if (known) return known;
  const era = ERAS.find(([t]) => tags.includes(t))?.[1];
  const tradition = TRADITIONS.find(([t]) => tags.includes(t))?.[1];
  const parts = [tradition ? `A ${tradition} writer` : "A writer"];
  if (era) parts.push(`of ${era}`);
  return `${parts.join(" ")}, best known for this book.`;
}
