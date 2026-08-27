import { describe, expect, test } from "bun:test";
import { InMemoryRadioRepository } from "@/lib/radio/in-memory-repository";
import type { RadioRepository } from "@/lib/radio/repository";
import { normalizeRadioBookingInput, RadioService } from "@/lib/radio/service";

const request = (slotId: string, name = "นักเรียน ทดสอบ") => ({
  slotId,
  requester: name,
  studentId: "SG-0001",
  klass: "ม.5/1",
  song: "เพลงทดสอบ",
  message: "ถึงเพื่อนทุกคน",
  additionalInfo: "",
  acceptedRules: true,
});

async function setup() {
  const repository = new InMemoryRadioRepository();
  const service = new RadioService(repository);
  const slots = await repository.listSlots();
  return { repository, service, slots };
}

function slotId(
  slots: Awaited<ReturnType<InMemoryRadioRepository["listSlots"]>>,
  date: string,
  time: string,
) {
  return slots.find((slot) => slot.date === date && slot.startTime === time)?.id ?? "missing-slot";
}

describe("RadioService reservation state machine", () => {
  test("reserving an AVAILABLE slot makes it PENDING", async () => {
    const { repository, service, slots } = await setup();
    const id = slotId(slots, "2026-09-01", "08:05");

    const booking = await service.reserve(request(id));
    const updated = (await repository.listSlots()).find((slot) => slot.id === id);

    expect(booking.status).toBe("PENDING");
    expect(updated?.state).toBe("PENDING");
  });

  test.each(["PENDING", "BOOKED", "CLOSED"] as const)(
    "rejects reservation for a %s slot",
    async (state) => {
      const { service, slots } = await setup();
      const id = slotId(
        slots,
        "2026-08-31",
        state === "PENDING" ? "08:25" : state === "BOOKED" ? "08:15" : "08:35",
      );

      await expect(service.reserve(request(id))).rejects.toThrow("ช่วงเวลานี้ไม่ว่างแล้ว");
    },
  );

  test("rejects reservation for a nonexistent slot", async () => {
    const { service } = await setup();

    await expect(service.reserve(request("not-a-slot"))).rejects.toThrow("ไม่พบช่วงเวลานี้");
  });

  test("allows only one concurrent reservation for a slot", async () => {
    const { repository, service, slots } = await setup();
    const id = slotId(slots, "2026-09-01", "08:05");

    const results = await Promise.allSettled([
      service.reserve(request(id, "คนที่หนึ่ง")),
      service.reserve(request(id, "คนที่สอง")),
    ]);
    const bookings = await repository.listBookings();

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(bookings.filter((booking) => booking.slotId === id)).toHaveLength(1);
  });

  test("approving a pending booking makes its slot BOOKED", async () => {
    const { repository, service, slots } = await setup();
    const pendingSlot = slotId(slots, "2026-08-31", "08:25");
    const booking = (await repository.listBookings()).find((row) => row.slotId === pendingSlot)!;

    const approved = await service.approve(booking.id);
    const updated = (await repository.listSlots()).find((slot) => slot.id === pendingSlot);

    expect(approved.status).toBe("APPROVED");
    expect(updated?.state).toBe("BOOKED");
  });

  test("rejecting a pending booking releases its slot", async () => {
    const { repository, service, slots } = await setup();
    const pendingSlot = slotId(slots, "2026-08-31", "08:25");
    const booking = (await repository.listBookings()).find((row) => row.slotId === pendingSlot)!;

    const rejected = await service.reject(booking.id);
    const updated = (await repository.listSlots()).find((slot) => slot.id === pendingSlot);

    expect(rejected.status).toBe("REJECTED");
    expect(updated?.state).toBe("AVAILABLE");
  });

  test("cancelling a pending booking releases its slot", async () => {
    const { repository, service, slots } = await setup();
    const pendingSlot = slotId(slots, "2026-08-31", "08:25");
    const booking = (await repository.listBookings()).find((row) => row.slotId === pendingSlot)!;

    const cancelled = await service.cancel(booking.id);
    const updated = (await repository.listSlots()).find((slot) => slot.id === pendingSlot);

    expect(cancelled.status).toBe("CANCELLED");
    expect(updated?.state).toBe("AVAILABLE");
  });

  test("completion keeps an approved slot BOOKED", async () => {
    const { repository, service, slots } = await setup();
    const approvedSlot = slotId(slots, "2026-08-31", "08:15");
    const booking = (await repository.listBookings()).find((row) => row.slotId === approvedSlot)!;

    const completed = await service.complete(booking.id);
    const updated = (await repository.listSlots()).find((slot) => slot.id === approvedSlot);

    expect(completed.status).toBe("COMPLETED");
    expect(updated?.state).toBe("BOOKED");
  });

  test("keeps two Mondays independent", async () => {
    const { repository, service, slots } = await setup();
    const first = slotId(slots, "2026-08-31", "08:05");
    const second = slotId(slots, "2026-09-07", "08:05");

    await service.reserve(request(first));
    const other = (await repository.listSlots()).find((slot) => slot.id === second);

    expect(other?.state).toBe("AVAILABLE");
  });

  test("rejects invalid booking transitions", async () => {
    const { service, repository, slots } = await setup();
    const approvedSlot = slotId(slots, "2026-08-31", "08:15");
    const approved = (await repository.listBookings()).find((row) => row.slotId === approvedSlot)!;
    const rejectedSlot = slotId(slots, "2026-08-31", "08:25");
    const rejected = (await repository.listBookings()).find((row) => row.slotId === rejectedSlot)!;

    await expect(service.approve(approved.id)).rejects.toThrow("ไม่สามารถเปลี่ยนสถานะ");
    await service.reject(rejected.id);
    await expect(service.approve(rejected.id)).rejects.toThrow("ไม่สามารถเปลี่ยนสถานะ");
    await expect(service.transition(approved.id, "PENDING")).rejects.toThrow(
      "ไม่สามารถเปลี่ยนสถานะ",
    );
  });

  test("maps schedule load failure to a safe error", async () => {
    class BrokenRepository extends InMemoryRadioRepository {
      override getPageData(): ReturnType<RadioRepository["getPageData"]> {
        return Promise.reject(new Error("network down"));
      }
    }

    await expect(new RadioService(new BrokenRepository()).getPageData()).rejects.toThrow(
      "ไม่สามารถโหลดตาราง SG Radio ได้",
    );
  });

  test("creates, closes, reopens, and edits an unused slot", async () => {
    const { service } = await setup();

    const created = await service.saveSlot(undefined, {
      date: "2026-09-02",
      startTime: "12:00",
      note: "พักกลางวัน",
    });
    expect(created.state).toBe("AVAILABLE");

    const closed = await service.closeSlot(created.id);
    expect(closed.state).toBe("CLOSED");
    const reopened = await service.reopenSlot(created.id);
    expect(reopened.state).toBe("AVAILABLE");

    const edited = await service.saveSlot(created.id, {
      date: "2026-09-03",
      startTime: "12:10",
      note: "แก้เวลา",
    });
    expect(edited.date).toBe("2026-09-03");
    expect(edited.startTime).toBe("12:10");
  });

  test("rejects impossible calendar dates", async () => {
    const { service } = await setup();

    await expect(
      service.saveSlot(undefined, { date: "2026-02-30", startTime: "08:05", note: "" }),
    ).rejects.toThrow("ข้อมูลตาราง SG Radio ไม่ถูกต้อง");
  });

  test("rejects invalid booking input", () => {
    expect(() => normalizeRadioBookingInput(request("slot-sep1-0805", " "))).toThrow(
      "กรอกข้อมูลจอง",
    );
    expect(() =>
      normalizeRadioBookingInput({ ...request("slot-sep1-0805"), website: "https://bot.invalid" }),
    ).toThrow("กรอกข้อมูลจอง");
    expect(() =>
      normalizeRadioBookingInput({ ...request("slot-sep1-0805"), acceptedRules: false }),
    ).toThrow("ยอมรับกติกา");
  });
});
