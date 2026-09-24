import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PropertyCard } from "@/components/PropertyCard";
import { properties } from "@/data/properties";
import { matchProperties } from "@/lib/ai-match.functions";
import { useLang } from "@/hooks/use-lang";

export const Route = createFileRoute("/ai-match")({
  head: () => ({
    meta: [
      { title: "AI সম্পত্তি ম্যাচ — ঠিকানা" },
      { name: "description", content: "আপনার চাহিদা লিখুন, AI আপনার জন্য সবচেয়ে মানানসই সম্পত্তি ও কারণ খুঁজে দেবে।" },
      { property: "og:title", content: "AI সম্পত্তি ম্যাচ — ঠিকানা" },
      { property: "og:description", content: "চাহিদা লিখুন, প্রাসঙ্গিক তালিকা ও সংক্ষিপ্ত কারণ পান।" },
    ],
  }),
  component: AiMatch,
});

type Match = { id: string; reason: string };

function AiMatch() {
  const { lang, t } = useLang();
  const run = useServerFn(matchProperties);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [matches, setMatches] = useState<Match[] | null>(null);

  const examples = [
    t("উত্তরায় ৩ বেডের ফ্ল্যাট ভাড়া, বাজেট ৪০ হাজার, পার্কিং লাগবে", "3-bed flat for rent in Uttara, budget 40k, needs parking"),
    t("বগুড়ায় বিনিয়োগের জন্য জমি, ৫০ লক্ষের মধ্যে", "Land in Bogura for investment under 50 lakh"),
  ];

  const submit = async () => {
    if (query.trim().length < 3 || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await run({ data: { query, lang } });
      if (res.ok) {
        setSummary(res.summary);
        setMatches(res.matches);
      } else setError(res.error);
    } catch {
      setError(t("কিছু একটা ভুল হয়েছে, আবার চেষ্টা করুন।", "Something went wrong, please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
        <Sparkles className="size-3.5" /> AI
      </span>
      <h1 className="mt-3 text-3xl">{t("আপনার চাহিদা লিখুন", "Describe what you're looking for")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("এলাকা, বাজেট, রুম, সুবিধা — যা দরকার লিখুন। AI মানানসই সম্পত্তি ও কারণ দেখাবে।", "Area, budget, rooms, amenities — AI will suggest matching listings with reasons.")}
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder={examples[0]}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {examples.map((ex) => (
            <button key={ex} type="button" onClick={() => setQuery(ex)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary">
              {ex}
            </button>
          ))}
          <Button className="ml-auto" onClick={submit} disabled={loading || query.trim().length < 3}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? t("খোঁজা হচ্ছে...", "Finding...") : t("ম্যাচ খুঁজুন", "Find matches")}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      {matches && (
        <section className="mt-10">
          {summary && <p className="mb-6 rounded-lg bg-secondary p-4 text-sm">{summary}</p>}
          {matches.length === 0 ? (
            <p className="text-muted-foreground">{t("কোনো মানানসই সম্পত্তি পাওয়া যায়নি।", "No matching properties found.")}</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {matches.map((m) => {
                const p = properties.find((x) => x.id === m.id);
                if (!p) return null;
                return (
                  <div key={m.id} className="space-y-2">
                    <PropertyCard property={p} />
                    <p className="flex gap-2 rounded-md border-l-2 border-accent bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" /> {m.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
