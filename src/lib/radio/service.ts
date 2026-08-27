import { RadioRepositoryError, type RadioRepository } from "./repository";
import { assertBookingTransition } from "./state-machine";
import type {
  RadioBooking,
  RadioBookingInput,
  RadioBookingStatus,
  RadioPageData,
  RadioSlot,
  RadioSlotDraft,
} from "./types";

export class RadioServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "RadioServiceError";
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  RADIO_SLOT_NOT_FOUND: "ไม่พบช่วงเวลานี้",
  RADIO_SLOT_UNAVAILABLE: "ช่วงเวลานี้ไม่ว่างแล้ว กรุณาเลือกช่วงเวลาอื่น",
  RADIO_BOOKING_NOT_FOUND: "ไม่พบคำขอจองนี้",
  RADIO_INVALID_TRANSITION: "ไม่สามารถเปลี่ยนสถานะคำขอนี้ได้",
  RADIO_SLOT_ACTIVE: "ไม่สามารถแก้ไขช่วงเวลาที่กำลังจองหรือออกอากาศได้",
  RADIO_SLOT_CONFLICT: "มีช่วงเวลานี้อยู่แล้ว",
  RADIO_NOT_AUTHORIZED: "บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ",
  RADIO_INVALID_DATA: "ข้อมูลตาราง SG Radio ไม่ถูกต้อง",
  RADIO_INVALID_BOOKING: "กรอกข้อมูลจองให้ครบถ้วนและถูกต้อง",
  RADIO_RULES_REQUIRED: "กรุณายอมรับกติกาการใช้บริการ",
  RADIO_SCHEDULE_UNAVAILABLE: "ไม่สามารถโหลดตาราง SG Radio ได้",
};

function userError(
  error: unknown,
  fallback = "ไม่สามารถดำเนินการ SG Radio ได้",
): RadioServiceError {
  const code =
    error instanceof RadioRepositoryError
      ? error.code
      : error instanceof Error
        ? error.message
        : "";
  return new RadioServiceError(code, ERROR_MESSAGES[code] ?? fallback);
}

function textValue(source: Record<string, unknown>, key: string, max: number, required = true) {
  const value = typeof source[key] === "string" ? source[key].trim() : "";
  const message = ERROR_MESSAGES["RADIO_INVALID_BOOKING"] ?? "กรอกข้อมูลจองให้ครบถ้วนและถูกต้อง";
  if (required && !value) throw new RadioServiceError("RADIO_INVALID_BOOKING", message);
  if (value.length > max) throw new RadioServiceError("RADIO_INVALID_BOOKING", message);
  return value;
}

export function normalizeRadioBookingInput(input: unknown): RadioBookingInput {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const slotId = textValue(source, "slotId", 80);
  if (source["acceptedRules"] !== true) {
    throw new RadioServiceError(
      "RADIO_RULES_REQUIRED",
      ERROR_MESSAGES["RADIO_RULES_REQUIRED"] ?? "กรุณายอมรับกติกาการใช้บริการ",
    );
  }
  return {
    slotId,
    requester: textValue(source, "requester", 120),
    studentId: textValue(source, "studentId", 40),
    klass: textValue(source, "klass", 40),
    song: textValue(source, "song", 200),
    message: textValue(source, "message", 600, false),
    additionalInfo: textValue(source, "additionalInfo", 1000, false),
    acceptedRules: true,
  };
}

function normalizeSlotDraft(input: unknown): RadioSlotDraft {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const date = textValue(source, "date", 10);
  const time = textValue(source, "startTime", 5);
  const dateParts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsedDate = dateParts
    ? new Date(Date.UTC(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3])))
    : null;
  const validDate =
    parsedDate !== null &&
    parsedDate.getUTCFullYear() === Number(dateParts?.[1]) &&
    parsedDate.getUTCMonth() === Number(dateParts?.[2]) - 1 &&
    parsedDate.getUTCDate() === Number(dateParts?.[3]);
  const validTime = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
  if (!validDate || !validTime) {
    throw new RadioServiceError(
      "RADIO_INVALID_DATA",
      ERROR_MESSAGES["RADIO_INVALID_DATA"] ?? "ข้อมูลตาราง SG Radio ไม่ถูกต้อง",
    );
  }
  return { date, startTime: time, note: textValue(source, "note", 300, false) };
}

export class RadioService {
  constructor(private readonly repository: RadioRepository) {}

  async getPageData(): Promise<RadioPageData> {
    try {
      return await this.repository.getPageData();
    } catch (error) {
      throw userError(
        error,
        ERROR_MESSAGES["RADIO_SCHEDULE_UNAVAILABLE"] ?? "ไม่สามารถโหลดตาราง SG Radio ได้",
      );
    }
  }

  async listSlots(): Promise<RadioSlot[]> {
    try {
      return await this.repository.listSlots();
    } catch (error) {
      throw userError(
        error,
        ERROR_MESSAGES["RADIO_SCHEDULE_UNAVAILABLE"] ?? "ไม่สามารถโหลดตาราง SG Radio ได้",
      );
    }
  }

  async listBookings(): Promise<RadioBooking[]> {
    try {
      return await this.repository.listBookings();
    } catch (error) {
      throw userError(error);
    }
  }

  async reserve(input: unknown): Promise<RadioBooking> {
    const normalized = normalizeRadioBookingInput(input);
    try {
      const { acceptedRules: _acceptedRules, ...booking } = normalized;
      return await this.repository.reserve(booking);
    } catch (error) {
      throw userError(error);
    }
  }

  approve(id: string) {
    return this.transition(id, "APPROVED");
  }

  reject(id: string) {
    return this.transition(id, "REJECTED");
  }

  complete(id: string) {
    return this.transition(id, "COMPLETED");
  }

  cancel(id: string) {
    return this.transition(id, "CANCELLED");
  }

  async transition(id: string, nextStatus: RadioBookingStatus): Promise<RadioBooking> {
    if (!id.trim()) {
      throw new RadioServiceError(
        "RADIO_BOOKING_NOT_FOUND",
        ERROR_MESSAGES["RADIO_BOOKING_NOT_FOUND"] ?? "ไม่พบคำขอจองนี้",
      );
    }
    try {
      return await this.repository.transitionBooking(id, nextStatus);
    } catch (error) {
      throw userError(error);
    }
  }

  async saveSlot(id: string | undefined, input: unknown): Promise<RadioSlot> {
    const draft = normalizeSlotDraft(input);
    try {
      return id
        ? await this.repository.updateSlot(id, draft)
        : await this.repository.createSlot(draft);
    } catch (error) {
      throw userError(error);
    }
  }

  async closeSlot(id: string) {
    return this.slotAction(id, () => this.repository.closeSlot(id));
  }

  async reopenSlot(id: string) {
    return this.slotAction(id, () => this.repository.reopenSlot(id));
  }

  private async slotAction(id: string, action: () => Promise<RadioSlot>) {
    if (!id.trim()) {
      throw new RadioServiceError(
        "RADIO_SLOT_NOT_FOUND",
        ERROR_MESSAGES["RADIO_SLOT_NOT_FOUND"] ?? "ไม่พบช่วงเวลานี้",
      );
    }
    try {
      return await action();
    } catch (error) {
      throw userError(error);
    }
  }
}

export { assertBookingTransition };
