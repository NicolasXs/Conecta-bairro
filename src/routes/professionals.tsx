import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { PageLayout } from "../components/PageLayout";
import { WorkerDrawer } from "../components/WorkerDrawer";
import { apiRequest } from "../lib/api";
import { formatPrice } from "../lib/utils";
import { categoryIcon } from "../lib/categories";
import { formatCep, getCepDigits, fetchViaCep } from "../lib/cep";
import { useGeolocation } from "../hooks/use-geolocation";
import type { Category, Service } from "../types";

export const Route = createFileRoute("/professionals")({
  component: ProfessionalsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    workerId: typeof search.workerId === "string" ? search.workerId : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
});

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

function ProfessionalsPage() {
  const { workerId, category: categoryParam, q: qParam } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const [inputValue, setInputValue] = useState(qParam ?? "");
  const [debouncedQ, setDebouncedQ] = useState(qParam ?? "");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam ?? "");
  const [bairroFilter, setBairroFilter] = useState("");
  const [cidadeFilter, setCidadeFilter] = useState("");
  const [cepFilter, setCepFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { state: geoState, requestLocation } = useGeolocation();

  const cepDigits = getCepDigits(cepFilter);

  const viaCepQuery = useQuery({
    queryKey: ["viacep", cepDigits],
    enabled: cepDigits.length === 8,
    retry: false,
    staleTime: 1000 * 60 * 10,
    queryFn: () => fetchViaCep(cepDigits),
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(inputValue), 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    if (!viaCepQuery.data) return;
    if (viaCepQuery.data.bairro) setBairroFilter(viaCepQuery.data.bairro);
    if (viaCepQuery.data.localidade) setCidadeFilter(viaCepQuery.data.localidade);
  }, [viaCepQuery.data]);

  useEffect(() => {
    if (geoState.status !== "success") return;
    if (geoState.data.bairro) setBairroFilter(geoState.data.bairro);
    if (geoState.data.cidade) setCidadeFilter(geoState.data.cidade);
    if (geoState.data.cep) setCepFilter(geoState.data.cep);
  }, [geoState]);

  const categoriesQuery = useCategories();
  const servicesQuery = useServices({
    q: debouncedQ,
    category: selectedCategory,
    bairro: bairroFilter,
    cidade: cidadeFilter,
    cep: cepFilter,
  });

  const allServices = servicesQuery.data ?? [];
  const services = allServices.filter((svc) => {
    if (minPrice !== "" && (svc.price == null || svc.price < Number(minPrice))) return false;
    if (maxPrice !== "" && (svc.price == null || svc.price > Number(maxPrice))) return false;
    return true;
  });
  const categories = categoriesQuery.data ?? [];

  function openModal(id: string) {
    navigate({ search: (prev) => ({ ...prev, workerId: id }) });
  }

  function closeModal() {
    navigate({ search: (prev) => ({ ...prev, workerId: undefined }) });
  }

  function clearFilters() {
    setInputValue("");
    setDebouncedQ("");
    setSelectedCategory("");
    setBairroFilter("");
    setCidadeFilter("");
    setCepFilter("");
    setMinPrice("");
    setMaxPrice("");
  }

  const hasActiveFilters = Boolean(
    inputValue || selectedCategory || bairroFilter || cidadeFilter || cepFilter || minPrice || maxPrice,
  );

  return (
    <PageLayout mainClassName="py-12">
      <div className="max-w-300 mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-primary mb-3">Serviços Disponíveis</h1>
          <p className="text-lg text-muted-foreground">
            Encontre o especialista ideal para o seu projeto — verificado e perto de você.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
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

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground select-none text-[18px]">
              payments
            </span>
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Preço mínimo (R$)"
              className="w-full pl-10 pr-4 py-3.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm"
            />
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground select-none text-[18px]">
              payments
            </span>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Preço máximo (R$)"
              className="w-full pl-10 pr-4 py-3.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm"
            />
          </div>

          {/* Geolocation button */}
          <div className="md:col-span-1 lg:col-span-2">
            <button
              type="button"
              onClick={requestLocation}
              disabled={geoState.status === "loading"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-card border border-outline-variant rounded-xl text-sm font-semibold text-muted-foreground hover:border-secondary hover:text-secondary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {geoState.status === "loading" ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    progress_activity
                  </span>
                  Obtendo localização...
                </>
              ) : geoState.status === "success" ? (
                <>
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    my_location
                  </span>
                  <span className="text-secondary">Localização aplicada</span>
                  <span className="material-symbols-outlined text-[16px] text-secondary ml-auto">
                    check_circle
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">near_me</span>
                  Usar minha localização
                </>
              )}
            </button>
            {geoState.status === "error" && (
              <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {geoState.message}
              </p>
            )}
          </div>

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

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground select-none text-[18px]">
              pin_drop
            </span>
            <input
              type="text"
              value={cepFilter}
              onChange={(e) => setCepFilter(formatCep(e.target.value))}
              placeholder="CEP (00000-000)"
              maxLength={9}
              className="w-full pl-10 pr-10 py-3.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm"
            />
            {viaCepQuery.isFetching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[18px] animate-spin">
                progress_activity
              </span>
            )}
            {!viaCepQuery.isFetching && cepDigits.length === 8 && !viaCepQuery.isError && viaCepQuery.data && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[18px]">
                check_circle
              </span>
            )}
            {viaCepQuery.isError && cepDigits.length === 8 && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                CEP não encontrado.
              </p>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center">
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:text-primary border border-outline-variant rounded-xl hover:border-primary transition-all bg-card"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list_off</span>
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {servicesQuery.isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-outline-variant overflow-hidden animate-pulse"
              >
                <div className="h-28 bg-muted" />
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

        {/* Error */}
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
              type="button"
              onClick={() => servicesQuery.refetch()}
              className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-90 transition-all text-sm shadow"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Empty state */}
        {!servicesQuery.isLoading && !servicesQuery.isError && services.length === 0 && (
          <div className="text-center py-20 bg-card rounded-2xl border border-outline-variant max-w-xl mx-auto px-6">
            <span className="material-symbols-outlined text-muted-foreground text-5xl mb-4 block">
              search_off
            </span>
            <h3 className="text-xl font-bold text-primary mb-2">Nenhum serviço encontrado</h3>
            <p className="text-muted-foreground text-base mb-6">
              Não localizamos serviços com os filtros selecionados. Tente ampliar a busca.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-90 transition-all text-sm shadow"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Service cards */}
        {!servicesQuery.isLoading && !servicesQuery.isError && services.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {services.length}{" "}
              {services.length === 1 ? "serviço encontrado" : "serviços encontrados"}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => svc.workerId && openModal(svc.workerId)}
                  className="bg-card rounded-xl border border-outline-variant overflow-hidden hover:shadow-xl hover:border-secondary/30 transition-all flex flex-col text-left cursor-pointer w-full"
                >
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

                    {svc.workerName && (
                      <p className="text-sm font-semibold text-secondary mb-2">
                        {svc.workerName}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="flex items-center gap-1 text-muted-foreground text-xs">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {svc.bairro}
                      </span>
                      {formatPrice(svc.price) && (
                        <span className="flex items-center gap-1 text-xs font-bold text-secondary">
                          <span className="material-symbols-outlined text-[15px]">payments</span>
                          {formatPrice(svc.price)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 flex-1">
                      {svc.description}
                    </p>

                    <div className="mt-6 w-full py-2.5 bg-secondary/10 text-secondary font-bold rounded-lg text-sm flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      Ver Perfil
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {workerId && (
        <WorkerDrawer workerId={workerId} open={Boolean(workerId)} onClose={closeModal} />
      )}
    </PageLayout>
  );
}
