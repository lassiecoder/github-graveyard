// Button text that changes (e.g. "Download" → "Downloading…") without
// resizing the button: every label sits in the same grid cell, so the button
// is always as wide as the longest one and neighbours never shift.
export function StableLabel({ labels, active }: { labels: readonly React.ReactNode[]; active: number }) {
  return (
    <span className="inline-grid">
      {labels.map((label, i) => (
        <span
          key={i}
          className={`col-start-1 row-start-1 inline-flex items-center justify-center gap-2 ${i === active ? "" : "invisible"}`}
          aria-hidden={i !== active}
        >
          {label}
        </span>
      ))}
    </span>
  );
}
