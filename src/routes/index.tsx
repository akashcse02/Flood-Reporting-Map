import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, Landmark, Search, ShieldCheck, Store, Hotel } from "lucide-react";
import heroImage from "@/assets/hero-dhaka.jpg";
import { LocationPicker, type LocationValue } from "@/components/LocationPicker";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { properties } from "@/data/properties";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thikana — Property for sale & rent in Bangladesh" },
      {
        name: "description",
        content:
          "Find flats, houses, land, hotels and commercial space across every division of Bangladesh. Search by division, city and area.",
      },
      { property: "og:title", content: "Thikana — Property for sale & rent in Bangladesh" },
      {
        property: "og:description",
        content: "Location-first property marketplace for Dhaka, Chattogram, Bogura, Sylhet and beyond.",
      },
    ],
  }),
  component: Index,
});

const categories = [
  { label: "Flats", icon: Building2, type: "Flat" },
  { label: "Houses", icon: Landmark, type: "House" },
  { label: "Land", icon: Landmark, type: "Land" },
  { label: "Hotels", icon: Hotel, type: "Hotel" },
  { label: "Commercial", icon: Store, type: "Commercial" },
] as const;

function Index() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<LocationValue>({ division: "", city: "", area: "" });
  const [purpose, setPurpose] = useState<"Sale" | "Rent">("Sale");

  const featured = properties.filter((p) => p.featured);
  const latest = properties.slice(0, 6);

  return (
    <div>
      <section className="relative">
        <img
          src={heroImage}
          alt="Apartment buildings in Dhaka at sunset"
          width={1600}
          height={1008}
          className="h-[520px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-6xl px-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">Bangladesh property</p>
            <h1 className="mt-3 max-w-2xl text-4xl leading-tight text-primary-foreground sm:text-5xl">
              Find your thikana — from Uttara to Bogura Sadar.
            </h1>
            <p className="mt-4 max-w-xl text-primary-foreground/80">
              Browse verified flats, houses, land and commercial space, area by area.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-16 max-w-5xl px-4">
        <div className="rounded-2xl bg-card p-5 shadow-[var(--shadow-lift)]">
          <div className="mb-4 inline-flex rounded-lg bg-muted p-1">
            {(["Sale", "Rent"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPurpose(p)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  purpose === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                For {p}
              </button>
            ))}
          </div>
          <LocationPicker value={location} onChange={setLocation} />
          <Button
            className="mt-4 h-11 w-full sm:w-auto"
            onClick={() =>
              navigate({
                to: "/browse",
                search: {
                  purpose,
                  division: location.division || undefined,
                  city: location.city || undefined,
                  area: location.area || undefined,
                },
              })
            }
          >
            <Search className="size-4" /> Search properties
          </Button>
        </div>
      </div>

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.label}
              to="/browse"
              search={{ type: c.type }}
              className="flex flex-col items-center gap-2 rounded-xl bg-card px-4 py-5 text-center shadow-[var(--shadow-card)] transition-colors hover:bg-secondary"
            >
              <c.icon className="size-6 text-accent" />
              <span className="text-sm font-medium">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl">Featured listings</h2>
            <p className="mt-1 text-sm text-muted-foreground">Boosted posts from verified owners and agents.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/browse">View all</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <h2 className="text-2xl">Latest across Bangladesh</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-6 text-gold" />
            <div>
              <h2 className="text-2xl text-primary-foreground">Have a property to let go?</h2>
              <p className="mt-1 text-sm text-primary-foreground/80">
                Post it in minutes with photos, amenities and your exact area.
              </p>
            </div>
          </div>
          <Button asChild variant="secondary" className="h-11">
            <Link to="/post">Post a property</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
