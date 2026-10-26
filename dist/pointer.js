"use strict";
/** JSON Pointer (RFC 6901) helpers: escaping, parsing, joining. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeSegment = escapeSegment;
exports.unescapeSegment = unescapeSegment;
exports.parsePointer = parsePointer;
exports.joinPointer = joinPointer;
function escapeSegment(segment) {
    // Order matters: escape "~" first, otherwise "~1" would be double-escaped.
    return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function unescapeSegment(segment) {
    return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}
/** Split a pointer into its segments. "" (the root) yields []. */
function parsePointer(pointer) {
    if (pointer === "")
        return [];
    if (!pointer.startsWith("/")) {
        throw new Error(`Invalid JSON Pointer: ${JSON.stringify(pointer)}`);
    }
    return pointer.slice(1).split("/").map(unescapeSegment);
}
function joinPointer(base, segment) {
    return `${base}/${escapeSegment(segment)}`;
}
