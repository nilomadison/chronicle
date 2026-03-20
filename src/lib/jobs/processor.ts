import { db, sql } from "@/db";
import { jobs, storyMetadata, storyEmbeddings, storyRelationships, stories } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getAIProvider } from "@/lib/ai/provider";

type JobHandler = (payload: Record<string, unknown>) => Promise<void>;

const handlers: Record<string, JobHandler> = {
  extract_metadata: handleExtractMetadata,
  generate_embedding: handleGenerateEmbedding,
  compute_relationships: handleComputeRelationships,
};

/**
 * Process pending jobs from the queue
 */
export async function processJobs(limit = 5) {
  const pendingJobs = await db
    .select()
    .from(jobs)
    .where(eq(jobs.status, "pending"))
    .orderBy(jobs.createdAt)
    .limit(limit);

  const results = [];

  for (const job of pendingJobs) {
    const handler = handlers[job.type];
    if (!handler) {
      await db
        .update(jobs)
        .set({ status: "failed", error: `Unknown job type: ${job.type}` })
        .where(eq(jobs.id, job.id));
      continue;
    }

    try {
      await db
        .update(jobs)
        .set({ status: "processing", attempts: job.attempts + 1 })
        .where(eq(jobs.id, job.id));

      await handler(job.payload as Record<string, unknown>);

      await db
        .update(jobs)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(jobs.id, job.id));

      results.push({ id: job.id, type: job.type, status: "completed" });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      const shouldRetry = job.attempts + 1 < job.maxAttempts;

      await db
        .update(jobs)
        .set({
          status: shouldRetry ? "pending" : "failed",
          error: errorMsg,
        })
        .where(eq(jobs.id, job.id));

      results.push({ id: job.id, type: job.type, status: "failed", error: errorMsg });
    }
  }

  return results;
}

// ===== Job Handlers =====

async function handleExtractMetadata(payload: Record<string, unknown>) {
  const storyId = payload.storyId as string;

  const [story] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, storyId))
    .limit(1);

  if (!story?.body) return;

  const aiProvider = getAIProvider();
  const metadata = await aiProvider.extractMetadata(story.body);

  // Upsert metadata
  const [existing] = await db
    .select()
    .from(storyMetadata)
    .where(eq(storyMetadata.storyId, storyId))
    .limit(1);

  if (existing) {
    await db
      .update(storyMetadata)
      .set({
        themes: metadata.themes,
        timePeriod: metadata.timePeriod,
        lifeStage: metadata.lifeStage,
        places: metadata.places,
        people: metadata.people,
        emotionalTone: metadata.emotionalTone,
        keywords: metadata.keywords,
        updatedAt: new Date(),
      })
      .where(eq(storyMetadata.id, existing.id));
  } else {
    await db.insert(storyMetadata).values({
      storyId,
      themes: metadata.themes,
      timePeriod: metadata.timePeriod,
      lifeStage: metadata.lifeStage,
      places: metadata.places,
      people: metadata.people,
      emotionalTone: metadata.emotionalTone,
      keywords: metadata.keywords,
    });
  }

  // Chain: queue embedding generation
  await db.insert(jobs).values({
    type: "generate_embedding",
    payload: { storyId },
    status: "pending",
  }).onConflictDoNothing();
}

async function handleGenerateEmbedding(payload: Record<string, unknown>) {
  const storyId = payload.storyId as string;

  const [story] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, storyId))
    .limit(1);

  if (!story?.body) return;

  const aiProvider = getAIProvider();
  const embedding = await aiProvider.generateEmbedding(
    `${story.title || ""}\n\n${story.body}`
  );

  // Upsert embedding via raw SQL (drizzle doesn't support vector type natively)
  const vectorStr = `[${embedding.join(",")}]`;

  const [existing] = await db
    .select()
    .from(storyEmbeddings)
    .where(eq(storyEmbeddings.storyId, storyId))
    .limit(1);

  if (existing) {
    await sql`UPDATE story_embeddings SET embedding = ${vectorStr}::vector, model_version = 'text-embedding-3-small', created_at = now() WHERE story_id = ${storyId}`;
  } else {
    await sql`INSERT INTO story_embeddings (id, story_id, embedding, model_version, created_at) VALUES (gen_random_uuid(), ${storyId}, ${vectorStr}::vector, 'text-embedding-3-small', now())`;
  }

  // Chain: compute relationships
  await db.insert(jobs).values({
    type: "compute_relationships",
    payload: { storyId },
    status: "pending",
  }).onConflictDoNothing();
}

async function handleComputeRelationships(payload: Record<string, unknown>) {
  const storyId = payload.storyId as string;

  // Find nearest neighbors via pgvector cosine similarity
  const neighbors = await sql`
    SELECT se.story_id, 1 - (se.embedding <=> (SELECT embedding FROM story_embeddings WHERE story_id = ${storyId})) AS similarity
    FROM story_embeddings se
    JOIN stories s ON s.id = se.story_id
    WHERE se.story_id != ${storyId}
      AND s.status = 'published'
      AND se.embedding IS NOT NULL
    ORDER BY se.embedding <=> (SELECT embedding FROM story_embeddings WHERE story_id = ${storyId})
    LIMIT 5
  `;

  // Clear existing relationships for this story
  await db
    .delete(storyRelationships)
    .where(eq(storyRelationships.storyAId, storyId));

  // Insert new relationships
  for (const neighbor of neighbors) {
    await db
      .insert(storyRelationships)
      .values({
        storyAId: storyId,
        storyBId: neighbor.story_id as string,
        relationType: "semantic_similarity",
        similarityScore: neighbor.similarity as number,
      })
      .onConflictDoNothing();
  }
}
