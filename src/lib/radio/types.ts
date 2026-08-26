export const RADIO_SLOT_STATES = ["AVAILABLE", "PENDING", "BOOKED", "CLOSED"] as const;
export type RadioSlotState = (typeof RADIO_SLOT_STATES)[number];

export const RADIO_BOOKING_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type RadioBookingStatus = (typeof RADIO_BOOKING_STATUSES)[number];

export type RadioSlot = {
  id: string;
  date: string;
  startTime: string;
  state: RadioSlotState;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type RadioSlotDraft = {
  date: string;
  startTime: string;
  note: string;
};

export type RadioSlotSummary = Pick<RadioSlot, "date" | "startTime" | "state">;

export type RadioBooking = {
  id: string;
  slotId: string | null;
  requester: string;
  studentId: string;
  klass: string;
  song: string;
  message: string;
  additionalInfo: string;
  status: RadioBookingStatus;
  createdAt: string;
  updatedAt: string;
  slot: RadioSlotSummary | null;
};

export type RadioBookingInput = {
  slotId: string;
  requester: string;
  studentId: string;
  klass: string;
  song: string;
  message: string;
  additionalInfo: string;
  acceptedRules: boolean;
};

export type RadioPageData = {
  slots: RadioSlot[];
  rules: string[];
};
