import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { apiRequest, ApiError } from "../../lib/api";
import { isAuthenticated, getAuthenticatedUserId } from "../../lib/auth";

export const Route = createFileRoute("/workers/$workerId")({
  component: WorkerProfilePage,
});

// ── Types ────────────────────────────────────────────────────────────────────

type WorkerProfile = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  bairro?: string | null;
  cidade?: string | null;
  cep?: string | null;
  createdAt?: string;
};

type Rating = {
  id: string;
  score: number;
  comment?: string | null;
  createdAt?: string;
  reviewer?: { id: string; name?: string } | null;
  client?: { id: string; name?: string } | null;
};

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  bairro: string;
  worker?: { id: string; name: string };
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  } catch {
    return "-";
  }
}

function averageScore(ratings: Rating[]) {
  if (!ratings.length) return null;
  const sum = ratings.reduce((acc, r) => acc + r.score, 0);
  return (sum / ratings.length).toFixed(1);
}

function StarDisplay({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className={`flex gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined select-none ${
            star <= score ? "text-yellow-400" : "text-muted-foreground/30"
          }`}
          style={{ fontVariationSettings: `'FILL' ${star <= score ? 1 : 0}` }}
        >
          star
        </span>
      ))}
    </div>
  );
}

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

// ── Component ────────────────────────────────────────────────────────────────

function WorkerProfilePage() {
  const { workerId } = Route.useParams();
  const queryClient = useQueryClient();
  const loggedIn = isAuthenticated();
  const currentUserId = getAuthenticatedUserId();

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const profileQuery = useQuery<WorkerProfile>({
    queryKey: ["worker-profile", workerId],
    queryFn: () => apiRequest<WorkerProfile>(`/users/${workerId}`),
  });

  const ratingsQuery = useQuery<Rating[]>({
    queryKey: ["ratings", workerId],
    queryFn: () => apiRequest<Rating[]>(`/ratings/${workerId}`),
  });

  const servicesQuery = useQuery<Service[]>({
    queryKey: ["services", { bairro: profileQuery.data?.bairro ?? "" }],
    enabled: Boolean(profileQuery.data?.bairro),
    queryFn: () =>
      apiRequest<Service[]>(
        `/services?bairro=${encodeURIComponent(profileQuery.data?.bairro ?? "")}`,
      ),
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
  const workerServices = (servicesQuery.data ?? []).filter((s) => s.worker?.id === workerId);

  const canSubmit =
    loggedIn && score > 0 && !ratingMutation.isPending && currentUserId !== workerId;

  function handleSubmitRating(e: React.FormEvent) {
    e.preventDefault();
    setFeedbackMsg(null);
    setFeedbackError(null);
    ratingMutation.mutate();
  }

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-300 mx-auto px-6">
          {/* ── Loading / erro de perfil ─────────────────────── */}
          {profileQuery.isLoading && (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded w-1/3" />
              <div className="h-5 bg-muted rounded w-1/4" />
            </div>
          )}

          {profileQuery.isError && (
            <div className="text-destructive font-semibold">
              Não foi possível carregar o perfil deste profissional.
            </div>
          )}

          {profileQuery.data && (
            <>
              {/* ── Cabeçalho do perfil ──────────────────────── */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-10">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 border-2 border-secondary/20">
                  <span className="material-symbols-outlined text-secondary text-4xl">person</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-primary mb-1">{profileQuery.data.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {(profileQuery.data.bairro || profileQuery.data.cidade) && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {[profileQuery.data.bairro, profileQuery.data.cidade]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    )}
                    {profileQuery.data.createdAt && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          calendar_month
                        </span>
                        Membro desde {formatDate(profileQuery.data.createdAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge de nota média */}
                {avg && (
                  <div className="bg-card border border-outline-variant rounded-2xl px-6 py-4 text-center shadow-sm shrink-0">
                    <p className="text-3xl font-bold text-primary">{avg}</p>
                    <StarDisplay score={Math.round(parseFloat(avg))} size="sm" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {ratings.length} {ratings.length === 1 ? "avaliação" : "avaliações"}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* ── Coluna principal ─────────────────────────── */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Serviços */}
                  {workerServices.length > 0 && (
                    <section className="bg-card border border-outline-variant rounded-2xl overflow-hidden">
                      <div className="border-b border-outline-variant bg-muted/20 px-6 py-4">
                        <h2 className="text-lg font-bold text-primary">Serviços Oferecidos</h2>
                      </div>
                      <div className="divide-y divide-outline-variant">
                        {workerServices.map((svc) => (
                          <div key={svc.id} className="px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-bold text-foreground">{svc.title}</p>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {svc.description}
                                </p>
                              </div>
                              <span className="shrink-0 bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full">
                                {svc.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Avaliações */}
                  <section className="bg-card border border-outline-variant rounded-2xl overflow-hidden">
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

                    {ratingsQuery.isLoading && (
                      <div className="p-6 space-y-4 animate-pulse">
                        {[1, 2].map((i) => (
                          <div key={i} className="space-y-2">
                            <div className="h-4 bg-muted rounded w-1/4" />
                            <div className="h-4 bg-muted rounded w-3/4" />
                          </div>
                        ))}
                      </div>
                    )}

                    {!ratingsQuery.isLoading && ratings.length === 0 && (
                      <div className="px-6 py-10 text-center text-muted-foreground text-sm">
                        <span className="material-symbols-outlined text-4xl block mb-3 opacity-40">
                          rate_review
                        </span>
                        Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                      </div>
                    )}

                    {ratings.length > 0 && (
                      <div className="divide-y divide-outline-variant">
                        {ratings.map((r) => {
                          const reviewerName =
                            r.reviewer?.name || r.client?.name || "Usuário anônimo";
                          return (
                            <div key={r.id} className="px-6 py-5">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <span className="material-symbols-outlined text-muted-foreground text-base">
                                      person
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold text-foreground">
                                    {reviewerName}
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

                {/* ── Sidebar ──────────────────────────────────── */}
                <div className="space-y-6">
                  {/* Formulário de avaliação */}
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
                          <a
                            href="/login"
                            className="inline-block px-5 py-2.5 bg-secondary text-secondary-foreground font-bold rounded-xl text-sm no-underline"
                          >
                            Fazer login
                          </a>
                        </div>
                      )}

                      {loggedIn && currentUserId === workerId && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Você não pode avaliar o seu próprio perfil.
                        </p>
                      )}

                      {loggedIn && currentUserId !== workerId && (
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
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
