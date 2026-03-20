"use server";

import { db } from "@/db";
import { stories, storyTags, interviewQuestions, interviewResponses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and, desc, ne } from "drizzle-orm";
import { redirect } from "next/navigation";

export type StoryWithTags = {
  id: string;
  title: string | null;
  body: string | null;
  status: "draft" | "published" | "unpublished" | "deleted";
  promptId: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  tags: string[];
};

/**
 * Create a new draft story
 */
export async function createDraft(promptId?: string) {
  const session = await requireAuth();

  const [story] = await db
    .insert(stories)
    .values({
      accountId: session.user.id,
      status: "draft",
      promptId: promptId || null,
    })
    .returning();

  redirect(`/stories/${story.id}/edit`);
}

/**
 * Save draft content (title, body)
 */
export async function saveDraft(
  storyId: string,
  data: { title?: string; body?: string }
) {
  const session = await requireAuth();

  await db
    .update(stories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(stories.id, storyId), eq(stories.accountId, session.user.id)));

  return { success: true };
}

/**
 * Get a story owned by the current user
 */
export async function getOwnStory(storyId: string): Promise<StoryWithTags | null> {
  const session = await requireAuth();

  const [story] = await db
    .select()
    .from(stories)
    .where(
      and(
        eq(stories.id, storyId),
        eq(stories.accountId, session.user.id),
        ne(stories.status, "deleted")
      )
    )
    .limit(1);

  if (!story) return null;

  const tags = await db
    .select({ tag: storyTags.tag })
    .from(storyTags)
    .where(eq(storyTags.storyId, storyId));

  return {
    id: story.id,
    title: story.title,
    body: story.body,
    status: story.status,
    promptId: story.promptId,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
    publishedAt: story.publishedAt,
    tags: tags.map((t) => t.tag),
  };
}

/**
 * List own stories grouped by status
 */
export async function listOwnStories(status?: string) {
  const session = await requireAuth();

  const conditions = [
    eq(stories.accountId, session.user.id),
    ne(stories.status, "deleted"),
  ];

  if (status && status !== "all") {
    conditions.push(
      eq(stories.status, status as "draft" | "published" | "unpublished")
    );
  }

  const result = await db
    .select()
    .from(stories)
    .where(and(...conditions))
    .orderBy(desc(stories.updatedAt));

  // Fetch tags for all stories
  const storyIds = result.map((s) => s.id);
  const allTags =
    storyIds.length > 0
      ? await db
          .select()
          .from(storyTags)
          .where(
            // Simple IN query
            storyIds.length === 1
              ? eq(storyTags.storyId, storyIds[0])
              : eq(storyTags.storyId, storyIds[0]) // We'll handle below
          )
      : [];

  // For simplicity in MVP, fetch tags per story  
  const storiesWithTags: StoryWithTags[] = [];
  for (const story of result) {
    const tags = await db
      .select({ tag: storyTags.tag })
      .from(storyTags)
      .where(eq(storyTags.storyId, story.id));

    storiesWithTags.push({
      id: story.id,
      title: story.title,
      body: story.body,
      status: story.status,
      promptId: story.promptId,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      publishedAt: story.publishedAt,
      tags: tags.map((t) => t.tag),
    });
  }

  return storiesWithTags;
}

/**
 * Soft delete a story
 */
export async function deleteStory(storyId: string) {
  const session = await requireAuth();

  await db
    .update(stories)
    .set({
      status: "deleted",
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(stories.id, storyId), eq(stories.accountId, session.user.id)));

  return { success: true };
}

/**
 * Update tags for a story
 */
export async function updateStoryTags(storyId: string, tags: string[]) {
  const session = await requireAuth();

  // Verify ownership
  const [story] = await db
    .select({ id: stories.id })
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.accountId, session.user.id)))
    .limit(1);

  if (!story) throw new Error("Story not found");

  // Delete existing tags
  await db.delete(storyTags).where(eq(storyTags.storyId, storyId));

  // Insert new tags
  const uniqueTags = [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
  if (uniqueTags.length > 0) {
    await db.insert(storyTags).values(
      uniqueTags.map((tag) => ({
        storyId,
        tag,
      }))
    );
  }

  return { success: true };
}

/**
 * Get interview data for a story
 */
export async function getStoryInterview(storyId: string) {
  const session = await requireAuth();

  // Verify ownership
  const [story] = await db
    .select({ id: stories.id })
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.accountId, session.user.id)))
    .limit(1);

  if (!story) return null;

  const questions = await db
    .select()
    .from(interviewQuestions)
    .where(eq(interviewQuestions.storyId, storyId))
    .orderBy(interviewQuestions.sortOrder);

  const questionsWithResponses = [];
  for (const q of questions) {
    const [response] = await db
      .select()
      .from(interviewResponses)
      .where(eq(interviewResponses.questionId, q.id))
      .limit(1);

    questionsWithResponses.push({
      ...q,
      response: response || null,
    });
  }

  return questionsWithResponses;
}
