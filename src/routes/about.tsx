import { createFileRoute } from '@tanstack/react-router'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-300 mx-auto px-6">
          <h1 className="text-4xl font-bold text-primary mb-4">Sobre o Conecta Bairro</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Conecta Bairro é uma plataforma que conecta moradores a profissionais de confiança da
            sua região — pedreiros, pintores, eletricistas e muito mais.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
