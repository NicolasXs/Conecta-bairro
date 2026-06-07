import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { useRegisterMutation } from '../hooks/use-auth'
import { isAuthenticated } from '../lib/auth'
import { ApiError } from '../lib/api'
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
    name: z
      .string()
      .trim()
      .min(1, 'Este campo é obrigatório.')
      .min(2, 'Informe pelo menos 2 caracteres.')
      .max(100, 'Informe no máximo 100 caracteres.'),
    email: z
      .string()
      .trim()
      .min(1, 'Este campo é obrigatório.')
      .email('Insira um e-mail válido.'),
    cep: z
      .string()
      .trim()
      .min(1, 'Este campo é obrigatório.')
      .regex(/^\d{5}-?\d{3}$/, 'Insira um CEP válido.'),
    bairro: z
      .string()
      .trim()
      .min(1, 'Este campo é obrigatório.')
      .min(2, 'Informe pelo menos 2 caracteres.')
      .max(120, 'Informe no máximo 120 caracteres.'),
    cidade: z
      .string()
      .trim()
      .min(1, 'Este campo é obrigatório.')
      .min(2, 'Informe pelo menos 2 caracteres.')
      .max(120, 'Informe no máximo 120 caracteres.'),
    password: z
      .string()
      .min(1, 'Este campo é obrigatório.')
      .min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Este campo é obrigatório.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

type ViaCepResponse = {
  bairro?: string
  localidade?: string
  erro?: boolean
}

function formatCep(value: string): string {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 8)

  if (digitsOnly.length <= 5) {
    return digitsOnly
  }

  return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`
}

function getCepDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8)
}

function RegisterPage() {
  const router = useRouter()
  const registerMutation = useRegisterMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      cep: '',
      bairro: '',
      cidade: '',
      password: '',
      confirmPassword: '',
    },
  })

  const cepValue = form.watch('cep')
  const bairroValue = form.watch('bairro')
  const cidadeValue = form.watch('cidade')
  const cepDigits = getCepDigits(cepValue)

  const viaCepQuery = useQuery({
    queryKey: ['viacep', cepDigits],
    enabled: cepDigits.length === 8,
    retry: false,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)

      if (!response.ok) {
        throw new Error('Falha ao consultar o CEP.')
      }

      const data = (await response.json()) as ViaCepResponse

      if (data.erro) {
        throw new Error('CEP não encontrado.')
      }

      return data
    },
  })

  useEffect(() => {
    if (!viaCepQuery.data) {
      return
    }

    if (viaCepQuery.data.bairro) {
      const currentBairro = bairroValue.trim().toLowerCase()
      const viaCepBairro = viaCepQuery.data.bairro.trim().toLowerCase()

      if (!currentBairro || currentBairro === viaCepBairro) {
        form.setValue('bairro', viaCepQuery.data.bairro, {
          shouldDirty: !currentBairro,
          shouldTouch: true,
          shouldValidate: true,
        })
      }
    }

    if (viaCepQuery.data.localidade) {
      const currentCidade = cidadeValue.trim().toLowerCase()
      const viaCepCidade = viaCepQuery.data.localidade.trim().toLowerCase()

      if (!currentCidade || currentCidade === viaCepCidade) {
        form.setValue('cidade', viaCepQuery.data.localidade, {
          shouldDirty: !currentCidade,
          shouldTouch: true,
          shouldValidate: true,
        })
      }
    }
  }, [bairroValue, cidadeValue, form, viaCepQuery.data])

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    try {
      await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        cep: values.cep,
        bairro: values.bairro,
        cidade: values.cidade,
        password: values.password,
      })
      router.navigate({ to: '/dashboard' })
    } catch (err: unknown) {
      const error = err as Error & { status?: number }
      if (error.status === 409) {
        setServerError(
          'Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.',
        )
      } else if (error.status === 400 || error.status === 422) {
        setServerError('Dados inválidos. Revise os campos e tente novamente.')
      } else if (error instanceof ApiError) {
        setServerError(error.message)
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
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
                        onChange={(event) => {
                          field.onChange(formatCep(event.target.value))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {viaCepQuery.isFetching && cepDigits.length === 8 && (
                      <p className="text-xs text-muted-foreground">Buscando endereco do CEP...</p>
                    )}
                    {!viaCepQuery.isFetching && viaCepQuery.isError && cepDigits.length === 8 && (
                      <p className="text-xs text-destructive">Nao foi possivel localizar esse CEP.</p>
                    )}
                    {viaCepQuery.data && !viaCepQuery.isError && (
                      <p className="text-xs text-muted-foreground">
                        Bairro: {viaCepQuery.data.bairro || 'Nao informado'} | Cidade:{' '}
                        {viaCepQuery.data.localidade || 'Nao informada'}
                      </p>
                    )}
                  </FormItem>
                )}
              />

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
            <Link
              to="/login"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
