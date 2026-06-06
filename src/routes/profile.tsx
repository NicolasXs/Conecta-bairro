import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiRequest } from "../lib/api";
import {
  getAuthenticatedUserId,
  getCurrentUser,
  isAuthenticated,
  setCurrentUser,
  type AuthUser,
} from "../lib/auth";
import { ApiError } from "../lib/api";

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProfilePage,
});

type UserProfile = {
  id: string;
  email: string;
  name: string;
  role?: string;
  bairro?: string | null;
  cep?: string | null;
  cidade?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type UpdateProfilePayload = {
  name: string;
  bairro: string;
  cep: string;
  cidade: string;
  password?: string;
};

function formatDate(value?: string) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
}

function ProfilePage() {
  const userId = getAuthenticatedUserId();

  const [name, setName] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const profileQuery = useQuery<UserProfile>({
    queryKey: ["user-profile", userId],
    enabled: Boolean(userId),
    queryFn: () => apiRequest<UserProfile>(`/users/${userId}`),
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;

    setName(profile.name || "");
    setBairro(profile.bairro || "");
    setCidade(profile.cidade || "");
    setCep(profile.cep || "");
  }, [profileQuery.data]);

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      apiRequest<UserProfile>(`/users/${userId}`, {
        method: "PUT",
        body: payload,
      }),
    onSuccess: (updated) => {
      setMessage("Perfil atualizado com sucesso.");
      setErrorMessage(null);
      setPassword("");

      const cached = getCurrentUser();
      const merged: AuthUser = {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        bairro: updated.bairro,
        cidade: updated.cidade,
        cep: updated.cep,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        ...(cached ?? {}),
      };
      setCurrentUser(merged);

      profileQuery.refetch();
    },
    onError: (error) => {
      const defaultMessage = "Não foi possível atualizar seu perfil.";
      if (error instanceof ApiError) {
        setErrorMessage(error.message || defaultMessage);
      } else {
        setErrorMessage(defaultMessage);
      }
      setMessage(null);
    },
  });

  const isSubmitting = updateProfile.isPending;

  const canSubmit = useMemo(() => {
    const hasRequired =
      name.trim().length >= 2 && bairro.trim().length >= 2 && cidade.trim().length >= 2;
    const passwordIsValid = password.length === 0 || password.length >= 6;
    return hasRequired && passwordIsValid && !isSubmitting;
  }, [name, bairro, cidade, password, isSubmitting]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (!userId) {
      setErrorMessage("Não foi possível identificar o usuário autenticado.");
      return;
    }

    if (password && password.length < 6) {
      setErrorMessage("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    updateProfile.mutate({
      name: name.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      cep: cep.trim(),
      ...(password ? { password } : {}),
    });
  }

  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-300 mx-auto px-6">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-primary mb-3">Meu Perfil</h1>
            <p className="text-lg text-muted-foreground">
              Visualize e atualize seus dados pessoais cadastrados no Conecta Bairro.
            </p>
          </div>

          {!userId && (
            <div className="bg-card border border-outline-variant rounded-xl p-6 text-destructive font-medium">
              Não foi possível identificar o usuário autenticado. Faça login novamente.
            </div>
          )}

          {userId && profileQuery.isLoading && (
            <div className="bg-card border border-outline-variant rounded-xl p-6 animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          )}

          {userId && profileQuery.isError && (
            <div className="bg-card border border-outline-variant rounded-xl p-6">
              <p className="text-destructive font-medium mb-4">Erro ao carregar seu perfil.</p>
              <button
                onClick={() => profileQuery.refetch()}
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {userId && profileQuery.data && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <section className="lg:col-span-2 bg-card border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                <div className="border-b border-outline-variant bg-muted/20 px-6 py-5 md:px-8">
                  <h2 className="text-xl font-bold text-primary">Informações Pessoais</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Atualize seus dados de cadastro e localização.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                        Nome Completo
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                        placeholder="Seu nome"
                        minLength={2}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                        Bairro
                      </label>
                      <input
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                        placeholder="Seu bairro"
                        minLength={2}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                        Cidade
                      </label>
                      <input
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                        placeholder="Sua cidade"
                        minLength={2}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                        CEP
                      </label>
                      <input
                        value={cep}
                        onChange={(e) => setCep(e.target.value)}
                        className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                        placeholder="00000-000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                        Nova senha (deixe em branco para manter)
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                      />
                    </div>
                  </div>

                  {message && (
                    <div className="flex items-center gap-2 text-secondary bg-secondary/10 px-4 py-3 rounded-xl border border-secondary/20 text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {message}
                    </div>
                  )}
                  {errorMessage && (
                    <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-xl border border-destructive/20 text-sm font-semibold">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errorMessage}
                    </div>
                  )}

                  <div className="border-t border-outline-variant pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="px-6 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-bold hover:opacity-90 active:scale-95 transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                    >
                      {isSubmitting ? "Salvando alterações..." : "Salvar alterações"}
                    </button>
                  </div>
                </form>
              </section>

              <aside className="space-y-6">
                <div className="bg-card border border-outline-variant rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-primary border-b border-outline-variant pb-3 mb-4">
                    Resumo da conta
                  </h3>
                  <ul className="space-y-4 text-xs font-medium">
                    <li className="flex flex-col gap-1">
                      <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
                        E-mail de Login
                      </span>
                      <span className="text-foreground text-sm font-semibold break-all">
                        {profileQuery.data.email}
                      </span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
                        Criado em
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {formatDate(profileQuery.data.createdAt)}
                      </span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
                        Última atualização
                      </span>
                      <span className="text-foreground text-sm font-semibold">
                        {formatDate(profileQuery.data.updatedAt)}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/25 border border-outline-variant rounded-2xl p-6">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-primary text-2xl select-none">
                      shield_lock
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-primary mb-1">
                        Segurança e Privacidade
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Seus dados são transmitidos de forma criptografada para nossos servidores de
                        altíssima segurança. Nós respeitamos sua privacidade.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
