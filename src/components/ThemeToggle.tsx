import { useEffect } from "react";
import { AnimatedThemeToggler } from "#/components/ui/animated-theme-toggler";

function initTheme() {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = stored === "dark" || (!stored && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
}

export default function ThemeToggle() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <AnimatedThemeToggler className="rounded-full border border-outline-variant bg-card p-2 text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" />
  );
}
