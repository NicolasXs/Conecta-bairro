export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low dark:bg-card border-t border-outline-variant text-foreground transition-colors duration-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-12 px-6 max-w-[1200px] mx-auto">
        <div className="col-span-1 md:col-span-1">
          <div className="text-xl font-bold mb-4 text-primary">Conecta Bairro</div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Conecta Bairro. Confiança e qualidade local.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Serviços
          </h4>
          <a
            href="#"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
          >
            Pedreiro
          </a>
          <a
            href="#"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
          >
            Pintura
          </a>
          <a
            href="#"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
          >
            Limpeza
          </a>
          <a
            href="#"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
          >
            Eletricista
          </a>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Suporte
          </h4>
          <a
            href="#"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
          >
            Atendimento
          </a>
          <a
            href="#"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
          >
            Política de Privacidade
          </a>
          <a
            href="#"
            className="block text-sm text-muted-foreground hover:text-primary transition-colors no-underline"
          >
            Termos de Uso
          </a>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Redes Sociais
          </h4>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center cursor-pointer text-muted-foreground hover:bg-muted hover:text-primary transition-all">
              <span className="material-symbols-outlined text-sm">public</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center cursor-pointer text-muted-foreground hover:bg-muted hover:text-primary transition-all">
              <span className="material-symbols-outlined text-sm">share</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
