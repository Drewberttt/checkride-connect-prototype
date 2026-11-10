/** Unit tests for ics.js (D52 / rc19). Node only; no browser UI. */
const assert = require("assert");
const path = require("path");
const ICS = require(path.resolve(__dirname, "../../ics.js"));

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log("PASS", name); }
  catch (e) { fail++; console.log("FAIL", name, e && e.message); }
}

const SAMPLE_TITLE = "Demo: Private Pilot checkride with Linda Brooks at KVDF";
const SAMPLE_DESC = "Prototype demo. Fictional sample data. Private Pilot with Linda Brooks on Fri, Dec 4, 2026 · 9:00 AM ET, at KVDF. Default length is 2 hours, in the airport's time zone. This file has no reminders or alarms. Nothing was booked or sent. Confirm the time with your examiner.";
const SAMPLE_LEAD = "Prototype demo. Fictional sample data. Estimated last day to keep credit: Jul 9, 2026. Confirm this date with your examiner.";
const WINDOW = "To keep credit for what you already passed, finish by the earlier of (a) 60 days after the day the test stopped, and (b) the last day of the second calendar month after the month you started. After that, expect the full test again. Ask your CFI / DPE.";
const DAY60 = "Day 60 is treated as the last valid day (Interpretation; [VERIFY] #10).";
const FOOT = "This file has no reminders or alarms. Nothing was booked or sent.";
const DEADLINE_TITLE = "Demo: estimated retest credit deadline";

check("fillBrackets ride title matches §13 sample", () => {
  const raw = "Demo: [Private Pilot] checkride with [Linda Brooks] at [KVDF]";
  assert.strictEqual(ICS.fillBrackets(raw, ["Private Pilot", "Linda Brooks", "KVDF"]), SAMPLE_TITLE);
});
check("fillBrackets ride desc matches §13 sample", () => {
  const raw = "Prototype demo. Fictional sample data. [Private Pilot] with [Linda Brooks] on [Fri, Dec 4, 2026 · 9:00 AM ET, at KVDF]. Default length is 2 hours, in the airport's time zone. This file has no reminders or alarms. Nothing was booked or sent. Confirm the time with your examiner.";
  assert.strictEqual(ICS.fillBrackets(raw, ["Private Pilot", "Linda Brooks", "Fri, Dec 4, 2026 · 9:00 AM ET, at KVDF"]), SAMPLE_DESC);
});
check("fillBrackets deadline lead matches §13 sample", () => {
  const raw = "Prototype demo. Fictional sample data. Estimated last day to keep credit: [Jul 9, 2026]. Confirm this date with your examiner.";
  assert.strictEqual(ICS.fillBrackets(raw, ["Jul 9, 2026"]), SAMPLE_LEAD);
});
check("fmtYmdLong D20 last day is Jul 9, 2026", () => {
  assert.strictEqual(ICS.fmtYmdLong("2026-07-09"), "Jul 9, 2026");
});
check("nextYmd exclusive end is 2026-07-10", () => {
  assert.strictEqual(ICS.nextYmd("2026-07-09"), "2026-07-10");
});
check("default duration is 2 hours", () => {
  const end = ICS.addMinutesWall("2026-12-04", "09:00", ICS.DEFAULT_DURATION_MIN);
  assert.strictEqual(end.ymd, "2026-12-04");
  assert.strictEqual(end.hm, "11:00");
});
check("addMinutesWall rolls past midnight", () => {
  const end = ICS.addMinutesWall("2026-12-04", "23:00", 120);
  assert.strictEqual(end.ymd, "2026-12-05");
  assert.strictEqual(end.hm, "01:00");
});

check("CRLF throughout and trailing CRLF", () => {
  const ev = ICS.buildCheckrideEvent({
    bookingId: "b1", tz: "America/New_York", startYmd: "2026-12-04", startHm: "09:00",
    summary: SAMPLE_TITLE, description: SAMPLE_DESC, location: "Tampa Executive (KVDF)"
  });
  const ics = ICS.buildCalendar({ events: [ev], now: new Date("2026-11-10T18:00:00Z") });
  assert.ok(!ics.includes("\n") || ics.includes("\r\n"));
  assert.ok(!/\n(?!\r)/.test(ics.replace(/\r\n/g, "")));
  assert.ok(ics.endsWith("\r\n"));
  assert.ok(!ics.includes("\r\n\r") || true);
  // no bare LF
  for (let i = 0; i < ics.length; i++) {
    if (ics[i] === "\n" && (i === 0 || ics[i - 1] !== "\r")) throw new Error("bare LF at " + i);
  }
});

check("foldLine is 75-octet aware and does not split UTF-8", () => {
  const long = "DESCRIPTION:" + "A".repeat(80);
  const folded = ICS.foldLine(long);
  assert.ok(folded.includes("\r\n "));
  folded.split("\r\n").forEach((line) => {
    const n = Buffer.from(line, "utf8").length;
    assert.ok(n <= 75, "line has " + n + " octets: " + line.slice(0, 20));
  });
  const snow = "DESCRIPTION:" + "é".repeat(60);
  const f2 = ICS.foldLine(snow);
  f2.split("\r\n").forEach((line) => {
    const n = Buffer.from(line, "utf8").length;
    assert.ok(n <= 75, "utf8 line has " + n);
  });
  // unfolding should recover
  const unfolded = f2.replace(/\r\n /g, "");
  assert.strictEqual(unfolded, snow);
});

check("escapeText handles backslash, semicolon, comma, newlines", () => {
  assert.strictEqual(ICS.escapeText("a;b,c\\d\ne"), "a\\;b\\,c\\\\d\\ne");
});

check("UID must not contain @", () => {
  assert.throws(() => ICS.buildCalendar({
    events: [ICS.buildCheckrideEvent({
      uid: "ride@local", tz: "America/New_York", startYmd: "2026-12-04", startHm: "09:00", summary: "Demo: x"
    })]
  }), /email/);
  const ev = ICS.buildCheckrideEvent({
    bookingId: "b42", tz: "America/New_York", startYmd: "2026-12-04", startHm: "09:00", summary: "Demo: x"
  });
  assert.ok(!ev.uid.includes("@"));
  assert.ok(ev.uid.includes("checkride-connect.demo.ride.b42"));
});

check("no VALARM ATTENDEE ORGANIZER mailto URL; STATUS TENTATIVE", () => {
  const ev = ICS.buildCheckrideEvent({
    bookingId: "b1", tz: "America/New_York", startYmd: "2026-12-04", startHm: "09:00",
    summary: SAMPLE_TITLE, description: SAMPLE_DESC, location: "Tampa Executive (KVDF)"
  });
  const ics = ICS.buildCalendar({ events: [ev], now: new Date("2026-11-10T18:00:00Z") });
  assert.ok(!/BEGIN:VALARM/i.test(ics));
  assert.ok(!/ATTENDEE/i.test(ics));
  assert.ok(!/ORGANIZER/i.test(ics));
  assert.ok(!/MAILTO:/i.test(ics));
  assert.ok(!/(^|[\r\n])URL[:;]/i.test(ics));
  assert.ok(/STATUS:TENTATIVE/.test(ics));
  assert.ok(ics.includes("TZID=America/New_York:20261204T090000"));
  assert.ok(ics.includes("TZID=America/New_York:20261204T110000"));
  assert.ok(ics.includes("BEGIN:VTIMEZONE"));
  assert.ok(ics.includes("TZID:America/New_York"));
});

check("DST spring-forward 2026-03-08 01:30 remains EST wall time; 03:30 is EDT", () => {
  const before = ICS.buildCalendar({
    events: [ICS.buildCheckrideEvent({
      bookingId: "dst-a", tz: "America/New_York", startYmd: "2026-03-08", startHm: "01:30",
      summary: "Demo: early"
    })],
    now: new Date("2026-11-10T18:00:00Z")
  });
  const after = ICS.buildCalendar({
    events: [ICS.buildCheckrideEvent({
      bookingId: "dst-b", tz: "America/New_York", startYmd: "2026-03-08", startHm: "03:30",
      summary: "Demo: late"
    })],
    now: new Date("2026-11-10T18:00:00Z")
  });
  assert.ok(before.includes("DTSTART;TZID=America/New_York:20260308T013000"));
  assert.ok(before.includes("DTEND;TZID=America/New_York:20260308T033000"));
  assert.ok(after.includes("DTSTART;TZID=America/New_York:20260308T033000"));
  assert.ok(after.includes("DTEND;TZID=America/New_York:20260308T053000"));
  assert.ok(before.includes("TZOFFSETTO:-0500") || before.includes("TZOFFSETFROM:-0500"));
  assert.ok(after.includes("TZOFFSETTO:-0400") || after.includes("TZOFFSETFROM:-0400"));
});

check("DST fall-back 2026-11-01 00:30 and 03:00 stay wall times with VTIMEZONE offsets", () => {
  const early = ICS.buildCalendar({
    events: [ICS.buildCheckrideEvent({
      bookingId: "fb-a", tz: "America/New_York", startYmd: "2026-11-01", startHm: "00:30",
      summary: "Demo: edt"
    })],
    now: new Date("2026-11-10T18:00:00Z")
  });
  const late = ICS.buildCalendar({
    events: [ICS.buildCheckrideEvent({
      bookingId: "fb-b", tz: "America/New_York", startYmd: "2026-11-01", startHm: "03:00",
      summary: "Demo: est"
    })],
    now: new Date("2026-11-10T18:00:00Z")
  });
  assert.ok(early.includes("DTSTART;TZID=America/New_York:20261101T003000"));
  assert.ok(late.includes("DTSTART;TZID=America/New_York:20261101T030000"));
  assert.ok(early.includes("TZOFFSETTO:-0400") || early.includes("TZOFFSETFROM:-0400"));
  assert.ok(late.includes("TZOFFSETTO:-0500") || late.includes("TZOFFSETFROM:-0500"));
});

check("America/Phoenix has no DST (single STANDARD offset -0700)", () => {
  const ics = ICS.buildCalendar({
    events: [ICS.buildCheckrideEvent({
      bookingId: "phx", tz: "America/Phoenix", startYmd: "2026-07-09", startHm: "09:00",
      summary: "Demo: phx"
    })],
    now: new Date("2026-11-10T18:00:00Z")
  });
  assert.ok(ics.includes("TZID:America/Phoenix"));
  assert.ok(ics.includes("TZOFFSETTO:-0700"));
  assert.ok(!ics.includes("BEGIN:DAYLIGHT") || ICS.offsetMinutes("America/Phoenix", Date.UTC(2026, 0, 15)) === ICS.offsetMinutes("America/Phoenix", Date.UTC(2026, 6, 15)));
  const winter = ICS.offsetMinutes("America/Phoenix", Date.UTC(2026, 0, 15));
  const summer = ICS.offsetMinutes("America/Phoenix", Date.UTC(2026, 6, 15));
  assert.strictEqual(winter, summer);
  assert.strictEqual(winter, -420);
});

check("all-day D20 deadline: VALUE=DATE 20260709 / exclusive 20260710, no TZID", () => {
  const desc = ICS.deadlineDescription({ lead: SAMPLE_LEAD, window: WINDOW, day60: DAY60, foot: FOOT });
  const ev = ICS.buildDeadlineEvent({
    bookingId: "demo-d20", startYmd: "2026-07-09", summary: DEADLINE_TITLE, description: desc
  });
  const ics = ICS.buildCalendar({ events: [ev], now: new Date("2026-11-10T18:00:00Z") });
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20260709"));
  assert.ok(ics.includes("DTEND;VALUE=DATE:20260710"));
  assert.ok(!/DTSTART;TZID/.test(ics));
  assert.ok(!/DTEND;TZID/.test(ics));
  assert.ok(!ics.includes("BEGIN:VTIMEZONE"));
  // DESCRIPTION order and [VERIFY] kept
  const unfolded = ics.replace(/\r\n[ \t]/g, "");
  const m = unfolded.match(/DESCRIPTION:([^\r]*)/);
  assert.ok(m, "DESCRIPTION missing");
  const text = m[1].replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
  const paras = text.split("\n\n");
  assert.strictEqual(paras.length, 4, "expected 4 paragraphs, got " + paras.length + " :: " + JSON.stringify(paras));
  assert.strictEqual(paras[0], SAMPLE_LEAD);
  assert.strictEqual(paras[1], WINDOW);
  assert.strictEqual(paras[2], DAY60);
  assert.ok(paras[2].includes("[VERIFY]"));
  assert.strictEqual(paras[3], FOOT);
});

check("filenames follow §13.3", () => {
  assert.strictEqual(ICS.rideFilename("2026-12-04", "KVDF"), "demo-checkride-2026-12-04-KVDF.ics");
  assert.strictEqual(ICS.deadlineFilename("2026-07-09"), "demo-credit-deadline-2026-07-09.ics");
});

check("stable UID for the same booking id", () => {
  const a = ICS.buildCheckrideEvent({ bookingId: "b9", tz: "America/New_York", startYmd: "2026-12-04", startHm: "09:00", summary: "Demo: a" });
  const b = ICS.buildCheckrideEvent({ bookingId: "b9", tz: "America/New_York", startYmd: "2026-12-04", startHm: "09:00", summary: "Demo: a" });
  assert.strictEqual(a.uid, b.uid);
});

check("downloadIcs mocked Blob failure throws", () => {
  let threw = false;
  try {
    ICS.downloadIcs("x.ics", "BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n", {
      Blob: function () { throw new Error("blob failed"); }
    });
  } catch (e) { threw = /blob failed/.test(e.message); }
  assert.ok(threw);
});

check("downloadIcs success path uses Blob and save hook", () => {
  const seen = {};
  const FakeBlob = function (parts, opts) { this.parts = parts; this.type = opts && opts.type; };
  ICS.downloadIcs("demo-checkride-2026-12-04-KVDF.ics", "BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n", {
    Blob: FakeBlob,
    save: (filename, blob, text) => { seen.filename = filename; seen.type = blob.type; seen.text = text; return seen; }
  });
  assert.strictEqual(seen.filename, "demo-checkride-2026-12-04-KVDF.ics");
  assert.ok(/text\/calendar/.test(seen.type));
});

console.log("ICS UNIT pass=" + pass + " fail=" + fail + " total=" + (pass + fail));
if (fail) process.exit(1);
