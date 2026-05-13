import Link from "next/link";
import { getArchiveStory, getRelatedStories, getReflectionsForArchiveStory } from "@/actions/archive";
import { recordStoryView, getReaderMarks, isStoryAuthor, type ViewSource } from "@/actions/resonance";
import { Badge } from "@/components/ui";
import { StoryResonanceControls } from "@/components/stories/StoryResonanceControls";
import { notFound } from "next/navigation";
import styles from "../archive.module.css";

const VALID_SOURCES: ViewSource[] = [
  "direct",
  "archive",
  "search",
  "related",
  "prompt",
  "theme",
];

export default async function ArchiveStoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const story = await getArchiveStory(id);

  if (!story) {
    notFound();
  }

  const source = (VALID_SOURCES as string[]).includes(from ?? "")
    ? (from as ViewSource)
    : "direct";

  const [relatedStories, reflections, readerMarks, viewerIsAuthor] = await Promise.all([
    getRelatedStories(id),
    getReflectionsForArchiveStory(id),
    getReaderMarks(id),
    isStoryAuthor(id),
  ]);

  await recordStoryView(id, source);

  return (
    <div className={styles.storyPage}>
      <Link href="/archive" className={styles.backLink}>
        ← Back to Archive
      </Link>

      <h1 className={styles.storyPageTitle}>{story.title}</h1>
      <div className={styles.storyPageDate}>
        {story.publishedAt.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
        {story.promptTitle && (
          <span>
            {" "}
            ·{" "}
            <Link
              href={`/archive/prompts/${story.promptId}`}
              style={{ color: "var(--accent-secondary)" }}
            >
              {story.promptTitle}
            </Link>
          </span>
        )}
      </div>

      <div className={styles.storyPageBody}>{story.body}</div>

      {story.tags.length > 0 && (
        <div className={styles.storyPageTags}>
          {story.tags.map((tag) => (
            <Link key={tag} href={`/archive/themes/${encodeURIComponent(tag)}`}>
              <Badge variant="amber">{tag}</Badge>
            </Link>
          ))}
        </div>
      )}

      {reflections.length > 0 && (
        <div className={styles.reflectionsSection}>
          <h3 className={styles.reflectionsTitle}>
            Reflections
          </h3>
          {reflections.map((r, i) => (
            <div key={i} className={styles.reflectionItem}>
              <div className={styles.reflectionQuestion}>{r.questionText}</div>
              <div className={styles.reflectionAnswer}>{r.responseText}</div>
            </div>
          ))}
        </div>
      )}

      <StoryResonanceControls
        storyId={story.id}
        initialMarks={readerMarks}
        isAuthor={viewerIsAuthor}
      />

      {relatedStories.length > 0 && (
        <div className={styles.relatedSection}>
          <h3 className={styles.relatedTitle}>Related Stories</h3>
          <div className={styles.relatedGrid}>
            {relatedStories.map((related) => (
              <Link
                key={related.id}
                href={`/archive/${related.id}?from=related`}
                className={styles.storyCard}
              >
                <h4 className={styles.storyTitle}>{related.title}</h4>
                <p className={styles.storyExcerpt}>
                  {related.body.length > 120
                    ? related.body.slice(0, 120) + "…"
                    : related.body}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
