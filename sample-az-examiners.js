// FICTIONAL SAMPLE DATA - invented examiners for UI development, not real people; airport identifiers are real.
//
// 30 invented Arizona examiners for the Checkride Connect prototype (/workspace/checkride-connect).
// Names, ratings, reviews, fees, wait times, rates, FSDO assignments and bios are all made up. No phone numbers or
// email addresses are included (the data.js examiner schema has no contact fields). Airport coordinates are approximate.
// Generated deterministically by /workspace/checkride-pm/data/gen_tx_ca_az_sample.js. Cost ranges: cost-model.md.
//
// Shape matches the `dpes` entries in checkride-connect/data.js (same field names and types, with `sample`
// attached the way data.js attaches sampleExtras). Additions, all ignored by the current app.js:
//   - otherAuthorizations: [{ id, name, detail, fee, costModel? }] for ATP and rotorcraft, which are NOT in data.js `certs`.
//     Kept out of `fees` on purpose: app.js calls certById() on every fee key and would break.
//   - costModel: { fictional, rentalRatePerHr:{se,me}, cfiRatePerHr, travel:{...}, byCert:{<cert>:{examinerFee,
//     rentalHoursTest, cfiPrepHours, cfiPrepGroundHours, retestProbability, retestProbabilitySource, retestFee,
//     retestRentalHours, retestDualHours}} }. FICTIONAL values inside the ranges in cost-model.md.
//   - airports: Arizona airports (same fields as data.js airports). Every home is in this list.
//
// Use (browser), load after data.js. APPEND, do not replace (data.js seededBookings/school reference d1, d2, d9):
//   <script src="sample-az-examiners.js"></script>
//   CC_DATA.airports.push(...CC_SAMPLE_AZ.airports); CC_DATA.dpes.push(...CC_SAMPLE_AZ.dpes);  // ids az01..az30
// Checkride Connect copy (B, Oct 29 2026): identical to /workspace/checkride-pm/data/sample-az-examiners.js except a "tz" (IANA) on each airport, from data.js airportTz (D38).
// Node: const { dpes, airports } = require("./sample-az-examiners.js");
(function (root) {
  const airports = [
    {
      "id": "KDVT",
      "name": "Phoenix Deer Valley",
      "city": "Phoenix",
      "lat": 33.688,
      "lng": -112.083,
      "tz": "America/Phoenix"
    },
    {
      "id": "KSDL",
      "name": "Scottsdale",
      "city": "Scottsdale",
      "lat": 33.623,
      "lng": -111.911,
      "tz": "America/Phoenix"
    },
    {
      "id": "KFFZ",
      "name": "Falcon Field",
      "city": "Mesa",
      "lat": 33.461,
      "lng": -111.728,
      "tz": "America/Phoenix"
    },
    {
      "id": "KIWA",
      "name": "Phoenix-Mesa Gateway",
      "city": "Mesa",
      "lat": 33.308,
      "lng": -111.655,
      "tz": "America/Phoenix"
    },
    {
      "id": "KCHD",
      "name": "Chandler Municipal",
      "city": "Chandler",
      "lat": 33.269,
      "lng": -111.811,
      "tz": "America/Phoenix"
    },
    {
      "id": "KGEU",
      "name": "Glendale Municipal",
      "city": "Glendale",
      "lat": 33.527,
      "lng": -112.295,
      "tz": "America/Phoenix"
    },
    {
      "id": "KGYR",
      "name": "Phoenix Goodyear",
      "city": "Goodyear",
      "lat": 33.423,
      "lng": -112.376,
      "tz": "America/Phoenix"
    },
    {
      "id": "KPHX",
      "name": "Phoenix Sky Harbor Intl",
      "city": "Phoenix",
      "lat": 33.434,
      "lng": -112.012,
      "tz": "America/Phoenix"
    },
    {
      "id": "KCGZ",
      "name": "Casa Grande Municipal",
      "city": "Casa Grande",
      "lat": 32.955,
      "lng": -111.767,
      "tz": "America/Phoenix"
    },
    {
      "id": "KTUS",
      "name": "Tucson Intl",
      "city": "Tucson",
      "lat": 32.116,
      "lng": -110.941,
      "tz": "America/Phoenix"
    },
    {
      "id": "KRYN",
      "name": "Ryan Field",
      "city": "Tucson",
      "lat": 32.142,
      "lng": -111.174,
      "tz": "America/Phoenix"
    },
    {
      "id": "KAVQ",
      "name": "Marana Regional",
      "city": "Marana",
      "lat": 32.41,
      "lng": -111.218,
      "tz": "America/Phoenix"
    },
    {
      "id": "KPRC",
      "name": "Prescott Regional",
      "city": "Prescott",
      "lat": 34.654,
      "lng": -112.42,
      "tz": "America/Phoenix"
    },
    {
      "id": "KFLG",
      "name": "Flagstaff Pulliam",
      "city": "Flagstaff",
      "lat": 35.138,
      "lng": -111.671,
      "tz": "America/Phoenix"
    },
    {
      "id": "KSEZ",
      "name": "Sedona",
      "city": "Sedona",
      "lat": 34.849,
      "lng": -111.788,
      "tz": "America/Phoenix"
    },
    {
      "id": "KSOW",
      "name": "Show Low Regional",
      "city": "Show Low",
      "lat": 34.265,
      "lng": -110.006,
      "tz": "America/Phoenix"
    },
    {
      "id": "KIFP",
      "name": "Laughlin/Bullhead Intl",
      "city": "Bullhead City",
      "lat": 35.157,
      "lng": -114.56,
      "tz": "America/Phoenix"
    },
    {
      "id": "KNYL",
      "name": "Yuma Intl",
      "city": "Yuma",
      "lat": 32.657,
      "lng": -114.606,
      "tz": "America/Phoenix"
    }
  ];

  const dpes = [
    {
      "id": "az01",
      "name": "Junius Ridgeway",
      "home": "KDVT",
      "travelNm": 60,
      "travelFee": 150,
      "retestFee": 400,
      "fsdo": "Scottsdale FSDO",
      "since": 2009,
      "languages": [
        "English"
      ],
      "rating": 4.6,
      "reviews": 183,
      "responseHours": 24,
      "fees": {
        "ppl": 775,
        "ir": 850,
        "cpl": 875
      },
      "soonest": 12,
      "gap": 5,
      "count": 10,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 153,
        "lodging": 134,
        "noShow": 150,
        "avgDaysToNext": 11,
        "leadDays": 16,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 153,
          "me": 443
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 134,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 775,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 400,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 850,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 425,
            "retestRentalHours": 1.1,
            "retestDualHours": 3
          },
          "cpl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "az02",
      "name": "Esmeralda Tovar-Lindgren",
      "home": "KDVT",
      "travelNm": 60,
      "travelFee": 75,
      "retestFee": 500,
      "fsdo": "Scottsdale FSDO",
      "since": 2018,
      "languages": [
        "English"
      ],
      "rating": 4.9,
      "reviews": 81,
      "responseHours": 4,
      "fees": {
        "ppl": 900,
        "ir": 975,
        "me": 950
      },
      "soonest": 14,
      "gap": 6,
      "count": 10,
      "bio": "Multi-engine add-ons and MEI rides; calendar fills fast in the spring.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "A Piper Seminole twin is available for multi-engine checkrides by arrangement (example: $359/hr wet). Otherwise applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 183,
        "lodging": 161,
        "noShow": 300,
        "avgDaysToNext": 15,
        "leadDays": 28,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 4,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "me",
            "stars": 4,
            "text": "Great engine-out briefing before the flight."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Briefed the plan up front and kept it on time."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 183,
          "me": 359
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 161,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 900,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.3,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1,
            "retestDualHours": 3
          },
          "me": {
            "examinerFee": 950,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "az03",
      "name": "Hollister Cranmore",
      "home": "KDVT",
      "travelNm": 30,
      "travelFee": 75,
      "retestFee": 525,
      "fsdo": "Scottsdale FSDO",
      "since": 2009,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.8,
      "reviews": 220,
      "responseHours": 8,
      "fees": {
        "ppl": 850,
        "ir": 950,
        "cpl": 925,
        "me": 1025
      },
      "soonest": 11,
      "gap": 2,
      "count": 6,
      "bio": "Twin specialist with a long instructing background. Engine-out work is briefed in detail.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "A Piper Seminole twin is available for multi-engine checkrides by arrangement (example: $346/hr wet). Otherwise applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 154,
        "lodging": 113,
        "noShow": 200,
        "avgDaysToNext": 9,
        "leadDays": 20,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "me",
            "stars": 4,
            "text": "Great engine-out briefing before the flight."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 154,
          "me": 346
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 113,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 850,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 950,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 1,
            "retestDualHours": 3
          },
          "cpl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 0.8,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.3,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "az04",
      "name": "Benita Arvizu",
      "home": "KSDL",
      "travelNm": 30,
      "travelFee": 175,
      "retestFee": 525,
      "fsdo": "Scottsdale FSDO",
      "since": 2014,
      "languages": [
        "English",
        "Navajo"
      ],
      "rating": 5,
      "reviews": 174,
      "responseHours": 48,
      "fees": {
        "ppl": 875,
        "ir": 850
      },
      "soonest": 42,
      "gap": 4,
      "count": 7,
      "bio": "Private and instrument checkrides for local flight schools and independent CFIs.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 163,
        "lodging": 168,
        "noShow": 200,
        "avgDaysToNext": 47,
        "leadDays": 54,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 163,
          "me": 349
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 168,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 0.9,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 850,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.1,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "az05",
      "name": "Thurman Steinkamp",
      "home": "KSDL",
      "travelNm": 50,
      "travelFee": 100,
      "retestFee": 450,
      "fsdo": "Scottsdale FSDO",
      "since": 2010,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 224,
      "responseHours": 8,
      "fees": {
        "ppl": 900,
        "ir": 925,
        "cpl": 925
      },
      "soonest": 11,
      "gap": 3,
      "count": 11,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 179,
        "lodging": 128,
        "noShow": 300,
        "avgDaysToNext": 16,
        "leadDays": 14,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 4,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 179,
          "me": 382
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 100,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 128,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 900,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 0.8,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 925,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 475,
            "retestRentalHours": 0.8,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "az06",
      "name": "Maribel Ochoa-Fenn",
      "home": "KFFZ",
      "travelNm": 90,
      "travelFee": 250,
      "retestFee": 550,
      "fsdo": "Scottsdale FSDO",
      "since": 2023,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 47,
      "responseHours": 12,
      "fees": {
        "ppl": 875,
        "ir": 975,
        "me": 975
      },
      "soonest": 13,
      "gap": 2,
      "count": 10,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1325,
          "costModel": {
            "examinerFee": 1325,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 825,
            "retestRentalHours": 1.3,
            "retestDualHours": 1.5
          }
        }
      ],
      "sample": {
        "rental": 160,
        "lodging": 130,
        "noShow": 250,
        "avgDaysToNext": 14,
        "leadDays": 19,
        "reviewList": [
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Tough systems questions but fair."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 160,
          "me": 352
        },
        "cfiRatePerHr": 85,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 90,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 130,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 550,
            "retestRentalHours": 1.2,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 1.4,
            "retestDualHours": 2
          },
          "me": {
            "examinerFee": 975,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 0.8,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "az07",
      "name": "Lachlan Petterssen",
      "home": "KFFZ",
      "travelNm": 50,
      "travelFee": 75,
      "retestFee": 600,
      "fsdo": "Scottsdale FSDO",
      "since": 2022,
      "languages": [
        "English"
      ],
      "rating": 4.4,
      "reviews": 194,
      "responseHours": 2,
      "fees": {
        "ppl": 925,
        "me": 950,
        "cfi": 1425
      },
      "soonest": 13,
      "gap": 5,
      "count": 8,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant normally provides the aircraft. A Cessna 172 is available to rent for the test by arrangement (example: $177/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 177,
        "lodging": 163,
        "noShow": 250,
        "avgDaysToNext": 12,
        "leadDays": 27,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
          },
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Firm on standards, generous with teaching tips."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 177,
          "me": 441
        },
        "cfiRatePerHr": 85,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 163,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 600,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 950,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 625,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1425,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 925,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "az08",
      "name": "Coralie Dunsmore",
      "home": "KFFZ",
      "travelNm": 30,
      "travelFee": 125,
      "retestFee": 500,
      "fsdo": "Scottsdale FSDO",
      "since": 2007,
      "languages": [
        "English"
      ],
      "rating": 4.4,
      "reviews": 126,
      "responseHours": 36,
      "fees": {
        "ppl": 825,
        "ir": 825,
        "cpl": 950
      },
      "soonest": 7,
      "gap": 7,
      "count": 10,
      "bio": "Rotorcraft and airplane examiner serving helicopter schools in the area.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft or helicopter (R22/R44 typical). Bring all maintenance logbooks.",
      "otherAuthorizations": [
        {
          "id": "rh",
          "name": "Rotorcraft-Helicopter (Private/Commercial/Instrument)",
          "detail": "Rotorcraft Helicopter",
          "fee": 950
        }
      ],
      "sample": {
        "rental": 188,
        "lodging": 149,
        "noShow": 200,
        "avgDaysToNext": 5,
        "leadDays": 12,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Exact on maneuvers tolerances, fair debrief."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Calm and professional, easy to talk to before the test."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 188,
          "me": 374
        },
        "cfiRatePerHr": 85,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 125,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 149,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 825,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.3,
            "retestDualHours": 1
          },
          "cpl": {
            "examinerFee": 950,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.3,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "az09",
      "name": "Abelardo Ruelas",
      "home": "KIWA",
      "travelNm": 80,
      "travelFee": 100,
      "retestFee": 575,
      "fsdo": "Scottsdale FSDO",
      "since": 2009,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.6,
      "reviews": 153,
      "responseHours": 18,
      "fees": {
        "ppl": 825,
        "ir": 850,
        "cfi": 1375,
        "cfii": 1125
      },
      "soonest": 26,
      "gap": 4,
      "count": 12,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 169,
        "lodging": 158,
        "noShow": 300,
        "avgDaysToNext": 23,
        "leadDays": 40,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 169,
          "me": 422
        },
        "cfiRatePerHr": 85,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 80,
          "travelFee": 100,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 158,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.2,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 850,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 1.2,
            "retestDualHours": 2.5
          },
          "cfi": {
            "examinerFee": 1375,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 950,
            "retestRentalHours": 1.1,
            "retestDualHours": 1
          },
          "cfii": {
            "examinerFee": 1125,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 800,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "az10",
      "name": "Verity Hawksworth",
      "home": "KIWA",
      "travelNm": 90,
      "travelFee": 175,
      "retestFee": 500,
      "fsdo": "Scottsdale FSDO",
      "since": 2005,
      "languages": [
        "English"
      ],
      "rating": 4.8,
      "reviews": 129,
      "responseHours": 12,
      "fees": {
        "ppl": 850,
        "ir": 825,
        "cpl": 850
      },
      "soonest": 46,
      "gap": 2,
      "count": 8,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 185,
        "lodging": 122,
        "noShow": 150,
        "avgDaysToNext": 51,
        "leadDays": 53,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 185,
          "me": 332
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 90,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 122,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 850,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 825,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.2,
            "retestDualHours": 1
          },
          "cpl": {
            "examinerFee": 850,
            "rentalHoursTest": 2,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "az11",
      "name": "Emmett Saltmarsh",
      "home": "KCHD",
      "travelNm": 60,
      "travelFee": 100,
      "retestFee": 525,
      "fsdo": "Scottsdale FSDO",
      "since": 2018,
      "languages": [
        "English",
        "Spanish",
        "French"
      ],
      "rating": 4.4,
      "reviews": 47,
      "responseHours": 24,
      "fees": {
        "ir": 975,
        "cpl": 1025,
        "me": 1000
      },
      "soonest": 26,
      "gap": 3,
      "count": 6,
      "bio": "Former airline check airman; ATP and multi-engine rides are a large share of the calendar.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1375,
          "costModel": {
            "examinerFee": 1375,
            "rentalHoursTest": 2,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 750,
            "retestRentalHours": 1.5,
            "retestDualHours": 1.5
          }
        }
      ],
      "sample": {
        "rental": 174,
        "lodging": 141,
        "noShow": 250,
        "avgDaysToNext": 29,
        "leadDays": 33,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Knows the twin inside out."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 174,
          "me": 362
        },
        "cfiRatePerHr": 85,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 100,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 141,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.2,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.4,
            "retestDualHours": 1
          },
          "me": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.2,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 550,
            "retestRentalHours": 1.3,
            "retestDualHours": 1
          }
        }
      }
    },
    {
      "id": "az12",
      "name": "Xochitl Barragán-Ames",
      "home": "KCHD",
      "travelNm": 90,
      "travelFee": 150,
      "retestFee": 625,
      "fsdo": "Scottsdale FSDO",
      "since": 2017,
      "languages": [
        "English"
      ],
      "rating": 4.5,
      "reviews": 85,
      "responseHours": 8,
      "fees": {
        "ppl": 875,
        "ir": 875
      },
      "soonest": 18,
      "gap": 3,
      "count": 11,
      "bio": "Instrument specialist. Expect a full approach set and a thorough systems and weather oral.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 177,
        "lodging": 115,
        "noShow": 150,
        "avgDaysToNext": 16,
        "leadDays": 30,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 4,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Tough systems questions but fair."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 177,
          "me": 361
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 90,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 115,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 625,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 875,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 625,
            "retestRentalHours": 1.2,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "az13",
      "name": "Odell Wickersham",
      "home": "KGEU",
      "travelNm": 100,
      "travelFee": 250,
      "retestFee": 500,
      "fsdo": "Scottsdale FSDO",
      "since": 2006,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.5,
      "reviews": 118,
      "responseHours": 48,
      "fees": {
        "ppl": 925,
        "ir": 925,
        "cpl": 1025
      },
      "soonest": 7,
      "gap": 4,
      "count": 12,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 148,
        "lodging": 114,
        "noShow": 300,
        "avgDaysToNext": 9,
        "leadDays": 14,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Exact on maneuvers tolerances, fair debrief."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 148,
          "me": 378
        },
        "cfiRatePerHr": 80,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 114,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.3,
            "retestDualHours": 1
          },
          "ir": {
            "examinerFee": 925,
            "rentalHoursTest": 2.3,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.4,
            "retestDualHours": 1
          }
        }
      }
    },
    {
      "id": "az14",
      "name": "Sigrid Haugland",
      "home": "KGYR",
      "travelNm": 75,
      "travelFee": 175,
      "retestFee": 475,
      "fsdo": "Scottsdale FSDO",
      "since": 2011,
      "languages": [
        "English",
        "German"
      ],
      "rating": 4.8,
      "reviews": 63,
      "responseHours": 24,
      "fees": {
        "ppl": 775,
        "ir": 850,
        "cpl": 850,
        "cfi": 1325,
        "cfii": 1000
      },
      "soonest": 69,
      "gap": 3,
      "count": 12,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant normally provides the aircraft. A Piper PA-28 Archer is available to rent for the test by arrangement (example: $142/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 142,
        "lodging": 132,
        "noShow": 300,
        "avgDaysToNext": 68,
        "leadDays": 74,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Firm on standards, generous with teaching tips."
          },
          {
            "cert": "cfii",
            "stars": 4,
            "text": "Good debrief on instrument instruction."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 142,
          "me": 433
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 75,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 132,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 775,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.2,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 850,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 850,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1325,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 800,
            "retestRentalHours": 0.9,
            "retestDualHours": 1.5
          },
          "cfii": {
            "examinerFee": 1000,
            "rentalHoursTest": 2,
            "cfiPrepHours": 2,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 1.3,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "az15",
      "name": "Ramiro Espinoza-Kidd",
      "home": "KGYR",
      "travelNm": 40,
      "travelFee": 125,
      "retestFee": 450,
      "fsdo": "Scottsdale FSDO",
      "since": 2012,
      "languages": [
        "English",
        "German"
      ],
      "rating": 5,
      "reviews": 142,
      "responseHours": 24,
      "fees": {
        "ir": 900,
        "cpl": 950,
        "me": 1025
      },
      "soonest": 10,
      "gap": 7,
      "count": 8,
      "bio": "Former airline check airman; ATP and multi-engine rides are a large share of the calendar.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "A Piper Seminole twin is available for multi-engine checkrides by arrangement (example: $401/hr wet). Otherwise applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1325,
          "costModel": {
            "examinerFee": 1325,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          }
        }
      ],
      "sample": {
        "rental": 163,
        "lodging": 116,
        "noShow": 300,
        "avgDaysToNext": 9,
        "leadDays": 23,
        "reviewList": [
          {
            "cert": "me",
            "stars": 5,
            "text": "Knows the twin inside out."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 163,
          "me": 401
        },
        "cfiRatePerHr": 80,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 40,
          "travelFee": 125,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 116,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ir": {
            "examinerFee": 900,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 450,
            "retestRentalHours": 0.9,
            "retestDualHours": 3
          },
          "cpl": {
            "examinerFee": 950,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "az16",
      "name": "Cordelia Fairbrother",
      "home": "KPHX",
      "travelNm": 60,
      "travelFee": 175,
      "retestFee": 575,
      "fsdo": "Scottsdale FSDO",
      "since": 2021,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.6,
      "reviews": 75,
      "responseHours": 48,
      "fees": {
        "ppl": 875,
        "ir": 900,
        "cpl": 875,
        "sport": 675
      },
      "soonest": 54,
      "gap": 4,
      "count": 10,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant normally provides the aircraft. A Piper PA-28 Archer is available to rent for the test by arrangement (example: $142/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 142,
        "lodging": 173,
        "noShow": 150,
        "avgDaysToNext": 52,
        "leadDays": 57,
        "reviewList": [
          {
            "cert": "sport",
            "stars": 5,
            "text": "Relaxed but exact."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Scenario-based oral, kept me thinking."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 142,
          "me": 388
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 173,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 900,
            "rentalHoursTest": 2.3,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 575,
            "retestRentalHours": 0.9,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 0.9,
            "retestDualHours": 1
          },
          "sport": {
            "examinerFee": 675,
            "rentalHoursTest": 1.2,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 450,
            "retestRentalHours": 1.2,
            "retestDualHours": 1
          }
        }
      }
    },
    {
      "id": "az17",
      "name": "Nnamdi Okeke-Ward",
      "home": "KCGZ",
      "travelNm": 90,
      "travelFee": 250,
      "retestFee": 575,
      "fsdo": "Scottsdale FSDO",
      "since": 2022,
      "languages": [
        "English",
        "Navajo"
      ],
      "rating": 4.9,
      "reviews": 166,
      "responseHours": 18,
      "fees": {
        "ir": 900
      },
      "soonest": 27,
      "gap": 5,
      "count": 6,
      "bio": "Primary-training examiner who keeps the oral scenario-based and the flight on schedule.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 169,
        "lodging": 158,
        "noShow": 300,
        "avgDaysToNext": 28,
        "leadDays": 35,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Full approach set, very well organized."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 169,
          "me": 369
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 90,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 158,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ir": {
            "examinerFee": 900,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.5,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "az18",
      "name": "Rosalba Quiñones-Hart",
      "home": "KTUS",
      "travelNm": 90,
      "travelFee": 75,
      "retestFee": 550,
      "fsdo": "Scottsdale FSDO",
      "since": 2019,
      "languages": [
        "English"
      ],
      "rating": 4.9,
      "reviews": 170,
      "responseHours": 4,
      "fees": {
        "ppl": 925,
        "cpl": 1100,
        "sport": 850
      },
      "soonest": 35,
      "gap": 4,
      "count": 11,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 171,
        "lodging": 142,
        "noShow": 150,
        "avgDaysToNext": 38,
        "leadDays": 40,
        "reviewList": [
          {
            "cert": "sport",
            "stars": 4,
            "text": "Relaxed but exact."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 171,
          "me": 417
        },
        "cfiRatePerHr": 80,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 90,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 142,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 550,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 1100,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          },
          "sport": {
            "examinerFee": 850,
            "rentalHoursTest": 1,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 0.9,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "az19",
      "name": "Barnaby Treadwell",
      "home": "KTUS",
      "travelNm": 75,
      "travelFee": 150,
      "retestFee": 600,
      "fsdo": "Scottsdale FSDO",
      "since": 2015,
      "languages": [
        "English",
        "Navajo"
      ],
      "rating": 4.7,
      "reviews": 94,
      "responseHours": 6,
      "fees": {
        "ir": 1000,
        "cpl": 1100
      },
      "soonest": 67,
      "gap": 2,
      "count": 10,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 183,
        "lodging": 115,
        "noShow": 200,
        "avgDaysToNext": 68,
        "leadDays": 78,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Structured day, finished early."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 183,
          "me": 371
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 75,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 115,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ir": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 0.8,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 1100,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.4,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "az20",
      "name": "Ilse Wennerholm",
      "home": "KRYN",
      "travelNm": 50,
      "travelFee": 150,
      "retestFee": 525,
      "fsdo": "Scottsdale FSDO",
      "since": 2008,
      "languages": [
        "English"
      ],
      "rating": 4.9,
      "reviews": 137,
      "responseHours": 18,
      "fees": {
        "ppl": 825,
        "ir": 825,
        "cfi": 1375,
        "cfii": 1000
      },
      "soonest": 67,
      "gap": 7,
      "count": 8,
      "bio": "Holds rotorcraft-helicopter authorizations alongside airplane ratings.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft or helicopter (R22/R44 typical). Bring all maintenance logbooks.",
      "otherAuthorizations": [
        {
          "id": "rh",
          "name": "Rotorcraft-Helicopter (Private/Commercial/Instrument)",
          "detail": "Rotorcraft Helicopter",
          "fee": 925
        }
      ],
      "sample": {
        "rental": 180,
        "lodging": 144,
        "noShow": 200,
        "avgDaysToNext": 65,
        "leadDays": 70,
        "reviewList": [
          {
            "cert": "cfii",
            "stars": 5,
            "text": "Asked me to teach an approach from the right seat."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 180,
          "me": 398
        },
        "cfiRatePerHr": 80,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 144,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 825,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 0.9,
            "retestDualHours": 2
          },
          "cfi": {
            "examinerFee": 1375,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 900,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "cfii": {
            "examinerFee": 1000,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.2,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "az21",
      "name": "Ignatius Morrow-Blake",
      "home": "KRYN",
      "travelNm": 30,
      "travelFee": 150,
      "retestFee": 675,
      "fsdo": "Scottsdale FSDO",
      "since": 2015,
      "languages": [
        "English"
      ],
      "rating": 4.5,
      "reviews": 91,
      "responseHours": 12,
      "fees": {
        "ppl": 900,
        "cpl": 1000,
        "cfi": 1450
      },
      "soonest": 42,
      "gap": 4,
      "count": 9,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 170,
        "lodging": 160,
        "noShow": 200,
        "avgDaysToNext": 41,
        "leadDays": 48,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 170,
          "me": 356
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 160,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 900,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.2,
            "retestDualHours": 3
          },
          "cpl": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 750,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "cfi": {
            "examinerFee": 1450,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 1100,
            "retestRentalHours": 1.4,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "az22",
      "name": "Pallavi Ramakrishnan",
      "home": "KAVQ",
      "travelNm": 80,
      "travelFee": 250,
      "retestFee": 575,
      "fsdo": "Scottsdale FSDO",
      "since": 2015,
      "languages": [
        "English"
      ],
      "rating": 5,
      "reviews": 68,
      "responseHours": 12,
      "fees": {
        "ppl": 1025,
        "ir": 975
      },
      "soonest": 21,
      "gap": 7,
      "count": 12,
      "bio": "Former instrument ground school instructor; expects clean IACRA and logbook endorsements.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 194,
        "lodging": 125,
        "noShow": 250,
        "avgDaysToNext": 23,
        "leadDays": 25,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Scenario-based oral, kept me thinking."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 194,
          "me": 330
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 80,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 125,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1025,
            "rentalHoursTest": 2,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.5,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "az23",
      "name": "Stellan Brightman",
      "home": "KPRC",
      "travelNm": 100,
      "travelFee": 100,
      "retestFee": 600,
      "fsdo": "Scottsdale FSDO",
      "since": 2010,
      "languages": [
        "English"
      ],
      "rating": 4.9,
      "reviews": 99,
      "responseHours": 2,
      "fees": {
        "ppl": 925,
        "ir": 1000,
        "cpl": 1000,
        "me": 1050
      },
      "soonest": 35,
      "gap": 3,
      "count": 10,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft. Twins must have a current weight & balance on board.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1350,
          "costModel": {
            "examinerFee": 1350,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 875,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          }
        }
      ],
      "sample": {
        "rental": 165,
        "lodging": 166,
        "noShow": 250,
        "avgDaysToNext": 37,
        "leadDays": 41,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Knows the twin inside out."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 165,
          "me": 339
        },
        "cfiRatePerHr": 80,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 100,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 166,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 600,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.2,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 1000,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.2,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 1050,
            "rentalHoursTest": 2,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 675,
            "retestRentalHours": 0.9,
            "retestDualHours": 1
          }
        }
      }
    },
    {
      "id": "az24",
      "name": "Guadalupe Arellano-Moss",
      "home": "KPRC",
      "travelNm": 30,
      "travelFee": 150,
      "retestFee": 575,
      "fsdo": "Scottsdale FSDO",
      "since": 2019,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 145,
      "responseHours": 12,
      "fees": {
        "ppl": 925,
        "cpl": 1050,
        "sport": 725
      },
      "soonest": 27,
      "gap": 4,
      "count": 11,
      "bio": "Sport pilot and LSA-friendly examiner; relaxed tone, exact standards.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 172,
        "lodging": 170,
        "noShow": 150,
        "avgDaysToNext": 32,
        "leadDays": 31,
        "reviewList": [
          {
            "cert": "sport",
            "stars": 5,
            "text": "Relaxed but exact."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 172,
          "me": 343
        },
        "cfiRatePerHr": 60,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 170,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.2,
            "retestDualHours": 3
          },
          "sport": {
            "examinerFee": 725,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 450,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "az25",
      "name": "Merritt Coldiron",
      "home": "KPRC",
      "travelNm": 60,
      "travelFee": 75,
      "retestFee": 675,
      "fsdo": "Scottsdale FSDO",
      "since": 2021,
      "languages": [
        "English"
      ],
      "rating": 4.6,
      "reviews": 221,
      "responseHours": 24,
      "fees": {
        "ppl": 975,
        "ir": 1000,
        "cpl": 1000
      },
      "soonest": 35,
      "gap": 4,
      "count": 10,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 154,
        "lodging": 123,
        "noShow": 250,
        "avgDaysToNext": 32,
        "leadDays": 38,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 154,
          "me": 387
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 123,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.2,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 700,
            "retestRentalHours": 1.5,
            "retestDualHours": 3
          },
          "cpl": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 700,
            "retestRentalHours": 1.4,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "az26",
      "name": "Annabeth Silversmith",
      "home": "KFLG",
      "travelNm": 75,
      "travelFee": 175,
      "retestFee": 550,
      "fsdo": "Scottsdale FSDO",
      "since": 2017,
      "languages": [
        "English",
        "Spanish",
        "French"
      ],
      "rating": 4.4,
      "reviews": 95,
      "responseHours": 4,
      "fees": {
        "ppl": 875,
        "ir": 875,
        "me": 975
      },
      "soonest": 13,
      "gap": 2,
      "count": 7,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft. Twins must have a current weight & balance on board.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1200,
          "costModel": {
            "examinerFee": 1200,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 2,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 750,
            "retestRentalHours": 1.1,
            "retestDualHours": 3
          }
        }
      ],
      "sample": {
        "rental": 160,
        "lodging": 170,
        "noShow": 200,
        "avgDaysToNext": 10,
        "leadDays": 16,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Knows the twin inside out."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 160,
          "me": 440
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 75,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 170,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 550,
            "retestRentalHours": 0.9,
            "retestDualHours": 1
          },
          "ir": {
            "examinerFee": 875,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 550,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 975,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 1.3,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "az27",
      "name": "Torsten Viklund",
      "home": "KSEZ",
      "travelNm": 30,
      "travelFee": 150,
      "retestFee": 550,
      "fsdo": "Scottsdale FSDO",
      "since": 2005,
      "languages": [
        "English",
        "German"
      ],
      "rating": 4.9,
      "reviews": 163,
      "responseHours": 36,
      "fees": {
        "ppl": 900,
        "ir": 900,
        "cpl": 975,
        "cfi": 1475,
        "cfii": 1050
      },
      "soonest": 7,
      "gap": 7,
      "count": 12,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant normally provides the aircraft. A Cessna 172 is available to rent for the test by arrangement (example: $175/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 175,
        "lodging": 125,
        "noShow": 200,
        "avgDaysToNext": 5,
        "leadDays": 17,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 4,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Firm on standards, generous with teaching tips."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 175,
          "me": 360
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 125,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 900,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 550,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 900,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 550,
            "retestRentalHours": 1.2,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "cfi": {
            "examinerFee": 1475,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 875,
            "retestRentalHours": 1.4,
            "retestDualHours": 1
          },
          "cfii": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 625,
            "retestRentalHours": 1.1,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "az28",
      "name": "Yolanda Ceballos-Reed",
      "home": "KSOW",
      "travelNm": 50,
      "travelFee": 150,
      "retestFee": 625,
      "fsdo": "Scottsdale FSDO",
      "since": 2022,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.5,
      "reviews": 57,
      "responseHours": 18,
      "fees": {
        "ppl": 875,
        "ir": 850,
        "cpl": 900,
        "cfi": 1475
      },
      "soonest": 7,
      "gap": 2,
      "count": 7,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion. White Mountains based; happy to fly to Payson and Holbrook.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 183,
        "lodging": 135,
        "noShow": 250,
        "avgDaysToNext": 5,
        "leadDays": 12,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Tough systems questions but fair."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 183,
          "me": 392
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 135,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 625,
            "retestRentalHours": 1.5,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 850,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 0.8,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 900,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 625,
            "retestRentalHours": 0.8,
            "retestDualHours": 1
          },
          "cfi": {
            "examinerFee": 1475,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 1025,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "az29",
      "name": "Hartley Pennock",
      "home": "KIFP",
      "travelNm": 50,
      "travelFee": 150,
      "retestFee": 450,
      "fsdo": "Scottsdale FSDO",
      "since": 2009,
      "languages": [
        "English",
        "Navajo"
      ],
      "rating": 4.6,
      "reviews": 189,
      "responseHours": 2,
      "fees": {
        "ppl": 875,
        "ir": 925,
        "cfi": 1450,
        "sport": 750
      },
      "soonest": 26,
      "gap": 7,
      "count": 6,
      "bio": "Sport pilot and LSA-friendly examiner; relaxed tone, exact standards. Mohave County; travels to Kingman and Lake Havasu City.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 151,
        "lodging": 116,
        "noShow": 200,
        "avgDaysToNext": 31,
        "leadDays": 36,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Firm on standards, generous with teaching tips."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 151,
          "me": 379
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 116,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 0.9,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 925,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          },
          "cfi": {
            "examinerFee": 1450,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 725,
            "retestRentalHours": 1.3,
            "retestDualHours": 3
          },
          "sport": {
            "examinerFee": 750,
            "rentalHoursTest": 1.1,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 375,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "az30",
      "name": "Elsbeth Marrowfield",
      "home": "KNYL",
      "travelNm": 30,
      "travelFee": 150,
      "retestFee": 500,
      "fsdo": "Scottsdale FSDO",
      "since": 2007,
      "languages": [
        "English",
        "Spanish",
        "French"
      ],
      "rating": 4.9,
      "reviews": 145,
      "responseHours": 2,
      "fees": {
        "ppl": 825,
        "ir": 850,
        "cpl": 975,
        "sport": 675
      },
      "soonest": 20,
      "gap": 4,
      "count": 7,
      "bio": "Sport pilot and LSA-friendly examiner; relaxed tone, exact standards. Yuma based; Phoenix-area rides by arrangement.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 146,
        "lodging": 136,
        "noShow": 150,
        "avgDaysToNext": 26,
        "leadDays": 30,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          },
          {
            "cert": "sport",
            "stars": 5,
            "text": "Relaxed but exact."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 146,
          "me": 439
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 136,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.2,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 850,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 0.9,
            "retestDualHours": 3
          },
          "cpl": {
            "examinerFee": 975,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.3,
            "retestDualHours": 2
          },
          "sport": {
            "examinerFee": 675,
            "rentalHoursTest": 1.2,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 400,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          }
        }
      }
    }
  ];

  const data = { region: { name: "Arizona", short: "AZ" }, airports, dpes, fictional: true };
  if (typeof module !== "undefined" && module.exports) module.exports = data;
  if (root) root.CC_SAMPLE_AZ = data;
})(typeof window !== "undefined" ? window : null);
