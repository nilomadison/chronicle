# Chronicle Domain Model Draft

## 1. Purpose of This Document
This document defines the core domain concepts for Chronicle MVP. It describes the primary entities that exist in the Chronicle system, what each entity means, and how those entities relate to one another.

This is a conceptual model, not a database schema and not an API specification. Its purpose is to establish a shared understanding of the product’s core nouns, boundaries, and rules before implementation details are designed.

## 2. Domain Modeling Principles
The Chronicle domain model should reflect the product principles already established in the North Star and MVP documents.

In particular:

- The story is the primary public unit of value.
- Public stories are not attributed to visible authors.
- Account identity exists privately for authentication and submission ownership.
- AI assists with reflection, metadata extraction, and discovery, but does not become the author.
- Discovery is based on story meaning, themes, prompts, and relationships between stories.

## 3. Core Domain Entities

### 3.1 Account
An Account is a private identity used to access Chronicle and manage submissions.

An Account exists for:

- authentication,
- ownership of submitted stories,
- access to drafts and previously submitted stories,
- editing, unpublishing, or deleting owned stories.

An Account is not a public-facing profile and should not be visible to readers of published stories.

#### Account Notes
- An Account may own many Stories.
- An Account may create many Drafts.
- An Account may submit Stories in response to Prompts or independently.
- Public readers should not be able to infer account ownership from published content.

### 3.2 Story
A Story is the central narrative artifact in Chronicle.

A Story represents a user-submitted narrative intended for preservation and discovery in the Chronicle archive. It begins as user-authored text and may be refined through AI-assisted follow-up questions and user edits.

A Story may exist in different lifecycle states, including draft and published.

#### Story Notes
- A Story has an owner Account, but that ownership is private.
- A Story may be associated with zero or one Prompt.
- A Story may have many Interview Questions during refinement.
- A Story may have many Interview Responses provided by the storyteller.
- A Story may have one Metadata set or one collection of extracted metadata values.
- A Story may have relationships to many other Stories through similarity or shared themes.

### 3.3 Story Status
Story Status represents the current lifecycle state of a Story.

This exists as a distinct concept because Chronicle needs to treat draft, published, unpublished, and deleted content differently, even if those states are ultimately stored as a field on the Story entity.

For MVP, Story Status may include:

- Draft
- Published
- Unpublished
- Deleted

#### Story Status Notes
- Draft stories are visible only to the owning Account.
- Published stories are visible in the public archive.
- Unpublished stories were previously published or saved, but are no longer public.
- Deleted stories are removed from active use according to system rules.

### 3.4 Prompt
A Prompt is an optional thematic invitation for storytelling.

Prompts help users decide what to write about and help organize clusters of public stories around recurring subjects or memory themes.

Examples might include:

- planting a garden,
- first jobs,
- learning a hard lesson,
- neighborhood memories,
- family traditions.

#### Prompt Notes
- A Prompt may be active for a period of time.
- A Prompt may be associated with many Stories.
- A Story may be submitted without a Prompt.
- Prompts are part of discovery as well as story creation.

### 3.5 Interview Question
An Interview Question is an AI-generated follow-up question associated with a Story during the refinement process.

Its purpose is to help the storyteller elaborate, clarify, and deepen the narrative.

Interview Questions are not the story itself. They are a support mechanism used during drafting and revision.

#### Interview Question Notes
- An Interview Question belongs to one Story.
- A Story may have many Interview Questions.
- Interview Questions are generated after the user provides an initial story draft.
- Interview Questions should remain clearly distinct from final story content.

### 3.6 Interview Response
An Interview Response is a user-provided answer to an Interview Question.

Interview Responses help expand the narrative and may influence the final Story text, but they remain conceptually separate from the AI-generated question itself.

#### Interview Response Notes
- An Interview Response belongs to one Interview Question.
- An Interview Response belongs indirectly to one Story.
- Interview Responses are authored by the user, not the AI.
- The system may use Interview Responses during story refinement, but the user remains the final editor of the Story.

### 3.7 Story Metadata
Story Metadata is structured information extracted from or attached to a Story to support organization and discovery.

Metadata may include:

- themes,
- time period,
- life stage,
- places,
- mentioned people in generalized form,
- emotional tone or emotional context,
- topical keywords,
- prompt association.

Metadata exists to support archive navigation, semantic retrieval, thematic browsing, and related-story discovery.

#### Story Metadata Notes
- Metadata supports discovery but does not replace the story.
- Metadata may be AI-extracted, system-generated, user-edited, or some combination depending on later implementation decisions.
- Metadata should avoid reintroducing unnecessary identifying information.

### 3.8 Story Relationship
A Story Relationship represents a meaningful connection between two Stories.

These connections may be based on:

- semantic similarity,
- shared themes,
- shared prompt participation,
- related life experiences,
- overlapping emotional or topical patterns.

The purpose of Story Relationships is to support related-story recommendations and archive exploration.

#### Story Relationship Notes
- A Story may relate to many other Stories.
- A Story Relationship may include a relation type or similarity basis.
- Story Relationships help readers move through Chronicle as a connected story commons rather than an isolated set of submissions.

### 3.9 Archive Entry
An Archive Entry is the public-facing presence of a published Story inside Chronicle’s searchable story commons.

This concept is useful because the public archive experience may involve more than raw story storage. It may include public listing behavior, indexing, discovery context, prompt association, and related-story placement.

An Archive Entry is not a separate authored object from the Story. It is the public discovery-facing representation of a published Story.

#### Archive Entry Notes
- Only Published Stories have Archive Entries.
- Archive Entries appear in search, browsing, theme exploration, and prompt-based discovery.
- Archive Entries should not expose account ownership or visible author identity.

### 3.10 Search Query
A Search Query represents a reader’s attempt to discover stories in the archive.

Chronicle search is not purely keyword-based. Search is intended to operate on meaning, themes, and semantic similarity.

#### Search Query Notes
- Search Queries may match Stories through metadata, embeddings, indexed text, prompt associations, and other discovery signals.
- Search Queries should return Archive Entries or Story results, not account identities.

### 3.11 Search Result
A Search Result is a returned discovery unit representing a Story or Archive Entry that matches a Search Query.

Search Results should help users find meaningful stories, not just literal text matches.

#### Search Result Notes
- Search Results should include enough information for a reader to decide whether a story is relevant.
- Search Results should not include visible contributor identity.

## 4. Key Relationships
The Chronicle MVP domain can be summarized through these core relationships:

- One Account owns many Stories.
- One Story belongs to one Account.
- One Story has one current Story Status.
- One Story may be associated with zero or one Prompt.
- One Prompt may be associated with many Stories.
- One Story may have many Interview Questions.
- One Interview Question belongs to one Story.
- One Interview Question may have zero or one Interview Response in MVP.
- One Story may have Story Metadata.
- One Story may have many Story Relationships.
- One Published Story has one Archive Entry representation.
- Search Queries return Search Results that point to published Story content in the archive.

## 5. Domain Rules and Constraints

### 5.1 Ownership Is Private
Every Story must be privately owned by an Account, but that ownership is not publicly visible.

### 5.2 Publication Does Not Create Public Attribution
Publishing a Story makes it discoverable in the archive, but does not expose the contributor’s account identity.

### 5.3 The Story Is the Primary Public Object
Readers interact primarily with Stories and their archive representations, not with people, profiles, or social identity layers.

### 5.4 AI Is Supportive, Not Authorial
AI may generate Interview Questions and metadata, but the user remains the author of the Story.

### 5.5 Prompts Are Optional
A Prompt may help initiate a Story, but Prompt participation is not required for story creation or publication.

### 5.6 Metadata Supports Discovery
Metadata exists to improve retrieval and thematic exploration. It should support public discovery without overpowering the narrative itself.

### 5.7 Published Stories Must Be Discoverable
A Published Story must be available to the archive and discovery mechanisms defined by the MVP, including search, theme-based exploration, prompt association where applicable, and related-story navigation.

### 5.8 Draft and Public Representations Must Be Treated Differently
Draft content is private to the owner Account. Published content is visible through the archive. The system must preserve this distinction clearly.

## 6. Conceptual Entity Summary

### Account
Private identity for login, ownership, and story management.

### Story
Primary narrative artifact created by a user.

### Story Status
Lifecycle state of a Story.

### Prompt
Optional community storytelling theme.

### Interview Question
AI-generated follow-up question used during story refinement.

### Interview Response
User-authored answer to a follow-up question.

### Story Metadata
Structured discovery information attached to a Story.

### Story Relationship
Connection between Stories for related-story discovery.

### Archive Entry
Public discovery-facing representation of a Published Story.

### Search Query
Reader search input used to discover stories.

### Search Result
Discovery result returned from archive search.

## 7. Boundary Between Domain Model and Implementation
This domain model does not yet decide:

- which entities become database tables,
- whether some concepts are modeled as objects, enums, or computed views,
- how embeddings or vector search are stored,
- how metadata extraction is implemented,
- how AI prompting is orchestrated,
- how indexing and retrieval pipelines are built.

Those decisions belong to later documents such as the technical architecture, data model, and implementation plan.

## 8. Working Summary
Chronicle’s domain is centered on a privately owned but publicly unattributed Story. The system exists to help users create stories, refine them through AI-assisted reflection, publish them into a shared archive, and connect those stories through prompts, metadata, search, and related-story discovery.

If the domain model is sound, later technical decisions will have a stable conceptual foundation.

