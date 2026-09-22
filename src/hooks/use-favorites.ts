import { useCallback, useEffect, useState } from "react";

const KEY = "thikana:favorites";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
    const sync = () => setIds(read());
    window.addEventListener("thikana:favorites", sync);
    return () => window.removeEventListener("thikana:favorites", sync);
  }, []);

  const toggle = useCallback((id: string) => {
    const next = read().includes(id) ? read().filter((x) => x !== id) : [...read(), id];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("thikana:favorites"));
  }, []);

  return { ids, toggle, isFavorite: (id: string) => ids.includes(id) };
}
