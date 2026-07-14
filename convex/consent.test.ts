import { describe, expect, test } from "bun:test";
import type { Id } from "./_generated/dataModel";
import {
  buildConsentLogRecord,
  type ConsentPoint,
  consentDefinitions,
  consentPoints,
  getConsentDefinition,
} from "./consent";

describe("consent definitions", () => {
  test("defines separate plain-English copy for every consent point", () => {
    expect(consentPoints).toEqual([
      "connector_scope",
      "voice_permission",
      "trial_conversion",
      "refund_policy",
    ]);

    for (const point of consentPoints) {
      const definition = getConsentDefinition(point);
      expect(definition.point).toBe(point);
      expect(definition.version.length).toBeGreaterThan(0);
      expect(definition.title).not.toMatch(/blanket/i);
      expect(definition.body.length).toBeGreaterThan(80);
      expect(definition.acknowledgment).toMatch(/^I understand/);
    }
  });

  test("keeps trial and refund consent as no-payment placeholder copy", () => {
    expect(consentDefinitions.trial_conversion.body).toMatch(/does not charge payments/i);
    expect(consentDefinitions.refund_policy.body).toMatch(/payments are not active/i);
  });
});

describe("buildConsentLogRecord", () => {
  test("builds a versioned acknowledgment row for a consent point", () => {
    const now = 1_783_996_200_000;
    const userId = "users:demo" as Id<"users">;
    const record = buildConsentLogRecord({
      userId,
      point: "voice_permission",
      now,
    });

    expect(record).toMatchObject({
      userId,
      point: "voice_permission",
      version: consentDefinitions.voice_permission.version,
      acknowledgedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    expect(record.copyText).toContain(consentDefinitions.voice_permission.title);
    expect(record.copyText).toContain(consentDefinitions.voice_permission.acknowledgment);
  });

  test("rejects unknown consent points before a log row is built", () => {
    expect(() => getConsentDefinition("blanket_consent" as ConsentPoint)).toThrow();
  });
});
