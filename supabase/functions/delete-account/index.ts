// Supabase Edge Function: delete-account
// Called from the Account page ("Yes, delete everything"). Permanently erases the signed-in
// reader's saved data and their account. Self-contained: can be pasted into the Supabase
// dashboard editor (Edge Functions → Deploy a new function → Via Editor).
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Who is asking? Read the reader from their own sign-in token.
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: who, error: whoError } = await admin.auth.getUser(token);
  if (whoError || !who?.user) return json({ error: "Please sign in again." }, 401);
  const userId = who.user.id;

  await admin.from("reader_state").delete().eq("user_id", userId);
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return json({ error: "Could not delete the account. Please try again." }, 500);

  return json({ ok: true });
});
