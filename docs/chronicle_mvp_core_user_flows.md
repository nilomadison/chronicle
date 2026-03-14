# Chronicle MVP Core User Flows

## Purpose

This document defines the most important end-to-end user journeys for the Chronicle MVP. Its purpose is to bridge the gap between the North Star, MVP scope, and domain model by identifying what the system must actually support in practice.

These flows will be used to:

- inform solution architecture
- clarify required system behaviors
- identify privacy and data handling needs
- expose MVP edge cases and state transitions
- guide later API, schema, and implementation planning

---

## How to Read This Document

Each flow is described using the following structure:

- **Goal** — what the actor is trying to accomplish
- **Primary Actor** — who initiates the flow
- **Trigger** — what starts the flow
- **Preconditions** — what must already be true
- **Main Flow** — the happy path
- **Alternate / Edge Paths** — reasonable variations or failure cases
- **Postconditions** — what is true after the flow completes
- **Data Touched** — major entities or records involved
- **AI Involvement** — whether AI is involved and how
- **Privacy / Trust Considerations** — constraints that matter for Chronicle

---

## Flow 1: Account Access and Return to Workspace

**Goal**\
Allow a user to securely access Chronicle and return to their personal workspace without creating a public-facing identity.

**Primary Actor**\
Contributor / account holder

**Trigger**\
User visits Chronicle and chooses to sign in or access their account.

**Preconditions**

- User has an account, or account creation is available in MVP
- Chronicle authentication system is operational

**Main Flow**

1. User arrives at Chronicle landing or entry page.
2. User selects sign in.
3. User authenticates successfully.
4. System establishes authenticated session.
5. System routes user to their private workspace or dashboard.
6. User can view their drafts, prior submissions, or available actions.

**Alternate / Edge Paths**

- User is new and creates an account before continuing.
- User provides invalid credentials and is shown an error.
- User requests password reset or equivalent recovery flow.
- Session has expired and user must authenticate again.

**Postconditions**

- Authenticated session exists.
- User can access private account-linked content.
- No public profile or public author page is exposed.

**Data Touched**

- Account
- Session / authentication state
- User-owned drafts and submissions index

**AI Involvement**\
None.

**Privacy / Trust Considerations**

- Account identity must remain separate from public archive presentation.
- System should not expose author identity publicly through profile pages, URLs, or archive views.
- Authentication UX should feel trustworthy and simple.

---

## Flow 2: Start a New Story Draft

**Goal**\
Allow a logged-in user to begin capturing a story or memory as a draft.

**Primary Actor**\
Contributor

**Trigger**\
User selects “Start a Story” or equivalent action from the workspace.

**Preconditions**

- User is authenticated.
- User has permission to create content.

**Main Flow**

1. User initiates a new story.
2. System creates a new draft record in draft state.
3. System presents a story entry experience with guidance for safe, community-minded storytelling.
4. User enters initial story content and any initial metadata fields required by MVP.
5. System saves progress as draft.
6. User may continue editing or leave and return later.

**Alternate / Edge Paths**

- User abandons draft after only minimal content.
- User exits before completing all optional fields.
- Auto-save or manual save occurs multiple times.
- User resumes a partially completed draft later.

**Postconditions**

- Draft exists and is linked privately to the user account.
- Draft content is recoverable for future editing.

**Data Touched**

- Story
- Account ownership link
- Draft status / timestamps
- Optional early metadata

**AI Involvement**\
Potentially none at creation time, unless MVP uses AI after the first story input.

**Privacy / Trust Considerations**

- Guidance should discourage identifying details when inappropriate.
- Draft content is private by default.
- System should not accidentally expose draft content in public search or archive views.

---

## Flow 3: AI-Assisted Reflection and Follow-Up Questions

**Goal**\
Help the contributor deepen or clarify their story through thoughtful follow-up prompts.

**Primary Actor**\
Contributor, with AI acting as supporting system behavior

**Trigger**\
User submits an initial story draft section or requests help expanding the story.

**Preconditions**

- A draft story exists.
- Sufficient story content exists for the system to generate meaningful follow-up questions.
- AI feature is enabled for this step in MVP.

**Main Flow**

1. User provides an initial story draft or partial narrative.
2. System evaluates whether enough context exists for follow-up generation.
3. System sends appropriate story content to AI service.
4. AI returns a small set of reflective follow-up questions.
5. System presents those questions to the user as optional prompts.
6. User answers one or more questions.
7. System stores responses and optionally merges or associates them with the draft.

**Alternate / Edge Paths**

- Story content is too short, so the system asks the user to add more before generating questions.
- AI service fails or times out, and the user continues without AI help.
- AI output is low quality and is discarded.
- User ignores the questions and continues editing manually.

**Postconditions**

- Follow-up questions may be stored for the draft.
- User responses may enrich the story draft.
- Draft becomes more complete, detailed, or reflective.

**Data Touched**

- Story draft content
- Interview question / follow-up prompt records
- User responses
- Optional AI processing logs / metadata

**AI Involvement**\
Yes. AI generates contextual follow-up questions and may assist in structuring or enriching story development.

**Privacy / Trust Considerations**

- AI should not create pressure or distort the contributor’s voice.
- The user should understand that AI suggestions are optional.
- Content sent to AI providers should follow project privacy rules.
- System should be designed so provider choice can be abstracted later.

---

## Flow 4: Edit, Review, and Prepare a Story for Submission

**Goal**\
Allow the user to refine their story and prepare it for publishing or submission into the archive.

**Primary Actor**\
Contributor

**Trigger**\
User returns to an existing draft and chooses to continue editing or prepare it for submission.

**Preconditions**

- Draft exists.
- User is authenticated and owns the draft.

**Main Flow**

1. User opens an existing draft.
2. System loads draft content, associated prompts, and responses.
3. User edits story text and reviews associated metadata.
4. User optionally updates title, summary, tags, time period, people involved, or other metadata fields defined by MVP.
5. System validates required fields.
6. User previews how the story will appear in the archive.
7. User chooses to submit/publish when satisfied.

**Alternate / Edge Paths**

- Required fields are missing.
- Preview reveals that story contains identifying details the user wants to remove.
- User saves changes without submitting.
- User decides to unpublish or revert later if that exists in MVP.

**Postconditions**

- Draft is updated.
- Story may remain a draft or move into submitted/published state depending on user action and workflow design.

**Data Touched**

- Story
- Metadata
- Story status
- Timestamps / update history

**AI Involvement**\
Optional. AI may assist with metadata suggestions or story refinement support if included in MVP.

**Privacy / Trust Considerations**

- User should have a clear sense of what will and will not be public.
- Preview should reflect anonymized or attribution-free presentation.
- System should make it easy to remove or revise sensitive details before publication.

---

## Flow 5: Publish or Submit Story to the Archive

**Goal**\
Move a contributor’s story from private draft into the searchable archive experience according to Chronicle’s publishing rules.

**Primary Actor**\
Contributor

**Trigger**\
User selects publish, submit, or equivalent completion action.

**Preconditions**

- Story meets MVP publishing requirements.
- User is authenticated.
- Any required metadata or acknowledgments are complete.

**Main Flow**

1. User initiates submission/publishing.
2. System validates story completeness and required metadata.
3. System updates story lifecycle status.
4. System prepares story for archive visibility.
5. System stores searchable fields and any discovery-supporting metadata.
6. Story becomes available in archive/discovery contexts according to publication rules.

**Alternate / Edge Paths**

- Validation fails and user is returned to editing.
- Story enters an intermediate review state if moderation/review is added.
- Semantic indexing or metadata enrichment runs after submission and completes later.

**Postconditions**

- Story is in published or submitted state.
- Story may now appear in archive browsing and search experiences.
- Account ownership remains private and separate from public presentation.

**Data Touched**

- Story status
- Archive entry / searchable record
- Metadata
- Optional embeddings / similarity data

**AI Involvement**\
Possible. AI may extract metadata, generate embeddings, or support thematic discovery.

**Privacy / Trust Considerations**

- No public author attribution should be shown.
- Search and archive presentation must not leak account identity.
- Published content rules should be transparent to contributors.

---

## Flow 6: Discover Stories Through the Archive

**Goal**\
Allow a visitor or user to explore published stories through browsing, filtering, and search.

**Primary Actor**\
Archive visitor / reader

**Trigger**\
User visits archive or search experience.

**Preconditions**

- Archive contains published stories.
- Discovery interface is available.

**Main Flow**

1. User enters archive browsing or search page.
2. System displays available stories and/or discovery tools.
3. User browses by theme, period, category, or other metadata dimensions supported by MVP.
4. User may enter search terms.
5. System returns relevant archive entries.
6. User selects a story to view.
7. System shows the story in public archive format without author attribution.

**Alternate / Edge Paths**

- No results match the query.
- Archive is sparse during early pilot and browsing is limited.
- User refines filters or broadens search terms.

**Postconditions**

- User has discovered one or more stories.
- Archive content remains decoupled from contributor identity.

**Data Touched**

- Published stories
- Metadata
- Search index / archive view
- Optional similarity or relevance scoring

**AI Involvement**\
Optional. AI or embeddings may support semantic search, related stories, or theme-based discovery.

**Privacy / Trust Considerations**

- Discovery should prioritize subject matter, not personality or social reputation.
- Story display must not expose account ownership.
- Search results should remain respectful and not over-infer identity from metadata.

---

## Flow 7: View a Story and Explore Related Material

**Goal**\
Allow a reader to engage with a story and optionally navigate to related stories or themes.

**Primary Actor**\
Archive visitor / reader

**Trigger**\
User opens a story from archive results or browsing.

**Preconditions**

- Story is published and visible.

**Main Flow**

1. User selects a story.
2. System loads story content and display metadata.
3. User reads the story.
4. System may present related stories, themes, periods, or linked concepts.
5. User optionally navigates to related material.

**Alternate / Edge Paths**

- Related content is unavailable.
- Metadata is incomplete, so only core story content is shown.

**Postconditions**

- User has consumed story content.
- User may continue deeper into the archive through related discovery paths.

**Data Touched**

- Story content
- Metadata
- Story relationships / similarity links

**AI Involvement**\
Optional. Related-story suggestions may use semantic similarity or metadata association.

**Privacy / Trust Considerations**

- Related links must not imply hidden identity information.
- Relationship logic should favor themes and content, not contributor identity.

---

## Flow 8: Return to Personal Contributions and Manage Existing Stories

**Goal**\
Allow a contributor to view and manage their previously created drafts and published submissions.

**Primary Actor**\
Contributor

**Trigger**\
User opens their private workspace after signing in.

**Preconditions**

- User is authenticated.
- User has existing content.

**Main Flow**

1. User enters private workspace.
2. System displays the user’s content list grouped by status (draft, published, unpublished, deleted if applicable).
3. User selects an item.
4. User views or edits the item depending on status and rules.
5. User may continue a draft, revise published content, or change visibility state if supported.

**Alternate / Edge Paths**

- User has no content yet.
- Selected story is in a locked or archived state.
- User requests deletion or unpublishing if those actions are allowed in MVP.

**Postconditions**

- User regains continuity over their own contributions.
- Chronicle maintains private ownership mapping while preserving public non-attribution.

**Data Touched**

- Account-owned content index
- Story status
- Metadata
- Timestamps / audit-related fields

**AI Involvement**\
None required, though optional aids could exist later.

**Privacy / Trust Considerations**

- Workspace must clearly distinguish private management view from public archive view.
- Ownership data should only be visible to the authenticated owner and authorized system components.

---

## Cross-Flow Observations

### Recurring System Needs

Across the flows above, the Chronicle MVP appears to require:

- authentication and private account workspaces
- draft persistence and recovery
- story lifecycle state management
- public archive rendering without author attribution
- metadata capture and retrieval
- optional AI question generation and enrichment
- search and discovery support
- strict separation between ownership identity and public presentation

### Likely Architectural Pressure Points

These flows suggest early architectural decisions will be needed around:

- where and how drafts are stored
- how story status transitions are modeled
- how AI interactions are triggered and stored
- how metadata is represented
- how archive entries are generated from story records
- how semantic search is phased in or deferred
- how privacy rules are enforced consistently across views

### Likely Next Documents

After this artifact, the most natural follow-ups are:

1. functional requirements and non-functional requirements
2. solution architecture draft
3. initial schema / data design
4. AI feature design for MVP
5. API and service contract outline

---

## Open Questions / Review Notes

- Account creation is included in MVP.

- Publication is immediate in MVP, with no system-level moderation or review step.

- What exact metadata fields are required vs optional for MVP?

- Archive discovery in MVP includes semantic similarity, vector-embedding-based search, and story linking as a core feature, even if the initial experience begins with “search for stories about” style queries.

- Users can unpublish or delete their published stories in MVP.

- The archive should be accessible only to authenticated users in MVP, though that particular decision is one that may change.
