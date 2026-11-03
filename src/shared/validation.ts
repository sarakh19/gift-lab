// Small runtime checks for data that TypeScript cannot see at compile time
// (API responses, localStorage).

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

// Generic lookup shared by any collection whose items carry a numeric id.
export function findById<T extends { id: number }>(
  items: readonly T[],
  id: unknown,
): T | undefined {
  return items.find((item) => item.id === id);
}
