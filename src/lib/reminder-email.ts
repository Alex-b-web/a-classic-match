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
