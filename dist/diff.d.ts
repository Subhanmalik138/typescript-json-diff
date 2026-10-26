import { JsonValue, PatchOperation } from "./types";
/** Deep structural equality for JSON values (object key order is irrelevant). */
export declare function deepEqual(a: JsonValue, b: JsonValue): boolean;
/**
 * Compute a minimal-ish patch turning `oldDoc` into `newDoc`.
 *
 * The returned operations are ordered so that applying them in sequence
 * (see applyPatch) reproduces `newDoc` exactly:
 * - object operations are order-independent (distinct keys);
 * - array removals come in descending index order, then insertions in
 *   ascending target order, so no index ever shifts under a later op.
 */
export declare function diff(oldDoc: JsonValue, newDoc: JsonValue, path?: string): PatchOperation[];
