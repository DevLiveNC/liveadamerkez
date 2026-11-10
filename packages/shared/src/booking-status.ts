import {
  BOOKING_STATUS_TRANSITIONS,
  type BookingStatus,
} from "./constants.js";

export function canTransitionBookingStatus(
  from: BookingStatus,
  to: BookingStatus,
): boolean {
  if (from === to) return true;
  return BOOKING_STATUS_TRANSITIONS[from].includes(to);
}
