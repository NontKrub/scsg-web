import { RadioRepositoryError, type RadioRepository } from "./repository";
import { slotStateAfterBookingTransition } from "./state-machine";
import type {
  RadioBooking,
  RadioBookingInput,
  RadioBookingStatus,
  RadioPageData,
  RadioSlot,
  RadioSlotDraft,
} from "./types";

const stamp = "2026-08-26T00:00:00.000Z";

function makeSlot(
  id: string,
  date: string,
  startTime: string,
  state: RadioSlot["state"],
  note = "",
): RadioSlot {
  return { id, date, startTime, state, note, createdAt: stamp, updatedAt: stamp };
}

function makeBooking(
  id: string,
  slot: RadioSlot,
  status: RadioBookingStatus,
  requester: string,
): RadioBooking {
  return {
    id,
    slotId: slot.id,
    requester,
    studentId: "SG-TEST",
    klass: "ม.5/1",
    song: "เพลงทดสอบ",
    message: "",
    additionalInfo: "",
    status,
    createdAt: stamp,
    updatedAt: stamp,
    slot: { date: slot.date, startTime: slot.startTime, state: slot.state },
  };
}

export class InMemoryRadioRepository implements RadioRepository {
  private readonly slots: RadioSlot[];
  private readonly bookings: RadioBooking[];
  private queue = Promise.resolve();

  constructor() {
    const aug31 = [
      makeSlot("slot-aug31-0805", "2026-08-31", "08:05", "AVAILABLE"),
      makeSlot("slot-aug31-0815", "2026-08-31", "08:15", "BOOKED"),
      makeSlot("slot-aug31-0825", "2026-08-31", "08:25", "PENDING"),
      makeSlot("slot-aug31-0835", "2026-08-31", "08:35", "CLOSED"),
    ];
    const sep1 = [
      makeSlot("slot-sep1-0805", "2026-09-01", "08:05", "AVAILABLE"),
      makeSlot("slot-sep1-0815", "2026-09-01", "08:15", "AVAILABLE"),
    ];
    const sep7 = [makeSlot("slot-sep7-0805", "2026-09-07", "08:05", "AVAILABLE")];
    this.slots = [...aug31, ...sep1, ...sep7];
    this.bookings = [
      makeBooking("booking-booked-0815", aug31[1]!, "APPROVED", "นักเรียนที่จองแล้ว"),
      makeBooking("booking-pending-0825", aug31[2]!, "PENDING", "นักเรียนรออนุมัติ"),
    ];
  }

  getPageData(): Promise<RadioPageData> {
    return Promise.resolve({
      slots: this.copySlots(),
      rules: ["ขอเพลงและข้อความที่เหมาะสมกับบริบทโรงเรียน", "ส่งคำขอล่วงหน้าเพื่อรอทีมงานอนุมัติ"],
    });
  }

  listSlots() {
    return Promise.resolve(this.copySlots());
  }

  listBookings() {
    return Promise.resolve(this.bookings.map((booking) => this.copyBooking(booking)));
  }

  reserve(input: Omit<RadioBookingInput, "acceptedRules">) {
    return this.atomic(() => {
      const slot = this.slots.find((row) => row.id === input.slotId);
      if (!slot) throw new RadioRepositoryError("RADIO_SLOT_NOT_FOUND");
      if (slot.state !== "AVAILABLE") throw new RadioRepositoryError("RADIO_SLOT_UNAVAILABLE");
      slot.state = "PENDING";
      slot.updatedAt = new Date().toISOString();
      const booking: RadioBooking = {
        id: crypto.randomUUID(),
        slotId: slot.id,
        requester: input.requester,
        studentId: input.studentId,
        klass: input.klass,
        song: input.song,
        message: input.message,
        additionalInfo: input.additionalInfo,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slot: { date: slot.date, startTime: slot.startTime, state: slot.state },
      };
      this.bookings.push(booking);
      return this.copyBooking(booking);
    });
  }

  transitionBooking(id: string, nextStatus: RadioBookingStatus) {
    return this.atomic(() => {
      const booking = this.bookings.find((row) => row.id === id);
      if (!booking) throw new RadioRepositoryError("RADIO_BOOKING_NOT_FOUND");
      const slot = this.slots.find((row) => row.id === booking.slotId);
      if (!slot) throw new RadioRepositoryError("RADIO_INVALID_DATA");
      let nextSlotState: RadioSlot["state"];
      try {
        nextSlotState = slotStateAfterBookingTransition(booking.status, nextStatus, slot.state);
      } catch (error) {
        throw new RadioRepositoryError(
          error instanceof Error && error.message === "RADIO_INVALID_DATA"
            ? "RADIO_INVALID_DATA"
            : "RADIO_INVALID_TRANSITION",
        );
      }
      booking.status = nextStatus;
      booking.updatedAt = new Date().toISOString();
      slot.state = nextSlotState;
      slot.updatedAt = booking.updatedAt;
      booking.slot = { date: slot.date, startTime: slot.startTime, state: slot.state };
      return this.copyBooking(booking);
    });
  }

  createSlot(input: RadioSlotDraft) {
    return this.atomic(() => {
      if (
        this.slots.some((slot) => slot.date === input.date && slot.startTime === input.startTime)
      ) {
        throw new RadioRepositoryError("RADIO_SLOT_CONFLICT");
      }
      const now = new Date().toISOString();
      const slot = makeSlot(
        crypto.randomUUID(),
        input.date,
        input.startTime,
        "AVAILABLE",
        input.note,
      );
      slot.createdAt = now;
      slot.updatedAt = now;
      this.slots.push(slot);
      return { ...slot };
    });
  }

  updateSlot(id: string, input: RadioSlotDraft) {
    return this.atomic(() => {
      const slot = this.findSlot(id);
      if (slot.state === "PENDING" || slot.state === "BOOKED")
        throw new RadioRepositoryError("RADIO_SLOT_ACTIVE");
      if (
        this.slots.some(
          (row) => row.id !== id && row.date === input.date && row.startTime === input.startTime,
        )
      ) {
        throw new RadioRepositoryError("RADIO_SLOT_CONFLICT");
      }
      slot.date = input.date;
      slot.startTime = input.startTime;
      slot.note = input.note;
      slot.updatedAt = new Date().toISOString();
      return { ...slot };
    });
  }

  closeSlot(id: string) {
    return this.atomic(() => {
      const slot = this.findSlot(id);
      if (slot.state !== "AVAILABLE") throw new RadioRepositoryError("RADIO_SLOT_UNAVAILABLE");
      slot.state = "CLOSED";
      slot.updatedAt = new Date().toISOString();
      return { ...slot };
    });
  }

  reopenSlot(id: string) {
    return this.atomic(() => {
      const slot = this.findSlot(id);
      if (slot.state !== "CLOSED") throw new RadioRepositoryError("RADIO_SLOT_UNAVAILABLE");
      slot.state = "AVAILABLE";
      slot.updatedAt = new Date().toISOString();
      return { ...slot };
    });
  }

  private findSlot(id: string) {
    const slot = this.slots.find((row) => row.id === id);
    if (!slot) throw new RadioRepositoryError("RADIO_SLOT_NOT_FOUND");
    return slot;
  }

  private copySlots() {
    return this.slots.map((slot) => ({ ...slot }));
  }

  private copyBooking(booking: RadioBooking) {
    return { ...booking, slot: booking.slot ? { ...booking.slot } : null };
  }

  private atomic<T>(operation: () => T): Promise<T> {
    const previous = this.queue;
    let release!: () => void;
    this.queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    return previous.then(() => {
      try {
        return operation();
      } finally {
        release();
      }
    });
  }
}
