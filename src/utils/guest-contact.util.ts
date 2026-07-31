import { Op } from "sequelize";
import Interview from "../modules/interview/interview.model";
import Guest from "../modules/guest/guest.model";

// Minimal shape needed from the requester — avoids importing the full
// User type here and keeps this util decoupled from auth internals.
interface RequestingUser {
  id: string;
  hide_guest_contacts?: boolean;
}

const CONTACT_FIELDS = ["email", "phone"] as const;

/**
 * Returns the set of guest IDs the given user has ever been the
 * interview host for (any status — scheduled, cancelled, published, etc).
 * Only called when the user is actually restricted, to avoid an
 * unnecessary query for the common case.
 */
async function getInterviewedGuestIds(
  userId: string,
  guestIds: string[],
): Promise<Set<string>> {
  if (guestIds.length === 0) return new Set();

  const rows = await Interview.findAll({
    where: {
      host_id: userId,
      guest_id: { [Op.in]: guestIds },
    },
    attributes: ["guest_id"],
  });

  return new Set(rows.map((row) => row.guest_id));
}

function canViewContact(
  user: RequestingUser,
  guest: Guest,
  interviewedGuestIds: Set<string>,
): boolean {
  // Not restricted at all — sees everything, as before.
  if (!user.hide_guest_contacts) return true;

  // Restricted — only the three explicit exceptions apply.
  return (
    guest.created_by === user.id ||
    guest.host_id === user.id ||
    interviewedGuestIds.has(guest.id)
  );
}

function nullifyContactFields(guest: Guest): void {
  for (const field of CONTACT_FIELDS) {
    (guest as any)[field] = null;
  }
}

/**
 * Applies contact masking to a list of guests in place, for the given
 * requesting user. Safe to call with an empty array or a user that
 * isn't restricted — both short-circuit without extra queries.
 */
export async function maskGuestContacts(
  guests: Guest[],
  user: RequestingUser,
): Promise<Guest[]> {
  if (!user.hide_guest_contacts || guests.length === 0) {
    return guests;
  }

  const guestIds = guests.map((g) => g.id);
  const interviewedGuestIds = await getInterviewedGuestIds(user.id, guestIds);

  for (const guest of guests) {
    if (!canViewContact(user, guest, interviewedGuestIds)) {
      nullifyContactFields(guest);
    }
  }

  return guests;
}

/**
 * Single-guest convenience wrapper for detail endpoints
 * (e.g. GuestService.getGuestById).
 */
export async function maskGuestContact(
  guest: Guest,
  user: RequestingUser,
): Promise<Guest> {
  await maskGuestContacts([guest], user);
  return guest;
}
