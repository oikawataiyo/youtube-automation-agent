const fs = require("fs");
const [, , p, lo, hi] = process.argv;
const w = fs.readFileSync(p, "utf8");
const arr = JSON.parse(w.replace(/^window\.\w+=/, "").replace(/;\s*$/, ""));
arr.forEach((x) => {
  if (x[1] >= +lo && x[1] <= +hi) console.log(x[1].toFixed(2), x[2].toFixed(2), JSON.stringify(x[0]));
});
