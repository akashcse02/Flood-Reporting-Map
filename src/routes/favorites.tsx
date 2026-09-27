import { createFileRoute, Link } from "@tanstack/react-router";
import { Columns3 } from "lucide-react";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { useLang } from "@/hooks/use-lang";
import { properties } from "@/data/properties";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "সংরক্ষিত সম্পত্তি — ঠিকানা" },
      { name: "description", content: "ব্রাউজ করার সময় সংরক্ষিত ফ্ল্যাট, বাড়ি ও জমি।" },
      { property: "og:title", content: "সংরক্ষিত সম্পত্তি — ঠিকানা" },
      { property: "og:description", content: "আপনার পছন্দের সম্পত্তির তালিকা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { t } = useLang();
  const { ids } = useFavorites();
  const saved = properties.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">{t("সংরক্ষিত সম্পত্তি", "Saved properties")}</h1>
        {saved.length >= 2 && (
          <Button asChild variant="outline"><Link to="/compare"><Columns3 className="size-4" /> {t("তুলনা করুন", "Compare")}</Link></Button>
        )}
      </div>
      {saved.length === 0 ? (
        <div className="mt-8 rounded-xl bg-card p-12 text-center shadow-[var(--shadow-card)]">
          <p className="font-semibold">{t("এখনো কিছু সংরক্ষণ করা হয়নি", "Nothing saved yet")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("যেকোনো তালিকার হার্ট আইকনে চাপুন।", "Tap the heart on any listing to keep it here.")}</p>
          <Button asChild className="mt-5"><Link to="/browse">{t("সম্পত্তি খুঁজুন", "Browse properties")}</Link></Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}
