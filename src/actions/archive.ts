"use server";

import { db, sql } from "@/db";
import { stories, storyTags, storyMetadata, storyRelationships, prompts, interviewQuestions, interviewResponses } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export type ArchiveStory = {
  id: string;
  title: string;
  body: string;
  publishedAt: Date;
  tags: string[];
  promptId: string | null;
  promptTitle?: string;
};

/**
 * List published archive stories (paginated, no account_id)
 */
export async function listArchiveStories(page = 1, perPage = 12) {
  const offset = (page - 1) * perPage;

  const result = await db
    .select({
      id: stories.id,
      title: stories.title,
      body: stories.body,
      publishedAt: stories.publishedAt,
      promptId: stories.promptId,
    })
    .from(stories)
    .where(eq(stories.status, "published"))
    .orderBy(desc(stories.publishedAt))
    .limit(perPage)
    .offset(offset);

  const archiveStories: ArchiveStory[] = [];
  for (const s of result) {
    const tags = await db
      .select({ tag: storyTags.tag })
      .from(storyTags)
      .where(eq(storyTags.storyId, s.id));

    let promptTitle: string | undefined;
    if (s.promptId) {
      const [p] = await db
        .select({ title: prompts.title })
        .from(prompts)
        .where(eq(prompts.id, s.promptId))
        .limit(1);
      promptTitle = p?.title;
    }

    archiveStories.push({
      id: s.id,
      title: s.title || "Untitled",
      body: s.body || "",
      publishedAt: s.publishedAt || new Date(),
      tags: tags.map((t) => t.tag),
      promptId: s.promptId,
      promptTitle,
    });
  }

  return archiveStories;
}

/**
 * Get a single published story for the archive (no account_id)
 */
export async function getArchiveStory(storyId: string) {
  const [story] = await db
    .select({
      id: stories.id,
      title: stories.title,
      body: stories.body,
      publishedAt: stories.publishedAt,
      promptId: stories.promptId,
    })
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.status, "published")))
    .limit(1);

  if (!story) return null;

  const tags = await db
    .select({ tag: storyTags.tag })
    .from(storyTags)
    .where(eq(storyTags.storyId, storyId));

  let promptTitle: string | undefined;
  if (story.promptId) {
    const [p] = await db
      .select({ title: prompts.title })
      .from(prompts)
      .where(eq(prompts.id, story.promptId))
      .limit(1);
    promptTitle = p?.title;
  }

  return {
    id: story.id,
    title: story.title || "Untitled",
    body: story.body || "",
    publishedAt: story.publishedAt || new Date(),
    tags: tags.map((t) => t.tag),
    promptId: story.promptId,
    promptTitle,
  };
}

/**
 * Get related stories for a story
 */
export async function getRelatedStories(storyId: string) {
  const relationships = await db
    .select()
    .from(storyRelationships)
    .where(eq(storyRelationships.storyAId, storyId))
    .orderBy(desc(storyRelationships.similarityScore))
    .limit(5);

  const related: ArchiveStory[] = [];
  for (const rel of relationships) {
    const story = await getArchiveStory(rel.storyBId);
    if (story) related.push(story);
  }

  return related;
}

/**
 * Get answered reflection questions for an archive story (public, no auth)
 */
export async function getReflectionsForArchiveStory(storyId: string) {
  const questions = await db
    .select()
    .from(interviewQuestions)
    .where(eq(interviewQuestions.storyId, storyId))
    .orderBy(interviewQuestions.sortOrder);

  const reflections: { questionText: string; responseText: string }[] = [];
  for (const q of questions) {
    const [response] = await db
      .select()
      .from(interviewResponses)
      .where(eq(interviewResponses.questionId, q.id))
      .limit(1);

    if (response) {
      reflections.push({
        questionText: q.questionText,
        responseText: response.responseText,
      });
    }
  }

  return reflections;
}

/**
 * List active prompts
 */
export async function listActivePrompts() {
  return await db
    .select()
    .from(prompts)
    .where(eq(prompts.isActive, true));
}

/**
 * Get stories by prompt
 */
export async function getStoriesByPrompt(promptId: string) {
  return await listArchiveStoriesFiltered({ promptId });
}

/**
 * Get stories by tag/theme
 */
export async function getStoriesByTheme(theme: string) {
  const taggedStoryIds = await db
    .select({ storyId: storyTags.storyId })
    .from(storyTags)
    .where(eq(storyTags.tag, theme.toLowerCase()));

  const archiveStories: ArchiveStory[] = [];
  for (const { storyId } of taggedStoryIds) {
    const story = await getArchiveStory(storyId);
    if (story) archiveStories.push(story);
  }

  return archiveStories;
}

async function listArchiveStoriesFiltered(filters: { promptId?: string }) {
  const conditions = [eq(stories.status, "published" as const)];
  if (filters.promptId) {
    conditions.push(eq(stories.promptId, filters.promptId));
  }

  const result = await db
    .select({
      id: stories.id,
      title: stories.title,
      body: stories.body,
      publishedAt: stories.publishedAt,
      promptId: stories.promptId,
    })
    .from(stories)
    .where(and(...conditions))
    .orderBy(desc(stories.publishedAt));

  const archiveStories: ArchiveStory[] = [];
  for (const s of result) {
    const tags = await db
      .select({ tag: storyTags.tag })
      .from(storyTags)
      .where(eq(storyTags.storyId, s.id));

    archiveStories.push({
      id: s.id,
      title: s.title || "Untitled",
      body: s.body || "",
      publishedAt: s.publishedAt || new Date(),
      tags: tags.map((t) => t.tag),
      promptId: s.promptId,
    });
  }

  return archiveStories;
}
