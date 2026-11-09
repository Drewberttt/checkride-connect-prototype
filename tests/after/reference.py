# rc7/after-checkride owned mirror of Data Collector canonical eligibility_clock_reference.py
# Canonical path: /workspace/checkride-pm/tools/eligibility_clock_reference.py
# Canonical SHA256: c97a28692d963817288a814ea31db6cb10208fdbcf2d61ede6d77613e2d6cce2
# Refreshed: 2026-11-09 (America/New_York). Do not edit PM tools/; mirror only.
# Self-test expectation: 184/184 (includes D12–D20 §6A credit window).
#
"""Reference implementation of /workspace/checkride-pm/eligibility-rules.md (v2.1, "warn, never block").

Every check returns a Result with status ok | warn | needs-check. Nothing returns "blocked":
per product decision #18 the eligibility clock never hard-blocks a booking.
  - status "warn",  reason "fails"   -> rule appears not met: clear warning, student must tick
                                        "my CFI has reviewed this", flag shown on the DPE view.
  - status "warn",  reason "at-risk" -> rule met but the deadline is close (decisions #8, #16):
                                        heads-up only, no tick, no DPE flag.
  - status "needs-check"             -> app cannot decide (missing data, exemption claimed,
                                        interpretation, instructor/examiner judgement): shown on
                                        DPE view as "to verify". NO tick; instead a "confirm with your
                                        CFI" note (CFI_NOTE). Decided by Marlo (PM) 2026-10-29, v2.1.
  - status "ok"
Date-only (no times, no time zones). A planned checkride may be an exact date or a month only
(decision #9): pass date(...) or the string "YYYY-MM".
Run: python3 eligibility_clock_reference.py  -> prints the test-case table and a PASS count.
"""
from dataclasses import dataclass
from datetime import date, timedelta
import calendar
import re
from decimal import Decimal

OK, WARN, CHECK = "ok", "warn", "needs-check"
AT_RISK_DAYS = {"knowledge_test": 90, "endorsement": 21, "medical": 60, "interrupted": 14}  # #8, #16

# ---------------------------------------------------------------- calendar helpers
def month_index(d): return d.year * 12 + (d.month - 1)

def _mi_to_ym(m):
    y, mo = divmod(m, 12); return y, mo + 1

def first_of_month_index(m):
    y, mo = _mi_to_ym(m); return date(y, mo, 1)

def end_of_month_index(m):
    y, mo = _mi_to_ym(m); return date(y, mo, calendar.monthrange(y, mo)[1])

def end_of_month_after(d, n): return end_of_month_index(month_index(d) + n)
def start_of_month_before(d, n): return first_of_month_index(month_index(d) - n)

def same_day_months_before(d, n):
    """Strict day-anchored reading: the same day-of-month n months earlier (clamped)."""
    y, mo = _mi_to_ym(month_index(d) - n)
    return date(y, mo, min(d.day, calendar.monthrange(y, mo)[1]))

def age_on(birth, on):
    years = on.year - birth.year
    bm, bd = birth.month, birth.day
    if bm == 2 and bd == 29 and not calendar.isleap(on.year): bd = 28
    if (on.month, on.day) < (bm, bd): years -= 1
    return years

class Planned:
    """Exact date, or month only ("YYYY-MM")."""
    def __init__(self, v):
        if isinstance(v, Planned): self.__dict__ = dict(v.__dict__); return
        if isinstance(v, date): self.exact, self.first, self.last = v, v, v
        else:
            y, m = map(int, v.split("-")); self.exact = None
            self.first = date(y, m, 1); self.last = date(y, m, calendar.monthrange(y, m)[1])
        self.mi = month_index(self.first)
    def __str__(self): return str(self.exact) if self.exact else self.first.strftime("%B %Y")

def position(deadline, planned):
    """'in' if every possible day of planned <= deadline, 'out' if none, else 'partial'."""
    p = Planned(planned)
    if p.last <= deadline: return "in"
    if p.first > deadline: return "out"
    return "partial"

CFI_NOTE = "Confirm this with your CFI."

@dataclass
class Result:
    rule: str
    status: str
    reason: str
    message: str
    deadline: date = None
    cite: str = ""
    @property
    def cfi_ack_required(self): return self.status == WARN and self.reason == "fails"
    @property
    def cfi_note(self):
        """v2.1 (Marlo, 2026-10-29): needs-check gets a 'confirm with your CFI' note, never the tick."""
        return CFI_NOTE if self.status == CHECK else None
    @property
    def dpe_flag(self): return self.status == CHECK or self.cfi_ack_required
    def __str__(self): return f"{self.status}/{self.reason}" + (f" dl={self.deadline}" if self.deadline else "")

def _deadline_result(rule, cite, deadline, planned, today, risk_key, ok_msg, fail_msg, partial_msg):
    pos = position(deadline, planned)
    if pos == "out":
        return Result(rule, WARN, "fails", fail_msg, deadline, cite)
    if pos == "partial":
        return Result(rule, CHECK, "month-only", partial_msg, deadline, cite)
    if today is not None and 0 <= (deadline - today).days <= AT_RISK_DAYS[risk_key]:
        return Result(rule, WARN, "at-risk",
                      f"Heads-up: {(deadline - today).days} days left. " + ok_msg, deadline, cite)
    return Result(rule, OK, "ok", ok_msg, deadline, cite)

# ---------------------------------------------------------------- Rule 1: knowledge test
def kt_expiry(kt_date, window_months=24): return end_of_month_after(kt_date, window_months)

def check_knowledge_test(kt_date, planned_completion, window_months=24, required=True,
                         exemption_claimed=None, today=None):
    cite = "14 CFR 61.39(a)(1)" + ("(ii)" if window_months == 60 else "(i)")
    if not required:
        return Result("knowledge_test", OK, "not-applicable", "No knowledge test is needed for this checkride.", None, cite)
    if kt_date is None:
        return Result("knowledge_test", CHECK, "missing",
                      "Add the test date from your knowledge test report so we can check it.", None, cite)
    dl = kt_expiry(kt_date, window_months)
    if position(dl, planned_completion) == "out" and exemption_claimed:
        return Result("knowledge_test", CHECK, "exemption-claimed",
                      f"Your knowledge test report covers checkrides completed by {dl}. You've said an exception "
                      f"applies ({exemption_claimed}). Bring the supporting documents; your examiner decides.", dl,
                      cite + "; " + exemption_claimed)
    return _deadline_result("knowledge_test", cite, dl, planned_completion, today, "knowledge_test",
        ok_msg=f"Your knowledge test is good for a checkride completed by {dl}.",
        fail_msg=(f"Your knowledge test report covers a checkride completed by {dl}. Your checkride is planned "
                  f"for {Planned(planned_completion)}, so you'd likely need to retake the knowledge test unless an "
                  f"exception applies (§61.39(b)/(c), §61.40). If any part of the test slips past {dl}, the same "
                  f"applies. Ask your CFI to review this."),
        partial_msg=f"Your knowledge test covers a checkride completed by {dl}. Pick an exact date to confirm.")

# ---------------------------------------------------------------- Rule 2: 61.39(a)(6) endorsement
def endorsement_last_application_day(training_date): return end_of_month_after(training_date, 2)

def check_endorsement(training_date, planned_application, exempt_61_39_f=False, today=None,
                      resumed_on=None):
    cite = "14 CFR 61.39(a)(6)"
    if exempt_61_39_f:
        return Result("endorsement", OK, "exempt", "This endorsement isn't required for this checkride (§61.39(f)).", None, cite + ", (f)")
    if training_date is None:
        return Result("endorsement", CHECK, "missing",
                      "Your CFI's endorsement isn't recorded yet. It must show training within the 2 calendar months "
                      "before the month you apply.", None, cite)
    p = Planned(planned_application)
    if p.exact and training_date > p.exact:
        return Result("endorsement", CHECK, "order",
                      "The endorsement date is after your planned application date. Check both dates.", None, cite)
    dl = endorsement_last_application_day(training_date)
    if resumed_on is not None and resumed_on > dl and position(dl, planned_application) != "out":
        return Result("endorsement", CHECK, "interpretation",
                      f"Your endorsement covered your original application (through {dl}). You're resuming on "
                      f"{resumed_on}. The FAA guidance doesn't settle whether a new endorsement is needed; confirm with "
                      f"your examiner and CFI.", dl, cite + "; AC 61-65K §14.3")
    return _deadline_result("endorsement", cite, dl, planned_application, today, "endorsement",
        ok_msg=f"Your CFI's endorsement covers an application made by {dl}.",
        fail_msg=(f"Your CFI's endorsement covers an application made by {dl}, but you plan to apply in "
                  f"{Planned(planned_application)}. You'd likely need more training and a new endorsement "
                  f"(§61.39(a)(6)). Ask your CFI to review this."),
        partial_msg=f"Your CFI's endorsement covers an application made by {dl}. Pick an exact date to confirm.")

# ---------------------------------------------------------------- Rule 5 (new): 3-hour practical-test prep
# key -> (amount, unit, anchor, cite). anchor: "test-month" or "test-date" (instrument wording).
PREP_RULES = {
 "private-asel": (3, "hours", "test-month", "61.109(a)(4)"),
 "private-amel": (3, "hours", "test-month", "61.109(b)(4)"),
 "private-helicopter": (3, "hours", "test-month", "61.109(c)(3)"),
 "private-gyroplane": (3, "hours", "test-month", "61.109(d)(3)"),
 "private-powered-lift": (3, "hours", "test-month", "61.109(e)(4)"),
 "private-glider": (3, "flights", "test-month", "61.109(f)(1)(i)"),
 "private-glider-40h": (3, "flights", "test-month", "61.109(f)(2)(ii)"),
 "private-airship": (3, "hours", "test-month", "61.109(g)(3)"),
 "private-gas-balloon": (1, "flights", "test-month", "61.109(h)(1)(i)"),
 "private-hot-air-balloon": (2, "flights", "test-month", "61.109(h)(2)(i)"),   # 1 h each
 "private-powered-parachute": (3, "hours", "test-month", "61.109(i)(3)"),
 "private-weight-shift": (3, "hours", "test-month", "61.109(j)(3)"),
 "commercial-asel": (3, "hours", "test-month", "61.129(a)(3)(v)"),
 "commercial-amel": (3, "hours", "test-month", "61.129(b)(3)(v)"),
 "commercial-helicopter": (3, "hours", "test-month", "61.129(c)(3)(iv)"),
 "commercial-gyroplane": (3, "hours", "test-month", "61.129(d)(3)(iv)"),
 "commercial-powered-lift": (3, "hours", "test-month", "61.129(e)(3)(iv)"),
 "commercial-glider": (3, "flights", "test-month", "61.129(f)(1)(i) / (f)(2)(i)"),
 "commercial-airship": (3, "hours", "test-month", "61.129(g)(4)(i)"),
 "commercial-gas-balloon": (2, "flights", "test-month", "61.129(h)(4)(i)(A)"),   # 2 h each
 "commercial-hot-air-balloon": (2, "flights", "test-month", "61.129(h)(4)(ii)(A)"),  # 1 h each
 "recreational": (3, "hours", "test-month", "61.99(a)(1)(ii)"),
 "sport-airplane": (2, "hours", "test-month", "61.313(a)(1)(iv)"),
 "sport-glider": (3, "flights", "test-month", "61.313(a)(2)(ii) / (a)(3)(ii)"),
 "sport-gyroplane": (2, "hours", "test-month", "61.313(a)(4)(iv)"),
 "sport-airship": (2, "hours", "test-month", "61.313(a)(5)(iv)"),
 "sport-balloon": (1, "hours", "test-month", "61.313(a)(6)(ii)"),
 "sport-powered-parachute": (1, "hours", "test-month", "61.313(a)(7)(v)"),
 "sport-weight-shift": (2, "hours", "test-month", "61.313(a)(8)(iv)"),
 "sport-helicopter": (2, "hours", "test-month", "61.313(a)(9)(iv)"),
 "instrument-airplane": (3, "hours", "test-date", "61.65(d)(2)(i)"),
 "instrument-helicopter": (3, "hours", "test-date", "61.65(e)(2)(i)"),
 "instrument-powered-lift": (3, "hours", "test-date", "61.65(f)(2)(i)"),
}
NO_PREP_RULE = {"cfi", "cfi-instrument", "cfi-sport", "atp", "type-rating"}

_HOURS_TEXT = re.compile(r"(?:\d+(?:\.\d{1,2})?|\.\d{1,2})", re.ASCII)   # digits, optional '.', 1-2 fractional digits

def hours_value(h):
    """v2.5 (QA-099 D44) prep-hour validator. Returns the exact Decimal value, or None if invalid (never raises).
    Order: bool rejected first; str/Decimal validated as TEXT before any float coercion; then 0.1 <= v <= 24.
    - str: surrounding whitespace trimmed; then must match digits[.d or .dd] or .d/.dd. Trailing zeros count
      toward the 2-digit cap ('1.00' ok, '1.000' invalid). Rejected: sign ('+1', '-1'), exponent ('3e0', '1E-1'),
      trailing dot ('3.'), comma, internal spaces, '', 'nan', 'inf'. So '2.9999999999999999' is invalid (not 3).
    - Decimal: validated on str(d) by the same text rule.
    - int (non-bool): exact.
    - float: already coerced by the caller; precision is judged on its shortest round-trip repr. A literal
      2.9999999999999999 is the float 3.0 before this function runs and CANNOT be told apart from 3.0 here.
    - anything else (None, list, ...): invalid.
    This is product data validation, not a CFR requirement."""
    if isinstance(h, bool): return None
    if isinstance(h, int): d = Decimal(h)
    elif isinstance(h, float):
        if h != h or h in (float("inf"), float("-inf")): return None
        d = Decimal(repr(h))
        if d.as_tuple().exponent < -2: return None
    elif isinstance(h, (str, Decimal)):
        t = str(h).strip(" \t\n\r")
        if not _HOURS_TEXT.fullmatch(t): return None
        d = Decimal(t)
    else: return None
    return d if Decimal("0.1") <= d <= 24 else None

def _sum(entries, start, end, unit):
    # entries: list of (date, hours, qualifies) ; qualifies = with authorized instructor, in the
    # right aircraft (not a simulator), logged as practical-test prep. Flights unit: count entries.
    # rc6 (aligned with checkride-v4-rc6/tests/rc6/reference.py): entries outside 0.1 <= h <= 24 (or not a
    # number) are not counted. This is a product data-validation rule, NOT a CFR minimum. Hours are summed as
    # exact decimals (Decimal(str(h))), unrounded, so 1.1+1.9 == 3 and 2.996 / 2.9999999 stay short of 3 h.
    # v2.5 (QA-099 D44): hours accept at most 2 fractional digits; see hours_value() below.
    def hours_ok(h): return hours_value(h) is not None
    # v2.4 (Marlo): a boolean in the hours field is a malformed entry in BOTH units (not counted as a flight either).
    sel = [e for e in entries if not isinstance(e[1], bool) and e[2] and start <= e[0] <= end and (unit == "flights" or hours_ok(e[1]))]
    return len(sel) if unit == "flights" else float(sum((hours_value(e[1]) for e in sel), Decimal(0)))

def check_prep_training(rating, entries, test_start, test_end=None, pathway="part61",
                        graduation_date=None, added_class=False, balloon_to_airship=False):
    """test_start/test_end: exact dates or 'YYYY-MM'. entries=None means not entered."""
    if rating in NO_PREP_RULE:
        return Result("prep_3h", OK, "not-applicable",
                      "No timed practical-test prep requirement for this certificate. Your CFI's endorsement covers readiness.",
                      None, "61.183(g), 61.157, 61.405 (endorsement only)")
    amount, unit, anchor, cite = PREP_RULES[rating]
    cite = "14 CFR " + cite
    if added_class and not balloon_to_airship:
        return Result("prep_3h", OK, "exempt",
                      "Not required when adding a class rating (§61.63(c)(3)).", None, cite + "; 61.63(c)(3)")
    s, e = Planned(test_start), Planned(test_end or test_start)
    if entries is not None and len(entries) == 0:   # rc5 (QA U21): an empty list is "missing" (ER §5.6 L395)
        entries = None
    if pathway == "part141" and graduation_date is not None:
        grad_dl = graduation_date + timedelta(days=60)
        if position(grad_dl, e) == "in":
            if entries is not None and s.exact:
                got = _sum(entries, s.exact - timedelta(days=60), s.exact, unit)
                if got >= amount:
                    return Result("prep_3h", OK, "part141-graduate",
                        f"Part 141 graduate testing by {grad_dl} (§61.71(a)); {got} of {amount} {unit} of prep in the 60 days before the test.",
                        grad_dl, "14 CFR 61.71(a); Part 141 App. B/D 4(b)")
            return Result("prep_3h", CHECK, "part141-graduate",
                f"As a Part 141 graduate testing by {grad_dl}, the Part 61 hour rules are treated as met (§61.71(a)). "
                f"Your school's course requires the prep training within 60 days before the test date; confirm with your school.",
                grad_dl, "14 CFR 61.71(a); Part 141 App. B/D 4(b)")
        # after 60 days the Part 61 rules apply; fall through
    if entries is None:
        return Result("prep_3h", CHECK, "missing",
                      f"Log {amount} {unit} of practical-test prep with your instructor in your test month or the 2 calendar months before it.",
                      None, cite)
    def window_ok(p):
        if p.exact is None:      # month only: count everything logged in months M-2..M (to date not knowable)
            got = _sum(entries, first_of_month_index(p.mi - 2), p.last, unit)
        else:
            got = _sum(entries, start_of_month_before(p.exact, 2), p.exact, unit)
        return got, got >= amount
    got_s, ok_s = window_ok(s)
    win_start = first_of_month_index(s.mi - 2)
    if not ok_s:
        return Result("prep_3h", WARN, "fails",
            f"You've logged {got_s} of {amount} {unit} of practical-test prep with your instructor since {win_start}. "
            + ("The rule (" + cite.replace("14 CFR ", "§") + ") needs them within 2 calendar months before your test date. " if anchor == "test-date"
               else "The rule (" + cite.replace("14 CFR ", "§") + ") needs them in your test month or the 2 calendar months before it. ")
            + "Ask your CFI to review this.", None, cite)
    if e.mi != s.mi:   # test spans a month boundary
        got_e, ok_e = window_ok(e)
        if not ok_e:
            return Result("prep_3h", CHECK, "spans-months",
                f"Your test starts in {s.first.strftime('%B')} and may finish in {e.first.strftime('%B')}. Counting from the "
                f"finish month you'd have {got_e} of {amount} {unit}. The rule doesn't say which month counts; confirm with your examiner.",
                None, cite)
    if anchor == "test-date" and s.exact is not None:
        strict = _sum(entries, same_day_months_before(s.exact, 2), s.exact, unit)
        if strict < amount:
            return Result("prep_3h", CHECK, "interpretation",
                f"You have {got_s} {unit} counting whole calendar months, but only {strict} counting from "
                f"{same_day_months_before(s.exact, 2)} (2 months before the test date). The instrument rule says "
                f"'within 2 calendar months before the date of the practical test'; confirm with your CFI.", None, cite)
    if s.exact is None:
        return Result("prep_3h", OK, "ok",
                      f"{got_s} of {amount} {unit} of prep logged in the window for {s}. Prep after the test date won't count.", None, cite)
    return Result("prep_3h", OK, "ok", f"{got_s} of {amount} {unit} of practical-test prep logged in the window.", None, cite)

# ---------------------------------------------------------------- Rule 3: discontinuance / partial test
def increments_deadline(test_start): return end_of_month_after(test_start, 2)          # 61.39(g)/(h)
def credit_deadline(first_discontinued): return first_discontinued + timedelta(days=60)  # 61.43(f)(1)
def resume_with_credit_deadline(test_start, first_discontinued):
    return min(increments_deadline(test_start), credit_deadline(first_discontinued))

def check_resume(test_start, first_discontinued, planned_resume, today=None):
    dl = resume_with_credit_deadline(test_start, first_discontinued)
    which = "§61.39(g)" if dl == increments_deadline(test_start) else "§61.43(f)(1) 60-day"
    return _deadline_result("resume_credit", "14 CFR 61.39(g)/(h), 61.43(f)(1)", dl, planned_resume, today, "interrupted",
        ok_msg=f"Finish the rest of your checkride by {dl} to keep credit for what you passed ({which} limit).",
        fail_msg=(f"Credit for the areas you passed ends {dl} ({which} limit). A checkride after that is likely the "
                  f"full test again. Check your knowledge test, endorsements and medical for a new test too. "
                  f"Ask your CFI to review this."),
        partial_msg=f"Credit for passed areas ends {dl}. Pick an exact date on or before it.")

# ---------------------------------------------------------------- Rule 6 (new): 61.49 retest
def check_retest(failure_date, retest_endorsement_date, planned_application, endorser_gave_training=None,
                 has_8710_recommendation=None, cfi_spin_failure=False, spin_certified_aircraft=None):
    cite = "14 CFR 61.49"
    if retest_endorsement_date is None:
        return Result("retest_61_49", WARN, "fails",
            "After a failed test you need more training and a new endorsement from the instructor who gave it "
            "before you reapply (§61.49). Ask your CFI to review this.", None, cite)
    if retest_endorsement_date < failure_date:
        return Result("retest_61_49", WARN, "fails",
            f"Your retest endorsement ({retest_endorsement_date}) is dated before the failed test ({failure_date}). "
            f"§61.49 needs one given after the additional training. Ask your CFI to review this.", None, cite)
    p = Planned(planned_application)
    # D42 (Mon Nov 2, 2026): the doc wins. Endorsement <= reapplication on every plan; a month-only plan uses the month's last day.
    if retest_endorsement_date > p.last:
        return Result("retest_61_49", WARN, "fails",
            "Your retest endorsement is dated after your planned application. You can reapply only after receiving it (§61.49(a)). "
            "Ask your CFI to review this.", None, cite)
    if cfi_spin_failure and spin_certified_aircraft is False:
        return Result("retest_61_49", WARN, "fails",
            "For this retest you\u2019ll likely need to bring an aircraft certificated for spins and demonstrate spin instruction (§61.49(b)). "
            "Ask your CFI to review this.",  # D42: softer doc wording + doc §0 ending
            None, cite + "(b)")
    unknowns = []
    if endorser_gave_training is None: unknowns.append("the endorsing instructor gave you the additional training")
    if has_8710_recommendation is None: unknowns.append("your application has a new instructor recommendation")
    if cfi_spin_failure and spin_certified_aircraft is None: unknowns.append("your aircraft is certificated for spins (§61.49(b))")
    if endorser_gave_training is False:
        return Result("retest_61_49", WARN, "fails",
            "§61.49(a)(2) needs the endorsement from the instructor who gave you the additional training. Ask your CFI to review this.",
            None, cite + "(a)(2)")
    if has_8710_recommendation is False:
        return Result("retest_61_49", WARN, "fails",
            "Each retake likely needs a new instructor recommendation on your application (AC 61-65K §14.2). Ask your CFI to review this.", None,  # D42
            cite + "; AC 61-65K §14.2")
    if unknowns:
        return Result("retest_61_49", CHECK, "confirm", "Please confirm: " + "; ".join(unknowns) + ".", None, cite)
    return Result("retest_61_49", OK, "ok", "Retest endorsement recorded after your failed test.", None, cite)

# ---------------------------------------------------------------- Rule 4: medical (decisions #13, #20)
def medical_months(cls, age_at_exam, op):           # REFERENCE / helper text only (not shown as a date)
    if op == "practical_test": op = "private"
    if op == "atp_pic":
        if cls != 1: return None
        return 12 if age_at_exam < 40 else 6
    if op == "commercial": return 12 if cls in (1, 2) else None
    if op == "private": return 60 if age_at_exam < 40 else 24
    raise ValueError(op)
def medical_expiry(exam_date, birth, cls, op):
    n = medical_months(cls, age_on(birth, exam_date), op)
    return None if n is None else end_of_month_after(exam_date, n)
def basicmed_valid(course_date, cmec_date, on):     # REFERENCE only
    return on <= end_of_month_after(course_date, 24) and on <= end_of_month_after(cmec_date, 48)

def check_medical(med_type, entered_expiry, planned, aircraft="airplane", sport_test=False, today=None):
    """med_type: '1','2','3','basicmed','dl' or None. entered_expiry: the student's own date (optional)."""
    cite = "14 CFR 61.23"
    if aircraft in ("glider", "balloon", "ffs", "ftd"):
        return Result("medical", OK, "not-applicable", "No medical is needed for a practical test in this aircraft or device (§61.23(b)(10)).", None, cite + "(b)(10)")
    if med_type is None:
        return Result("medical", CHECK, "missing", "Choose your medical type: FAA class 1, 2 or 3, BasicMed, or U.S. driver's license (Sport only).", None, cite)
    if med_type == "dl" and not sport_test:
        return Result("medical", WARN, "fails",
            "A U.S. driver's license only works for Sport pilot checkrides in eligible aircraft. This checkride needs at least a "
            "third-class medical or BasicMed (§61.23(a)(3)(iii)). Ask your CFI to review this.", None, cite + "(a)(3), (c)")
    helper = {"basicmed": " BasicMed checkrides must stay within the §61.113(i) aircraft and flight limits.",
              "dl": " Follow any restrictions on your license (§61.23(c)(2)).", "1": "", "2": "", "3": ""}[med_type]
    if entered_expiry is None:
        return Result("medical", CHECK, "missing",
                      "Add your medical's expiry date if you'd like a reminder 60 days before." + helper, None, cite)
    r = _deadline_result("medical", cite, entered_expiry, planned, today, "medical",
        ok_msg=f"Your medical (date you entered: {entered_expiry}) covers your checkride." + helper,
        fail_msg=(f"The expiry date you entered ({entered_expiry}) is before your checkride ({Planned(planned)}). "
                  f"Renew it or check the date. Ask your CFI to review this." + helper),
        partial_msg=f"Your medical (date you entered: {entered_expiry}) runs out during {Planned(planned)}. Pick a date on or before it.")
    return r

# ---------------------------------------------------------------- combined (never blocks)
SEVERITY = {OK: 0, CHECK: 1, WARN: 2}
def combine(results):
    worst = max(results, key=lambda r: SEVERITY[r.status]).status if results else OK
    binding = min((r for r in results if r.deadline), key=lambda r: r.deadline, default=None)
    return {"overall": worst, "can_book": True,
            "cfi_ack_required": any(r.cfi_ack_required for r in results),   # only warn/fails (v2.1)
            "cfi_notes": [r.rule for r in results if r.cfi_note],            # needs-check items: note, no tick
            "dpe_flags": [r.rule for r in results if r.dpe_flag],
            "binding_deadline": (binding.rule, binding.deadline) if binding else None}

# ---------------------------------------------------------------- test cases
D = date
def st(r): return (r.status, r.reason)
def E(d, h=1.5, q=True): return (d, h, q)

cases = [
 # ---- Rule 1 knowledge test
 ("K1","KT 2024-03-15, completed 2026-03-31", st(check_knowledge_test(D(2024,3,15),D(2026,3,31))), (OK,"ok")),
 ("K2","KT 2024-03-15, completed 2026-04-01", st(check_knowledge_test(D(2024,3,15),D(2026,4,1))), (WARN,"fails")),
 ("K3","KT 2024-03-15, began 03-31 completed 2026-04-02", st(check_knowledge_test(D(2024,3,15),D(2026,4,2))), (WARN,"fails")),
 ("K4","KT 2026-02-28, completed 2028-02-29", st(check_knowledge_test(D(2026,2,28),D(2028,2,29))), (OK,"ok")),
 ("K5","KT 2026-02-28, completed 2028-03-01", st(check_knowledge_test(D(2026,2,28),D(2028,3,1))), (WARN,"fails")),
 ("K6","ATP-CTP 60 mo: KT 2022-01-10, completed 2026-12-31", st(check_knowledge_test(D(2022,1,10),D(2026,12,31),60)), (OK,"ok")),
 ("K7","ATP-CTP 60 mo: KT 2022-01-10, completed 2027-02-01", st(check_knowledge_test(D(2022,1,10),D(2027,2,1),60)), (WARN,"fails")),
 ("K8","KT 2024-01-31, completed 2026-01-01", st(check_knowledge_test(D(2024,1,31),D(2026,1,1))), (OK,"ok")),
 ("K9","K7 + 61.39(b) employment exemption claimed", st(check_knowledge_test(D(2022,1,10),D(2027,2,1),60,exemption_claimed="61.39(b)")), (CHECK,"exemption-claimed")),
 ("K10","At-risk: deadline 2026-03-31, today 2026-01-01 (89 days), planned 2026-03", st(check_knowledge_test(D(2024,3,15),"2026-03",today=D(2026,1,1))), (WARN,"at-risk")),
 ("K11","At-risk boundary: today 2025-12-31 (90 days -> at risk), 2025-12-30 (91 days -> ok)", (st(check_knowledge_test(D(2024,3,15),D(2026,3,1),today=D(2025,12,31))), st(check_knowledge_test(D(2024,3,15),D(2026,3,1),today=D(2025,12,30)))), ((WARN,"at-risk"),(OK,"ok"))),
 ("K12","Month-only target 2026-04 vs KT deadline 2026-03-31", st(check_knowledge_test(D(2024,3,15),"2026-04")), (WARN,"fails")),
 ("K13","No KT date entered", st(check_knowledge_test(None,D(2026,3,1))), (CHECK,"missing")),
 # ---- Rule 2 endorsement 61.39(a)(6)
 ("E1","Training 2026-01-02, application 2026-03-31", st(check_endorsement(D(2026,1,2),D(2026,3,31))), (OK,"ok")),
 ("E2","Training 2026-01-31, application 2026-04-01", st(check_endorsement(D(2026,1,31),D(2026,4,1))), (WARN,"fails")),
 ("E3","Training 2026-12-15, application 2027-02-28", st(check_endorsement(D(2026,12,15),D(2027,2,28))), (OK,"ok")),
 ("E4","Training 2026-10-28, application 2026-10-29 (same month)", st(check_endorsement(D(2026,10,28),D(2026,10,29))), (OK,"ok")),
 ("E5","At-risk: deadline 2026-03-31, today 2026-03-10 (21 days)", st(check_endorsement(D(2026,1,2),D(2026,3,25),today=D(2026,3,10))), (WARN,"at-risk")),
 ("E6","Type rating only: exempt 61.39(f)", st(check_endorsement(None,D(2026,3,25),exempt_61_39_f=True)), (OK,"exempt")),
 ("E7","Applied 2026-03-20 (training 01-05), LoD, resume 2026-04-02", st(check_endorsement(D(2026,1,5),D(2026,3,20),resumed_on=D(2026,4,2))), (CHECK,"interpretation")),
 ("E8","No endorsement yet", st(check_endorsement(None,"2026-12")), (CHECK,"missing")),
 # ---- Rule 3 discontinuance
 ("D1","Start/disc 2026-01-31, resume 2026-03-31", st(check_resume(D(2026,1,31),D(2026,1,31),D(2026,3,31))), (OK,"ok")),
 ("D2","Start/disc 2026-01-31, resume 2026-04-01 (61.39(h))", st(check_resume(D(2026,1,31),D(2026,1,31),D(2026,4,1))), (WARN,"fails")),
 ("D3","Start/disc 2026-01-01, resume 2026-03-02 (D+60)", st(check_resume(D(2026,1,1),D(2026,1,1),D(2026,3,2))), (OK,"ok")),
 ("D4","Start/disc 2026-01-01, resume 2026-03-03 (D+61)", st(check_resume(D(2026,1,1),D(2026,1,1),D(2026,3,3))), (WARN,"fails")),
 ("D5","Leap: credit deadline after 2028-01-15", credit_deadline(D(2028,1,15)), D(2028,3,15)),
 ("D6","Non-leap: credit deadline after 2027-01-15", credit_deadline(D(2027,1,15)), D(2027,3,16)),
 ("D7","First disc 2026-05-10, 2nd disc 06-20, resume 2026-07-09", st(check_resume(D(2026,5,10),D(2026,5,10),D(2026,7,9))), (OK,"ok")),
 ("D8","Same, resume 2026-07-15", st(check_resume(D(2026,5,10),D(2026,5,10),D(2026,7,15))), (WARN,"fails")),
 ("D9","Interrupted at-risk: deadline 2026-03-02, today 2026-02-16 (14 days)", st(check_resume(D(2026,1,1),D(2026,1,1),D(2026,2,28),today=D(2026,2,16))), (WARN,"at-risk")),
 ("D10","Interrupted not at risk: today 2026-02-15 (15 days)", st(check_resume(D(2026,1,1),D(2026,1,1),D(2026,2,28),today=D(2026,2,15))), (OK,"ok")),
 ("D11","Month-only resume target 2026-03 vs deadline 2026-03-02", st(check_resume(D(2026,1,1),D(2026,1,1),"2026-03")), (CHECK,"month-only")),
 ("D12","v2.6 Start/disc 2026-01-15, resume 2026-03-16 (exact D+60; 60-day binds)", st(check_resume(D(2026,1,15),D(2026,1,15),D(2026,3,16))), (OK,"ok")),
 ("D13","v2.6 Same, resume 2026-03-17 (day after D+60)", st(check_resume(D(2026,1,15),D(2026,1,15),D(2026,3,17))), (WARN,"fails")),
 ("D14","v2.6 Start/disc 2026-01-31, resume 2026-03-31 (month-end; 61.39 binds)", st(check_resume(D(2026,1,31),D(2026,1,31),D(2026,3,31))), (OK,"ok")),
 ("D15","v2.6 Start 2026-01-31 / disc 2026-02-01, resume 2026-03-31 (61.39 from Jan)", st(check_resume(D(2026,1,31),D(2026,2,1),D(2026,3,31))), (OK,"ok")),
 ("D16","v2.6 Start 2026-01-31 / disc 2026-02-01, resume 2026-04-01", st(check_resume(D(2026,1,31),D(2026,2,1),D(2026,4,1))), (WARN,"fails")),
 ("D17","v2.6 Leap: start/disc 2028-02-29, resume 2028-04-29 (exact D+60)", st(check_resume(D(2028,2,29),D(2028,2,29),D(2028,4,29))), (OK,"ok")),
 ("D18","v2.6 Leap: same, resume 2028-04-30 (day after D+60)", st(check_resume(D(2028,2,29),D(2028,2,29),D(2028,4,30))), (WARN,"fails")),
 ("D19","v2.6 Non-leap: credit_deadline(2027-01-15) == 2027-03-16", credit_deadline(D(2027,1,15)), D(2027,3,16)),
 ("D20","v2.6 NOD/LOD same helper: resume_with_credit_deadline(2026-05-10,2026-05-10) == 2026-07-09", resume_with_credit_deadline(D(2026,5,10),D(2026,5,10)), D(2026,7,9)),
 # ---- Rule 4 medical: REFERENCE computations (helper text / QA only, not shown as a date per #13/#20)
 ("M1","REF 3rd class exam 2026-03-01 age 39 -> 2031-03-31", medical_expiry(D(2026,3,1),D(1986,6,1),3,"private"), D(2031,3,31)),
 ("M2","REF 3rd class exam 2026-03-31 age 39 -> 2031-03-31", medical_expiry(D(2026,3,31),D(1986,6,1),3,"private"), D(2031,3,31)),
 ("M3","REF exam day before 40th bday", medical_expiry(D(2026,5,31),D(1986,6,1),3,"private"), D(2031,5,31)),
 ("M4","REF exam on 40th bday", medical_expiry(D(2026,6,1),D(1986,6,1),3,"private"), D(2028,6,30)),
 ("M5","REF 1st class age 45 exam 2026-01-10: ATP PIC", medical_expiry(D(2026,1,10),D(1980,1,1),1,"atp_pic"), D(2026,7,31)),
 ("M6","REF same: commercial", medical_expiry(D(2026,1,10),D(1980,1,1),1,"commercial"), D(2027,1,31)),
 ("M7","REF same: practical test (third-class level)", medical_expiry(D(2026,1,10),D(1980,1,1),1,"practical_test"), D(2028,1,31)),
 ("M8","REF 2nd class age 30: commercial / private", (medical_expiry(D(2026,1,10),D(1996,1,1),2,"commercial"), medical_expiry(D(2026,1,10),D(1996,1,1),2,"private")), (D(2027,1,31), D(2031,1,31))),
 ("M9","REF 3rd class for commercial privileges", medical_expiry(D(2026,1,10),D(1996,1,1),3,"commercial"), None),
 ("M10","REF leap: 3rd class age 50 exam 2026-02-10", medical_expiry(D(2026,2,10),D(1976,1,1),3,"private"), D(2028,2,29)),
 ("M11","REF BasicMed course 2025-01-15, CMEC 2023-01-20 on 2027-01-31 / 2027-02-01", (basicmed_valid(D(2025,1,15),D(2023,1,20),D(2027,1,31)), basicmed_valid(D(2025,1,15),D(2023,1,20),D(2027,2,1))), (True, False)),
 ("M12","REF BasicMed course 2026-06-01, CMEC 2022-10-05 on 2026-10-31 / 2026-11-01", (basicmed_valid(D(2026,6,1),D(2022,10,5),D(2026,10,31)), basicmed_valid(D(2026,6,1),D(2022,10,5),D(2026,11,1))), (True, False)),
 # ---- Rule 4 medical: STATUS from student-entered date
 ("MS1","Class 3, entered 2027-05-31, checkride 2027-05-31", st(check_medical("3",D(2027,5,31),D(2027,5,31))), (OK,"ok")),
 ("MS2","Class 3, entered 2027-05-31, checkride 2027-06-01", st(check_medical("3",D(2027,5,31),D(2027,6,1))), (WARN,"fails")),
 ("MS3","Class 2, entered 2026-12-31, today 2026-11-01 (60 days)", st(check_medical("2",D(2026,12,31),D(2026,12,15),today=D(2026,11,1))), (WARN,"at-risk")),
 ("MS4","Class 1, no date entered", st(check_medical("1",None,D(2027,1,1))), (CHECK,"missing")),
 ("MS5","Glider checkride, no medical", st(check_medical(None,None,D(2027,1,1),aircraft="glider")), (OK,"not-applicable")),
 ("MS6","Driver's license, private checkride", st(check_medical("dl",D(2030,1,1),D(2027,1,1))), (WARN,"fails")),
 ("MS7","Driver's license, sport checkride", st(check_medical("dl",D(2030,1,1),D(2027,1,1),sport_test=True)), (OK,"ok")),
 ("MS8","BasicMed entered 2027-01-31, checkride month 2027-01", st(check_medical("basicmed",D(2027,1,31),"2027-01")), (OK,"ok")),
 ("MS9","Entered 2027-01-15, checkride month 2027-01", st(check_medical("3",D(2027,1,15),"2027-01")), (CHECK,"month-only")),
 ("MS10","No type selected", st(check_medical(None,None,D(2027,1,1))), (CHECK,"missing")),
 # ---- Rule 5 (new) 3-hour practical-test prep
 ("P1","Private ASEL, 3.0 h on 2026-01-02, test 2026-03-31", st(check_prep_training("private-asel",[E(D(2026,1,2),3.0)],D(2026,3,31))), (OK,"ok")),
 ("P2","Private ASEL, 3.0 h on 2026-01-31, test 2026-04-01", st(check_prep_training("private-asel",[E(D(2026,1,31),3.0)],D(2026,4,1))), (WARN,"fails")),
 ("P3","Private ASEL, 1.5 h 2026-02-20 + 1.5 h 2026-03-05, test 2026-03-10", st(check_prep_training("private-asel",[E(D(2026,2,20)),E(D(2026,3,5))],D(2026,3,10))), (OK,"ok")),
 ("P4","Private ASEL, 2.0 h in window (+1.0 h in Dec, outside), test 2026-02-15", st(check_prep_training("private-asel",[E(D(2025,11,30),1.0),E(D(2026,1,10),2.0)],D(2026,2,15))), (WARN,"fails")),
 ("P5","Private ASEL, 3.0 h but 1.0 h was in a simulator (not qualifying)", st(check_prep_training("private-asel",[E(D(2026,3,1),2.0),E(D(2026,3,2),1.0,False)],D(2026,3,10))), (WARN,"fails")),
 ("P6","Prep logged after the test date doesn't count", st(check_prep_training("private-asel",[E(D(2026,3,11),3.0)],D(2026,3,10))), (WARN,"fails")),
 ("P7","Spans months: 3 h on 2026-01-10, test 2026-03-31 to 2026-04-01", st(check_prep_training("private-asel",[E(D(2026,1,10),3.0)],D(2026,3,31),D(2026,4,1))), (CHECK,"spans-months")),
 ("P8","Spans months, both OK: 3 h on 2026-02-10, test 03-31 to 04-01", st(check_prep_training("private-asel",[E(D(2026,2,10),3.0)],D(2026,3,31),D(2026,4,1))), (OK,"ok")),
 ("P9","Year boundary: commercial AMEL 3 h on 2026-11-15, test 2027-01-20", st(check_prep_training("commercial-amel",[E(D(2026,11,15),3.0)],D(2027,1,20))), (OK,"ok")),
 ("P10","Instrument airplane: 3 h on 2026-01-20, test 2026-03-15 (both readings OK)", st(check_prep_training("instrument-airplane",[E(D(2026,1,20),3.0)],D(2026,3,15))), (OK,"ok")),
 ("P11","Instrument airplane: 3 h on 2026-01-05, test 2026-03-15 (calendar OK, strict day reading not)", st(check_prep_training("instrument-airplane",[E(D(2026,1,5),3.0)],D(2026,3,15))), (CHECK,"interpretation")),
 ("P12","Instrument airplane: 3 h on 2025-12-30, test 2026-03-01", st(check_prep_training("instrument-airplane",[E(D(2025,12,30),3.0)],D(2026,3,1))), (WARN,"fails")),
 ("P13","Private glider: 3 training flights in window", st(check_prep_training("private-glider",[E(D(2026,5,1),0.3),E(D(2026,5,1),0.3),E(D(2026,6,2),0.3)],D(2026,6,20))), (OK,"ok")),
 ("P14","Private hot-air balloon: only 1 of 2 flights", st(check_prep_training("private-hot-air-balloon",[E(D(2026,5,1),1.0)],D(2026,6,20))), (WARN,"fails")),
 ("P15","Sport airplane: 2.0 h in window", st(check_prep_training("sport-airplane",[E(D(2026,8,30),2.0)],D(2026,10,1))), (OK,"ok")),
 ("P16","Recreational: 2.5 h only", st(check_prep_training("recreational",[E(D(2026,9,1),2.5)],D(2026,10,1))), (WARN,"fails")),
 ("P17","Added class rating (private AMEL on ASEL cert), nothing logged", st(check_prep_training("private-amel",[],D(2026,10,1),added_class=True)), (OK,"exempt")),
 ("P18","Added class balloon->airship: rule applies (3 h on 2026-06-01, outside the window; rc5: [] now means missing)", st(check_prep_training("private-airship",[E(D(2026,6,1),3.0)],D(2026,10,1),added_class=True,balloon_to_airship=True)), (WARN,"fails")),
 ("P19","CFI initial: no timed prep rule", st(check_prep_training("cfi",None,D(2026,10,1))), (OK,"not-applicable")),
 ("P20","Part 141 grad 2026-09-01, test 2026-10-15, 3 h on 2026-09-20", st(check_prep_training("private-asel",[E(D(2026,9,20),3.0)],D(2026,10,15),pathway="part141",graduation_date=D(2026,9,1))), (OK,"part141-graduate")),
 ("P21","Part 141 grad 2026-09-01, test 2026-10-15, no entries", st(check_prep_training("private-asel",None,D(2026,10,15),pathway="part141",graduation_date=D(2026,9,1))), (CHECK,"part141-graduate")),
 ("P22","Part 141 grad 2026-07-01, test 2026-10-15 (>60 days): Part 61 rule, 3 h on 2026-07-20 too old", st(check_prep_training("private-asel",[E(D(2026,7,20),3.0)],D(2026,10,15),pathway="part141",graduation_date=D(2026,7,1))), (WARN,"fails")),
 ("P23","Month-only test 2026-12, 3 h on 2026-10-05", st(check_prep_training("private-asel",[E(D(2026,10,5),3.0)],"2026-12")), (OK,"ok")),
 ("P24","No prep entered yet", st(check_prep_training("commercial-asel",None,"2026-12")), (CHECK,"missing")),
 ("P25","rc5 (QA U21) Empty entry list [] is missing, like None", st(check_prep_training("private-asel",[],D(2026,3,31))), (CHECK,"missing")),
 ("P26","rc5 (QA-091) 2.996 h does not round up to 3 h", st(check_prep_training("private-asel",[E(D(2026,3,1),2.996)],D(2026,3,31))), (WARN,"fails")),
 ("P27","rc5 (QA-091) 1000000 h and -5 h entries are not counted", st(check_prep_training("private-asel",[E(D(2026,3,1),1000000),E(D(2026,3,2),-5)],D(2026,3,31))), (WARN,"fails")),
 ("P28","rc5 (QA-091) 1.1 h + 1.9 h = 3 h exactly is ok (no float noise)", st(check_prep_training("private-asel",[E(D(2026,3,1),1.1),E(D(2026,3,2),1.9)],D(2026,3,31))), (OK,"ok")),
 ("P29","rc6 0.05 h + 2.95 h: 0.05 below 0.1 not counted", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.05,2.95]],D(2026,3,31))), (WARN,"fails")),
 ("P30","rc6 0.09 h + 2.95 h: 0.09 not counted", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.09,2.95]],D(2026,3,31))), (WARN,"fails")),
 ("P31","rc6 0.099999 h + 2.900001 h: first not counted", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.099999,2.900001]],D(2026,3,31))), (WARN,"fails")),
 ("P32","rc6 exactly 0.1 h counts: 0.1 + 2.9 = 3", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.1,2.9]],D(2026,3,31))), (OK,"ok")),
 ("P33","rc6 decimal sum 0.3 + 2.3 + 0.4 = 3 exactly", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.3,2.3,0.4]],D(2026,3,31))), (OK,"ok")),
 ("P34","rc6 decimal sum 0.7 + 1.4 + 0.9 = 3 exactly", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.7,1.4,0.9]],D(2026,3,31))), (OK,"ok")),
 ("P35","rc6 0.1 h x 30 = 3 exactly (float accumulation 0.1+0.1+... drifts; Decimal exact)", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.1]*30],D(2026,3,31))), (OK,"ok")),
 ("P36","rc6 slightly below: 2.9999999 h", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [2.9999999]],D(2026,3,31))), (WARN,"fails")),
 ("P37","rc6 slightly below: 1.4 + 1.5999 = 2.9999", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [1.4,1.5999]],D(2026,3,31))), (WARN,"fails")),
 ("P38","rc6 invalid: 0, None, 'abc', NaN not counted", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0,None,'abc',float('nan')]],D(2026,3,31))), (WARN,"fails")),
 ("P39","rc6 upper bound: 24 h counts", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [24]],D(2026,3,31))), (OK,"ok")),
 ("P40","rc6 upper bound: 24.1 h not counted", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [24.1]],D(2026,3,31))), (WARN,"fails")),
 ("P41","rc6 invalid ignored alongside valid: 3 + (-5)", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [3,-5]],D(2026,3,31))), (OK,"ok")),
 ("P42","rc6 numeric strings parsed: '1.5' + '1.5'", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['1.5','1.5']],D(2026,3,31))), (OK,"ok")),
 ("P43","rc6 only invalid entries ([0.05]) -> fails, not missing", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.05]],D(2026,3,31))), (WARN,"fails")),
 ("P44","v2.3 bool True alone is invalid (not counted, no crash)", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [True]],D(2026,3,31))), (WARN,"fails")),
 ("P45","v2.3 bool False alone is invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [False]],D(2026,3,31))), (WARN,"fails")),
 ("P46","v2.3 True + False only", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [True,False]],D(2026,3,31))), (WARN,"fails")),
 ("P47","v2.3 True + 2.9 h: True not counted, below threshold", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [True,2.9]],D(2026,3,31))), (WARN,"fails")),
 ("P48","v2.3 True + 3 h: exactly threshold ok", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [True,3]],D(2026,3,31))), (OK,"ok")),
 ("P49","v2.3 False + 0.1 + 2.9 = 3 exactly ok", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [False,0.1,2.9]],D(2026,3,31))), (OK,"ok")),
 ("P50","v2.3 True + 2.9999999 h still short", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [True,2.9999999]],D(2026,3,31))), (WARN,"fails")),
 ("P51","v2.3 True + False + '1.5' + '1.5' strings still parsed = 3", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [True,False,'1.5','1.5']],D(2026,3,31))), (OK,"ok")),
 ("P52","v2.4 flights: private-glider [True,True,True]", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in [True,True,True]],D(2026,3,31))), (WARN,"fails")),
 ("P53","v2.4 flights: private-glider [False,False,False]", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in [False,False,False]],D(2026,3,31))), (WARN,"fails")),
 ("P54","v2.4 flights: private-glider [True,0.3,0.3]", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in [True,0.3,0.3]],D(2026,3,31))), (WARN,"fails")),
 ("P55","v2.4 flights: private-hot-air-balloon [True,True]", st(check_prep_training("private-hot-air-balloon",[E(D(2026,3,1),h) for h in [True,True]],D(2026,3,31))), (WARN,"fails")),
 ("P56","v2.4 flights: private-hot-air-balloon [False,False]", st(check_prep_training("private-hot-air-balloon",[E(D(2026,3,1),h) for h in [False,False]],D(2026,3,31))), (WARN,"fails")),
 ("P57","v2.4 flights: private-hot-air-balloon [True,0.3]", st(check_prep_training("private-hot-air-balloon",[E(D(2026,3,1),h) for h in [True,0.3]],D(2026,3,31))), (WARN,"fails")),
 ("P58","v2.4 flights: private-glider [False,0.3,0.3,0.3]", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in [False,0.3,0.3,0.3]],D(2026,3,31))), (OK,"ok")),
 ("P59","v2.4 flights: private-hot-air-balloon [False,0.3,0.3]", st(check_prep_training("private-hot-air-balloon",[E(D(2026,3,1),h) for h in [False,0.3,0.3]],D(2026,3,31))), (OK,"ok")),
 ("P60","v2.4 flights: private-glider [True]", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in [True]],D(2026,3,31))), (WARN,"fails")),
 ("P61","v2.4 flights: private-glider [True,False,0.3,0.3,0.3]", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in [True,False,0.3,0.3,0.3]],D(2026,3,31))), (OK,"ok")),
 ("P62","v2.4 flights: private-glider [0.3,0.3]", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in [0.3,0.3]],D(2026,3,31))), (WARN,"fails")),
 ("P63","v2.4 flights: private-glider ['0.3','0.3','0.3']", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in ["0.3","0.3","0.3"]],D(2026,3,31))), (OK,"ok")),
 ("P64","v2.4 flights: private-hot-air-balloon [1.0,'1.0',True]", st(check_prep_training("private-hot-air-balloon",[E(D(2026,3,1),h) for h in [1.0,"1.0",True]],D(2026,3,31))), (OK,"ok")),
 ("P65","v2.4 flights: private-glider []", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in []],D(2026,3,31))), (CHECK,"missing")),
 ("P66","v2.5 precision: raw text '2.9999999999999999' invalid (not rounded to 3)", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['2.9999999999999999']],D(2026,3,31))), (WARN,"fails")),
 ("P67","v2.5 precision: '1.00' + '1.9999999999999999': second invalid, 1.00 < 3", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['1.00','1.9999999999999999']],D(2026,3,31))), (WARN,"fails")),
 ("P68","v2.5 precision: float literal 2.9999999999999999 is 3.0 before entry: counted as 3 (known limitation)", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [2.9999999999999999]],D(2026,3,31))), (OK,"ok")),
 ("P69","v2.5 precision: numeric 0.1 + 2.9 = 3", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.1,2.9]],D(2026,3,31))), (OK,"ok")),
 ("P70","v2.5 precision: numeric 0.01 (2 dp, below 0.1) not counted", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.01,2.99]],D(2026,3,31))), (WARN,"fails")),
 ("P71","v2.5 precision: numeric 0.001 (3 dp) not counted", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [0.001,3]],D(2026,3,31))), (OK,"ok")),
 ("P72","v2.5 precision: numeric 2.99 valid but short", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [2.99]],D(2026,3,31))), (WARN,"fails")),
 ("P73","v2.5 precision: numeric 1.01 + 1.99 = 3", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [1.01,1.99]],D(2026,3,31))), (OK,"ok")),
 ("P74","v2.5 precision: numeric 1.005 (3 dp) invalid: 1.005 + 1.995 not counted", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [1.005,1.995]],D(2026,3,31))), (WARN,"fails")),
 ("P75","v2.5 precision: text trailing zeros: '1.50' + '1.50' ok", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['1.50','1.50']],D(2026,3,31))), (OK,"ok")),
 ("P76","v2.5 precision: text '3.000' (3 fractional digits incl. zeros) invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['3.000']],D(2026,3,31))), (WARN,"fails")),
 ("P77","v2.5 precision: text trimmed: ' 1.5 ' + tab/newline '1.5' ok", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [' 1.5 ','\t1.5\n']],D(2026,3,31))), (OK,"ok")),
 ("P78","v2.5 precision: text exponent '3e0', '3E0', '0.3e1' invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['3e0','3E0','0.3e1']],D(2026,3,31))), (WARN,"fails")),
 ("P79","v2.5 precision: text '.5' + '2.5' ok", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['.5','2.5']],D(2026,3,31))), (OK,"ok")),
 ("P80","v2.5 precision: text '3.' trailing dot invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['3.']],D(2026,3,31))), (WARN,"fails")),
 ("P81","v2.5 precision: text sign '+3', '-3', comma '1,5', '', 'inf', 'nan', '1 .5' invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['+3','-3','1,5','','inf','nan','1 .5']],D(2026,3,31))), (WARN,"fails")),
 ("P82","v2.5 precision: non-finite floats inf/-inf/nan invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [float('inf'),float('-inf'),float('nan')]],D(2026,3,31))), (WARN,"fails")),
 ("P83","v2.5 precision: Decimal('1.50') x2 ok; Decimal('1.500') invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [Decimal('1.50'),Decimal('1.50'),Decimal('1.500')]],D(2026,3,31))), (OK,"ok")),
 ("P84","v2.5 precision: Decimal('1.500') + 1.5: first invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [Decimal('1.500'),1.5]],D(2026,3,31))), (WARN,"fails")),
 ("P85","v2.5 precision: int 3 ok", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [3]],D(2026,3,31))), (OK,"ok")),
 ("P86","v2.5 precision: booleans still rejected before precision check, with 2.9", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in [True,False,2.9]],D(2026,3,31))), (WARN,"fails")),
 ("P87","v2.5 precision: mixed valid '1.25' + 1.75 + invalid '1.999' = 3 ok", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['1.25',1.75,'1.999']],D(2026,3,31))), (OK,"ok")),
 ("P88","v2.5 precision: upper bound '24.00' ok; '24.01' invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['24.00','24.01']],D(2026,3,31))), (OK,"ok")),
 ("P89","v2.5 precision: only precision-invalid entries -> fails, not missing", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['1.234']],D(2026,3,31))), (WARN,"fails")),
 ("P90","v2.5 precision: sport-airplane 2 h: '1.995' + '0.005' invalid", st(check_prep_training("sport-airplane",[E(D(2026,3,1),h) for h in ['1.995','0.005']],D(2026,3,31))), (WARN,"fails")),
 ("P91","v2.5 precision: flights unchanged: glider 3 entries with 3-dp hours still count", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in ['0.333',0.333,'2.9999999999999999']],D(2026,3,31))), (OK,"ok")),
 ("P92","v2.5 precision: flights unchanged: bool still excluded, glider [True,'1.234','1.234']", st(check_prep_training("private-glider",[E(D(2026,3,1),h) for h in [True,'1.234','1.234']],D(2026,3,31))), (WARN,"fails")),
 ("P93","v2.5 ASCII-only: Arabic-Indic digits '\u0663' (3) invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['\u0663']],D(2026,3,31))), (WARN,"fails")),
 ("P94","v2.5 ASCII-only: Arabic-Indic '\u0661.\u0665' x2 (1.5+1.5) invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['\u0661.\u0665','\u0661.\u0665']],D(2026,3,31))), (WARN,"fails")),
 ("P95","v2.5 ASCII-only: full-width '\uff13' (3) invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['\uff13']],D(2026,3,31))), (WARN,"fails")),
 ("P96","v2.5 ASCII-only: full-width '\uff11.\uff15' x2 invalid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['\uff11.\uff15','\uff11.\uff15']],D(2026,3,31))), (WARN,"fails")),
 ("P97","v2.5 ASCII-only: ASCII control '1.5' + '1.5' valid", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['1.5','1.5']],D(2026,3,31))), (OK,"ok")),
 ("P98","v2.5 ASCII-only: mixed: full-width '\uff13' ignored + ASCII '3' ok", st(check_prep_training("private-asel",[E(D(2026,3,1),h) for h in ['\uff13','3']],D(2026,3,31))), (OK,"ok")),
 # ---- Rule 6 (new) 61.49 retest
 ("R1","Failed 2026-05-10; endorsement 2026-05-20 by trainer; recommendation yes; apply 2026-05-25", st(check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25),True,True)), (OK,"ok")),
 ("R2","Endorsement 2026-05-01 predates failure 2026-05-10", st(check_retest(D(2026,5,10),D(2026,5,1),D(2026,5,25),True,True)), (WARN,"fails")),
 ("R3","No retest endorsement", st(check_retest(D(2026,5,10),None,D(2026,5,25))), (WARN,"fails")),
 ("R4","Endorsement same day as failure", st(check_retest(D(2026,5,10),D(2026,5,10),D(2026,5,25),True,True)), (OK,"ok")),
 ("R5","Endorser / recommendation unknown", st(check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25))), (CHECK,"confirm")),
 ("R6","Endorser didn't give the training", st(check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25),False,True)), (WARN,"fails")),
 ("R7","CFI airplane spin failure, no spin-certificated aircraft", st(check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25),True,True,True,False)), (WARN,"fails")),
 ("R8","CFI spin failure, aircraft unknown", st(check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25),True,True,True,None)), (CHECK,"confirm")),
 ("R9","Endorsement dated after planned application", st(check_retest(D(2026,5,10),D(2026,5,26),D(2026,5,25),True,True)), (WARN,"fails")),
 # ---- D42 (Mon Nov 2, 2026): the rules doc wins on Rule 6
 ("R12","D42 Month-only plan 2026-05, endorsement 2026-05-31 (last day) -> ok", st(check_retest(D(2026,5,10),D(2026,5,31),"2026-05",True,True)), (OK,"ok")),
 ("R13","D42 Month-only plan 2026-05, endorsement 2026-06-01 (after the month) -> fails", st(check_retest(D(2026,5,10),D(2026,6,1),"2026-05",True,True)), (WARN,"fails")),
 ("R14","D42 Every Rule 6 warn/fails message ends with 'Ask your CFI to review this.' (no endorsement, before failure, after application, spin, trainer, 8710)",
     tuple(r.message.endswith("Ask your CFI to review this.") for r in (check_retest(D(2026,5,10),None,D(2026,5,25)),
        check_retest(D(2026,5,10),D(2026,5,1),D(2026,5,25),True,True), check_retest(D(2026,5,10),D(2026,5,26),D(2026,5,25),True,True),
        check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25),True,True,True,False), check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25),False,True),
        check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25),True,False))), (True,)*6),
 ("R15","D42 Spin and 8710 messages use 'likely', not 'you must' / 'needs'",
     tuple(("likely" in r.message, "you must" in r.message) for r in (check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25),True,True,True,False),
        check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25),True,False))), ((True, False), (True, False))),
 ("R10","Retest scenario: failed 2026-05-10 (test began 05-10); 61.49 endorsement 05-20 as (a)(6) training date; apply 2026-07-09",
     (st(check_resume(D(2026,5,10),D(2026,5,10),D(2026,7,9))), st(check_endorsement(D(2026,5,20),D(2026,7,9))), st(check_prep_training("private-asel",[E(D(2026,5,20),3.0)],D(2026,7,9)))),
     ((OK,"ok"),(OK,"ok"),(OK,"ok"))),
 ("R11","Retest after credit lapses: failed 2026-05-10, retest 2026-08-03; old prep 2026-05-01 only",
     (st(check_resume(D(2026,5,10),D(2026,5,10),D(2026,8,3))), st(check_prep_training("private-asel",[E(D(2026,5,1),3.0)],D(2026,8,3)))),
     ((WARN,"fails"),(WARN,"fails"))),
 # ---- combined
 ("C1","Combined: one fail + one needs-check -> warn, can book, CFI tick, 2 DPE flags",
     (lambda c: (c["overall"], c["can_book"], c["cfi_ack_required"], len(c["dpe_flags"])))(combine([
        check_knowledge_test(D(2024,3,15),D(2026,4,1)), check_endorsement(None,D(2026,4,1)), check_medical("3",D(2028,1,1),D(2026,4,1))])),
     (WARN, True, True, 2)),
 ("C2","Combined: all ok, at-risk only -> warn, no tick, no DPE flag",
     (lambda c: (c["overall"], c["can_book"], c["cfi_ack_required"], len(c["dpe_flags"])))(combine([
        check_knowledge_test(D(2024,3,15),D(2026,3,1),today=D(2026,1,15)), check_medical("3",D(2028,1,1),D(2026,3,1))])),
     (WARN, True, False, 0)),
 ("C3","Combined: binding deadline is the earliest",
     combine([check_knowledge_test(D(2024,3,15),D(2026,3,1)), check_endorsement(D(2026,1,2),D(2026,3,1))])["binding_deadline"],
     ("knowledge_test", D(2026,3,31))),
 # ---- v2.1 (Marlo, 2026-10-29): needs-check -> "confirm with your CFI" note, no tick; only warn/fails needs the tick
 ("C4","v2.1 Combined: needs-check only -> needs-check, can book, NO tick, 1 DPE flag, 1 CFI note",
     (lambda c: (c["overall"], c["can_book"], c["cfi_ack_required"], len(c["dpe_flags"]), c["cfi_notes"]))(combine([
        check_knowledge_test(D(2024,3,15),D(2026,3,31)), check_endorsement(None,D(2026,3,31)), check_medical("3",D(2028,1,1),D(2026,3,31))])),
     (CHECK, True, False, 1, ["endorsement"])),
 ("C5","v2.1 Combined: at-risk + needs-check -> warn overall but NO tick; note only on the needs-check item",
     (lambda c: (c["overall"], c["cfi_ack_required"], c["cfi_notes"], c["dpe_flags"]))(combine([
        check_knowledge_test(D(2024,3,15),D(2026,3,1),today=D(2026,1,15)), check_medical("1",None,D(2026,3,1))])),
     (WARN, False, ["medical"], ["medical"])),
 ("C6","v2.1 Combined: fails + needs-check -> tick (from the fail) and note (from the needs-check)",
     (lambda c: (c["cfi_ack_required"], c["cfi_notes"], sorted(c["dpe_flags"])))(combine([
        check_knowledge_test(D(2024,3,15),D(2026,4,1)), check_endorsement(None,D(2026,4,1))])),
     (True, ["endorsement"], ["endorsement", "knowledge_test"])),
 ("C7","v2.1 Per result: (tick, note) for warn/fails, warn/at-risk, needs-check, ok",
     tuple((r.cfi_ack_required, r.cfi_note) for r in (
        check_knowledge_test(D(2024,3,15),D(2026,4,1)),
        check_knowledge_test(D(2024,3,15),D(2026,3,1),today=D(2026,1,15)),
        check_knowledge_test(None,D(2026,4,1)),
        check_knowledge_test(D(2024,3,15),D(2026,3,31)))),
     ((True, None), (False, None), (False, CFI_NOTE), (False, None))),
 ("C8","v2.1 Every needs-check reason gets the note and never the tick (8 reasons, calls reused from K9/K13/E7/D11/P7/P21/R5 + order)",
     tuple(sorted({r.reason for r in (
        check_knowledge_test(D(2022,1,10),D(2027,2,1),60,exemption_claimed="61.39(b)"),
        check_knowledge_test(None,D(2026,3,1)),
        check_endorsement(D(2026,1,5),D(2026,3,20),resumed_on=D(2026,4,2)),
        check_endorsement(D(2026,4,2),D(2026,4,1)),
        check_resume(D(2026,1,1),D(2026,1,1),"2026-03"),
        check_prep_training("private-asel",[E(D(2026,1,10),3.0)],D(2026,3,31),D(2026,4,1)),
        check_prep_training("private-asel",None,D(2026,10,15),pathway="part141",graduation_date=D(2026,9,1)),
        check_retest(D(2026,5,10),D(2026,5,20),D(2026,5,25)))
        if r.status == CHECK and r.cfi_note == CFI_NOTE and not r.cfi_ack_required})),
     ("confirm","exemption-claimed","interpretation","missing","month-only","order","part141-graduate","spans-months")),
]

if __name__ == "__main__":
    bad = 0
    for cid, desc, got, exp in cases:
        ok = (got == exp); bad += (not ok)
        print(f"{cid}\t{'PASS' if ok else 'FAIL'}\tgot={got}\texp={exp}\t{desc}")
    print(f"{len(cases) - bad}/{len(cases)} PASS; failures: {bad}")
    # sample user-facing messages
    for r in (check_knowledge_test(D(2024,3,15),D(2026,4,1)), check_prep_training("private-asel",[E(D(2026,1,31),3.0)],D(2026,4,1)),
              check_retest(D(2026,5,10),None,D(2026,5,25)), check_resume(D(2026,1,1),D(2026,1,1),D(2026,3,3))):
        print("MSG", r.rule, r.status, "|", r.message)
