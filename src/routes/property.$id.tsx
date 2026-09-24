import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bath, BedDouble, BadgeCheck, Car, Check, Heart, MapPin, Phone, Ruler, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { properties } from "@/data/properties";
import { formatBDT, formatSize, timeAgo } from "@/lib/format";
import { useFavorites } from "@/hooks/use-favorites";
import { useLang } from "@/hooks/use-lang";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/property/$id")({
  loader: ({ params }) => {
    const property = properties.find((p) => p.id === params.id);
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "সম্পত্তি পাওয়া যায়নি — ঠিকানা" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.property;
    const desc = p.description.slice(0, 155);
    return {
      meta: [
        { title: `${p.title} — ঠিকানা` },
        { name: "description", content: desc },
        { property: "og:title", content: p.title },
        { property: "og:description", content: desc },
        { property: "og:image", content: p.images[0] ?? "" },
        { name: "twitter:image", content: p.images[0] ?? "" },
      ],
    };
  },
  notFoundComponent: PropertyNotFound,
  component: PropertyDetail,
});

function PropertyNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl">সম্পত্তি পাওয়া যায়নি / Property not found</h1>
      <Button asChild className="mt-6"><Link to="/browse">সব সম্পত্তি / Browse</Link></Button>
    </div>
  );
}

function PropertyDetail() {
  const { property: p } = Route.useLoaderData();
  const { t } = useLang();
  const { isFavorite, toggle } = useFavorites();
  const [active, setActive] = useState(0);
  const saved = isFavorite(p.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("সব সম্পত্তি", "All properties")}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <img src={p.images[active]} alt={p.title} className="aspect-[16/10] w-full rounded-xl object-cover" />
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {p.images.map((src, i) => (
                <button key={src} type="button" onClick={() => setActive(i)} className={cn("shrink-0 overflow-hidden rounded-md border-2", i === active ? "border-primary" : "border-transparent")}>
                  <img src={src} alt="" className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", p.purpose === "Sale" ? "bg-sale text-sale-foreground" : "bg-rent text-rent-foreground")}>
              {p.purpose === "Sale" ? t("বিক্রয়", "For Sale") : t("ভাড়া", "For Rent")}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs">{p.type}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(p.postedAt)}</span>
          </div>
          <h1 className="mt-3 text-3xl">{p.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-muted-foreground"><MapPin className="size-4 text-accent" /> {p.address}, {p.area}, {p.city}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {p.beds > 0 && <Stat icon={<BedDouble className="size-5" />} label={t("বেডরুম", "Bedrooms")} value={p.beds} />}
            {p.baths > 0 && <Stat icon={<Bath className="size-5" />} label={t("বাথরুম", "Bathrooms")} value={p.baths} />}
            <Stat icon={<Ruler className="size-5" />} label={t("আয়তন", "Size")} value={formatSize(p.size, p.sizeUnit)} />
            <Stat icon={<Car className="size-5" />} label={t("পার্কিং", "Parking")} value={p.parking ? t("আছে", "Yes") : t("নেই", "No")} />
          </div>

          <h2 className="mt-8 text-xl">{t("বিবরণ", "Description")}</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{p.description}</p>

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            {p.floor && <Detail label={t("ফ্লোর", "Floor")} value={p.floor} />}
            {p.facing && <Detail label={t("মুখী", "Facing")} value={p.facing} />}
            <Detail label={t("ফার্নিশড", "Furnished")} value={p.furnished} />
          </dl>

          {p.amenities.length > 0 && (
            <>
              <h2 className="mt-8 text-xl">{t("সুবিধাসমূহ", "Amenities")}</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {p.amenities.map((a) => <li key={a} className="flex items-center gap-2 text-sm"><Check className="size-4 text-primary" /> {a}</li>)}
              </ul>
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <p className="font-display text-3xl font-semibold text-primary">
              {formatBDT(p.price)}{p.purpose === "Rent" && <span className="text-base font-normal text-muted-foreground">/{t("মাস", "mo")}</span>}
            </p>
            {p.negotiable && <p className="mt-1 text-sm text-accent">{t("আলোচনা সাপেক্ষ", "Negotiable")}</p>}
            <div className="mt-5 border-t border-border pt-4">
              <p className="flex items-center gap-1.5 font-semibold">{p.seller.name}{p.seller.verified && <BadgeCheck className="size-4 text-primary" />}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Star className="size-4 fill-accent text-accent" /> {p.seller.rating} ({p.seller.reviews})</p>
            </div>
            <Button asChild className="mt-4 w-full"><a href={`tel:${p.seller.phone}`}><Phone className="size-4" /> {t("কল করুন", "Call seller")}</a></Button>
            <Button variant="outline" className="mt-2 w-full" onClick={() => toggle(p.id)}>
              <Heart className={cn("size-4", saved && "fill-destructive text-destructive")} /> {saved ? t("সংরক্ষিত", "Saved") : t("সংরক্ষণ করুন", "Save")}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <span className="text-primary">{icon}</span>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
