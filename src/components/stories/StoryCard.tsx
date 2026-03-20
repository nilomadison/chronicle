import Link from "next/link";
import { Badge, statusVariant } from "@/components/ui";
import type { StoryWithTags } from "@/actions/stories";
import styles from "./StoryCard.module.css";

interface StoryCardProps {
  story: StoryWithTags;
  showStatus?: boolean;
  href?: string;
}

export function StoryCard({ story, showStatus = true, href }: StoryCardProps) {
  const linkHref =
    href ||
    (story.status === "draft"
      ? `/stories/${story.id}/edit`
      : `/stories/${story.id}/review`);

  const excerpt =
    story.body && story.body.length > 200
      ? story.body.slice(0, 200) + "…"
      : story.body;

  const dateStr = story.updatedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={linkHref} className={styles.storyCard}>
      <div className={styles.topRow}>
        <span className={story.title ? styles.title : `${styles.title} ${styles.untitled}`}>
          {story.title || "Untitled Story"}
        </span>
        {showStatus && (
          <Badge variant={statusVariant(story.status)}>
            {story.status}
          </Badge>
        )}
      </div>

      {excerpt && <p className={styles.excerpt}>{excerpt}</p>}

      <div className={styles.meta}>
        <span className={styles.date}>{dateStr}</span>
        {story.tags.length > 0 && (
          <div className={styles.tags}>
            {story.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="amber">
                {tag}
              </Badge>
            ))}
            {story.tags.length > 3 && (
              <Badge variant="default">+{story.tags.length - 3}</Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
