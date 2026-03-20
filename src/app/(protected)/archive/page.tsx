import Link from "next/link";
import { listArchiveStories, listActivePrompts } from "@/actions/archive";
import { Badge, Button } from "@/components/ui";
import styles from "./archive.module.css";

export default async function ArchivePage() {
  const archiveStories = await listArchiveStories();
  const activePrompts = await listActivePrompts();

  return (
    <div className={styles.archivePage}>
      <div className={styles.header}>
        <h1>The Archive</h1>
        <p className={styles.headerDesc}>
          Stories shared by real people — preserved and discoverable.
        </p>
      </div>

      {/* Prompt quick links */}
      {activePrompts.length > 0 && (
        <div style={{ marginBottom: "var(--space-8)" }}>
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              flexWrap: "wrap",
            }}
          >
            {activePrompts.map((p) => (
              <Link key={p.id} href={`/archive/prompts/${p.id}`}>
                <Badge variant="sage">{p.title}</Badge>
              </Link>
            ))}
            <Link href="/archive/search">
              <Badge variant="sky">🔍 Search</Badge>
            </Link>
          </div>
        </div>
      )}

      {archiveStories.length > 0 ? (
        <div className={styles.grid}>
          {archiveStories.map((story) => (
            <Link
              key={story.id}
              href={`/archive/${story.id}`}
              className={styles.storyCard}
            >
              <h3 className={styles.storyTitle}>{story.title}</h3>
              <p className={styles.storyExcerpt}>
                {story.body.length > 200
                  ? story.body.slice(0, 200) + "…"
                  : story.body}
              </p>
              <div className={styles.storyMeta}>
                <span className={styles.storyDate}>
                  {story.publishedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {story.promptTitle && (
                  <span className={styles.promptName}>
                    {story.promptTitle}
                  </span>
                )}
                {story.tags.length > 0 && (
                  <div className={styles.tags}>
                    {story.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="amber">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyArchive}>
          <div className={styles.emptyIcon}>🏛️</div>
          <p>The archive is waiting for its first stories.</p>
          <div style={{ marginTop: "var(--space-4)" }}>
            <Link href="/stories/new">
              <Button>Be the First to Contribute</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
