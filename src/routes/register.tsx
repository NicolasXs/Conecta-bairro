import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { formatCep, getCepDigits, fetchViaCep } from "../lib/cep";

import { useRegisterMutation } from "../hooks/use-auth";
import { isAuthenticated } from "../lib/auth";
import { ApiError } from "../lib/api";
import { AnimatedGridPattern } from "../components/magic-ui/animated-grid-pattern";
import { ShimmerButton } from "../components/magic-ui/shimmer-button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";

export const Route = createFileRoute("/register")({
  beforeLoad: async () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/" });
    }
  },
  component: RegisterPage,
});

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Este campo é obrigatório.")
      .min(2, "Informe pelo menos 2 caracteres.")
      .max(100, "Informe no máximo 100 caracteres."),
    email: z.string().trim().min(1, "Este campo é obrigatório.").email("Insira um e-mail válido."),
    cep: z
      .string()
      .trim()
      .min(1, "Este campo é obrigatório.")
      .regex(/^\d{5}-?\d{3}$/, "Insira um CEP válido."),
    bairro: z
      .string()
      .trim()
      .min(1, "Este campo é obrigatório.")
      .min(2, "Informe pelo menos 2 caracteres.")
      .max(120, "Informe no máximo 120 caracteres."),
    cidade: z
      .string()
      .trim()
      .min(1, "Este campo é obrigatório.")
      .min(2, "Informe pelo menos 2 caracteres.")
      .max(120, "Informe no máximo 120 caracteres."),
    password: z
      .string()
      .min(1, "Este campo é obrigatório.")
      .min(6, "A senha precisa ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Este campo é obrigatório."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;


const STEPS = ["Dados pessoais", "Localização", "Senha"];

function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      cep: "",
      bairro: "",
      cidade: "",
      password: "",
      confirmPassword: "",
    },
  });

  const cepValue = form.watch("cep");
  const bairroValue = form.watch("bairro");
  const cidadeValue = form.watch("cidade");
  const cepDigits = getCepDigits(cepValue);

  const viaCepQuery = useQuery({
    queryKey: ["viacep", cepDigits],
    enabled: cepDigits.length === 8,
    retry: false,
    staleTime: 1000 * 60 * 10,
    queryFn: () => fetchViaCep(cepDigits),
  });

  useEffect(() => {
    if (!viaCepQuery.data) return;

    if (viaCepQuery.data.bairro) {
      const currentBairro = bairroValue.trim().toLowerCase();
      const viaCepBairro = viaCepQuery.data.bairro.trim().toLowerCase();
      if (!currentBairro || currentBairro === viaCepBairro) {
        form.setValue("bairro", viaCepQuery.data.bairro, {
          shouldDirty: !currentBairro,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }

    if (viaCepQuery.data.localidade) {
      const currentCidade = cidadeValue.trim().toLowerCase();
      const viaCepCidade = viaCepQuery.data.localidade.trim().toLowerCase();
      if (!currentCidade || currentCidade === viaCepCidade) {
        form.setValue("cidade", viaCepQuery.data.localidade, {
          shouldDirty: !currentCidade,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }
  }, [bairroValue, cidadeValue, form, viaCepQuery.data]);

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        cep: values.cep,
        bairro: values.bairro,
        cidade: values.cidade,
        password: values.password,
      });
      router.navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const error = err as Error & { status?: number };
      if (error.status === 409) {
        setServerError("Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.");
      } else if (error.status === 400 || error.status === 422) {
        setServerError("Dados inválidos. Revise os campos e tente novamente.");
      } else if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError("Erro de conexão. Verifique sua internet e tente novamente.");
      }
    }
  }

  const isLoading = registerMutation.isPending;

  return (
    <div className="min-h-screen flex">
      {/* ── Brand panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-primary dark:bg-[oklch(0.16_0.025_253)] px-12 py-10">
        <Link to="/" className="no-underline">
          <span className="text-2xl font-bold text-white tracking-tight">
            Conecta Bairro
          </span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Crie sua conta e comece hoje
          </h2>
          <p className="text-white/70 text-base mb-10">
            Cadastre-se gratuitamente e acesse os melhores profissionais do seu bairro.
          </p>

          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-secondary-foreground text-sm font-bold">
                  {i + 1}
                </span>
                <span className="text-white/90 text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} Conecta Bairro
        </p>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 items-start justify-center bg-background px-6 py-12 overflow-y-auto">
        <AnimatedGridPattern
          className="absolute inset-0 -z-10 opacity-30 mask-[radial-gradient(600px_circle_at_center,white,transparent)]"
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
        />

        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="no-underline">
              <span className="text-2xl font-bold text-primary">Conecta Bairro</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Criar conta</h1>
            <p className="text-muted-foreground text-sm mt-1">Preencha os dados abaixo para começar.</p>
          </div>

          {serverError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              aria-busy={isLoading}
              className="space-y-4"
            >
              {/* Dados pessoais */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">
                Dados pessoais
              </p>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Seu nome completo"
                        autoComplete="name"
                        aria-required="true"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        autoComplete="email"
                        aria-required="true"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Localização */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-3">
                Localização
              </p>

              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="00000-000"
                        autoComplete="postal-code"
                        inputMode="numeric"
                        maxLength={9}
                        aria-required="true"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(formatCep(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                    {viaCepQuery.isFetching && cepDigits.length === 8 && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Buscando endereço…
                      </p>
                    )}
                    {!viaCepQuery.isFetching && viaCepQuery.isError && cepDigits.length === 8 && (
                      <p className="text-xs text-destructive mt-1">
                        Não foi possível localizar este CEP.
                      </p>
                    )}
                    {viaCepQuery.data && !viaCepQuery.isError && (
                      <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        {viaCepQuery.data.bairro || "—"}, {viaCepQuery.data.localidade || "—"}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Seu bairro"
                          autoComplete="address-level3"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Sua cidade"
                          autoComplete="address-level2"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Senha */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-3">
                Senha
              </p>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          aria-required="true"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          aria-required="true"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <ShimmerButton
                type="submit"
                className="w-full h-11 text-sm font-semibold mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta…
                  </>
                ) : (
                  "Criar conta grátis"
                )}
              </ShimmerButton>
            </form>
          </Form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
