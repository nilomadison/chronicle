import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NewStoryClient } from "./NewStoryClient";

export default async function NewStoryPage() {
  const activePrompts = await db
    .select()
    .from(prompts)
    .where(eq(prompts.isActive, true));

  return <NewStoryClient prompts={activePrompts} />;
}
