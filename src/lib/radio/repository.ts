import type {
  RadioBooking,
  RadioBookingInput,
  RadioBookingStatus,
  RadioSlot,
  RadioSlotDraft,
  RadioPageData,
} from "./types";

export type RadioRepositoryErrorCode =
  | "RADIO_SLOT_NOT_FOUND"
  | "RADIO_SLOT_UNAVAILABLE"
  | "RADIO_BOOKING_NOT_FOUND"
  | "RADIO_INVALID_TRANSITION"
  | "RADIO_SLOT_ACTIVE"
  | "RADIO_SLOT_CONFLICT"
  | "RADIO_NOT_AUTHORIZED"
  | "RADIO_INVALID_DATA";

export class RadioRepositoryError extends Error {
  constructor(
    public readonly code: RadioRepositoryErrorCode,
    message = code,
  ) {
    super(message);
    this.name = "RadioRepositoryError";
  }
}

export interface RadioRepository {
  getPageData(): Promise<RadioPageData>;
  listSlots(): Promise<RadioSlot[]>;
  listBookings(): Promise<RadioBooking[]>;
  reserve(input: Omit<RadioBookingInput, "acceptedRules">): Promise<RadioBooking>;
  transitionBooking(id: string, nextStatus: RadioBookingStatus): Promise<RadioBooking>;
  createSlot(input: RadioSlotDraft): Promise<RadioSlot>;
  updateSlot(id: string, input: RadioSlotDraft): Promise<RadioSlot>;
  closeSlot(id: string): Promise<RadioSlot>;
  reopenSlot(id: string): Promise<RadioSlot>;
}
