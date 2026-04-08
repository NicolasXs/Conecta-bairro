import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  Link,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLogout } from '../hooks/use-auth'
import { isAuthenticated } from '../lib/auth'

import '../styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function RootLayout() {
  const logout = useLogout()
  const authenticated = isAuthenticated()

  return (
    <>
      {authenticated && (
        <nav className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <Link to="/" className="text-sm font-semibold text-foreground">
            Conecta Bairro
          </Link>
          <button
            onClick={logout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Sair da conta"
          >
            Sair
          </button>
        </nav>
      )}
      <Outlet />
    </>
  )
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Conecta Bairro' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <RootLayout />
      </QueryClientProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
