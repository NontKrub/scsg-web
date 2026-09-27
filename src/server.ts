import { env as cloudflareEnv } from "cloudflare:workers";
import "./lib/error-capture";
import { installSupabaseNetworkGuard } from "./lib/radio/network-guard";

installSupabaseNetworkGuard();

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function cloudflareHealth(): Promise<Response> {
  try {
    const d1 = await cloudflareEnv.DB
      .prepare("SELECT 1 AS ok")
      .first<{ ok: number }>();

    const r2 = await cloudflareEnv.MEDIA.list({
      limit: 1,
    });

    return Response.json({
      ok: d1?.ok === 1,
      worker: true,
      d1: {
        ok: d1?.ok === 1,
      },
      r2: {
        ok: true,
        objectsChecked: r2.objects.length,
      },
    });
  } catch (error) {
    console.error("[cloudflare-health]", error);

    return Response.json(
      {
        ok: false,
        worker: true,
        d1: {
          ok: false,
        },
        r2: {
          ok: false,
        },
      },
      {
        status: 503,
      },
    );
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health/cloudflare") {
      return cloudflareHealth();
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
  },
};
