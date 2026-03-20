"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  generateQuestions,
  saveResponse,
  getInterviewForStory,
} from "@/actions/interview";
import { Button, Spinner, Alert } from "@/components/ui";
import styles from "./interview.module.css";

type InterviewQuestion = {
  id: string;
  questionText: string;
  sortOrder: number;
  response: string | null;
};

export function InterviewClient({
  storyId,
  storyTitle,
}: {
  storyId: string;
  storyTitle: string | null;
}) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const saveTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    async function loadOrGenerate() {
      try {
        // Try loading existing questions first
        const existing = await getInterviewForStory(storyId);
        if (existing && existing.length > 0) {
          setQuestions(existing);
          const resps: Record<string, string> = {};
          existing.forEach((q) => {
            if (q.response) resps[q.id] = q.response;
          });
          setResponses(resps);
        } else {
          // Generate new questions
          const generated = await generateQuestions(storyId);
          setQuestions(
            generated.map((q) => ({
              id: q.id,
              questionText: q.questionText,
              sortOrder: q.sortOrder,
              response: null,
            }))
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load questions"
        );
      } finally {
        setLoading(false);
      }
    }
    loadOrGenerate();
  }, [storyId]);

  const handleResponseChange = useCallback((questionId: string, text: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: text }));

    // Auto-save with debounce
    if (saveTimeouts.current[questionId]) {
      clearTimeout(saveTimeouts.current[questionId]);
    }
    saveTimeouts.current[questionId] = setTimeout(async () => {
      setSavingId(questionId);
      try {
        await saveResponse(questionId, text);
      } catch (err) {
        console.error("Failed to save response:", err);
      } finally {
        setSavingId(null);
      }
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className={styles.interviewPage}>
        <div className={styles.loading}>
          <Spinner size="lg" />
          <p>Crafting thoughtful questions about your story…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.interviewPage}>
        <Alert variant="error" title="Could not generate questions">
          {error}
        </Alert>
        <div style={{ marginTop: "var(--space-4)" }}>
          <Link href={`/stories/${storyId}/edit`}>
            <Button variant="secondary">← Back to Editor</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.interviewPage}>
      <div className={styles.header}>
        <h1>Deepen Your Story</h1>
        <p className={styles.headerSubtitle}>
          {storyTitle ? `"${storyTitle}" — ` : ""}These questions are meant to
          help you reflect and elaborate. Answer what feels right, skip what
          doesn&apos;t. Your responses will help enrich your story.
        </p>
      </div>

      <div className={styles.questionsContainer}>
        {questions.map((q, idx) => (
          <div key={q.id} className={styles.questionCard}>
            <div className={styles.questionNumber}>
              Question {idx + 1} of {questions.length}
            </div>
            <p className={styles.questionText}>{q.questionText}</p>
            <textarea
              className={styles.responseArea}
              placeholder="Share your thoughts here…"
              value={responses[q.id] || ""}
              onChange={(e) => handleResponseChange(q.id, e.target.value)}
            />
            {savingId === q.id && (
              <span className={styles.savedIndicator}>Saving…</span>
            )}
          </div>
        ))}
      </div>

      <div className={styles.actionsBar}>
        <Link href={`/stories/${storyId}/edit`}>
          <Button variant="ghost">← Back to Editor</Button>
        </Link>
        <Link href={`/stories/${storyId}/review`}>
          <Button>Continue to Review →</Button>
        </Link>
      </div>
    </div>
  );
}
