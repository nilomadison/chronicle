import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  real,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ===== Enums =====

export const storyStatusEnum = pgEnum("story_status", [
  "draft",
  "published",
  "unpublished",
  "deleted",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

// ===== Accounts =====

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  stories: many(stories),
}));

// ===== Stories =====

export const stories = pgTable(
  "stories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    accountId: uuid("account_id")
      .references(() => accounts.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 500 }),
    body: text("body"),
    status: storyStatusEnum("status").default("draft").notNull(),
    promptId: uuid("prompt_id").references(() => prompts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("stories_account_id_idx").on(table.accountId),
    index("stories_status_idx").on(table.status),
    index("stories_prompt_id_idx").on(table.promptId),
    index("stories_published_at_idx").on(table.publishedAt),
  ]
);

export const storiesRelations = relations(stories, ({ one, many }) => ({
  account: one(accounts, {
    fields: [stories.accountId],
    references: [accounts.id],
  }),
  prompt: one(prompts, {
    fields: [stories.promptId],
    references: [prompts.id],
  }),
  interviewQuestions: many(interviewQuestions),
  tags: many(storyTags),
  metadata: one(storyMetadata),
  embedding: one(storyEmbeddings),
  relationshipsAsA: many(storyRelationships, { relationName: "storyA" }),
  relationshipsAsB: many(storyRelationships, { relationName: "storyB" }),
}));

// ===== Prompts =====

export const prompts = pgTable("prompts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const promptsRelations = relations(prompts, ({ many }) => ({
  stories: many(stories),
}));

// ===== Interview Questions =====

export const interviewQuestions = pgTable(
  "interview_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storyId: uuid("story_id")
      .references(() => stories.id, { onDelete: "cascade" })
      .notNull(),
    questionText: text("question_text").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("interview_questions_story_id_idx").on(table.storyId)]
);

export const interviewQuestionsRelations = relations(
  interviewQuestions,
  ({ one }) => ({
    story: one(stories, {
      fields: [interviewQuestions.storyId],
      references: [stories.id],
    }),
    response: one(interviewResponses),
  })
);

// ===== Interview Responses =====

export const interviewResponses = pgTable("interview_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id")
    .references(() => interviewQuestions.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  responseText: text("response_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const interviewResponsesRelations = relations(
  interviewResponses,
  ({ one }) => ({
    question: one(interviewQuestions, {
      fields: [interviewResponses.questionId],
      references: [interviewQuestions.id],
    }),
  })
);

// ===== Story Tags (User-editable, visible on archive) =====

export const storyTags = pgTable(
  "story_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storyId: uuid("story_id")
      .references(() => stories.id, { onDelete: "cascade" })
      .notNull(),
    tag: varchar("tag", { length: 100 }).notNull(),
  },
  (table) => [
    index("story_tags_story_id_idx").on(table.storyId),
    index("story_tags_tag_idx").on(table.tag),
    uniqueIndex("story_tags_story_tag_unique").on(table.storyId, table.tag),
  ]
);

export const storyTagsRelations = relations(storyTags, ({ one }) => ({
  story: one(stories, {
    fields: [storyTags.storyId],
    references: [stories.id],
  }),
}));

// ===== Story Metadata (AI-generated, hidden — used for discovery) =====

export const storyMetadata = pgTable(
  "story_metadata",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storyId: uuid("story_id")
      .references(() => stories.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    themes: text("themes").array(),
    timePeriod: varchar("time_period", { length: 100 }),
    lifeStage: varchar("life_stage", { length: 100 }),
    places: text("places").array(),
    people: text("people").array(),
    emotionalTone: varchar("emotional_tone", { length: 100 }),
    keywords: text("keywords").array(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("story_metadata_story_id_idx").on(table.storyId)]
);

export const storyMetadataRelations = relations(storyMetadata, ({ one }) => ({
  story: one(stories, {
    fields: [storyMetadata.storyId],
    references: [stories.id],
  }),
}));

// ===== Story Embeddings (pgvector) =====
// Note: The vector column is handled via raw SQL in migration since
// drizzle-orm doesn't have native vector type support yet.
// We store a placeholder here and use customType or raw queries.

export const storyEmbeddings = pgTable(
  "story_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storyId: uuid("story_id")
      .references(() => stories.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    // embedding vector(1536) is added via raw SQL migration
    modelVersion: varchar("model_version", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("story_embeddings_story_id_idx").on(table.storyId)]
);

export const storyEmbeddingsRelations = relations(
  storyEmbeddings,
  ({ one }) => ({
    story: one(stories, {
      fields: [storyEmbeddings.storyId],
      references: [stories.id],
    }),
  })
);

// ===== Story Relationships =====

export const storyRelationships = pgTable(
  "story_relationships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storyAId: uuid("story_a_id")
      .references(() => stories.id, { onDelete: "cascade" })
      .notNull(),
    storyBId: uuid("story_b_id")
      .references(() => stories.id, { onDelete: "cascade" })
      .notNull(),
    relationType: varchar("relation_type", { length: 50 }),
    similarityScore: real("similarity_score"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("story_relationships_story_a_idx").on(table.storyAId),
    index("story_relationships_story_b_idx").on(table.storyBId),
    uniqueIndex("story_relationships_pair_unique").on(
      table.storyAId,
      table.storyBId
    ),
  ]
);

export const storyRelationshipsRelations = relations(
  storyRelationships,
  ({ one }) => ({
    storyA: one(stories, {
      fields: [storyRelationships.storyAId],
      references: [stories.id],
      relationName: "storyA",
    }),
    storyB: one(stories, {
      fields: [storyRelationships.storyBId],
      references: [stories.id],
      relationName: "storyB",
    }),
  })
);

// ===== Background Jobs =====

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 100 }).notNull(),
    payload: jsonb("payload"),
    status: jobStatusEnum("status").default("pending").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    error: text("error"),
  },
  (table) => [
    index("jobs_status_idx").on(table.status),
    index("jobs_type_idx").on(table.type),
  ]
);
