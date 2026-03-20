import Link from "next/link";
import { getArchiveStory, getRelatedStories, getReflectionsForArchiveStory } from "@/actions/archive";
import { Badge } from "@/components/ui";
import { notFound } from "next/navigation";
import styles from "../archive.module.css";

export default async function ArchiveStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getArchiveStory(id);

  if (!story) {
    notFound();
  }

  const [relatedStories, reflections] = await Promise.all([
    getRelatedStories(id),
    getReflectionsForArchiveStory(id),
  ]);

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

      {relatedStories.length > 0 && (
        <div className={styles.relatedSection}>
          <h3 className={styles.relatedTitle}>Related Stories</h3>
          <div className={styles.relatedGrid}>
            {relatedStories.map((related) => (
              <Link
                key={related.id}
                href={`/archive/${related.id}`}
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
