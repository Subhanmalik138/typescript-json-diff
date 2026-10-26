import { applyPatch } from "../src/apply";
import { diff } from "../src/diff";
import { JsonValue } from "../src/types";

describe("applyPatch", () => {
  test("applies add, remove, and replace on objects", () => {
    const doc = { a: 1, b: 2 };
    const result = applyPatch(doc, [
      { op: "add", path: "/c", value: 3 },
      { op: "remove", path: "/b" },
      { op: "replace", path: "/a", value: 10 },
    ]);
    expect(result).toEqual({ a: 10, c: 3 });
    expect(doc).toEqual({ a: 1, b: 2 }); // input is not mutated
  });

  test("array insert, append with -, and delete", () => {
    expect(applyPatch([1, 3], [{ op: "add", path: "/1", value: 2 }])).toEqual([1, 2, 3]);
    expect(applyPatch([1], [{ op: "add", path: "/-", value: 2 }])).toEqual([1, 2]);
    expect(applyPatch([1, 2, 3], [{ op: "remove", path: "/0" }])).toEqual([2, 3]);
  });

  test("unescapes ~0 and ~1 in paths", () => {
    expect(
      applyPatch({ "a/b": 1 }, [{ op: "replace", path: "/a~1b", value: 2 }]),
    ).toEqual({ "a/b": 2 });
  });

  test("replacing the whole document works", () => {
    expect(applyPatch({ a: 1 }, [{ op: "replace", path: "", value: [1, 2] }])).toEqual([1, 2]);
  });

  test("invalid operations throw instead of silently corrupting", () => {
    expect(() => applyPatch({ a: 1 }, [{ op: "remove", path: "/missing" }])).toThrow();
    expect(() => applyPatch([1], [{ op: "remove", path: "/5" }])).toThrow();
    expect(() => applyPatch({ a: 1 }, [{ op: "remove", path: "" }])).toThrow();
    expect(() => applyPatch([1], [{ op: "add", path: "/5", value: 9 }])).toThrow();
  });
});

describe("round-trip: applyPatch(old, diff(old, new)) === new", () => {
  const pairs: Array<[JsonValue, JsonValue]> = [
    [{ name: "app", version: 1, tags: ["a", "b"] }, { name: "app", version: 2, tags: ["a", "c", "b"], extra: true }],
    [{ users: [{ id: 1 }, { id: 2 }] }, { users: [{ id: 2 }, { id: 3 }, { id: 1 }] }],
    [[1, 2, 3, 4, 5], [5, 4, 3]],
    [{ deep: { nested: { list: [1, { x: 1 }] } } }, { deep: { nested: { list: [1, { x: 2 }, 9] } } }],
    [["a", "b", "c"], ["x", "a", "c", "y"]],
    [[null, true, 0], [true, 0, false]],
    [{}, { a: { b: { c: [] } } }],
  ];
  for (let i = 0; i < pairs.length; i++) {
    const [oldDoc, newDoc] = pairs[i];
    test(`pair ${i} round-trips`, () => {
      expect(applyPatch(oldDoc, diff(oldDoc, newDoc))).toEqual(newDoc);
    });
  }
});
