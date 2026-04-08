# Conecta Bairro — v1 Requirements

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can create a new account with email and password
- [ ] **AUTH-02**: User can log in with email and password and stay logged in across sessions
- [ ] **AUTH-03**: User can log out from any page

### Profile

- [ ] **PROF-01**: User can set up profile with photo, name, description, and neighborhood/CEP during or after registration
- [ ] **PROF-02**: User can edit their own profile (photo, name, description, neighborhood/CEP)
- [ ] **PROF-03**: User can view another user's public profile (photo, name, description, ratings)

### Posts

- [ ] **POST-01**: User can publish an availability post (I want to work) with a service description and category
- [ ] **POST-02**: User can edit their own availability post
- [ ] **POST-03**: User can delete their own availability post

### Feed

- [ ] **FEED-01**: User can see a feed of availability posts filtered by their registered neighborhood/CEP

### Chat

- [ ] **CHAT-01**: User can initiate a private conversation with another user from their profile or post
- [ ] **CHAT-02**: User can send and receive text messages in a private conversation

### Reviews

- [ ] **REVW-01**: User can view the list of ratings and reviews on another user's profile

---

## v2 Requirements (Deferred)

- Publish job vacancy (want to hire) — deferred to v2 after validating worker-side flow
- Leave a review/rating for another user — deferred; display UI is v1, submission logic is v2
- Search/filter by service category — deferred to v2
- List of ongoing conversations (chat inbox) — deferred to v2
- In-app notification for new messages — deferred to v2
- Password reset via email — deferred to v2
- User blocking / reporting — deferred to v2

---

## Out of Scope

- Backend/API — developed separately; frontend consumes via REST + React Query
- OAuth / social login (Google, etc.) — not planned; email/password only
- Real-time geolocation — location is based on neighborhood/CEP set in profile
- Formal job listings (CLT, etc.) — focus on informal/freelance services
- Payment processing — out of scope entirely
- Push notifications (mobile/browser) — out of scope for v1

---

## Traceability

<!-- Filled by roadmap creation -->

| REQ-ID | Phase | Notes |
|--------|-------|-------|
| AUTH-01 | Phase 1 | Foundation & Auth |
| AUTH-02 | Phase 1 | Foundation & Auth |
| AUTH-03 | Phase 1 | Foundation & Auth |
| PROF-01 | Phase 2 | User Profiles & Reviews |
| PROF-02 | Phase 2 | User Profiles & Reviews |
| PROF-03 | Phase 2 | User Profiles & Reviews |
| POST-01 | Phase 3 | Posts & Feed |
| POST-02 | Phase 3 | Posts & Feed |
| POST-03 | Phase 3 | Posts & Feed |
| FEED-01 | Phase 3 | Posts & Feed |
| CHAT-01 | Phase 4 | Chat |
| CHAT-02 | Phase 4 | Chat |
| REVW-01 | Phase 2 | User Profiles & Reviews — display on profile |
