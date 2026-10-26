#!/usr/bin/env node
import { readFileSync } from "fs";
import { diff } from "./diff";
import { applyPatch } from "./apply";
import { JsonValue, PatchOperation } from "./types";

function usage(): never {
  console.error("Usage:");
  console.error("  json-diff <old.json> <new.json> [--pretty]   print the patch");
  console.error("  json-diff --apply <doc.json> <patch.json>    print the patched document");
  process.exit(1);
}

function readJson(path: string): JsonValue {
  return JSON.parse(readFileSync(path, "utf8")) as JsonValue;
}

function main(): void {
  const args = process.argv.slice(2);
  if (args[0] === "--apply") {
    if (args.length !== 3) usage();
    const doc = readJson(args[1]);
    const ops = JSON.parse(readFileSync(args[2], "utf8")) as PatchOperation[];
    console.log(JSON.stringify(applyPatch(doc, ops), null, 2));
    return;
  }
  if (args.length < 2 || args.length > 3) usage();
  const pretty = args.includes("--pretty");
  const files = args.filter((a) => a !== "--pretty");
  const patch = diff(readJson(files[0]), readJson(files[1]));
  console.log(JSON.stringify(patch, null, pretty ? 2 : 0));
}

main();
