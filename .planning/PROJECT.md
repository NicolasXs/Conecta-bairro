# CNB — Serviços do Bairro

## What This Is

Marketplace web de serviços locais onde prestadores (faxineiras, pedreiros, eletricistas, etc.) criam um perfil com portfólio e recebem avaliações, e contratantes podem buscar prestadores próximos ou postar o que precisam para que prestadores se candidatem. A plataforma conecta as duas pontas diretamente — sem intermediar pagamento. Escalável para qualquer cidade ou região.

## Core Value

Conectar quem precisa de serviço com prestadores de confiança do bairro — rápido, sem atravessador, com transparência de avaliações e histórico de trabalho.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Prestador pode se cadastrar e criar perfil com foto, descrição e categoria de serviço
- [ ] Prestador pode adicionar fotos de trabalhos realizados ao portfólio
- [ ] Contratante pode buscar prestadores por tipo de serviço e localização
- [ ] Contratante pode visualizar perfil completo do prestador (fotos, avaliações, contato)
- [ ] Contratante pode postar uma demanda (o que precisa, região) e receber candidaturas
- [ ] Prestador pode ver e se candidatar a demandas abertas na sua região
- [ ] Após o serviço, contratante pode avaliar o prestador com estrelas e comentário
- [ ] Perfil do prestador exibe média de avaliações e histórico de comentários
- [ ] Usuários se cadastram e fazem login (contratante ou prestador)
- [ ] Site responsivo, funcional no celular

### Out of Scope

- Processamento de pagamento — plataforma só conecta, negociação e pagamento são fora da plataforma
- Aplicativo móvel nativo (iOS/Android) — web responsivo cobre a necessidade inicial
- Verificação de documentos/identidade — deferred; avaliações cobrem confiança no v1
- Chat em tempo real embutido — contratante entra em contato via informações do perfil

## Context

- Inspiração: iFood, mas para serviços avulsos do bairro (economia informal/local)
- Problema central: difícil achar prestadores de confiança perto de casa
- Público-alvo: moradores de qualquer bairro do Brasil procurando serviços, e prestadores autônomos que não têm canal de divulgação digital
- Plataforma: web responsiva (mobile-first), escalável por geolocalização desde o início

## Constraints

- **Plataforma**: Web responsiva — nenhum app nativo no v1
- **Pagamento**: Sem processamento de pagamento — fora do escopo por decisão de negócio
- **Escopo geográfico**: Escalável desde o início, sem limite a um único bairro

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dois modos de matching (vitrine + demanda) | Cobre tanto prestador que se divulga quanto contratante que posta necessidade | — Pending |
| Sem pagamento na plataforma | Reduz complexidade e regulação no v1; plataforma vira marketplace financeiro se incluir | — Pending |
| Web responsiva em vez de app | Menor barreira de entrada; prestadores com celular básico acessam pelo browser | — Pending |

## Evolution

Este documento evolui a cada transição de fase e marco de milestone.

**Após cada transição de fase** (via `/gsd-transition`):
1. Requisitos invalidados? → Mover para Out of Scope com motivo
2. Requisitos validados? → Mover para Validated com referência da fase
3. Novos requisitos surgiram? → Adicionar em Active
4. Decisões a registrar? → Adicionar em Key Decisions
5. "What This Is" ainda preciso? → Atualizar se derivou

**Após cada milestone** (via `/gsd-complete-milestone`):
1. Revisão completa de todas as seções
2. Verificação do Core Value — ainda é a prioridade certa?
3. Auditoria do Out of Scope — motivos ainda válidos?
4. Atualizar Context com estado atual

---
*Last updated: 2026-04-02 after initialization*
