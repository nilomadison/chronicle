"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveDraft, updateStoryTags, deleteStory } from "@/actions/stories";
import type { StoryWithTags } from "@/actions/stories";
import { Button, Badge, Modal } from "@/components/ui";
import styles from "./edit.module.css";

export function StoryEditor({ story }: { story: StoryWithTags }) {
  const router = useRouter();
  const [title, setTitle] = useState(story.title || "");
  const [body, setBody] = useState(story.body || "");
  const [tags, setTags] = useState<string[]>(story.tags);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save with debounce
  const autoSave = useCallback(
    async (newTitle: string, newBody: string) => {
      setSaving(true);
      try {
        await saveDraft(story.id, { title: newTitle, body: newBody });
        setLastSaved(new Date());
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setSaving(false);
      }
    },
    [story.id]
  );

  const scheduleAutoSave = useCallback(
    (newTitle: string, newBody: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        autoSave(newTitle, newBody);
      }, 1500);
    },
    [autoSave]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    scheduleAutoSave(value, body);
  };

  const handleBodyChange = (value: string) => {
    setBody(value);
    scheduleAutoSave(title, value);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        const newTags = [...tags, tag];
        setTags(newTags);
        updateStoryTags(story.id, newTags);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    updateStoryTags(story.id, newTags);
  };

  const handleDelete = async () => {
    await deleteStory(story.id);
    router.push("/dashboard");
  };

  const wordCount = body.split(/\s+/).filter(Boolean).length;

  return (
    <div className={styles.editorPage}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <Link href="/dashboard" className={styles.backLink}>
          ← Back to My Stories
        </Link>
        <div className={styles.saveStatus}>
          <span
            className={`${styles.saveIndicator} ${saving ? styles.saving : ""}`}
          />
          {saving
            ? "Saving…"
            : lastSaved
              ? `Saved ${lastSaved.toLocaleTimeString()}`
              : "Draft"}
        </div>
      </div>

      {/* Title */}
      <input
        className={styles.titleInput}
        type="text"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        placeholder="Give your story a title…"
        maxLength={500}
        aria-label="Story title"
      />

      {/* Body Editor */}
      <textarea
        className={styles.bodyEditor}
        value={body}
        onChange={(e) => handleBodyChange(e.target.value)}
        placeholder="Begin your story here. Share what happened, why it mattered, and what you carry from the experience…"
        aria-label="Story body"
      />

      {/* Word count */}
      <div
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--text-tertiary)",
          textAlign: "right",
          marginTop: "var(--space-2)",
        }}
      >
        {wordCount} {wordCount === 1 ? "word" : "words"}
      </div>

      {/* Tags */}
      <div className={styles.tagsSection}>
        <div className={styles.tagsSectionTitle}>Tags</div>
        <div className={styles.tagsList}>
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="amber"
              removable
              onRemove={() => handleRemoveTag(tag)}
            >
              {tag}
            </Badge>
          ))}
          <input
            className={styles.tagInput}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add a tag…"
            aria-label="Add tag"
          />
        </div>
      </div>

      {/* Guidance */}
      <div className={styles.guidance}>
        <div className={styles.guidanceTitle}>💡 Storytelling Tips</div>
        <ul className={styles.guidanceList}>
          <li>Write as if sharing with a thoughtful reader who genuinely cares.</li>
          <li>Focus on what happened, why it mattered, and what others might learn.</li>
          <li>
            You don&apos;t need full names, addresses, or employers to tell a vivid story.
          </li>
          <li>
            Preserve the emotional truth — it matters more than exact details.
          </li>
          <li>Your voice is what makes this story unique. Let it come through.</li>
        </ul>
      </div>

      {/* Actions */}
      <div className={styles.actionsBar}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete
        </Button>
        <div className={styles.actionsRight}>
          <Button
            variant="secondary"
            onClick={() => autoSave(title, body)}
            disabled={saving}
          >
            Save
          </Button>
          <Link href={`/stories/${story.id}/interview`}>
            <Button disabled={wordCount < 30}>
              Continue to Reflection →
            </Button>
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
        <p>
          This will remove the story from your workspace. This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
