import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";

// ── Tipos auxiliares do modal ─────────────────────────────────────────────────

type WorkerProfile = {
  id: string;
  name: string;
  bairro?: string | null;
  cidade?: string | null;
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
  return (ratings.reduce((a, r) => a + r.score, 0) / ratings.length).toFixed(1);
}

function StarDisplay({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`material-symbols-outlined text-base select-none ${s <= score ? "text-yellow-400" : "text-muted-foreground/30"}`}
          style={{ fontVariationSettings: `'FILL' ${s <= score ? 1 : 0}` }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export const Route = createFileRoute("/professionals")({
  component: ProfessionalsPage,
});

// ── Types ────────────────────────────────────────────────────────────────────

type Worker = {
  id: string;
  name: string;
  bairro?: string | null;
  cidade?: string | null;
};

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  bairro: string;
  worker?: Worker;
  createdAt?: string;
};

type Category = {
  id: string;
  name: string;
};

// ── Hooks ────────────────────────────────────────────────────────────────────

function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiRequest<Category[]>("/categories"),
    staleTime: 1000 * 60 * 10,
  });
}

function useServices(params: {
  q: string;
  category: string;
  bairro: string;
  cidade: string;
  cep: string;
}) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.category) query.set("category", params.category);
  if (params.bairro) query.set("bairro", params.bairro);
  if (params.cidade) query.set("cidade", params.cidade);
  if (params.cep) query.set("cep", params.cep);

  return useQuery<Service[]>({
    queryKey: ["services", params],
    queryFn: () => apiRequest<Service[]>(`/services${query.size ? `?${query}` : ""}`),
    staleTime: 1000 * 60 * 2,
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  limpeza: "cleaning_services",
  eletricista: "electrical_services",
  encanador: "plumbing",
  pintor: "format_paint",
  carpinteiro: "carpenter",
  pedreiro: "construction",
  jardinagem: "yard",
};

function categoryIcon(name: string) {
  return CATEGORY_ICONS[name.toLowerCase()] ?? "handyman";
}

// ── Modal de perfil do prestador ─────────────────────────────────────────────

function WorkerModal({ svc, onClose }: { svc: Service; onClose: () => void }) {
  const workerId = svc.worker?.id;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const profileQuery = useQuery<WorkerProfile>({
    queryKey: ["worker-profile", workerId],
    queryFn: () => apiRequest<WorkerProfile>(`/users/${workerId}`),
    enabled: Boolean(workerId),
  });

  const ratingsQuery = useQuery<Rating[]>({
    queryKey: ["ratings", workerId],
    queryFn: () => apiRequest<Rating[]>(`/ratings/${workerId}`),
    enabled: Boolean(workerId),
  });

  const servicesQuery = useQuery<Service[]>({
    queryKey: ["worker-services-modal", workerId],
    queryFn: () =>
      apiRequest<Service[]>(
        `/services?bairro=${encodeURIComponent(profileQuery.data?.bairro ?? "")}`,
      ),
    enabled: Boolean(profileQuery.data?.bairro),
    select: (data) => data.filter((s) => s.worker?.id === workerId),
  });

  const profile = profileQuery.data;
  const ratings = ratingsQuery.data ?? [];
  const workerServices = servicesQuery.data ?? [];
  const avg = averageScore(ratings);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border border-outline-variant rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Barra de topo */}
        <div className="sticky top-0 bg-card border-b border-outline-variant px-6 py-4 flex items-center justify-between z-10">
          <p className="text-sm text-muted-foreground font-medium">Perfil do Prestador</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-foreground text-[18px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ── Cabeçalho do perfil ─── */}
          {profileQuery.isLoading && (
            <div className="animate-pulse flex gap-4 items-center">
              <div className="w-16 h-16 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            </div>
          )}

          {profile && (
            <div className="flex gap-4 items-start">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 border-2 border-secondary/20">
                <span className="material-symbols-outlined text-secondary text-3xl">person</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-primary">{profile.name}</h2>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                  {(profile.bairro || profile.cidade) && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {[profile.bairro, profile.cidade].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {profile.createdAt && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      Membro desde {formatDate(profile.createdAt)}
                    </span>
                  )}
                </div>
              </div>
              {avg && (
                <div className="bg-background border border-outline-variant rounded-xl px-4 py-3 text-center shrink-0">
                  <p className="text-2xl font-bold text-primary">{avg}</p>
                  <StarDisplay score={Math.round(parseFloat(avg))} />
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ratings.length} {ratings.length === 1 ? "avaliação" : "avaliações"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Serviços ─── */}
          {(workerServices.length > 0 || servicesQuery.isLoading) && (
            <section className="bg-background border border-outline-variant rounded-xl overflow-hidden">
              <div className="border-b border-outline-variant bg-muted/20 px-4 py-3">
                <h3 className="font-bold text-primary text-sm">Serviços Oferecidos</h3>
              </div>
              {servicesQuery.isLoading ? (
                <div className="p-4 animate-pulse space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-4 bg-muted rounded" />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-outline-variant">
                  {workerServices.map((s) => (
                    <div key={s.id} className="px-4 py-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {s.description}
                        </p>
                      </div>
                      <span className="shrink-0 bg-secondary/10 text-secondary text-xs font-bold px-2 py-0.5 rounded-full">
                        {s.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Avaliações ─── */}
          <section className="bg-background border border-outline-variant rounded-xl overflow-hidden">
            <div className="border-b border-outline-variant bg-muted/20 px-4 py-3">
              <h3 className="font-bold text-primary text-sm">
                Avaliações
                {ratings.length > 0 && (
                  <span className="ml-1 font-normal text-muted-foreground">({ratings.length})</span>
                )}
              </h3>
            </div>
            {ratingsQuery.isLoading ? (
              <div className="p-4 animate-pulse space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : ratings.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                <span className="material-symbols-outlined text-3xl block mb-2 opacity-40">
                  rate_review
                </span>
                Nenhuma avaliação ainda.
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {ratings.slice(0, 5).map((r) => {
                  const reviewer = r.reviewer ?? r.client;
                  return (
                    <div key={r.id} className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <StarDisplay score={r.score} />
                        <span className="text-xs text-muted-foreground">
                          {reviewer?.name ?? "Usuário"}
                        </span>
                        {r.createdAt && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDate(r.createdAt)}
                          </span>
                        )}
                      </div>
                      {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Rodapé com link para a página completa ─── */}
          {workerId && (
            <Link
              to="/workers/$workerId"
              params={{ workerId }}
              onClick={onClose}
              className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2 no-underline"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              Ver Perfil Completo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfessionalsPage() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [bairroFilter, setBairroFilter] = useState("");
  const [cidadeFilter, setCidadeFilter] = useState("");
  const [cepFilter, setCepFilter] = useState("");
  const [modalService, setModalService] = useState<Service | null>(null);

  // debounce de 400ms nos campos de texto livre
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(inputValue), 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const categoriesQuery = useCategories();
  const servicesQuery = useServices({
    q: debouncedQ,
    category: selectedCategory,
    bairro: bairroFilter,
    cidade: cidadeFilter,
    cep: cepFilter,
  });

  const services = servicesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  function clearFilters() {
    setInputValue("");
    setDebouncedQ("");
    setSelectedCategory("");
    setBairroFilter("");
    setCidadeFilter("");
    setCepFilter("");
  }

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-300 mx-auto px-6">
          {/* Cabeçalho da página */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-primary mb-3">Serviços Disponíveis</h1>
            <p className="text-lg text-muted-foreground">
              Encontre o especialista ideal para o seu projeto — verificado e perto de você.
            </p>
          </div>

          {/* Filtros — espelham exatamente os query params aceitos pela API */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {/* q — busca por título ou descrição */}
            <div className="md:col-span-2 lg:col-span-3 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground select-none">
                search
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Buscar por título ou descrição..."
                className="w-full pl-12 pr-4 py-3.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm"
              />
            </div>

            {/* category */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary cursor-pointer transition-all text-sm text-foreground"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* bairro */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground select-none text-[18px]">
                location_on
              </span>
              <input
                type="text"
                value={bairroFilter}
                onChange={(e) => setBairroFilter(e.target.value)}
                placeholder="Bairro"
                className="w-full pl-10 pr-4 py-3.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm"
              />
            </div>

            {/* cidade */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground select-none text-[18px]">
                apartment
              </span>
              <input
                type="text"
                value={cidadeFilter}
                onChange={(e) => setCidadeFilter(e.target.value)}
                placeholder="Cidade"
                className="w-full pl-10 pr-4 py-3.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm"
              />
            </div>

            {/* cep */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground select-none text-[18px]">
                pin_drop
              </span>
              <input
                type="text"
                value={cepFilter}
                onChange={(e) => setCepFilter(e.target.value)}
                placeholder="CEP"
                maxLength={9}
                className="w-full pl-10 pr-4 py-3.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm"
              />
            </div>

            {/* Botão limpar — aparece só se algum filtro estiver ativo */}
            {(inputValue || selectedCategory || bairroFilter || cidadeFilter || cepFilter) && (
              <div className="flex items-center">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:text-primary border border-outline-variant rounded-xl hover:border-primary transition-all bg-card"
                >
                  <span className="material-symbols-outlined text-[18px]">filter_list_off</span>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

          {/* Estados: carregando */}
          {servicesQuery.isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-outline-variant overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Estado: erro */}
          {servicesQuery.isError && (
            <div className="text-center py-20 bg-card rounded-2xl border border-outline-variant max-w-xl mx-auto px-6">
              <span className="material-symbols-outlined text-destructive text-5xl mb-4 block">
                error
              </span>
              <h3 className="text-xl font-bold text-primary mb-2">Erro ao carregar serviços</h3>
              <p className="text-muted-foreground text-base mb-6">
                Não foi possível conectar à API. Tente novamente em instantes.
              </p>
              <button
                onClick={() => servicesQuery.refetch()}
                className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-90 transition-all text-sm shadow"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Estado: sem resultados */}
          {!servicesQuery.isLoading && !servicesQuery.isError && services.length === 0 && (
            <div className="text-center py-20 bg-card rounded-2xl border border-outline-variant max-w-xl mx-auto px-6">
              <span className="material-symbols-outlined text-muted-foreground text-5xl mb-4 block">
                search_off
              </span>
              <h3 className="text-xl font-bold text-primary mb-2">Nenhum serviço encontrado</h3>
              <p className="text-muted-foreground text-base mb-6">
                Não localizamos serviços com os filtros selecionados. Tente ampliar a busca.
              </p>
              {(debouncedQ || selectedCategory || bairroFilter || cidadeFilter || cepFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-90 transition-all text-sm shadow"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}

          {/* Lista de serviços */}
          {!servicesQuery.isLoading && !servicesQuery.isError && services.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {services.length}{" "}
                {services.length === 1 ? "serviço encontrado" : "serviços encontrados"}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setModalService(svc)}
                    className="bg-card rounded-xl border border-outline-variant overflow-hidden hover:shadow-xl hover:border-secondary/30 transition-all flex flex-col cursor-pointer"
                  >
                    {/* Cabeçalho colorido com ícone */}
                    <div className="h-28 bg-primary/5 dark:bg-primary/10 flex items-center justify-center border-b border-outline-variant relative">
                      <span className="material-symbols-outlined text-secondary text-5xl">
                        {categoryIcon(svc.category)}
                      </span>
                      <span className="absolute top-3 right-3 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
                        {svc.category}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-primary mb-1 line-clamp-2">
                        {svc.title}
                      </h3>

                      {svc.worker?.name && (
                        <p className="text-sm font-semibold text-secondary mb-2">
                          {svc.worker.name}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-muted-foreground text-xs mb-4">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span>{svc.bairro}</span>
                        {svc.worker?.cidade && (
                          <>
                            <span className="mx-0.5">•</span>
                            <span>{svc.worker.cidade}</span>
                          </>
                        )}
                      </div>

                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 flex-1">
                        {svc.description}
                      </p>

                      {svc.worker?.id && (
                        <Link
                          to="/workers/$workerId"
                          params={{ workerId: svc.worker.id }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-6 w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-lg hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2 no-underline"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          Ver Perfil
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {modalService && <WorkerModal svc={modalService} onClose={() => setModalService(null)} />}

      <Footer />
    </div>
  );
}
