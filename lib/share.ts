import type { Grave, Graveyard } from "./github";
import { lifespanLabel, year } from "./format";
import { SITE_URL } from "./site";
import { xHandleFor } from "./devs";

export const graveyardUrl = (login: string) => `${SITE_URL}/${login}`;
export const graveUrl = (login: string, repo: string) =>
  `${SITE_URL}/${login}/${encodeURIComponent(repo)}`;

export function xIntent(text: string, url: string) {
  const params = new URLSearchParams({ text, url });
  return `https://x.com/intent/post?${params}`;
}

// Featured devs get @-mentioned so the roast lands in their notifications.
const who = (login: string) => {
  const x = xHandleFor(login);
  return x ? `@${x}` : login;
};

export function graveyardTweet(g: Graveyard, mine: boolean) {
  const n = g.graves.length;
  const top = g.graves[0];
  const head = mine
    ? `I dug up my GitHub graveyard: ${n} dead side project${n === 1 ? "" : "s"} 🪦`
    : `Just dug up ${who(g.login)}'s GitHub graveyard: ${n} dead side project${n === 1 ? "" : "s"} 🪦`;
  const lines = [head, ""];
  if (n) lines.push(`Avg lifespan: ${lifespanLabel(g.avgLifespanDays)}`, `Rank: ${g.title.rank}`, "");
  if (top) lines.push(`RIP ${top.name}. Cause of death: ${top.cause}`, "");
  lines.push(mine ? "Dig up yours 👇" : "Who's next? 👇");
  return lines.join("\n");
}

export function graveTweet(login: string, grave: Grave) {
  return [
    `RIP ${grave.name} (${year(grave.born)}–${year(grave.died)}) 🪦`,
    "",
    `Cause of death: ${grave.cause}`,
    "",
    `From ${who(login)}'s GitHub graveyard 👇`,
  ].join("\n");
}
