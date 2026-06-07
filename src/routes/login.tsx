import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
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
import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
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

function LoginPage() {
  const router = useRouter();
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
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <AnimatedGridPattern
        className="absolute inset-0 -z-10 opacity-30 mask-[radial-gradient(600px_circle_at_center,white,transparent)]"
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
      />

      <Card className="w-full max-w-100 shadow-lg rounded-xl bg-card">
        <CardHeader className="pb-2 pt-8 px-8">
          <div className="text-center mb-6">
            <p className="text-[30px] font-semibold leading-[1.1] text-foreground">
              Conecta Bairro 🏘️
            </p>
            <p className="text-sm text-muted-foreground mt-1">Serviços perto de você</p>
          </div>
          <h1 className="text-2xl font-semibold text-foreground text-center">Entrar</h1>
        </CardHeader>

        <CardContent className="px-8 pb-4">
          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              aria-busy={isLoading}
              className="space-y-6"
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
                    <FormLabel>Senha</FormLabel>
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

              <div className="flex justify-end -mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-primary h-auto p-0 text-sm"
                  disabled
                >
                  Esqueci minha senha
                </Button>
              </div>

              <ShimmerButton
                type="submit"
                className="w-full h-11 text-sm font-medium"
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
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-8 pb-8">
          <Separator />
          <p className="text-sm text-muted-foreground text-center">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
