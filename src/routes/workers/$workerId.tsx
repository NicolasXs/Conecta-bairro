import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StarDisplay } from "@/components/StarDisplay";
import { apiRequest, ApiError } from "@/lib/api";
import { formatDate, averageScore, formatPrice } from "@/lib/utils";
import { isAuthenticated, getAuthenticatedUserId } from "@/lib/auth";
import type { Rating, Service, WorkerProfile } from "@/types";

export const Route = createFileRoute("/workers/$workerId")({
  component: PublicProfilePage,
});

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <span
            className={`material-symbols-outlined text-2xl select-none ${
              star <= (hovered || value) ? "text-yellow-400" : "text-muted-foreground/30"
            }`}
            style={{ fontVariationSettings: `'FILL' ${star <= (hovered || value) ? 1 : 0}` }}
          >
            star
          </span>
        </button>
      ))}
    </div>
  );
}

function PublicProfilePage() {
  const { workerId } = Route.useParams();
  const queryClient = useQueryClient();
  const loggedIn = isAuthenticated();
  const currentUserId = getAuthenticatedUserId();

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [pendingLink, setPendingLink] = useState<{ label: string; value: string } | null>(null);

  const profileQuery = useQuery<WorkerProfile>({
    queryKey: ["worker-profile", workerId],
    queryFn: () => apiRequest<WorkerProfile>(`/users/${workerId}`),
  });

  const ratingsQuery = useQuery<Rating[]>({
    queryKey: ["ratings", workerId],
    queryFn: () => apiRequest<Rating[]>(`/ratings/${workerId}`),
  });

  const servicesQuery = useQuery<Service[]>({
    queryKey: ["services", { workerId }],
    queryFn: () => apiRequest<Service[]>(`/users/${encodeURIComponent(workerId)}/services`),
  });

  const ratingMutation = useMutation({
    mutationFn: () =>
      apiRequest("/ratings", {
        method: "POST",
        body: { workerId, score, comment: comment.trim() || undefined },
      }),
    onSuccess: () => {
      setFeedbackMsg("Avaliação enviada com sucesso!");
      setFeedbackError(null);
      setScore(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["ratings", workerId] });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError ? err.message : "Erro ao enviar avaliação. Tente novamente.";
      setFeedbackError(msg);
      setFeedbackMsg(null);
    },
  });

  const ratings = ratingsQuery.data ?? [];
  const avg = averageScore(ratings);
  const workerServices = servicesQuery.data ?? [];
  const isOwnProfile = currentUserId === workerId;

  const canSubmit = loggedIn && score > 0 && !ratingMutation.isPending && !isOwnProfile;

  function looksLikeUrl(value: string) {
    return /^https?:\/\//i.test(value) || /^www\./i.test(value);
  }

  function resolveUrl(value: string): string | null {
    if (/^https?:\/\//i.test(value)) return value;
    if (/^www\./i.test(value)) return `https://${value}`;
    return null;
  }

  function handleSubmitRating(e: React.FormEvent) {
    e.preventDefault();
    setFeedbackMsg(null);
    setFeedbackError(null);
    ratingMutation.mutate();
  }

  const profile = profileQuery.data;

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-300 mx-auto px-6">
          {profileQuery.isLoading && (
            <div className="animate-pulse space-y-6">
              <div className="bg-card border border-outline-variant rounded-2xl overflow-hidden">
                <div className="h-32 bg-muted" />
                <div className="px-8 pb-6 -mt-10 flex gap-5 items-end">
                  <div className="w-24 h-24 rounded-full bg-muted shrink-0" />
                  <div className="space-y-3 flex-1 mb-2">
                    <div className="h-7 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded-2xl" />
                ))}
              </div>
            </div>
          )}

          {profileQuery.isError && (
            <div className="text-destructive font-semibold">
              Não foi possível carregar o perfil deste profissional.
            </div>
          )}

          {profile && (
            <div className="space-y-8">
              {/* Hero card */}
              <div className="bg-card border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                {profile.coverUrl ? (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={profile.coverUrl}
                      alt="Capa do perfil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-linear-to-br from-primary/10 via-secondary/10 to-secondary/20" />
                )}
                <div className="px-6 md:px-8 pb-6">
                  {/* Avatar + ações */}
                  <div className="flex items-end justify-between -mt-12 mb-4">
                    <div className="w-24 h-24 rounded-full bg-card border-4 border-card shadow-md flex items-center justify-center shrink-0 overflow-hidden">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-secondary text-5xl">
                          person
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pb-1">
                      {avg && (
                        <div className="bg-background border border-outline-variant rounded-2xl px-5 py-3 text-center shadow-sm">
                          <p className="text-2xl font-bold text-primary">{avg}</p>
                          <StarDisplay score={Math.round(parseFloat(avg))} size="sm" />
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ratings.length}{" "}
                            {ratings.length === 1 ? "avaliação" : "avaliações"}
                          </p>
                        </div>
                      )}
                      {isOwnProfile && (
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold hover:border-secondary hover:text-secondary transition-all no-underline"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Editar perfil
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Nome e informações — abaixo do cover */}
                  <div>
                    <h1 className="text-3xl font-bold text-primary">{profile.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                      {(profile.bairro || profile.cidade) && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          {[profile.bairro, profile.cidade].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {profile.createdAt && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          Membro desde{" "}
                          {formatDate(profile.createdAt, { month: "long", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-card border border-outline-variant rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-3xl font-bold text-primary">{workerServices.length}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                    Serviços
                  </p>
                </div>
                <div className="bg-card border border-outline-variant rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-3xl font-bold text-primary">{ratings.length}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                    Avaliações
                  </p>
                </div>
                <div className="bg-card border border-outline-variant rounded-2xl p-5 text-center shadow-sm col-span-2 md:col-span-1">
                  <p className="text-3xl font-bold text-primary">{avg ?? "—"}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                    Média
                  </p>
                </div>
              </div>

              {/* Description */}
              {profile.description && (
                <div className="bg-card border border-outline-variant rounded-2xl p-6 shadow-sm">
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Sobre
                  </h2>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {profile.description}
                  </p>
                </div>
              )}

              {/* Contact links */}
              {profile.contactLinks && profile.contactLinks.length > 0 && (
                <div className="bg-card border border-outline-variant rounded-2xl p-6 shadow-sm">
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Contato
                  </h2>
                  <ul className="flex flex-wrap gap-3">
                    {profile.contactLinks.map((link, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => setPendingLink(link)}
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
              )}

              {/* Main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                  {/* Services */}
                  <section className="bg-card border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                    <div className="border-b border-outline-variant bg-muted/20 px-6 py-4">
                      <h2 className="text-lg font-bold text-primary">Serviços Oferecidos</h2>
                    </div>
                    {servicesQuery.isLoading ? (
                      <div className="p-6 animate-pulse space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-16 bg-muted rounded-xl" />
                        ))}
                      </div>
                    ) : workerServices.length === 0 ? (
                      <div className="px-6 py-14 text-center text-muted-foreground text-sm">
                        <span className="material-symbols-outlined text-4xl block mb-3 opacity-40">
                          handyman
                        </span>
                        Nenhum serviço cadastrado.
                      </div>
                    ) : (
                      <div className="divide-y divide-outline-variant">
                        {workerServices.map((svc) => (
                          <div key={svc.id} className="px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground">{svc.title}</p>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {svc.description}
                                </p>
                                {formatPrice(svc.price) && (
                                  <p className="text-sm font-bold text-secondary mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[15px]">payments</span>
                                    {formatPrice(svc.price)}
                                  </p>
                                )}
                              </div>
                              <span className="shrink-0 bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full">
                                {svc.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Ratings list */}
                  <section className="bg-card border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                    <div className="border-b border-outline-variant bg-muted/20 px-6 py-4">
                      <h2 className="text-lg font-bold text-primary">
                        Avaliações
                        {ratings.length > 0 && (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({ratings.length})
                          </span>
                        )}
                      </h2>
                    </div>
                    {ratingsQuery.isLoading ? (
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
                        Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                      </div>
                    ) : (
                      <div className="divide-y divide-outline-variant">
                        {ratings.map((r) => {
                          return (
                            <div key={r.id} className="px-6 py-5">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                    {r.clientAvatarUrl ? (
                                      <img
                                        src={r.clientAvatarUrl}
                                        alt={r.clientName ?? "Usuário"}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="material-symbols-outlined text-muted-foreground text-base">
                                        person
                                      </span>
                                    )}
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
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>

                {/* Rating form sidebar */}
                <div>
                  <section className="bg-card border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                    <div className="border-b border-outline-variant bg-muted/20 px-6 py-4">
                      <h3 className="text-lg font-bold text-primary">Avaliar este profissional</h3>
                    </div>
                    <div className="p-6">
                      {!loggedIn && (
                        <div className="text-center text-sm text-muted-foreground space-y-3">
                          <span className="material-symbols-outlined text-4xl block opacity-40">
                            lock
                          </span>
                          <p>Você precisa estar logado para enviar uma avaliação.</p>
                          <Link
                            to="/login"
                            className="inline-block px-5 py-2.5 bg-secondary text-secondary-foreground font-bold rounded-xl text-sm no-underline"
                          >
                            Fazer login
                          </Link>
                        </div>
                      )}

                      {loggedIn && isOwnProfile && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Você não pode avaliar o seu próprio perfil.
                        </p>
                      )}

                      {loggedIn && !isOwnProfile && (
                        <form onSubmit={handleSubmitRating} className="space-y-5">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-3 text-muted-foreground">
                              Sua nota *
                            </label>
                            <StarPicker value={score} onChange={setScore} />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                              Comentário (opcional)
                            </label>
                            <textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              rows={3}
                              maxLength={500}
                              placeholder="Conte como foi a experiência..."
                              className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm resize-none"
                            />
                            <p className="text-xs text-muted-foreground text-right mt-1">
                              {comment.length}/500
                            </p>
                          </div>

                          {feedbackMsg && (
                            <div className="flex items-center gap-2 text-secondary bg-secondary/10 px-4 py-3 rounded-xl border border-secondary/20 text-sm font-semibold">
                              <span className="material-symbols-outlined text-sm">
                                check_circle
                              </span>
                              {feedbackMsg}
                            </div>
                          )}
                          {feedbackError && (
                            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-xl border border-destructive/20 text-sm font-semibold">
                              <span className="material-symbols-outlined text-sm">error</span>
                              {feedbackError}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {ratingMutation.isPending ? "Enviando..." : "Enviar avaliação"}
                          </button>
                        </form>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* External link warning modal */}
      {pendingLink && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setPendingLink(null)}
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
                {pendingLink.label}
              </p>
              <p className="text-sm font-mono break-all text-foreground">{pendingLink.value}</p>
            </div>

            {looksLikeUrl(pendingLink.value) ? (
              <a
                href={`https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(resolveUrl(pendingLink.value) ?? pendingLink.value)}`}
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
                onClick={() => setPendingLink(null)}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-all"
              >
                Cancelar
              </button>
              {resolveUrl(pendingLink.value) ? (
                <a
                  href={resolveUrl(pendingLink.value)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPendingLink(null)}
                  className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold text-center hover:opacity-90 transition-all no-underline flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Prosseguir
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pendingLink.value);
                    setPendingLink(null);
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
      )}
    </div>
  );
}
