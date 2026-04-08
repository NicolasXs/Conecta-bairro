import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { useRegisterMutation } from '../hooks/use-auth'
import { isAuthenticated } from '../lib/auth'
import { AnimatedGridPattern } from '../components/magic-ui/animated-grid-pattern'
import { ShimmerButton } from '../components/magic-ui/shimmer-button'
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Separator } from '../components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form'

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    if (isAuthenticated()) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Este campo é obrigatório.')
      .email('Insira um e-mail válido.'),
    password: z
      .string()
      .min(1, 'Este campo é obrigatório.')
      .min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Este campo é obrigatório.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

function RegisterPage() {
  const router = useRouter()
  const registerMutation = useRegisterMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    try {
      await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
      })
      router.navigate({ to: '/' })
    } catch (err: unknown) {
      const error = err as Error & { status?: number }
      if (error.status === 409 || error.status === 422) {
        setServerError(
          'Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.',
        )
      } else {
        setServerError(
          'Erro de conexão. Verifique sua internet e tente novamente.',
        )
      }
    }
  }

  const isLoading = registerMutation.isPending

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <AnimatedGridPattern
        className="absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
      />

      <Card className="w-full max-w-[400px] shadow-lg rounded-xl bg-card">
        <CardHeader className="pb-2 pt-8 px-8">
          <div className="text-center mb-6">
            <p className="text-[30px] font-semibold leading-[1.1] text-foreground">
              Conecta Bairro 🏘️
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Serviços perto de você
            </p>
          </div>
          <h1 className="text-2xl font-semibold text-foreground text-center">
            Criar conta
          </h1>
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
                    <FormLabel>Confirmar senha</FormLabel>
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

              <ShimmerButton
                type="submit"
                className="w-full h-11 text-sm font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta…
                  </>
                ) : (
                  'Criar conta'
                )}
              </ShimmerButton>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-8 pb-8">
          <Separator />
          <p className="text-sm text-muted-foreground text-center">
            Já tem uma conta?{' '}
            <a
              href="/login"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Entrar
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
