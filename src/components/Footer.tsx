import { Link } from "@tanstack/react-router";

const SERVICES = [
  { label: "Limpeza", category: "Limpeza" },
  { label: "Eletricista", category: "Eletricista" },
  { label: "Encanador", category: "Encanador" },
  { label: "Pintor", category: "Pintor" },
  { label: "Carpinteiro", category: "Carpinteiro" },
  { label: "Pedreiro", category: "Pedreiro" },
  { label: "Jardinagem", category: "Jardinagem" },
];

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {title}
      </h4>
      {children}
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low dark:bg-card border-t border-outline-variant text-foreground transition-colors duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-12 px-6 max-w-300 mx-auto">
        <div>
          <div className="text-xl font-bold mb-3 text-primary">Conecta Bairro</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Conectamos moradores a profissionais de confiança do bairro — rápido, simples e seguro.
          </p>
        </div>

        <FooterColumn title="Plataforma">
          <FooterLink to="/">Início</FooterLink>
          <FooterLink to="/professionals">Profissionais</FooterLink>
          <FooterLink to="/about">Sobre nós</FooterLink>
          <FooterLink to="/register">Seja um profissional</FooterLink>
        </FooterColumn>

        <FooterColumn title="Serviços">
          {SERVICES.map(({ label, category }) => (
            <Link
              key={category}
              to="/professionals"
              search={{ category }}
              className="block text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
            >
              {label}
            </Link>
          ))}
          <Link
            to="/professionals"
            className="block text-sm font-semibold text-secondary hover:opacity-80 transition-opacity no-underline mt-1"
          >
            Ver todos →
          </Link>
        </FooterColumn>

        <FooterColumn title="Legal">
          <FooterLink to="/politica-de-privacidade">Política de Privacidade</FooterLink>
          <FooterLink to="/termos-de-uso">Termos de Uso</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-outline-variant py-5 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Conecta Bairro. Todos os direitos reservados.
      </div>
    </footer>
  );
}
