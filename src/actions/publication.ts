"use server";

import { db } from "@/db";
import { stories, jobs } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { canTransition, validateForPublish, type StoryStatus } from "@/lib/domain/lifecycle";

/**
 * Publish a story to the archive
 */
export async function publishStory(storyId: string) {
  const session = await requireAuth();

  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.accountId, session.user.id)))
    .limit(1);

  if (!story) throw new Error("Story not found");

  // Validate lifecycle transition
  if (!canTransition(story.status as StoryStatus, "published")) {
    throw new Error(`Cannot publish a story that is currently ${story.status}`);
  }

  // Validate content
  const errors = validateForPublish({ title: story.title, body: story.body });
  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Transition to published
  await db
    .update(stories)
    .set({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(stories.id, storyId));

  // Queue enrichment jobs
  await db.insert(jobs).values([
    {
      type: "extract_metadata",
      payload: { storyId },
      status: "pending",
    },
    {
      type: "generate_embedding",
      payload: { storyId },
      status: "pending",
    },
  ]);

  return { success: true, errors: [] };
}

/**
 * Unpublish a story (remove from archive)
 */
export async function unpublishStory(storyId: string) {
  const session = await requireAuth();

  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.accountId, session.user.id)))
    .limit(1);

  if (!story) throw new Error("Story not found");

  if (!canTransition(story.status as StoryStatus, "unpublished")) {
    throw new Error(
      `Cannot unpublish a story that is currently ${story.status}`
    );
  }

  await db
    .update(stories)
    .set({
      status: "unpublished",
      updatedAt: new Date(),
    })
    .where(eq(stories.id, storyId));

  return { success: true };
}
