import type { ContactLink } from "../../types";

type Props = {
  link: ContactLink;
  onClose: () => void;
};

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^www\./i.test(value);
}

function resolveUrl(value: string): string | null {
  if (/^https?:\/\//i.test(value)) return value;
  if (/^www\./i.test(value)) return `https://${value}`;
  return null;
}

export function ExternalLinkModal({ link, onClose }: Props) {
  const url = resolveUrl(link.value);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-outline-variant rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-yellow-500 text-2xl shrink-0">
            warning
          </span>
          <div>
            <h3 className="font-bold text-primary text-base">Conteúdo externo</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Este conteúdo foi adicionado pelo próprio prestador. Não verificamos nem
              garantimos a segurança do destino. Prossiga com cautela.
            </p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl px-4 py-3 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {link.label}
          </p>
          <p className="text-sm font-mono break-all text-foreground">{link.value}</p>
        </div>

        {looksLikeUrl(link.value) ? (
          <a
            href={`https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(url ?? link.value)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-secondary font-semibold hover:underline no-underline"
          >
            <span className="material-symbols-outlined text-[16px]">security</span>
            Verificar segurança via Google Transparency Report
          </a>
        ) : (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">info</span>
            Este conteúdo não é um link — copie e use como preferir.
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-all"
          >
            Cancelar
          </button>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold text-center hover:opacity-90 transition-all no-underline flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Prosseguir
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(link.value);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Copiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
