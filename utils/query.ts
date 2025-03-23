import qs from "qs";

export function updateQueryString(
  current: string,
  updates: Record<string, any>,
): string {
  const parsed = qs.parse(current, { ignoreQueryPrefix: true });
  const merged = { ...parsed, ...updates };

  // Clean up undefined or empty fields
  for (const key in merged) {
    if (
      merged[key] === undefined ||
      (typeof merged[key] === "string" && merged[key].trim() === "")
    ) {
      delete merged[key];
    }
  }

  return `?${qs.stringify(merged)}`;
}
