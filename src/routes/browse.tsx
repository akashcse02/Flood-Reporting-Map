import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { properties, type PropertyType, type Purpose } from "@/data/properties";
import { formatBDT } from "@/lib/format";

type BrowseSearch = {
  purpose?: Purpose;
  type?: PropertyType;
  division?: string;
  city?: string;
  area?: string;
};

const types: PropertyType[] = ["Flat", "House", "Land", "Hotel", "Commercial"];

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): BrowseSearch => ({
    purpose: search['purpose'] === "Rent" ? "Rent" : search['purpose'] === "Sale" ? "Sale" : undefined,
    type: types.includes(search['type'] as PropertyType) ? (search['type'] as PropertyType) : undefined,
    division: typeof search['division'] === "string" ? search['division'] : undefined,
    city: typeof search['city'] === "string" ? search['city'] : undefined,
    area: typeof search['area'] === "string" ? search['area'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse properties — Thikana" },
      { name: "description", content: "Filter flats, houses, land and commercial property by area, price, type and bedrooms." },
      { property: "og:title", content: "Browse properties — Thikana" },
      { property: "og:description", content: "Search property for sale and rent across Bangladesh." },
    ],
  }),
  component: Browse,
});

function Browse() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/browse" });
  const [maxPrice, setMaxPrice] = useState(200000000);
  const [minBeds, setMinBeds] = useState(0);

  const setSearch = (next: Partial<BrowseSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...next }) });

  const results = useMemo(
    () =>
      properties.filter((p) => {
        if (search.purpose && p.purpose !== search.purpose) return false;
        if (search.type && p.type !== search.type) return false;
        if (search.division && p.division !== search.division) return false;
        if (search.city && p.city !== search.city) return false;
        if (search.area && p.area !== search.area) return false;
        if (p.price > maxPrice) return false;
        if (minBeds && p.beds < minBeds) return false;
        return true;
      }),
    [search, maxPrice, minBeds],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl">Browse properties</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {results.length} listing{results.length === 1 ? "" : "s"} match your filters.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-6 rounded-xl bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24 lg:self-start">
          <p className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="size-4 text-accent" /> Filters
          </p>

          <div className="space-y-2">
            <Label>Purpose</Label>
            <div className="flex gap-2">
              {(["Sale", "Rent"] as const).map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={search.purpose === p ? "default" : "outline"}
                  onClick={() => setSearch({ purpose: search.purpose === p ? undefined : p })}
                >
                  For {p}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Property type</Label>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  variant={search.type === t ? "default" : "outline"}
                  onClick={() => setSearch({ type: search.type === t ? undefined : t })}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="[&>div]:grid-cols-1">
              <LocationPicker
                value={{ division: search.division ?? "", city: search.city ?? "", area: search.area ?? "" }}
                onChange={(v) =>
                  setSearch({
                    division: v.division || undefined,
                    city: v.city || undefined,
                    area: v.area || undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Max price — {formatBDT(maxPrice)}</Label>
            <Slider
              value={[maxPrice]}
              min={10000}
              max={200000000}
              step={10000}
              onValueChange={([v]) => setMaxPrice(v ?? 200000000)}
            />
          </div>

          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((b) => (
                <Button
                  key={b}
                  type="button"
                  size="sm"
                  variant={minBeds === b ? "default" : "outline"}
                  onClick={() => setMinBeds(b)}
                >
                  {b === 0 ? "Any" : `${b}+`}
                </Button>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setMaxPrice(200000000);
              setMinBeds(0);
              navigate({ search: {} });
            }}
          >
            Reset filters
          </Button>
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="rounded-xl bg-card p-12 text-center shadow-[var(--shadow-card)]">
              <p className="font-semibold">No properties found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try widening your area or price range.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
