/* Checkride Connect — local .ics builder (D52 / rc19).
   Download-only. No VALARM, ATTENDEE, ORGANIZER, mailto, or URL.
   Works in the browser (window.CC_ICS) and in Node (module.exports). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CC_ICS = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CRLF = "\r\n";
  const PRODID = "-//Checkride Connect//Prototype//EN";
  const DEFAULT_DURATION_MIN = 120;

  function pad(n, w) { return String(n).padStart(w || 2, "0"); }

  function escapeText(s) {
    return String(s == null ? "" : s)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r\n|\n|\r/g, "\\n");
  }

  function foldLine(line) {
    const buf = (typeof Buffer !== "undefined")
      ? Buffer.from(line, "utf8")
      : new TextEncoder().encode(line);
    if (buf.length <= 75) return line;
    const parts = [];
    let i = 0;
    let limit = 75;
    const len = buf.length;
    const at = (idx) => (typeof Buffer !== "undefined" ? buf[idx] : buf[idx]);
    const sliceStr = (a, b) => (typeof Buffer !== "undefined"
      ? buf.slice(a, b).toString("utf8")
      : new TextDecoder().decode(buf.slice(a, b)));
    while (i < len) {
      let end = Math.min(i + limit, len);
      while (end > i && end < len && (at(end) & 0xc0) === 0x80) end--;
      if (end === i) end = Math.min(i + limit, len);
      parts.push(sliceStr(i, end));
      i = end;
      limit = 74;
    }
    return parts.map((p, idx) => (idx === 0 ? p : " " + p)).join(CRLF);
  }

  function ymdCompact(ymd) { return String(ymd).replace(/-/g, ""); }

  function hmCompact(hm) {
    const [h, m] = String(hm).split(":").map((x) => parseInt(x, 10) || 0);
    return pad(h) + pad(m) + "00";
  }

  function localDateTime(ymd, hm) { return ymdCompact(ymd) + "T" + hmCompact(hm); }

  function utcStamp(d) {
    const x = d instanceof Date ? d : new Date(d);
    return x.getUTCFullYear() + pad(x.getUTCMonth() + 1) + pad(x.getUTCDate()) + "T"
      + pad(x.getUTCHours()) + pad(x.getUTCMinutes()) + pad(x.getUTCSeconds()) + "Z";
  }

  function addMinutesWall(ymd, hm, minutes) {
    const [y, mo, d] = ymd.split("-").map(Number);
    const [hh, mm] = String(hm).split(":").map((x) => parseInt(x, 10) || 0);
    const dt = new Date(Date.UTC(y, mo - 1, d, hh, mm));
    dt.setUTCMinutes(dt.getUTCMinutes() + minutes);
    return {
      ymd: dt.getUTCFullYear() + "-" + pad(dt.getUTCMonth() + 1) + "-" + pad(dt.getUTCDate()),
      hm: pad(dt.getUTCHours()) + ":" + pad(dt.getUTCMinutes())
    };
  }

  function nextYmd(ymd) { return addMinutesWall(ymd, "00:00", 24 * 60).ymd; }

  function fmtYmdLong(ymd) {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", timeZone: "UTC"
    });
  }

  function fillBrackets(template, values) {
    let i = 0;
    return String(template).replace(/\[[^\]]+\]/g, () => {
      if (i >= values.length) throw new Error("fillBrackets: not enough values for " + template);
      return values[i++];
    });
  }

  function offsetMinutes(tz, utcMs) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    const parts = dtf.formatToParts(new Date(utcMs));
    const get = (t) => +parts.find((p) => p.type === t).value;
    const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
    return Math.round((asUTC - utcMs) / 60000);
  }

  function tzShortName(tz, utcMs) {
    try {
      const v = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
        .formatToParts(new Date(utcMs)).find((p) => p.type === "timeZoneName");
      return (v && v.value) || tz;
    } catch (e) { return tz; }
  }

  function formatOffset(mins) {
    const sign = mins >= 0 ? "+" : "-";
    const a = Math.abs(mins);
    return sign + pad(Math.floor(a / 60)) + pad(a % 60);
  }

  function localParts(tz, utcMs) {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    const parts = dtf.formatToParts(new Date(utcMs));
    const get = (t) => parts.find((p) => p.type === t).value;
    return get("year") + get("month") + get("day") + "T" + get("hour") + get("minute") + get("second");
  }

  function findTransitions(tz, startYear, endYear) {
    const start = Date.UTC(startYear, 0, 1);
    const end = Date.UTC(endYear + 1, 0, 1);
    const step = 12 * 3600e3;
    const trans = [];
    let prevOff = offsetMinutes(tz, start);
    let prevMs = start;
    for (let t = start + step; t <= end; t += step) {
      const off = offsetMinutes(tz, t);
      if (off !== prevOff) {
        let lo = prevMs, hi = t;
        while (hi - lo > 60e3) {
          const mid = lo + Math.floor((hi - lo) / 2);
          if (offsetMinutes(tz, mid) === prevOff) lo = mid; else hi = mid;
        }
        trans.push({ utc: hi, from: prevOff, to: off, name: tzShortName(tz, hi) });
        prevOff = off;
      }
      prevMs = t;
    }
    return trans;
  }

  function buildVTimezone(tz, aroundYear) {
    const y0 = (aroundYear || new Date().getUTCFullYear()) - 1;
    const y1 = y0 + 3;
    const trans = findTransitions(tz, y0, y1);
    const lines = ["BEGIN:VTIMEZONE", "TZID:" + tz];
    if (!trans.length) {
      const mid = Date.UTC(aroundYear || y0, 6, 1);
      const off = offsetMinutes(tz, mid);
      const name = tzShortName(tz, mid);
      lines.push("BEGIN:STANDARD");
      lines.push("TZOFFSETFROM:" + formatOffset(off));
      lines.push("TZOFFSETTO:" + formatOffset(off));
      lines.push("TZNAME:" + name);
      lines.push("DTSTART:" + y0 + "0101T000000");
      lines.push("END:STANDARD");
    } else {
      // Emit one STANDARD and one DAYLIGHT from the latest distinct offsets,
      // plus dated observations so a calendar can resolve the event year.
      trans.forEach((tr) => {
        const kind = tr.to > tr.from ? "DAYLIGHT" : "STANDARD";
        lines.push("BEGIN:" + kind);
        lines.push("TZOFFSETFROM:" + formatOffset(tr.from));
        lines.push("TZOFFSETTO:" + formatOffset(tr.to));
        lines.push("TZNAME:" + tr.name);
        lines.push("DTSTART:" + localParts(tz, tr.utc));
        lines.push("END:" + kind);
      });
    }
    lines.push("END:VTIMEZONE");
    return lines;
  }

  function assertNoForbidden(ics) {
    const up = ics.toUpperCase();
    if (up.includes("BEGIN:VALARM")) throw new Error("VALARM is forbidden (D52)");
    if (up.includes("ATTENDEE")) throw new Error("ATTENDEE is forbidden (D52)");
    if (up.includes("ORGANIZER")) throw new Error("ORGANIZER is forbidden (D52)");
    if (/MAILTO:/i.test(ics)) throw new Error("mailto is forbidden (D52)");
    if (/(^|[\r\n])URL[:;]/i.test(ics)) throw new Error("URL is forbidden (D52)");
  }

  function assertUidSafe(uid) {
    if (!uid) throw new Error("UID required");
    if (uid.includes("@")) throw new Error("UID must not look like an email");
  }

  function eventLines(ev, stamp) {
    const lines = ["BEGIN:VEVENT"];
    lines.push("UID:" + ev.uid);
    lines.push("DTSTAMP:" + stamp);
    if (ev.allDay) {
      lines.push("DTSTART;VALUE=DATE:" + ymdCompact(ev.startYmd));
      lines.push("DTEND;VALUE=DATE:" + ymdCompact(ev.endYmd || nextYmd(ev.startYmd)));
    } else {
      if (!ev.tz) throw new Error("timed event requires tz");
      lines.push("DTSTART;TZID=" + ev.tz + ":" + localDateTime(ev.startYmd, ev.startHm));
      const end = ev.endYmd ? { ymd: ev.endYmd, hm: ev.endHm } : addMinutesWall(ev.startYmd, ev.startHm, ev.durationMinutes || DEFAULT_DURATION_MIN);
      lines.push("DTEND;TZID=" + ev.tz + ":" + localDateTime(end.ymd, end.hm));
    }
    lines.push("SUMMARY:" + escapeText(ev.summary));
    if (ev.description) lines.push("DESCRIPTION:" + escapeText(ev.description));
    if (ev.location) lines.push("LOCATION:" + escapeText(ev.location));
    if (ev.status) lines.push("STATUS:" + ev.status);
    lines.push("END:VEVENT");
    return lines;
  }

  function buildCalendar(opts) {
    const events = (opts && opts.events) || [];
    if (!events.length) throw new Error("at least one event is required");
    events.forEach((e) => assertUidSafe(e.uid));
    const stamp = utcStamp((opts && opts.now) || new Date());
    const year = events[0].startYmd ? +events[0].startYmd.slice(0, 4) : new Date().getUTCFullYear();
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:" + (opts.prodId || PRODID),
      "CALSCALE:GREGORIAN"
    ];
    const zones = [];
    events.forEach((e) => {
      if (!e.allDay && e.tz && zones.indexOf(e.tz) < 0) zones.push(e.tz);
    });
    zones.forEach((tz) => { lines.push.apply(lines, buildVTimezone(tz, year)); });
    events.forEach((e) => { lines.push.apply(lines, eventLines(e, stamp)); });
    lines.push("END:VCALENDAR");
    const ics = lines.map(foldLine).join(CRLF) + CRLF;
    assertNoForbidden(ics);
    return ics;
  }

  function buildCheckrideEvent(o) {
    const duration = o.durationMinutes || DEFAULT_DURATION_MIN;
    return {
      uid: o.uid || ("checkride-connect.demo.ride." + (o.bookingId || "unknown")),
      tz: o.tz,
      startYmd: o.startYmd,
      startHm: o.startHm,
      durationMinutes: duration,
      summary: o.summary,
      description: o.description,
      location: o.location || o.airport,
      status: o.status || "TENTATIVE"
    };
  }

  function buildDeadlineEvent(o) {
    return {
      uid: o.uid || ("checkride-connect.demo.credit." + (o.bookingId || o.startYmd)),
      allDay: true,
      startYmd: o.startYmd,
      endYmd: o.endYmd || nextYmd(o.startYmd),
      summary: o.summary,
      description: o.description,
      status: o.status || "TENTATIVE"
    };
  }

  function rideFilename(ymd, icao) {
    return "demo-checkride-" + ymd + "-" + icao + ".ics";
  }
  function deadlineFilename(ymd) {
    return "demo-credit-deadline-" + ymd + ".ics";
  }

  function deadlineDescription(parts) {
    // parts: { lead, window, day60, foot } — each a paragraph, blank line between
    return [parts.lead, parts.window, parts.day60, parts.foot].join("\n\n");
  }

  function downloadIcs(filename, text, opts) {
    const BlobImpl = (opts && opts.Blob) || (typeof Blob !== "undefined" ? Blob : null);
    if (!BlobImpl) throw new Error("Blob is not available");
    const blob = new BlobImpl([text], { type: "text/calendar;charset=utf-8" });
    if (opts && typeof opts.save === "function") return opts.save(filename, blob, text);
    const UrlImpl = (opts && opts.URL) || (typeof URL !== "undefined" ? URL : null);
    if (!UrlImpl || typeof UrlImpl.createObjectURL !== "function") throw new Error("URL.createObjectURL is not available");
    const url = UrlImpl.createObjectURL(blob);
    try {
      const doc = (opts && opts.document) || (typeof document !== "undefined" ? document : null);
      if (!doc) throw new Error("document is not available");
      const a = doc.createElement("a");
      a.download = filename;
      a.href = url;
      a.rel = "noopener";
      doc.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      // Revoke after a turn so the browser can start the download from the blob URL.
      if (typeof UrlImpl.revokeObjectURL === "function") {
        setTimeout(() => UrlImpl.revokeObjectURL(url), 2000);
      }
    }
    return { filename, text };
  }

  return {
    CRLF, PRODID, DEFAULT_DURATION_MIN,
    escapeText, foldLine, fillBrackets, fmtYmdLong, addMinutesWall, nextYmd,
    ymdCompact, localDateTime, utcStamp, formatOffset, offsetMinutes,
    buildVTimezone, buildCalendar, buildCheckrideEvent, buildDeadlineEvent,
    rideFilename, deadlineFilename, deadlineDescription, downloadIcs,
    assertNoForbidden, assertUidSafe
  };
});
