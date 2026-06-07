const fs = require("fs");
const p = process.argv[2];
const w = fs.readFileSync(p, "utf8");
const arr = JSON.parse(w.replace(/^window\.\w+=/, "").replace(/;\s*$/, ""));
const norm = (s) => s.toLowerCase().replace(/[^a-z']/g, "");
const targets = ["missing", "hunters", "problem", "anymore", "wald", "complete", "buried"];
const counts = {};
for (const t of targets) counts[t] = 0;
const times = {};
for (const t of targets) times[t] = [];
arr.forEach((x) => {
  const n = norm(x[0]);
  for (const t of targets) if (n === t) { counts[t]++; times[t].push(x[1]); }
});
console.log("total words:", arr.length);
for (const t of targets) console.log(t, "x" + counts[t], "@", times[t].map((v) => v.toFixed(1)).join(","));
