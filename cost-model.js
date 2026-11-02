// Checkride Connect - expected all-in checkride cost model (defaults + formula).
// Defaults are low / typical / high per checkride type. Each value carries a source tag:
//   "sourced"   = a public source supports it (see cost-model.md, sources S1..S14)
//   "derived"   = computed from sourced numbers with the method stated in cost-model.md
//   "assumption"= no public source found; adjustable placeholder, do not present as fact
// Not quotes. Examiner fees are set by each examiner.
(function (root) {
  const L = (low, typical, high, status, src) => ({ low, typical, high, status, src });

  // Shared rates (national, $/hr wet unless noted)
  const rates = {
    rentalSE: L(142, 165, 184, "sourced", "S3"),       // PilotBound 2026: P25 / median / P75 trainer rate, 568 schools
    rentalME: L(300, 395, 450, "sourced", "S3,S5"),    // PilotBound median twin $395; AoA multi wet $300-450
    cfi: L(60, 65, 75, "sourced", "S3,S2"),            // PilotBound middle half $60-75, median $65; Redbird line CFI $65, check CFI $75
    driveRatePerMile: L(0.76, 0.76, 0.76, "sourced", "S9"), // IRS business rate, Jul 1 - Dec 31 2026
    lodgingPerNight: L(113, 113, 170, "sourced", "S10"),    // GSA FY2027 CONUS standard $113; high = assumption for non-standard metro areas
  };

  // State overrides for typical rates (PilotBound 2026 Table 1 medians)
  const stateRates = {
    TX: { rentalSE: 165, cfi: 65, rentalSERange: [80, 425], schools: 46 },
    CA: { rentalSE: 160, cfi: 80, rentalSERange: [95, 269], schools: 65 },
    AZ: { rentalSE: 159, cfi: 75, rentalSERange: [109, 209], schools: 14 },
    FL: { rentalSE: 169, cfi: 70, rentalSERange: [105, 380], schools: 43 },
  };

  const multi = ["me", "mei", "atp"]; // types flown in a twin (ATP assumed AMEL, matching otherAuthorizations detail)

  // Per checkride type
  const byCert = {
    ppl:   { examinerFee: L(725, 900, 1100, "sourced", "S1"), rentalHoursTest: L(1.3, 1.5, 2.0, "sourced", "S6,S7"),
             cfiPrepHours: L(3, 3, 5, "sourced-min", "S11 61.109(a)(4)"), retestProbability: L(0.25, 0.33, 0.38, "sourced+assumption", "S12,S13") },
    ir:    { examinerFee: L(725, 900, 1100, "sourced", "S1"), rentalHoursTest: L(1.5, 1.8, 2.3, "assumption", "-"),
             cfiPrepHours: L(3, 3, 5, "sourced-min", "S11 61.65"), retestProbability: L(0.185, 0.227, 0.277, "derived+assumption", "S12") },
    cpl:   { examinerFee: L(725, 900, 1100, "sourced", "S1"), rentalHoursTest: L(1.3, 1.6, 2.0, "assumption", "-"),
             cfiPrepHours: L(3, 3, 5, "sourced-min", "S11 61.129(a)(3)(v)"), retestProbability: L(0.233, 0.30, 0.35, "sourced+assumption", "S12,S13") },
    me:    { examinerFee: L(725, 900, 1100, "assumption", "S1 band applied"), rentalHoursTest: L(1.2, 1.5, 2.0, "assumption", "-"),
             cfiPrepHours: L(2, 3, 5, "assumption", "no reg minimum"), retestProbability: L(0.116, 0.131, 0.181, "derived+assumption", "S12 proxy") },
    cfi:   { examinerFee: L(1100, 1475, 1875, "sourced", "S1"), rentalHoursTest: L(1.3, 1.8, 2.2, "assumption", "S5 says ~2 hr"),
             cfiPrepHours: L(2, 3, 5, "assumption", "no reg minimum"), retestProbability: L(0.263, 0.33, 0.38, "sourced+assumption", "S12,S13") },
    cfii:  { examinerFee: L(800, 1150, 1500, "sourced", "S5 (typical = midpoint)"), rentalHoursTest: L(1.5, 1.8, 2.3, "assumption", "-"),
             cfiPrepHours: L(2, 3, 5, "assumption", "no reg minimum"), retestProbability: L(0.111, 0.125, 0.175, "derived+assumption", "S12 proxy") },
    mei:   { examinerFee: L(800, 1150, 1500, "sourced", "S5 (typical = midpoint)"), rentalHoursTest: L(1.2, 1.6, 2.0, "assumption", "-"),
             cfiPrepHours: L(2, 3, 5, "assumption", "no reg minimum"), retestProbability: L(0.111, 0.125, 0.175, "derived+assumption", "S12 proxy") },
    atp:   { examinerFee: L(1000, 1300, 1700, "assumption", "-"), rentalHoursTest: L(1.5, 1.8, 2.3, "assumption", "-"),
             cfiPrepHours: L(2, 3, 5, "assumption", "no reg minimum"), retestProbability: L(0.065, 0.07, 0.12, "derived+assumption", "S12") },
    sport: { examinerFee: L(600, 750, 900, "assumption", "S1 min $600 as floor"), rentalHoursTest: L(1.0, 1.2, 1.5, "assumption", "-"),
             cfiPrepHours: L(2, 2, 3, "sourced-min", "S11 61.313(a)(1)(iv)"), retestProbability: L(0.091, 0.10, 0.15, "derived+assumption", "S12") },
  };

  // Shared assumptions for all types
  const shared = {
    cfiPrepGroundHours: L(1, 2, 3, "assumption", "-"),   // mock oral / endorsement review
    retestFeeRatio: L(0.5, 0.625, 0.75, "sourced", "S5"), // retest fee as share of the full fee (secondary source)
    retestRentalHours: L(0.8, 1.0, 1.5, "assumption", "-"),
    retestDualHours: L(1, 1.5, 3, "assumption", "61.49 requires added training; hours not set"),
    travel: L(0, 150, null, "assumption", "typical = examiner travel fee; high = fly 1.5 h round trip + 1 night"),
    highFerryHours: 1.5,
    retestRepeatsTravel: true,
  };

  const pickLvl = (v, lvl) => (v && typeof v === "object" && "typical" in v ? v[lvl] : v);

  // Expected all-in cost for one checkride.
  // inp: { examinerFee, rentalHoursTest, rentalRatePerHr, cfiPrepHours, cfiPrepGroundHours, cfiRatePerHr,
  //        travelCost, retestProbability, retestFee, retestRentalHours, retestDualHours, retestRepeatsTravel }
  function expectedAllIn(inp) {
    const R = inp.rentalRatePerHr, C = inp.cfiRatePerHr;
    const exam = inp.examinerFee;
    const aircraft = inp.rentalHoursTest * R;
    const prep = inp.cfiPrepHours * (R + C) + inp.cfiPrepGroundHours * C;
    const travel = inp.travelCost || 0;
    const retestCost = inp.retestFee + inp.retestRentalHours * R + inp.retestDualHours * (R + C) + (inp.retestRepeatsTravel ? travel : 0);
    const expectedRetest = inp.retestProbability * retestCost;
    const base = exam + aircraft + prep + travel;
    return { exam, aircraft, prep, travel, retestCost, expectedRetest, base, total: base + expectedRetest };
  }

  // Build inputs for a type at a level ("low" | "typical" | "high"), optional state override.
  function scenario(cert, lvl, state) {
    const b = byCert[cert], st = stateRates[state] || {};
    const isMulti = multi.includes(cert);
    let R = pickLvl(isMulti ? rates.rentalME : rates.rentalSE, lvl);
    let C = pickLvl(rates.cfi, lvl);
    if (lvl === "typical" && !isMulti && st.rentalSE) R = st.rentalSE;
    if (lvl === "typical" && st.cfi) C = st.cfi;
    const fee = pickLvl(b.examinerFee, lvl);
    const travelCost = lvl === "low" ? 0 : lvl === "typical" ? 150 : Math.round(shared.highFerryHours * R + rates.lodgingPerNight.high);
    return {
      examinerFee: fee, rentalHoursTest: pickLvl(b.rentalHoursTest, lvl), rentalRatePerHr: R,
      cfiPrepHours: pickLvl(b.cfiPrepHours, lvl), cfiPrepGroundHours: pickLvl(shared.cfiPrepGroundHours, lvl), cfiRatePerHr: C,
      travelCost, retestProbability: pickLvl(b.retestProbability, lvl),
      retestFee: Math.round((fee * pickLvl(shared.retestFeeRatio, lvl)) / 25) * 25,
      retestRentalHours: pickLvl(shared.retestRentalHours, lvl), retestDualHours: pickLvl(shared.retestDualHours, lvl),
      retestRepeatsTravel: shared.retestRepeatsTravel,
    };
  }

  // Expected all-in for a Checkride Connect examiner record (uses dp.costModel when present).
  // travelCost: pass the app's own travel estimate (allIn().travel) so both views agree.
  function expectedAllInForExaminer(dp, cert, travelCost) {
    const cm = dp.costModel, bc = cm && cm.byCert && cm.byCert[cert];
    if (!bc) return null;
    const isMulti = multi.includes(cert);
    return expectedAllIn({
      examinerFee: bc.examinerFee, rentalHoursTest: bc.rentalHoursTest,
      rentalRatePerHr: isMulti ? cm.rentalRatePerHr.me : cm.rentalRatePerHr.se,
      cfiPrepHours: bc.cfiPrepHours, cfiPrepGroundHours: bc.cfiPrepGroundHours, cfiRatePerHr: cm.cfiRatePerHr,
      travelCost: travelCost == null ? 0 : travelCost, retestProbability: bc.retestProbability, retestFee: bc.retestFee,
      retestRentalHours: bc.retestRentalHours, retestDualHours: bc.retestDualHours, retestRepeatsTravel: true,
    });
  }

  const api = { rates, stateRates, multi, byCert, shared, expectedAllIn, scenario, expectedAllInForExaminer, accessed: "2026-10-29" };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.CC_COST_MODEL = api;
})(typeof window !== "undefined" ? window : null);
