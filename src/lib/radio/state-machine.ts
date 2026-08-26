import type { RadioBookingStatus, RadioSlotState } from "./types";

const ALLOWED_TRANSITIONS: Record<RadioBookingStatus, readonly RadioBookingStatus[]> = {
  PENDING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
  CANCELLED: [],
};

export function assertBookingTransition(current: RadioBookingStatus, next: RadioBookingStatus) {
  if (!ALLOWED_TRANSITIONS[current].includes(next)) {
    throw new Error("RADIO_INVALID_TRANSITION");
  }
}

export function slotStateAfterBookingTransition(
  currentBooking: RadioBookingStatus,
  nextBooking: RadioBookingStatus,
  currentSlot: RadioSlotState,
): RadioSlotState {
  assertBookingTransition(currentBooking, nextBooking);

  if (currentBooking === "PENDING" && nextBooking === "APPROVED") {
    if (currentSlot !== "PENDING") throw new Error("RADIO_INVALID_DATA");
    return "BOOKED";
  }
  if (currentBooking === "PENDING" && (nextBooking === "REJECTED" || nextBooking === "CANCELLED")) {
    if (currentSlot !== "PENDING") throw new Error("RADIO_INVALID_DATA");
    return "AVAILABLE";
  }
  if (currentBooking === "APPROVED" && nextBooking === "COMPLETED") {
    if (currentSlot !== "BOOKED") throw new Error("RADIO_INVALID_DATA");
    return "BOOKED";
  }
  throw new Error("RADIO_INVALID_TRANSITION");
}
