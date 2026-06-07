import { createFileRoute, Link, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useLoginMutation } from "../hooks/use-auth";
import { isAuthenticated } from "../lib/auth";
import { ApiError } from "../lib/api";
import { AnimatedGridPattern } from "../components/magic-ui/animated-grid-pattern";
import { ShimmerButton } from "../components/magic-ui/shimmer-button";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().min(1, "Este campo é obrigatório.").email("Insira um e-mail válido."),
  password: z
    .string()
    .min(1, "Este campo é obrigatório.")
    .min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: "handyman", label: "Profissionais de todos os serviços" },
  { icon: "star", label: "Avaliações reais de clientes" },
  { icon: "location_on", label: "Conectado ao seu bairro" },
];

function LoginPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await loginMutation.mutateAsync(values);
      router.navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const error = err as Error & { status?: number };
      if (error.status === 401) {
        setServerError("E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
      } else if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError("Erro de conexão. Verifique sua internet e tente novamente.");
      }
    }
  }

  const isLoading = loginMutation.isPending;

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
            Serviços de confiança perto de você
          </h2>
          <p className="text-white/70 text-base mb-10">
            Encontre profissionais do seu bairro e contrate com segurança.
          </p>
          <ul className="space-y-4">
            {FEATURES.map(({ icon, label }) => (
              <li key={icon} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    {icon}
                  </span>
                </span>
                <span className="text-white/90 text-sm font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} Conecta Bairro
        </p>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 items-center justify-center bg-background px-6 py-12">
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
            <h1 className="text-3xl font-bold text-foreground">Entrar</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Bem-vindo de volta! Acesse sua conta.
            </p>
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
              className="space-y-5"
            >
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Senha</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        aria-required="true"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ShimmerButton
                type="submit"
                className="w-full h-11 text-sm font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando…
                  </>
                ) : (
                  "Entrar"
                )}
              </ShimmerButton>
            </form>
          </Form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold underline-offset-4 hover:underline"
            >
              Criar conta grátis
            </Link>
          </p>
          <div className="flex justify-center m-2 cursor-pointer">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer text-muted-foreground h-auto p-0 text-xs hover:text-primary"
              onClick={() => navigate({ to: "/esqueci-senha" })}
            >
              Esqueci minha senha
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
