# Chronicle System Architecture Draft

## 1. Purpose of This Document
This document defines a high-level system architecture for Chronicle MVP. It extends the previous planning artifacts by translating the North Star, MVP scope, user flows, and domain model into a concrete technical shape.

This is a solution architecture document, not a low-level implementation spec. Its job is to answer questions such as:

- what major system parts Chronicle needs,
- how those parts interact,
- where responsibilities should live,
- how privacy and identity boundaries are enforced,
- how AI and semantic discovery fit into the platform,
- and what architectural decisions should guide implementation.

The architecture is intentionally MVP-aware. It aims to support the core Chronicle product loop without introducing unnecessary complexity before it is justified by product needs or operational scale.

---

## 2. Architectural Goals
The Chronicle MVP architecture should support the following goals:

1. Allow authenticated users to create, save, edit, publish, unpublish, and delete stories.
2. Keep contributor identity private while allowing private ownership and management.
3. Support AI-assisted follow-up questions during story refinement.
4. Support metadata extraction and semantic discovery for published stories.
5. Provide an archive experience centered on story discovery rather than social identity.
6. Make publication immediate in MVP without requiring a moderation workflow.
7. Keep the system simple enough to build iteratively while leaving room for future growth.

---

## 3. Architectural Principles

### 3.1 Story-First, Not Profile-First
The architecture should treat the story as the primary public object. Public-facing read models, APIs, and UI routes should be organized around stories, archive entries, prompts, and discovery paths, not around public user profiles.

### 3.2 Private Ownership, Public Non-Attribution
Account identity must exist in the private application domain for authentication, authorization, and ownership. Public archive surfaces must never expose account identity, profile links, or author attribution.

### 3.3 AI as a Supporting Capability
AI should be implemented as a bounded supporting subsystem that helps with follow-up questioning, metadata extraction, and semantic discovery. It should not be architecturally positioned as the primary owner of story content.

### 3.4 Clear Separation Between Draft and Published Surfaces
Drafts are private and user-scoped. Published stories are archive-visible and searchable. The architecture must enforce this separation at the service, data, and API layers.

### 3.5 Prefer Simple Service Boundaries for MVP
Chronicle MVP should begin with a modular monolith or similarly simple deployment architecture, while preserving clear internal boundaries between domains. This reduces complexity while still preparing the system for later extraction if needed.

### 3.6 Async for Enrichment, Sync for Core User Flows
Core user actions such as sign-in, editing, saving drafts, and publishing should complete predictably. Heavier enrichment tasks such as embedding generation, metadata extraction, and relationship recomputation should run asynchronously where practical.

---

## 4. Recommended Top-Level Architecture
For MVP, Chronicle should use a **modular monolith with asynchronous background processing**.

That means:

- one primary web application / backend codebase,
- one primary relational database,
- one primary object storage location if needed later,
- one background job mechanism,
- one vector index capability for semantic discovery,
- and one or more external AI providers behind an internal abstraction layer.

This is the most appropriate shape for MVP because Chronicle has meaningful internal complexity, but not yet enough scale pressure to justify a distributed microservice architecture.

### Why a Modular Monolith Fits Chronicle MVP
A modular monolith gives Chronicle:

- simpler deployment and operations,
- easier local development,
- straightforward transactional consistency for draft and story workflows,
- reduced coordination overhead,
- and enough internal structure to keep major concerns separated.

Internal modules should still be treated seriously even if they live in one deployable application.

---

## 4.1 Proposed MVP Technology Approach
The following technology approach is recommended for Chronicle MVP. The emphasis is on simplicity, strong documentation, a manageable operational footprint, and tools that align well with a solo developer workflow.

### Frontend
- **Next.js with TypeScript**
- Rationale: supports a clean web application structure, straightforward routing, server/client rendering flexibility, and a strong developer ecosystem without requiring unnecessary frontend complexity for MVP.

### Backend
- **Next.js application routes / server actions for MVP backend logic**
- Rationale: keeps the frontend and backend in a single codebase, reduces deployment complexity, and is sufficient for the Chronicle MVP workload as a modular monolith.

### Database
- **PostgreSQL**
- Rationale: reliable relational foundation for ownership, lifecycle, prompts, metadata, and story relationships.

### Semantic Search / Vector Support
- **PostgreSQL with pgvector**
- Rationale: keeps semantic search in the same primary data platform for MVP, avoiding the operational overhead of introducing a separate vector database too early.

### Authentication
- **NextAuth.js (Auth.js) with credential or email-based authentication**
- Rationale: fits naturally into a Next.js stack and supports authenticated access without introducing an unnecessarily large identity platform for the initial version.

### Background Jobs
- **Simple database-backed job approach for MVP**
- Rationale: enrichment tasks such as embedding generation, metadata extraction, and related-story refreshes can initially be handled with a lightweight background processing approach rather than a dedicated distributed queue system.

### AI Integration
- **Provider abstraction over external LLM APIs**
- Rationale: Chronicle should keep AI calls behind an internal service boundary so that providers can be changed later without rewriting the rest of the application.

### Hosting
- **Managed hosting for the web application and managed PostgreSQL**
- Rationale: reduces operational burden for a solo developer and keeps focus on product development rather than infrastructure administration.

### Object Storage
- **Deferred for current MVP unless file uploads are introduced**
- Rationale: the MVP is text-first, so object storage should remain an extension point rather than a required operational dependency.

### Recommended MVP Stack Summary
For the initial implementation, the recommended default stack is:

- Next.js + TypeScript
- PostgreSQL
- pgvector
- Auth.js / NextAuth.js
- Internal AI service abstraction over external LLM APIs
- Lightweight background job processing within the modular monolith
- Managed hosting and managed database infrastructure

This approach prioritizes a single cohesive application, low operational overhead, and a straightforward path to implementation for a solo-developed MVP.

---

## 5. High-Level System Context
At a high level, Chronicle consists of the following major parts:

1. **Web Client** — the browser-based Chronicle UI for contributors and archive readers.
2. **Application Backend** — the main API and business logic layer.
3. **Relational Database** — the system of record for accounts, stories, prompts, metadata, and lifecycle state.
4. **Background Job / Workflow Processor** — handles asynchronous enrichment and indexing tasks.
5. **AI Integration Layer** — abstracts calls to LLMs or related AI providers.
6. **Semantic Search / Vector Index** — supports meaning-based retrieval and related-story discovery.
7. **Authentication Mechanism** — manages sign-in, sessions, and account access.
8. **Optional Object Storage** — stores uploaded assets if file attachments or audio are introduced later.

---

## 6. Logical Architecture Layers

### 6.1 Presentation Layer
This is the Chronicle frontend experience.

Responsibilities:

- sign-in and account access UI,
- private dashboard and story management views,
- story editor and review flow,
- AI follow-up question interaction,
- archive browsing and story reading,
- search and discovery UI,
- publication guidance and confirmation flows.

The frontend should not contain business rules about publication visibility, ownership, or discovery eligibility. It should render state supplied by the backend and enforce only lightweight client-side validation.

### 6.2 Application Layer
This is the orchestration layer for user-facing behaviors.

Responsibilities:

- handle requests from the frontend,
- coordinate domain operations,
- enforce authorization,
- manage story workflow transitions,
- trigger async jobs,
- assemble read models for UI surfaces,
- mediate between the domain and infrastructure layers.

Examples:

- create draft,
- save story changes,
- request AI questions,
- publish story,
- unpublish story,
- search archive,
- fetch related stories.

### 6.3 Domain Layer
This contains Chronicle’s core business rules and domain concepts.

Responsibilities:

- account ownership rules,
- story lifecycle transitions,
- visibility rules,
- prompt association rules,
- distinction between draft and published state,
- rules for archive eligibility,
- AI-related domain boundaries,
- identity non-attribution rules.

This is where Chronicle’s conceptual model should live in code.

### 6.4 Infrastructure Layer
This contains persistence and external integration concerns.

Responsibilities:

- database access,
- authentication provider integration,
- job queue and worker infrastructure,
- AI provider calls,
- vector index integration,
- search indexing,
- logging and monitoring,
- email or account recovery mechanisms if included.

---

## 7. Suggested Internal Backend Modules
The backend should be organized into clear internal modules, even if deployed as one application.

### 7.1 Identity and Access Module
Responsibilities:

- account registration,
- sign-in,
- session or token validation,
- password reset or recovery,
- ownership-aware authorization checks.

Key rule: identity is private and is never exposed through public archive responses.

### 7.2 Story Authoring Module
Responsibilities:

- create new drafts,
- load and edit existing drafts,
- save story body and title,
- attach prompt association,
- manage review and finalization state.

This module owns the private authoring workflow.

### 7.3 AI Interview Module
Responsibilities:

- determine whether a story has enough content for question generation,
- request follow-up questions from AI provider abstraction,
- store generated interview questions,
- store user responses,
- support later incorporation into the story workflow.

This module should not silently rewrite stories. Its purpose is to support reflection and refinement while leaving editorial control with the user.

### 7.4 Publication and Archive Module
Responsibilities:

- validate publish eligibility,
- transition story status,
- construct archive-facing representation,
- expose public story pages,
- enforce visibility rules,
- support unpublish and delete behavior.

This module owns the translation from privately managed story to publicly discoverable archive entry.

### 7.5 Metadata and Enrichment Module
Responsibilities:

- extract or store themes, time period, life stage, places, and similar metadata,
- normalize metadata values,
- manage user-editable versus AI-generated metadata if that distinction is implemented,
- prepare story content for semantic indexing.

### 7.6 Discovery Module
Responsibilities:

- keyword and semantic search orchestration,
- prompt and theme browsing,
- related-story retrieval,
- search ranking assembly,
- archive listing queries.

This module should only return published, archive-eligible content.

### 7.7 Prompt Module
Responsibilities:

- manage community prompts,
- expose active prompts to the UI,
- associate stories with prompts,
- support prompt-based archive browsing.

### 7.8 Background Jobs Module
Responsibilities:

- queue jobs on publication or story updates,
- generate embeddings,
- recompute relationships,
- refresh searchable projections,
- run enrichment tasks outside the request cycle.

---

## 8. Primary Data Stores

### 8.1 Relational Database
The relational database should be the source of truth for Chronicle MVP.

It should store at minimum:

- accounts,
- stories,
- story statuses,
- prompts,
- interview questions,
- interview responses,
- story metadata,
- story-to-prompt associations,
- publication timestamps,
- audit-friendly timestamps,
- possibly search projection references.

A relational database is a strong fit because Chronicle has clear ownership, lifecycle, and relationship semantics, all of which benefit from structured transactional storage.

### 8.2 Vector Store / Semantic Index
Chronicle MVP should include a vector-capable retrieval layer for semantic search and related stories.

This store should hold at least:

- story embedding vectors,
- story identifier references,
- embedding version metadata,
- possibly chunk or segment references if later needed.

The vector store should not replace the primary relational database. It is a discovery index, not the source of truth.

### 8.3 Search Projection / Read Models
Depending on implementation choices, Chronicle may also maintain a search-oriented projection that combines:

- title,
- story text or searchable excerpt,
- normalized metadata,
- prompt association,
- publication status,
- archive visibility flags.

This may live in the primary relational database at first, or in a dedicated search system later. MVP should choose the simplest workable option.

### 8.4 Object Storage
Object storage is optional for the current text-first MVP, but should remain an architectural extension point for:

- future audio uploads,
- attachments,
- generated exports,
- thumbnails or derived assets.

---

## 9. Core Runtime Flows Through the Architecture

### 9.1 Sign-In and Workspace Access
1. User authenticates through the identity mechanism.
2. Backend validates session.
3. Backend loads account-scoped dashboard data.
4. Frontend renders only the user’s own drafts and stories.

### 9.2 Draft Creation and Editing
1. User starts a story.
2. Story Authoring Module creates a draft record.
3. User edits content.
4. Backend saves draft updates to relational database.
5. Draft remains private and excluded from archive surfaces.

### 9.3 AI Follow-Up Question Flow
1. User requests help or reaches the AI reflection step.
2. Backend checks minimum content threshold.
3. AI Interview Module sends selected story context to AI abstraction layer.
4. AI provider returns follow-up questions.
5. Questions are stored and returned to the frontend.
6. User responses are stored separately.
7. User remains responsible for final story editing.

### 9.4 Publication Flow
1. User initiates publish.
2. Publication Module validates required fields and ownership.
3. Story status changes to Published.
4. Archive-facing projection becomes eligible for reading.
5. Async jobs are queued for metadata refresh, embedding generation, and related-story indexing if needed.
6. Story becomes available in authenticated archive discovery surfaces.

### 9.5 Archive Discovery Flow
1. Reader opens archive or executes search.
2. Discovery Module queries searchable published content only.
3. Ranking may combine keyword, metadata, prompt, and semantic signals.
4. Reader opens story page.
5. Related stories are fetched from relationship or semantic similarity sources.

### 9.6 Unpublish or Delete Flow
1. Owner initiates unpublish or delete from private workspace.
2. Backend verifies ownership and allowed state transition.
3. Story status is updated.
4. Archive visibility is removed.
5. Async cleanup updates search and vector index projections.

---

## 10. Story Lifecycle Architecture
Chronicle MVP needs explicit lifecycle handling because visibility and discoverability depend on it.

Recommended lifecycle states:

- **Draft** — private, editable, not discoverable.
- **Published** — visible in archive, searchable, eligible for related-story discovery.
- **Unpublished** — retained privately, no longer discoverable.
- **Deleted** — removed from active use according to system policy.

### Lifecycle Rule of Thumb
The published archive is not a different story object. It is a public representation of a story whose current state allows exposure.

That means:

- one core story record remains the source entity,
- visibility and projection logic determine archive presence,
- and discovery systems should key off publishable state, not mere existence.

---

## 11. Public/Private Boundary Design
This is one of the most important architectural concerns in Chronicle.

### Private Domain Includes
- account identity,
- ownership links,
- dashboards,
- draft content,
- unpublished stories,
- account-scoped management actions,
- internal audit and operational metadata.

### Archive/Public Domain Includes
- published stories,
- archive entries,
- prompts,
- themes and related-story links,
- search results,
- public story pages.

### Hard Constraint
No archive API, read model, search index, or public route should expose:

- account ID,
- email,
- username,
- profile handle,
- public author page link,
- or inferred author identity fields.

This should be enforced not only in UI rendering, but also in backend response models, search projections, and indexing pipelines.

---

## 12. AI Architecture
Chronicle requires AI capabilities, but they should be implemented as bounded supporting services rather than as core authorities over story content.

### 12.1 AI Responsibilities in MVP
AI may support:

- follow-up question generation,
- metadata extraction,
- semantic embedding generation,
- possibly title or tag suggestions if later included.

### 12.2 AI Abstraction Layer
The backend should expose an internal AI service abstraction so that the rest of the system does not depend directly on a specific provider.

Example capabilities behind the abstraction:

- generate_followup_questions(story_text)
- extract_story_metadata(story_text)
- generate_story_embedding(story_text)

This allows Chronicle to:

- swap providers later,
- compare models,
- add retries and fallbacks,
- centralize prompt templates,
- and keep sensitive integration logic out of core domain code.

### 12.3 AI Prompting and Output Storage
The architecture should preserve enough traceability to know:

- when AI was used,
- what capability was invoked,
- which story version it was based on,
- and what structured output was produced.

Full prompt logging may need careful privacy handling, but capability-level observability is wise.

### 12.4 Human Control Rule
AI outputs should remain editable, ignorable, and non-authoritative in user-facing workflows.

---

## 13. Semantic Search and Related Story Architecture
Semantic discovery is a core product capability for Chronicle.

### 13.1 Recommended Retrieval Pattern for MVP
Use a hybrid retrieval model:

- relational or full-text filtering for eligibility and exact matches,
- vector similarity for meaning-based retrieval,
- metadata and prompt signals for context-aware ranking.

This gives Chronicle practical search behavior while avoiding overreliance on any single retrieval signal.

### 13.2 Indexing Pipeline
When a story becomes published, or when a published story changes materially:

1. Canonical story text is selected.
2. Metadata is extracted or refreshed.
3. Embedding is generated.
4. Search projection is updated.
5. Related-story candidates are recomputed or fetched dynamically.

### 13.3 Related Stories Strategy
For MVP, related stories can be computed using a combination of:

- embedding similarity,
- shared prompts,
- overlapping themes,
- shared time/life-stage metadata.

The system may either:

- compute related stories on demand using vector search,
- or precompute a small set of nearest neighbors asynchronously.

A hybrid model is also reasonable.

---

## 14. API Shape and Boundary Recommendations
The backend should expose application-oriented APIs rather than persistence-shaped endpoints.

Illustrative backend capability groups:

### Auth / Account
- sign up
- sign in
- sign out
- get current workspace summary

### Story Authoring
- create draft
- get own story by id
- save draft changes
- list own stories by status
- delete own story

### AI Reflection
- generate follow-up questions for story
- save interview responses

### Publication
- publish story
- unpublish story
- preview story for publication

### Archive / Discovery
- list archive stories
- search archive
- get story page
- get related stories
- list active prompts
- browse stories by prompt or theme

Public/archive endpoints should never require or return ownership identity data.

---

## 15. Security, Privacy, and Trust Architecture
Chronicle’s trust posture matters because it handles personal storytelling.

### 15.1 Authentication and Authorization
- Require authenticated access for story management.
- Enforce owner-only access to drafts and unpublished stories.
- Use server-side authorization checks, not just client assumptions.

### 15.2 Private/Public Data Separation
- Maintain clear query filters for published versus non-published content.
- Avoid reusing raw internal models directly in archive responses.
- Use distinct response DTOs or view models for private and archive surfaces.

### 15.3 AI Data Handling
- Only send necessary story content to AI providers.
- Keep provider access encapsulated.
- Document provider-level privacy expectations and retention assumptions.
- Make future provider replacement possible.

### 15.4 PII Minimization by Design
Chronicle MVP is not promising perfect automated PII detection, but the architecture should still support minimization through:

- submission guidance,
- preview before publication,
- editable metadata,
- possible future redaction or warning services.

### 15.5 Auditability
Important events should be traceable, including:

- account creation,
- sign-in events,
- story creation,
- publish/unpublish/delete actions,
- AI question generation events,
- indexing or enrichment failures.

---

## 16. Non-Functional Requirements and Architectural Implications

### 16.1 Reliability
Users must be able to trust that drafts will be saved reliably and remain accessible.

Implications:

- reliable database persistence,
- safe update handling,
- autosave or frequent save support,
- clear error feedback on failed writes.

### 16.2 Performance
Core app actions should feel responsive.

Implications:

- draft saves should be lightweight,
- publication should not block on every enrichment task,
- search should return results quickly enough to support browsing,
- related-story retrieval should remain responsive enough to support browsing and discovery.

### 16.3 Maintainability
Chronicle is likely to evolve substantially after MVP.

Implications:

- modular code organization,
- strong internal service boundaries,
- explicit domain language,
- isolated provider integrations,
- testable application services.

### 16.4 Scalability
MVP should not over-engineer, but architecture should avoid boxing itself into a corner.

Implications:

- background jobs for heavy tasks,
- abstraction around vector store and AI provider,
- separation of read-heavy archive flows from private write-heavy authoring flows at the code level.

### 16.5 Observability
Chronicle will need enough visibility to debug search weirdness, AI hiccups, and lifecycle bugs.

Implications:

- structured logs,
- error monitoring,
- job metrics,
- AI call tracking,
- search/index status visibility.

---

## 17. Suggested MVP Deployment View
A practical MVP deployment could look like this:

- **Single Next.js Application** for frontend and backend concerns
- **Primary PostgreSQL Database** for system-of-record data
- **pgvector Extension** for semantic retrieval support
- **Background Processing within the Application Boundary** for enrichment and indexing work
- **External AI Provider API** behind an internal abstraction layer
- **Authentication Integrated into the Application Stack**

This could be deployed as:

- one primary web application,
- one managed PostgreSQL instance,
- and lightweight background processing running from the same codebase or deployment boundary.

This deployment model is intentionally simple and suitable for an MVP maintained by a solo developer. If future scale or operational needs justify it, background workers, search infrastructure, or service boundaries can be separated later.

---

## 18. Recommended Implementation Posture
Chronicle MVP should likely be built in this order at the architectural level:

1. identity and account access,
2. story authoring and draft persistence,
3. publication lifecycle and private/public visibility rules,
4. archive read paths,
5. AI follow-up question flow,
6. metadata extraction and enrichment,
7. semantic search and related-story discovery,
8. prompt-based contribution and browsing refinements.

This sequence establishes the core architectural foundation first, then layers in enrichment and discovery capabilities.

---

## 19. Open Architectural Decisions Still to Resolve
The following decisions should be made next:

1. **Story versioning behavior**
   - whether published edits overwrite directly,
   - whether soft version history is retained.

2. **Search implementation details**
   - precomputed versus dynamic related-story links,
   - exact ranking blend between keyword, metadata, prompt, and vector signals.

3. **Metadata strategy**
   - fully AI-generated,
   - user-editable after extraction,
   - controlled vocabularies versus open labels.

4. **Prompt administration**
   - how prompts are created and managed,
   - whether prompt management is manual in MVP.

5. **Delete semantics**
   - soft delete versus hard delete,
   - retention behavior for internal operations.

6. **Archive access rule**
   - whether archive remains authenticated-only in MVP,
   - or later opens to broader public access.

7. **Background job implementation detail**
   - whether the initial worker loop runs in-process,
   - or as a separate lightweight worker deployment using the same codebase.

## 20. Natural Next Documents
After this architecture draft, the most natural follow-up artifacts are:

1. **Technical Stack Recommendation / ADRs**
2. **Data Model / Initial Schema Draft**
3. **API Contract Draft**
4. **AI Integration Design**
5. **Search and Retrieval Design**
6. **Story Lifecycle and State Transition Rules**
7. **Deployment / Dev Environment Plan**

---

## 21. Working Summary
Chronicle MVP should be built as a modular monolith with strong internal boundaries around identity, story authoring, AI reflection, publication, metadata enrichment, and discovery.

The relational database should remain the source of truth. Semantic search and related-story discovery should be supported through an asynchronous enrichment pipeline and a vector-capable retrieval layer. Public archive surfaces must be strictly separated from private ownership data. AI should be present, useful, and bounded.

In summary, Chronicle is a story archive supported by AI-assisted refinement and semantic discovery. This architecture is intended to provide a stable foundation for MVP while preserving flexibility for future evolution.

