const fs = require("fs");
const path = process.argv[2];
const w = fs.readFileSync(path, "utf8");
const arr = JSON.parse(w.replace(/^window\.\w+=/, "").replace(/;\s*$/, ""));
let line = "", lineStart = null;
arr.forEach((x) => {
  if (lineStart === null) lineStart = x[1];
  line += x[0] + " ";
  if (/[.!?]$/.test(x[0])) {
    console.log(lineStart.toFixed(2).padStart(7) + "  " + line.trim());
    line = "";
    lineStart = null;
  }
});
if (line.trim()) console.log(lineStart.toFixed(2).padStart(7) + "  " + line.trim());
