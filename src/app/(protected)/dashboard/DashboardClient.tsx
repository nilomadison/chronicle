"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { StoryCard } from "@/components/stories/StoryCard";
import type { StoryWithTags } from "@/actions/stories";
import styles from "./dashboard.module.css";

const tabs = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "published", label: "Published" },
  { key: "unpublished", label: "Unpublished" },
];

export function DashboardClient({
  initialStories,
}: {
  initialStories: StoryWithTags[];
}) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? initialStories
      : initialStories.filter((s) => s.status === activeTab);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>My Stories</h1>
        <Link href="/stories/new">
          <Button>✦ Start a Story</Button>
        </Link>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === "all"
              ? ` (${initialStories.length})`
              : ` (${initialStories.filter((s) => s.status === tab.key).length})`}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className={styles.storyGrid}>
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <p className={styles.emptyText}>
            {activeTab === "all"
              ? "No stories yet"
              : `No ${activeTab} stories`}
          </p>
          <p className={styles.emptyHint}>
            Every great archive begins with a single story.
          </p>
          <Link href="/stories/new">
            <Button>Start Your First Story</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
