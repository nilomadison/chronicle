import { listOwnStories } from "@/actions/stories";
import { getAuthorResonance, listEchoNotes } from "@/actions/resonance";
import { DashboardClient } from "./DashboardClient";
import { ResonancePanel } from "./ResonancePanel";

export default async function DashboardPage() {
  const [stories, resonance, echoNotes] = await Promise.all([
    listOwnStories(),
    getAuthorResonance(),
    listEchoNotes(),
  ]);

  return (
    <>
      <DashboardClient initialStories={stories} />
      <ResonancePanel resonance={resonance} echoNotes={echoNotes} />
    </>
  );
}
