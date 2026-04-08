# Conecta Bairro

## What This Is

Conecta Bairro é uma plataforma local de conexão entre trabalhadores e contratantes do mesmo bairro. Qualquer pessoa pode publicar que precisa de um serviço ou que está disponível para trabalhar, e a plataforma conecta essas pessoas por proximidade (bairro/CEP). O foco é em serviços informais e autônomos como pedreiro, diarista, babá, delivery, entre outros.

## Core Value

Conectar trabalhadores e contratantes do mesmo bairro — a proximidade é o filtro principal.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Autenticação com email/senha
- [ ] Perfil de usuário com foto e descrição
- [ ] Sistema de avaliações entre usuários
- [ ] Publicação de vagas/serviços com categoria e localização (bairro/CEP)
- [ ] Feed de vagas e trabalhadores disponíveis filtrado por bairro/CEP
- [ ] Chat interno entre usuários
- [ ] Consumo de API externa via React Query

### Out of Scope

- API/backend — será desenvolvida separadamente; o frontend consome via REST/React Query
- Emprego formal com carteira assinada — foco em serviços informais e autônomos
- Mapa interativo para localização — localização baseada em bairro/CEP cadastrado no perfil
- Login social (Google, redes sociais) — autenticação própria por email/senha no v1

## Context

- Frontend-only: a API é externa e já existirá quando o frontend for desenvolvido
- Stack definida: TanStack Start (React), React Query para data fetching, Magic UI + Shadcn para design
- Público-alvo: moradores de bairro que oferecem ou precisam de serviços informais/autônomos
- A confiança entre usuários é construída via perfis com foto, descrição e sistema de avaliações

## Constraints

- **Tech Stack**: TanStack Start + React Query + Magic UI + Shadcn — escolha do projeto, não negociável
- **Escopo**: Somente frontend — integração com API externa via contrato REST/JSON
- **Localização**: Bairro/CEP no perfil, sem geolocalização em tempo real no v1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| TanStack Start como framework | Escolha do desenvolvedor — SSR + rotas modernas com React | — Pending |
| React Query para data fetching | Gerenciamento de cache e estados de loading/error sem boilerplate | — Pending |
| Magic UI + Shadcn para UI | Design consistente e componentes prontos para acelerar desenvolvimento | — Pending |
| API externa ao escopo | Backend será desenvolvido separadamente, frontend consome via contrato | — Pending |
| Foco em serviços informais | Mercado local de bairro tem alta demanda por autônomos e pequenos serviços | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-07 after initialization*
