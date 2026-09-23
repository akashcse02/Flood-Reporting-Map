import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Hotel,
  Landmark,
  MapPin,
  MessageCircle,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import heroImage from "@/assets/hero-dhaka.jpg";
import { LocationPicker, type LocationValue } from "@/components/LocationPicker";
import { PropertyCard } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { divisions } from "@/data/locations";
import { properties, type Property } from "@/data/properties";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ঠিকানা — বাংলাদেশে সম্পত্তি কেনা, বেচা ও ভাড়া" },
      {
        name: "description",
        content: "বাংলাদেশের সব বিভাগে ফ্ল্যাট, বাড়ি, জমি, হোটেল ও বাণিজ্যিক সম্পত্তি খুঁজুন। এলাকা, বাজেট ও ধরন অনুযায়ী যাচাইকৃত বিজ্ঞাপন দেখুন।",
      },
      { property: "og:title", content: "ঠিকানা — আপনার পরবর্তী ঠিকানা এখানেই" },
      { property: "og:description", content: "বাংলাদেশজুড়ে বিশ্বস্ত সম্পত্তির মার্কেটপ্লেস।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const bnDigits = (value: number) => value.toLocaleString("bn-BD");

const categories = [
  { label: "ফ্ল্যাট", icon: Building2, type: "Flat" },
  { label: "বাড়ি", icon: Landmark, type: "House" },
  { label: "জমি", icon: MapPin, type: "Land" },
  { label: "হোটেল", icon: Hotel, type: "Hotel" },
  { label: "কমার্শিয়াল", icon: Store, type: "Commercial" },
] as const;

const popularSearches = [
  { label: "উত্তরায় ফ্ল্যাট ভাড়া", area: "Uttara", purpose: "Rent" as const },
  { label: "গুলশানে বাড়ি বিক্রয়", area: "Gulshan", purpose: "Sale" as const },
  { label: "বগুড়ায় প্লট", area: "Bogura Sadar", purpose: "Sale" as const },
];

const curatedSuggestions = [
  { label: "উত্তরা", value: "Uttara", type: "এলাকা", icon: MapPin },
  { label: "গুলশান ২", value: "Gulshan", type: "এলাকা", icon: MapPin },
  { label: "বসুন্ধরা আর/এ", value: "Bashundhara", type: "এলাকা", icon: MapPin },
  { label: "জমুনা ফিউচার পার্ক", value: "Bashundhara", type: "ল্যান্ডমার্ক", icon: Landmark },
  { label: "হাতিরঝিল", value: "Rampura", type: "ল্যান্ডমার্ক", icon: Landmark },
  { label: "শান্তা ওয়েস্টার্ন টাওয়ার", value: "Tejgaon", type: "প্রজেক্ট", icon: Building2 },
  { label: "বায়তুল আমান হাউজিং", value: "Adabor", type: "প্রজেক্ট", icon: Building2 },
];

const budgets = [
  { label: "৫–১০ লক্ষ", min: 500000, max: 1000000 },
  { label: "১০–৩০ লক্ষ", min: 1000000, max: 3000000 },
  { label: "৩০–৭০ লক্ষ", min: 3000000, max: 7000000 },
  { label: "৭০ লক্ষ+", min: 7000000, max: Number.POSITIVE_INFINITY },
];

const trendingAreas = [
  { name: "ধানমন্ডি", count: "১,২৪০টি বাড়ি", change: "+৮.৪%", points: "2,40 18,34 34,36 50,22 66,25 82,12 98,8" },
  { name: "উত্তরা", count: "১,৮৯০টি বাড়ি", change: "+৬.৯%", points: "2,38 18,31 34,33 50,28 66,18 82,22 98,9" },
  { name: "বসুন্ধরা", count: "৯৮০টি বাড়ি", change: "+১১.২%", points: "2,42 18,39 34,26 50,31 66,19 82,14 98,5" },
  { name: "বগুড়া সদর", count: "৬৪০টি বাড়ি", change: "+৫.১%", points: "2,38 18,36 34,27 50,30 66,20 82,17 98,12" },
];

const areaPrices = [
  { area: "ধানমন্ডি", price: "৳ ১২,৮০০", width: "100%" },
  { area: "উত্তরা", price: "৳ ৯,৪৫০", width: "74%" },
  { area: "বগুড়া", price: "৳ ৪,২০০", width: "33%" },
];

function useReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reduced) {
      nodes.forEach((node) => node.dataset.visible = "true");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4" data-reveal>
      <div>
        <span className="section-eyebrow">{eyebrow}</span>
        <div className="title-curtain"><h2 className="section-title">{title}</h2></div>
      </div>
      {action}
    </div>
  );
}

function CountUp({ target, suffix }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      if (reduced) setValue(target);
      else {
        const start = performance.now();
        const frame = (now: number) => {
          const progress = Math.min((now - start) / 1400, 1);
          setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{bnDigits(value)}{suffix}</span>;
}

function PropertyRail({ items, freshest = false }: { items: Property[]; freshest?: boolean }) {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, scroll: 0 });
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;
    drag.current = { active: true, x: event.clientX, scroll: rail.scrollLeft };
    rail.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !drag.current.active) return;
    rail.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x) * 1.15;
  };
  const stop = () => { drag.current.active = false; };
  return (
    <div
      ref={railRef}
      className="property-rail -mx-4 flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-5 active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      data-reveal
    >
      {items.map((property, index) => (
        <div key={`${property.id}-${index}`} className="relative w-[84vw] max-w-[340px] shrink-0 snap-start reveal-card" style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}>
          {freshest && index < 3 && <span className="new-badge">নতুন</span>}
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<LocationValue>({ division: "", city: "", area: "" });
  const [purpose, setPurpose] = useState<"Sale" | "Rent">("Sale");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [listening, setListening] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [budget, setBudget] = useState<(typeof budgets)[number] | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const heroRef = useRef<HTMLImageElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  useReveal();

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem("thikana-recent-searches") ?? "[]")); } catch { setRecent([]); }
    const onScroll = () => {
      const image = heroRef.current;
      if (image && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        image.style.transform = `translate3d(0, ${Math.min(window.scrollY * 0.075, 24)}px, 0) scale(1.04)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const allAreaSuggestions = useMemo(() => divisions.flatMap((division) =>
    division.cities.flatMap((city) => city.areas.map((area) => ({ label: area, value: area, type: "এলাকা", icon: MapPin })))
  ), []);
  const suggestions = useMemo(() => {
    const source = [...curatedSuggestions, ...allAreaSuggestions];
    const term = query.trim().toLocaleLowerCase();
    const unique = source.filter((item, index) => source.findIndex((other) => other.value === item.value && other.label === item.label) === index);
    return (term ? unique.filter((item) => `${item.label} ${item.value}`.toLocaleLowerCase().includes(term)) : curatedSuggestions).slice(0, 7);
  }, [query, allAreaSuggestions]);

  const featured = properties.filter((property) => property.featured);
  const recommended = [...featured, ...properties.filter((property) => !property.featured)].slice(0, 7);
  const latest = properties.slice(0, 7);
  const budgetResults = budget ? properties.filter((property) => property.price >= budget.min && property.price <= budget.max) : properties.slice(0, 3);

  const rememberSearch = (label: string) => {
    const next = [label, ...recent.filter((item) => item !== label)].slice(0, 4);
    setRecent(next);
    localStorage.setItem("thikana-recent-searches", JSON.stringify(next));
  };

  const submitSearch = (area = query, selectedPurpose = purpose) => {
    const clean = area.trim();
    if (clean) rememberSearch(clean);
    navigate({
      to: "/browse",
      search: {
        purpose: selectedPurpose,
        division: location.division || undefined,
        city: location.city || undefined,
        area: clean || location.area || undefined,
      },
    });
  };

  const selectBudget = (item: (typeof budgets)[number]) => {
    setBudget(item);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  return (
    <main className="overflow-hidden">
      <section className="hero-premium relative min-h-[650px] overflow-hidden sm:min-h-[700px]">
        <img ref={heroRef} src={heroImage} alt="ঢাকার আধুনিক আবাসিক ভবন" className="absolute inset-0 h-full w-full scale-[1.04] object-cover" />
        <div className="hero-scrim absolute inset-0" />
        <div className="relative z-10 mx-auto flex min-h-[650px] max-w-6xl flex-col justify-center px-4 pb-44 pt-24 sm:min-h-[700px] sm:pb-48">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary/30 px-3 py-1.5 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
              <ShieldCheck className="size-4 text-gold" /> যাচাইকৃত সম্পত্তি, নিশ্চিন্ত সিদ্ধান্ত
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl leading-[1.15] text-primary-foreground sm:text-6xl">
              আপনার পরবর্তী <span className="text-gold">ঠিকানা</span> এখানেই
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-primary-foreground/85 sm:text-lg">
              বাংলাদেশের যেকোনো প্রান্তে পছন্দের বাড়ি, ফ্ল্যাট বা জমি খুঁজুন—সহজে ও বিশ্বস্ততার সঙ্গে।
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-36 max-w-5xl px-4" aria-label="সম্পত্তি খোঁজ">
        <div className="search-panel rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-lift)] sm:p-6">
          <div className="mb-4 flex items-center gap-1 rounded-lg bg-muted p-1 sm:w-fit">
            {(["Sale", "Rent"] as const).map((item) => (
              <Button key={item} type="button" variant={purpose === item ? "default" : "ghost"} size="sm" onClick={() => setPurpose(item)} className="flex-1 sm:flex-none">
                {item === "Sale" ? "কিনতে চাই" : "ভাড়া নিতে চাই"}
              </Button>
            ))}
          </div>

          <div className="relative">
            <div className="flex items-center rounded-xl border border-input bg-background p-1.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
              <Search className="ml-3 size-5 shrink-0 text-primary" />
              <input
                value={query}
                onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(event) => { if (event.key === "Enter") submitSearch(); }}
                placeholder="এলাকা, প্রজেক্ট বা ল্যান্ডমার্ক খুঁজুন..."
                aria-label="এলাকা, প্রজেক্ট বা ল্যান্ডমার্ক"
                className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground sm:text-base"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="ভয়েস সার্চ"
                className={listening ? "mic-listening text-accent" : "text-muted-foreground"}
                onClick={() => { setListening(true); window.setTimeout(() => setListening(false), 1700); }}
              >
                <Mic className="size-5" />
              </Button>
              <Button type="button" size="lg" className="hidden h-12 sm:inline-flex" onClick={() => submitSearch()}>
                খুঁজুন <ChevronRight className="size-4" />
              </Button>
            </div>

            {searchOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-border bg-popover p-2 shadow-[var(--shadow-lift)]">
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-xs font-semibold text-muted-foreground">প্রস্তাবিত ফলাফল</p>
                  <Button variant="ghost" size="sm" onClick={() => setSearchOpen(false)}>বন্ধ করুন</Button>
                </div>
                {suggestions.length ? suggestions.map((item) => (
                  <Button
                    key={`${item.type}-${item.label}`}
                    type="button"
                    variant="ghost"
                    onClick={() => { setQuery(item.value); setSearchOpen(false); submitSearch(item.value); }}
                    className="h-auto w-full justify-start gap-3 px-3 py-3 text-left"
                  >
                    <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary"><item.icon className="size-4" /></span>
                    <span className="min-w-0"><span className="block truncate font-semibold">{item.label}</span><span className="block text-xs font-normal text-muted-foreground">{item.type}</span></span>
                  </Button>
                )) : <p className="px-3 py-6 text-center text-sm text-muted-foreground">কোনো মিল পাওয়া যায়নি</p>}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-muted-foreground">দ্রুত বাজেট</span>
            {budgets.map((item) => (
              <Button key={item.label} type="button" size="sm" variant={budget?.label === item.label ? "default" : "outline"} className="budget-pill rounded-full" onClick={() => selectBudget(item)}>
                {item.label}
              </Button>
            ))}
          </div>

          {(recent.length > 0 || popularSearches.length > 0) && (
            <div className="mt-5 grid gap-3 border-t border-border pt-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">সাম্প্রতিক খোঁজ</p>
                <div className="flex flex-wrap gap-2">
                  {recent.length ? recent.map((item) => <Button key={item} variant="secondary" size="sm" className="rounded-full" onClick={() => submitSearch(item)}>{item}</Button>) : <span className="text-xs text-muted-foreground">আপনার খোঁজ এখানে দেখা যাবে</span>}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground">জনপ্রিয় খোঁজ</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((item, index) => (
                    <Button key={item.label} variant="outline" size="sm" className="popular-chip rounded-full" style={{ "--delay": `${index * 90}ms` } as React.CSSProperties} onClick={() => submitSearch(item.area, item.purpose)}>
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 border-t border-border pt-3">
            <Button type="button" variant="ghost" size="sm" className="px-0 text-primary hover:bg-transparent" onClick={() => setAdvanced((value) => !value)} aria-expanded={advanced}>
              বিস্তারিত ফিল্টার <ChevronDown className={`size-4 transition-transform ${advanced ? "rotate-180" : ""}`} />
            </Button>
            <div className={`advanced-filters grid transition-all ${advanced ? "grid-rows-[1fr] pt-3 opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden"><LocationPicker value={location} onChange={setLocation} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip mt-10 border-y border-border/70 bg-card" data-reveal>
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-border px-4 py-7 text-center">
          <div><strong className="block text-xl text-primary sm:text-3xl"><CountUp target={28400} suffix="+" /></strong><span className="text-xs text-muted-foreground sm:text-sm">সম্পত্তি</span></div>
          <div><strong className="block text-xl text-primary sm:text-3xl"><CountUp target={64} /></strong><span className="text-xs text-muted-foreground sm:text-sm">জেলা</span></div>
          <div><strong className="block text-xl text-primary sm:text-3xl"><CountUp target={9200} suffix="+" /></strong><span className="text-xs text-muted-foreground sm:text-sm">যাচাইকৃত বিক্রেতা</span></div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border/60 px-4 py-4 text-xs font-bold text-muted-foreground/70 sm:text-sm">
          <span className="font-normal">বিশ্বস্ততার অংশীদার</span><span>BRAC BANK</span><span>DBH</span><span>THE DAILY STAR</span><span>প্রথম আলো</span>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5" data-reveal>
          {categories.map((category, index) => (
            <Link key={category.label} to="/browse" search={{ type: category.type }} className="reveal-card group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-4 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1 hover:border-primary/30" style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}>
              <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><category.icon className="size-5" /></span>
              <span className="text-sm font-semibold">{category.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <SectionHeading eyebrow="আপনার পছন্দ বুঝে" title="আপনার জন্য প্রস্তাবিত" action={<Button asChild variant="outline" size="sm"><Link to="/browse">সব দেখুন</Link></Button>} />
        <PropertyRail items={recommended} />
      </section>

      <section className="mt-16 bg-secondary/55 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow="বাজারের হালচাল" title="এখন ট্রেন্ডিং এলাকা" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-reveal>
            {trendingAreas.map((area, index) => (
              <article key={area.name} className="trend-card reveal-card rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)]" style={{ "--delay": `${index * 75}ms` } as React.CSSProperties}>
                <div className="flex items-start justify-between"><div><h3 className="text-lg">{area.name}</h3><p className="mt-1 text-xs text-muted-foreground">{area.count}</p></div><span className="flex items-center gap-1 text-xs font-bold text-accent"><TrendingUp className="size-3.5" /> {area.change}</span></div>
                <svg viewBox="0 0 100 48" className="mt-5 h-12 w-full overflow-visible" role="img" aria-label={`${area.name} মূল্য প্রবণতা`}><polyline points={area.points} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sparkline text-accent" /></svg>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section ref={resultsRef} className={`mx-auto mt-20 max-w-6xl scroll-mt-24 px-4 ${budget ? "budget-highlight" : ""}`}>
        <SectionHeading eyebrow={budget ? `${budget.label} বাজেট` : "বাছাই করা বিজ্ঞাপন"} title={budget ? "আপনার বাজেটের সম্পত্তি" : "বিশেষভাবে নির্বাচিত"} />
        {budgetResults.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-reveal>{budgetResults.slice(0, 6).map((property, index) => <div key={property.id} className="reveal-card" style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}><PropertyCard property={property} /></div>)}</div> : <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">এই বাজেটে এখনো কোনো সম্পত্তি নেই। অন্য বাজেট দেখুন।</div>}
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <SectionHeading eyebrow="একদম নতুন" title="সদ্য যোগ হয়েছে" />
        <PropertyRail items={latest} freshest />
      </section>

      <section className="mt-16 border-y border-border bg-card py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <SectionHeading eyebrow="বাজার তুলনা" title="এলাকা অনুযায়ী গড় দাম" />
            <div className="space-y-5" data-reveal>
              {areaPrices.map((item, index) => (
                <div key={item.area} className="reveal-card" style={{ "--delay": `${index * 80}ms` } as React.CSSProperties}>
                  <div className="mb-2 flex items-center justify-between text-sm"><strong>{item.area}</strong><span className="font-semibold text-primary">{item.price} <small className="font-normal text-muted-foreground">/বর্গফুট</small></span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><span className="price-bar block h-full origin-left rounded-full bg-accent" style={{ "--bar-width": item.width } as React.CSSProperties} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="emi-card relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground shadow-[var(--shadow-lift)]" data-reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold"><Sparkles className="size-3.5 text-gold" /> সহজ হিসাব</span>
            <h2 className="mt-4 text-2xl text-primary-foreground">মাসিক কিস্তি কত হবে?</h2>
            <p className="mt-2 text-sm leading-6 text-primary-foreground/75">বাড়ির দাম ও মেয়াদ মিলিয়ে এক ঝলকে সম্ভাব্য কিস্তি দেখুন।</p>
            <div className="mt-7"><div className="mb-2 flex justify-between text-xs"><span>ঋণের পরিমাণ</span><strong>৳ ৪০ লক্ষ</strong></div><div className="relative h-2 rounded-full bg-primary-foreground/20"><span className="block h-full w-2/3 rounded-full bg-gold" /><span className="emi-thumb absolute left-2/3 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-gold bg-card shadow" /></div></div>
            <div className="mt-6 flex items-end justify-between border-t border-primary-foreground/15 pt-5"><div><span className="text-xs text-primary-foreground/70">আনুমানিক মাসিক কিস্তি</span><strong className="block text-2xl">৳ ৩৮,৬৫০</strong></div><Button variant="secondary" asChild><Link to="/browse">সম্পত্তি দেখুন</Link></Button></div>
          </div>
        </div>
      </section>

      <section className="mx-auto my-20 max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 border-l-4 border-gold bg-primary px-6 py-9 text-primary-foreground sm:flex-row sm:items-center sm:px-9" data-reveal>
          <div><span className="text-xs font-semibold uppercase text-gold">মালিক ও এজেন্টদের জন্য</span><h2 className="mt-2 text-2xl text-primary-foreground sm:text-3xl">আপনার সম্পত্তির সঠিক ক্রেতা খুঁজুন</h2><p className="mt-2 text-sm text-primary-foreground/75">ছবি ও বিস্তারিত তথ্য দিয়ে কয়েক মিনিটেই বিজ্ঞাপন দিন।</p></div>
          <Button asChild variant="secondary" size="lg"><Link to="/post">বিজ্ঞাপন দিন</Link></Button>
        </div>
      </section>

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {contactOpen && <div className="contact-menu grid gap-1 rounded-lg border border-border bg-card p-2 shadow-[var(--shadow-lift)]"><Button variant="ghost" className="justify-start"><MessageCircle className="text-accent" /> WhatsApp</Button><Button variant="ghost" className="justify-start"><MessageCircle className="text-primary" /> Messenger</Button></div>}
        <Button size="lg" className="contact-fab h-12 rounded-full px-4 shadow-[var(--shadow-lift)]" onClick={() => setContactOpen((value) => !value)} aria-label="দ্রুত যোগাযোগ"><MessageCircle className="size-5" /><span>কথা বলুন</span></Button>
      </div>
    </main>
  );
}
