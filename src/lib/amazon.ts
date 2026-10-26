import type { Book } from "@/data/books";

export type StoreCode = keyof typeof STORES;

export const STORES = {
  GB: { label: "United Kingdom", domain: "amazon.co.uk" },
  US: { label: "United States", domain: "amazon.com" },
  CA: { label: "Canada", domain: "amazon.ca" },
  AU: { label: "Australia", domain: "amazon.com.au" },
  IE: { label: "Ireland", domain: "amazon.co.uk" },
  DE: { label: "Germany", domain: "amazon.de" },
  FR: { label: "France", domain: "amazon.fr" },
  ES: { label: "Spain", domain: "amazon.es" },
  IT: { label: "Italy", domain: "amazon.it" },
  NL: { label: "Netherlands", domain: "amazon.nl" },
  SE: { label: "Sweden", domain: "amazon.se" },
  PL: { label: "Poland", domain: "amazon.pl" },
  TR: { label: "Türkiye", domain: "amazon.com.tr" },
  AE: { label: "United Arab Emirates", domain: "amazon.ae" },
  SA: { label: "Saudi Arabia", domain: "amazon.sa" },
  IN: { label: "India", domain: "amazon.in" },
  JP: { label: "Japan", domain: "amazon.co.jp" },
  SG: { label: "Singapore", domain: "amazon.sg" },
  BR: { label: "Brazil", domain: "amazon.com.br" },
  MX: { label: "Mexico", domain: "amazon.com.mx" },
} as const;

export const DEFAULT_STORE: StoreCode = "GB";

/** Best guess at the reader's storefront from their browser locale. */
export function detectStore(): StoreCode {
  if (typeof navigator === "undefined") return DEFAULT_STORE;
  const locales = [navigator.language, ...(navigator.languages ?? [])];
  for (const locale of locales) {
    if (!locale) continue;
    const region = locale.split(/[-_@]/)[1]?.toUpperCase();
    if (region && region in STORES) return region as StoreCode;
  }
  return DEFAULT_STORE;
}

const COUNTRY_KEY = "acm-country";
const COUNTRY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * The reader's country code, from their connection (Cloudflare's trace page). Looked up once
 * per device and remembered for 30 days. Returns null if the lookup fails or is slow.
 */
export async function lookupCountry(): Promise<string | null> {
  try {
    const saved = JSON.parse(localStorage.getItem(COUNTRY_KEY) ?? "null") as {
      code?: unknown;
      at?: unknown;
    } | null;
    if (
      saved &&
      typeof saved.code === "string" &&
      typeof saved.at === "number" &&
      Date.now() - saved.at < COUNTRY_TTL_MS
    ) {
      return saved.code;
    }
  } catch {
    /* storage unavailable or not valid: look it up again */
  }
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3000);
    const res = await fetch("https://www.cloudflare.com/cdn-cgi/trace", {
      cache: "no-store",
      signal: controller.signal,
    });
    window.clearTimeout(timer);
    if (!res.ok) return null;
    const match = (await res.text()).match(/^loc=([A-Z]{2})$/m);
    if (!match) return null;
    try {
      localStorage.setItem(COUNTRY_KEY, JSON.stringify({ code: match[1], at: Date.now() }));
    } catch {
      /* storage unavailable: still use the country this time */
    }
    return match[1] ?? null;
  } catch {
    return null;
  }
}

/** The storefront for a reader's country, if Amazon has one. Otherwise the language guess. */
export function storeForCountry(code: string | null): StoreCode {
  if (code && code in STORES) return code as StoreCode;
  return detectStore();
}

/** The Associates tag for a store, from config.js (amazonTags). Empty if not set. */
function associateTag(store: StoreCode): string {
  const tags = (window as unknown as { ACM_CONFIG?: { amazonTags?: Record<string, unknown> } })
    .ACM_CONFIG?.amazonTags;
  const tag = typeof tags?.[store] === "string" ? (tags[store] as string).trim() : "";
  return /^[A-Za-z0-9-]+$/.test(tag) ? tag : "";
}

export function amazonUrlFor(b: Book, store: StoreCode) {
  const domain = (STORES[store] ?? STORES[DEFAULT_STORE]).domain;
  const tag = associateTag(store);
  const params = new URLSearchParams({ k: `${b.title} ${b.author}`, i: "stripbooks" });
  if (tag) params.set("tag", tag);
  return `https://www.${domain}/s?${params.toString()}`;
}
