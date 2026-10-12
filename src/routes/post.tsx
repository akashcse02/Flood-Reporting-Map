import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { IMAGE_BUCKET } from "@/lib/listings";
import { generateDescription } from "@/lib/ai-describe.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationPicker, type LocationValue } from "@/components/LocationPicker";
import { amenityOptions, type PropertyType, type Purpose } from "@/data/properties";
import { useLang } from "@/hooks/use-lang";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "বিজ্ঞাপন দিন — ঠিকানা" },
      { name: "description", content: "আপনার বাড়ি, ফ্ল্যাট, জমি বা বাণিজ্যিক সম্পত্তির বিজ্ঞাপন দিন বাংলাদেশজুড়ে।" },
      { property: "og:title", content: "বিজ্ঞাপন দিন — ঠিকানা" },
      { property: "og:description", content: "বিক্রয় বা ভাড়ার জন্য সম্পত্তি পোস্ট করুন।" },
    ],
  }),
  component: PostListing,
});

const types: PropertyType[] = ["Flat", "House", "Land", "Hotel", "Commercial"];

function PostListing() {
  const { t } = useLang();
  const [purpose, setPurpose] = useState<Purpose>("Sale");
  const [type, setType] = useState<PropertyType>("Flat");
  const [location, setLocation] = useState<LocationValue>({ division: "", city: "", area: "" });
  const [negotiable, setNegotiable] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ title: "", price: "", beds: "", baths: "", size: "", notes: "", descBn: "", descEn: "" });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const describe = useServerFn(generateDescription);
  const { user, ready } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [newId, setNewId] = useState<string | null>(null);
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const ok = Array.from(list).filter((fl) => fl.type.startsWith("image/") && fl.size <= 5 * 1024 * 1024);
    if (ok.length < list.length) setSaveError(t("শুধু ৫MB-এর কম ছবি দেওয়া যাবে।", "Only images under 5MB are allowed."));
    setFiles((prev) => [...prev, ...ok.map((file) => ({ file, url: URL.createObjectURL(file) }))].slice(0, 8));
  }

  async function runAi() {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await describe({
        data: {
          purpose, type, title: f.title, notes: f.notes, price: f.price, negotiable,
          location: [location.area, location.city, location.division].filter(Boolean).join(", "),
          beds: f.beds, baths: f.baths, size: f.size, amenities,
        },
      });
      if (res.ok) setF((prev) => ({ ...prev, descBn: res.bn, descEn: res.en }));
      else setAiError(res.error);
    } catch {
      setAiError(t("বিবরণ তৈরি করা যায়নি।", "Could not generate a description."));
    } finally {
      setAiLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveError("");
    const paths: string[] = [];
    for (const { file } of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { contentType: file.type });
      if (upErr) { setSaving(false); setSaveError(t("ছবি আপলোড করা যায়নি।", "Could not upload a photo.")); return; }
      paths.push(path);
    }
    const { data: prof } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
    const { data: row, error } = await supabase.from("listings").insert({
      owner_id: user.id, title: f.title, description_bn: f.descBn, description_en: f.descEn,
      type, purpose, price: Number(f.price) || 0, negotiable,
      division: location.division, city: location.city, area: location.area,
      beds: Number(f.beds) || 0, baths: Number(f.baths) || 0, size: Number(f.size) || 0, amenities, images: paths,
      seller_name: prof?.full_name || user.email || "", seller_phone: prof?.phone || "",
    }).select("id").single();
    setSaving(false);
    if (error || !row) { setSaveError(t("সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন।", "Could not save. Please try again.")); return; }
    qc.invalidateQueries({ queryKey: ["listings"] });
    setNewId(row.id);
    setDone(true);
  }

  if (ready && !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl">{t("বিজ্ঞাপন দিতে লগইন করুন", "Sign in to post a listing")}</h1>
        <Button asChild className="mt-6"><Link to="/auth">{t("লগইন / অ্যাকাউন্ট খুলুন", "Sign in / Sign up")}</Link></Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-2xl">{t("বিজ্ঞাপন জমা হয়েছে", "Listing submitted")}</h1>
        <p className="mt-2 text-muted-foreground">{t("আপনার বিজ্ঞাপন এখন লাইভ।", "Your listing is now live.")}</p>
        <div className="mt-6 flex justify-center gap-2">
          {newId && <Button asChild><Link to="/property/$id" params={{ id: newId }}>{t("বিজ্ঞাপন দেখুন", "View listing")}</Link></Button>}
          <Button asChild variant="outline"><Link to="/dashboard">{t("ড্যাশবোর্ড", "Dashboard")}</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl">{t("বিজ্ঞাপন দিন", "Post a listing")}</h1>
      <form
        className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        onSubmit={submit}
      >
        <div className="space-y-2">
          <Label>{t("উদ্দেশ্য", "Purpose")}</Label>
          <div className="flex gap-2">
            {(["Sale", "Rent"] as const).map((p) => (
              <Button key={p} type="button" variant={purpose === p ? "default" : "outline"} onClick={() => setPurpose(p)}>
                {p === "Sale" ? t("বিক্রয়", "For Sale") : t("ভাড়া", "For Rent")}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("ধরন", "Type")}</Label>
          <div className="flex flex-wrap gap-2">
            {types.map((ty) => (
              <Button key={ty} type="button" size="sm" variant={type === ty ? "default" : "outline"} onClick={() => setType(ty)}>{ty}</Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">{t("শিরোনাম", "Title")}</Label>
          <Input id="title" required maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">{t("দাম (৳)", "Price (৳)")}</Label>
            <Input id="price" type="number" min={0} required value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          </div>
          <label className="flex items-center gap-3 self-end pb-2 text-sm">
            <Switch checked={negotiable} onCheckedChange={setNegotiable} /> {t("আলোচনা সাপেক্ষ", "Negotiable")}
          </label>
        </div>
        <div className="space-y-2">
          <Label>{t("লোকেশন", "Location")}</Label>
          <LocationPicker value={location} onChange={setLocation} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2"><Label htmlFor="beds">{t("বেডরুম", "Bedrooms")}</Label><Input id="beds" type="number" min={0} value={f.beds} onChange={(e) => setF({ ...f, beds: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="baths">{t("বাথরুম", "Bathrooms")}</Label><Input id="baths" type="number" min={0} value={f.baths} onChange={(e) => setF({ ...f, baths: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="size">{t("আয়তন (বর্গফুট)", "Size (sqft)")}</Label><Input id="size" type="number" min={0} value={f.size} onChange={(e) => setF({ ...f, size: e.target.value })} /></div>
        </div>
        <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>{t("বিবরণ", "Description")}</Label>
            <Button type="button" size="sm" variant="secondary" disabled={aiLoading} onClick={runAi}>
              {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {t("AI দিয়ে লিখুন", "Write with AI")}
            </Button>
          </div>
          <Textarea id="notes" rows={2} maxLength={2000} placeholder={t("বিশেষ তথ্য লিখুন (যেমন: লেকের পাশে, নতুন ভবন)…", "Key highlights (e.g. lake view, new building)…")} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          {aiError && <p className="text-sm text-destructive">{aiError}</p>}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="desc-bn" className="text-xs text-muted-foreground">বাংলা</Label>
              <Textarea id="desc-bn" rows={7} required maxLength={3000} value={f.descBn} onChange={(e) => setF({ ...f, descBn: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="desc-en" className="text-xs text-muted-foreground">English</Label>
              <Textarea id="desc-en" rows={7} maxLength={3000} value={f.descEn} onChange={(e) => setF({ ...f, descEn: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("সুবিধাসমূহ", "Amenities")}</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {amenityOptions.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <Checkbox checked={amenities.includes(a)} onCheckedChange={(c) => setAmenities((prev) => (c ? [...prev, a] : prev.filter((x) => x !== a)))} /> {a}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("ছবি (সর্বোচ্চ ৮টি)", "Photos (up to 8)")}</Label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {files.map((fl, i) => (
              <div key={fl.url} className="relative">
                <img src={fl.url} alt="" className="aspect-square w-full rounded-md object-cover" />
                <button type="button" aria-label={t("ছবি বাদ দিন", "Remove photo")} onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-background/90 p-1"><X className="size-3.5" /></button>
              </div>
            ))}
            {files.length < 8 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-xs text-muted-foreground hover:bg-muted">
                <ImagePlus className="size-6" /> {t("ছবি যোগ করুন", "Add photos")}
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              </label>
            )}
          </div>
        </div>
        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={saving || !user}>{saving && <Loader2 className="size-4 animate-spin" />}{t("জমা দিন", "Submit listing")}</Button>
      </form>
    </div>
  );
}
