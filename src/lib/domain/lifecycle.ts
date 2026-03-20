// ===== Story Lifecycle State Machine =====

export type StoryStatus = "draft" | "published" | "unpublished" | "deleted";

const VALID_TRANSITIONS: Record<StoryStatus, StoryStatus[]> = {
  draft: ["published", "deleted"],
  published: ["unpublished", "deleted"],
  unpublished: ["published", "deleted"],
  deleted: [],
};

export function canTransition(from: StoryStatus, to: StoryStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateForPublish(story: {
  title: string | null;
  body: string | null;
}): string[] {
  const errors: string[] = [];

  if (!story.title || story.title.trim().length === 0) {
    errors.push("A title is required before publishing.");
  }

  if (!story.body || story.body.trim().length === 0) {
    errors.push("Story body cannot be empty.");
  } else {
    const wordCount = story.body.split(/\s+/).filter(Boolean).length;
    if (wordCount < 30) {
      errors.push(`Story needs at least 30 words. Currently ${wordCount}.`);
    }
  }

  return errors;
}
