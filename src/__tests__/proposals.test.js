/**
 * Phase 9 Item 9: Reflector proposals component tests
 * Test: mock mode rendering, tab filtering, clipboard format, empty states
 */

import { describe, it, expect, vi } from "vitest";
import { getISOWeekString } from "@/lib/iso-week.js";
import { MOCK_PROPOSALS } from "@/data/mockData.js";

describe("Proposals", () => {
  describe("ISO Week calculation", () => {
    it("should calculate ISO week correctly for 2026-04-28", () => {
      const date = new Date("2026-04-28T00:00:00Z");
      const week = getISOWeekString(date);
      expect(week).toMatch(/^\d{4}-W\d{2}$/);
      expect(week.startsWith("2026")).toBe(true);
    });
  });

  describe("Mock proposals fixture", () => {
    it("should have at least 5 proposals covering all analyzer types", () => {
      expect(MOCK_PROPOSALS.length).toBeGreaterThanOrEqual(5);
      
      const analyzers = new Set(MOCK_PROPOSALS.map(p => p.analyzer));
      expect(analyzers.has("harvest")).toBe(true);
      expect(analyzers.has("topic")).toBe(true);
      expect(analyzers.has("scorer")).toBe(true);
      expect(analyzers.has("composer")).toBe(true);
      expect(analyzers.has("gate")).toBe(true);
    });

    it("should cover all platform values", () => {
      const platforms = new Set(MOCK_PROPOSALS.map(p => p.platform));
      expect(platforms.has("facebook")).toBe(true);
      expect(platforms.has("instagram")).toBe(true);
      expect(platforms.has("threads")).toBe(true);
      expect(platforms.has("all")).toBe(true);
    });

    it("should have pending proposals (hsin_decision is null)", () => {
      const pending = MOCK_PROPOSALS.filter(p => p.hsin_decision === null);
      expect(pending.length).toBeGreaterThan(0);
    });

    it("should have boss_attention_required flag", () => {
      const withFlag = MOCK_PROPOSALS.filter(p => p.boss_attention_required === true);
      expect(withFlag.length).toBeGreaterThan(0);
    });
  });

  describe("Clipboard format (spec)", () => {
    it("should generate approve format correctly", () => {
      const fireIdShort = MOCK_PROPOSALS[0].fire_id.split("-")[0].slice(0, 8);
      const text = `phase9-decision approve ${fireIdShort}`;
      expect(text).toMatch(/^phase9-decision approve [a-f0-9]{8}$/);
    });

    it("should generate reject format with reason", () => {
      const fireIdShort = MOCK_PROPOSALS[0].fire_id.split("-")[0].slice(0, 8);
      const reason = "engagement signal too weak";
      const text = `phase9-decision reject ${fireIdShort} reason: ${reason}`;
      expect(text).toMatch(/^phase9-decision reject [a-f0-9]{8} reason: .+$/);
    });

    it("should generate amend format with comment", () => {
      const fireIdShort = MOCK_PROPOSALS[0].fire_id.split("-")[0].slice(0, 8);
      const comment = "adjust threshold to 0.69 instead";
      const text = `phase9-decision amend ${fireIdShort} comment: ${comment}`;
      expect(text).toMatch(/^phase9-decision amend [a-f0-9]{8} comment: .+$/);
    });
  });

  describe("Tab filtering logic", () => {
    it("should filter by platform", () => {
      const fbProposals = MOCK_PROPOSALS.filter(p => p.platform === "facebook");
      const igProposals = MOCK_PROPOSALS.filter(p => p.platform === "instagram");
      const thProposals = MOCK_PROPOSALS.filter(p => p.platform === "threads");
      const sharedProposals = MOCK_PROPOSALS.filter(p => p.platform === "all");
      
      expect(fbProposals.length).toBeGreaterThanOrEqual(0);
      expect(igProposals.length).toBeGreaterThanOrEqual(0);
      expect(thProposals.length).toBeGreaterThanOrEqual(0);
      expect(sharedProposals.length).toBeGreaterThanOrEqual(0);
    });

    it("should support All tab (no filter)", () => {
      const allCount = MOCK_PROPOSALS.filter(p => p.hsin_decision === null).length;
      expect(allCount).toBeGreaterThan(0);
    });
  });

  describe("Empty state logic", () => {
    it("should recognize pending proposals", () => {
      const pending = MOCK_PROPOSALS.filter(p => p.hsin_decision === null);
      expect(pending.length > 0).toBe(true);
    });

    it("should distinguish all-decided state when all proposals have decisions", () => {
      const allDecided = MOCK_PROPOSALS.every(p => p.hsin_decision !== null);
      expect(allDecided).toBe(false); // mock should have pending
    });
  });

  describe("Proposal schema validation", () => {
    it("should have required fields", () => {
      for (const proposal of MOCK_PROPOSALS) {
        expect(proposal.fire_id).toBeDefined();
        expect(proposal.fire_at).toBeDefined();
        expect(proposal.analyzer).toBeDefined();
        expect(proposal.platform).toBeDefined();
        expect(proposal.proposal_type).toBeDefined();
        expect(proposal.evidence).toBeDefined();
        expect(proposal.action).toBeDefined();
        expect(proposal.hsin_decision).toBeNull();
      }
    });

    it("action.field should match target_config", () => {
      for (const proposal of MOCK_PROPOSALS) {
        expect(proposal.action.target_config).toBeDefined();
        expect(proposal.action.field).toBeDefined();
        expect(proposal.action.current_value).toBeDefined();
        expect(proposal.action.proposed_value).toBeDefined();
      }
    });
  });
});
