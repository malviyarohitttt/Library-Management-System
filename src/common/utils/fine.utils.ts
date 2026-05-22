export const FINE_PER_DAY = 10; // ₹10 per day

/**
 * Calculate fine for overdue rental
 * @param dueDate - the due date of the rental
 * @param returnDate - the actual return date (defaults to now)
 * @returns fine amount in rupees
 */
export function calculateFine(
  dueDate: Date,
  returnDate: Date = new Date(),
): number {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);

  // Normalize to midnight to compare dates only
  due.setHours(0, 0, 0, 0);
  returned.setHours(0, 0, 0, 0);

  if (returned <= due) {
    return 0;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const lateDays = Math.ceil((returned.getTime() - due.getTime()) / msPerDay);

  return lateDays * FINE_PER_DAY;
}

/**
 * Generate unique membership ID
 * @param lastId - last numeric ID in the sequence
 * @returns formatted membership ID like MEM-1001
 */
export function generateMembershipId(lastId: number): string {
  const nextId = lastId + 1;
  const paddedId = String(1000 + nextId).padStart(4, '0');
  return `MEM-${paddedId}`;
}

/**
 * Calculate due date from issue date and due days
 */
export function calculateDueDate(issueDate: Date, dueDays: number): Date {
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + dueDays);
  return dueDate;
}
