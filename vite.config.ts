// Builds A Classic Match as a plain static website (HTML, CSS, JS) that runs on any web host,
// including Hostinger shared hosting. There is no server: sign-in, saved data and emails are
// handled by Supabase (see HOSTINGER-SETUP.md). Unknown addresses get public/404.html.
//
// @lovable.dev/vite-tanstack-config already includes TanStack Start, React, Tailwind and the @ path
// alias — do NOT add them again here.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    // Pre-render every page to its own HTML file (e.g. /about/index.html). Hostinger serves these
    // directly; the browser then takes over so sign-in, the quiz and the reading record work.
    prerender: { enabled: true, crawlLinks: false, autoSubfolderIndex: true },
    pages: [
      { path: "/" },
      { path: "/browse" },
      { path: "/plan" },
      { path: "/reading" },
      { path: "/list" },
      { path: "/about" },
      { path: "/privacy" },
      { path: "/cookies" },
      { path: "/auth" },
      { path: "/account" },
    ],
  },
  // No server bundle: Hostinger serves the files directly.
  nitro: false,
});
