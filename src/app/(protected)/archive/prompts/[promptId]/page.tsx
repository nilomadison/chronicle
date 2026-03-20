import Link from "next/link";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStoriesByPrompt } from "@/actions/archive";
import { Badge } from "@/components/ui";
import { notFound } from "next/navigation";
import styles from "../../archive.module.css";

export default async function PromptStoriesPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = await params;

  const [prompt] = await db
    .select()
    .from(prompts)
    .where(eq(prompts.id, promptId))
    .limit(1);

  if (!prompt) notFound();

  const stories = await getStoriesByPrompt(promptId);

  return (
    <div className={styles.archivePage}>
      <Link href="/archive" className={styles.backLink}>
        ← Back to Archive
      </Link>

      <div className={styles.header}>
        <h1>{prompt.title}</h1>
        {prompt.description && (
          <p className={styles.headerDesc}>{prompt.description}</p>
        )}
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
                    {story.tags.slice(0, 3).map((tag) => (
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
          <p>No stories have been shared for this prompt yet.</p>
        </div>
      )}
    </div>
  );
}
