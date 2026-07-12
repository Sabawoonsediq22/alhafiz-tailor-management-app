import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const RTL_LANGUAGES = ["ps", "fa"];

export function useLanguage() {
  const { i18n, t } = useTranslation();

  const language = i18n.language;

  const isRTL = RTL_LANGUAGES.includes(language);

  const setLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [language, isRTL]);

  return {
    t,
    language,
    isRTL,
    setLanguage,
  };
}