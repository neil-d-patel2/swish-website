import { useState } from "react";

export function useTheme() {
  const [light, setLight] = useState(() => {
    try { return localStorage.getItem("swish-theme") === "light"; }
    catch { return false; }
  });

  const toggle = () => {
    setLight((v) => {
      const next = !v;
      try { localStorage.setItem("swish-theme", next ? "light" : "dark"); } catch { /* ignore */ }
      return next;
    });
  };

  return { light, toggle };
}
