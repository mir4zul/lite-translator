import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/index.js", import.meta.url));
console.log(`${gzipSync(source).byteLength} bytes gzipped (source, before minification)`);
