import postgres from "postgres";
import { hashSync } from "bcryptjs";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://chronicle:chronicle@localhost:5432/chronicle";

// ── Prompts ────────────────────────────────────────────────────

const PROMPTS = [
  {
    title: "Neighborhood Memories",
    description:
      "Describe the neighborhood you grew up in or one that shaped you.",
  },
  {
    title: "A Meal That Meant Something",
    description:
      "Tell the story of a meal — cooked, shared, or remembered — that carries more weight than the food itself.",
  },
  {
    title: "Someone Who Changed Your Path",
    description:
      "Write about a person whose influence redirected the course of your life, even if they never knew it.",
  },
  {
    title: "The Sounds of Home",
    description:
      "What sounds defined the place you called home? Let one of them carry you into a story.",
  },
  {
    title: "A Lesson Learned the Hard Way",
    description:
      "Recall a time you learned something important through failure, embarrassment, or loss.",
  },
];

// ── Stories ─────────────────────────────────────────────────────
// Each story references a prompt by index into PROMPTS.

interface SeedStory {
  promptIndex: number;
  title: string;
  body: string;
  tags: string[];
  reflections: { question: string; answer: string }[];
  daysAgo: number; // how many days ago it was "published"
}

const STORIES: SeedStory[] = [
  // ── Prompt 0: Neighborhood Memories ──────────────────────────
  {
    promptIndex: 0,
    title: "The Summer We Built the Treehouse",
    body: `It started with a pile of scrap lumber my uncle left behind after a fence project. My brother and I dragged every piece to the backyard oak, certain we could build something magnificent.

We had no plans, no real tools — just a handsaw, a hammer, and a coffee can full of bent nails we'd straightened on the sidewalk. The first platform took three weekends. It leaned hard to the left, and the ladder was just boards nailed directly into the trunk.

But it was ours.

That summer, the treehouse became everything: a pirate ship, a space station, a fort against imaginary invaders. Neighborhood kids showed up uninvited, and somehow that made it better. Everyone brought something — a rope swing, an old rug, a plastic tarp for the roof when it rained.

My mother would stand at the back door and yell for us to come in at dusk, and we'd pretend not to hear. We ate peanut butter sandwiches on that crooked platform and watched fireflies blink to life across the yard.

By September, the tree had started to grow around the nails. The whole thing creaked in the wind. My father said it wasn't safe and we should take it down, but he never made us do it.

The following spring, a storm ripped off the tarp and split one of the main supports. We talked about fixing it, but by then we were older and had other things to do. The treehouse sagged through that year and the next, slowly becoming part of the tree again.

I drove past that house twenty years later. The oak is enormous now, and there's no trace of our construction. But I swear, if I look long enough, I can still see the nail holes.`,
    tags: ["childhood", "family", "summer"],
    reflections: [
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
    ],
    daysAgo: 3,
  },
  {
    promptIndex: 0,
    title: "The Porch Light on Magnolia Street",
    body: `Mrs. Delacroix kept her porch light on every night until the last kid on the block was inside. I didn't know this until my mother told me, years after we'd moved away.

Magnolia Street was four blocks long and dead-ended at a drainage ditch we called "the creek." In the summer it smelled like warm mud and cut grass. In the winter the water rose high enough to scare the parents, but never high enough to reach the houses.

Every house had a distinct sound. The Nguyens played piano scales at seven in the morning. Mr. Garza's truck backfired when he left for the night shift. The Williamses had a dog named Biscuit who barked at clouds.

Mrs. Delacroix lived alone in a yellow house with a screened porch. She grew tomatoes and basil in coffee cans on the railing. When we rode bikes past her house, she'd wave — never yelling, never scolding, just waving slowly like she had all the time in the world.

She knew every kid's name. She knew whose parents were having trouble. She sent plates of food to houses without being asked.

When I was twelve, my mother got sick. Mrs. Delacroix showed up at our door at six the next morning with a pot of soup, a bag of rolls, and a note that said "Don't worry about the pot." She came every Tuesday after that for two months.

We moved the following year. I never saw Mrs. Delacroix again. But every time I leave my own porch light on at night, I think of her standing behind that screen door, watching the street go quiet.`,
    tags: ["childhood", "community", "kindness"],
    reflections: [
      {
        question:
          "What did Mrs. Delacroix's quiet presence teach you about what it means to be a neighbor?",
        answer:
          "She showed me that being a neighbor isn't about big gestures or organized events. It's about paying attention. She noticed things — which kids were out late, which houses had gone quiet. And she responded with small, steady acts of care. I don't think she saw it as heroic. It was just how she lived.",
      },
      {
        question:
          "You said you leave your own porch light on now. Is that a conscious choice?",
        answer:
          "It started as a habit, honestly. But it became intentional. There's something about a lit porch that says 'someone is here and paying attention.' I think I wanted my street to feel the way Magnolia Street felt — watched over, not watched.",
      },
    ],
    daysAgo: 7,
  },
  {
    promptIndex: 0,
    title: "Chalk Lines and Kickball",
    body: `We used to draw the bases with sidewalk chalk — big lopsided circles that faded by the end of the game. Home plate was always in front of the Garcias' mailbox because their driveway was the flattest stretch on the block.

Teams were never fair. Whoever showed up played, and sides shifted without argument. If Tommy's older sister came out, she pitched for both teams because she was the only one who could throw straight. If someone's little brother was crying to join, he stood in the outfield and chased balls into the hedge.

The rules changed every week. You could hit a foul off someone's roof and it was a ground-rule double one day, a do-over the next. Nobody wrote anything down. The rules lived in whoever argued loudest, and that was usually Maria, who had a lawyer's instinct for precedent she made up on the spot.

There was no umpire, no score that anyone agreed on, and no definitive ending. The game ended when mothers started appearing on porches or when the streetlights buzzed on. We'd argue about who won while walking home, and by the next morning, it didn't matter.

I played organized baseball later — real fields, real umpires, real scoreboards. It was fine. But it never had the same electricity as those chalk-line games where everything was negotiable and nothing was permanent.`,
    tags: ["childhood", "play", "neighborhood"],
    reflections: [
      {
        question:
          "What do you think made those improvised games feel more alive than organized sports?",
        answer:
          "I think it was the ownership. We built the game from nothing every single time. The rules were ours, the stakes were social, not formal. When you argued a call, you were arguing with your friend, not an authority figure. It taught me more about negotiation and fairness than any league ever did.",
      },
      {
        question:
          "You described Maria as having 'a lawyer's instinct.' Did she know she was that kid?",
        answer:
          "Oh, absolutely. She loved it. She'd stand there with her hands on her hips and reference games from three weeks ago. The funny thing is, she actually did become a lawyer. I found out through Facebook years later and laughed for ten minutes.",
      },
    ],
    daysAgo: 12,
  },

  // ── Prompt 1: A Meal That Meant Something ────────────────────
  {
    promptIndex: 1,
    title: "My Grandmother's Sunday Gravy",
    body: `Every Sunday morning by seven, the kitchen already smelled like garlic and tomato. My grandmother would be at the stove in her housecoat, stirring a pot that seemed too large for any family. She made the same sauce every week for forty years, and every week she acted like she was inventing it.

"Taste this," she'd say, holding out a wooden spoon. "Does it need more basil?" It didn't matter what you said. She'd add basil anyway.

The sauce simmered for hours. Meatballs went in first, then sausage, then pork ribs. By noon the whole house smelled like a restaurant, and the windows were fogged with steam. Cousins would start arriving around one — nobody called ahead; it was just understood.

We ate in shifts because there were too many of us for the table. Kids went first, then adults, then whoever wanted seconds, which was everyone. My grandfather ate last, alone at the head of the table, reading the paper while sauce dried on his napkin.

After she died, my mother tried to make the recipe. She followed the same steps, used the same brands, even used my grandmother's pot. It was good. It was close. But it wasn't the same.

I think the missing ingredient was the house — the crooked kitchen, the fogged windows, the sound of too many people talking over each other. The sauce was never just sauce. It was the excuse for all of us to be in the same room.`,
    tags: ["family", "food", "tradition", "grandparents"],
    reflections: [
      {
        question:
          "Why do you think the recipe didn't taste the same when your mother made it?",
        answer:
          "Because cooking isn't just chemistry — it's context. My grandmother's sauce tasted the way it did because of the kitchen, the chaos, the fact that she'd been making it for forty years without thinking about it. My mother was trying to recreate a memory, which is a completely different act than just making dinner.",
      },
      {
        question:
          "Do you still cook that recipe yourself?",
        answer:
          "I do, once or twice a year. I know it's not the same, and I've stopped trying to make it the same. It's become my version now — a little less garlic, a little more wine. But every time I stir it, I hear her saying 'taste this.' That's the part of the recipe that actually survived.",
      },
    ],
    daysAgo: 5,
  },
  {
    promptIndex: 1,
    title: "Fish Tacos After the Funeral",
    body: `Nobody wanted to go to the reception. The church basement smelled like old carpet and the table was covered with deli trays nobody had ordered. My cousin Marc looked at me across the room, tilted his head toward the door, and that was the whole conversation.

Six of us piled into his truck and drove to a taco stand on Route 12. It was one of those places with a hand-painted sign and a window you lean into. We ordered fish tacos and Jarritos and sat on the tailgate in our funeral clothes.

Nobody talked about Uncle Ray for the first twenty minutes. We talked about the food, the weather, the fact that Marc's truck needed new brakes. Normal things. Safe things.

Then my cousin Elena said, "He would have hated that service," and everyone laughed because it was true. Ray was loud and irreverent and once told a priest a joke so inappropriate that my aunt didn't speak to him for a week.

We started telling stories then. Not eulogy stories — real ones. The time he got lost in Juárez. The argument over the go-kart. The summer he tried to learn guitar and quit after two days because, he said, "My fingers are too smart for this."

We sat there for two hours. The tacos were average. The soda was too sweet. But it was the truest thing that happened all day.

I've been back to that taco stand three times since. The food is fine. But it's never as good as it was that afternoon, when we were all still wearing our ties and missing someone together.`,
    tags: ["family", "grief", "food", "memory"],
    reflections: [
      {
        question:
          "Why do you think leaving the reception felt like the right thing to do?",
        answer:
          "Because grief doesn't know how to behave at a buffet table. The reception was performing mourning. What we did at the taco stand was actual mourning — messy and funny and honest. Ray would have understood the difference immediately.",
      },
      {
        question:
          "You've gone back to that taco stand since. What pulls you back?",
        answer:
          "I think I'm trying to feel that specific kind of closeness again. When people grieve together in an unscripted way, the walls come down completely. Going back is a way of honoring that. The food is just the anchor for the memory.",
      },
    ],
    daysAgo: 14,
  },
  {
    promptIndex: 1,
    title: "Peanut Butter on Toast at Midnight",
    body: `The night my daughter was born, I came home at two in the morning to shower and grab the bag we'd forgotten. The house was dark and too quiet. I stood in the kitchen and realized I hadn't eaten in fourteen hours.

I made peanut butter on toast. Two slices, crunchy, with a glass of milk. I stood at the counter in scrubs that weren't mine and ate in the dark.

Nothing had changed in the kitchen — same dishes in the sink, same mail on the counter, same magnet from a pizza place holding up a grocery list. But everything was different. In a hospital seven miles away, a person who hadn't existed yesterday was sleeping on her mother's chest.

I remember the toast being perfect. The peanut butter was the exact right thickness, the bread was toasted to the edge of burning, and the milk was cold enough to make my teeth ache. I know objectively that it was just toast. But it tasted like the hinge of my life — the last meal of the before.

I finished, put the plate in the sink, grabbed the bag, and drove back. My wife was asleep. My daughter was in the bassinet, wrapped tight, her face scrunched like she was concentrating on something important.

I never mentioned the toast to anyone. It felt too small to describe. But fifteen years later, it's one of the clearest memories I have from that night — clearer than the delivery, clearer than the first cry. Just me, standing in the dark, eating peanut butter toast and becoming a father.`,
    tags: ["parenthood", "solitude", "food", "transformation"],
    reflections: [
      {
        question:
          "Why do you think this small moment stayed with you more than the dramatic ones?",
        answer:
          "Maybe because it was the only moment that night where I was alone with what was happening. Everything else was shared — doctors, nurses, my wife, my family calling. The kitchen was the one place where I could feel the weight of it without performing anything. Just me and a piece of toast and the fact that my life had just split in two.",
      },
      {
        question:
          "Have you ever tried to recreate that meal?",
        answer:
          "Once, on her fifth birthday, I made the same thing at midnight after the party was cleaned up. It was just toast. The magic wasn't in the recipe. It was in the moment — that specific intersection of exhaustion and wonder. You can't make that twice.",
      },
    ],
    daysAgo: 20,
  },

  // ── Prompt 2: Someone Who Changed Your Path ──────────────────
  {
    promptIndex: 2,
    title: "Mr. Jefferies and the Red Pen",
    body: `I was failing English the fall of my junior year. Not because I couldn't read or write, but because I'd decided school was something that happened to other people. I sat in the back, turned in half-finished work, and waited for the year to end.

Mr. Jefferies handed back my essay on The Great Gatsby with so much red ink it looked like a crime scene. At the bottom, in block letters, he wrote: "You're better than this and we both know it. See me after class."

I almost didn't go. But something about "we both know it" stuck.

He didn't lecture me. He asked me what I was reading on my own. I told him — detective novels, mostly, and some science fiction I'd found at the library. He nodded and said, "So you do like stories. You just don't like being told which ones to care about."

He made me a deal. For every assigned essay, I could also write a second one on anything I wanted. He'd grade both, and the better grade would count. The catch: the second essay had to be good. Not just finished — good.

I wrote about Raymond Chandler. About how Phillip Marlowe was lonely in a way that felt true. Mr. Jefferies read it, handed it back with almost no red ink, and said, "Now do that with Fitzgerald."

I did. I got a B+ on Gatsby the second time around, because I suddenly cared. Not about Gatsby — about the writing.

Mr. Jefferies retired two years after I graduated. I wrote him a letter once, but I never sent it. I wish I had. The letter said what I still believe: he's the reason I became a writer. Not because he taught me how, but because he noticed I already was one.`,
    tags: ["education", "mentor", "writing", "turning-point"],
    reflections: [
      {
        question:
          "Why do you think his approach worked when traditional methods hadn't?",
        answer:
          "Because he met me where I was instead of where the curriculum said I should be. He saw that I was already a reader — just not of the books on the syllabus. By letting me write about what I actually cared about, he turned the assignment from compliance into expression. That changed everything.",
      },
      {
        question:
          "You said you never sent the letter. Do you regret that?",
        answer:
          "Every day. It's one of those things where you think you have time, and then you don't. I've tried to make up for it by being that person for other people — noticing when someone has a gift they don't see yet. But I still wish he knew.",
      },
    ],
    daysAgo: 8,
  },
  {
    promptIndex: 2,
    title: "The Stranger on the Greyhound",
    body: `I was nineteen and taking a Greyhound from Louisville to Chicago because I'd dropped out of school and had a vague plan to start over. The plan had no details. I had three hundred dollars, a duffel bag, and the kind of confidence that comes from not knowing anything about the world.

The woman in the seat next to me was maybe sixty. She was reading a paperback with the cover torn off and drinking coffee from a thermos. She didn't say anything for the first two hours.

Somewhere around Indianapolis, she said, "You look like you're running from something." I said I was running toward something. She smiled and said, "Same thing, from this angle."

We talked for the rest of the ride. Her name was Dolores. She'd been a nurse, then a teacher, then a nurse again. She'd been married twice, had four kids, and was on her way to visit a grandchild she'd never met.

She asked me what I was going to do in Chicago. I said I didn't know yet. She said, "Good. The people who know exactly what they're going to do are usually wrong."

Then she said something I've never forgotten: "Don't build your life on a plan. Build it on a practice. The plan will fail. The practice won't."

I asked her what she meant. She said, "Decide what kind of person you want to be, and do something about it every day. That's the whole secret."

We parted ways at the station. I never learned her last name. But her advice became the closest thing I have to a philosophy. I didn't build a plan in Chicago. I built a practice. And she was right. It held.`,
    tags: ["travel", "wisdom", "strangers", "life-advice"],
    reflections: [
      {
        question:
          "Do you ever wonder what Dolores would think of the life you built?",
        answer:
          "I think she'd nod and not be surprised. She struck me as someone who didn't need to see the outcome to know the advice was good. She'd probably ask if I was still practicing, and I'd say yes, and she'd go back to her book.",
      },
      {
        question:
          "What practice did you build first when you arrived in Chicago?",
        answer:
          "Writing. Every morning, no matter what else was happening, I wrote for an hour. Terrible stuff at first. But the habit of it — sitting down every day and making something — that became the foundation. Everything else I've done grew out of that one practice.",
      },
    ],
    daysAgo: 25,
  },
  {
    promptIndex: 2,
    title: "Coach Ramirez Didn't Let Me Quit",
    body: `I showed up to cross-country tryouts as a freshman because my mother said I needed an extracurricular or she'd sign me up for band. Running seemed like the least social option. I figured I'd jog quietly, make the roster, and disappear into the back of the pack.

Coach Ramirez watched me run one lap and said, "You're holding back." I told him I was pacing myself. He said, "No. You're hiding. Run it again."

For the first month, every practice felt like a punishment. My lungs burned, my shins ached, and Coach watched with his arms crossed, saying only "Again" or "Faster" or, on the rare occasion I ran well, "That's it."

I wanted to quit so badly I composed the speech in my head every night. I even walked to his office one Thursday after practice, ready to deliver it.

He looked up from his desk and said, "Sit down. Tell me why you're here." I said I came to quit. He said, "I didn't ask what you came to do. I asked why you're here."

I didn't understand the question. He waited. Then he said, "You're here because when you run hard, you feel something you don't feel anywhere else. And it scares you, because it means you care. Caring is the hardest part."

I ran the rest of the season. Then the next three years. I was never fast — never the star, never the one who broke records. But I finished every race. And Coach's words — "Caring is the hardest part" — followed me into everything I've done since. Every job I've wanted to quit, every relationship that got difficult, every project that felt too big. I hear his voice and I keep running.`,
    tags: ["sports", "mentor", "perseverance", "high-school"],
    reflections: [
      {
        question:
          "Looking back, do you think Coach Ramirez knew you'd stay that day you walked into his office?",
        answer:
          "I think he'd seen a hundred kids walk through that door with the same speech. He knew the ones who would stay were the ones who could hear the real question underneath the excuse. I think he gambled that I was one of them. And he was right, but barely.",
      },
      {
        question:
          "What did running teach you that you couldn't have learned any other way?",
        answer:
          "That discomfort isn't the same as damage. I spent most of my early life avoiding anything that hurt, and running taught me that some pain is just the feeling of growth. Once I learned to sit with that — to keep going when my body said stop — I could apply it everywhere. It's the most transferable skill I have.",
      },
    ],
    daysAgo: 30,
  },

  // ── Prompt 3: The Sounds of Home ─────────────────────────────
  {
    promptIndex: 3,
    title: "The Screen Door Spring",
    body: `Our screen door had a spring that sang when you opened it — a rising note like a question — and then slapped shut behind you with an answer. I heard it a hundred times a day growing up: kids running in and out, dogs pushing through, my father going to check the mail.

At night, when the house was quiet, the spring was the loudest thing in the world. If it sang after ten o'clock, someone was coming home late, and you could lie in bed and count the beats until you heard the lock turn and knew everyone was safe.

My mother hated that spring. She said it sounded cheap. My father kept promising to replace it with a pneumatic closer — something smooth and silent. He never did. I think secretly he liked the announcement, the way the door declared every entrance and exit.

When I left for college, the sound I missed most wasn't my mother's voice or the television or the dog. It was that spring. My dorm room door closed with a heavy thud, institutional and final. No song, no question, no answer.

I came home for Thanksgiving and stood on the porch for a moment before going in, just so I could hear it. The pitch had dropped slightly — the spring was getting old. But it still sang, and the door still slapped, and I was still home.

The spring finally broke the year after my parents sold the house. My mother mentioned it casually on the phone, like she was reporting the weather. I felt it more than I expected to — the end of a sound I'd known my whole life, gone without ceremony into someone else's quiet house.`,
    tags: ["home", "childhood", "nostalgia", "loss"],
    reflections: [
      {
        question:
          "Why do you think a sound can carry so much more memory than a visual image?",
        answer:
          "Because sounds are involuntary. You can close your eyes, but you can't close your ears. Every time that spring sang, it wrote itself into my memory whether I was paying attention or not. Thirty years of repetition made it part of my operating system. When it was gone, something in me kept listening for it.",
      },
      {
        question:
          "Have you tried to find that sound again — in your own home, or anywhere?",
        answer:
          "I bought an old screen door with a spring for my back porch. The pitch is different — higher, thinner — but the rhythm is the same: question, pause, answer. My kids don't notice it yet. But they will. One day they'll go somewhere quiet and realize what's missing.",
      },
    ],
    daysAgo: 10,
  },
  {
    promptIndex: 3,
    title: "Radio Static on I-40",
    body: `My father drove a truck for thirty years, and when I was twelve, he took me on a run from Nashville to Amarillo. Just the two of us, four days, sleeping in truck stops and eating at diners that all had the same coffee.

The radio was the heartbeat of the cab. He kept it on AM, tuned to whatever country station he could find. Between cities, the stations would fade into static — long stretches of white noise broken by ghost voices from distant transmitters. He never switched it off. He said the static was part of the music.

At night, the AM dial did strange things. We'd pick up stations from a thousand miles away — a preacher in Del Rio, a ballgame in St. Louis, a Spanish-language station that played nothing but boleros. The signals drifted in and out like weather systems.

My father didn't talk much on that trip. He hummed along to songs I didn't know and watched the headlights eat the highway. When he did talk, it was about the road — which exits had good food, where the speed traps were, how to read the sky for weather.

By the third night I'd stopped trying to fill the silence. I sat in the passenger seat and listened to the static and the engine and my father's occasional humming, and I understood for the first time that silence between two people isn't empty. It's full of everything they don't need to say.

He retired the next year. Sold the truck to a kid in Memphis who immediately put a satellite radio in the cab. I wonder if he ever hears the ghosts between the stations, or if that's a kind of listening that died with the AM dial.`,
    tags: ["father", "travel", "silence", "memory"],
    reflections: [
      {
        question:
          "That trip sounds like a turning point in your relationship with your father. Was it?",
        answer:
          "It was the first time I saw him as a person and not just my dad. In the cab, he wasn't in charge of anything except the road. He was relaxed in a way I'd never seen at home. I think the truck was the only place he felt fully himself, and for four days, he let me see that.",
      },
      {
        question:
          "You describe silence as 'full.' When did that understanding start to shape your other relationships?",
        answer:
          "Immediately. Before that trip, I thought silence meant something was wrong — that if nobody was talking, somebody was angry. After those nights in the cab, I started to recognize comfortable silence as its own kind of intimacy. It changed how I picked friends, how I dated, eventually how I married. I chose someone who could sit with me and say nothing, and have it mean everything.",
      },
    ],
    daysAgo: 18,
  },
  {
    promptIndex: 3,
    title: "Wind Chimes in the Hospital Window",
    body: `My sister hung wind chimes in the window of my mother's hospital room. They were small — ceramic tubes on fishing line — and the nurses said they were against policy. My sister smiled and said she hadn't heard that, and the chimes stayed.

The room had a particular silence that was hard to be in. Not quiet — there were machines, and beeps, and the shuffle of shoes in the hall. But the human silence was enormous. My mother was past conversation by then. She could squeeze your hand, but that was it.

The wind chimes changed the room. When the air conditioning kicked on, they moved — a soft, random music that didn't ask anything of anyone. You didn't have to respond to it. You could just let it be sound.

I spent three weeks in that room. I read to her. I held her hand. I watched the news with the volume off. And through all of it, the chimes kept up their small conversation with the air.

The night she died, the room was very still. The air conditioning hadn't cycled in hours, and the chimes hung motionless. My sister and I sat on either side of the bed, listening to the machines slow down and then stop.

In the silence that followed — the real silence, the kind that swallows everything — one of the chimes moved. Just a single note, soft and clear, as if someone had breathed on it. My sister looked at me. I looked at her. Neither of us said anything.

The nurses came in. The chimes came down. We drove home in the dark, not speaking, the echo of that single note still ringing in the kind of silence my father taught me to hear on I-40 thirty years ago.`,
    tags: ["mother", "grief", "hospital", "loss", "family"],
    reflections: [
      {
        question:
          "What did the sound of those chimes give you that the silence couldn't?",
        answer:
          "Permission to not be in charge of the moment. When you're watching someone die, there's a terrible pressure to say the right thing, to be present in the right way. The chimes took that pressure off. They were doing the work of filling the room so I could just be there. I'll always be grateful to my sister for understanding what we needed before I did.",
      },
      {
        question:
          "That final note — do you have a way of understanding it, or do you let it remain a mystery?",
        answer:
          "I've thought about it every day since. The rational answer is that the air shifted. The answer I carry in my body is different. I don't try to resolve it. Some things are more useful as questions.",
      },
    ],
    daysAgo: 2,
  },

  // ── Prompt 4: A Lesson Learned the Hard Way ──────────────────
  {
    promptIndex: 4,
    title: "The Speech I Wasn't Ready to Give",
    body: `I was twenty-four and I volunteered to give a presentation at a regional conference because my boss asked me to and I was too proud to say no. I had two weeks to prepare. I spent one and a half of them thinking about it and two days actually writing the slides.

The room held about two hundred people. I walked to the podium feeling like I knew enough to improvise. I'd always been good at talking. How hard could it be?

Very hard, as it turned out.

I made it through the first three slides with momentum from adrenaline. By the fourth slide I was off-script, searching for words I thought I had but didn't. By the sixth I was repeating myself. By the eighth, I could see people checking their phones.

I finished in twenty-two minutes. The talk was supposed to be forty-five. I asked for questions. Nobody raised a hand. The moderator thanked me with the specific kindness people reserve for public failure.

I drove home with the windows down, replaying every stumble. My face burned for three days. I avoided the office kitchen because two people who'd been in the audience worked on my floor.

A month later, my boss asked me to present again — a smaller venue, a topic I actually knew. I said no. She said, "That's exactly why you should do it." She was right, and I hated her for it.

I prepared for three weeks that time. I practiced in front of a mirror, in the car, in the shower. I timed every section. I anticipated questions and wrote out answers.

The second talk was adequate. Not great — just competent. But it taught me the real lesson: the difference between confidence and preparation. Confidence is what you feel. Preparation is what you do. Only one of them shows up when the room goes quiet.`,
    tags: ["career", "failure", "growth", "public-speaking"],
    reflections: [
      {
        question:
          "Is there a part of you that's grateful for the first failed talk?",
        answer:
          "Absolutely. It was humiliating, but it burned away a kind of laziness I didn't know I had. I'd been coasting on being 'smart enough' and that talk showed me that smart enough isn't the same as prepared. Every good thing I've done since has been rooted in that embarrassment.",
      },
      {
        question:
          "Your boss pushed you to do it again. How do you see her role in this now?",
        answer:
          "She was the critical piece. If she'd let me retreat, I would have. And I would have built a whole identity around avoiding public speaking. Instead, she made me face it again before the scar tissue hardened. That's the best kind of management — not rescuing someone, but refusing to let them rescue themselves.",
      },
    ],
    daysAgo: 15,
  },
  {
    promptIndex: 4,
    title: "Burning the Garden",
    body: `The spring I turned thirty, I decided to grow vegetables. Not a small herb garden on the windowsill — a real garden, with rows and stakes and a plan I drew on graph paper. I ordered seeds from three different catalogs. I watched YouTube videos on soil pH. I bought a rototiller I couldn't afford.

I prepared the bed meticulously. I composted, I amended, I tested. I planted according to the calendar, spaced everything perfectly, and watered on schedule. For two weeks, it was the most controlled thing in my life.

Then the aphids came. Then the slugs. Then something I never identified ate every tomato plant down to the stem overnight. I sprayed organic pesticide, laid copper tape, built a chicken-wire fence. The garden fought back against every intervention.

By July, the zucchini had taken over like an occupying army. The carrots never germinated. The beans climbed the fence and went to the neighbor's yard instead of the trellis. The whole plot looked like a battlefield.

I stood there one Sunday morning with a coffee cup in my hand and a deep, irrational rage at vegetation. My wife came out and said, "You know the farmers' market is three blocks away, right?"

I pulled everything out in August. Rototilled it flat. Planted grass seed over the grave.

But here's what I actually learned: control is an illusion, perfectionism is a trap, and some things grow the way they want to regardless of your graph paper. I apply this to my work, my parenting, my marriage — basically everything except gardening, which I have wisely abandoned to people who deserve the aggravation.`,
    tags: ["humor", "failure", "gardening", "life-lesson"],
    reflections: [
      {
        question:
          "It sounds like the garden was about more than vegetables. What were you really trying to control?",
        answer:
          "Everything. I was thirty and terrified that my life wasn't where I'd planned it to be. The garden was supposed to be proof that I could make something grow on my terms. When it refused to cooperate, I took it personally, which is insane — being offended by a zucchini. But that's what perfectionism does: it turns every uncontrollable outcome into a personal failure.",
      },
      {
        question:
          "Your wife's comment about the farmers' market — was that helpful or infuriating in the moment?",
        answer:
          "Both. She is infuriatingly practical, which is exactly what I need. In the moment, I wanted her to say 'I'm sorry' or 'You did your best.' Instead, she pointed out that the problem I was solving didn't need solving. That's her gift — cutting through my drama to the actual question, which was: do you want tomatoes, or do you want to prove something?",
      },
    ],
    daysAgo: 22,
  },
  {
    promptIndex: 4,
    title: "The Apology I Owed for Twenty Years",
    body: `When I was sixteen, I said something terrible to my best friend Danny. We were arguing about something meaningless — a girl, probably, or whose turn it was to drive — and I said the one thing I knew would hurt him most. I reached for the cruelest, most specific weapon I had: a secret he'd trusted me with about his family.

The look on his face is something I still see clearly, thirty years later. Not anger — that I could have handled. It was surprise. The surprise of someone realizing that the person they trusted most had just used that trust as a blade.

He didn't yell. He didn't hit me. He said, "Wow," very quietly, and walked to his car. He drove away and we didn't speak for the rest of the summer.

In September, school forced us back into proximity. We rebuilt something. We called it friendship. But we both knew the shape had changed. He stopped telling me things that mattered. I stopped asking. We orbited each other through senior year and then drifted apart completely.

I thought about calling him a thousand times over the years. Every time, I talked myself out of it. What would I say? How do you apologize for something twenty years old?

Last year, I stopped thinking and just dialed. He picked up on the third ring. His voice was the same.

I said, "Danny, I need to apologize for what I said that day in the parking lot, junior year." There was a pause. Then he said, "I know which day you mean."

I apologized. Really apologized — not the kind where you explain yourself, but the kind where you say what you did and why it was wrong and you don't ask for anything in return.

He was quiet for a long time. Then he said, "I wondered if you'd ever call." Then he said, "Thank you."

We talked for an hour after that. We're not best friends again — too much life has happened — but we're something. And the weight I'd been carrying dropped away so fast I felt dizzy.`,
    tags: ["friendship", "regret", "apology", "growth"],
    reflections: [
      {
        question:
          "What finally made you pick up the phone after all those years?",
        answer:
          "My daughter said something cruel to her friend and I saw the same surprise on that kid's face. It was a mirror I couldn't look away from. I realized that if I wanted to teach her about apologies, I had to prove I believed in them myself. She doesn't know she's the reason I called Danny. Maybe one day I'll tell her.",
      },
      {
        question:
          "You said the weight 'dropped away.' Did you realize how heavy it had been before that call?",
        answer:
          "Not fully. I'd been carrying it so long it had become part of my posture. When it was gone, I noticed all the ways I'd compensated for it — the over-caution in friendships, the fear of conflict, the way I'd learned to never say what I really thought. That one act of cruelty at sixteen had shaped decades of behavior. The apology didn't erase the damage, but it stopped the compounding.",
      },
    ],
    daysAgo: 6,
  },
];

// ── Main ────────────────────────────────────────────────────────

async function seedTestStories() {
  const sql = postgres(connectionString);

  console.log("🌱 Seeding 15 test stories for archive…\n");

  // 1. Create test account
  const email = "test@chronicle.local";
  const passwordHash = hashSync("chronicle123", 10);

  const [account] = await sql`
    INSERT INTO accounts (id, email, password_hash, created_at, updated_at)
    VALUES (gen_random_uuid(), ${email}, ${passwordHash}, now(), now())
    ON CONFLICT (email) DO UPDATE SET updated_at = now()
    RETURNING id
  `;
  console.log(`  ✓ Account: ${email} (${account.id})\n`);

  // 2. Insert all prompts
  const promptIds: string[] = [];
  for (const p of PROMPTS) {
    const [row] = await sql`
      INSERT INTO prompts (id, title, description, is_active, created_at)
      VALUES (gen_random_uuid(), ${p.title}, ${p.description}, true, now())
      ON CONFLICT DO NOTHING
      RETURNING id, title
    `;
    // If ON CONFLICT ate it, fetch existing
    if (row) {
      promptIds.push(row.id);
      console.log(`  ✓ Prompt: "${row.title}"`);
    } else {
      const [existing] = await sql`
        SELECT id, title FROM prompts WHERE title = ${p.title} LIMIT 1
      `;
      promptIds.push(existing.id);
      console.log(`  ✓ Prompt (existing): "${existing.title}"`);
    }
  }
  console.log("");

  // 3. Insert stories with tags & reflections
  for (const s of STORIES) {
    const promptId = promptIds[s.promptIndex];

    const [story] = await sql`
      INSERT INTO stories (id, account_id, title, body, status, prompt_id,
                           created_at, updated_at, published_at)
      VALUES (
        gen_random_uuid(),
        ${account.id},
        ${s.title},
        ${s.body},
        'published',
        ${promptId},
        now() - ${s.daysAgo + 2 + " days"}::interval,
        now() - ${s.daysAgo + " days"}::interval,
        now() - ${s.daysAgo + " days"}::interval
      )
      RETURNING id
    `;

    // Tags
    for (const tag of s.tags) {
      await sql`
        INSERT INTO story_tags (id, story_id, tag)
        VALUES (gen_random_uuid(), ${story.id}, ${tag})
        ON CONFLICT DO NOTHING
      `;
    }

    // Reflection Q&A
    for (let i = 0; i < s.reflections.length; i++) {
      const [question] = await sql`
        INSERT INTO interview_questions (id, story_id, question_text, sort_order, created_at)
        VALUES (gen_random_uuid(), ${story.id}, ${s.reflections[i].question}, ${i}, now())
        RETURNING id
      `;
      await sql`
        INSERT INTO interview_responses (id, question_id, response_text, created_at)
        VALUES (gen_random_uuid(), ${question.id}, ${s.reflections[i].answer}, now())
      `;
    }

    console.log(
      `  ✓ Story: "${s.title}" (${s.tags.length} tags, ${s.reflections.length} reflections)`
    );
  }

  console.log(`\n✅ Seeded ${STORIES.length} stories across ${PROMPTS.length} prompts.`);
  console.log("   View archive at: http://localhost:3000/archive");

  await sql.end();
  process.exit(0);
}

seedTestStories().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
