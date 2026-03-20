import { getOwnStory, getStoryInterview } from "@/actions/stories";
import { notFound } from "next/navigation";
import { ReviewClient } from "./ReviewClient";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getOwnStory(id);

  if (!story) {
    notFound();
  }

  const interview = await getStoryInterview(id);

  return <ReviewClient story={story} interview={interview || []} />;
}
