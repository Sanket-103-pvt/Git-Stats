import { describe, it, expect } from "vitest";
import {
  CACHE_TTL_MS,
  isCacheEnvelope,
  isExpired,
  readCacheEntry,
} from "./sessionCache";

const NOW = 1_700_000_000_000;

const envelope = (data: unknown, age = 0) =>
  JSON.stringify({ data, timestamp: NOW - age });

describe("session cache", () => {
  describe("readCacheEntry", () => {
    it("returns the payload for a fresh entry", () => {
      expect(readCacheEntry(envelope({ login: "octocat" }), NOW)).toEqual({
        login: "octocat",
      });
    });

    it("returns undefined for an entry past the TTL", () => {
      expect(readCacheEntry(envelope({ login: "octocat" }, CACHE_TTL_MS + 1), NOW)).toBeUndefined();
    });

    it("treats an entry exactly at the TTL as still fresh", () => {
      expect(readCacheEntry(envelope({ login: "octocat" }, CACHE_TTL_MS), NOW)).toEqual({
        login: "octocat",
      });
    });

    it("returns undefined when there is no entry", () => {
      expect(readCacheEntry(null, NOW)).toBeUndefined();
    });

    it("returns undefined for text that is not JSON", () => {
      expect(readCacheEntry("{not json", NOW)).toBeUndefined();
    });

    /**
     * The regression this module exists for.
     *
     * Each of these parses cleanly but is not the envelope. The previous inline check
     * computed `Date.now() - parsed.timestamp > TTL`, which for a missing timestamp is
     * `NaN > TTL` — false — so the entry counted as fresh and `parsed.data` returned
     * `undefined` to a caller expecting a profile.
     */
    it.each([
      ["an object with no timestamp", JSON.stringify({ data: { login: "octocat" } })],
      ["a bare string", JSON.stringify("hello")],
      ["a number", "42"],
      ["null", "null"],
      ["an array", JSON.stringify([1, 2, 3])],
      ["a non-numeric timestamp", JSON.stringify({ data: {}, timestamp: "yesterday" })],
      ["a NaN timestamp", '{"data":{},"timestamp":null}'],
      ["an envelope with no data", JSON.stringify({ timestamp: NOW })],
    ])("returns undefined for %s", (_label, raw) => {
      expect(readCacheEntry(raw, NOW)).toBeUndefined();
    });

    it("preserves a cached null response", () => {
      // null is a legitimate JSON body, so the envelope check tests for `!== undefined`
      // rather than truthiness — otherwise this would be refetched on every request.
      expect(readCacheEntry(envelope(null), NOW)).toBeNull();
    });

    it("preserves falsy payloads", () => {
      expect(readCacheEntry(envelope(0), NOW)).toBe(0);
      expect(readCacheEntry(envelope(""), NOW)).toBe("");
      expect(readCacheEntry(envelope(false), NOW)).toBe(false);
    });
  });

  describe("isCacheEnvelope", () => {
    it("accepts a well-formed envelope", () => {
      expect(isCacheEnvelope({ data: {}, timestamp: NOW })).toBe(true);
    });

    it.each([
      ["null", null],
      ["undefined", undefined],
      ["a string", "hello"],
      ["a number", 42],
      ["a missing timestamp", { data: {} }],
      ["a missing data key", { timestamp: NOW }],
      ["an Infinity timestamp", { data: {}, timestamp: Infinity }],
    ])("rejects %s", (_label, value) => {
      expect(isCacheEnvelope(value)).toBe(false);
    });
  });

  describe("isExpired", () => {
    it("is false at the boundary and true one millisecond past it", () => {
      expect(isExpired({ data: {}, timestamp: NOW - CACHE_TTL_MS }, NOW)).toBe(false);
      expect(isExpired({ data: {}, timestamp: NOW - CACHE_TTL_MS - 1 }, NOW)).toBe(true);
    });

    it("does not treat a clock skewed into the future as expired", () => {
      expect(isExpired({ data: {}, timestamp: NOW + 60_000 }, NOW)).toBe(false);
    });
  });
});
