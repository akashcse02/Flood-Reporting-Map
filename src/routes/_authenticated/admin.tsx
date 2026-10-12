import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/format";
import { useLang } from "@/hooks/use-lang";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন — ঠিকানা" },
      { name: "description", content: "বিক্রেতা ভেরিফাই ও বিজ্ঞাপন পরিচালনা।" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { t } = useLang();
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })).data === true,
  });
  const { data: sellers = [] } = useQuery({
    queryKey: ["admin-profiles"],
    enabled: !!isAdmin,
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: listings = [] } = useQuery({
    queryKey: ["admin-listings"],
    enabled: !!isAdmin,
    queryFn: async () => (await supabase.from("listings").select("id,title,price,purpose,status,seller_name,area,city,created_at").order("created_at", { ascending: false })).data ?? [],
  });

  if (isLoading) return <Loader2 className="mx-auto my-24 size-6 animate-spin" />;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 text-2xl">{t("শুধু অ্যাডমিনদের জন্য", "Admins only")}</h1>
      </div>
    );

  async function toggleVerify(id: string, verified: boolean) {
    await supabase.from("profiles").update({ verified: !verified }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-profiles"] });
  }
  async function removeListing(id: string) {
    if (!confirm(t("বিজ্ঞাপনটি সরিয়ে ফেলবেন?", "Remove this listing?"))) return;
    await supabase.from("listings").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-listings"] });
    qc.invalidateQueries({ queryKey: ["listings"] });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl">{t("অ্যাডমিন প্যানেল", "Admin panel")}</h1>

      <h2 className="mt-8 text-xl">{t("ব্যবহারকারী", "Users")} ({sellers.length})</h2>
      <div className="mt-3 divide-y rounded-xl border bg-card">
        {sellers.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="flex items-center gap-1.5 font-semibold">
                {s.full_name || t("নাম নেই", "No name")}
                {s.verified && <BadgeCheck className="size-4 text-primary" />}
              </p>
              <p className="text-sm text-muted-foreground">
                {s.phone || "—"} · {s.account_type === "seller" ? t("বিক্রেতা", "Seller") : t("ক্রেতা", "Buyer")}
              </p>
            </div>
            <Button size="sm" variant={s.verified ? "outline" : "default"} onClick={() => toggleVerify(s.id, s.verified)}>
              {s.verified ? t("ভেরিফিকেশন বাতিল", "Unverify") : t("ভেরিফাই করুন", "Verify")}
            </Button>
          </div>
        ))}
        {sellers.length === 0 && <p className="p-6 text-center text-muted-foreground">{t("কেউ নেই", "No users yet")}</p>}
      </div>

      <h2 className="mt-10 text-xl">{t("সব বিজ্ঞাপন", "All listings")} ({listings.length})</h2>
      <div className="mt-3 divide-y rounded-xl border bg-card">
        {listings.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <Link to="/property/$id" params={{ id: l.id }} className="font-semibold hover:underline">{l.title}</Link>
              <p className="text-sm text-muted-foreground">
                {formatBDT(Number(l.price))} · {[l.area, l.city].filter(Boolean).join(", ") || "—"} · {l.seller_name} · {l.status}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => removeListing(l.id)}>
              <Trash2 className="size-4" /> {t("সরান", "Remove")}
            </Button>
          </div>
        ))}
        {listings.length === 0 && <p className="p-6 text-center text-muted-foreground">{t("কোনো বিজ্ঞাপন নেই", "No listings yet")}</p>}
      </div>
    </main>
  );
}
