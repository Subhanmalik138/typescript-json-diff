/** JSON Pointer (RFC 6901) helpers: escaping, parsing, joining. */

export function escapeSegment(segment: string): string {
  // Order matters: escape "~" first, otherwise "~1" would be double-escaped.
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

export function unescapeSegment(segment: string): string {
  return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}

/** Split a pointer into its segments. "" (the root) yields []. */
export function parsePointer(pointer: string): string[] {
  if (pointer === "") return [];
  if (!pointer.startsWith("/")) {
    throw new Error(`Invalid JSON Pointer: ${JSON.stringify(pointer)}`);
  }
  return pointer.slice(1).split("/").map(unescapeSegment);
}

export function joinPointer(base: string, segment: string): string {
  return `${base}/${escapeSegment(segment)}`;
}
