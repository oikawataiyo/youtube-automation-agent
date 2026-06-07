const fs = require("fs");
const p = process.argv[2];
const w = fs.readFileSync(p, "utf8");
const arr = JSON.parse(w.replace(/^window\.\w+=/, "").replace(/;\s*$/, ""));
// Find both occurrences of "hunters." and the "And" that starts the Wald sentence.
const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, "");
let huntersIdx = [];
arr.forEach((x, i) => { if (norm(x[0]) === "hunters") huntersIdx.push(i); });
// "And" near 106.5 starting the final sentence
let andIdx = -1;
for (let i = 0; i < arr.length; i++) {
  if (norm(arr[i][0]) === "and" && arr[i][1] >= 104 && arr[i][1] <= 108) { andIdx = i; break; }
}
const out = { hunters: huntersIdx.map((i) => ({ i, word: arr[i][0], start: arr[i][1], end: arr[i][2] })) };
if (huntersIdx.length >= 1) {
  const firstH = huntersIdx[0];
  out.cutFrom_endOfFirstHunters = arr[firstH][2];
  out.nextWordAfterFirst = arr[firstH + 1] ? { word: arr[firstH + 1][0], start: arr[firstH + 1][1] } : null;
}
out.andWord = andIdx >= 0 ? { i: andIdx, word: arr[andIdx][0], start: arr[andIdx][1] } : null;
fs.writeFileSync("/tmp/cutinfo.json", JSON.stringify(out, null, 2));
console.log("written /tmp/cutinfo.json");
