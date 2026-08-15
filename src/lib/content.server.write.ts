import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export async function insertRadioBooking(row: {
  day: string;
  slot: string;
  requester: string;
  klass: string;
  song: string;
  message: string;
}) {
  const db = publicClient();
  const { error } = await db.from("radio_bookings").insert({ ...row, status: "PENDING" });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function insertComplaint(row: {
  subject: string;
  cat: string;
  detail: string;
  reporter: string;
  klass: string;
  contact: string;
  anonymous: boolean;
}) {
  const db = publicClient();
  const { error } = await db.from("complaints").insert({ ...row, status: "NEW", admin_note: "" });
  if (error) throw new Error(error.message);
  return { ok: true };
}
