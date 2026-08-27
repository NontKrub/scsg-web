import { afterEach, describe, expect, test } from "bun:test";
import { loadContent } from "@/lib/content.server";

const originalFetch = globalThis.fetch;
const originalEnv = {
  SUPABASE_URL: process.env["SUPABASE_URL"],
  SUPABASE_PUBLISHABLE_KEY: process.env["SUPABASE_PUBLISHABLE_KEY"],
  RADIO_BACKEND: process.env["RADIO_BACKEND"],
};

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function mockDatabase(options: { failTable?: string } = {}) {
  const requests: string[] = [];
  process.env["SUPABASE_URL"] = "https://content-test.supabase.co";
  process.env["SUPABASE_PUBLISHABLE_KEY"] = "test-publishable-key";
  delete process.env["RADIO_BACKEND"];

  globalThis.fetch = async (input) => {
    const url = input instanceof Request ? input.url : String(input);
    requests.push(url);
    const table = new URL(url).pathname.split("/").pop();
    if (table === options.failTable) {
      return new Response(JSON.stringify({ message: "content database unavailable" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
    const data = table === "site_settings" ? [{ key: "current_month", value: "AUG" }] : [];
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  return requests;
}

describe("loadContent", () => {
  test("orders news by created_at without the missing sort column", async () => {
    const requests = mockDatabase();

    await loadContent();

    const newsUrl = requests.find((request) => new URL(request).pathname.endsWith("/news"));
    expect(newsUrl).toBeDefined();
    expect(new URL(newsUrl!).searchParams.getAll("order")).toEqual(["created_at.desc"]);
  });

  test("propagates database errors instead of returning empty content", async () => {
    mockDatabase({ failTable: "members" });

    await expect(loadContent()).rejects.toThrow("content database unavailable");
  });
});
