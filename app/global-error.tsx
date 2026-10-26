"use client";

// Last-resort error page for crashes in the root layout itself. It replaces
// the whole document, so it can't rely on globals.css or the site fonts:
// everything is inline, in the site's colours.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(170deg, #ffc08f, #ffb07f 45%, #ffa47c)",
          color: "#17110e",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 16,
        }}
      >
        <title>Something went wrong · GitHub Graveyard</title>
        <div>
          <h1 style={{ fontSize: "clamp(2.4rem, 9vw, 4rem)", fontFamily: "Georgia, serif", margin: 0 }}>The grave caved in</h1>
          <p style={{ fontSize: 18, opacity: 0.8 }}>Something went wrong. Give it another go.</p>
          <button
            onClick={() => retry()}
            style={{ marginTop: 16, background: "#17110e", color: "#fffaf3", border: 0, borderRadius: 999, padding: "14px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            Dig again
          </button>
        </div>
      </body>
    </html>
  );
}
