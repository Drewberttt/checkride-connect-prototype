// FICTIONAL SAMPLE DATA - invented examiners for UI development, not real people; airport identifiers are real.
//
// 30 invented Texas examiners for the Checkride Connect prototype (/workspace/checkride-connect).
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
//   - airports: Texas airports (same fields as data.js airports). Every home is in this list.
//
// Use (browser), load after data.js. APPEND, do not replace (data.js seededBookings/school reference d1, d2, d9):
//   <script src="sample-tx-examiners.js"></script>
//   CC_DATA.airports.push(...CC_SAMPLE_TX.airports); CC_DATA.dpes.push(...CC_SAMPLE_TX.dpes);  // ids tx01..tx30
// Checkride Connect copy (B, Oct 29 2026): identical to /workspace/checkride-pm/data/sample-tx-examiners.js except a "tz" (IANA) on each airport, from data.js airportTz (D38).
// Node: const { dpes, airports } = require("./sample-tx-examiners.js");
(function (root) {
  const airports = [
    {
      "id": "KADS",
      "name": "Addison",
      "city": "Addison",
      "lat": 32.968,
      "lng": -96.836,
      "tz": "America/Chicago"
    },
    {
      "id": "KDAL",
      "name": "Dallas Love Field",
      "city": "Dallas",
      "lat": 32.847,
      "lng": -96.852,
      "tz": "America/Chicago"
    },
    {
      "id": "KTKI",
      "name": "McKinney National",
      "city": "McKinney",
      "lat": 33.177,
      "lng": -96.59,
      "tz": "America/Chicago"
    },
    {
      "id": "KTYR",
      "name": "Tyler Pounds Regional",
      "city": "Tyler",
      "lat": 32.354,
      "lng": -95.402,
      "tz": "America/Chicago"
    },
    {
      "id": "KFTW",
      "name": "Fort Worth Meacham Intl",
      "city": "Fort Worth",
      "lat": 32.82,
      "lng": -97.362,
      "tz": "America/Chicago"
    },
    {
      "id": "KAFW",
      "name": "Fort Worth Alliance",
      "city": "Fort Worth",
      "lat": 32.99,
      "lng": -97.319,
      "tz": "America/Chicago"
    },
    {
      "id": "KGKY",
      "name": "Arlington Municipal",
      "city": "Arlington",
      "lat": 32.664,
      "lng": -97.094,
      "tz": "America/Chicago"
    },
    {
      "id": "KGPM",
      "name": "Grand Prairie Municipal",
      "city": "Grand Prairie",
      "lat": 32.699,
      "lng": -97.047,
      "tz": "America/Chicago"
    },
    {
      "id": "KDTO",
      "name": "Denton Enterprise",
      "city": "Denton",
      "lat": 33.201,
      "lng": -97.198,
      "tz": "America/Chicago"
    },
    {
      "id": "KACT",
      "name": "Waco Regional",
      "city": "Waco",
      "lat": 31.611,
      "lng": -97.23,
      "tz": "America/Chicago"
    },
    {
      "id": "KHOU",
      "name": "William P. Hobby",
      "city": "Houston",
      "lat": 29.645,
      "lng": -95.279,
      "tz": "America/Chicago"
    },
    {
      "id": "KDWH",
      "name": "David Wayne Hooks Memorial",
      "city": "Spring",
      "lat": 30.062,
      "lng": -95.553,
      "tz": "America/Chicago"
    },
    {
      "id": "KSGR",
      "name": "Sugar Land Regional",
      "city": "Sugar Land",
      "lat": 29.622,
      "lng": -95.657,
      "tz": "America/Chicago"
    },
    {
      "id": "KCXO",
      "name": "Conroe-North Houston Regional",
      "city": "Conroe",
      "lat": 30.352,
      "lng": -95.415,
      "tz": "America/Chicago"
    },
    {
      "id": "KEFD",
      "name": "Ellington",
      "city": "Houston",
      "lat": 29.607,
      "lng": -95.159,
      "tz": "America/Chicago"
    },
    {
      "id": "KAUS",
      "name": "Austin-Bergstrom Intl",
      "city": "Austin",
      "lat": 30.195,
      "lng": -97.67,
      "tz": "America/Chicago"
    },
    {
      "id": "KEDC",
      "name": "Austin Executive",
      "city": "Austin",
      "lat": 30.398,
      "lng": -97.567,
      "tz": "America/Chicago"
    },
    {
      "id": "KGTU",
      "name": "Georgetown Executive",
      "city": "Georgetown",
      "lat": 30.679,
      "lng": -97.679,
      "tz": "America/Chicago"
    },
    {
      "id": "KHYI",
      "name": "San Marcos Regional",
      "city": "San Marcos",
      "lat": 29.893,
      "lng": -97.863,
      "tz": "America/Chicago"
    },
    {
      "id": "KSAT",
      "name": "San Antonio Intl",
      "city": "San Antonio",
      "lat": 29.534,
      "lng": -98.47,
      "tz": "America/Chicago"
    },
    {
      "id": "KSSF",
      "name": "Stinson Municipal",
      "city": "San Antonio",
      "lat": 29.337,
      "lng": -98.471,
      "tz": "America/Chicago"
    },
    {
      "id": "KCRP",
      "name": "Corpus Christi Intl",
      "city": "Corpus Christi",
      "lat": 27.77,
      "lng": -97.501,
      "tz": "America/Chicago"
    },
    {
      "id": "KLBB",
      "name": "Lubbock Preston Smith Intl",
      "city": "Lubbock",
      "lat": 33.664,
      "lng": -101.823,
      "tz": "America/Chicago"
    },
    {
      "id": "KAMA",
      "name": "Rick Husband Amarillo Intl",
      "city": "Amarillo",
      "lat": 35.219,
      "lng": -101.706,
      "tz": "America/Chicago"
    },
    {
      "id": "KMAF",
      "name": "Midland Intl",
      "city": "Midland",
      "lat": 31.943,
      "lng": -102.202,
      "tz": "America/Chicago"
    },
    {
      "id": "KELP",
      "name": "El Paso Intl",
      "city": "El Paso",
      "lat": 31.807,
      "lng": -106.378,
      "tz": "America/Denver"
    }
  ];

  const dpes = [
    {
      "id": "tx01",
      "name": "Arliss Fenwright",
      "home": "KADS",
      "travelNm": 60,
      "travelFee": 175,
      "retestFee": 575,
      "fsdo": "Dallas FSDO",
      "since": 2017,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.7,
      "reviews": 10,
      "responseHours": 4,
      "fees": {
        "ppl": 825
      },
      "soonest": 13,
      "gap": 4,
      "count": 7,
      "bio": "Private and instrument checkrides for local flight schools and independent CFIs.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 194,
        "lodging": 129,
        "noShow": 200,
        "avgDaysToNext": 17,
        "leadDays": 25,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
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
          "se": 194,
          "me": 388
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 129,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx02",
      "name": "Corabel Huckstep",
      "home": "KADS",
      "travelNm": 90,
      "travelFee": 150,
      "retestFee": 525,
      "fsdo": "Dallas FSDO",
      "since": 2016,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.5,
      "reviews": 43,
      "responseHours": 3,
      "fees": {
        "ppl": 975,
        "ir": 925
      },
      "soonest": 56,
      "gap": 7,
      "count": 6,
      "bio": "Primary-training examiner who keeps the oral scenario-based and the flight on schedule.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 150,
        "lodging": 142,
        "noShow": 200,
        "avgDaysToNext": 54,
        "leadDays": 63,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 150,
          "me": 394
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 90,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 142,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.2,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 925,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "tx03",
      "name": "Leandro Quezada-Ruiz",
      "home": "KDAL",
      "travelNm": 60,
      "travelFee": 150,
      "retestFee": 525,
      "fsdo": "Dallas FSDO",
      "since": 2005,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.5,
      "reviews": 90,
      "responseHours": 8,
      "fees": {
        "ppl": 1025,
        "ir": 1025
      },
      "soonest": 40,
      "gap": 6,
      "count": 9,
      "bio": "Private and instrument checkrides for local flight schools and independent CFIs.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant normally provides the aircraft. A Piper PA-28 Archer is available to rent for the test by arrangement (example: $164/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 164,
        "lodging": 172,
        "noShow": 250,
        "avgDaysToNext": 44,
        "leadDays": 43,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
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
          "se": 164,
          "me": 430
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 172,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 1025,
            "rentalHoursTest": 2,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "tx04",
      "name": "Maebelle Strickhorn",
      "home": "KTKI",
      "travelNm": 90,
      "travelFee": 200,
      "retestFee": 475,
      "fsdo": "Dallas FSDO",
      "since": 2024,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.7,
      "reviews": 38,
      "responseHours": 24,
      "fees": {
        "ppl": 775,
        "ir": 850,
        "cpl": 950,
        "cfi": 1375,
        "cfii": 1000
      },
      "soonest": 7,
      "gap": 7,
      "count": 12,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 181,
        "lodging": 142,
        "noShow": 200,
        "avgDaysToNext": 13,
        "leadDays": 12,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
          },
          {
            "cert": "cfii",
            "stars": 5,
            "text": "Asked me to teach an approach from the right seat."
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
          "se": 181,
          "me": 347
        },
        "cfiRatePerHr": 60,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 90,
          "travelFee": 200,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 142,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 775,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.3,
            "retestDualHours": 1
          },
          "ir": {
            "examinerFee": 850,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 0.9,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 950,
            "rentalHoursTest": 2,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 600,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "cfi": {
            "examinerFee": 1375,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 850,
            "retestRentalHours": 1,
            "retestDualHours": 2
          },
          "cfii": {
            "examinerFee": 1000,
            "rentalHoursTest": 2.3,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 625,
            "retestRentalHours": 1.5,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx05",
      "name": "Thornton Ashgrove",
      "home": "KTKI",
      "travelNm": 100,
      "travelFee": 150,
      "retestFee": 425,
      "fsdo": "Dallas FSDO",
      "since": 2024,
      "languages": [
        "English"
      ],
      "rating": 4.4,
      "reviews": 119,
      "responseHours": 3,
      "fees": {
        "ppl": 850,
        "ir": 925,
        "cpl": 975,
        "sport": 725
      },
      "soonest": 55,
      "gap": 4,
      "count": 10,
      "bio": "Sport pilot and LSA-friendly examiner; relaxed tone, exact standards.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 152,
        "lodging": 129,
        "noShow": 150,
        "avgDaysToNext": 52,
        "leadDays": 64,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 4,
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
          "se": 152,
          "me": 399
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 129,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 850,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 425,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 925,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.2,
            "retestDualHours": 1
          },
          "sport": {
            "examinerFee": 725,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 375,
            "retestRentalHours": 1.5,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "tx06",
      "name": "Graciela Montemayor-Lund",
      "home": "KTYR",
      "travelNm": 80,
      "travelFee": 150,
      "retestFee": 675,
      "fsdo": "Dallas FSDO",
      "since": 2013,
      "languages": [
        "English"
      ],
      "rating": 4.4,
      "reviews": 210,
      "responseHours": 36,
      "fees": {
        "ppl": 1050,
        "ir": 975,
        "sport": 850
      },
      "soonest": 11,
      "gap": 4,
      "count": 12,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 186,
        "lodging": 158,
        "noShow": 150,
        "avgDaysToNext": 14,
        "leadDays": 19,
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
            "stars": 5,
            "text": "Tough systems questions but fair."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 186,
          "me": 427
        },
        "cfiRatePerHr": 55,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 80,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 158,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 675,
            "retestRentalHours": 0.8,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 625,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          },
          "sport": {
            "examinerFee": 850,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 550,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx07",
      "name": "Dashiell Pruneda",
      "home": "KFTW",
      "travelNm": 60,
      "travelFee": 250,
      "retestFee": 625,
      "fsdo": "Fort Worth FSDO",
      "since": 2024,
      "languages": [
        "English"
      ],
      "rating": 4.5,
      "reviews": 129,
      "responseHours": 36,
      "fees": {
        "ppl": 975,
        "ir": 1050,
        "cpl": 1000,
        "cfi": 1550,
        "cfii": 1175
      },
      "soonest": 35,
      "gap": 2,
      "count": 9,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 177,
        "lodging": 163,
        "noShow": 300,
        "avgDaysToNext": 37,
        "leadDays": 47,
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
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 177,
          "me": 378
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 163,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 625,
            "retestRentalHours": 0.9,
            "retestDualHours": 1
          },
          "ir": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 675,
            "retestRentalHours": 0.8,
            "retestDualHours": 1
          },
          "cpl": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.2,
            "retestDualHours": 3
          },
          "cfi": {
            "examinerFee": 1550,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 1000,
            "retestRentalHours": 1.2,
            "retestDualHours": 1.5
          },
          "cfii": {
            "examinerFee": 1175,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 775,
            "retestRentalHours": 0.8,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "tx08",
      "name": "Odessa Kittredge",
      "home": "KAFW",
      "travelNm": 100,
      "travelFee": 200,
      "retestFee": 450,
      "fsdo": "Fort Worth FSDO",
      "since": 2010,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 123,
      "responseHours": 36,
      "fees": {
        "ppl": 875,
        "ir": 825,
        "cpl": 875,
        "me": 1000
      },
      "soonest": 47,
      "gap": 4,
      "count": 8,
      "bio": "Holds rotorcraft-helicopter authorizations alongside airplane ratings.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
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
        "rental": 141,
        "lodging": 162,
        "noShow": 300,
        "avgDaysToNext": 50,
        "leadDays": 55,
        "reviewList": [
          {
            "cert": "me",
            "stars": 5,
            "text": "Knows the twin inside out."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
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
          "se": 141,
          "me": 425
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 200,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 162,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 1.5,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 825,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 425,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "me": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.2,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "tx09",
      "name": "Benedikt Ravensdale",
      "home": "KGKY",
      "travelNm": 30,
      "travelFee": 150,
      "retestFee": 525,
      "fsdo": "Fort Worth FSDO",
      "since": 2011,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.6,
      "reviews": 32,
      "responseHours": 8,
      "fees": {
        "ir": 1050,
        "cpl": 1100,
        "sport": 775
      },
      "soonest": 18,
      "gap": 6,
      "count": 6,
      "bio": "Sport pilot and LSA-friendly examiner; relaxed tone, exact standards.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 164,
        "lodging": 172,
        "noShow": 250,
        "avgDaysToNext": 20,
        "leadDays": 30,
        "reviewList": [
          {
            "cert": "sport",
            "stars": 4,
            "text": "Flew out to our grass strip, saved us a trip."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
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
          "se": 164,
          "me": 379
        },
        "cfiRatePerHr": 80,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 172,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ir": {
            "examinerFee": 1050,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 1100,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 550,
            "retestRentalHours": 1.5,
            "retestDualHours": 2
          },
          "sport": {
            "examinerFee": 775,
            "rentalHoursTest": 1.1,
            "cfiPrepHours": 2,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 400,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "tx10",
      "name": "Lupita Cantú-Herrera",
      "home": "KGPM",
      "travelNm": 40,
      "travelFee": 175,
      "retestFee": 675,
      "fsdo": "Fort Worth FSDO",
      "since": 2020,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 66,
      "responseHours": 4,
      "fees": {
        "ppl": 1025,
        "ir": 975,
        "cfi": 1550
      },
      "soonest": 26,
      "gap": 5,
      "count": 9,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 158,
        "lodging": 129,
        "noShow": 300,
        "avgDaysToNext": 26,
        "leadDays": 33,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
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
          "se": 158,
          "me": 446
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 40,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 129,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.5,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 625,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1550,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 2,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 1000,
            "retestRentalHours": 1.1,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "tx11",
      "name": "Royce Tannehill",
      "home": "KDTO",
      "travelNm": 30,
      "travelFee": 125,
      "retestFee": 450,
      "fsdo": "Fort Worth FSDO",
      "since": 2022,
      "languages": [
        "English"
      ],
      "rating": 4.9,
      "reviews": 99,
      "responseHours": 24,
      "fees": {
        "ppl": 875,
        "ir": 825,
        "cpl": 875
      },
      "soonest": 7,
      "gap": 2,
      "count": 10,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 141,
        "lodging": 137,
        "noShow": 200,
        "avgDaysToNext": 12,
        "leadDays": 21,
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
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 141,
          "me": 437
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 125,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 137,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 0.9,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 825,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 425,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx12",
      "name": "Winona Blackwater",
      "home": "KDTO",
      "travelNm": 40,
      "travelFee": 75,
      "retestFee": 525,
      "fsdo": "Fort Worth FSDO",
      "since": 2007,
      "languages": [
        "English"
      ],
      "rating": 4.3,
      "reviews": 213,
      "responseHours": 36,
      "fees": {
        "ppl": 1025,
        "cpl": 1050
      },
      "soonest": 19,
      "gap": 4,
      "count": 7,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 192,
        "lodging": 120,
        "noShow": 250,
        "avgDaysToNext": 24,
        "leadDays": 29,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
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
          "se": 192,
          "me": 393
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 40,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 120,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.2,
            "retestDualHours": 3
          },
          "cpl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 1,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "tx13",
      "name": "Hamid Farzanegan",
      "home": "KACT",
      "travelNm": 80,
      "travelFee": 175,
      "retestFee": 525,
      "fsdo": "San Antonio FSDO",
      "since": 2011,
      "languages": [
        "English"
      ],
      "rating": 4.6,
      "reviews": 172,
      "responseHours": 12,
      "fees": {
        "ppl": 950,
        "ir": 975
      },
      "soonest": 11,
      "gap": 7,
      "count": 10,
      "bio": "Instrument specialist. Expect a full approach set and a thorough systems and weather oral.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 171,
        "lodging": 134,
        "noShow": 250,
        "avgDaysToNext": 14,
        "leadDays": 20,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
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
          "se": 171,
          "me": 390
        },
        "cfiRatePerHr": 60,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 80,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 134,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 950,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "tx14",
      "name": "Jolene Pettiford",
      "home": "KHOU",
      "travelNm": 50,
      "travelFee": 250,
      "retestFee": 475,
      "fsdo": "Houston FSDO",
      "since": 2018,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.6,
      "reviews": 126,
      "responseHours": 24,
      "fees": {
        "ppl": 925,
        "ir": 1000,
        "me": 1000
      },
      "soonest": 12,
      "gap": 6,
      "count": 11,
      "bio": "Twin specialist with a long instructing background. Engine-out work is briefed in detail.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft. Twins must have a current weight & balance on board.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 181,
        "lodging": 169,
        "noShow": 250,
        "avgDaysToNext": 9,
        "leadDays": 23,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Knows the twin inside out."
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
          "se": 181,
          "me": 440
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 169,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 0.8,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx15",
      "name": "Cormac Haverstock",
      "home": "KDWH",
      "travelNm": 30,
      "travelFee": 150,
      "retestFee": 475,
      "fsdo": "Houston FSDO",
      "since": 2022,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.4,
      "reviews": 23,
      "responseHours": 24,
      "fees": {
        "ppl": 925,
        "ir": 975,
        "cpl": 1050,
        "cfi": 1475,
        "cfii": 1175
      },
      "soonest": 7,
      "gap": 6,
      "count": 11,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 141,
        "lodging": 144,
        "noShow": 300,
        "avgDaysToNext": 10,
        "leadDays": 21,
        "reviewList": [
          {
            "cert": "cfii",
            "stars": 4,
            "text": "Asked me to teach an approach from the right seat."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Calm and professional, easy to talk to before the test."
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
          "se": 141,
          "me": 333
        },
        "cfiRatePerHr": 55,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 144,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.4,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 0.8,
            "retestDualHours": 2
          },
          "cfi": {
            "examinerFee": 1475,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 750,
            "retestRentalHours": 1.3,
            "retestDualHours": 3
          },
          "cfii": {
            "examinerFee": 1175,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx16",
      "name": "Ysabel Garduño",
      "home": "KDWH",
      "travelNm": 40,
      "travelFee": 150,
      "retestFee": 625,
      "fsdo": "Houston FSDO",
      "since": 2006,
      "languages": [
        "English"
      ],
      "rating": 4.4,
      "reviews": 174,
      "responseHours": 12,
      "fees": {
        "ppl": 975,
        "ir": 1025,
        "cpl": 975,
        "cfi": 1475,
        "cfii": 1150
      },
      "soonest": 56,
      "gap": 5,
      "count": 10,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 188,
        "lodging": 138,
        "noShow": 250,
        "avgDaysToNext": 54,
        "leadDays": 65,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
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
          "se": 188,
          "me": 432
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 40,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 138,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 625,
            "retestRentalHours": 1,
            "retestDualHours": 1
          },
          "ir": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.4,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 625,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "cfi": {
            "examinerFee": 1475,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 950,
            "retestRentalHours": 0.9,
            "retestDualHours": 2
          },
          "cfii": {
            "examinerFee": 1150,
            "rentalHoursTest": 2,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 750,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "tx17",
      "name": "Elwood Brannock",
      "home": "KSGR",
      "travelNm": 90,
      "travelFee": 150,
      "retestFee": 575,
      "fsdo": "Houston FSDO",
      "since": 2015,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.6,
      "reviews": 162,
      "responseHours": 8,
      "fees": {
        "ppl": 925,
        "ir": 925,
        "cpl": 950,
        "cfi": 1500
      },
      "soonest": 25,
      "gap": 2,
      "count": 10,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 183,
        "lodging": 125,
        "noShow": 150,
        "avgDaysToNext": 29,
        "leadDays": 37,
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
            "text": "Exact on maneuvers tolerances, fair debrief."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 183,
          "me": 403
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 90,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 125,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 925,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.2,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 950,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 600,
            "retestRentalHours": 1.4,
            "retestDualHours": 1
          },
          "cfi": {
            "examinerFee": 1500,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 950,
            "retestRentalHours": 1.3,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "tx18",
      "name": "Thuy-Linh Nguyen-Prather",
      "home": "KCXO",
      "travelNm": 40,
      "travelFee": 250,
      "retestFee": 575,
      "fsdo": "Houston FSDO",
      "since": 2013,
      "languages": [
        "English",
        "Vietnamese"
      ],
      "rating": 4.5,
      "reviews": 33,
      "responseHours": 2,
      "fees": {
        "ppl": 925,
        "cpl": 1025
      },
      "soonest": 12,
      "gap": 4,
      "count": 6,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 158,
        "lodging": 130,
        "noShow": 150,
        "avgDaysToNext": 18,
        "leadDays": 20,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
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
          "se": 158,
          "me": 361
        },
        "cfiRatePerHr": 60,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 40,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 130,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 0.8,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
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
      "id": "tx19",
      "name": "Augustus Kettleman",
      "home": "KEFD",
      "travelNm": 80,
      "travelFee": 100,
      "retestFee": 500,
      "fsdo": "Houston FSDO",
      "since": 2021,
      "languages": [
        "English",
        "Vietnamese"
      ],
      "rating": 4.5,
      "reviews": 77,
      "responseHours": 12,
      "fees": {
        "ppl": 850,
        "ir": 800,
        "cpl": 950,
        "me": 950,
        "cfi": 1325,
        "cfii": 1075,
        "mei": 1100
      },
      "soonest": 33,
      "gap": 5,
      "count": 7,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 173,
        "lodging": 141,
        "noShow": 150,
        "avgDaysToNext": 30,
        "leadDays": 38,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
          },
          {
            "cert": "cfii",
            "stars": 5,
            "text": "Good debrief on instrument instruction."
          },
          {
            "cert": "mei",
            "stars": 5,
            "text": "Excellent debrief on teaching Vmc demos."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 173,
          "me": 363
        },
        "cfiRatePerHr": 60,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 80,
          "travelFee": 100,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 141,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 850,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 800,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 950,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 950,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.5,
            "retestDualHours": 3
          },
          "cfi": {
            "examinerFee": 1325,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 800,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "cfii": {
            "examinerFee": 1075,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.4,
            "retestDualHours": 2
          },
          "mei": {
            "examinerFee": 1100,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx20",
      "name": "Marisela Ybarra-Cole",
      "home": "KAUS",
      "travelNm": 100,
      "travelFee": 250,
      "retestFee": 575,
      "fsdo": "San Antonio FSDO",
      "since": 2024,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 5,
      "reviews": 175,
      "responseHours": 36,
      "fees": {
        "ppl": 950,
        "ir": 975
      },
      "soonest": 21,
      "gap": 6,
      "count": 8,
      "bio": "Holds rotorcraft-helicopter authorizations alongside airplane ratings.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft or helicopter (R22/R44 typical). Bring all maintenance logbooks.",
      "otherAuthorizations": [
        {
          "id": "rh",
          "name": "Rotorcraft-Helicopter (Private/Commercial/Instrument)",
          "detail": "Rotorcraft Helicopter",
          "fee": 1025
        }
      ],
      "sample": {
        "rental": 146,
        "lodging": 118,
        "noShow": 250,
        "avgDaysToNext": 19,
        "leadDays": 33,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "ppl",
            "stars": 5,
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
          "se": 146,
          "me": 359
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 118,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 950,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.3,
            "retestDualHours": 1
          },
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 575,
            "retestRentalHours": 0.8,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "tx21",
      "name": "Fenton Lockridge",
      "home": "KEDC",
      "travelNm": 40,
      "travelFee": 100,
      "retestFee": 500,
      "fsdo": "San Antonio FSDO",
      "since": 2017,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 5,
      "reviews": 152,
      "responseHours": 3,
      "fees": {
        "ppl": 825,
        "ir": 825,
        "cfi": 1400,
        "cfii": 1025
      },
      "soonest": 18,
      "gap": 6,
      "count": 7,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant normally provides the aircraft. A Piper PA-28 Archer is available to rent for the test by arrangement (example: $158/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 158,
        "lodging": 133,
        "noShow": 300,
        "avgDaysToNext": 16,
        "leadDays": 31,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Calm and professional, easy to talk to before the test."
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
          "se": 158,
          "me": 387
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 40,
          "travelFee": 100,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 133,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 825,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.3,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1400,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 850,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          },
          "cfii": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 625,
            "retestRentalHours": 1.1,
            "retestDualHours": 1
          }
        }
      }
    },
    {
      "id": "tx22",
      "name": "Deja Okonkwo-Barnes",
      "home": "KGTU",
      "travelNm": 75,
      "travelFee": 150,
      "retestFee": 525,
      "fsdo": "San Antonio FSDO",
      "since": 2005,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.7,
      "reviews": 31,
      "responseHours": 36,
      "fees": {
        "ppl": 800,
        "ir": 900,
        "cpl": 900,
        "me": 925
      },
      "soonest": 31,
      "gap": 7,
      "count": 9,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft. Twins must have a current weight & balance on board.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1225,
          "costModel": {
            "examinerFee": 1225,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 800,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          }
        }
      ],
      "sample": {
        "rental": 165,
        "lodging": 175,
        "noShow": 200,
        "avgDaysToNext": 33,
        "leadDays": 41,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 4,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 165,
          "me": 386
        },
        "cfiRatePerHr": 55,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 75,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 175,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 800,
            "rentalHoursTest": 2,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 1,
            "retestDualHours": 3
          },
          "ir": {
            "examinerFee": 900,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 575,
            "retestRentalHours": 0.8,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 900,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 925,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx23",
      "name": "Lyle Bramwell",
      "home": "KHYI",
      "travelNm": 60,
      "travelFee": 125,
      "retestFee": 500,
      "fsdo": "San Antonio FSDO",
      "since": 2006,
      "languages": [
        "English"
      ],
      "rating": 4.5,
      "reviews": 5,
      "responseHours": 12,
      "fees": {
        "ppl": 825,
        "ir": 875,
        "me": 900,
        "cfi": 1350,
        "mei": 1100,
        "sport": 725
      },
      "soonest": 27,
      "gap": 4,
      "count": 7,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1275,
          "costModel": {
            "examinerFee": 1275,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 775,
            "retestRentalHours": 1.3,
            "retestDualHours": 2
          }
        }
      ],
      "sample": {
        "rental": 159,
        "lodging": 138,
        "noShow": 200,
        "avgDaysToNext": 32,
        "leadDays": 38,
        "reviewList": [
          {
            "cert": "mei",
            "stars": 5,
            "text": "Excellent debrief on teaching Vmc demos."
          },
          {
            "cert": "sport",
            "stars": 5,
            "text": "Relaxed but exact."
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
          "se": 159,
          "me": 393
        },
        "cfiRatePerHr": 55,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 125,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 138,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 875,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 900,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 550,
            "retestRentalHours": 1.2,
            "retestDualHours": 1
          },
          "cfi": {
            "examinerFee": 1350,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 2,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 800,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "mei": {
            "examinerFee": 1100,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.2,
            "retestDualHours": 2.5
          },
          "sport": {
            "examinerFee": 725,
            "rentalHoursTest": 1.1,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 425,
            "retestRentalHours": 1.4,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "tx24",
      "name": "Anneliese Dornhoff",
      "home": "KSAT",
      "travelNm": 80,
      "travelFee": 250,
      "retestFee": 700,
      "fsdo": "San Antonio FSDO",
      "since": 2015,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 5,
      "reviews": 14,
      "responseHours": 36,
      "fees": {
        "ppl": 925,
        "ir": 950,
        "cfi": 1475,
        "cfii": 1150
      },
      "soonest": 21,
      "gap": 6,
      "count": 6,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant normally provides the aircraft. A Cessna 172 is available to rent for the test by arrangement (example: $166/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 166,
        "lodging": 175,
        "noShow": 250,
        "avgDaysToNext": 22,
        "leadDays": 35,
        "reviewList": [
          {
            "cert": "cfii",
            "stars": 4,
            "text": "Asked me to teach an approach from the right seat."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Calm and professional, easy to talk to before the test."
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
          "se": 166,
          "me": 375
        },
        "cfiRatePerHr": 80,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 80,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 175,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 700,
            "retestRentalHours": 1.2,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 950,
            "rentalHoursTest": 2.3,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 725,
            "retestRentalHours": 1.1,
            "retestDualHours": 3
          },
          "cfi": {
            "examinerFee": 1475,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 1100,
            "retestRentalHours": 1.2,
            "retestDualHours": 1.5
          },
          "cfii": {
            "examinerFee": 1150,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 875,
            "retestRentalHours": 1.3,
            "retestDualHours": 1
          }
        }
      }
    },
    {
      "id": "tx25",
      "name": "Rocío Valdespino",
      "home": "KSSF",
      "travelNm": 100,
      "travelFee": 100,
      "retestFee": 650,
      "fsdo": "San Antonio FSDO",
      "since": 2006,
      "languages": [
        "English"
      ],
      "rating": 4.5,
      "reviews": 9,
      "responseHours": 6,
      "fees": {
        "ppl": 850,
        "ir": 900,
        "cpl": 925
      },
      "soonest": 12,
      "gap": 5,
      "count": 7,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 167,
        "lodging": 131,
        "noShow": 150,
        "avgDaysToNext": 9,
        "leadDays": 18,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
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
          "se": 167,
          "me": 346
        },
        "cfiRatePerHr": 60,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 100,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 131,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 850,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.3,
            "retestDualHours": 1
          },
          "ir": {
            "examinerFee": 900,
            "rentalHoursTest": 2.3,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.3,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 700,
            "retestRentalHours": 1.5,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx26",
      "name": "Garrick Stoltzfus",
      "home": "KCRP",
      "travelNm": 50,
      "travelFee": 250,
      "retestFee": 400,
      "fsdo": "San Antonio FSDO",
      "since": 2018,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 5,
      "reviews": 125,
      "responseHours": 12,
      "fees": {
        "ppl": 775,
        "ir": 875,
        "cpl": 900,
        "cfi": 1350,
        "cfii": 1050
      },
      "soonest": 11,
      "gap": 2,
      "count": 7,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 190,
        "lodging": 164,
        "noShow": 200,
        "avgDaysToNext": 15,
        "leadDays": 18,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
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
          "se": 190,
          "me": 340
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 164,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 775,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 400,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 875,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 450,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 900,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 0.9,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1350,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "cfii": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "tx27",
      "name": "Pilar Escamilla-Voss",
      "home": "KLBB",
      "travelNm": 100,
      "travelFee": 125,
      "retestFee": 425,
      "fsdo": "Lubbock FSDO",
      "since": 2014,
      "languages": [
        "English",
        "Vietnamese"
      ],
      "rating": 4.7,
      "reviews": 81,
      "responseHours": 12,
      "fees": {
        "ppl": 825,
        "ir": 900,
        "cpl": 950
      },
      "soonest": 7,
      "gap": 3,
      "count": 8,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 173,
        "lodging": 164,
        "noShow": 250,
        "avgDaysToNext": 9,
        "leadDays": 13,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 173,
          "me": 433
        },
        "cfiRatePerHr": 55,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 125,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 164,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 425,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 900,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 450,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 950,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.5,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "tx28",
      "name": "Burke Hallowell",
      "home": "KAMA",
      "travelNm": 60,
      "travelFee": 250,
      "retestFee": 575,
      "fsdo": "Lubbock FSDO",
      "since": 2006,
      "languages": [
        "English"
      ],
      "rating": 4.8,
      "reviews": 232,
      "responseHours": 18,
      "fees": {
        "ppl": 825
      },
      "soonest": 66,
      "gap": 3,
      "count": 12,
      "bio": "Private and instrument checkrides for local flight schools and independent CFIs. Panhandle based; covers Amarillo and Lubbock area fields.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 149,
        "lodging": 121,
        "noShow": 300,
        "avgDaysToNext": 66,
        "leadDays": 70,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
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
          "se": 149,
          "me": 335
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 121,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 825,
            "rentalHoursTest": 2,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx29",
      "name": "Nadira Haddadin",
      "home": "KMAF",
      "travelNm": 60,
      "travelFee": 150,
      "retestFee": 475,
      "fsdo": "Lubbock FSDO",
      "since": 2011,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.4,
      "reviews": 136,
      "responseHours": 36,
      "fees": {
        "ppl": 950,
        "ir": 1000,
        "me": 1150
      },
      "soonest": 7,
      "gap": 5,
      "count": 11,
      "bio": "Former airline check airman; ATP and multi-engine rides are a large share of the calendar.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant normally provides the aircraft. A Cessna 172 is available to rent for the test by arrangement (example: $180/hr wet).",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1400,
          "costModel": {
            "examinerFee": 1400,
            "rentalHoursTest": 2.3,
            "cfiPrepHours": 2,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 700,
            "retestRentalHours": 0.9,
            "retestDualHours": 1
          }
        }
      ],
      "sample": {
        "rental": 180,
        "lodging": 117,
        "noShow": 200,
        "avgDaysToNext": 5,
        "leadDays": 10,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
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
          "se": 180,
          "me": 398
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 117,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 950,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.3,
            "retestDualHours": 1
          },
          "ir": {
            "examinerFee": 1000,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1,
            "retestDualHours": 1
          },
          "me": {
            "examinerFee": 1150,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.2,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "tx30",
      "name": "Clement Rookstool",
      "home": "KELP",
      "travelNm": 50,
      "travelFee": 150,
      "retestFee": 575,
      "fsdo": "Lubbock FSDO",
      "since": 2021,
      "languages": [
        "English",
        "German"
      ],
      "rating": 4.9,
      "reviews": 186,
      "responseHours": 18,
      "fees": {
        "ppl": 925,
        "cpl": 925,
        "me": 975,
        "sport": 750
      },
      "soonest": 25,
      "gap": 2,
      "count": 8,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel. Far West Texas; examiner travel east of Van Horn is by arrangement.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 187,
        "lodging": 174,
        "noShow": 250,
        "avgDaysToNext": 29,
        "leadDays": 34,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
          },
          {
            "cert": "sport",
            "stars": 5,
            "text": "Flew out to our grass strip, saved us a trip."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 187,
          "me": 377
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 174,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.2,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 925,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 975,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 600,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          },
          "sport": {
            "examinerFee": 750,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 2,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          }
        }
      }
    }
  ];

  const data = { region: { name: "Texas", short: "TX" }, airports, dpes, fictional: true };
  if (typeof module !== "undefined" && module.exports) module.exports = data;
  if (root) root.CC_SAMPLE_TX = data;
})(typeof window !== "undefined" ? window : null);
