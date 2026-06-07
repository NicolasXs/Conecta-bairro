import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { StarDisplay } from "./StarDisplay";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "./ui/drawer";
import { apiRequest } from "../lib/api";
import { formatDate, averageScore, formatPrice } from "../lib/utils";
import type { Rating, Service, WorkerProfile } from "../types";

export function WorkerDrawer({
  workerId,
  open,
  onClose,
}: {
  workerId: string;
  open: boolean;
  onClose: () => void;
}) {
  const profileQuery = useQuery<WorkerProfile>({
    queryKey: ["worker-profile", workerId],
    queryFn: () => apiRequest<WorkerProfile>(`/users/${workerId}`),
    enabled: open,
  });

  const ratingsQuery = useQuery<Rating[]>({
    queryKey: ["ratings", workerId],
    queryFn: () => apiRequest<Rating[]>(`/ratings/${workerId}`),
    enabled: open,
  });

  const servicesQuery = useQuery<Service[]>({
    queryKey: ["services", { workerId }],
    queryFn: () => apiRequest<Service[]>(`/users/${encodeURIComponent(workerId)}/services`),
    enabled: open,
  });

  const profile = profileQuery.data;
  const ratings = ratingsQuery.data ?? [];
  const workerServices = servicesQuery.data ?? [];
  const avg = averageScore(ratings);

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto px-1">
          <DrawerHeader className="pb-2 text-left!">
            <DrawerTitle className="sr-only">Perfil do prestador</DrawerTitle>

            {profileQuery.isLoading && (
              <div className="animate-pulse flex gap-4 items-center pt-2">
                <div className="w-14 h-14 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </div>
            )}

            {profile && (
              <div className="flex gap-4 items-start pt-2">
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 border-2 border-secondary/20 overflow-hidden">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-secondary text-3xl">person</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-primary truncate">{profile.name}</h2>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5 text-xs text-muted-foreground">
                    {(profile.bairro || profile.cidade) && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">location_on</span>
                        {[profile.bairro, profile.cidade].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {profile.createdAt && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                        Membro desde{" "}
                        {formatDate(profile.createdAt, { month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
                {avg && (
                  <div className="shrink-0 text-center bg-muted/40 rounded-xl px-3 py-2">
                    <p className="text-xl font-bold text-primary leading-none">{avg}</p>
                    <StarDisplay score={Math.round(parseFloat(avg))} size="sm" />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {ratings.length} {ratings.length === 1 ? "avaliação" : "avaliações"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DrawerHeader>

          {profile && (
            <div className="flex gap-3 px-4 pb-4">
              <div className="flex-1 bg-muted/30 rounded-xl px-3 py-2 text-center">
                <p className="text-base font-bold text-primary">{workerServices.length}</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Serviços
                </p>
              </div>
              <div className="flex-1 bg-muted/30 rounded-xl px-3 py-2 text-center">
                <p className="text-base font-bold text-primary">{ratings.length}</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Avaliações
                </p>
              </div>
              <div className="flex-1 bg-muted/30 rounded-xl px-3 py-2 text-center">
                <p className="text-base font-bold text-primary">{avg ?? "—"}</p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Média
                </p>
              </div>
            </div>
          )}

          {(workerServices.length > 0 || servicesQuery.isLoading) && (
            <section className="mx-4 mb-4 bg-background border border-border rounded-xl overflow-hidden">
              <div className="border-b border-border bg-muted/20 px-4 py-2.5">
                <h3 className="font-bold text-primary text-xs uppercase tracking-wider">
                  Serviços Oferecidos
                </h3>
              </div>
              {servicesQuery.isLoading ? (
                <div className="p-4 animate-pulse space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-4 bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {workerServices.slice(0, 3).map((s) => (
                    <div key={s.id} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {s.description}
                        </p>
                        {formatPrice(s.price) && (
                          <p className="text-xs font-bold text-secondary mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">payments</span>
                            {formatPrice(s.price)}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {s.category}
                      </span>
                    </div>
                  ))}
                  {workerServices.length > 3 && (
                    <p className="px-4 py-2 text-xs text-muted-foreground text-center">
                      +{workerServices.length - 3} serviços no perfil completo
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {(ratings.length > 0 || ratingsQuery.isLoading) && (
            <section className="mx-4 mb-4 bg-background border border-border rounded-xl overflow-hidden">
              <div className="border-b border-border bg-muted/20 px-4 py-2.5">
                <h3 className="font-bold text-primary text-xs uppercase tracking-wider">
                  Avaliações Recentes
                </h3>
              </div>
              {ratingsQuery.isLoading ? (
                <div className="p-4 animate-pulse space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-4 bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {ratings.slice(0, 3).map((r) => (
                    <div key={r.id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {r.clientAvatarUrl ? (
                            <img
                              src={r.clientAvatarUrl}
                              alt={r.clientName ?? "Usuário"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-muted-foreground text-xs">
                              person
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {r.clientName ?? "Usuário"}
                        </span>
                        <StarDisplay score={r.score} size="sm" />
                        {r.createdAt && (
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                      {r.comment && (
                        <p className="text-xs text-muted-foreground line-clamp-2 pl-8">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                  {ratings.length > 3 && (
                    <p className="px-4 py-2 text-xs text-muted-foreground text-center">
                      +{ratings.length - 3} avaliações no perfil completo
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        <DrawerFooter className="pt-2">
          <Link
            to="/workers/$workerId"
            params={{ workerId }}
            onClick={onClose}
            className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2 no-underline"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Ver Perfil Completo
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
