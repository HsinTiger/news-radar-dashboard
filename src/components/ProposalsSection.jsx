import { useState, useMemo } from "react";
import { ProposalCard } from "@/components/ProposalCard.jsx";
import { RelTime } from "@/components/RelTime.jsx";
import { getISOWeekString } from "@/lib/iso-week.js";

const PLATFORM_TABS = [
  { key: "all", label: "All" },
  { key: "facebook", label: "FB" },
  { key: "instagram", label: "IG" },
  { key: "threads", label: "Threads" },
  { key: "shared", label: "Shared" },
];

export function ProposalsSection({ proposals = [], isLive = false, pollTime = null }) {
  const [activeTab, setActiveTab] = useState("all");
  const [cardStates, setCardStates] = useState({});

  const currentWeek = getISOWeekString();

  // Filter to pending proposals (hsin_decision is null)
  const pendingProposals = useMemo(
    () => proposals.filter((p) => p.hsin_decision === null),
    [proposals]
  );

  // Determine empty state
  const hasProposals = pendingProposals.length > 0;
  const emptyStateType = !hasProposals
    ? isLive && !pollTime
      ? "missing"
      : hasProposals
      ? "all_decided"
      : "missing"
    : null;

  // Count proposals by platform
  const platformCounts = useMemo(() => {
    const counts = {
      all: pendingProposals.length,
      facebook: 0,
      instagram: 0,
      threads: 0,
      shared: 0,
    };
    for (const p of pendingProposals) {
      if (p.platform === "all") counts.shared++;
      else if (p.platform === "facebook") counts.facebook++;
      else if (p.platform === "instagram") counts.instagram++;
      else if (p.platform === "threads") counts.threads++;
    }
    return counts;
  }, [pendingProposals]);

  // Filter proposals by active tab
  const filteredProposals = useMemo(() => {
    if (activeTab === "all") return pendingProposals;
    if (activeTab === "shared") {
      return pendingProposals.filter((p) => p.platform === "all");
    }
    return pendingProposals.filter((p) => p.platform === activeTab);
  }, [pendingProposals, activeTab]);

  // Sort by fire_at descending
  const sortedProposals = useMemo(
    () => [...filteredProposals].sort((a, b) => new Date(b.fire_at) - new Date(a.fire_at)),
    [filteredProposals]
  );

  const handleApprove = (fireId) => {
    setCardStates((prev) => ({
      ...prev,
      [fireId]: "approved",
    }));
  };

  const handleReject = (fireId, reason) => {
    setCardStates((prev) => ({
      ...prev,
      [fireId]: "rejected",
    }));
  };

  const handleAmend = (fireId, comment) => {
    setCardStates((prev) => ({
      ...prev,
      [fireId]: "amended",
    }));
  };

  // Render empty state
  if (emptyStateType === "all_decided") {
    return (
      <section className="nr-card" style={{ padding: 22, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>
          待審 Reflector Proposals
        </h2>
        <div style={{ padding: 16, background: "var(--bg-muted)", borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "var(--fg-2)" }}>
            本週 {pendingProposals.length} 條 proposals 全已處理 ✅
          </div>
        </div>
      </section>
    );
  }

  if (emptyStateType === "missing") {
    return (
      <section className="nr-card" style={{ padding: 22, marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>
          待審 Reflector Proposals
        </h2>
        <div style={{ padding: 16, background: "var(--bg-muted)", borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: "var(--fg-2)" }}>
            {isLive
              ? `本週尚無 reflector 提案 — 等下次 cron 觸發。最近一次:[link to last available week]`
              : `Mock mode · 切到 live mode 看實際 proposals (npm run dev:live)`}
          </div>
        </div>
      </section>
    );
  }

  // Render proposals section
  return (
    <section className="nr-card" style={{ padding: 22, marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>
            待審 Reflector Proposals
          </h2>
          <div
            style={{
              fontSize: 11,
              color: "var(--fg-3)",
              marginTop: 4,
            }}
          >
            {currentWeek} · {pendingProposals.length} pending
            {pollTime && (
              <div
                style={{
                  fontSize: 10,
                  color: "var(--fg-4)",
                  marginTop: 3,
                  fontFamily: "monospace",
                }}
              >
                資料更新於 <RelTime date={pollTime} showAbs={false} /> · 下個 cron HH:MM
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Platform tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 16,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 8,
          flexWrap: "wrap",
        }}
      >
        {PLATFORM_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: activeTab === tab.key ? 600 : 500,
              color: activeTab === tab.key ? "var(--accent)" : "var(--fg-2)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              marginBottom: -8,
              paddingBottom: 6,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) =>
              activeTab !== tab.key && (e.currentTarget.style.color = "var(--fg)")
            }
            onMouseLeave={(e) =>
              activeTab !== tab.key && (e.currentTarget.style.color = "var(--fg-2)")
            }
          >
            {tab.label}
            {platformCounts[tab.key] > 0 && (
              <span
                style={{
                  marginLeft: 4,
                  fontSize: 10,
                  color: activeTab === tab.key ? "var(--accent)" : "var(--fg-3)",
                }}
              >
                {platformCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Proposals list */}
      <div>
        {sortedProposals.length === 0 ? (
          <div
            style={{
              padding: 16,
              background: "var(--bg-muted)",
              borderRadius: 8,
              textAlign: "center",
              fontSize: 12,
              color: "var(--fg-2)",
            }}
          >
            No proposals for this platform.
          </div>
        ) : (
          sortedProposals.map((proposal) => (
            <ProposalCard
              key={proposal.fire_id}
              proposal={proposal}
              onApprove={handleApprove}
              onReject={handleReject}
              onAmend={handleAmend}
            />
          ))
        )}
      </div>
    </section>
  );
}
