import { describe, expect, test } from "bun:test";
import { isSupabaseUrl } from "@/lib/radio/network-guard";

describe("Radio test network guard", () => {
  test("blocks Supabase cloud and vanity endpoints", () => {
    expect(isSupabaseUrl("https://example.supabase.co/rest/v1/radio_slots")).toBe(true);
    expect(isSupabaseUrl("https://project.supabase.in/auth/v1/token")).toBe(true);
    expect(isSupabaseUrl("https://app.example.com/radio")).toBe(false);
    expect(isSupabaseUrl("https://supabase.co.evil.example/rest")).toBe(false);
  });
});
