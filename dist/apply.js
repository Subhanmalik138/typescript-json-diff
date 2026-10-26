"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPatch = applyPatch;
const types_1 = require("./types");
const pointer_1 = require("./pointer");
function clone(value) {
    return value === undefined ? value : JSON.parse(JSON.stringify(value));
}
function isArrayIndex(segment) {
    return /^(0|[1-9][0-9]*)$/.test(segment);
}
/** Resolve the parent container of `segments` inside `root`, for mutation. */
function resolveParent(root, segments) {
    let current = root;
    for (const segment of segments) {
        if (Array.isArray(current)) {
            if (!isArrayIndex(segment)) {
                throw new Error(`Expected array index, got ${JSON.stringify(segment)}`);
            }
            current = current[Number(segment)];
        }
        else if ((0, types_1.isObject)(current)) {
            if (!(segment in current)) {
                throw new Error(`Path does not exist: /${segments.join("/")}`);
            }
            current = current[segment];
        }
        else {
            throw new Error(`Cannot traverse through a primitive at /${segments.join("/")}`);
        }
    }
    return current;
}
/**
 * Apply RFC 6902 operations to a document, in order, and return the
 * result. The input is never mutated. Throws on invalid paths, missing
 * targets for remove/replace, and out-of-range array indices.
 */
function applyPatch(doc, ops) {
    let result = clone(doc);
    for (const op of ops) {
        result = applyOne(result, op);
    }
    return result;
}
function applyOne(doc, op) {
    const segments = (0, pointer_1.parsePointer)(op.path);
    if (segments.length === 0) {
        // The whole document is being replaced; removing it is not meaningful.
        if (op.op === "remove")
            throw new Error("Cannot remove the document root");
        if (op.value === undefined)
            throw new Error("add/replace requires a value");
        return clone(op.value);
    }
    const parent = resolveParent(doc, segments.slice(0, -1));
    const last = segments[segments.length - 1];
    if (Array.isArray(parent)) {
        if (last === "-") {
            if (op.op !== "add" || op.value === undefined) {
                throw new Error(`"-" is only valid for add, not ${op.op}`);
            }
            parent.push(clone(op.value));
            return doc;
        }
        if (!isArrayIndex(last))
            throw new Error(`Expected array index, got ${JSON.stringify(last)}`);
        const index = Number(last);
        if (op.op === "add") {
            if (op.value === undefined)
                throw new Error("add requires a value");
            if (index > parent.length)
                throw new Error(`Array index out of range: ${index}`);
            parent.splice(index, 0, clone(op.value));
        }
        else if (op.op === "remove") {
            if (index >= parent.length)
                throw new Error(`Array index out of range: ${index}`);
            parent.splice(index, 1);
        }
        else {
            if (op.value === undefined)
                throw new Error("replace requires a value");
            if (index >= parent.length)
                throw new Error(`Array index out of range: ${index}`);
            parent[index] = clone(op.value);
        }
        return doc;
    }
    if ((0, types_1.isObject)(parent)) {
        if (op.op === "add") {
            if (op.value === undefined)
                throw new Error("add requires a value");
            parent[last] = clone(op.value);
        }
        else if (op.op === "remove") {
            if (!(last in parent))
                throw new Error(`Key does not exist: ${JSON.stringify(last)}`);
            delete parent[last];
        }
        else {
            if (op.value === undefined)
                throw new Error("replace requires a value");
            if (!(last in parent))
                throw new Error(`Key does not exist: ${JSON.stringify(last)}`);
            parent[last] = clone(op.value);
        }
        return doc;
    }
    throw new Error(`Cannot apply ${op.op} to a primitive`);
}
