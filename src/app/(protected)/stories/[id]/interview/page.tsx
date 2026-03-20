import { getOwnStory } from "@/actions/stories";
import { notFound } from "next/navigation";
import { InterviewClient } from "./InterviewClient";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getOwnStory(id);

  if (!story) {
    notFound();
  }

  return <InterviewClient storyId={story.id} storyTitle={story.title} />;
}
