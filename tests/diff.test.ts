import { diff, deepEqual } from "../src/diff";

describe("diff", () => {
  test("identical documents produce no operations", () => {
    expect(diff({ a: [1, 2, { b: "x" }] }, { a: [1, 2, { b: "x" }] })).toEqual([]);
    expect(diff(5, 5)).toEqual([]);
    expect(diff(null, null)).toEqual([]);
  });

  test("primitive changes become a single replace", () => {
    expect(diff(1, 2)).toEqual([{ op: "replace", path: "", value: 2 }]);
    expect(diff("a", "b")).toEqual([{ op: "replace", path: "", value: "b" }]);
    expect(diff([1], { a: 1 })).toEqual([{ op: "replace", path: "", value: { a: 1 } }]);
  });

  test("object keys are added, removed, and replaced", () => {
    expect(diff({ a: 1, b: 2 }, { a: 1, c: 3 })).toEqual([
      { op: "remove", path: "/b" },
      { op: "add", path: "/c", value: 3 },
    ]);
    expect(diff({ a: { x: 1 } }, { a: { x: 2 } })).toEqual([
      { op: "replace", path: "/a/x", value: 2 },
    ]);
  });

  test("pointer escaping handles ~ and / in keys", () => {
    expect(diff({ "a/b": 1, "t~x": 1 }, { "a/b": 2, "t~x": 1 })).toEqual([
      { op: "replace", path: "/a~1b", value: 2 },
    ]);
  });

  test("arrays diff via LCS: append, prepend, and middle edits", () => {
    expect(diff([1, 2, 3], [1, 2, 3, 4])).toEqual([
      { op: "add", path: "/3", value: 4 },
    ]);
    expect(diff([1, 2, 3], [0, 1, 2, 3])).toEqual([
      { op: "add", path: "/0", value: 0 },
    ]);
    // Element 2 is dropped; indices of removals come in descending order.
    expect(diff([1, 2, 3], [1, 3])).toEqual([{ op: "remove", path: "/1" }]);
  });

  test("array element replacement is remove + add, not a bogus replace", () => {
    const ops = diff([{ id: 1 }, { id: 2 }], [{ id: 1 }, { id: 3 }]);
    expect(ops).toEqual([
      { op: "remove", path: "/1" },
      { op: "add", path: "/1", value: { id: 3 } },
    ]);
  });
});

describe("deepEqual", () => {
  test("object key order does not matter", () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(deepEqual({ a: [1, { x: 2 }] }, { a: [1, { x: 3 }] })).toBe(false);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
  });
});
