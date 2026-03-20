import postgres from "postgres";
import { hashSync } from "bcryptjs";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://chronicle:chronicle@localhost:5432/chronicle";

async function seedTestStory() {
  const sql = postgres(connectionString);

  console.log("🌱 Seeding test story for archive…\n");

  // 1. Create a test account
  const email = "test@chronicle.local";
  const passwordHash = hashSync("chronicle123", 10);

  const [account] = await sql`
    INSERT INTO accounts (id, email, password_hash, created_at, updated_at)
    VALUES (gen_random_uuid(), ${email}, ${passwordHash}, now(), now())
    ON CONFLICT (email) DO UPDATE SET updated_at = now()
    RETURNING id
  `;
  console.log(`  ✓ Account: ${email} (${account.id})`);

  // 2. Pick the first active prompt (or create one)
  let [prompt] = await sql`
    SELECT id, title FROM prompts WHERE is_active = true LIMIT 1
  `;

  if (!prompt) {
    [prompt] = await sql`
      INSERT INTO prompts (id, title, description, is_active, created_at)
      VALUES (gen_random_uuid(), 'Neighborhood Memories',
        'Describe the neighborhood you grew up in or one that shaped you.',
        true, now())
      RETURNING id, title
    `;
    console.log(`  ✓ Created prompt: "${prompt.title}"`);
  } else {
    console.log(`  ✓ Using prompt: "${prompt.title}"`);
  }

  // 3. Insert a published story
  const title = "The Summer We Built the Treehouse";
  const body = `It started with a pile of scrap lumber my uncle left behind after a fence project. My brother and I dragged every piece to the backyard oak, certain we could build something magnificent.

We had no plans, no real tools — just a handsaw, a hammer, and a coffee can full of bent nails we'd straightened on the sidewalk. The first platform took three weekends. It leaned hard to the left, and the ladder was just boards nailed directly into the trunk.

But it was ours.

That summer, the treehouse became everything: a pirate ship, a space station, a fort against imaginary invaders. Neighborhood kids showed up uninvited, and somehow that made it better. Everyone brought something — a rope swing, an old rug, a plastic tarp for the roof when it rained.

My mother would stand at the back door and yell for us to come in at dusk, and we'd pretend not to hear. We ate peanut butter sandwiches on that crooked platform and watched fireflies blink to life across the yard.

By September, the tree had started to grow around the nails. The whole thing creaked in the wind. My father said it wasn't safe and we should take it down, but he never made us do it.

The following spring, a storm ripped off the tarp and split one of the main supports. We talked about fixing it, but by then we were older and had other things to do. The treehouse sagged through that year and the next, slowly becoming part of the tree again.

I drove past that house twenty years later. The oak is enormous now, and there's no trace of our construction. But I swear, if I look long enough, I can still see the nail holes.`;

  const [story] = await sql`
    INSERT INTO stories (id, account_id, title, body, status, prompt_id, created_at, updated_at, published_at)
    VALUES (
      gen_random_uuid(),
      ${account.id},
      ${title},
      ${body},
      'published',
      ${prompt.id},
      now() - interval '3 days',
      now() - interval '1 day',
      now() - interval '1 day'
    )
    RETURNING id
  `;
  console.log(`  ✓ Story: "${title}" (${story.id})`);

  // 4. Insert tags
  const tags = ["childhood", "family", "summer"];
  for (const tag of tags) {
    await sql`
      INSERT INTO story_tags (id, story_id, tag)
      VALUES (gen_random_uuid(), ${story.id}, ${tag})
      ON CONFLICT DO NOTHING
    `;
  }
  console.log(`  ✓ Tags: ${tags.join(", ")}`);

  // 5. Insert interview questions and responses
  const reflections = [
    {
      question:
        "What was it about building something with your hands that felt different from other childhood activities?",
      answer:
        "There was something about the physicality of it — the weight of the boards, the sting when you missed the nail and hit your thumb. It wasn't like playing a game where you could start over. Every nail we drove was permanent. I think that's the first time I understood that some things you make stay made, for better or worse.",
    },
    {
      question:
        "You mentioned neighborhood kids showed up uninvited. How did that change the treehouse for you?",
      answer:
        "At first I was territorial about it. My brother and I built it, so it was ours. But kids started bringing things we didn't have — Jamie brought the rope, and Deena found that old rug in her garage. It stopped being our treehouse and became the treehouse. Looking back, that was the better version.",
    },
    {
      question:
        "When you drove past the house years later, what surprised you most?",
      answer:
        "How completely it was gone. Not damaged, not decaying — just gone. The tree had swallowed every trace. It made me think about all the things we pour ourselves into that don't leave a visible mark. But I don't think that means they didn't matter. That treehouse taught me and my brother how to work together, how to fail and keep going, how to share something you love.",
    },
  ];

  for (let i = 0; i < reflections.length; i++) {
    const [question] = await sql`
      INSERT INTO interview_questions (id, story_id, question_text, sort_order, created_at)
      VALUES (gen_random_uuid(), ${story.id}, ${reflections[i].question}, ${i}, now())
      RETURNING id
    `;

    await sql`
      INSERT INTO interview_responses (id, question_id, response_text, created_at)
      VALUES (gen_random_uuid(), ${question.id}, ${reflections[i].answer}, now())
    `;
  }
  console.log(`  ✓ Reflections: ${reflections.length} Q&A pairs`);

  console.log("\n✅ Test story seeded successfully.");
  console.log(`   View at: http://localhost:3000/archive/${story.id}`);

  await sql.end();
  process.exit(0);
}

seedTestStory().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
