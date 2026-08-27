import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { RadioBookingInput } from "./radio/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export async function insertRadioBooking(row: RadioBookingInput) {
  const { getRadioService } = await import("./radio/server");
  const booking = await getRadioService().reserve(row);
  return {
    ok: true,
    booking: {
      id: booking.id,
      slotId: booking.slotId,
      date: booking.slot?.date ?? "",
      startTime: booking.slot?.startTime ?? "",
      status: booking.status,
    },
  };
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
