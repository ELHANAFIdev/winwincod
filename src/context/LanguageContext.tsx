"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import ar from "@/messages/ar.json";
import fr from "@/messages/fr.json";

export type Lang = "ar" | "fr";

const STORAGE_KEY = "winwincod_lang";
const messages: Record<Lang, Record<string, any>> = { ar, fr };

function resolve(obj: Record<string, any>, key: string): string {
  const result = key.split(".").reduce<any>((o, k) => o?.[k], obj);
  return typeof result === "string" ? result : key;
}

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: "ar",
  setLang: () => {},
  t: (k) => k,
});

function applyLang(l: Lang) {
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  document.body.style.fontFamily =
    l === "fr" ? "var(--font-inter), sans-serif" : "var(--font-cairo), sans-serif";
  document.cookie = `${STORAGE_KEY}=${l};path=/;max-age=31536000;SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === "ar" || saved === "fr") {
      setLangState(saved);
      applyLang(saved);
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
    applyLang(l);
  }

  const t = useCallback((key: string) => resolve(messages[lang], key), [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLanguage = () => useContext(LangContext);
