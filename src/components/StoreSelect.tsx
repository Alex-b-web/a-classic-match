import { Globe } from "lucide-react";
import { STORES, type StoreCode } from "@/lib/amazon";
import { useStore } from "@/hooks/use-store";

/** Lets the reader override the Amazon storefront buy links point at. */
export function StoreSelect({ className = "" }: { className?: string }) {
  const { store, choose } = useStore();

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-2 ${className}`}
    >
      <Globe className="size-4 shrink-0 text-muted-foreground" />
      <span className="sr-only">Amazon storefront</span>
      <select
        value={store}
        onChange={(e) => choose(e.target.value as StoreCode)}
        aria-label="Amazon storefront for buy links"
        className="bg-transparent text-xs uppercase tracking-widest text-muted-foreground outline-none"
      >
        {Object.entries(STORES).map(([code, s]) => (
          <option key={code} value={code}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
