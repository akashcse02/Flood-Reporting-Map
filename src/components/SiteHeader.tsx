import { Link } from "@tanstack/react-router";
import { Heart, Home, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/browse", label: "Browse" },
  { to: "/favorites", label: "Saved" },
  { to: "/post", label: "Post a property" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Home className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Thikana</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.slice(0, 2).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
          <Button asChild className="ml-2">
            <Link to="/post">
              <Plus className="size-4" /> Post a property
            </Link>
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <Button asChild variant="ghost" size="icon">
            <Link to="/favorites" aria-label="Saved properties">
              <Heart className="size-5" />
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="mt-10 grid gap-1">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} className="rounded-md px-3 py-3 text-base font-medium hover:bg-muted">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
