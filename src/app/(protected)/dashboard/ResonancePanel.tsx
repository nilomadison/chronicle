"use client";

import { useState } from "react";
import Link from "next/link";
import { markEchoNoteRead } from "@/actions/resonance";
import type { StoryResonance, EchoNoteForAuthor } from "@/actions/resonance";
import styles from "./dashboard.module.css";

const SOURCE_LABELS: Record<string, string> = {
  direct: "direct",
  archive: "archive",
  search: "search",
  related: "related",
  prompt: "prompts",
  theme: "themes",
};

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function totalMarks(marks: StoryResonance["marks"]) {
  return marks.resonated + marks.recognized + marks.reflected;
}

export function ResonancePanel({
  resonance,
  echoNotes: initialEchoNotes,
}: {
  resonance: StoryResonance[];
  echoNotes: EchoNoteForAuthor[];
}) {
  const [echoNotes, setEchoNotes] = useState(initialEchoNotes);
  const [busyId, setBusyId] = useState<string | null>(null);

  const hasAnything =
    resonance.length > 0 &&
    resonance.some((r) => r.viewsAllTime > 0 || totalMarks(r.marks) > 0);

  if (resonance.length === 0 && echoNotes.length === 0) {
    return null;
  }

  const handleMarkRead = async (id: string) => {
    setBusyId(id);
    try {
      await markEchoNoteRead(id);
      setEchoNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
      );
    } catch {
      // ignore — the next page load will reflect true state
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className={styles.resonanceSection}>
      <header className={styles.resonanceHeader}>
        <h2 className={styles.resonanceTitle}>Resonance</h2>
        <p className={styles.resonanceSubtitle}>
          Private signals from readers. Never shown on the public archive.
        </p>
      </header>

      <div className={styles.resonanceLayout}>
        <div className={styles.resonanceColumn}>
          <h3 className={styles.resonanceColumnTitle}>Stories &amp; reach</h3>
          {hasAnything ? (
            resonance
              .filter((r) => r.viewsAllTime > 0 || totalMarks(r.marks) > 0)
              .map((r) => (
                <article key={r.storyId} className={styles.resonanceStoryCard}>
                  <Link
                    href={`/archive/${r.storyId}?from=direct`}
                    className={styles.resonanceStoryTitle}
                  >
                    {r.title}
                  </Link>
                  <div className={styles.resonanceStats}>
                    <span className={styles.resonanceStat}>
                      <span className={styles.resonanceStatCount}>{r.views30d}</span>
                      <span className={styles.resonanceStatLabel}>reads · 30d</span>
                    </span>
                    <span className={styles.resonanceStat}>
                      <span className={styles.resonanceStatCount}>{r.viewsAllTime}</span>
                      <span className={styles.resonanceStatLabel}>reads · all</span>
                    </span>
                    {r.marks.resonated > 0 && (
                      <span className={styles.resonanceStat}>
                        <span className={styles.resonanceStatCount}>{r.marks.resonated}</span>
                        <span className={styles.resonanceStatLabel}>resonated</span>
                      </span>
                    )}
                    {r.marks.recognized > 0 && (
                      <span className={styles.resonanceStat}>
                        <span className={styles.resonanceStatCount}>{r.marks.recognized}</span>
                        <span className={styles.resonanceStatLabel}>recognized</span>
                      </span>
                    )}
                    {r.marks.reflected > 0 && (
                      <span className={styles.resonanceStat}>
                        <span className={styles.resonanceStatCount}>{r.marks.reflected}</span>
                        <span className={styles.resonanceStatLabel}>reflected</span>
                      </span>
                    )}
                  </div>
                  <div className={styles.resonanceStats} style={{ marginTop: "var(--space-2)" }}>
                    {Object.entries(r.viewsBySource)
                      .filter(([, count]) => count > 0)
                      .map(([source, count]) => (
                        <span key={source} className={styles.resonanceStat}>
                          <span className={styles.resonanceStatLabel}>via</span>
                          <span>{SOURCE_LABELS[source] || source}</span>
                          <span className={styles.resonanceStatCount}>{count}</span>
                        </span>
                      ))}
                  </div>
                </article>
              ))
          ) : (
            <div className={styles.resonanceEmpty}>
              No readers yet. Your stories are waiting to be found.
            </div>
          )}
        </div>

        <div className={styles.resonanceColumn}>
          <h3 className={styles.resonanceColumnTitle}>
            Echo notes {echoNotes.filter((n) => !n.readAt).length > 0 && (
              <span>· {echoNotes.filter((n) => !n.readAt).length} new</span>
            )}
          </h3>
          {echoNotes.length > 0 ? (
            echoNotes.map((note) => (
              <article
                key={note.id}
                className={`${styles.echoNote} ${!note.readAt ? styles.echoNoteUnread : ""}`}
              >
                <div className={styles.echoNoteMeta}>
                  <Link
                    href={`/archive/${note.storyId}?from=direct`}
                    className={styles.echoNoteStory}
                  >
                    {note.storyTitle}
                  </Link>
                  <span>{formatDate(note.createdAt)}</span>
                </div>
                <div className={styles.echoNoteText}>{note.noteText}</div>
                {!note.readAt && (
                  <button
                    type="button"
                    className={styles.echoNoteMarkRead}
                    onClick={() => handleMarkRead(note.id)}
                    disabled={busyId === note.id}
                  >
                    {busyId === note.id ? "Marking…" : "Mark as read"}
                  </button>
                )}
              </article>
            ))
          ) : (
            <div className={styles.resonanceEmpty}>
              No echo notes yet. Readers who want to say something quietly will find their way here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
