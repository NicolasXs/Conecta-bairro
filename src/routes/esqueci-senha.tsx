import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatedGridPattern } from "../components/magic-ui/animated-grid-pattern";

export const Route = createFileRoute("/esqueci-senha")({
  component: EsqueciSenhaPage,
});

function EsqueciSenhaPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <AnimatedGridPattern
        className="absolute inset-0 -z-10 opacity-30 mask-[radial-gradient(600px_circle_at_center,white,transparent)]"
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
      />

      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-secondary text-3xl">lock_reset</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Esqueceu sua senha?</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          No momento a troca de senha é feita pela nossa equipe de suporte.
          Entre em contato pelo e-mail abaixo e te ajudaremos a recuperar o acesso.
        </p>

        <a
          href="mailto:suporte@conectabairro.com.br"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-90 transition-opacity no-underline mb-4"
        >
          <span className="material-symbols-outlined text-[18px]">mail</span>
          suporte@conectabairro.com.br
        </a>

        <Link
          to="/login"
          className="text-sm text-muted-foreground hover:text-primary transition-colors no-underline flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
