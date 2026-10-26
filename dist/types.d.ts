/** Shared JSON types for the differ and the patch applier. */
/** Any value that can appear in a JSON document. */
export type JsonValue = null | boolean | number | string | JsonValue[] | {
    [key: string]: JsonValue;
};
/** One RFC 6902 JSON Patch operation. `value` is absent for `remove`. */
export interface PatchOperation {
    op: "add" | "remove" | "replace";
    /** JSON Pointer (RFC 6901), e.g. "/users/0/name". "" addresses the whole document. */
    path: string;
    value?: JsonValue;
}
export declare function isObject(value: JsonValue): value is {
    [key: string]: JsonValue;
};
