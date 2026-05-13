"use client";

import { useState, useTransition } from "react";
import {
  markStory,
  unmarkStory,
  submitEchoNote,
  type MarkType,
} from "@/actions/resonance";
import { Button } from "@/components/ui";
import styles from "./StoryResonanceControls.module.css";

const MARKS: { type: MarkType; label: string; hint: string }[] = [
  { type: "resonated", label: "Resonated", hint: "This landed with me." },
  { type: "recognized", label: "Recognized", hint: "I've been here too." },
  { type: "reflected", label: "Reflected on", hint: "I stayed with this." },
];

const ECHO_HINT =
  "A sentence or two about what this story brought up for you. Sent privately to the author. Links and hostile language are not permitted.";

type Props = {
  storyId: string;
  initialMarks: MarkType[];
  isAuthor: boolean;
};

export function StoryResonanceControls({ storyId, initialMarks, isAuthor }: Props) {
  const [marks, setMarks] = useState<Set<MarkType>>(new Set(initialMarks));
  const [pendingMark, startMarkTransition] = useTransition();
  const [echoOpen, setEchoOpen] = useState(false);
  const [echoText, setEchoText] = useState("");
  const [echoSubmitting, setEchoSubmitting] = useState(false);
  const [echoStatus, setEchoStatus] = useState<
    { kind: "sent" } | { kind: "error"; reason: string } | null
  >(null);

  if (isAuthor) {
    // Authors don't mark or echo-note their own stories.
    return null;
  }

  const toggleMark = (markType: MarkType) => {
    const active = marks.has(markType);
    // Optimistic local update.
    setMarks((prev) => {
      const next = new Set(prev);
      if (active) next.delete(markType);
      else next.add(markType);
      return next;
    });

    startMarkTransition(async () => {
      try {
        const fresh = active
          ? await unmarkStory(storyId, markType)
          : await markStory(storyId, markType);
        setMarks(new Set(fresh));
      } catch {
        // Revert on failure.
        setMarks((prev) => {
          const next = new Set(prev);
          if (active) next.add(markType);
          else next.delete(markType);
          return next;
        });
      }
    });
  };

  const handleEchoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!echoText.trim() || echoSubmitting) return;

    setEchoSubmitting(true);
    setEchoStatus(null);
    try {
      const res = await submitEchoNote(storyId, echoText);
      if (res.success) {
        setEchoStatus({ kind: "sent" });
        setEchoText("");
        setEchoOpen(false);
      } else {
        setEchoStatus({ kind: "error", reason: res.reason ?? "unknown" });
      }
    } catch {
      setEchoStatus({ kind: "error", reason: "unknown" });
    } finally {
      setEchoSubmitting(false);
    }
  };

  return (
    <div className={styles.resonance}>
      <p className={styles.heading}>If this story moved you, let the author know quietly.</p>

      <div className={styles.markRow}>
        {MARKS.map((m) => {
          const active = marks.has(m.type);
          return (
            <button
              key={m.type}
              type="button"
              className={`${styles.markButton} ${active ? styles.markButtonActive : ""}`}
              onClick={() => toggleMark(m.type)}
              disabled={pendingMark}
              title={m.hint}
              aria-pressed={active}
            >
              {active && <span className={styles.markCheck}>✓</span>}
              {m.label}
            </button>
          );
        })}
      </div>

      {echoStatus?.kind === "sent" ? (
        <p className={styles.echoSuccess}>Your note was sent quietly to the author.</p>
      ) : !echoOpen ? (
        <button
          type="button"
          className={styles.echoToggle}
          onClick={() => setEchoOpen(true)}
        >
          Leave a private note for the author
        </button>
      ) : (
        <form onSubmit={handleEchoSubmit} className={styles.echoForm}>
          <textarea
            className={styles.echoTextarea}
            value={echoText}
            onChange={(e) => setEchoText(e.target.value)}
            maxLength={600}
            placeholder="What did this story bring up for you?"
            autoFocus
          />
          <p className={styles.echoHint}>{ECHO_HINT}</p>
          {echoStatus?.kind === "error" && (
            <p className={styles.echoError}>
              {echoStatus.reason === "blocked_content"
                ? "Please remove any links or hostile language."
                : echoStatus.reason === "too_short"
                  ? "A note should be at least a few words."
                  : echoStatus.reason === "too_long"
                    ? "Keep the note under 600 characters."
                    : "Could not send the note. Please try again."}
            </p>
          )}
          <div className={styles.echoActions}>
            <Button
              type="submit"
              size="sm"
              disabled={echoSubmitting || !echoText.trim()}
            >
              {echoSubmitting ? "Sending…" : "Send note"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setEchoOpen(false);
                setEchoStatus(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
