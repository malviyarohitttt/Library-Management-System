export function generateMembershipId(lastId: number): string {
  const nextId = lastId + 1;
  const paddedId = String(1000 + nextId).padStart(4, '0');
  return `MEM-${paddedId}`;
}

export function calculateDueDate(issueDate: Date, dueDays: number): Date {
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + dueDays);
  return dueDate;
}

export function getPaginationParams(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

export const MAX_ACTIVE_RENTALS = 3;
