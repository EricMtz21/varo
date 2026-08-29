"use client";

import { useEffect, useState } from "react";
import { writePref } from "@/utils/prefs";

const NEXT_THEME = { system: "dark", dark: "light", light: "system" };

/**
 * Tema claro / oscuro / sistema. El valor inicial llega del servidor (cookie),
 * así que aquí solo se mantiene sincronizada la clase del <html>.
 */
export function useThemePreference(initialTheme = "system") {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    const apply = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "system" && prefersDark),
      );
    };
    apply();
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  function toggleTheme() {
    const next = NEXT_THEME[theme];
    setTheme(next);
    writePref("theme", next);
  }

  return { theme, toggleTheme };
}
