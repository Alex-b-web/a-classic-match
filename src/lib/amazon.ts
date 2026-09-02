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
    const region = locale.split("-")[1]?.toUpperCase();
    if (region && region in STORES) return region as StoreCode;
  }
  return DEFAULT_STORE;
}

export function amazonUrlFor(b: Book, store: StoreCode) {
  const domain = (STORES[store] ?? STORES[DEFAULT_STORE]).domain;
  return `https://www.${domain}/s?k=${encodeURIComponent(`${b.title} ${b.author}`)}&i=stripbooks`;
}
