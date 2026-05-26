import { createFileRoute } from "@tanstack/react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-8 max-w-[1200px] mx-auto w-full">
        <h1 className="text-3xl font-bold text-primary">Bem-vindo ao Conecta Bairro</h1>
      </main>
      <Footer />
    </div>
  );
}
