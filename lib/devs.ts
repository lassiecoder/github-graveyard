// Devs featured on the landing page: big, active X accounts with satisfyingly
// full graveyards. X handles come from each GitHub profile's twitter_username
// (checked Oct 2026); a roast post @-mentions them so they see it.
// Ordered by X reach, roughly.
export const FEATURED: { login: string; x: string }[] = [
  { login: "karpathy", x: "karpathy" },
  { login: "leerob", x: "leerob" },
  { login: "ThePrimeagen", x: "ThePrimeagen" },
  { login: "t3dotgg", x: "theo" },
  { login: "rauchg", x: "rauchg" },
  { login: "shadcn", x: "shadcn" },
  { login: "kentcdodds", x: "kentcdodds" },
  { login: "mattpocock", x: "mattpocockuk" },
  { login: "swyxio", x: "swyx" },
  { login: "mitchellh", x: "mitchellh" },
  { login: "steipete", x: "steipete" },
  { login: "mckaywrigley", x: "mckaywrigley" },
];

const byLogin = new Map(FEATURED.map((d) => [d.login.toLowerCase(), d.x]));

export function xHandleFor(login: string) {
  return byLogin.get(login.toLowerCase());
}
