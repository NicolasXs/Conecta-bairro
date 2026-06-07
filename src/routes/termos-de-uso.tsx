import { createFileRoute } from "@tanstack/react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const Route = createFileRoute("/termos-de-uso")({
  component: TermosDeUsoPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-primary mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3 text-sm">{children}</div>
    </section>
  );
}

function TermosDeUsoPage() {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Última atualização: {new Date().toLocaleDateString("pt-BR", { dateStyle: "long" })}
          </p>

          <Section title="1. Aceitação dos Termos">
            <p>
              Ao acessar ou utilizar a plataforma Conecta Bairro, você concorda com estes Termos de
              Uso. Se não concordar com qualquer parte, não utilize nossos serviços.
            </p>
          </Section>

          <Section title="2. Descrição do Serviço">
            <p>
              O Conecta Bairro é uma plataforma digital que facilita a conexão entre moradores e
              prestadores de serviços locais, como pedreiros, eletricistas, pintores, entre outros.
            </p>
            <p>
              Não somos parte contratante nas negociações realizadas entre usuários e profissionais,
              atuando apenas como intermediário tecnológico.
            </p>
          </Section>

          <Section title="3. Cadastro e Conta">
            <p>
              Para utilizar determinadas funcionalidades, é necessário criar uma conta. Você é
              responsável pela veracidade das informações fornecidas e pela segurança de suas
              credenciais de acesso.
            </p>
            <p>
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos ou
              que apresentem comportamento fraudulento.
            </p>
          </Section>

          <Section title="4. Responsabilidades do Usuário">
            <p>Ao utilizar a plataforma, você se compromete a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fornecer informações verdadeiras e atualizadas;</li>
              <li>Não utilizar a plataforma para fins ilegais ou prejudiciais a terceiros;</li>
              <li>Respeitar os demais usuários e profissionais cadastrados;</li>
              <li>Não reproduzir, copiar ou distribuir conteúdo da plataforma sem autorização.</li>
            </ul>
          </Section>

          <Section title="5. Responsabilidades dos Profissionais">
            <p>
              Profissionais cadastrados são responsáveis pela qualidade dos serviços prestados, pelo
              cumprimento de prazos acordados e pela veracidade das informações em seus perfis,
              incluindo qualificações e experiência.
            </p>
          </Section>

          <Section title="6. Limitação de Responsabilidade">
            <p>
              O Conecta Bairro não se responsabiliza por danos decorrentes da execução dos serviços
              contratados entre usuários e profissionais, por interrupções no serviço causadas por
              fatores externos, ou por conteúdo publicado por terceiros na plataforma.
            </p>
          </Section>

          <Section title="7. Propriedade Intelectual">
            <p>
              Todo o conteúdo da plataforma — incluindo marca, logotipo, textos, layouts e código —
              é de propriedade exclusiva do Conecta Bairro e protegido pela legislação brasileira de
              propriedade intelectual.
            </p>
          </Section>

          <Section title="8. Modificações">
            <p>
              Podemos atualizar estes Termos a qualquer momento. Notificaremos os usuários sobre
              alterações relevantes. O uso contínuo da plataforma após as alterações implica
              aceitação dos novos termos.
            </p>
          </Section>

          <Section title="9. Legislação Aplicável">
            <p>
              Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de
              domicílio do usuário para dirimir quaisquer controvérsias.
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
