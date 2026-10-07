import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/hooks/use-lang";

export const Route = createFileRoute("/agreement")({
  head: () => ({
    meta: [
      { title: "বাড়ি ভাড়া চুক্তিনামা জেনারেটর — ঠিকানা" },
      { name: "description", content: "কয়েকটি তথ্য দিয়ে প্রিন্ট-রেডি বাংলা বাড়ি ভাড়া চুক্তিপত্র তৈরি করুন ও PDF হিসেবে সংরক্ষণ করুন।" },
      { property: "og:title", content: "বাড়ি ভাড়া চুক্তিনামা জেনারেটর — ঠিকানা" },
      { property: "og:description", content: "প্রিন্ট-রেডি বাংলা ভাড়া চুক্তিপত্র মুহূর্তেই তৈরি করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgreementPage,
});

const bnDigits = (s: string) => s.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)] ?? d);
const money = (s: string) => (s ? bnDigits(Number(s).toLocaleString("en-IN")) : "________");
const blank = (s: string, n = 16) => (s.trim() ? s : "_".repeat(n));

const initial = {
  landlord: "", landlordNid: "", landlordAddress: "",
  tenant: "", tenantNid: "", tenantAddress: "",
  property: "", rent: "", advance: "", start: "", months: "12",
  dueDay: "5", notice: "2", extra: "",
};

function AgreementPage() {
  const { t } = useLang();
  const [f, setF] = useState(initial);
  const set = (k: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const startText = f.start ? bnDigits(new Date(f.start).toLocaleDateString("en-GB")) : "____/____/______";
  const today = bnDigits(new Date().toLocaleDateString("en-GB"));

  const field = (k: keyof typeof initial, bn: string, en: string, type = "text") => (
    <div className="grid gap-1.5">
      <Label htmlFor={k}>{t(bn, en)}</Label>
      <Input id={k} type={type} value={f[k]} onChange={set(k)} />
    </div>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="print:hidden">
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold text-primary">
          <FileText className="size-7" /> {t("বাড়ি ভাড়া চুক্তিনামা", "Rental agreement maker")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("তথ্য দিন — ডানপাশে চুক্তিপত্র তৈরি হবে। প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন।", "Fill in the details — the Bangla agreement builds on the right. Print or save as PDF.")}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        <form className="grid content-start gap-4 rounded-xl border bg-card p-5 print:hidden" onSubmit={(e) => e.preventDefault()}>
          <p className="font-semibold">{t("বাড়িওয়ালা", "Landlord")}</p>
          {field("landlord", "নাম", "Name")}
          {field("landlordNid", "এনআইডি নম্বর", "NID number")}
          {field("landlordAddress", "স্থায়ী ঠিকানা", "Permanent address")}
          <p className="pt-2 font-semibold">{t("ভাড়াটিয়া", "Tenant")}</p>
          {field("tenant", "নাম", "Name")}
          {field("tenantNid", "এনআইডি নম্বর", "NID number")}
          {field("tenantAddress", "স্থায়ী ঠিকানা", "Permanent address")}
          <p className="pt-2 font-semibold">{t("সম্পত্তি ও শর্ত", "Property & terms")}</p>
          {field("property", "ভাড়া দেওয়া বাসার ঠিকানা", "Rented property address")}
          <div className="grid grid-cols-2 gap-3">
            {field("rent", "মাসিক ভাড়া (৳)", "Monthly rent (৳)", "number")}
            {field("advance", "অগ্রিম জামানত (৳)", "Advance deposit (৳)", "number")}
            {field("start", "শুরুর তারিখ", "Start date", "date")}
            {field("months", "মেয়াদ (মাস)", "Term (months)", "number")}
            {field("dueDay", "ভাড়া দেওয়ার শেষ তারিখ", "Rent due by day", "number")}
            {field("notice", "নোটিশ (মাস)", "Notice (months)", "number")}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="extra">{t("অতিরিক্ত শর্ত (ঐচ্ছিক)", "Extra terms (optional)")}</Label>
            <Textarea id="extra" rows={3} value={f.extra} onChange={set("extra")} />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => window.print()} className="flex-1"><Printer className="size-4" /> {t("প্রিন্ট / PDF", "Print / PDF")}</Button>
            <Button type="button" variant="outline" onClick={() => setF(initial)}>{t("মুছুন", "Reset")}</Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("PDF পেতে প্রিন্ট উইন্ডোতে \"Save as PDF\" বেছে নিন।", "Choose \"Save as PDF\" in the print window to download.")}</p>
        </form>

        <article lang="bn" className="agreement-doc rounded-xl border bg-card p-6 text-[15px] leading-8 shadow-sm sm:p-10 print:border-0 print:p-0 print:shadow-none">
          <h2 className="text-center text-2xl font-bold">বাড়ি ভাড়ার চুক্তিপত্র</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">চুক্তির তারিখ: {today}</p>
          <p className="mt-6">
            এই চুক্তিপত্র <b>{blank(f.landlord)}</b>, এনআইডি নং <b>{bnDigits(blank(f.landlordNid))}</b>, ঠিকানা: {blank(f.landlordAddress, 24)} (অতঃপর "বাড়িওয়ালা" / প্রথম পক্ষ) এবং <b>{blank(f.tenant)}</b>, এনআইডি নং <b>{bnDigits(blank(f.tenantNid))}</b>, ঠিকানা: {blank(f.tenantAddress, 24)} (অতঃপর "ভাড়াটিয়া" / দ্বিতীয় পক্ষ)-এর মধ্যে নিম্নলিখিত শর্তে সম্পাদিত হলো।
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6">
            <li>প্রথম পক্ষ তার মালিকানাধীন <b>{blank(f.property, 30)}</b> ঠিকানার বাসাটি দ্বিতীয় পক্ষকে আবাসিক উদ্দেশ্যে ভাড়া প্রদান করছেন।</li>
            <li>মাসিক ভাড়া <b>৳{money(f.rent)}</b> টাকা, যা প্রতি ইংরেজি মাসের <b>{bnDigits(f.dueDay || "৫")}</b> তারিখের মধ্যে পরিশোধ করতে হবে। পরিশোধের পর প্রথম পক্ষ রসিদ প্রদান করবেন।</li>
            <li>দ্বিতীয় পক্ষ অগ্রিম জামানত হিসেবে <b>৳{money(f.advance)}</b> টাকা প্রদান করেছেন। চুক্তি শেষে বকেয়া ও ক্ষতি (যদি থাকে) সমন্বয় করে বাকি অর্থ ফেরত দেওয়া হবে।</li>
            <li>চুক্তির মেয়াদ <b>{startText}</b> থেকে <b>{bnDigits(f.months || "১২")}</b> মাস। উভয় পক্ষের সম্মতিতে মেয়াদ নবায়ন করা যাবে।</li>
            <li>বিদ্যুৎ, গ্যাস ও পানির বিল মিটার অনুযায়ী দ্বিতীয় পক্ষ পরিশোধ করবেন, যদি না আলাদাভাবে লিখিত সম্মতি থাকে।</li>
            <li>প্রথম পক্ষের লিখিত অনুমতি ছাড়া দ্বিতীয় পক্ষ বাসাটি সাবলেট বা কাঠামোগত পরিবর্তন করতে পারবেন না।</li>
            <li>বাসা ছাড়তে বা ছাড়ার নির্দেশ দিতে যেকোনো পক্ষকে কমপক্ষে <b>{bnDigits(f.notice || "২")}</b> মাস আগে লিখিত নোটিশ দিতে হবে।</li>
            <li>দ্বিতীয় পক্ষ বাসার পরিচ্ছন্নতা বজায় রাখবেন এবং কোনো অবৈধ বা প্রতিবেশীর জন্য বিরক্তিকর কাজ করবেন না।</li>
            {f.extra.trim() && <li>{f.extra}</li>}
          </ol>
          <p className="mt-4">উভয় পক্ষ সুস্থ মস্তিষ্কে, স্বেচ্ছায় ও অন্যের প্ররোচনা ছাড়া এই চুক্তিপত্র পড়ে ও বুঝে স্বাক্ষর করলেন।</p>
          <div className="mt-16 grid grid-cols-2 gap-10 text-center text-sm">
            <div><div className="border-t border-foreground pt-2">প্রথম পক্ষ (বাড়িওয়ালা)</div></div>
            <div><div className="border-t border-foreground pt-2">দ্বিতীয় পক্ষ (ভাড়াটিয়া)</div></div>
            <div><div className="border-t border-foreground pt-2">সাক্ষী ১</div></div>
            <div><div className="border-t border-foreground pt-2">সাক্ষী ২</div></div>
          </div>
          <p className="mt-10 text-xs text-muted-foreground print:hidden">দ্রষ্টব্য: এটি একটি সাধারণ নমুনা। আইনি প্রয়োজনে নন-জুডিশিয়াল স্ট্যাম্পে মুদ্রণ ও আইনজীবীর পরামর্শ নিন।</p>
        </article>
      </div>
    </main>
  );
}
