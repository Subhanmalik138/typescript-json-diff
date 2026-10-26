# typescript-json-diff

A structural JSON differ that produces [RFC 6902](https://datatracker.ietf.org/doc/html/rfc6902)
JSON Patch operations, plus a strict patch applier that can reproduce the
target document from the source and the patch — no dependencies, fully typed.

## Problem

Diffing JSON by hand is error-prone: naive line diffs break on formatting,
and hand-written patches drift out of sync with the documents they describe.
This library computes the patch mechanically, so `applyPatch(old, diff(old, new))`
is always exactly `new` (the test suite proves this over a matrix of cases).

## Design decisions

1. **RFC 6902 output, RFC 6901 paths.** Patches are plain JSON Patch
   operations (`add` / `remove` / `replace`) with escaped JSON Pointers, so
   they interoperate with any other JSON Patch tool — not a custom format.
2. **LCS-based array diff.** Arrays are diffed with a longest-common-subsequence
   pass over deep equality, so appends, prepends, and deletions stay minimal
   instead of replacing the whole array on any change.
3. **Operation ordering guarantees correctness.** Array removals are emitted in
   descending index order and insertions in ascending target order, so no
   operation ever shifts an index a later operation relies on. This is the
   detail that makes the round-trip property hold.
4. **Strict applier, no silent corruption.** The applier clones its input,
   validates every path, and throws on missing keys, out-of-range indices,
   and misuse of the `-` append marker — a bad patch fails loudly instead of
   producing a half-patched document.

## Usage

```typescript
import { diff, applyPatch } from "typescript-json-diff";

const oldDoc = { name: "app", version: 1, tags: ["a", "b"] };
const newDoc = { name: "app", version: 2, tags: ["a", "c", "b"] };

const patch = diff(oldDoc, newDoc);
// [
//   { op: "replace", path: "/version", value: 2 },
//   { op: "add", path: "/tags/1", value: "c" },
// ]

applyPatch(oldDoc, patch); // deep-equals newDoc
```

## CLI

```bash
npm run build

# Print the patch between two JSON files
node dist/cli.js old.json new.json --pretty

# Apply a patch file to a document
node dist/cli.js --apply doc.json patch.json
```

## Run tests

```bash
npm install
npm test
```

## Tech stack

TypeScript (strict mode), Jest + ts-jest, Node.js. Zero runtime dependencies.
