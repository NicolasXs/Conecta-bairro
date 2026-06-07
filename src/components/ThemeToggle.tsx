import { AnimatedThemeToggler } from "#/components/ui/animated-theme-toggler";

export default function ThemeToggle() {
  return (
    <AnimatedThemeToggler className="rounded-full border border-outline-variant bg-card p-2 text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" />
  );
}
