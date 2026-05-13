"use server";

import { db } from "@/db";
import {
  stories,
  readerMarks,
  echoNotes,
  storyViews,
} from "@/db/schema";
import { requireAuth, getSession } from "@/lib/auth";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";

export type MarkType = "resonated" | "recognized" | "reflected";
export type ViewSource =
  | "direct"
  | "archive"
  | "search"
  | "related"
  | "prompt"
  | "theme";

const ECHO_NOTE_MIN = 3;
const ECHO_NOTE_MAX = 600;

// Light abuse filter: reject notes that are clearly not notes.
// Keeps the implementation simple; LLM moderation is a later wave.
const BLOCKED_PATTERNS: RegExp[] = [
  /https?:\/\//i, // links
  /\b(?:fuck|shit|bitch|cunt|nigger|faggot)\w*/i, // obvious abuse
];

function screenEchoNote(text: string): { ok: true } | { ok: false; reason: string } {
  const trimmed = text.trim();
  if (trimmed.length < ECHO_NOTE_MIN) {
    return { ok: false, reason: "too_short" };
  }
  if (trimmed.length > ECHO_NOTE_MAX) {
    return { ok: false, reason: "too_long" };
  }
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { ok: false, reason: "blocked_content" };
    }
  }
  return { ok: true };
}

/**
 * Mark a published story. No-op if the same mark already exists.
 * Returns the reader's current set of marks for this story.
 */
export async function markStory(storyId: string, markType: MarkType) {
  const session = await requireAuth();

  const [story] = await db
    .select({ id: stories.id, accountId: stories.accountId, status: stories.status })
    .from(stories)
    .where(eq(stories.id, storyId))
    .limit(1);

  if (!story || story.status !== "published") {
    throw new Error("Story not found");
  }

  if (story.accountId === session.user.id) {
    // Authors cannot mark their own stories.
    throw new Error("Cannot mark your own story");
  }

  await db
    .insert(readerMarks)
    .values({
      storyId,
      readerAccountId: session.user.id,
      markType,
    })
    .onConflictDoNothing();

  return await getReaderMarks(storyId);
}

/**
 * Remove a reader's mark of a specific type from a story.
 */
export async function unmarkStory(storyId: string, markType: MarkType) {
  const session = await requireAuth();

  await db
    .delete(readerMarks)
    .where(
      and(
        eq(readerMarks.storyId, storyId),
        eq(readerMarks.readerAccountId, session.user.id),
        eq(readerMarks.markType, markType)
      )
    );

  return await getReaderMarks(storyId);
}

/**
 * Check if the current viewer is the author of a story. Returns false when
 * signed out. Used to hide resonance controls on the viewer's own work.
 */
export async function isStoryAuthor(storyId: string): Promise<boolean> {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const [story] = await db
    .select({ accountId: stories.accountId })
    .from(stories)
    .where(eq(stories.id, storyId))
    .limit(1);

  return story?.accountId === session.user.id;
}

/**
 * Get the current reader's marks on a story. Returns [] if not signed in.
 */
export async function getReaderMarks(storyId: string): Promise<MarkType[]> {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const rows = await db
    .select({ markType: readerMarks.markType })
    .from(readerMarks)
    .where(
      and(
        eq(readerMarks.storyId, storyId),
        eq(readerMarks.readerAccountId, session.user.id)
      )
    );

  return rows.map((r) => r.markType as MarkType);
}

/**
 * Submit an echo note to a story's author. Applies light abuse filtering.
 * Notes flagged by the filter are stored as rejected for auditability but
 * never delivered to the author.
 */
export async function submitEchoNote(storyId: string, noteText: string) {
  const session = await requireAuth();

  const [story] = await db
    .select({ id: stories.id, accountId: stories.accountId, status: stories.status })
    .from(stories)
    .where(eq(stories.id, storyId))
    .limit(1);

  if (!story || story.status !== "published") {
    throw new Error("Story not found");
  }

  if (story.accountId === session.user.id) {
    throw new Error("Cannot send an echo note to yourself");
  }

  const screening = screenEchoNote(noteText);

  if (!screening.ok) {
    await db.insert(echoNotes).values({
      storyId,
      readerAccountId: session.user.id,
      noteText: noteText.slice(0, ECHO_NOTE_MAX),
      status: "rejected",
      rejectionReason: screening.reason,
    });
    return { success: false, reason: screening.reason };
  }

  await db.insert(echoNotes).values({
    storyId,
    readerAccountId: session.user.id,
    noteText: noteText.trim(),
    status: "delivered",
    deliveredAt: new Date(),
  });

  return { success: true };
}

/**
 * Record a view on a published story. Author's own views are ignored.
 * Fails silently if anything goes wrong — view recording must never
 * interrupt the reader's experience.
 */
export async function recordStoryView(storyId: string, source: ViewSource) {
  try {
    const session = await getSession();
    const viewerId = session?.user?.id ?? null;

    // Don't count the author's own views.
    if (viewerId) {
      const [story] = await db
        .select({ accountId: stories.accountId, status: stories.status })
        .from(stories)
        .where(eq(stories.id, storyId))
        .limit(1);

      if (!story || story.status !== "published") return;
      if (story.accountId === viewerId) return;
    }

    await db.insert(storyViews).values({
      storyId,
      viewerAccountId: viewerId,
      source,
    });
  } catch {
    // Intentionally swallow — views are a best-effort signal.
  }
}

export type StoryResonance = {
  storyId: string;
  title: string;
  marks: Record<MarkType, number>;
  views30d: number;
  viewsAllTime: number;
  viewsBySource: Record<ViewSource, number>;
  undeliveredEchoNotes: number;
};

/**
 * Aggregate author-facing resonance stats across the author's published stories.
 * Private to the author — call from their dashboard only.
 */
export async function getAuthorResonance(): Promise<StoryResonance[]> {
  const session = await requireAuth();

  const published = await db
    .select({ id: stories.id, title: stories.title })
    .from(stories)
    .where(
      and(
        eq(stories.accountId, session.user.id),
        eq(stories.status, "published")
      )
    );

  if (published.length === 0) return [];

  const storyIds = published.map((s) => s.id);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const markRows = await db
    .select({
      storyId: readerMarks.storyId,
      markType: readerMarks.markType,
      count: sql<number>`count(*)::int`,
    })
    .from(readerMarks)
    .where(inArray(readerMarks.storyId, storyIds))
    .groupBy(readerMarks.storyId, readerMarks.markType);

  const viewsAllRows = await db
    .select({
      storyId: storyViews.storyId,
      source: storyViews.source,
      count: sql<number>`count(*)::int`,
    })
    .from(storyViews)
    .where(inArray(storyViews.storyId, storyIds))
    .groupBy(storyViews.storyId, storyViews.source);

  const views30dRows = await db
    .select({
      storyId: storyViews.storyId,
      count: sql<number>`count(*)::int`,
    })
    .from(storyViews)
    .where(
      and(
        inArray(storyViews.storyId, storyIds),
        gte(storyViews.createdAt, thirtyDaysAgo)
      )
    )
    .groupBy(storyViews.storyId);

  const unreadEchoRows = await db
    .select({
      storyId: echoNotes.storyId,
      count: sql<number>`count(*)::int`,
    })
    .from(echoNotes)
    .where(
      and(
        inArray(echoNotes.storyId, storyIds),
        eq(echoNotes.status, "delivered"),
        sql`${echoNotes.readAt} IS NULL`
      )
    )
    .groupBy(echoNotes.storyId);

  const byStory = new Map<string, StoryResonance>();
  for (const s of published) {
    byStory.set(s.id, {
      storyId: s.id,
      title: s.title || "Untitled",
      marks: { resonated: 0, recognized: 0, reflected: 0 },
      views30d: 0,
      viewsAllTime: 0,
      viewsBySource: {
        direct: 0,
        archive: 0,
        search: 0,
        related: 0,
        prompt: 0,
        theme: 0,
      },
      undeliveredEchoNotes: 0,
    });
  }

  for (const row of markRows) {
    const entry = byStory.get(row.storyId);
    if (entry) entry.marks[row.markType as MarkType] = row.count;
  }

  for (const row of viewsAllRows) {
    const entry = byStory.get(row.storyId);
    if (entry) {
      entry.viewsBySource[row.source as ViewSource] = row.count;
      entry.viewsAllTime += row.count;
    }
  }

  for (const row of views30dRows) {
    const entry = byStory.get(row.storyId);
    if (entry) entry.views30d = row.count;
  }

  for (const row of unreadEchoRows) {
    const entry = byStory.get(row.storyId);
    if (entry) entry.undeliveredEchoNotes = row.count;
  }

  return Array.from(byStory.values()).sort(
    (a, b) => b.viewsAllTime - a.viewsAllTime
  );
}

export type EchoNoteForAuthor = {
  id: string;
  storyId: string;
  storyTitle: string;
  noteText: string;
  createdAt: Date;
  readAt: Date | null;
};

/**
 * List echo notes delivered to the current author, newest first.
 */
export async function listEchoNotes(): Promise<EchoNoteForAuthor[]> {
  const session = await requireAuth();

  const rows = await db
    .select({
      id: echoNotes.id,
      storyId: echoNotes.storyId,
      storyTitle: stories.title,
      noteText: echoNotes.noteText,
      createdAt: echoNotes.createdAt,
      readAt: echoNotes.readAt,
    })
    .from(echoNotes)
    .innerJoin(stories, eq(stories.id, echoNotes.storyId))
    .where(
      and(
        eq(stories.accountId, session.user.id),
        eq(echoNotes.status, "delivered")
      )
    )
    .orderBy(desc(echoNotes.createdAt))
    .limit(50);

  return rows.map((r) => ({
    id: r.id,
    storyId: r.storyId,
    storyTitle: r.storyTitle || "Untitled",
    noteText: r.noteText,
    createdAt: r.createdAt,
    readAt: r.readAt,
  }));
}

/**
 * Mark a delivered echo note as read by the author.
 */
export async function markEchoNoteRead(echoNoteId: string) {
  const session = await requireAuth();

  // Ownership check via story join.
  const [note] = await db
    .select({
      id: echoNotes.id,
      ownerId: stories.accountId,
    })
    .from(echoNotes)
    .innerJoin(stories, eq(stories.id, echoNotes.storyId))
    .where(eq(echoNotes.id, echoNoteId))
    .limit(1);

  if (!note || note.ownerId !== session.user.id) {
    throw new Error("Echo note not found");
  }

  await db
    .update(echoNotes)
    .set({ readAt: new Date() })
    .where(eq(echoNotes.id, echoNoteId));

  return { success: true };
}
