import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { StarDisplay } from "../components/StarDisplay";
import { apiRequest } from "../lib/api";
import type { Service } from "../types";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

type Category = {
  id: string;
  name: string;
};

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

function FeaturedServiceCard({ svc }: { svc: Service }) {
  const avg = svc.avgScore != null ? svc.avgScore.toFixed(1) : null;
  const count = svc.ratingCount ?? 0;

  return (
    <Link
      to="/professionals"
      search={{ workerId: svc.workerId, category: undefined, q: undefined }}
      className="bg-card rounded-xl border border-outline-variant overflow-hidden hover:shadow-xl hover:border-secondary/30 transition-all flex flex-col no-underline group"
    >
      <div className="h-32 bg-primary/5 dark:bg-primary/10 flex items-center justify-center border-b border-outline-variant relative">
        <span className="material-symbols-outlined text-secondary text-6xl">
          {categoryIcon(svc.category)}
        </span>
        <span className="absolute top-3 right-3 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">
          {svc.category}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-primary mb-1 line-clamp-2 group-hover:text-secondary transition-colors">
          {svc.title}
        </h3>

        {svc.workerName && (
          <p className="text-sm font-semibold text-secondary mb-2">{svc.workerName}</p>
        )}

        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {svc.bairro}
          </span>
          {avg && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto shrink-0">
              <StarDisplay score={Math.round(parseFloat(avg))} size="sm" />
              <span className="font-semibold">{avg}</span>
              <span>({count})</span>
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{svc.description}</p>

        <div className="mt-5 w-full py-2.5 bg-secondary/10 text-secondary font-bold rounded-lg text-sm flex items-center justify-center gap-2 group-hover:bg-secondary group-hover:text-secondary-foreground transition-all">
          <span className="material-symbols-outlined text-[16px]">person</span>
          Ver Profissional
        </div>
      </div>
    </Link>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => apiRequest<Category[]>("/categories"),
    staleTime: 1000 * 60 * 10,
  });

  const popularQuery = useQuery<Service[]>({
    queryKey: ["home", "popular"],
    queryFn: () => apiRequest<Service[]>("/home/popular"),
    staleTime: 1000 * 60 * 5,
  });

  const categories = categoriesQuery.data ?? [];
  const featuredServices = (popularQuery.data ?? []).slice(0, 3);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    void navigate({
      to: "/professionals",
      search: {
        q: searchQ.trim() || undefined,
        workerId: undefined,
        category: undefined,
      },
    });
  }

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-muted/30 dark:bg-muted/10 border-b border-outline-variant py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-150 h-150 bg-primary-container rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-100 h-100 bg-secondary-container rounded-full blur-[100px]" />
          </div>
          <div className="max-w-300 mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight tracking-tight">
                Encontre os melhores profissionais para sua casa
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Pedreiros, faxineiras, pintores e muito mais — verificados e perto de você.
                Confiança e qualidade local.
              </p>

              <form
                onSubmit={handleSearch}
                className="bg-card p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,32,69,0.08)] flex flex-col md:flex-row gap-2 border border-outline-variant"
              >
                <div className="flex-1 flex items-center px-4 md:border-r border-outline-variant">
                  <span className="material-symbols-outlined text-primary mr-2">search</span>
                  <input
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    className="w-full border-none outline-none bg-transparent text-base py-4 text-foreground placeholder:text-muted-foreground"
                    placeholder="Qual serviço você precisa?"
                    type="text"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center"
                >
                  Buscar Profissional
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 max-w-300 mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary mb-8">Categorias Disponíveis</h2>

          {categoriesQuery.isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-card rounded-xl border border-outline-variant p-6 h-32" />
              ))}
            </div>
          )}

          {!categoriesQuery.isLoading && categories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to="/professionals"
                  search={{ category: cat.name, workerId: undefined, q: undefined }}
                  className="group bg-card p-6 rounded-xl border border-outline-variant hover:border-secondary hover:shadow-lg transition-all text-center no-underline"
                >
                  <div className="w-16 h-16 bg-muted dark:bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:bg-secondary/10 transition-colors">
                    <span className="material-symbols-outlined text-secondary text-3xl">
                      {categoryIcon(cat.name)}
                    </span>
                  </div>
                  <span className="text-base font-semibold block text-foreground">{cat.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 bg-card border-y border-outline-variant py-20"
        >
          <div className="max-w-300 mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-primary">Como Funciona</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
                Simplicidade e segurança do início ao fim do seu projeto residencial.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  icon: "search",
                  title: "Busque o serviço",
                  desc: "Selecione a categoria ou busque pelo nome e veja os profissionais disponíveis na sua região.",
                },
                {
                  step: "2",
                  icon: "star",
                  title: "Compare e avalie",
                  desc: "Veja avaliações reais de outros usuários, compare profissionais e escolha o melhor para você.",
                },
                {
                  step: "3",
                  icon: "handshake",
                  title: "Conecte-se",
                  desc: "Entre em contato com o profissional e contrate com segurança diretamente pelo Conecta Bairro.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2">{item.title}</h3>
                  <p className="text-base text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured services */}
        <section className="py-20 max-w-300 mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-primary">Serviços em Destaque</h2>
              <p className="text-lg text-muted-foreground">
                Profissionais reais prontos para te atender.
              </p>
            </div>
            <Link
              to="/professionals"
              search={{ workerId: undefined, category: undefined, q: undefined }}
              className="text-secondary font-bold flex items-center hover:underline no-underline whitespace-nowrap"
            >
              Ver todos
              <span className="material-symbols-outlined ml-1">arrow_forward</span>
            </Link>
          </div>

          {popularQuery.isLoading && (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-outline-variant overflow-hidden animate-pulse">
                  <div className="h-32 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!popularQuery.isLoading && featuredServices.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-outline-variant">
              <span className="material-symbols-outlined text-4xl text-muted-foreground block mb-3 opacity-40">
                handyman
              </span>
              <p className="text-muted-foreground">Nenhum serviço disponível no momento.</p>
            </div>
          )}

          {featuredServices.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredServices.map((svc) => (
                <FeaturedServiceCard key={svc.id} svc={svc} />
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section id="for-pros" className="scroll-mt-24 py-20 max-w-300 mx-auto px-6">
          <div className="bg-card border border-outline-variant rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-3xl font-bold text-primary mb-4">Você é um profissional?</h2>
              <p className="text-lg text-muted-foreground">
                Cadastre-se agora e aumente seus clientes. Tenha visibilidade na sua região e
                gerencie seus serviços em um só lugar.
              </p>
            </div>
            <Link
              to="/register"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-all shadow-md whitespace-nowrap no-underline"
            >
              Quero ser parceiro
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
