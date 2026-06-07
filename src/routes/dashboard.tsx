import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageLayout } from "../components/PageLayout";
import { StarDisplay } from "../components/StarDisplay";
import { apiRequest } from "../lib/api";
import { averageScore, formatDate, formatPrice } from "../lib/utils";
import { getAuthenticatedUserId, getCurrentUser } from "../lib/auth";
import { requireAuth } from "../lib/guards";
import type { Rating, Service } from "../types";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireAuth,
  component: DashboardPage,
});

function DashboardPage() {
  const userId = getAuthenticatedUserId();
  const cachedUser = getCurrentUser();

  const servicesQuery = useQuery<Service[]>({
    queryKey: ["services", { workerId: userId }],
    enabled: Boolean(userId),
    queryFn: () => apiRequest<Service[]>(`/users/${encodeURIComponent(userId ?? "")}/services`),
  });

  const ratingsQuery = useQuery<Rating[]>({
    queryKey: ["ratings", userId],
    enabled: Boolean(userId),
    queryFn: () => apiRequest<Rating[]>(`/ratings/${userId}`),
  });

  const services = servicesQuery.data ?? [];
  const ratings = ratingsQuery.data ?? [];
  const avg = averageScore(ratings);

  return (
    <PageLayout mainClassName="py-12">
      <div className="max-w-300 mx-auto px-6 space-y-10">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Olá, {cachedUser?.name ?? "bem-vindo"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está um resumo da sua conta no Conecta Bairro.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-card border border-outline-variant rounded-2xl p-6 text-center shadow-sm">
            {servicesQuery.isLoading ? (
              <div className="animate-pulse h-8 bg-muted rounded w-1/3 mx-auto mb-2" />
            ) : (
              <p className="text-4xl font-bold text-primary">{services.length}</p>
            )}
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
              Serviços publicados
            </p>
          </div>

          <div className="bg-card border border-outline-variant rounded-2xl p-6 text-center shadow-sm">
            {ratingsQuery.isLoading ? (
              <div className="animate-pulse h-8 bg-muted rounded w-1/3 mx-auto mb-2" />
            ) : (
              <p className="text-4xl font-bold text-primary">{ratings.length}</p>
            )}
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
              Avaliações recebidas
            </p>
          </div>

          <div className="bg-card border border-outline-variant rounded-2xl p-6 text-center shadow-sm col-span-2 md:col-span-1">
            {ratingsQuery.isLoading ? (
              <div className="animate-pulse h-8 bg-muted rounded w-1/3 mx-auto mb-2" />
            ) : (
              <>
                <p className="text-4xl font-bold text-primary">{avg ?? "—"}</p>
                {avg && (
                  <div className="flex justify-center mt-1">
                    <StarDisplay score={Math.round(parseFloat(avg))} size="sm" />
                  </div>
                )}
              </>
            )}
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
              Média de avaliações
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/profile"
            className="flex items-center gap-4 p-5 bg-card border border-outline-variant rounded-2xl shadow-sm hover:border-secondary hover:shadow-md transition-all no-underline group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
              <span className="material-symbols-outlined text-secondary text-2xl">add_circle</span>
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Novo serviço</p>
              <p className="text-xs text-muted-foreground mt-0.5">Publique um serviço</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-4 p-5 bg-card border border-outline-variant rounded-2xl shadow-sm hover:border-secondary hover:shadow-md transition-all no-underline group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
              <span className="material-symbols-outlined text-secondary text-2xl">manage_accounts</span>
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Editar perfil</p>
              <p className="text-xs text-muted-foreground mt-0.5">Atualize seus dados</p>
            </div>
          </Link>

          <Link
            to="/professionals"
            search={{ workerId: undefined, category: undefined, q: undefined }}
            className="flex items-center gap-4 p-5 bg-card border border-outline-variant rounded-2xl shadow-sm hover:border-secondary hover:shadow-md transition-all no-underline group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
              <span className="material-symbols-outlined text-secondary text-2xl">search</span>
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Explorar serviços</p>
              <p className="text-xs text-muted-foreground mt-0.5">Veja profissionais</p>
            </div>
          </Link>
        </div>

        {/* My services */}
        <section className="bg-card border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="border-b border-outline-variant bg-muted/20 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">Meus Serviços</h2>
            <Link
              to="/profile"
              className="text-xs text-secondary font-semibold hover:underline no-underline"
            >
              Ver todos
            </Link>
          </div>

          {servicesQuery.isLoading && (
            <div className="p-6 animate-pulse space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-muted rounded-xl" />
              ))}
            </div>
          )}

          {!servicesQuery.isLoading && services.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground text-sm">
              <span className="material-symbols-outlined text-4xl block mb-3 opacity-40">
                handyman
              </span>
              <p>Você não tem serviços publicados.</p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-1 mt-4 px-5 py-2.5 bg-secondary text-secondary-foreground font-bold rounded-xl text-sm no-underline hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Criar serviço
              </Link>
            </div>
          )}

          {services.length > 0 && (
            <div className="divide-y divide-outline-variant">
              {services.slice(0, 3).map((svc) => (
                <div key={svc.id} className="px-6 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-sm">{svc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {svc.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {svc.bairro}
                        {svc.createdAt && (
                          <span className="ml-2">• {formatDate(svc.createdAt)}</span>
                        )}
                      </p>
                      {formatPrice(svc.price) && (
                        <span className="text-xs font-bold text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">payments</span>
                          {formatPrice(svc.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 bg-secondary/10 text-secondary text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {svc.category}
                  </span>
                </div>
              ))}
              {services.length > 3 && (
                <div className="px-6 py-3 text-center">
                  <Link
                    to="/profile"
                    className="text-xs text-secondary font-semibold hover:underline no-underline"
                  >
                    +{services.length - 3} serviços no seu perfil
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Recent ratings */}
        {ratings.length > 0 && (
          <section className="bg-card border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="border-b border-outline-variant bg-muted/20 px-6 py-4">
              <h2 className="text-lg font-bold text-primary">Avaliações Recentes</h2>
            </div>
            <div className="divide-y divide-outline-variant">
              {ratings.slice(0, 3).map((r) => (
                <div key={r.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-muted-foreground text-sm">person</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {r.clientName ?? "Usuário"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarDisplay score={r.score} size="sm" />
                      {r.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(r.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 pl-9">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}
