"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publishStory, unpublishStory } from "@/actions/publication";
import { deleteStory } from "@/actions/stories";
import type { StoryWithTags } from "@/actions/stories";
import { Button, Badge, Modal, Alert } from "@/components/ui";
import styles from "./review.module.css";

type InterviewItem = {
  id: string;
  questionText: string;
  sortOrder: number;
  response: { responseText: string } | null;
};

export function ReviewClient({
  story,
  interview,
}: {
  story: StoryWithTags;
  interview: InterviewItem[];
}) {
  const router = useRouter();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handlePublish = async () => {
    setPublishing(true);
    setErrors([]);
    try {
      const result = await publishStory(story.id);
      if (result.success) {
        setShowPublishModal(false);
        router.push("/dashboard");
        router.refresh();
      } else {
        setErrors(result.errors);
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Publication failed"]);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    await unpublishStory(story.id);
    router.push("/dashboard");
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteStory(story.id);
    router.push("/dashboard");
  };

  const respondedQuestions = interview.filter((q) => q.response?.responseText);

  return (
    <div className={styles.reviewPage}>
      <div className={styles.header}>
        <h1>Review Your Story</h1>
        <p className={styles.headerSubtitle}>
          Here is how your story will appear in the Chronicle archive. No author
          attribution will be shown — stories stand on their own.
        </p>
      </div>

      {errors.length > 0 && (
        <Alert variant="error" title="Cannot publish yet">
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Archive Preview */}
      <div className={styles.previewSection}>
        <div className={styles.previewLabel}>Archive Preview</div>
        <div className={styles.previewCard}>
          <h2 className={styles.previewTitle}>
            {story.title || "Untitled Story"}
          </h2>
          <div className={styles.previewDate}>
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className={styles.previewBody}>{story.body}</div>

          {story.tags.length > 0 && (
            <div className={styles.previewTags}>
              {story.tags.map((tag) => (
                <Badge key={tag} variant="amber">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interview Responses */}
      {respondedQuestions.length > 0 && (
        <div className={styles.responsesSection}>
          <h3 className={styles.responsesTitle}>
            Your Reflections ({respondedQuestions.length})
          </h3>
          {respondedQuestions.map((q) => (
            <div key={q.id} className={styles.responseItem}>
              <div className={styles.responseQuestion}>{q.questionText}</div>
              <div className={styles.responseAnswer}>
                {q.response?.responseText}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actionsBar}>
        <div className={styles.actionsLeft}>
          <Link href={`/stories/${story.id}/edit`}>
            <Button variant="ghost">← Edit Story</Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
        <div className={styles.actionsRight}>
          {story.status === "published" ? (
            <Button variant="secondary" onClick={handleUnpublish}>
              Unpublish
            </Button>
          ) : (
            <Button onClick={() => setShowPublishModal(true)}>
              ✦ Publish to Archive
            </Button>
          )}
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="Publish to the Archive?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowPublishModal(false)}
            >
              Not Yet
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? "Publishing…" : "Publish Story"}
            </Button>
          </>
        }
      >
        <p>
          Your story will become part of the Chronicle archive, discoverable by
          other readers. No author attribution will be shown.
        </p>
        <p style={{ marginTop: "var(--space-3)", fontSize: "var(--text-sm)" }}>
          You can unpublish or edit your story at any time from your dashboard.
        </p>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete This Story?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Story
            </Button>
          </>
        }
      >
        <p>This will remove the story from your workspace permanently.</p>
      </Modal>
    </div>
  );
}
