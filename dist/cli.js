#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const diff_1 = require("./diff");
const apply_1 = require("./apply");
function usage() {
    console.error("Usage:");
    console.error("  json-diff <old.json> <new.json> [--pretty]   print the patch");
    console.error("  json-diff --apply <doc.json> <patch.json>    print the patched document");
    process.exit(1);
}
function readJson(path) {
    return JSON.parse((0, fs_1.readFileSync)(path, "utf8"));
}
function main() {
    const args = process.argv.slice(2);
    if (args[0] === "--apply") {
        if (args.length !== 3)
            usage();
        const doc = readJson(args[1]);
        const ops = JSON.parse((0, fs_1.readFileSync)(args[2], "utf8"));
        console.log(JSON.stringify((0, apply_1.applyPatch)(doc, ops), null, 2));
        return;
    }
    if (args.length < 2 || args.length > 3)
        usage();
    const pretty = args.includes("--pretty");
    const files = args.filter((a) => a !== "--pretty");
    const patch = (0, diff_1.diff)(readJson(files[0]), readJson(files[1]));
    console.log(JSON.stringify(patch, null, pretty ? 2 : 0));
}
main();
