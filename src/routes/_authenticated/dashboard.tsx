import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ListingRow } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatBDT } from "@/lib/format";
import { useLang } from "@/hooks/use-lang";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "আমার ড্যাশবোর্ড — ঠিকানা" },
      { name: "description", content: "আপনার বিজ্ঞাপন সম্পাদনা করুন এবং বিক্রি/ভাড়া হয়েছে চিহ্নিত করুন।" },
      { property: "og:title", content: "আমার ড্যাশবোর্ড — ঠিকানা" },
      { property: "og:description", content: "বিক্রেতার ড্যাশবোর্ড।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useLang();
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()).data,
  });
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["my-listings", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["my-listings"] });
    qc.invalidateQueries({ queryKey: ["listings"] });
  };

  async function setStatus(id: string, status: string) {
    await supabase.from("listings").update({ status }).eq("id", id);
    refresh();
  }
  async function remove(id: string) {
    if (!confirm(t("বিজ্ঞাপনটি মুছে ফেলবেন?", "Delete this listing?"))) return;
    await supabase.from("listings").delete().eq("id", id);
    refresh();
  }
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const statusLabel = (s: string) =>
    s === "sold" ? t("বিক্রি হয়েছে", "Sold") : s === "rented" ? t("ভাড়া হয়েছে", "Rented") : t("সক্রিয়", "Active");

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">{t("আমার ড্যাশবোর্ড", "My dashboard")}</h1>
          <p className="text-sm text-muted-foreground">
            {profile?.full_name || user.email} · {profile?.account_type === "buyer" ? t("ক্রেতা", "Buyer") : t("বিক্রেতা", "Seller")}
            {profile?.verified && " · ✓ " + t("ভেরিফায়েড", "Verified")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild><Link to="/post"><Plus className="size-4" /> {t("নতুন বিজ্ঞাপন", "New listing")}</Link></Button>
          <Button variant="outline" onClick={signOut}>{t("লগআউট", "Sign out")}</Button>
        </div>
      </div>

      <h2 className="mt-8 text-xl">{t("আমার বিজ্ঞাপন", "My listings")} ({rows.length})</h2>
      {isLoading ? (
        <Loader2 className="mt-6 size-6 animate-spin" />
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-xl border bg-card p-8 text-center text-muted-foreground">{t("এখনো কোনো বিজ্ঞাপন নেই।", "No listings yet.")}</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to="/property/$id" params={{ id: r.id }} className="font-semibold hover:underline">{r.title}</Link>
                  <p className="text-sm text-muted-foreground">
                    {formatBDT(Number(r.price))}{r.purpose === "Rent" ? t("/মাস", "/mo") : ""} · {[r.area, r.city].filter(Boolean).join(", ")}
                  </p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${r.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{statusLabel(r.status)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status === "active" ? (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(r.id, r.purpose === "Rent" ? "rented" : "sold")}>
                      {r.purpose === "Rent" ? t("ভাড়া হয়েছে", "Mark rented") : t("বিক্রি হয়েছে", "Mark sold")}
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(r.id, "active")}>{t("আবার সক্রিয়", "Reactivate")}</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setEditing(editing === r.id ? null : r.id)}><Pencil className="size-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="size-4" /></Button>
                </div>
              </div>
              {editing === r.id && <EditForm row={r} onDone={() => { setEditing(null); refresh(); }} />}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function EditForm({ row, onDone }: { row: ListingRow; onDone: () => void }) {
  const { t } = useLang();
  const [f, setF] = useState({ title: row.title, price: String(row.price), descBn: row.description_bn, descEn: row.description_en });
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await supabase.from("listings").update({ title: f.title, price: Number(f.price) || 0, description_bn: f.descBn, description_en: f.descEn }).eq("id", row.id);
    setBusy(false);
    onDone();
  }
  return (
    <form onSubmit={save} className="mt-4 grid gap-3 border-t pt-4">
      <Input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <Input type="number" min={0} required value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
      <div className="grid gap-3 md:grid-cols-2">
        <Textarea rows={5} placeholder="বাংলা" value={f.descBn} onChange={(e) => setF({ ...f, descBn: e.target.value })} />
        <Textarea rows={5} placeholder="English" value={f.descEn} onChange={(e) => setF({ ...f, descEn: e.target.value })} />
      </div>
      <Button type="submit" disabled={busy} className="justify-self-start">{busy && <Loader2 className="size-4 animate-spin" />}{t("সংরক্ষণ", "Save")}</Button>
    </form>
  );
}
