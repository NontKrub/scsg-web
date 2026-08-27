import { describe, expect, test } from "bun:test";
import { createSupabaseRadioRepository } from "@/lib/radio/supabase-repository";

function query(data: unknown, calls: unknown[][]) {
  const builder: Record<string, unknown> = {
    select: (columns: string) => {
      calls.push(["select", columns]);
      return builder;
    },
    gte: (column: string, value: string) => {
      calls.push(["gte", column, value]);
      return builder;
    },
    not: (column: string, operator: string, value: string) => {
      calls.push(["not", column, operator, value]);
      return builder;
    },
    order: (column: string, options: unknown) => {
      calls.push(["order", column, options]);
      return builder;
    },
    limit: (value: number) => {
      calls.push(["limit", value]);
      return builder;
    },
    then: (resolve: (value: unknown) => unknown) => resolve({ data, error: null }),
  };
  return builder;
}

describe("Supabase Radio read bounds", () => {
  test("filters public slots to today and limits the admin booking queue", async () => {
    const calls: unknown[][] = [];
    const db = {
      from: (table: string) =>
        table === "radio_slots"
          ? query(
              [
                {
                  id: "slot-1",
                  date: "2026-08-27",
                  start_time: "08:05:00",
                  state: "AVAILABLE",
                  note: "",
                  created_at: "",
                  updated_at: "",
                },
              ],
              calls,
            )
          : query(
              [
                {
                  id: "booking-1",
                  slot_id: "slot-1",
                  requester: "Student",
                  student_id: "SG-1",
                  klass: "M.5/1",
                  song: "Song",
                  message: "",
                  additional_info: "",
                  status: "PENDING",
                  created_at: "2026-08-27T00:00:00Z",
                  updated_at: "2026-08-27T00:00:00Z",
                  radio_slots: { date: "2026-08-27", start_time: "08:05:00", state: "PENDING" },
                },
              ],
              calls,
            ),
    };
    const repository = createSupabaseRadioRepository(db as never);

    await repository.listSlots();
    await repository.listBookings();

    expect(
      calls.some(
        ([kind, column, value]) =>
          kind === "gte" &&
          column === "date" &&
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(value),
      ),
    ).toBe(true);
    expect(calls).toContainEqual(["order", "created_at", { ascending: false }]);
    expect(calls).toContainEqual(["limit", 200]);
  });
});
