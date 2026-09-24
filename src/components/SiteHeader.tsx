import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Home, Languages, Menu, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLang } from "@/hooks/use-lang";

export function SiteHeader() {
  const { lang, setLang, t } = useLang();
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/browse", label: t("সম্পত্তি খুঁজুন", "Browse") },
    { to: "/ai-match", label: t("AI ম্যাচ", "AI Match") },
    { to: "/favorites", label: t("সংরক্ষিত", "Saved") },
    { to: "/post", label: t("বিজ্ঞাপন দিন", "Post listing") },
  ] as const;

  const langToggle = (
    <Button variant="ghost" size="sm" onClick={() => setLang(lang === "bn" ? "en" : "bn")} aria-label="Switch language">
      <Languages className="size-4" /> {lang === "bn" ? "EN" : "বাং"}
    </Button>
  );

  return (
    <header className={`site-header sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md ${compact ? "is-compact" : ""}`}>
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link to="/" className="brand-lockup flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Home className="size-5" /></span>
          <span className="font-display text-2xl font-semibold text-primary">{t("ঠিকানা", "Thikana")}</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.slice(0, 3).map((link) => (
            <Link key={link.to} to={link.to} className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {link.to === "/ai-match" && <Sparkles className="size-3.5 text-accent" />}
              {link.label}
            </Link>
          ))}
          {langToggle}
          <Button asChild className="ml-2"><Link to="/post"><Plus className="size-4" /> {t("বিজ্ঞাপন দিন", "Post listing")}</Link></Button>
        </nav>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          {langToggle}
          <Button asChild variant="ghost" size="icon"><Link to="/favorites" aria-label={t("সংরক্ষিত সম্পত্তি", "Saved properties")}><Heart className="size-5" /></Link></Button>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="icon" aria-label={t("মেনু", "Menu")}><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="mt-10 grid gap-1">
                {links.map((link) => <Link key={link.to} to={link.to} className="rounded-md px-3 py-3 text-base font-medium hover:bg-muted">{link.label}</Link>)}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
