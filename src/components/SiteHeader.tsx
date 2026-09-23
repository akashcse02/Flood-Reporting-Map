import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Home, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/browse", label: "সম্পত্তি খুঁজুন" },
  { to: "/favorites", label: "সংরক্ষিত" },
  { to: "/post", label: "বিজ্ঞাপন দিন" },
] as const;

export function SiteHeader() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md ${compact ? "is-compact" : ""}`}>
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="brand-lockup flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Home className="size-5" /></span>
          <span className="font-display text-2xl font-semibold text-primary">ঠিকানা</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.slice(0, 2).map((link) => <Link key={link.to} to={link.to} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>{link.label}</Link>)}
          <Button asChild className="ml-2"><Link to="/post"><Plus className="size-4" /> বিজ্ঞাপন দিন</Link></Button>
        </nav>
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <Button asChild variant="ghost" size="icon"><Link to="/favorites" aria-label="সংরক্ষিত সম্পত্তি"><Heart className="size-5" /></Link></Button>
          <Sheet><SheetTrigger asChild><Button variant="outline" size="icon" aria-label="মেনু"><Menu className="size-5" /></Button></SheetTrigger><SheetContent side="right" className="w-64"><nav className="mt-10 grid gap-1">{links.map((link) => <Link key={link.to} to={link.to} className="rounded-md px-3 py-3 text-base font-medium hover:bg-muted">{link.label}</Link>)}</nav></SheetContent></Sheet>
        </div>
      </div>
    </header>
  );
}
