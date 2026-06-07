import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "../../lib/api";
import { getCurrentUser, setCurrentUser, type AuthUser } from "../../lib/auth";
import type { UserProfile, ContactLink } from "../../types";

type UpdateProfilePayload = {
  name?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bairro?: string;
  cep?: string;
  cidade?: string;
  description?: string;
  contactLinks?: ContactLink[];
  password?: string;
};

type Props = {
  profile: UserProfile;
  userId: string;
};

export function ProfileEditForm({ profile, userId }: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState(profile.name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl || "");
  const [bairro, setBairro] = useState(profile.bairro || "");
  const [cidade, setCidade] = useState(profile.cidade || "");
  const [cep, setCep] = useState(profile.cep || "");
  const [description, setDescription] = useState(profile.description || "");
  const [contactLinks, setContactLinks] = useState<ContactLink[]>(profile.contactLinks ?? []);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  useEffect(() => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepError("");
      return;
    }
    setCepLoading(true);
    setCepError("");
    fetch(`https://viacep.com.br/ws/${digits}/json/`)
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) {
          setCepError("CEP não encontrado.");
        } else {
          if (data.bairro) setBairro(data.bairro);
          if (data.localidade) setCidade(data.localidade);
        }
      })
      .catch(() => setCepError("Erro ao consultar o CEP."))
      .finally(() => setCepLoading(false));
  }, [cep]);

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      apiRequest<UserProfile>(`/users/${userId}`, { method: "PUT", body: payload }),
    onSuccess: (updated) => {
      setMessage("Perfil atualizado com sucesso.");
      setErrorMessage(null);
      setPassword("");
      const cached = getCurrentUser();
      const merged: AuthUser = {
        ...(cached ?? {}),
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
        coverUrl: updated.coverUrl,
        bairro: updated.bairro,
        cidade: updated.cidade,
        cep: updated.cep,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
      setCurrentUser(merged);
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
    onError: (error) => {
      const defaultMessage = "Não foi possível atualizar seu perfil.";
      setErrorMessage(
        error instanceof ApiError ? error.message || defaultMessage : defaultMessage,
      );
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
    if (password && password.length < 6) {
      setErrorMessage("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    updateProfile.mutate({
      name: name.trim(),
      avatarUrl: avatarUrl.trim() || null,
      coverUrl: coverUrl.trim() || null,
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      cep: cep.trim(),
      description: description.trim() || undefined,
      contactLinks: contactLinks.length > 0 ? contactLinks : undefined,
      ...(password ? { password } : {}),
    });
  }

  return (
    <section className="bg-card border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
      <div className="border-b border-outline-variant bg-muted/20 px-6 py-5 md:px-8">
        <h2 className="text-xl font-bold text-primary">Editar Informações</h2>
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
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
              URL do Avatar
            </label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted border border-outline-variant flex items-center justify-center shrink-0 overflow-hidden">
                {avatarUrl.trim() ? (
                  <img
                    src={avatarUrl.trim()}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-muted-foreground text-xl">
                    person
                  </span>
                )}
              </div>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                placeholder="https://exemplo.com/foto.jpg"
                type="url"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
              URL da Capa
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-10 rounded-lg bg-muted border border-outline-variant shrink-0 overflow-hidden">
                {coverUrl.trim() ? (
                  <img
                    src={coverUrl.trim()}
                    alt="Preview da capa"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary/10 via-secondary/10 to-secondary/20" />
                )}
              </div>
              <input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                placeholder="https://exemplo.com/capa.jpg"
                type="url"
              />
            </div>
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
            <div className="relative">
              <input
                value={cep}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                  const masked =
                    digits.length > 5
                      ? `${digits.slice(0, 5)}-${digits.slice(5)}`
                      : digits;
                  setCep(masked);
                }}
                className="w-full px-4 py-3 pr-10 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                placeholder="00000-000"
                maxLength={9}
              />
              {cepLoading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[18px] animate-spin">
                  progress_activity
                </span>
              )}
              {!cepLoading && cep.replace(/\D/g, "").length === 8 && !cepError && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[18px]">
                  check_circle
                </span>
              )}
            </div>
            {cepError && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {cepError}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
              Sobre você (bio)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={600}
              placeholder="Descreva sua experiência, especialidades..."
              className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {description.length}/600
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Links de contato
              </label>
              {contactLinks.length < 10 && (
                <button
                  type="button"
                  onClick={() =>
                    setContactLinks((prev) => [...prev, { label: "", value: "" }])
                  }
                  className="text-xs text-secondary font-semibold hover:underline"
                >
                  + Adicionar
                </button>
              )}
            </div>
            <div className="space-y-2">
              {contactLinks.map((link, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={link.label}
                    onChange={(e) =>
                      setContactLinks((prev) =>
                        prev.map((l, idx) =>
                          idx === i ? { ...l, label: e.target.value } : l,
                        ),
                      )
                    }
                    placeholder="Rótulo (ex: WhatsApp)"
                    maxLength={50}
                    className="w-1/3 px-3 py-2 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary text-sm text-foreground"
                  />
                  <input
                    value={link.value}
                    onChange={(e) =>
                      setContactLinks((prev) =>
                        prev.map((l, idx) =>
                          idx === i ? { ...l, value: e.target.value } : l,
                        ),
                      )
                    }
                    placeholder="URL ou número"
                    maxLength={300}
                    className="flex-1 px-3 py-2 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary text-sm text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setContactLinks((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
              {contactLinks.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhum link adicionado.</p>
              )}
            </div>
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
  );
}
