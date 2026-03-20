import { listOwnStories } from "@/actions/stories";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const stories = await listOwnStories();

  return <DashboardClient initialStories={stories} />;
}
