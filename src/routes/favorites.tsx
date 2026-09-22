import { createFileRoute, Link } from "@tanstack/react-router";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { properties } from "@/data/properties";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Saved properties — Thikana" },
      { name: "description", content: "The flats, houses and land you saved while browsing Thikana." },
      { property: "og:title", content: "Saved properties — Thikana" },
      { property: "og:description", content: "Your shortlist of Bangladeshi properties." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { ids } = useFavorites();
  const saved = properties.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl">Saved properties</h1>
      {saved.length === 0 ? (
        <div className="mt-8 rounded-xl bg-card p-12 text-center shadow-[var(--shadow-card)]">
          <p className="font-semibold">Nothing saved yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any listing to keep it here.</p>
          <Button asChild className="mt-5">
            <Link to="/browse">Browse properties</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
