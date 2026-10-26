import { JsonValue, PatchOperation } from "./types";
/**
 * Apply RFC 6902 operations to a document, in order, and return the
 * result. The input is never mutated. Throws on invalid paths, missing
 * targets for remove/replace, and out-of-range array indices.
 */
export declare function applyPatch(doc: JsonValue, ops: PatchOperation[]): JsonValue;
