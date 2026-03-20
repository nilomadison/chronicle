import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://chronicle:chronicle@localhost:5432/chronicle";

async function seed() {
  const sql = postgres(connectionString);

  console.log("🌱 Seeding Chronicle database...\n");

  // Seed community prompts
  const promptData = [
    {
      title: "Planting a Garden",
      description:
        "Share a story about growing something — a garden, a plant, a small green space. What did it teach you about patience, care, or letting go?",
    },
    {
      title: "First Jobs",
      description:
        "What was your first real job? What did you learn about work, people, or yourself? Share the moments that stuck with you.",
    },
    {
      title: "Learning a Hard Lesson",
      description:
        "Tell a story about a time when something went wrong and you learned from it. What would you tell someone facing the same situation?",
    },
    {
      title: "Neighborhood Memories",
      description:
        "Describe the neighborhood you grew up in or one that shaped you. What sounds, smells, people, or places do you remember most vividly?",
    },
    {
      title: "Family Traditions",
      description:
        "Share a tradition — big or small — that your family kept alive. What did it mean to you then, and what does it mean to you now?",
    },
  ];

  for (const prompt of promptData) {
    await sql`
      INSERT INTO prompts (id, title, description, is_active, created_at)
      VALUES (gen_random_uuid(), ${prompt.title}, ${prompt.description}, true, now())
      ON CONFLICT DO NOTHING
    `;
    console.log(`  ✓ Prompt: "${prompt.title}"`);
  }

  console.log("\n✅ Seeding complete.");

  await sql.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
