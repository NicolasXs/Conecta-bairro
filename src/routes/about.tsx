import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/PageLayout";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageLayout mainClassName="py-12">
      <div className="max-w-300 mx-auto px-6">
        <h1 className="text-4xl font-bold text-primary mb-4">Sobre o Conecta Bairro</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Conecta Bairro é uma plataforma que conecta moradores a profissionais de confiança da
          sua região — pedreiros, pintores, eletricistas e muito mais.
        </p>
      </div>
    </PageLayout>
  );
}
