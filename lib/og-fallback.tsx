import { Dusk, Footer, NightPanel, OgGhost, OgStone, Sparkle, Spider } from "./og";
import type { Grave } from "./github";

const SAMPLE: Grave = {
  name: "todo-app-v3",
  description: null,
  url: "",
  language: null,
  stars: 0,
  born: "2022-01-01T00:00:00Z",
  died: "2023-03-01T00:00:00Z",
  lifespanDays: 424,
  archived: false,
  cause: "Replaced by its own sequel",
  epitaph: "TODO: write epitaph",
  shape: "round",
  tilt: -2,
};

export function HomeCard() {
  return (
    <Dusk>
      <Spider x={560} width={60} thread={70} />
      <Sparkle size={30} x={70} y={190} />
      <Sparkle size={18} x={44} y={240} />
      <Sparkle size={24} x={660} y={360} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", left: 40, top: 70, width: 660 }}>
        <div style={{ display: "flex", fontFamily: "Playfair", fontSize: 112, lineHeight: 0.9, letterSpacing: -4 }}>EVERY DEV</div>
        <div style={{ display: "flex", fontFamily: "Script", fontSize: 96, lineHeight: 1, color: "#fff", marginTop: -26, marginBottom: -30, transform: "rotate(-7deg)" }}>
          has a secret
        </div>
        <div style={{ display: "flex", fontFamily: "Playfair", fontSize: 100, lineHeight: 0.9, letterSpacing: -4 }}>GRAVEYARD</div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 500, opacity: 0.8, marginTop: 30, width: 560, textAlign: "center", justifyContent: "center" }}>
          Enter a GitHub username. Get a tombstone for every dead repo.
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 44, display: "flex" }}>
        <Footer />
      </div>
      <NightPanel style={{ right: 32, top: 32, bottom: 32, width: 400 }}>
        <OgGhost color="#b7ef9e" width={84} style={{ right: 30, top: 64, transform: "rotate(12deg)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center" }}>
          <OgStone grave={SAMPLE} colorIndex={4} width={280} height={400} scale={1.05} />
        </div>
      </NightPanel>
    </Dusk>
  );
}
