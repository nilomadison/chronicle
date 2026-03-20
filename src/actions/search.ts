"use server";

import { db, sql } from "@/db";
import { stories, storyTags } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAIProvider } from "@/lib/ai/provider";
import type { ArchiveStory } from "./archive";

export type SearchResult = ArchiveStory & {
  relevance: number;
  excerpt: string;
};

/**
 * Hybrid search: vector similarity + full-text
 */
export async function searchArchive(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    // Generate embedding for the search query
    const aiProvider = getAIProvider();
    const queryEmbedding = await aiProvider.generateEmbedding(query);
    const vectorStr = `[${queryEmbedding.join(",")}]`;

    // Hybrid search: combine vector similarity with full-text
    const results = await sql`
      WITH vector_results AS (
        SELECT
          se.story_id,
          1 - (se.embedding <=> ${vectorStr}::vector) AS vector_score
        FROM story_embeddings se
        JOIN stories s ON s.id = se.story_id
        WHERE s.status = 'published'
          AND se.embedding IS NOT NULL
        ORDER BY se.embedding <=> ${vectorStr}::vector
        LIMIT 20
      ),
      text_results AS (
        SELECT
          s.id AS story_id,
          ts_rank(
            to_tsvector('english', coalesce(s.title, '') || ' ' || coalesce(s.body, '')),
            plainto_tsquery('english', ${query})
          ) AS text_score
        FROM stories s
        WHERE s.status = 'published'
          AND to_tsvector('english', coalesce(s.title, '') || ' ' || coalesce(s.body, ''))
              @@ plainto_tsquery('english', ${query})
      )
      SELECT
        COALESCE(v.story_id, t.story_id) AS story_id,
        COALESCE(v.vector_score, 0) * 0.7 + COALESCE(t.text_score, 0) * 0.3 AS combined_score
      FROM vector_results v
      FULL OUTER JOIN text_results t ON v.story_id = t.story_id
      ORDER BY combined_score DESC
      LIMIT 20
    `;

    // Fetch full story data for results
    const searchResults: SearchResult[] = [];
    for (const row of results) {
      const [story] = await db
        .select({
          id: stories.id,
          title: stories.title,
          body: stories.body,
          publishedAt: stories.publishedAt,
          promptId: stories.promptId,
        })
        .from(stories)
        .where(eq(stories.id, row.story_id as string))
        .limit(1);

      if (!story) continue;

      const tags = await db
        .select({ tag: storyTags.tag })
        .from(storyTags)
        .where(eq(storyTags.storyId, story.id));

      const body = story.body || "";
      const excerpt = body.length > 250 ? body.slice(0, 250) + "…" : body;

      searchResults.push({
        id: story.id,
        title: story.title || "Untitled",
        body,
        publishedAt: story.publishedAt || new Date(),
        tags: tags.map((t) => t.tag),
        promptId: story.promptId,
        relevance: row.combined_score as number,
        excerpt,
      });
    }

    return searchResults;
  } catch {
    // Fallback to simple text search if vector search fails
    const results = await db
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
      .limit(20);

    const searchResults: SearchResult[] = [];
    for (const story of results) {
      const body = story.body || "";
      const titleMatch = (story.title || "").toLowerCase().includes(query.toLowerCase());
      const bodyMatch = body.toLowerCase().includes(query.toLowerCase());

      if (titleMatch || bodyMatch) {
        const tags = await db
          .select({ tag: storyTags.tag })
          .from(storyTags)
          .where(eq(storyTags.storyId, story.id));

        searchResults.push({
          id: story.id,
          title: story.title || "Untitled",
          body,
          publishedAt: story.publishedAt || new Date(),
          tags: tags.map((t) => t.tag),
          promptId: story.promptId,
          relevance: titleMatch ? 1 : 0.5,
          excerpt: body.length > 250 ? body.slice(0, 250) + "…" : body,
        });
      }
    }

    return searchResults;
  }
}
