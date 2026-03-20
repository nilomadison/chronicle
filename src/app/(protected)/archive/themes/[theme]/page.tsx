import Link from "next/link";
import { getStoriesByTheme } from "@/actions/archive";
import { Badge } from "@/components/ui";
import styles from "../../archive.module.css";

export default async function ThemeStoriesPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const { theme } = await params;
  const decodedTheme = decodeURIComponent(theme);
  const stories = await getStoriesByTheme(decodedTheme);

  return (
    <div className={styles.archivePage}>
      <Link href="/archive" className={styles.backLink}>
        ← Back to Archive
      </Link>

      <div className={styles.header}>
        <h1>
          Stories tagged &ldquo;{decodedTheme}&rdquo;
        </h1>
      </div>

      {stories.length > 0 ? (
        <div className={styles.grid}>
          {stories.map((story) => (
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
                {story.tags.length > 0 && (
                  <div className={styles.tags}>
                    {story.tags.map((tag) => (
                      <Badge key={tag} variant="amber">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyArchive}>
          <p>No stories with this tag yet.</p>
        </div>
      )}
    </div>
  );
}
