"use server";

import { db } from "@/db";
import { stories, interviewQuestions, interviewResponses } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai/provider";
import { eq, and } from "drizzle-orm";

const MIN_WORD_COUNT = 30;

/**
 * Generate follow-up questions for a story
 */
export async function generateQuestions(storyId: string) {
  const session = await requireAuth();

  // Get the story with ownership check
  const [story] = await db
    .select()
    .from(stories)
    .where(and(eq(stories.id, storyId), eq(stories.accountId, session.user.id)))
    .limit(1);

  if (!story) {
    throw new Error("Story not found");
  }

  if (!story.body) {
    throw new Error("Story has no content yet");
  }

  const wordCount = story.body.split(/\s+/).filter(Boolean).length;
  if (wordCount < MIN_WORD_COUNT) {
    throw new Error(
      `Story needs at least ${MIN_WORD_COUNT} words for reflection questions. Currently ${wordCount} words.`
    );
  }

  // Check if questions already exist
  const existing = await db
    .select()
    .from(interviewQuestions)
    .where(eq(interviewQuestions.storyId, storyId));

  if (existing.length > 0) {
    return existing;
  }

  // Generate questions via AI
  const aiProvider = getAIProvider();
  const questions = await aiProvider.generateFollowUpQuestions(story.body);

  // Store questions
  const inserted = [];
  for (let i = 0; i < questions.length; i++) {
    const [q] = await db
      .insert(interviewQuestions)
      .values({
        storyId,
        questionText: questions[i],
        sortOrder: i,
      })
      .returning();
    inserted.push(q);
  }

  return inserted;
}

/**
 * Save a response to an interview question
 */
export async function saveResponse(questionId: string, responseText: string) {
  const session = await requireAuth();

  // Verify ownership through the question's story
  const [question] = await db
    .select({
      id: interviewQuestions.id,
      storyId: interviewQuestions.storyId,
    })
    .from(interviewQuestions)
    .where(eq(interviewQuestions.id, questionId))
    .limit(1);

  if (!question) throw new Error("Question not found");

  const [story] = await db
    .select({ accountId: stories.accountId })
    .from(stories)
    .where(eq(stories.id, question.storyId))
    .limit(1);

  if (!story || story.accountId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  // Upsert response
  const [existing] = await db
    .select()
    .from(interviewResponses)
    .where(eq(interviewResponses.questionId, questionId))
    .limit(1);

  if (existing) {
    await db
      .update(interviewResponses)
      .set({ responseText })
      .where(eq(interviewResponses.id, existing.id));
  } else {
    await db.insert(interviewResponses).values({
      questionId,
      responseText,
    });
  }

  return { success: true };
}

/**
 * Get interview data (questions + responses) for a story
 */
export async function getInterviewForStory(storyId: string) {
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

  const result = [];
  for (const q of questions) {
    const [response] = await db
      .select()
      .from(interviewResponses)
      .where(eq(interviewResponses.questionId, q.id))
      .limit(1);

    result.push({
      id: q.id,
      questionText: q.questionText,
      sortOrder: q.sortOrder,
      response: response?.responseText || null,
    });
  }

  return result;
}
