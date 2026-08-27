import { createFileRoute } from "@tanstack/react-router";

const BUCKET = "site-images";

export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = String((params as Record<string, string>)["_splat"] ?? "").replace(/^\/+/, "");
        const segments = path.split("/");
        if (
          !path ||
          path.includes("\\") ||
          segments.some(
            (segment) =>
              !segment ||
              segment === "." ||
              segment === ".." ||
              segment.split("").some((character) => character.charCodeAt(0) < 32),
          )
        ) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
