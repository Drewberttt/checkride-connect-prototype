// Sample data for the Checkride Connect prototype.
// Every examiner, applicant and school below is fictional.
window.CC_DATA = (() => {
  const region = { name: "Florida", short: "FL" };

  const certs = [
    { id: "ppl", name: "Private Pilot", short: "Private", detail: "Airplane Single-Engine Land" },
    { id: "ir", name: "Instrument Rating", short: "Instrument", detail: "Airplane" },
    { id: "cpl", name: "Commercial Pilot", short: "Commercial", detail: "Airplane Single-Engine Land" },
    { id: "me", name: "Multi-Engine Add-on", short: "Multi-Engine", detail: "Airplane Multi-Engine Land" },
    { id: "cfi", name: "Flight Instructor (CFI)", short: "CFI", detail: "Airplane Single-Engine" },
    { id: "cfii", name: "Instrument Instructor (CFII)", short: "CFII", detail: "Airplane" },
    { id: "mei", name: "Multi-Engine Instructor (MEI)", short: "MEI", detail: "Airplane Multi-Engine" },
    { id: "sport", name: "Sport Pilot", short: "Sport", detail: "Airplane" },
  ];

  // Approximate coordinates, good enough for distance sorting in a demo.
  const airports = [
    { id: "KORL", name: "Orlando Executive", city: "Orlando", lat: 28.545, lng: -81.333 },
    { id: "KSFB", name: "Orlando Sanford Intl", city: "Sanford", lat: 28.778, lng: -81.238 },
    { id: "KDAB", name: "Daytona Beach Intl", city: "Daytona Beach", lat: 29.18, lng: -81.058 },
    { id: "KLAL", name: "Lakeland Linder Intl", city: "Lakeland", lat: 27.989, lng: -82.019 },
    { id: "KVDF", name: "Tampa Executive", city: "Tampa", lat: 28.014, lng: -82.345 },
    { id: "KPIE", name: "St. Pete–Clearwater Intl", city: "Clearwater", lat: 27.91, lng: -82.687 },
    { id: "KSRQ", name: "Sarasota Bradenton Intl", city: "Sarasota", lat: 27.395, lng: -82.554 },
    { id: "KMLB", name: "Melbourne Orlando Intl", city: "Melbourne", lat: 28.103, lng: -80.645 },
    { id: "KVRB", name: "Vero Beach Regional", city: "Vero Beach", lat: 27.656, lng: -80.418 },
    { id: "KFXE", name: "Fort Lauderdale Executive", city: "Fort Lauderdale", lat: 26.197, lng: -80.171 },
    { id: "KBCT", name: "Boca Raton", city: "Boca Raton", lat: 26.379, lng: -80.108 },
    { id: "KTMB", name: "Miami Executive", city: "Miami", lat: 25.648, lng: -80.433 },
    { id: "KFMY", name: "Page Field", city: "Fort Myers", lat: 26.587, lng: -81.863 },
    { id: "KGNV", name: "Gainesville Regional", city: "Gainesville", lat: 29.69, lng: -82.272 },
    { id: "KCRG", name: "Jacksonville Executive", city: "Jacksonville", lat: 30.336, lng: -81.514 },
    { id: "KTLH", name: "Tallahassee Intl", city: "Tallahassee", lat: 30.397, lng: -84.35 },
  ];

  // soonest/gap/count drive the generated calendar (days from today).
  const dpes = [
    { id: "d1", name: "Maria Delgado", home: "KORL", travelNm: 60, travelFee: 150, retestFee: 600, fsdo: "Orlando FSDO", since: 2017, languages: ["English", "Spanish"], rating: 4.9, reviews: 132, responseHours: 6,
      fees: { ppl: 1150, ir: 1100, cpl: 1250, cfi: 1700 }, soonest: 9, gap: 4, count: 10,
      bio: "Former regional airline captain and Part 141 chief instructor. Starts on time, briefs the plan up front and expects IACRA to be finished before the day.",
      cancellation: "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      aircraft: "Applicant provides the aircraft. A working view-limiting device is required for Private and Instrument." },
    { id: "d2", name: "Tom Whitaker", home: "KSFB", travelNm: 75, travelFee: 200, retestFee: 550, fsdo: "Orlando FSDO", since: 2014, languages: ["English"], rating: 4.8, reviews: 210, responseHours: 12,
      fees: { ppl: 1000, ir: 1000, cpl: 1150, me: 1200, mei: 1250 }, soonest: 21, gap: 3, count: 12,
      bio: "Multi-engine specialist with 30 years instructing. Busy calendar, but he publishes cancellations quickly.",
      cancellation: "$200 fee inside 48 hours unless weather or mechanical.",
      aircraft: "The multi-engine aircraft must have current maintenance records on board." },
    { id: "d3", name: "Priya Raman", home: "KDAB", travelNm: 50, travelFee: 125, retestFee: 650, fsdo: "Orlando FSDO", since: 2019, languages: ["English", "Hindi"], rating: 4.9, reviews: 88, responseHours: 4,
      fees: { ppl: 1200, ir: 1150, cpl: 1300, cfi: 1800, cfii: 1100 }, soonest: 5, gap: 6, count: 9,
      bio: "University flight program alumna and CFI checkride specialist. Expect a thorough oral on fundamentals of instructing.",
      cancellation: "Free reschedule with 5 days notice.",
      aircraft: "Applicant provides the aircraft." },
    { id: "d4", name: "James Okafor", home: "KLAL", travelNm: 60, travelFee: 100, retestFee: 500, fsdo: "Tampa FSDO", since: 2020, languages: ["English"], rating: 4.7, reviews: 64, responseHours: 24,
      fees: { ppl: 950, ir: 1000, sport: 750 }, soonest: 14, gap: 5, count: 8,
      bio: "Light-sport and private checkrides out of Lakeland. Happy to travel to smaller fields.",
      cancellation: "Free reschedule with 48 hours notice.",
      aircraft: "LSA and standard category aircraft accepted." },
    { id: "d5", name: "Linda Brooks", home: "KVDF", travelNm: 80, travelFee: 175, retestFee: 700, fsdo: "Tampa FSDO", since: 2011, languages: ["English"], rating: 4.8, reviews: 301, responseHours: 8,
      fees: { ppl: 1300, ir: 1250, cpl: 1400, me: 1300, cfi: 1900, cfii: 1200, mei: 1350 }, soonest: 3, gap: 7, count: 9,
      bio: "Holds every common airplane authorization. Weekday and Saturday availability.",
      cancellation: "50% of the fee is forfeited inside 24 hours.",
      aircraft: "Applicant provides the aircraft. Bring all maintenance logbooks, not summaries." },
    { id: "d6", name: "Carlos Mendez", home: "KTMB", travelNm: 50, travelFee: 150, retestFee: 550, fsdo: "South Florida FSDO", since: 2016, languages: ["English", "Spanish", "Portuguese"], rating: 4.9, reviews: 156, responseHours: 6,
      fees: { ppl: 1100, ir: 1050, cpl: 1200 }, soonest: 30, gap: 2, count: 12,
      bio: "Popular with international students. Can do the oral in Spanish or Portuguese where permitted.",
      cancellation: "Free reschedule with 72 hours notice.",
      aircraft: "Applicant provides the aircraft." },
    { id: "d7", name: "Ethan Park", home: "KFXE", travelNm: 60, travelFee: 150, retestFee: 650, fsdo: "South Florida FSDO", since: 2018, languages: ["English", "Korean"], rating: 4.6, reviews: 71, responseHours: 18,
      fees: { ppl: 1250, cpl: 1350, me: 1300, mei: 1400 }, soonest: 11, gap: 5, count: 8,
      bio: "Commercial and multi-engine focus for career-track students.",
      cancellation: "$250 fee inside 72 hours unless weather.",
      aircraft: "Twin aircraft must have a current weight & balance on board." },
    { id: "d8", name: "Rachel Kim", home: "KPIE", travelNm: 50, travelFee: 100, retestFee: 550, fsdo: "Tampa FSDO", since: 2021, languages: ["English"], rating: 4.9, reviews: 49, responseHours: 3,
      fees: { ppl: 1050, ir: 1000, cfi: 1600, cfii: 1000 }, soonest: 18, gap: 4, count: 9,
      bio: "Answers fast and keeps a well-organized calendar. Instrument and instructor checkrides.",
      cancellation: "Free reschedule with 48 hours notice.",
      aircraft: "An IFR-capable aircraft with a current GPS database is required for IR/CFII." },
    { id: "d9", name: "Frank Novak", home: "KMLB", travelNm: 70, travelFee: 125, retestFee: 500, fsdo: "Orlando FSDO", since: 2009, languages: ["English"], rating: 4.7, reviews: 245, responseHours: 24,
      fees: { ppl: 1000, ir: 1050, cpl: 1150, me: 1100 }, soonest: 7, gap: 5, count: 9,
      bio: "Space Coast-based examiner with weekend availability.",
      cancellation: "Free reschedule with 72 hours notice.",
      aircraft: "Applicant provides the aircraft." },
    { id: "d10", name: "Sandra Lewis", home: "KGNV", travelNm: 60, travelFee: 100, retestFee: 450, fsdo: "Jacksonville FSDO", since: 2015, languages: ["English"], rating: 4.8, reviews: 97, responseHours: 10,
      fees: { ppl: 900, ir: 950, sport: 700 }, soonest: 25, gap: 4, count: 8,
      bio: "North-central Florida, often the lowest fees in the region.",
      cancellation: "Free reschedule with 48 hours notice.",
      aircraft: "Applicant provides the aircraft." },
    { id: "d11", name: "Dwayne Harris", home: "KCRG", travelNm: 60, travelFee: 150, retestFee: 600, fsdo: "Jacksonville FSDO", since: 2013, languages: ["English"], rating: 4.8, reviews: 180, responseHours: 8,
      fees: { ppl: 1100, ir: 1100, cpl: 1200, cfi: 1650 }, soonest: 12, gap: 4, count: 9,
      bio: "Retired military pilot. Structured, scenario-based orals.",
      cancellation: "Free reschedule with 72 hours notice.",
      aircraft: "Applicant provides the aircraft." },
    { id: "d12", name: "Helen Fischer", home: "KFMY", travelNm: 60, travelFee: 150, retestFee: 600, fsdo: "South Florida FSDO", since: 2012, languages: ["English", "German"], rating: 4.7, reviews: 120, responseHours: 12,
      fees: { ppl: 1150, ir: 1100, cpl: 1250, me: 1250, mei: 1300 }, soonest: 35, gap: 3, count: 10,
      bio: "Southwest Florida's multi-engine examiner.",
      cancellation: "$200 fee inside 48 hours unless weather.",
      aircraft: "Applicant provides the aircraft." },
    { id: "d13", name: "Marcus Bell", home: "KTLH", travelNm: 90, travelFee: 200, retestFee: 500, fsdo: "Jacksonville FSDO", since: 2022, languages: ["English"], rating: 4.6, reviews: 33, responseHours: 6,
      fees: { ppl: 950, ir: 950 }, soonest: 8, gap: 6, count: 7,
      bio: "Panhandle and Big Bend coverage. Travels to most fields.",
      cancellation: "Free reschedule with 48 hours notice.",
      aircraft: "Applicant provides the aircraft." },
  ];


  // ---------- SAMPLE extras for the all-in cost view and the reviews / wait-time panel ----------
  // EXAMPLE NUMBERS ONLY. Every number and every review below is invented for the prototype.
  const allInModel = {
    hours: { ppl: 2.5, ir: 2.5, cpl: 2.5, me: 3, cfi: 2.5, cfii: 2.5, mei: 3, sport: 2 }, // example flight hours on test day
    multi: ["me", "mei"], multiMult: 1.9, // example: multi-engine rental runs about 1.9x a trainer
    cruiseKt: 105,                        // example speed for the fly-there estimate
    lodgingOverNm: 100,                   // example: one hotel night if the examiner is farther than this
  };
  const R = (c, s, t) => ({ cert: c, stars: s, text: t });
  const sampleExtras = {
    d1: { rental: 155, lodging: 140, noShow: 300, avgDaysToNext: 12, leadDays: 21, reviewList: [R("ppl", 5, "Briefed the whole day up front, so I knew exactly what to expect. Fair but thorough."), R("ir", 5, "Scenario-based oral. Started on time and finished on time."), R("cpl", 4, "Strict on paperwork. Have your IACRA done early.")] },
    d2: { rental: 185, lodging: 150, noShow: 200, avgDaysToNext: 24, leadDays: 35, reviewList: [R("me", 5, "Knows the twin inside out. Calendar was tight but I found a cancellation slot."), R("ppl", 4, "Long wait for a date, calm and professional on the day."), R("mei", 5, "Great feedback during the debrief.")] },
    d3: { rental: 150, lodging: 130, noShow: 250, avgDaysToNext: 9, leadDays: 14, reviewList: [R("cfi", 5, "Deep dive on fundamentals of instructing. Prepare your lesson plans."), R("ppl", 5, "Friendly, put me at ease. Quick to answer questions before the test."), R("cfii", 4, "Thorough oral, fair flight.")] },
    d4: { rental: 130, lodging: 110, noShow: 150, avgDaysToNext: 16, leadDays: 21, reviewList: [R("sport", 5, "Happy to fly out to our small field, which saved us a trip."), R("ppl", 4, "Relaxed but exact standards."), R("ir", 4, "Good use of the whole day.")] },
    d5: { rental: 165, lodging: 145, noShow: 650, avgDaysToNext: 7, leadDays: 28, reviewList: [R("ppl", 5, "Very experienced, explained every task. Bring all your logbooks."), R("mei", 5, "Weekday and Saturday options helped our schedule."), R("cfi", 4, "Late-cancel fee is steep, so plan ahead.")] },
    d6: { rental: 150, lodging: 150, noShow: 275, avgDaysToNext: 33, leadDays: 42, reviewList: [R("ppl", 5, "Did the oral in Spanish with me, which made it far less stressful."), R("cpl", 5, "Clear expectations, relaxed pace."), R("ir", 4, "Popular examiner, so book early.")] },
    d7: { rental: 170, lodging: 155, noShow: 250, avgDaysToNext: 14, leadDays: 24, reviewList: [R("cpl", 5, "Focused on what airlines care about. Challenging but fair."), R("me", 4, "Strict on weight and balance paperwork."), R("ppl", 4, "Good checkride, slow to reply to messages.")] },
    d8: { rental: 145, lodging: 125, noShow: 200, avgDaysToNext: 20, leadDays: 21, reviewList: [R("ir", 5, "Replied within hours and kept the day well organized."), R("cfii", 5, "Gave useful tips on teaching instrument approaches."), R("ppl", 5, "Calm, clear and on time.")] },
    d9: { rental: 140, lodging: 120, noShow: 200, avgDaysToNext: 10, leadDays: 28, reviewList: [R("ppl", 5, "Weekend date was perfect for my work schedule."), R("me", 4, "A bit slow to reply, great on the day."), R("ir", 4, "Fair and consistent.")] },
    d10: { rental: 125, lodging: 105, noShow: 150, avgDaysToNext: 27, leadDays: 30, reviewList: [R("ppl", 5, "Lowest fee I found and a thorough checkride."), R("sport", 4, "Worth the drive."), R("ir", 5, "Straightforward and well explained.")] },
    d11: { rental: 150, lodging: 130, noShow: 300, avgDaysToNext: 14, leadDays: 21, reviewList: [R("ppl", 5, "Scenario-based questions made me think like a pilot."), R("cpl", 4, "Structured day. Be prepared for follow-up questions."), R("cfi", 4, "Firm on standards, fair on the day.")] },
    d12: { rental: 160, lodging: 140, noShow: 200, avgDaysToNext: 38, leadDays: 49, reviewList: [R("me", 5, "The go-to twin examiner for the area, but the wait is long."), R("ppl", 4, "Professional and friendly."), R("mei", 5, "Excellent debrief.")] },
    d13: { rental: 135, lodging: 115, noShow: 200, avgDaysToNext: 11, leadDays: 14, reviewList: [R("ppl", 5, "Drove to our field and was flexible about timing."), R("ir", 4, "Covered a lot of ground in the oral."), R("ppl", 4, "Good experience overall.")] },
  };
  dpes.forEach((dp) => { dp.sample = sampleExtras[dp.id]; });

  const pendingDpes = [
    { id: "p1", name: "Anthony Russo", home: "KSRQ", designee: "DPE-FL-20417", fsdo: "Tampa FSDO", certs: ["ppl", "ir", "cpl"], submittedDaysAgo: 2, locatorMatch: true, note: "Sample record: matches a fictional locator entry." },
    { id: "p2", name: "Grace Liu", home: "KVRB", designee: "DPE-FL-31188", fsdo: "Orlando FSDO", certs: ["ppl", "sport"], submittedDaysAgo: 1, locatorMatch: true, note: "Sample record: fictional locator match. Sport authorization listed." },
    { id: "p3", name: "Kevin Doyle", home: "KBCT", designee: "DPE-FL-1290", fsdo: "South Florida FSDO", certs: ["ppl", "ir", "cpl", "cfi"], submittedDaysAgo: 4, locatorMatch: false, note: "Sample record: no fictional locator match. A real review would ask for documentation." },
  ];

  // Seeded requests/bookings on Maria Delgado's (d1) calendar, by slot index.
  const seededBookings = [
    { dpeId: "d1", slotIndex: 0, applicant: "Jordan Lee", cert: "ppl", aircraft: "N734JL · Cessna 172S", cfi: "A. Grant, CFI", readiness: 95, status: "requested" },
    { dpeId: "d1", slotIndex: 2, applicant: "Sam Rivera", cert: "ir", aircraft: "N52SR · Piper Archer", cfi: "M. Ortiz, CFII", readiness: 100, status: "confirmed" },
    { dpeId: "d1", slotIndex: 4, applicant: "Taylor Brooks", cert: "cpl", aircraft: "N9TB · Cessna 182", cfi: "K. Wu, CFI", readiness: 88, status: "confirmed" },
  ];

  const school = {
    name: "Demo Flight Academy",
    airport: "KORL",
        students: [
      { name: "Ava Thompson", cert: "ppl", cfi: "Jake Morales", readiness: 92, endorsed: true, status: "none" },
      { name: "Sofia Martinez", cert: "ppl", cfi: "Jake Morales", readiness: 100, endorsed: true, status: "confirmed", dpe: "d2", daysOut: 22 },
      { name: "Liam Chen", cert: "ir", cfi: "Dana Wells", readiness: 75, endorsed: false, status: "none" },
      { name: "Mateo Silva", cert: "ppl", cfi: "Dana Wells", readiness: 85, endorsed: false, status: "alert" },
      { name: "Noah Patel", cert: "cpl", cfi: "Jake Morales", readiness: 60, endorsed: false, status: "none" },
      { name: "Emma Rossi", cert: "cfi", cfi: "Dana Wells", readiness: 40, endorsed: false, status: "none" },
      { name: "Harper Nguyen", cert: "ir", cfi: "Dana Wells", readiness: 97, endorsed: true, status: "requested", dpe: "d9", daysOut: 9 },
    ],
  };

  // Readiness checklists. UNVERIFIED DRAFT: written from memory, cites not yet checked by a CFI/DPE. Always verify against current 14 CFR, the ACS and AC 61-65.
  const D = (id, t, n) => ({ id, t, n });
  const commonDocs = [
    D("id", "Government-issued photo ID", "Must match the name in IACRA."),
    D("iacra", "IACRA application (FAA Form 8710-1) complete", "Your instructor signs the recommendation, and you sign in IACRA before the checkride."),
    D("ktr", "Airman Knowledge Test Report", "Passed within the preceding 24 calendar months. Bring the original."),
    D("log", "Pilot logbook", "Tab the entries that show required experience and endorsements."),
    D("fee", "Examiner fee, in the payment method your DPE accepts", "Paid directly to the examiner."),
  ];
  const aircraftDocs = [
    D("aw", "Airworthiness certificate on board", ""),
    D("reg", "Registration certificate on board (current)", ""),
    D("poh", "POH/AFM with current weight & balance", ""),
    D("annual", "Annual inspection within 12 calendar months", "Plus a 100-hour inspection if the aircraft is used for hire or flight instruction."),
    D("elt", "ELT inspection within 12 calendar months, battery not expired", ""),
    D("xpdr", "Transponder check within 24 calendar months", ""),
    D("ad", "AD compliance documented", "Bring the actual maintenance logbooks."),
  ];
  const ifrAircraft = [
    D("pitot", "Altimeter / pitot-static check within 24 calendar months (§91.411)", ""),
    D("vor", "VOR check within 30 days, if using VOR (§91.171)", ""),
    D("gps", "IFR GPS database current", ""),
    D("vld", "View-limiting device", ""),
  ];

  const checklists = {
    ppl: [
      { cat: "Documents", items: [D("stu", "Student pilot certificate", ""), D("med", "Current FAA medical certificate", "Confirm BasicMed eligibility with your DPE if applicable."), ...commonDocs] },
      { cat: "Endorsements (AC 61-65)", items: [
        D("e-solo", "Pre-solo knowledge test and flight training (§61.87(b), (c))", ""),
        D("e-solo90", "Solo flight endorsement, current within 90 days (§61.87(n))", ""),
        D("e-xc", "Solo cross-country endorsements (§61.93)", ""),
        D("e-kt", "Knowledge test endorsement (§61.35(a)(1))", ""),
        D("e-pt", "Practical test: 3 hrs training in prior 2 calendar months and ready (§61.39(a)(6)(i)–(ii))", ""),
        D("e-kd", "Knowledge test deficiencies reviewed (§61.39(a)(6)(iii))", ""),
        D("e-prof", "Flight proficiency / aeronautical knowledge (§61.103(f), §61.107(b))", ""),
      ] },
      { cat: "Experience (§61.109(a))", items: [
        D("x40", "40 hours total flight time", ""),
        D("x20", "20 hours dual instruction", "Including 3 hrs XC, 3 hrs night (one 100 nm XC, 10 takeoffs/landings), 3 hrs instrument, 3 hrs test prep in prior 2 calendar months."),
        D("x10", "10 hours solo", "Including 5 hrs solo XC, one 150 nm solo XC with full-stop landings at 3 points (one leg > 50 nm), 3 takeoffs/landings at a towered airport."),
      ] },
      { cat: "Aircraft", items: aircraftDocs },
    ],
    ir: [
      { cat: "Documents", items: [D("cert", "Pilot certificate", ""), D("med", "Current FAA medical certificate", ""), ...commonDocs] },
      { cat: "Endorsements (AC 61-65)", items: [
        D("e-kt", "Knowledge test endorsement (§61.35(a)(1))", ""),
        D("e-prep", "Instrument practical test readiness (§61.65(a)(6))", ""),
        D("e-pt", "Practical test: 3 hrs training in prior 2 calendar months and ready (§61.39(a)(6)(i)–(ii))", ""),
        D("e-kd", "Knowledge test deficiencies reviewed (§61.39(a)(6)(iii))", ""),
      ] },
      { cat: "Experience (§61.65(d))", items: [
        D("x50", "50 hours cross-country PIC (10 in airplanes)", ""),
        D("x40", "40 hours actual or simulated instrument", "Including 15 hrs from a CFII and 3 hrs test prep in prior 2 calendar months."),
        D("x250", "250 nm IFR cross-country with 3 different kinds of approaches", "Flown on an IFR flight plan, with an approach at each airport."),
      ] },
      { cat: "Aircraft", items: [...aircraftDocs, ...ifrAircraft] },
    ],
    cpl: [
      { cat: "Documents", items: [D("cert", "Private pilot certificate", ""), D("med", "Current FAA medical certificate (2nd class to exercise commercial privileges)", ""), ...commonDocs] },
      { cat: "Endorsements (AC 61-65)", items: [
        D("e-kt", "Knowledge test endorsement (§61.35(a)(1))", ""),
        D("e-pt", "Practical test: 3 hrs training in prior 2 calendar months and ready (§61.39(a)(6)(i)–(ii))", ""),
        D("e-kd", "Knowledge test deficiencies reviewed (§61.39(a)(6)(iii))", ""),
        D("e-cx", "Complex / high-performance endorsements, if the checkride aircraft needs them (§61.31)", ""),
      ] },
      { cat: "Experience (§61.129(a))", items: [
        D("x250", "250 hours total time", "100 in powered aircraft (50 in airplanes)."),
        D("x100", "100 hours PIC", "Including 50 hrs in airplanes and 50 hrs cross-country (10 in airplanes)."),
        D("x20", "20 hours training", "Includes 10 hrs instrument, 10 hrs complex/turbine/TAA, a 2-hr day XC and a 2-hr night XC (each > 100 nm), and 3 hrs prep."),
        D("x10", "10 hours solo / PIC with instructor on board", "Includes a 300 nm XC with 3 points (one leg ≥ 250 nm) and 5 hrs night VFR with 10 takeoffs/landings at a towered airport."),
      ] },
      { cat: "Aircraft", items: aircraftDocs },
    ],
    cfi: [
      { cat: "Documents", items: [D("cert", "Commercial pilot certificate with instrument rating", ""), D("foi", "Fundamentals of Instructing (FOI) knowledge test report", ""), D("fia", "Flight Instructor Airplane (FIA) knowledge test report", ""), ...commonDocs] },
      { cat: "Endorsements (AC 61-65)", items: [
        D("e-spin", "Spin training endorsement (§61.183(i))", ""),
        D("e-kt", "Knowledge test endorsement(s) (§61.35(a)(1))", ""),
        D("e-pt", "Practical test endorsement (§61.183(g), §61.39(a)(6))", ""),
      ] },
      { cat: "Preparation", items: [D("lp", "Lesson plans for the ACS areas", "Your DPE may assign specific tasks ahead of time."), D("refs", "Current FAR/AIM, handbooks and ACS available", "")] },
      { cat: "Aircraft", items: aircraftDocs },
    ],
  };
  // Simpler templates for the remaining certificates.
  ["me", "cfii", "mei", "sport"].forEach((c) => {
    checklists[c] = [
      { cat: "Documents", items: [D("cert", c === "sport" ? "Student pilot certificate" : "Current pilot / instructor certificate", ""), D("med", c === "sport" ? "Valid U.S. driver's license or FAA medical" : "Current FAA medical certificate (if acting as PIC)", ""), ...commonDocs.filter((d) => c === "me" ? d.id !== "ktr" : true)] },
      { cat: "Endorsements (AC 61-65)", items: [D("e-pt", "Practical test endorsement (§61.39(a)(6))", "Confirm the exact endorsement wording with your CFI."), D("e-other", "Certificate-specific endorsements per AC 61-65", "")] },
      { cat: "Aircraft", items: c === "cfii" ? [...aircraftDocs, ...ifrAircraft] : aircraftDocs },
    ];
  });

  return { region, certs, airports, allInModel, dpes, pendingDpes, seededBookings, school, checklists };
})();
