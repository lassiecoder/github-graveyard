export type Shape = "round" | "cross" | "gothic" | "slab";

export type Diagnosis = {
  cause: string;
  epitaph: string;
  shape: Shape;
  tilt: number;
};

type Corpse = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  size: number;
  openIssues: number;
  archived: boolean;
  topics: string[];
  lifespanDays: number;
  bornMonth: number;
};

// Deterministic so the same repo always dies the same way: screenshots match the
// share card, and nobody can reroll their way to a better death.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const pick = <T,>(arr: readonly T[], seed: number) => arr[seed % arr.length];

type Rule = { test: (c: Corpse, text: string) => boolean; causes: string[] };

// Name/description jokes: the first match wins, since these are the funniest fit.
const SPECIFIC: Rule[] = [
  {
    test: (c) => c.size === 0,
    causes: ["Stillborn. Not a single commit drew breath.", "Never made it past git init"],
  },
  {
    test: (_, t) => /hacktoberfest/.test(t),
    causes: ["Lived only for a free t-shirt", "Hacktoberfest ended. So did the will to live."],
  },
  {
    test: (c, t) => /advent|aoc|adventofcode/.test(t) || (c.bornMonth === 11 && /day|puzzle/.test(t)),
    causes: ["Gave up on Day 6 of Advent of Code", "Defeated by a puzzle about elves"],
  },
  {
    test: (_, t) => /todo|to-do|task-?(list|manager)/.test(t),
    causes: [
      "Too many todos. Zero dones.",
      "Item #1 on its own list: finish this app",
      "Ironically never checked off",
    ],
  },
  {
    test: (_, t) => /(v\d|-new|new-|-final|final-|-2$|2\.0|rewrite|redux-?version)/.test(t),
    causes: [
      "Replaced by its own sequel",
      "Killed off by v-next. The sequel also died.",
      "\"This time I'll do it right\"",
    ],
  },
  {
    test: (_, t) => /blockchain|crypto|\bnft|web3|solidity|\bdefi\b|coin\b/.test(t),
    causes: ["Rug-pulled by the bear market", "Gas fees exceeded will to live", "Went to zero"],
  },
  {
    test: (_, t) => /\b(gpt|llm|openai|chatbot|langchain|ai-|-ai\b|ai-agent)/.test(t),
    causes: [
      "The hype cycle moved on without it",
      "Made obsolete by the next model release",
      "Became a thin wrapper, then thin air",
    ],
  },
  {
    test: (_, t) => /portfolio|personal-?site|my-?website|\.github\.io|resume|homepage/.test(t),
    causes: ["Redesigned into oblivion", "Rebuilt in a newer framework. Again.", "Got the job. Never updated it again."],
  },
  {
    test: (_, t) => /tutorial|course|learn|udemy|bootcamp|100-?days|practice|exercise|homework|assignment/.test(t),
    causes: ["Tutorial completed. Motivation not.", "Followed along until the video ended", "Day 4 of 100DaysOfCode"],
  },
  {
    test: (_, t) => /clone\b|-like\b/.test(t),
    causes: ["The original is doing fine, thanks", "Cloned the UI. Not the business model."],
  },
  {
    test: (_, t) => /\bbot\b|bot$|discord|telegram|slack/.test(t),
    causes: ["Rate-limited into the afterlife", "The API it depended on got paywalled", "Token revoked. Bot evicted."],
  },
  {
    test: (_, t) => /(^|[-_. ])(test|testing|playground|sandbox|scratch|demo|poc|experiments?|hello-?world|temp|tmp)([-_. ]|$)/.test(t),
    causes: ["Was only ever an experiment", "Proof of concept. Concept not proven.", "\"Just testing something real quick\""],
  },
  {
    test: (_, t) => /dotfiles|config|nvim|vim|emacs|zsh/.test(t),
    causes: ["Spent more time configuring than coding", "Switched editors. Again."],
  },
  {
    test: (_, t) => /game|unity|godot|pygame|phaser/.test(t),
    causes: ["The game designer quit (it was you)", "Stuck in pre-production forever", "Only the main menu works"],
  },
  {
    test: (_, t) => /startup|saas|mvp|launch|landing/.test(t),
    causes: ["Zero users. Zero regrets.", "Pivoted into the void", "Bought the domain. Spent the motivation."],
  },
];

// Trait jokes: every match joins the pool, so a graveyard full of famous or
// archived repos doesn't repeat one line down the whole row.
const TRAITS: Rule[] = [
  {
    test: (c) => c.archived,
    causes: [
      "Laid to rest with full honors (archived)",
      "Peacefully archived, surrounded by forks",
      "Read-only. Like a tomb.",
      "Put out to pasture with a nice README",
    ],
  },
  {
    test: (c) => c.stars >= 500,
    causes: [
      "Fame wasn't enough to save it",
      "Died famous. Issues still open.",
      "Starred by thousands, maintained by none",
      "Peaked on Hacker News",
      "Outgrown by its own users",
      "Every star a lit candle",
      "Its forks went on without it",
    ],
  },
  {
    test: (c) => c.openIssues >= 10,
    causes: ["Buried under its own issues", "Death by a thousand GitHub notifications"],
  },
  {
    test: (c) => c.lifespanDays <= 2,
    causes: ["Weekend project. It was a long weekend.", "Died in infancy. Born and abandoned same day.", "Hackathon energy ran out at 4am"],
  },
  { test: (c) => c.language === "Rust", causes: ["Fought the borrow checker. Lost.", "Rewritten in Rust. Then abandoned in Rust."] },
  { test: (c) => c.language === "TypeScript", causes: ["Death by type gymnastics", "any spread like an infection"] },
  { test: (c) => c.language === "JavaScript", causes: ["node_modules achieved sentience", "Framework went out of style mid-build"] },
  { test: (c) => c.language === "Python", causes: ["Virtualenv lost to the ages", "Dependency hell, literally"] },
  { test: (c) => c.language === "Go", causes: ["if err != nil { die() }"] },
  { test: (c) => c.language === "Java" || c.language === "Kotlin", causes: ["Crushed under an AbstractSingletonProxyFactoryBean", "Gradle sync never finished"] },
  { test: (c) => c.language === "Swift" || c.language === "Dart", causes: ["Rejected by App Review. Spiritually.", "Xcode update broke everything"] },
  { test: (c) => c.language === "PHP", causes: ["Outlived by WordPress", "Died of natural causes (PHP)"] },
  { test: (c) => c.language === "C" || c.language === "C++", causes: ["Segmentation fault (core dumped)", "Undefined behavior, defined death"] },
  { test: (c) => c.language === "HTML" || c.language === "CSS", causes: ["Couldn't center the div", "z-index: -9999"] },
];

const GENERIC = [
  "New idea",
  "Got distracted by a newer, shinier idea",
  "Scope creep",
  "\"I'll finish it this weekend\"",
  "Lost the .env file",
  "Got a job",
  "Domain expired",
  "Started a rewrite instead",
  "Ran out of free tier",
  "The README was the best part",
  "Works on my machine. Machine died.",
  "Forgot how it worked",
  "Life happened",
  "Saw someone else ship it first",
];

const EPITAPHS = [
  "It compiled. That was enough.",
  "Here lies great potential and a half-written README.",
  "Gone, but never git rm'd.",
  "Forever in our git log.",
  "May its dependencies rest in peace.",
  "It worked on my machine.",
  "Taken from us by a better idea.",
  "TODO: write epitaph",
  "Never deployed. Always loved.",
  "Rest in /dev/null.",
  "It had so many plans in its issues tab.",
  "Its last words: \"wip\"",
  "Beloved side project. Sometimes opened.",
  "Survived by 47 browser tabs.",
  "No tests. No regrets.",
  "Returned with exit code 0. Peacefully.",
  "Shipped to localhost only.",
  "Pushed to main, then to the grave.",
];

const SHAPES: Shape[] = ["round", "round", "gothic", "cross", "slab"];

// `used` is shared across one graveyard so each cause appears at most once
// while alternatives remain.
export function diagnose(c: Corpse, used: Set<string> = new Set()): Diagnosis {
  const seed = hash(c.name);
  const text = `${c.name} ${c.description ?? ""} ${c.topics.join(" ")}`.toLowerCase();
  const specific = SPECIFIC.find((r) => r.test(c, text))?.causes ?? [];
  const pool = [...TRAITS.filter((r) => r.test(c, text)).flatMap((r) => r.causes), ...GENERIC];
  const fresh = (list: string[]) => {
    for (let i = 0; i < list.length; i++) {
      const cause = list[(seed + i) % list.length];
      if (!used.has(cause)) return cause;
    }
  };
  const cause = (specific.length && fresh(specific)) || fresh(pool) || pick(pool, seed);
  used.add(cause);
  return {
    cause,
    epitaph: pick(EPITAPHS, seed >>> 3),
    shape: pick(SHAPES, seed >>> 7),
    tilt: ((seed >>> 11) % 7) - 3,
  };
}

export function graveyardTitle(dead: number, total: number, avgLifespan: number) {
  if (total === 0) return { rank: "The Empty Lot", blurb: "Not a single repo. Nothing to bury. Suspicious." };
  if (dead === 0) return { rank: "Suspiciously Clean", blurb: "No graves found. Either very disciplined, or deletes the evidence." };
  const ratio = dead / total;
  if (dead >= 50) return { rank: "Mass Grave Operator", blurb: "This isn't a graveyard. It's an industry." };
  if (ratio >= 0.85) return { rank: "Grim Reaper of Repos", blurb: "Almost nothing survives contact with this developer." };
  if (avgLifespan <= 7) return { rank: "Weekend Warrior", blurb: "Starts strong Saturday. Gone by Monday standup." };
  if (dead >= 20) return { rank: "Serial Abandoner", blurb: "Has a type: new, shiny, and soon forgotten." };
  if (ratio >= 0.5) return { rank: "Graveyard Shift Manager", blurb: "Half the portfolio is pushing up daisies." };
  if (dead >= 5) return { rank: "Casual Necromancer", blurb: "A few bodies buried. Some may still rise." };
  return { rank: "Mostly Alive", blurb: "A tidy little plot. Respect." };
}
