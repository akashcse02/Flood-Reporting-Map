import { useLang } from "@/hooks/use-lang";

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl font-semibold text-primary">{t("ঠিকানা", "Thikana")}</p>
        <p>{t("বাংলাদেশের ৮ বিভাগজুড়ে বিশ্বস্ত সম্পত্তির খোঁজ।", "Trusted property search across all 8 divisions of Bangladesh.")}</p>
      </div>
    </footer>
  );
}
