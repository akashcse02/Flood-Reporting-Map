import { useCallback, useEffect, useState } from "react";

export type Lang = "bn" | "en";
const KEY = "thikana:lang";
const EVENT = "thikana:lang-change";

export function useLang() {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    const read = () => setLangState(localStorage.getItem(KEY) === "en" ? "en" : "bn");
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(KEY, next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const t = useCallback((bn: string, en: string) => (lang === "bn" ? bn : en), [lang]);

  return { lang, setLang, t };
}
