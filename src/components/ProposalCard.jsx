import { useState } from "react";
import { Icon } from "@/components/Icon.jsx";

const ANALYZER_NAMES = {
  harvest: "Harvest",
  topic: "Topic",
  scorer: "Scorer",
  composer: "Composer",
  gate: "Gate",
};

const ANALYZER_COLORS = {
  harvest: "var(--st-error)",
  topic: "var(--st-drafted)",
  scorer: "var(--st-queued)",
  composer: "var(--accent)",
  gate: "var(--fg-3)",
};

const PLATFORM_NAMES = {
  facebook: "FB",
  instagram: "IG",
  threads: "Threads",
  all: "All",
};

const CONFIDENCE_COLORS = {
  HIGH: "var(--st-published)",
  MED: "var(--st-queued)",
  LOW: "var(--st-error)",
};

// Decision-state visuals — used when a card has been approved / rejected / amended.
// Kept in one place so the card body and the status pill stay in sync.
const DECISION_VISUALS = {
  approved: { label: "Approved",  icon: "✅", color: "var(--st-published)" },
  rejected: { label: "Rejected",  icon: "❌", color: "var(--st-error)" },
  amended:  { label: "Amended",   icon: "📝", color: "var(--accent)" },
};

function getProposalTitle(proposal) {
  switch (proposal.proposal_type) {
    case "sunset_feed":
      return `Sunset feed: ${proposal.action.field}`;
    case "adjust_weight":
      const category = proposal.action.field.split(".")[0];
      return `Adjust weight: ${category} (${proposal.action.current_value.toFixed(2)} → ${proposal.action.proposed_value.toFixed(2)})`;
    case "tune_threshold":
      return `Tune threshold: ${proposal.action.field} (${proposal.action.current_value.toFixed(2)} → ${proposal.action.proposed_value.toFixed(2)})`;
    case "add_rule":
      return `Add rule: ${proposal.action.field}`;
    case "relax_gate":
      return `Relax gate: ${proposal.action.field}`;
    default:
      return proposal.proposal_type;
  }
}

// Render the evidence block. Prefer evidence.reason (a one-line synthesized
// rationale emitted by the analyzer) when present — that's the human-readable
// "why" we want boss-pinned reviewers to see first. Fall back to a couple of
// raw metrics when reason is missing (older proposals, mock data, etc.).
function renderEvidence(proposal) {
  const { evidence } = proposal;
  if (!evidence) return null;

  const reason = evidence.reason && String(evidence.reason).trim();
  const sampleIds =
    evidence.sample_ids && evidence.sample_ids.length > 0
      ? `Samples: ${evidence.sample_ids.join(", ")}`
      : null;
  const metricLine = evidence.metrics
    ? Object.entries(evidence.metrics)
        .slice(0, 2)
        .map(([k, v]) => `${k}=${v}`)
        .join(" · ")
    : null;

  return (
    <div
      style={{
        fontSize: 11,
        color: "var(--fg-2)",
        marginBottom: 10,
        lineHeight: 1.5,
      }}
    >
      {reason && (
        <div
          style={{
            color: "var(--fg)",
            marginBottom: sampleIds || metricLine ? 6 : 0,
          }}
        >
          <span style={{ color: "var(--fg-3)", marginRight: 4 }}>Reason:</span>
          {reason}
        </div>
      )}
      {sampleIds && <div>{sampleIds}</div>}
      {metricLine && <div>{metricLine}</div>}
    </div>
  );
}

export function ProposalCard({ proposal, decision, onApprove, onReject, onAmend }) {
  const [copied, setCopied] = useState(false);
  // Open lane state: null | "approve" | "reject" | "amend".
  // Mutually exclusive — opening a lane closes the others. Approve has no
  // text input but still opens a lane to surface a Confirm/Cancel pair, so
  // all three actions follow the same 2-step "open → confirm/cancel" pattern.
  const [openLane, setOpenLane] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [amendComment, setAmendComment] = useState("");

  const fireIdShort = proposal.fire_id.split("-")[0].slice(0, 8);
  const isDecided = Boolean(decision);
  const decisionVisual = isDecided ? DECISION_VISUALS[decision] : null;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable (e.g. http preview) — fail silently */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ----- Lane openers (all do the same thing — switch which lane is open) -----
  const openApprove = () => { if (!isDecided) setOpenLane("approve"); };
  const openReject  = () => { if (!isDecided) setOpenLane("reject");  };
  const openAmend   = () => { if (!isDecided) setOpenLane("amend");   };

  const cancelLane = () => {
    setOpenLane(null);
    setRejectReason("");
    setAmendComment("");
  };

  // ----- Confirm handlers -----
  const confirmApprove = () => {
    const text = `phase9-decision approve ${fireIdShort}`;
    handleCopy(text);
    onApprove?.(proposal.fire_id);
    setOpenLane(null);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) return;
    const text = `phase9-decision reject ${fireIdShort} reason: ${rejectReason}`;
    handleCopy(text);
    onReject?.(proposal.fire_id, rejectReason);
    setRejectReason("");
    setOpenLane(null);
  };

  const confirmAmend = () => {
    if (!amendComment.trim()) return;
    const text = `phase9-decision amend ${fireIdShort} comment: ${amendComment}`;
    handleCopy(text);
    onAmend?.(proposal.fire_id, amendComment);
    setAmendComment("");
    setOpenLane(null);
  };

  const analyzerColor = ANALYZER_COLORS[proposal.analyzer] || "var(--fg-3)";
  const confidenceColor = CONFIDENCE_COLORS[proposal.evidence?.confidence] || "var(--fg-3)";

  // ----- Shared button styles -----
  const baseBtn = {
    padding: "6px 12px",
    fontSize: 11,
    fontWeight: 600,
    background: "transparent",
    borderRadius: 4,
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  };
  const outlineBtn = (color, disabled) => ({
    ...baseBtn,
    color: disabled ? "var(--fg-4)" : color,
    border: `1px solid ${disabled ? "var(--border)" : color}`,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  });
  const filledBtn = (color, disabled) => ({
    ...baseBtn,
    color: "white",
    background: disabled ? "var(--fg-4)" : color,
    border: `1px solid ${disabled ? "var(--fg-4)" : color}`,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  });
  const ghostBtn = {
    ...baseBtn,
    color: "var(--fg-2)",
    border: "1px solid var(--border)",
  };

  // Hover handlers for outline buttons (paint on hover, revert on leave).
  const hoverIn = (color) => (e) => {
    e.currentTarget.style.background = color;
    e.currentTarget.style.color = "white";
  };
  const hoverOut = (color) => (e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.color = color;
  };

  return (
    <div
      className="nr-card"
      style={{
        padding: 16,
        marginBottom: 12,
        opacity: isDecided ? 0.75 : 1,
        transition: "opacity 0.2s ease",
        borderLeft: `4px solid ${isDecided ? decisionVisual.color : analyzerColor}`,
        background: isDecided ? "var(--bg-muted)" : undefined,
      }}
    >
      {/* Header row: analyzer | platform | confidence (or decision pill when decided) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: analyzerColor,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {ANALYZER_NAMES[proposal.analyzer]}
          </div>

          {proposal.boss_attention_required && (
            <div
              title="This category/feed is pinned by Hsin — requires approval before any change"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--accent)",
              }}
            >
              <Icon name="lock" size={12} />
              <span>boss-pinned</span>
            </div>
          )}

          <div
            style={{
              fontSize: 10,
              padding: "2px 6px",
              background: "var(--bg-muted)",
              borderRadius: 4,
              color: "var(--fg-2)",
              fontWeight: 500,
            }}
          >
            {PLATFORM_NAMES[proposal.platform]}
          </div>
        </div>

        {isDecided ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              color: decisionVisual.color,
              padding: "3px 10px",
              border: `1px solid ${decisionVisual.color}`,
              borderRadius: 12,
              background: "var(--bg)",
            }}
          >
            <span>{decisionVisual.icon}</span>
            <span>{decisionVisual.label}</span>
          </div>
        ) : (
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: confidenceColor,
              textTransform: "uppercase",
            }}
          >
            {proposal.evidence?.confidence || "?"}
          </div>
        )}
      </div>

      {/* Title line */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--fg)",
          marginBottom: 8,
          lineHeight: 1.4,
        }}
      >
        {getProposalTitle(proposal)}
      </div>

      {/* Evidence block (reason + sample/metrics fallback) */}
      {renderEvidence(proposal)}

      {/* Action target */}
      <div
        style={{
          fontSize: 10,
          color: "var(--fg-3)",
          marginBottom: 12,
          padding: "6px 8px",
          background: "var(--bg-inset)",
          borderRadius: 4,
          fontFamily: "monospace",
          lineHeight: 1.4,
        }}
      >
        {proposal.action.target_config} · {proposal.action.field}
      </div>

      {/* Approve confirmation banner (no input — just affords symmetry) */}
      {openLane === "approve" && !isDecided && (
        <div
          style={{
            marginBottom: 10,
            padding: "8px 10px",
            fontSize: 11,
            lineHeight: 1.5,
            color: "var(--fg)",
            background: "var(--bg-muted)",
            border: "1px solid var(--st-published)",
            borderRadius: 4,
          }}
        >
          Confirm: approve this proposal as-is and copy the deploy command?
        </div>
      )}

      {/* Reject reason textarea (if visible). Multi-line so longer
          rationale fits without scrolling. Enter submits; Shift+Enter
          inserts a newline; Esc cancels — same behavior as Amend below. */}
      {openLane === "reject" && !isDecided && (
        <div style={{ marginBottom: 10 }}>
          <textarea
            placeholder="Reason for rejection... (Enter to submit, Shift+Enter for newline, Esc to cancel)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                confirmReject();
              }
              if (e.key === "Escape") cancelLane();
            }}
            autoFocus
            rows={3}
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: 12,
              lineHeight: 1.5,
              border: "1px solid var(--st-error)",
              borderRadius: 4,
              background: "var(--bg-muted)",
              color: "var(--fg)",
              fontFamily: "inherit",
              boxSizing: "border-box",
              resize: "vertical",
              minHeight: 60,
            }}
          />
        </div>
      )}

      {/* Amend comment textarea (if visible) */}
      {openLane === "amend" && !isDecided && (
        <div style={{ marginBottom: 10 }}>
          <textarea
            placeholder="Amendment comment... (Enter to submit, Shift+Enter for newline, Esc to cancel)"
            value={amendComment}
            onChange={(e) => setAmendComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                confirmAmend();
              }
              if (e.key === "Escape") cancelLane();
            }}
            autoFocus
            rows={3}
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: 12,
              lineHeight: 1.5,
              border: "1px solid var(--accent)",
              borderRadius: 4,
              background: "var(--bg-muted)",
              color: "var(--fg)",
              fontFamily: "inherit",
              boxSizing: "border-box",
              resize: "vertical",
              minHeight: 60,
            }}
          />
        </div>
      )}

      {/* Button row — four modes, ALL non-decided modes use the same
          "[colored Confirm filled-button] + [ghost Cancel]" shape so the
          confirm/cancel pair is visually identical across Approve, Reject,
          and Amend lanes. The only difference is the action color. */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {isDecided ? (
          <div
            style={{
              fontSize: 11,
              color: "var(--fg-2)",
              fontStyle: "italic",
            }}
          >
            {decisionVisual.icon} Decision recorded — paste the copied command to PM to deploy.
          </div>
        ) : openLane === "approve" ? (
          <>
            <button
              onClick={confirmApprove}
              style={filledBtn("var(--st-published)", false)}
            >
              ✅ Confirm Approve
            </button>
            <button onClick={cancelLane} style={ghostBtn}>
              Cancel
            </button>
          </>
        ) : openLane === "reject" ? (
          <>
            <button
              onClick={confirmReject}
              disabled={!rejectReason.trim()}
              style={filledBtn("var(--st-error)", !rejectReason.trim())}
            >
              ❌ Confirm Reject
            </button>
            <button onClick={cancelLane} style={ghostBtn}>
              Cancel
            </button>
          </>
        ) : openLane === "amend" ? (
          <>
            <button
              onClick={confirmAmend}
              disabled={!amendComment.trim()}
              style={filledBtn("var(--accent)", !amendComment.trim())}
            >
              📝 Confirm Amend
            </button>
            <button onClick={cancelLane} style={ghostBtn}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={openApprove}
              style={outlineBtn("var(--st-published)", false)}
              onMouseEnter={hoverIn("var(--st-published)")}
              onMouseLeave={hoverOut("var(--st-published)")}
              title="Accept the proposal as-is. You'll be asked to confirm."
            >
              ✅ Approve
            </button>

            <button
              onClick={openReject}
              style={outlineBtn("var(--st-error)", false)}
              onMouseEnter={hoverIn("var(--st-error)")}
              onMouseLeave={hoverOut("var(--st-error)")}
              title="Reject the proposal. You'll be asked for a reason."
            >
              ❌ Reject
            </button>

            <button
              onClick={openAmend}
              style={outlineBtn("var(--accent)", false)}
              onMouseEnter={hoverIn("var(--accent)")}
              onMouseLeave={hoverOut("var(--accent)")}
              title="Approve with a modification. You'll be asked for a comment."
            >
              📝 Amend
            </button>
          </>
        )}

        {copied && !isDecided && (
          <div style={{ fontSize: 10, color: "var(--fg-2)", marginLeft: "auto" }}>
            📋 Copied
          </div>
        )}
      </div>

      {/* Fire ID for reference */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px dashed var(--border)",
          fontSize: 9,
          color: "var(--fg-4)",
          fontFamily: "monospace",
        }}
      >
        fire_id: {fireIdShort}
      </div>
    </div>
  );
}
