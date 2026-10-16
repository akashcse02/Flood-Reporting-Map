import { Link } from "@tanstack/react-router";
import { BadgeCheck, Bath, BedDouble, Heart, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/data/properties";
import { formatBDT, formatSize, timeAgo } from "@/lib/format";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import { useLang } from "@/hooks/use-lang";

export function PropertyCard({ property }: { property: Property }) {
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(property.id);
  const { t, lang } = useLang();

  return (
    <article className="property-card group overflow-hidden rounded-lg border border-border/70 bg-card shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-lift)]">
      <div className="relative overflow-hidden">
        <span aria-hidden="true" className="card-reflection" />
        <Link to="/property/$id" params={{ id: property.id }}>
          <img
            src={property.images[0]}
            alt={property.title}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <span
          className={cn(
            "absolute left-0 top-4 rounded-r-full px-3 py-1 text-xs font-semibold uppercase tracking-normal",
            property.purpose === "Sale" ? "bg-sale text-sale-foreground" : "bg-rent text-rent-foreground",
          )}
        >
          {property.purpose === "Sale" ? t("বিক্রয়", "For Sale") : t("ভাড়া", "For Rent")}
        </span>
        <button
          type="button"
          aria-label={saved ? t("সংরক্ষিত থেকে সরান", "Remove from saved") : t("সংরক্ষণ করুন", "Save")}
          onClick={() => toggle(property.id)}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/90 text-foreground backdrop-blur transition-colors hover:bg-card"
        >
          <Heart className={cn("size-4", saved && "fill-destructive text-destructive")} />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-lg font-semibold text-primary">
            {formatBDT(property.price)}
            {property.purpose === "Rent" && <span className="text-sm font-normal text-muted-foreground">/{t("মাস", "mo")}</span>}
          </p>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            {property.type}
          </span>
        </div>

        <Link to="/property/$id" params={{ id: property.id }} className="block">
          <h3 className="line-clamp-1 text-base font-semibold">{property.title}</h3>
        </Link>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-accent" />
          <span className="truncate">
            {[property.area, property.city].filter(Boolean).join(", ")}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
          {property.beds > 0 && (
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-4" /> {property.beds}
            </span>
          )}
          {property.baths > 0 && (
            <span className="flex items-center gap-1.5">
              <Bath className="size-4" /> {property.baths}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Ruler className="size-4" /> {formatSize(property.size, property.sizeUnit)}
          </span>
          {property.seller.verified && (
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <BadgeCheck className="size-4" /> {t("ভেরিফায়েড", "Verified")}
            </span>
          )}
          <span className="ml-auto text-xs">{timeAgo(property.postedAt, lang)}</span>
        </div>
      </div>
    </article>
  );
}
