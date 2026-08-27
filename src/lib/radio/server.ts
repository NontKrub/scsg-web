import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { InMemoryRadioRepository } from "./in-memory-repository";
import { isRadioMemoryBackend } from "./config";
import { RadioService } from "./service";
import { createSupabaseRadioRepository } from "./supabase-repository";

let memoryRepository: InMemoryRadioRepository | undefined;

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Missing Supabase environment variables");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export function getRadioService(db?: SupabaseClient<Database>) {
  if (isRadioMemoryBackend()) {
    memoryRepository ??= new InMemoryRadioRepository();
    return new RadioService(memoryRepository);
  }
  return new RadioService(createSupabaseRadioRepository(db ?? publicClient()));
}
