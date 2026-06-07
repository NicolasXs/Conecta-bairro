import { createFileRoute } from "@tanstack/react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const Route = createFileRoute("/politica-de-privacidade")({
  component: PoliticaDePrivacidadePage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-primary mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">{children}</div>
    </section>
  );
}

function PoliticaDePrivacidadePage() {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Última atualização: {new Date().toLocaleDateString("pt-BR", { dateStyle: "long" })}
          </p>

          <Section title="1. Introdução">
            <p>
              O Conecta Bairro valoriza sua privacidade. Esta Política descreve como coletamos,
              usamos e protegemos suas informações pessoais em conformidade com a Lei Geral de
              Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
          </Section>

          <Section title="2. Dados que Coletamos">
            <p>Podemos coletar os seguintes tipos de dados:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-foreground">Dados de cadastro:</strong> nome, e-mail, telefone
                e endereço;
              </li>
              <li>
                <strong className="text-foreground">Dados de perfil:</strong> foto, descrição
                profissional e serviços oferecidos;
              </li>
              <li>
                <strong className="text-foreground">Dados de uso:</strong> páginas visitadas,
                buscas realizadas e interações na plataforma;
              </li>
              <li>
                <strong className="text-foreground">Dados de localização:</strong> quando
                autorizado, para exibir profissionais próximos.
              </li>
            </ul>
          </Section>

          <Section title="3. Como Usamos seus Dados">
            <p>Utilizamos seus dados para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Criar e gerenciar sua conta na plataforma;</li>
              <li>Conectar você a profissionais relevantes na sua região;</li>
              <li>Melhorar nossos serviços e personalizar sua experiência;</li>
              <li>Enviar comunicações relacionadas ao uso da plataforma;</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
          </Section>

          <Section title="4. Compartilhamento de Dados">
            <p>
              Não vendemos seus dados pessoais. Podemos compartilhá-los com terceiros apenas nas
              seguintes situações:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prestadores de serviços que nos auxiliam na operação da plataforma;</li>
              <li>Autoridades competentes, quando exigido por lei;</li>
              <li>Com seu consentimento explícito.</li>
            </ul>
          </Section>

          <Section title="5. Cookies">
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, lembrar
              suas preferências e analisar o uso da plataforma. Você pode configurar seu navegador
              para recusar cookies, mas isso pode limitar algumas funcionalidades.
            </p>
          </Section>

          <Section title="6. Seus Direitos (LGPD)">
            <p>Você tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados;</li>
              <li>Acessar, corrigir ou atualizar seus dados;</li>
              <li>Solicitar a exclusão dos seus dados pessoais;</li>
              <li>Revogar o consentimento a qualquer momento;</li>
              <li>Solicitar a portabilidade dos dados.</li>
            </ul>
          </Section>

          <Section title="7. Segurança">
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra
              acesso não autorizado, alteração, divulgação ou destruição. Porém, nenhum sistema é
              completamente seguro — em caso de incidente, notificaremos os usuários afetados
              conforme exigido pela LGPD.
            </p>
          </Section>

          <Section title="8. Retenção de Dados">
            <p>
              Mantemos seus dados pelo tempo necessário para prestar os serviços ou cumprir
              obrigações legais. Após esse período, os dados são excluídos ou anonimizados.
            </p>
          </Section>

          <Section title="9. Contato">
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre esta Política, entre em contato
              pelo e-mail{" "}
              <a
                href="mailto:privacidade@conectabairro.com.br"
                className="text-secondary hover:underline"
              >
                privacidade@conectabairro.com.br
              </a>
              .
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
