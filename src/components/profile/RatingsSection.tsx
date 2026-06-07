import { StarDisplay } from "../StarDisplay";
import type { Rating } from "../../types";

type Props = {
  ratings: Rating[];
  isLoading: boolean;
};

export function RatingsSection({ ratings, isLoading }: Props) {
  return (
    <section className="bg-card border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
      <div className="border-b border-outline-variant bg-muted/20 px-6 py-4">
        <h2 className="text-lg font-bold text-primary">
          Avaliações Recebidas
          {ratings.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({ratings.length})
            </span>
          )}
        </h2>
      </div>
      {isLoading ? (
        <div className="p-6 animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : ratings.length === 0 ? (
        <div className="px-6 py-14 text-center text-muted-foreground text-sm">
          <span className="material-symbols-outlined text-4xl block mb-3 opacity-40">
            rate_review
          </span>
          Nenhuma avaliação recebida ainda.
        </div>
      ) : (
        <div className="divide-y divide-outline-variant">
          {ratings.map((r) => (
            <div key={r.id} className="px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="material-symbols-outlined text-muted-foreground text-base">
                      person
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {r.clientName ?? "Usuário"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay score={r.score} size="sm" />
                  {r.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
