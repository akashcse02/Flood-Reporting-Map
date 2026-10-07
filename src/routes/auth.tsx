import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/hooks/use-lang";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "লগইন / অ্যাকাউন্ট খুলুন — ঠিকানা" },
      { name: "description", content: "ঠিকানায় লগইন করুন বা ক্রেতা/বিক্রেতা হিসেবে নতুন অ্যাকাউন্ট খুলুন।" },
      { property: "og:title", content: "লগইন — ঠিকানা" },
      { property: "og:description", content: "ক্রেতা ও বিক্রেতার অ্যাকাউন্ট।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [f, setF] = useState({ email: "", password: "", name: "", phone: "", accountType: "seller" as "buyer" | "seller" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_IN" && s) navigate({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      if (error) setMsg({ ok: false, text: t("ইমেইল বা পাসওয়ার্ড ভুল।", "Wrong email or password.") });
    } else {
      const { error } = await supabase.auth.signUp({
        email: f.email,
        password: f.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: f.name, phone: f.phone, account_type: f.accountType },
        },
      });
      if (error) setMsg({ ok: false, text: error.message });
      else setMsg({ ok: true, text: t("নিশ্চিতকরণ লিংক আপনার ইমেইলে পাঠানো হয়েছে।", "Check your email to confirm your account.") });
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg({ ok: false, text: t("Google লগইন ব্যর্থ হয়েছে।", "Google sign-in failed.") });
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{mode === "in" ? t("লগইন করুন", "Sign in") : t("অ্যাকাউন্ট খুলুন", "Create account")}</h1>
        <Button variant="outline" className="mt-5 w-full" onClick={google}>{t("Google দিয়ে চালিয়ে যান", "Continue with Google")}</Button>
        <div className="my-4 text-center text-xs text-muted-foreground">{t("অথবা", "or")}</div>
        <form onSubmit={submit} className="grid gap-3">
          {mode === "up" && (
            <>
              <div className="grid gap-1.5"><Label htmlFor="name">{t("নাম", "Name")}</Label><Input id="name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label htmlFor="phone">{t("ফোন", "Phone")}</Label><Input id="phone" required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
              <div className="grid gap-1.5">
                <Label>{t("আমি একজন", "I am a")}</Label>
                <div className="flex gap-2">
                  {(["buyer", "seller"] as const).map((a) => (
                    <Button key={a} type="button" variant={f.accountType === a ? "default" : "outline"} className="flex-1" onClick={() => setF({ ...f, accountType: a })}>
                      {a === "buyer" ? t("ক্রেতা / ভাড়াটিয়া", "Buyer / Renter") : t("বিক্রেতা / মালিক", "Seller / Owner")}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="grid gap-1.5"><Label htmlFor="email">{t("ইমেইল", "Email")}</Label><Input id="email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label htmlFor="pw">{t("পাসওয়ার্ড", "Password")}</Label><Input id="pw" type="password" minLength={6} required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          {msg && <p className={msg.ok ? "text-sm text-primary" : "text-sm text-destructive"}>{msg.text}</p>}
          <Button type="submit" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />}{mode === "in" ? t("লগইন", "Sign in") : t("অ্যাকাউন্ট খুলুন", "Sign up")}</Button>
        </form>
        <button className="mt-4 w-full text-sm text-muted-foreground underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>
          {mode === "in" ? t("নতুন? অ্যাকাউন্ট খুলুন", "New here? Create an account") : t("আগে থেকেই অ্যাকাউন্ট আছে? লগইন", "Have an account? Sign in")}
        </button>
      </div>
    </main>
  );
}
