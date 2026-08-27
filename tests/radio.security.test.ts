import { afterEach, describe, expect, test } from "bun:test";
import { isAdmin } from "@/lib/admin.functions";
import { isRadioMemoryBackend } from "@/lib/radio/config";
import { getRadioService } from "@/lib/radio/server";

const originalEnv = {
  NODE_ENV: process.env["NODE_ENV"],
  RADIO_BACKEND: process.env["RADIO_BACKEND"],
  SUPABASE_URL: process.env["SUPABASE_URL"],
  SUPABASE_PUBLISHABLE_KEY: process.env["SUPABASE_PUBLISHABLE_KEY"],
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("Radio test mode authorization isolation", () => {
  test("memory Radio mode does not imply generic admin", async () => {
    process.env["NODE_ENV"] = "test";
    process.env["RADIO_BACKEND"] = "memory";

    const query = {
      select: () => query,
      eq: () => query,
      maybeSingle: async () => ({ data: null, error: null }),
    };

    expect(isRadioMemoryBackend()).toBe(true);
    await expect(
      isAdmin({ supabase: { from: () => query }, userId: "radio-test-admin" }),
    ).resolves.toBe(false);
  });

  test("memory Radio service works without Supabase configuration", async () => {
    process.env["NODE_ENV"] = "test";
    process.env["RADIO_BACKEND"] = "memory";
    delete process.env["SUPABASE_URL"];
    delete process.env["SUPABASE_PUBLISHABLE_KEY"];

    const page = await getRadioService().getPageData();

    expect(page.slots.length).toBeGreaterThan(0);
  });
});
