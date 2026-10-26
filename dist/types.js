"use strict";
/** Shared JSON types for the differ and the patch applier. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = isObject;
function isObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
