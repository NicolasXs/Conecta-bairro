import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Bem-vindo ao Conecta Bairro</h1>
    </main>
  )
}
