import type { ContactLink } from "../../types";

type Props = {
  contactLinks: ContactLink[];
  onLinkClick: (link: ContactLink) => void;
};

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^www\./i.test(value);
}

export function ContactLinksSection({ contactLinks, onLinkClick }: Props) {
  if (contactLinks.length === 0) return null;

  return (
    <div className="bg-card border border-outline-variant rounded-2xl p-6 shadow-sm">
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
        Contato
      </h2>
      <ul className="flex flex-wrap gap-3">
        {contactLinks.map((link, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onLinkClick(link)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-secondary hover:border-secondary hover:bg-secondary/5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">
                {looksLikeUrl(link.value) ? "link" : "tag"}
              </span>
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
