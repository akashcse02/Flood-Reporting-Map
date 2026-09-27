import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { useLang } from "@/hooks/use-lang";
import { amenityOptions, properties, type Property } from "@/data/properties";
import { formatBDT, formatSize } from "@/lib/format";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "সম্পত্তি তুলনা — ঠিকানা" },
      { name: "description", content: "সংরক্ষিত সম্পত্তিগুলো দাম, লোকেশন, আয়তন, বেডরুম ও সুবিধা অনুযায়ী পাশাপাশি তুলনা করুন।" },
      { property: "og:title", content: "সম্পত্তি তুলনা — ঠিকানা" },
      { property: "og:description", content: "সংরক্ষিত তালিকা পাশাপাশি তুলনা করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Compare,
});

const MAX = 4;

function Compare() {
  const { t } = useLang();
  const { ids, toggle } = useFavorites();
  const saved = properties.filter((p) => ids.includes(p.id));
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    setPicked((prev) => {
      const kept = prev.filter((id) => ids.includes(id));
      return kept.length ? kept : ids.slice(0, MAX);
    });
  }, [ids]);

  const cols = saved.filter((p) => picked.includes(p.id));
  const flip = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX ? prev : [...prev, id]));

  if (saved.length < 2) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-3xl">{t("সম্পত্তি তুলনা", "Compare properties")}</h1>
        <p className="mt-3 text-muted-foreground">
          {t("তুলনা করতে অন্তত ২টি সম্পত্তি সংরক্ষণ করুন (হার্ট আইকনে চাপুন)।", "Save at least 2 properties (tap the heart) to compare them.")}
        </p>
        <Button asChild className="mt-6"><Link to="/browse">{t("সম্পত্তি খুঁজুন", "Browse properties")}</Link></Button>
      </div>
    );
  }

  const minPrice = Math.min(...cols.map((p) => p.price));
  const maxBeds = Math.max(...cols.map((p) => p.beds));
  const yes = <Check className="mx-auto size-4 text-primary" />;
  const no = <Minus className="mx-auto size-4 text-muted-foreground/60" />;

  const rows: { label: string; cell: (p: Property) => React.ReactNode }[] = [
    {
      label: t("অবস্থা", "Status"),
      cell: (p) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.purpose === "Sale" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
          {p.purpose === "Sale" ? t("বিক্রয়", "For Sale") : t("ভাড়া", "For Rent")}
        </span>
      ),
    },
    {
      label: t("দাম", "Price"),
      cell: (p) => (
        <span className={p.price === minPrice && cols.length > 1 ? "font-semibold text-primary" : "font-semibold"}>
          {formatBDT(p.price)}
          {p.purpose === "Rent" && <span className="text-xs font-normal text-muted-foreground">/{t("মাস", "mo")}</span>}
          {p.negotiable && <span className="block text-xs font-normal text-muted-foreground">{t("আলোচনা সাপেক্ষ", "Negotiable")}</span>}
        </span>
      ),
    },
    { label: t("লোকেশন", "Location"), cell: (p) => `${p.area}, ${p.city}` },
    { label: t("ধরন", "Type"), cell: (p) => p.type },
    { label: t("আয়তন", "Size"), cell: (p) => formatSize(p.size, p.sizeUnit) },
    { label: t("বেডরুম", "Bedrooms"), cell: (p) => <span className={p.beds === maxBeds && p.beds > 0 ? "font-semibold text-primary" : ""}>{p.beds || "—"}</span> },
    { label: t("বাথরুম", "Bathrooms"), cell: (p) => p.baths || "—" },
    { label: t("ফার্নিশড", "Furnished"), cell: (p) => p.furnished },
    { label: t("পার্কিং", "Parking"), cell: (p) => (p.parking ? yes : no) },
    ...amenityOptions.filter((a) => a !== "Parking").map((a) => ({ label: a, cell: (p: Property) => (p.amenities.includes(a) ? yes : no) })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl">{t("সম্পত্তি তুলনা", "Compare properties")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t(`সর্বোচ্চ ${MAX}টি সংরক্ষিত সম্পত্তি বেছে নিন।`, `Pick up to ${MAX} saved properties.`)}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {saved.map((p) => {
          const on = picked.includes(p.id);
          return (
            <button key={p.id} type="button" onClick={() => flip(p.id)} disabled={!on && picked.length >= MAX}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
              {p.title}
            </button>
          );
        })}
      </div>

      {cols.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t("তুলনার জন্য সম্পত্তি বেছে নিন।", "Select properties to compare.")}</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-32 bg-card p-3" />
                {cols.map((p) => (
                  <th key={p.id} className="min-w-[170px] p-3 text-left align-top font-normal">
                    <div className="relative">
                      <img src={p.images[0]} alt={p.title} className="aspect-[4/3] w-full rounded-lg object-cover" loading="lazy" />
                      <button type="button" onClick={() => toggle(p.id)} aria-label={t("সংরক্ষিত থেকে সরান", "Remove from saved")}
                        className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-background/90 text-foreground shadow">
                        <X className="size-4" />
                      </button>
                    </div>
                    <Link to="/property/$id" params={{ id: p.id }} className="mt-2 block font-semibold leading-snug hover:text-primary">{p.title}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-border">
                  <th className="sticky left-0 z-10 bg-card p-3 text-left text-xs font-medium text-muted-foreground">{r.label}</th>
                  {cols.map((p) => <td key={p.id} className="p-3 text-center">{r.cell(p)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
