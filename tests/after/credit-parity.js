/** §6A / Rule 3 credit-window parity: JS CC_ELIG vs owned reference D12–D20 + NOD=LOD. */
const fs = require("fs");
const { spawnSync } = require("child_process");
const OUT = process.env.OUT || "/tmp/after-credit-parity";
fs.mkdirSync(OUT, { recursive: true });
require("/workspace/checkride-v4/elig-clock.js");
const E = globalThis.CC_ELIG;
let pass = 0, fail = 0;
const results = [];
const check = (name, yes, data) => {
  results.push({ name, pass: !!yes, data });
  yes ? pass++ : fail++;
  console.log(yes ? "PASS" : "FAIL", name, yes ? "" : JSON.stringify(data));
};

const cases = [
  ["D12", "2026-01-15", "2026-01-15", "2026-03-16", "ok", "2026-03-16"],
  ["D13", "2026-01-15", "2026-01-15", "2026-03-17", "fails", "2026-03-16"],
  ["D14", "2026-01-31", "2026-01-31", "2026-03-31", "ok", "2026-03-31"],
  ["D15", "2026-01-31", "2026-02-01", "2026-03-31", "ok", "2026-03-31"],
  ["D16", "2026-01-31", "2026-02-01", "2026-04-01", "fails", "2026-03-31"],
  ["D17", "2028-02-29", "2028-02-29", "2028-04-29", "ok", "2028-04-29"],
  ["D18", "2028-02-29", "2028-02-29", "2028-04-30", "fails", "2028-04-29"],
];
for (const [id, start, disc, resume, exp, dl] of cases) {
  const r = E.checkResume({ testStart: start, firstDiscontinued: disc, plannedResume: resume });
  check(id + " reason " + exp, r.reason === exp, r);
  check(id + " deadline " + dl, r.deadline === dl, r.deadline);
}
check("D19 creditDeadline 2027-01-15 → 2027-03-16", E.creditDeadline("2027-01-15") === "2027-03-16", E.creditDeadline("2027-01-15"));
check("D20 resumeWithCreditDeadline May10 → Jul9", E.resumeWithCreditDeadline("2026-05-10", "2026-05-10") === "2026-07-09", E.resumeWithCreditDeadline("2026-05-10", "2026-05-10"));
check("NOD/LOD same helper", E.resumeWithCreditDeadline("2026-05-10", "2026-05-10") === E.resumeWithCreditDeadline("2026-05-10", "2026-05-10"));
// Month-end / leap extras
check("Jan31 +60 = Apr1", E.creditDeadline("2026-01-31") === "2026-04-01", E.creditDeadline("2026-01-31"));
check("increments Jan31 → Mar31", E.incrementsDeadline("2026-01-31") === "2026-03-31", E.incrementsDeadline("2026-01-31"));
check("earlier-of binds 60-day when before month-end", E.resumeWithCreditDeadline("2026-01-15", "2026-01-15") === "2026-03-16");
check("earlier-of binds 61.39 when before D+60", E.resumeWithCreditDeadline("2026-01-31", "2026-01-31") === "2026-03-31");

// Owned reference still 184/184
const ref = spawnSync("python3", ["reference.py"], { cwd: "/workspace/checkride-v4/tests/rc7", encoding: "utf8" });
check("owned reference 184/184", /184\/184 PASS/.test(ref.stdout || ""), (ref.stdout || "").slice(-200));

const summary = { pass, fail, results };
fs.writeFileSync(OUT + "/credit-parity.json", JSON.stringify(summary, null, 2));
console.log("RESULT", pass, fail);
process.exit(fail ? 1 : 0);
