# Roadmap: Conecta Bairro

## Overview

Construção do frontend do Conecta Bairro em quatro fases de entrega. Começamos com a fundação técnica e autenticação, depois expandimos para perfis (com exibição de avaliações), publicação de posts e feed filtrado por bairro, e encerramos com o chat privado entre usuários. Cada fase entrega uma capacidade verificável e independente.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Auth** - Project scaffolding + authentication flows
- [ ] **Phase 2: User Profiles & Reviews** - Profile setup, editing, public view, and ratings display
- [ ] **Phase 3: Posts & Feed** - Availability post creation and neighborhood-filtered feed
- [ ] **Phase 4: Chat** - Private messaging between users

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: Users can securely create accounts and access the application
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can create a new account with email and password and land on the app
  2. User can log in and remain logged in across browser sessions (token persisted)
  3. User can log out from any page and be redirected to the unauthenticated view
  4. Unauthenticated users trying to access protected routes are redirected to login
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffold (TanStack Start) + design system (shadcn new-york, teal palette, Inter font, Magic UI)
- [ ] 01-02-PLAN.md — Auth infrastructure (token utilities, React Query hooks, root layout, protected route guard)
- [ ] 01-03-PLAN.md — Auth pages (Login /login + Register /register with full UI-SPEC implementation)

**UI hint**: yes

### Phase 2: User Profiles & Reviews
**Goal**: Users can build their identity on the platform and see who they're dealing with
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROF-03, REVW-01
**Success Criteria** (what must be TRUE):
  1. User can complete their profile with photo, name, description, and neighborhood/CEP
  2. User can edit and save changes to their own profile at any time
  3. User can view another user's public profile page (photo, name, description)
  4. Ratings and written reviews from other users are visible on a public profile
**Plans**: TBD
**UI hint**: yes

### Phase 3: Posts & Feed
**Goal**: Users can offer their services and discover workers in their neighborhood
**Depends on**: Phase 2
**Requirements**: POST-01, POST-02, POST-03, FEED-01
**Success Criteria** (what must be TRUE):
  1. User can publish an availability post with service category and description
  2. User can edit their own availability post after publishing
  3. User can delete their own availability post
  4. User sees a feed of availability posts filtered to their registered neighborhood/CEP
**Plans**: TBD
**UI hint**: yes

### Phase 4: Chat
**Goal**: Users can communicate directly to coordinate hiring
**Depends on**: Phase 3
**Requirements**: CHAT-01, CHAT-02
**Success Criteria** (what must be TRUE):
  1. User can start a private conversation from another user's profile or post
  2. User can send text messages and see them appear in the conversation in real time
  3. User can receive messages sent by the other party in the same conversation
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 0/3 | Not started | - |
| 2. User Profiles & Reviews | 0/? | Not started | - |
| 3. Posts & Feed | 0/? | Not started | - |
| 4. Chat | 0/? | Not started | - |
