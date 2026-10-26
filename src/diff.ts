import { JsonValue, PatchOperation, isObject } from "./types";
import { joinPointer } from "./pointer";

/** Deep structural equality for JSON values (object key order is irrelevant). */
export function deepEqual(a: JsonValue, b: JsonValue): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  if (isObject(a) || isObject(b)) {
    if (!isObject(a) || !isObject(b)) return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => key in b && deepEqual(a[key], b[key]));
  }
  return false;
}

/**
 * Compute a minimal-ish patch turning `oldDoc` into `newDoc`.
 *
 * The returned operations are ordered so that applying them in sequence
 * (see applyPatch) reproduces `newDoc` exactly:
 * - object operations are order-independent (distinct keys);
 * - array removals come in descending index order, then insertions in
 *   ascending target order, so no index ever shifts under a later op.
 */
export function diff(oldDoc: JsonValue, newDoc: JsonValue, path = ""): PatchOperation[] {
  if (deepEqual(oldDoc, newDoc)) return [];

  if (Array.isArray(oldDoc) && Array.isArray(newDoc)) {
    return diffArrays(oldDoc, newDoc, path);
  }
  if (isObject(oldDoc) && isObject(newDoc)) {
    return diffObjects(oldDoc, newDoc, path);
  }
  // Different types, or different primitives: one replace covers it.
  return [{ op: "replace", path, value: newDoc }];
}

function diffObjects(
  oldObj: { [key: string]: JsonValue },
  newObj: { [key: string]: JsonValue },
  path: string,
): PatchOperation[] {
  const ops: PatchOperation[] = [];
  for (const key of Object.keys(oldObj)) {
    if (!(key in newObj)) {
      ops.push({ op: "remove", path: joinPointer(path, key) });
    }
  }
  for (const key of Object.keys(newObj)) {
    const childPath = joinPointer(path, key);
    if (!(key in oldObj)) {
      ops.push({ op: "add", path: childPath, value: newObj[key] });
    } else {
      ops.push(...diff(oldObj[key], newObj[key], childPath));
    }
  }
  return ops;
}

/**
 * Diff two arrays via longest common subsequence (LCS) on deep equality.
 * Elements outside the LCS are removed (descending index) and inserted
 * (ascending final index). Unchanged elements that merely moved are
 * reported as remove + add, which keeps the patch small in the common
 * append/prepend/edit cases and always correct.
 */
function diffArrays(oldArr: JsonValue[], newArr: JsonValue[], path: string): PatchOperation[] {
  const { oldKept, newKept } = longestCommonSubsequence(oldArr, newArr);
  const ops: PatchOperation[] = [];

  // Removals first, highest index first, so earlier removals never shift
  // the index of a later one.
  for (let i = oldArr.length - 1; i >= 0; i--) {
    if (!oldKept.has(i)) {
      ops.push({ op: "remove", path: joinPointer(path, String(i)) });
    }
  }
  // Insertions in ascending final-index order. After the removals above,
  // the array holds exactly the LCS elements in order; inserting each new
  // element at its final index is correct because every element that
  // belongs before it is already in place.
  for (let j = 0; j < newArr.length; j++) {
    if (!newKept.has(j)) {
      ops.push({ op: "add", path: joinPointer(path, String(j)), value: newArr[j] });
    }
  }
  return ops;
}

function longestCommonSubsequence(
  a: JsonValue[],
  b: JsonValue[],
): { oldKept: Set<number>; newKept: Set<number> } {
  // Classic O(n*m) DP table over deep equality.
  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = deepEqual(a[i], b[j])
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const oldKept = new Set<number>();
  const newKept = new Set<number>();
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (deepEqual(a[i], b[j])) {
      oldKept.add(i);
      newKept.add(j);
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return { oldKept, newKept };
}
