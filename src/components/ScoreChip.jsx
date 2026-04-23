// ScoreChip — shows confidence_score colored by the gate thresholds (0.70 / 0.65),
// optionally with the weighted_score (confidence × topic_weight) after a middot.
//
// Null handling: live DB has historical rows predating the scoring pipeline
// where confidence_score is NULL. Render `—` in a neutral chip instead of
// crashing. Same for `weighted` — if provided but null, silently omit it.

export function ScoreChip({ score, weighted = null }) {
  const hasScore = typeof score === "number" && Number.isFinite(score);

  let color = "var(--fg-3)";
  if (hasScore) {
    color = "var(--score-bad)";
    if (score >= 0.8) color = "var(--score-good)";
    else if (score >= 0.65) color = "var(--score-ok)";
  }

  const hasWeighted = typeof weighted === "number" && Number.isFinite(weighted);

  return (
    <span
      data-mono
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 7px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        color,
        background: hasScore
          ? `color-mix(in oklab, ${color} 12%, transparent)`
          : "var(--bg-muted)",
      }}
    >
      {hasScore ? score.toFixed(2) : "—"}
      {hasWeighted && (
        <span style={{ opacity: 0.7, fontWeight: 500 }}>· w {weighted.toFixed(2)}</span>
      )}
    </span>
  );
}
