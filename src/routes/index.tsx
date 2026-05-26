import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const categories = [
  { icon: "construction", label: "Pedreiro" },
  { icon: "cleaning_services", label: "Limpeza" },
  { icon: "format_paint", label: "Pintura" },
  { icon: "electrical_services", label: "Eletricista" },
  { icon: "plumbing", label: "Encanador" },
  { icon: "yard", label: "Jardinagem" },
];

const professionals = [
  {
    name: "Ricardo Silva",
    specialty: "Especialista em Alvenaria",
    rating: "4.9",
    description: "Mais de 15 anos de experiência em reformas estruturais e acabamentos finos.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=face",
  },
  {
    name: "Ana Paula",
    specialty: "Limpeza Especializada",
    rating: "5.0",
    description: "Especialista em higienização profunda e organização de ambientes residenciais.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=400&fit=crop&crop=face",
  },
  {
    name: "Marcos Vinícius",
    specialty: "Pintura e Texturização",
    rating: "4.8",
    description: "Transformo ambientes com técnicas modernas de pintura e aplicação de massa.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=400&fit=crop&crop=face",
  },
];

function LandingPage() {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-card py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-container rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-container rounded-full blur-[100px]" />
          </div>
          <div className="max-w-[1200px] mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight tracking-tight">
                Encontre os melhores profissionais para sua casa
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Pedreiros, faxineiras, pintores e muito mais, verificados e perto de você. Confiança
                e qualidade local.
              </p>

              {/* Search Bar */}
              <div className="bg-white p-2 rounded-xl shadow-[0px_4px_12px_rgba(0,32,69,0.08)] flex flex-col md:flex-row gap-2 border border-outline-variant">
                <div className="flex-1 flex items-center px-4 md:border-r border-outline-variant">
                  <span className="material-symbols-outlined text-primary mr-2">search</span>
                  <input
                    className="w-full border-none outline-none bg-transparent text-base py-4 text-foreground placeholder:text-muted-foreground"
                    placeholder="Qual serviço você precisa?"
                    type="text"
                  />
                </div>
                <div className="flex-1 flex items-center px-4">
                  <span className="material-symbols-outlined text-primary mr-2">location_on</span>
                  <input
                    className="w-full border-none outline-none bg-transparent text-base py-4 text-foreground placeholder:text-muted-foreground"
                    placeholder="Localização"
                    type="text"
                  />
                </div>
                <button className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center">
                  Buscar Profissional
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary mb-8">Categorias Populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="group bg-surface-container-low p-6 rounded-xl border border-outline-variant hover:border-secondary hover:shadow-lg transition-all cursor-pointer text-center"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-secondary text-3xl">
                    {cat.icon}
                  </span>
                </div>
                <span className="text-base font-semibold block text-foreground">{cat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="scroll-mt-24 bg-surface-container-highest py-20">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-primary">Como Funciona</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
                Simplicidade e segurança do início ao fim do seu projeto residencial.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "1",
                  title: "Busque o serviço",
                  desc: "Selecione a categoria e veja os profissionais disponíveis na sua região.",
                },
                {
                  step: "2",
                  title: "Compare profissionais",
                  desc: "Veja avaliações reais, fotos de trabalhos anteriores e peça orçamentos.",
                },
                {
                  step: "3",
                  title: "Contrate com segurança",
                  desc: "Pagamento facilitado e garantia de um serviço bem executado por experts.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2">{item.title}</h3>
                  <p className="text-base text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verified Professionals */}
        <section className="py-20 max-w-[1200px] mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-primary">Profissionais Verificados</h2>
              <p className="text-lg text-muted-foreground">
                Os especialistas mais bem avaliados desta semana.
              </p>
            </div>
            <a
              href="#"
              className="text-secondary font-bold flex items-center hover:underline no-underline"
            >
              Ver todos <span className="material-symbols-outlined ml-1">arrow_forward</span>
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {professionals.map((pro) => (
              <div
                key={pro.name}
                className="bg-white rounded-xl border border-outline-variant overflow-hidden hover:shadow-xl transition-all"
              >
                <img src={pro.img} alt={pro.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-primary">{pro.name}</h3>
                    <div className="flex items-center bg-secondary-container px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-secondary text-sm mr-1">
                        star
                      </span>
                      <span className="text-on-secondary-container font-bold text-sm">
                        {pro.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-secondary font-bold text-sm mb-4">{pro.specialty}</p>
                  <p className="text-base text-muted-foreground mb-6 line-clamp-2">
                    {pro.description}
                  </p>
                  <button className="w-full py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                    Ver Perfil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Professional CTA */}
        <section id="for-pros" className="scroll-mt-24 bg-primary text-primary-foreground py-16">
          <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">Você é um profissional?</h2>
              <p className="text-lg text-primary-foreground/90">
                Cadastre-se agora e aumente seus clientes. Tenha visibilidade na sua região e
                gerencie seus pedidos em um só lugar.
              </p>
            </div>
            <Link
              to="/register"
              className="bg-secondary-fixed text-on-secondary-fixed px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-transform shadow-lg whitespace-nowrap no-underline"
            >
              Quero ser parceiro
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
