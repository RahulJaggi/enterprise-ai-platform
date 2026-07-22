export function formatIsoTimestamp(date = new Date()): string {
  return date.toISOString();
}

export function isExpired(expirationTimestamp: number): boolean {
  return Date.now() >= expirationTimestamp;
}
