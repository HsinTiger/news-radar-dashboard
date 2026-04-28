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

function getEvidenceSummary(proposal) {
  const { evidence } = proposal;
  if (!evidence) return "";
  
  const lines = [];
  if (evidence.sample_ids && evidence.sample_ids.length > 0) {
    lines.push(`Samples: ${evidence.sample_ids.join(", ")}`);
  }
  if (evidence.metrics) {
    const metricLines = Object.entries(evidence.metrics)
      .slice(0, 2)
      .map(([k, v]) => `${k}=${v}`);
    if (metricLines.length) lines.push(metricLines.join(" · "));
  }
  return lines.join("\n");
}

export function ProposalCard({ proposal, onApprove, onReject, onAmend }) {
  const [copied, setCopied] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showAmendInput, setShowAmendInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [amendComment, setAmendComment] = useState("");

  const isCopied = copied;
  const fireIdShort = proposal.fire_id.split("-")[0].slice(0, 8);

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    const text = `phase9-decision approve ${fireIdShort}`;
    handleCopy(text);
    onApprove?.(proposal.fire_id);
  };

  const handleReject = () => {
    if (!rejectReason.trim() && showRejectInput) return;
    if (showRejectInput) {
      const text = `phase9-decision reject ${fireIdShort} reason: ${rejectReason}`;
      handleCopy(text);
      onReject?.(proposal.fire_id, rejectReason);
      setRejectReason("");
      setShowRejectInput(false);
    } else {
      setShowRejectInput(true);
    }
  };

  const handleAmend = () => {
    if (!amendComment.trim() && showAmendInput) return;
    if (showAmendInput) {
      const text = `phase9-decision amend ${fireIdShort} comment: ${amendComment}`;
      handleCopy(text);
      onAmend?.(proposal.fire_id, amendComment);
      setAmendComment("");
      setShowAmendInput(false);
    } else {
      setShowAmendInput(true);
    }
  };

  const analyzerColor = ANALYZER_COLORS[proposal.analyzer] || "var(--fg-3)";
  const confidenceColor = CONFIDENCE_COLORS[proposal.evidence?.confidence] || "var(--fg-3)";

  return (
    <div
      className="nr-card"
      style={{
        padding: 16,
        marginBottom: 12,
        opacity: isCopied ? 0.6 : 1,
        transition: "opacity 0.2s ease",
        borderLeft: `4px solid ${analyzerColor}`,
      }}
    >
      {/* Header row: analyzer | platform | confidence */}
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

      {/* Evidence summary */}
      <div
        style={{
          fontSize: 11,
          color: "var(--fg-2)",
          marginBottom: 10,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
        }}
      >
        {getEvidenceSummary(proposal)}
      </div>

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

      {/* Reject reason input (if visible) */}
      {showRejectInput && (
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: 11,
              border: "1px solid var(--border)",
              borderRadius: 4,
              background: "var(--bg-muted)",
              color: "var(--fg)",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* Amend comment input (if visible) */}
      {showAmendInput && (
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Amendment comment..."
            value={amendComment}
            onChange={(e) => setAmendComment(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: 11,
              border: "1px solid var(--border)",
              borderRadius: 4,
              background: "var(--bg-muted)",
              color: "var(--fg)",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* Button row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleApprove}
          style={{
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--st-published)",
            background: "transparent",
            border: `1px solid var(--st-published)`,
            borderRadius: 4,
            cursor: "pointer",
            transition: "all 0.2s ease",
            opacity: isCopied ? 0.5 : 1,
          }}
          onMouseEnter={(e) => !isCopied && (e.currentTarget.style.background = "var(--st-published)", e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => !isCopied && (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "var(--st-published)")}
        >
          ✅ Approve
        </button>

        <button
          onClick={handleReject}
          style={{
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--st-error)",
            background: "transparent",
            border: `1px solid var(--st-error)`,
            borderRadius: 4,
            cursor: "pointer",
            transition: "all 0.2s ease",
            opacity: isCopied ? 0.5 : 1,
          }}
          onMouseEnter={(e) => !isCopied && (e.currentTarget.style.background = "var(--st-error)", e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => !isCopied && (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "var(--st-error)")}
        >
          ❌ {showRejectInput ? "Cancel" : "Reject"}
        </button>

        <button
          onClick={handleAmend}
          style={{
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 600,
            color: "var(--accent)",
            background: "transparent",
            border: `1px solid var(--accent)`,
            borderRadius: 4,
            cursor: "pointer",
            transition: "all 0.2s ease",
            opacity: isCopied ? 0.5 : 1,
          }}
          onMouseEnter={(e) => !isCopied && (e.currentTarget.style.background = "var(--accent)", e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => !isCopied && (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "var(--accent)")}
        >
          📝 {showAmendInput ? "Cancel" : "Amend"}
        </button>

        {isCopied && (
          <div style={{ fontSize: 10, color: "var(--fg-2)", marginLeft: "auto" }}>
            📋 Decision copied — paste to PM
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
