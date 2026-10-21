// Supabase Edge Function: welcome-email
// The website calls this right after a reader signs in. It sends the welcome email once per
// account (it remembers in the account's app_metadata.welcome_sent), so calling it again is safe.
// Self-contained: can be pasted into the Supabase dashboard editor.
// Secrets (Edge Functions → Secrets): RESEND_API_KEY, optional REMINDER_FROM and SITE_URL.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const CONTACT = "hello@aclassicmatch.com";

const welcomeHtml = (site: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to A Classic Match</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your next favourite book is waiting.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#f8f2e6;border:1px solid #e3d6bd;border-radius:8px;">
        <tr><td style="padding:36px 32px 32px;font-family:Georgia,'Times New Roman',serif;color:#3a2a1e;">
          <p style="margin:0;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#7d6a56;">A Classic Match</p>

          <h1 style="margin:28px 0 0;font-weight:normal;font-size:30px;line-height:1.2;color:#2e2218;">Welcome to the library.</h1>
          <p style="margin:16px 0 0;font-size:18px;line-height:1.55;">
            You signed up because you want to read more classics, and to actually finish them. That&rsquo;s exactly what A Classic Match is for: finding the classics that suit your taste, and helping you keep reading.
          </p>
          <p style="margin:14px 0 0;font-size:18px;line-height:1.55;">
            Your matches, your list and your reading streak are now saved to your account, ready on any device.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;"><tr><td style="border-radius:999px;background:#9a2f22;">
            <a href="${site}/" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#fbf6ec;text-decoration:none;border-radius:999px;">Find my classics</a>
          </td></tr></table>

          <div style="height:1px;width:96px;background:#c9a24a;margin:32px 0 0;line-height:1px;font-size:1px;">&nbsp;</div>

          <p style="margin:24px 0 0;font-size:17px;line-height:1.5;">Happy reading,<br><em style="font-size:20px;">The A Classic Match team</em></p>
        </td></tr>
      </table>
      <p style="max-width:520px;margin:16px auto 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a7a68;text-align:center;">
        You&rsquo;re getting this because you created an account at aclassicmatch.com.<br>
        Questions? Write to <a href="mailto:hello@aclassicmatch.com" style="color:#8a7a68;">hello@aclassicmatch.com</a> &middot;
        <a href="${site}/account" style="color:#8a7a68;">Manage your account</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;

const welcomeText = (site: string) => `Welcome to the library.

You signed up because you want to read more classics, and to actually finish them. That's exactly what A Classic Match is for: finding the classics that suit your taste, and helping you keep reading.

Your matches, your list and your reading streak are now saved to your account, ready on any device.

Find my classics: ${site}/

Happy reading,
The A Classic Match team

---
You're getting this because you created an account at aclassicmatch.com.
Questions? Write to hello@aclassicmatch.com
Manage your account: ${site}/account`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return json({ error: "RESEND_API_KEY is not set" }, 500);
  const from = Deno.env.get("REMINDER_FROM") ?? `A Classic Match <${CONTACT}>`;
  const site = (Deno.env.get("SITE_URL") ?? "https://www.aclassicmatch.com").replace(/\/$/, "");

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: { persistSession: false },
    },
  );
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: who, error } = await admin.auth.getUser(token);
  if (error || !who?.user) return json({ error: "Please sign in again." }, 401);
  const user = who.user;

  if (user.app_metadata?.welcome_sent) return json({ ok: true, alreadySent: true });
  if (!user.email) return json({ ok: true, skipped: "no email" });

  const res = await fetch(Deno.env.get("RESEND_API_URL") ?? "https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: user.email,
      reply_to: CONTACT,
      subject: "Welcome to A Classic Match",
      html: welcomeHtml(site),
      text: welcomeText(site),
    }),
  });
  if (!res.ok) return json({ error: `Email service said: ${await res.text()}` }, 502);

  await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, welcome_sent: new Date().toISOString() },
  });
  return json({ ok: true });
});
