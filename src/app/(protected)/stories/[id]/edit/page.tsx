import { getOwnStory } from "@/actions/stories";
import { notFound } from "next/navigation";
import { StoryEditor } from "./StoryEditor";

export default async function EditStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getOwnStory(id);

  if (!story) {
    notFound();
  }

  return <StoryEditor story={story} />;
}
