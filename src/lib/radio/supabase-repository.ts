import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { RadioRepositoryError, type RadioRepository } from "./repository";
import {
  RADIO_BOOKING_STATUSES,
  RADIO_SLOT_STATES,
  type RadioBooking,
  type RadioBookingStatus,
  type RadioPageData,
  type RadioSlot,
  type RadioSlotState,
} from "./types";

type RadioDb = SupabaseClient<Database>;
type SlotRpcRow = Database["public"]["Functions"]["create_radio_slot"]["Returns"][number];
type BookingRpcRow = Database["public"]["Functions"]["reserve_radio_slot"]["Returns"][number];
type TransitionRpcRow =
  Database["public"]["Functions"]["transition_radio_booking"]["Returns"][number];

function isSlotState(value: unknown): value is RadioSlotState {
  return typeof value === "string" && (RADIO_SLOT_STATES as readonly string[]).includes(value);
}

function isBookingStatus(value: unknown): value is RadioBookingStatus {
  return typeof value === "string" && (RADIO_BOOKING_STATUSES as readonly string[]).includes(value);
}

function parseState(value: unknown): RadioSlotState {
  return isSlotState(value) ? value : "CLOSED";
}

function mapSlot(row: SlotRpcRow | Record<string, unknown>): RadioSlot {
  const source = row as Record<string, unknown>;
  const id = String(source["slot_id"] ?? source["id"] ?? "");
  const date = String(source["slot_date"] ?? source["date"] ?? "");
  const startTime = String(source["slot_start_time"] ?? source["start_time"] ?? "").slice(0, 5);
  if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(startTime)) {
    throw new RadioRepositoryError("RADIO_INVALID_DATA");
  }
  return {
    id,
    date,
    startTime,
    state: parseState(source["slot_state"] ?? source["state"]),
    note: String(source["slot_note"] ?? source["note"] ?? ""),
    createdAt: String(source["slot_created_at"] ?? source["created_at"] ?? ""),
    updatedAt: String(source["slot_updated_at"] ?? source["updated_at"] ?? ""),
  };
}

function mapBooking(row: BookingRpcRow | TransitionRpcRow | Record<string, unknown>): RadioBooking {
  const source = row as Record<string, unknown>;
  const rawStatus = source["booking_status"] ?? source["status"];
  if (!isBookingStatus(rawStatus)) throw new RadioRepositoryError("RADIO_INVALID_DATA");
  const rawSlotId = source["booking_slot_id"] ?? source["slot_id"];
  const slotId = typeof rawSlotId === "string" && rawSlotId ? rawSlotId : null;
  const date = source["slot_date"];
  const startTime = source["slot_start_time"];
  const slot =
    slotId &&
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    typeof startTime === "string"
      ? { date, startTime: startTime.slice(0, 5), state: parseState(source["slot_state"]) }
      : null;
  return {
    id: String(source["booking_id"] ?? source["id"] ?? ""),
    slotId,
    requester: String(source["requester"] ?? ""),
    studentId: String(source["student_id"] ?? ""),
    klass: String(source["klass"] ?? ""),
    song: String(source["song"] ?? ""),
    message: String(source["message"] ?? ""),
    additionalInfo: String(source["additional_info"] ?? ""),
    status: rawStatus,
    createdAt: String(source["booking_created_at"] ?? source["created_at"] ?? ""),
    updatedAt: String(source["booking_updated_at"] ?? source["updated_at"] ?? ""),
    slot,
  };
}

function throwDatabaseError(
  error: { code?: string; message?: string },
  fallback: RadioRepositoryErrorCode,
): never {
  const message = error.message ?? "";
  const code = [
    "RADIO_SLOT_NOT_FOUND",
    "RADIO_SLOT_UNAVAILABLE",
    "RADIO_BOOKING_NOT_FOUND",
    "RADIO_INVALID_TRANSITION",
    "RADIO_SLOT_ACTIVE",
    "RADIO_SLOT_CONFLICT",
    "RADIO_NOT_AUTHORIZED",
    "RADIO_INVALID_DATA",
  ].find((candidate) => message.includes(candidate));
  if (code) throw new RadioRepositoryError(code as RadioRepositoryErrorCode);
  if (error.code === "23505") throw new RadioRepositoryError(fallback);
  throw new RadioRepositoryError("RADIO_INVALID_DATA");
}

type RadioRepositoryErrorCode = ConstructorParameters<typeof RadioRepositoryError>[0];

export function createSupabaseRadioRepository(db: RadioDb): RadioRepository {
  const listSlots = async () => {
    const result = await db
      .from("radio_slots")
      .select("id,date,start_time,state,note,created_at,updated_at")
      .gte("date", new Date().toISOString().slice(0, 10))
      .not("date", "is", null)
      .not("start_time", "is", null)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    if (result.error) throwDatabaseError(result.error, "RADIO_INVALID_DATA");
    return (result.data ?? []).map((row) => mapSlot(row));
  };

  const listBookings = async () => {
    const result = await db
      .from("radio_bookings")
      .select(
        "id,slot_id,requester,student_id,klass,song,message,additional_info,status,created_at,updated_at,radio_slots(date,start_time,state)",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (result.error) throwDatabaseError(result.error, "RADIO_INVALID_DATA");
    return (result.data ?? []).flatMap((row) => {
      const joined = Array.isArray(row.radio_slots) ? row.radio_slots[0] : row.radio_slots;
      try {
        return [
          mapBooking({
            ...row,
            slot_date: joined?.date,
            slot_start_time: joined?.start_time,
            slot_state: joined?.state,
          }) as RadioBooking,
        ];
      } catch {
        return [];
      }
    });
  };

  const callSlot = async (
    name: "create_radio_slot" | "update_radio_slot" | "close_radio_slot" | "reopen_radio_slot",
    args: Record<string, string>,
  ) => {
    const result = await db.rpc(name, args as never).maybeSingle();
    if (result.error)
      throwDatabaseError(
        result.error,
        name === "create_radio_slot" ? "RADIO_SLOT_CONFLICT" : "RADIO_INVALID_DATA",
      );
    if (!result.data) throw new RadioRepositoryError("RADIO_SLOT_NOT_FOUND");
    return mapSlot(result.data as unknown as SlotRpcRow);
  };

  return {
    async getPageData(): Promise<RadioPageData> {
      const [slots, rules] = await Promise.all([
        listSlots(),
        db
          .from("radio_rules")
          .select("text")
          .order("sort", { ascending: true })
          .then((result) => {
            if (result.error) throwDatabaseError(result.error, "RADIO_INVALID_DATA");
            return (result.data ?? [])
              .map((row) => row.text)
              .filter((text): text is string => typeof text === "string");
          }),
      ]);
      return { slots, rules };
    },

    listSlots,
    listBookings,

    async reserve(input) {
      const result = await db
        .rpc("reserve_radio_slot", {
          p_slot_id: input.slotId,
          p_requester: input.requester,
          p_student_id: input.studentId,
          p_klass: input.klass,
          p_song: input.song,
          p_message: input.message,
          p_additional_info: input.additionalInfo,
        })
        .maybeSingle();
      if (result.error) throwDatabaseError(result.error, "RADIO_SLOT_UNAVAILABLE");
      if (!result.data) throw new RadioRepositoryError("RADIO_INVALID_DATA");
      return mapBooking(result.data as unknown as BookingRpcRow);
    },

    async transitionBooking(id, nextStatus) {
      const result = await db
        .rpc("transition_radio_booking", {
          p_booking_id: id,
          p_next_status: nextStatus,
        })
        .maybeSingle();
      if (result.error) throwDatabaseError(result.error, "RADIO_INVALID_TRANSITION");
      if (!result.data) throw new RadioRepositoryError("RADIO_INVALID_DATA");
      return mapBooking(result.data as unknown as TransitionRpcRow);
    },

    createSlot: (input) =>
      callSlot("create_radio_slot", {
        p_date: input.date,
        p_start_time: input.startTime,
        p_note: input.note,
      }),
    updateSlot: (id, input) =>
      callSlot("update_radio_slot", {
        p_slot_id: id,
        p_date: input.date,
        p_start_time: input.startTime,
        p_note: input.note,
      }),
    closeSlot: (id) => callSlot("close_radio_slot", { p_slot_id: id }),
    reopenSlot: (id) => callSlot("reopen_radio_slot", { p_slot_id: id }),
  };
}
