import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ApiError } from "../../lib/api";
import { formatPrice } from "../../lib/utils";
import type { Service, Category } from "../../types";

type CreateServicePayload = {
  title: string;
  description: string;
  category: string;
  bairro: string;
  price?: number | null;
};

type UpdateServicePayload = {
  title?: string;
  description?: string;
  category?: string;
  bairro?: string;
  price?: number | null;
};

type Props = {
  services: Service[];
  servicesLoading: boolean;
  categories: Category[];
  userId: string;
  defaultBairro: string;
};

export function ServicesSection({
  services,
  servicesLoading,
  categories,
  userId,
  defaultBairro,
}: Props) {
  const queryClient = useQueryClient();

  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [svcTitle, setSvcTitle] = useState("");
  const [svcDescription, setSvcDescription] = useState("");
  const [svcCategory, setSvcCategory] = useState("");
  const [svcBairro, setSvcBairro] = useState(defaultBairro);
  const [svcPrice, setSvcPrice] = useState("");
  const [svcMessage, setSvcMessage] = useState<string | null>(null);
  const [svcError, setSvcError] = useState<string | null>(null);

  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editBairro, setEditBairro] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const createService = useMutation({
    mutationFn: (payload: CreateServicePayload) =>
      apiRequest<Service>("/services", { method: "POST", body: payload }),
    onSuccess: () => {
      setSvcMessage("Serviço criado com sucesso.");
      setSvcError(null);
      setSvcTitle("");
      setSvcDescription("");
      setSvcCategory("");
      setSvcBairro(defaultBairro);
      setServiceFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ["services", { workerId: userId }] });
    },
    onError: (error) => {
      const defaultMessage = "Não foi possível criar o serviço.";
      setSvcError(error instanceof ApiError ? error.message || defaultMessage : defaultMessage);
      setSvcMessage(null);
    },
  });

  const deleteService = useMutation({
    mutationFn: (serviceId: string) =>
      apiRequest(`/services/${serviceId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", { workerId: userId }] });
    },
  });

  const updateService = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServicePayload }) =>
      apiRequest<Service>(`/services/${id}`, { method: "PUT", body: payload }),
    onSuccess: () => {
      setEditingServiceId(null);
      setEditError(null);
      queryClient.invalidateQueries({ queryKey: ["services", { workerId: userId }] });
    },
    onError: (error) => {
      const defaultMessage = "Não foi possível atualizar o serviço.";
      setEditError(error instanceof ApiError ? error.message || defaultMessage : defaultMessage);
    },
  });

  const canCreateService =
    svcTitle.trim().length >= 2 &&
    svcDescription.trim().length >= 2 &&
    svcCategory.length > 0 &&
    svcBairro.trim().length >= 2 &&
    !createService.isPending;

  const canUpdateService =
    editTitle.trim().length >= 2 &&
    editDescription.trim().length >= 2 &&
    editCategory.length > 0 &&
    editBairro.trim().length >= 2 &&
    !updateService.isPending;

  function openEditService(svc: Service) {
    setEditingServiceId(svc.id);
    setEditTitle(svc.title);
    setEditDescription(svc.description);
    setEditCategory(svc.category);
    setEditBairro(svc.bairro);
    setEditPrice(svc.price != null ? String(svc.price) : "");
    setEditError(null);
  }

  function handleCreateService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSvcMessage(null);
    setSvcError(null);
    const parsedPrice = svcPrice ? parseFloat(svcPrice) : undefined;
    createService.mutate({
      title: svcTitle.trim(),
      description: svcDescription.trim(),
      category: svcCategory,
      bairro: svcBairro.trim(),
      price: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : null,
    });
  }

  function handleUpdateService(e: React.FormEvent<HTMLFormElement>, serviceId: string) {
    e.preventDefault();
    setEditError(null);
    const parsedPrice = editPrice ? parseFloat(editPrice) : undefined;
    updateService.mutate({
      id: serviceId,
      payload: {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory,
        bairro: editBairro.trim(),
        price: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : null,
      },
    });
  }

  return (
    <section className="bg-card border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
      <div className="border-b border-outline-variant bg-muted/20 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-primary">Meus Serviços</h2>
        <button
          onClick={() => {
            setSvcMessage(null);
            setSvcError(null);
            setServiceFormOpen((v) => !v);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">
            {serviceFormOpen ? "close" : "add"}
          </span>
          {serviceFormOpen ? "Cancelar" : "Novo serviço"}
        </button>
      </div>

      {serviceFormOpen && (
        <form
          onSubmit={handleCreateService}
          className="border-b border-outline-variant p-6 space-y-4 bg-muted/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                Título *
              </label>
              <input
                value={svcTitle}
                onChange={(e) => setSvcTitle(e.target.value)}
                placeholder="Ex: Instalação elétrica residencial"
                className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                Descrição *
              </label>
              <textarea
                value={svcDescription}
                onChange={(e) => setSvcDescription(e.target.value)}
                placeholder="Descreva o serviço que você oferece..."
                rows={3}
                className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                Categoria *
              </label>
              <select
                value={svcCategory}
                onChange={(e) => setSvcCategory(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary cursor-pointer transition-all text-sm text-foreground"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                Bairro de atendimento *
              </label>
              <input
                value={svcBairro}
                onChange={(e) => setSvcBairro(e.target.value)}
                placeholder="Bairro onde você atende"
                className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">
                Valor cobrado (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={svcPrice}
                onChange={(e) => setSvcPrice(e.target.value)}
                placeholder="Ex: 150.00 (opcional)"
                className="w-full px-4 py-3 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
              />
            </div>
          </div>

          {svcMessage && (
            <div className="flex items-center gap-2 text-secondary bg-secondary/10 px-4 py-3 rounded-xl border border-secondary/20 text-sm font-semibold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {svcMessage}
            </div>
          )}
          {svcError && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-xl border border-destructive/20 text-sm font-semibold">
              <span className="material-symbols-outlined text-sm">error</span>
              {svcError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canCreateService}
              className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold hover:opacity-90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createService.isPending ? "Criando..." : "Criar serviço"}
            </button>
          </div>
        </form>
      )}

      {servicesLoading ? (
        <div className="p-6 animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="px-6 py-14 text-center text-muted-foreground text-sm">
          <span className="material-symbols-outlined text-4xl block mb-3 opacity-40">
            handyman
          </span>
          Você ainda não tem serviços cadastrados.
        </div>
      ) : (
        <div className="divide-y divide-outline-variant">
          {services.map((svc) =>
            editingServiceId === svc.id ? (
              <form
                key={svc.id}
                onSubmit={(e) => handleUpdateService(e, svc.id)}
                className="px-6 py-5 space-y-4 bg-muted/10"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Editando serviço
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Título *"
                      className="w-full px-4 py-2.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Descrição *"
                      rows={2}
                      className="w-full px-4 py-2.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground resize-none"
                      required
                    />
                  </div>
                  <div>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary cursor-pointer transition-all text-sm text-foreground"
                      required
                    >
                      <option value="">Categoria *</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      value={editBairro}
                      onChange={(e) => setEditBairro(e.target.value)}
                      placeholder="Bairro de atendimento *"
                      className="w-full px-4 py-2.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="Valor (R$) — opcional"
                      className="w-full px-4 py-2.5 bg-card border border-outline-variant rounded-xl outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-sm text-foreground"
                    />
                  </div>
                </div>
                {editError && (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-3 rounded-xl border border-destructive/20 text-sm font-semibold">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {editError}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingServiceId(null)}
                    className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!canUpdateService}
                    className="px-5 py-2 rounded-xl bg-secondary text-secondary-foreground font-bold hover:opacity-90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateService.isPending ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            ) : (
              <div key={svc.id} className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">{svc.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {svc.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">location_on</span>
                        {svc.bairro}
                      </p>
                      {formatPrice(svc.price) && (
                        <span className="text-xs font-bold text-secondary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">payments</span>
                          {formatPrice(svc.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full">
                      {svc.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditService(svc)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-all"
                      title="Editar serviço"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteService.mutate(svc.id)}
                      disabled={deleteService.isPending}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                      title="Remover serviço"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}
