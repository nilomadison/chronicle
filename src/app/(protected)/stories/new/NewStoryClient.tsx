"use client";

import { createDraft } from "@/actions/stories";
import { Button, Card, CardBody } from "@/components/ui";
import styles from "./new.module.css";

type Prompt = {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
};

export function NewStoryClient({ prompts }: { prompts: Prompt[] }) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Start a New Story</h1>
        <p className={styles.subtitle}>
          Every story matters. Choose a prompt for inspiration, or begin with
          your own memory.
        </p>
      </div>

      <div className={styles.section}>
        <button
          className={styles.freeformCard}
          onClick={() => createDraft()}
        >
          <span className={styles.freeformIcon}>✦</span>
          <div>
            <h3 className={styles.freeformTitle}>Write Freely</h3>
            <p className={styles.freeformDesc}>
              Start with a blank page — share whatever story is on your mind.
            </p>
          </div>
        </button>
      </div>

      {prompts.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Community Prompts</h2>
          <p className={styles.sectionDesc}>
            These themes might help you decide what to write about.
          </p>
          <div className={styles.promptGrid}>
            {prompts.map((prompt) => (
              <Card key={prompt.id} interactive>
                <CardBody>
                  <button
                    className={styles.promptButton}
                    onClick={() => createDraft(prompt.id)}
                  >
                    <h3 className={styles.promptTitle}>{prompt.title}</h3>
                    {prompt.description && (
                      <p className={styles.promptDesc}>{prompt.description}</p>
                    )}
                  </button>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
