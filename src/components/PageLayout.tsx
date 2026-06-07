import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { cn } from "../lib/utils";

type PageLayoutProps = {
  children: ReactNode;
  mainClassName?: string;
};

export function PageLayout({ children, mainClassName }: PageLayoutProps) {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />
      <main className={cn("flex-1", mainClassName)}>{children}</main>
      <Footer />
    </div>
  );
}
