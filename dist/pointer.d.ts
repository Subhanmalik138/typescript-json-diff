/** JSON Pointer (RFC 6901) helpers: escaping, parsing, joining. */
export declare function escapeSegment(segment: string): string;
export declare function unescapeSegment(segment: string): string;
/** Split a pointer into its segments. "" (the root) yields []. */
export declare function parsePointer(pointer: string): string[];
export declare function joinPointer(base: string, segment: string): string;
