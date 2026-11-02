// FICTIONAL SAMPLE DATA - invented examiners for UI development, not real people; airport identifiers are real.
//
// 30 invented California examiners for the Checkride Connect prototype (/workspace/checkride-connect).
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
//   - airports: California airports (same fields as data.js airports). Every home is in this list.
//
// Use (browser), load after data.js. APPEND, do not replace (data.js seededBookings/school reference d1, d2, d9):
//   <script src="sample-ca-examiners.js"></script>
//   CC_DATA.airports.push(...CC_SAMPLE_CA.airports); CC_DATA.dpes.push(...CC_SAMPLE_CA.dpes);  // ids ca01..ca30
// Checkride Connect copy (B, Oct 29 2026): identical to /workspace/checkride-pm/data/sample-ca-examiners.js except a "tz" (IANA) on each airport, from data.js airportTz (D38).
// Node: const { dpes, airports } = require("./sample-ca-examiners.js");
(function (root) {
  const airports = [
    {
      "id": "KVNY",
      "name": "Van Nuys",
      "city": "Van Nuys",
      "lat": 34.21,
      "lng": -118.49,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KWHP",
      "name": "Whiteman",
      "city": "Pacoima",
      "lat": 34.259,
      "lng": -118.413,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KCMA",
      "name": "Camarillo",
      "city": "Camarillo",
      "lat": 34.214,
      "lng": -119.094,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KSBA",
      "name": "Santa Barbara Municipal",
      "city": "Santa Barbara",
      "lat": 34.426,
      "lng": -119.84,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KSBP",
      "name": "San Luis Obispo County Regional",
      "city": "San Luis Obispo",
      "lat": 35.237,
      "lng": -120.642,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KTOA",
      "name": "Zamperini Field",
      "city": "Torrance",
      "lat": 33.803,
      "lng": -118.34,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KLGB",
      "name": "Long Beach",
      "city": "Long Beach",
      "lat": 33.818,
      "lng": -118.152,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KSNA",
      "name": "John Wayne-Orange County",
      "city": "Santa Ana",
      "lat": 33.676,
      "lng": -117.868,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KFUL",
      "name": "Fullerton Municipal",
      "city": "Fullerton",
      "lat": 33.872,
      "lng": -117.98,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KCNO",
      "name": "Chino",
      "city": "Chino",
      "lat": 33.975,
      "lng": -117.636,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KRAL",
      "name": "Riverside Municipal",
      "city": "Riverside",
      "lat": 33.952,
      "lng": -117.445,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KPOC",
      "name": "Brackett Field",
      "city": "La Verne",
      "lat": 34.092,
      "lng": -117.782,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KCRQ",
      "name": "McClellan-Palomar",
      "city": "Carlsbad",
      "lat": 33.128,
      "lng": -117.28,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KMYF",
      "name": "Montgomery-Gibbs Executive",
      "city": "San Diego",
      "lat": 32.816,
      "lng": -117.139,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KSEE",
      "name": "Gillespie Field",
      "city": "El Cajon",
      "lat": 32.826,
      "lng": -116.972,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KPAO",
      "name": "Palo Alto",
      "city": "Palo Alto",
      "lat": 37.461,
      "lng": -122.115,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KRHV",
      "name": "Reid-Hillview",
      "city": "San Jose",
      "lat": 37.333,
      "lng": -121.82,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KSQL",
      "name": "San Carlos",
      "city": "San Carlos",
      "lat": 37.512,
      "lng": -122.25,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KHWD",
      "name": "Hayward Executive",
      "city": "Hayward",
      "lat": 37.659,
      "lng": -122.122,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KOAK",
      "name": "Oakland Intl",
      "city": "Oakland",
      "lat": 37.721,
      "lng": -122.221,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KLVK",
      "name": "Livermore Municipal",
      "city": "Livermore",
      "lat": 37.693,
      "lng": -121.82,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KCCR",
      "name": "Buchanan Field",
      "city": "Concord",
      "lat": 37.99,
      "lng": -122.057,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KSAC",
      "name": "Sacramento Executive",
      "city": "Sacramento",
      "lat": 38.513,
      "lng": -121.493,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KMHR",
      "name": "Sacramento Mather",
      "city": "Rancho Cordova",
      "lat": 38.554,
      "lng": -121.298,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KFAT",
      "name": "Fresno Yosemite Intl",
      "city": "Fresno",
      "lat": 36.776,
      "lng": -119.718,
      "tz": "America/Los_Angeles"
    },
    {
      "id": "KBFL",
      "name": "Meadows Field",
      "city": "Bakersfield",
      "lat": 35.434,
      "lng": -119.057,
      "tz": "America/Los_Angeles"
    }
  ];

  const dpes = [
    {
      "id": "ca01",
      "name": "Anselm Takahara-Reyes",
      "home": "KVNY",
      "travelNm": 30,
      "travelFee": 150,
      "retestFee": 575,
      "fsdo": "Van Nuys FSDO",
      "since": 2013,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.5,
      "reviews": 10,
      "responseHours": 48,
      "fees": {
        "ppl": 925,
        "cfi": 1500,
        "cfii": 1200
      },
      "soonest": 27,
      "gap": 7,
      "count": 6,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 205,
        "lodging": 153,
        "noShow": 300,
        "avgDaysToNext": 28,
        "leadDays": 39,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Firm on standards, generous with teaching tips."
          },
          {
            "cert": "cfii",
            "stars": 5,
            "text": "Good debrief on instrument instruction."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 205,
          "me": 431
        },
        "cfiRatePerHr": 90,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 153,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.5,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1500,
            "rentalHoursTest": 2,
            "cfiPrepHours": 2,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 950,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          },
          "cfii": {
            "examinerFee": 1200,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 2,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 750,
            "retestRentalHours": 1.3,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "ca02",
      "name": "Briony Callowhill",
      "home": "KVNY",
      "travelNm": 90,
      "travelFee": 200,
      "retestFee": 525,
      "fsdo": "Van Nuys FSDO",
      "since": 2007,
      "languages": [
        "English"
      ],
      "rating": 4.3,
      "reviews": 50,
      "responseHours": 6,
      "fees": {
        "ir": 975,
        "cpl": 1000
      },
      "soonest": 24,
      "gap": 3,
      "count": 10,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 215,
        "lodging": 166,
        "noShow": 200,
        "avgDaysToNext": 21,
        "leadDays": 28,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Structured day, finished early."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 215,
          "me": 367
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 90,
          "travelFee": 200,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 166,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.3,
            "retestDualHours": 3
          },
          "cpl": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 550,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "ca03",
      "name": "Jun-seo Halvardson",
      "home": "KWHP",
      "travelNm": 30,
      "travelFee": 75,
      "retestFee": 800,
      "fsdo": "Van Nuys FSDO",
      "since": 2010,
      "languages": [
        "English"
      ],
      "rating": 4.5,
      "reviews": 162,
      "responseHours": 4,
      "fees": {
        "ppl": 1125,
        "ir": 1075
      },
      "soonest": 21,
      "gap": 3,
      "count": 7,
      "bio": "Private and instrument checkrides for local flight schools and independent CFIs.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 224,
        "lodging": 120,
        "noShow": 250,
        "avgDaysToNext": 20,
        "leadDays": 34,
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
          "se": 224,
          "me": 364
        },
        "cfiRatePerHr": 95,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 120,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1125,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 800,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 1075,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 750,
            "retestRentalHours": 0.9,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "ca04",
      "name": "Marguerite Esquivel-Tran",
      "home": "KCMA",
      "travelNm": 50,
      "travelFee": 150,
      "retestFee": 675,
      "fsdo": "Van Nuys FSDO",
      "since": 2019,
      "languages": [
        "English"
      ],
      "rating": 4.4,
      "reviews": 17,
      "responseHours": 48,
      "fees": {
        "ir": 975,
        "cpl": 1050,
        "me": 1150,
        "cfi": 1525
      },
      "soonest": 42,
      "gap": 2,
      "count": 12,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant normally provides the aircraft. A Cessna 172 is available to rent for the test by arrangement (example: $157/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 157,
        "lodging": 143,
        "noShow": 200,
        "avgDaysToNext": 44,
        "leadDays": 46,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Structured day, finished early."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 157,
          "me": 362
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 143,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 2.3,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.3,
            "retestDualHours": 1
          },
          "cpl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 725,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          },
          "me": {
            "examinerFee": 1150,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 800,
            "retestRentalHours": 1.1,
            "retestDualHours": 1
          },
          "cfi": {
            "examinerFee": 1525,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 1075,
            "retestRentalHours": 1.3,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "ca05",
      "name": "Lowell Brightwater",
      "home": "KSBA",
      "travelNm": 80,
      "travelFee": 100,
      "retestFee": 650,
      "fsdo": "Van Nuys FSDO",
      "since": 2019,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.4,
      "reviews": 232,
      "responseHours": 3,
      "fees": {
        "ppl": 1050,
        "me": 1175
      },
      "soonest": 14,
      "gap": 4,
      "count": 6,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1475,
          "costModel": {
            "examinerFee": 1475,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 925,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          }
        }
      ],
      "sample": {
        "rental": 160,
        "lodging": 174,
        "noShow": 250,
        "avgDaysToNext": 14,
        "leadDays": 19,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Knows the twin inside out."
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
          "se": 160,
          "me": 409
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 80,
          "travelFee": 100,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 174,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 0.8,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 1175,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 725,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "ca06",
      "name": "Soledad Iturralde",
      "home": "KSBP",
      "travelNm": 100,
      "travelFee": 175,
      "retestFee": 500,
      "fsdo": "Van Nuys FSDO",
      "since": 2009,
      "languages": [
        "English",
        "Tagalog"
      ],
      "rating": 4.4,
      "reviews": 6,
      "responseHours": 2,
      "fees": {
        "ppl": 750,
        "cpl": 825,
        "cfi": 1250
      },
      "soonest": 45,
      "gap": 6,
      "count": 10,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion. Central Coast; travel south of Santa Maria is by arrangement.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant normally provides the aircraft. A Cessna 172 is available to rent for the test by arrangement (example: $184/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 184,
        "lodging": 114,
        "noShow": 150,
        "avgDaysToNext": 44,
        "leadDays": 58,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
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
          "se": 184,
          "me": 442
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 114,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 750,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.3,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1250,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 825,
            "retestRentalHours": 1.2,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "ca07",
      "name": "Fitz Ommundsen",
      "home": "KTOA",
      "travelNm": 30,
      "travelFee": 250,
      "retestFee": 625,
      "fsdo": "Long Beach FSDO",
      "since": 2007,
      "languages": [
        "English",
        "Japanese"
      ],
      "rating": 4.5,
      "reviews": 230,
      "responseHours": 18,
      "fees": {
        "ppl": 1025,
        "cpl": 1150,
        "sport": 875
      },
      "soonest": 10,
      "gap": 4,
      "count": 8,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 183,
        "lodging": 154,
        "noShow": 150,
        "avgDaysToNext": 14,
        "leadDays": 21,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
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
          "se": 183,
          "me": 428
        },
        "cfiRatePerHr": 80,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 154,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 625,
            "retestRentalHours": 0.9,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 1150,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 700,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          },
          "sport": {
            "examinerFee": 875,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "ca08",
      "name": "Priyanka Venkatraman",
      "home": "KTOA",
      "travelNm": 60,
      "travelFee": 200,
      "retestFee": 650,
      "fsdo": "Long Beach FSDO",
      "since": 2005,
      "languages": [
        "English",
        "Mandarin"
      ],
      "rating": 4.4,
      "reviews": 65,
      "responseHours": 6,
      "fees": {
        "ppl": 1025,
        "ir": 1100
      },
      "soonest": 21,
      "gap": 6,
      "count": 7,
      "bio": "Rotorcraft and airplane examiner serving helicopter schools in the area.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft or helicopter (R22/R44 typical). Bring all maintenance logbooks.",
      "otherAuthorizations": [
        {
          "id": "rh",
          "name": "Rotorcraft-Helicopter (Private/Commercial/Instrument)",
          "detail": "Rotorcraft Helicopter",
          "fee": 1150
        }
      ],
      "sample": {
        "rental": 176,
        "lodging": 158,
        "noShow": 200,
        "avgDaysToNext": 25,
        "leadDays": 34,
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
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 176,
          "me": 360
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 200,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 158,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.1,
            "retestDualHours": 3
          },
          "ir": {
            "examinerFee": 1100,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 700,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "ca09",
      "name": "Henrik Sallstrom",
      "home": "KLGB",
      "travelNm": 50,
      "travelFee": 150,
      "retestFee": 725,
      "fsdo": "Long Beach FSDO",
      "since": 2009,
      "languages": [
        "English"
      ],
      "rating": 4.3,
      "reviews": 35,
      "responseHours": 6,
      "fees": {
        "ppl": 1050,
        "ir": 1025,
        "cpl": 1175,
        "sport": 925
      },
      "soonest": 11,
      "gap": 6,
      "count": 6,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 221,
        "lodging": 156,
        "noShow": 250,
        "avgDaysToNext": 16,
        "leadDays": 19,
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
            "text": "Exact on maneuvers tolerances, fair debrief."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 221,
          "me": 391
        },
        "cfiRatePerHr": 90,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 156,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 725,
            "retestRentalHours": 1.4,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 1025,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 725,
            "retestRentalHours": 1.2,
            "retestDualHours": 3
          },
          "cpl": {
            "examinerFee": 1175,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 825,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          },
          "sport": {
            "examinerFee": 925,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 650,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "ca10",
      "name": "Delphine Arcand",
      "home": "KSNA",
      "travelNm": 40,
      "travelFee": 200,
      "retestFee": 500,
      "fsdo": "Long Beach FSDO",
      "since": 2018,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 213,
      "responseHours": 24,
      "fees": {
        "ppl": 925,
        "ir": 1000,
        "cpl": 1050
      },
      "soonest": 7,
      "gap": 6,
      "count": 6,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 157,
        "lodging": 171,
        "noShow": 250,
        "avgDaysToNext": 12,
        "leadDays": 15,
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
          "se": 157,
          "me": 381
        },
        "cfiRatePerHr": 95,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 40,
          "travelFee": 200,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 171,
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
            "retestFee": 500,
            "retestRentalHours": 1.4,
            "retestDualHours": 2
          },
          "ir": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 550,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "ca11",
      "name": "Mateo Zubizarreta",
      "home": "KFUL",
      "travelNm": 60,
      "travelFee": 175,
      "retestFee": 650,
      "fsdo": "Long Beach FSDO",
      "since": 2018,
      "languages": [
        "English",
        "Mandarin"
      ],
      "rating": 4.6,
      "reviews": 160,
      "responseHours": 2,
      "fees": {
        "ppl": 1050,
        "cpl": 1050
      },
      "soonest": 48,
      "gap": 6,
      "count": 11,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant normally provides the aircraft. A Piper PA-28 Archer is available to rent for the test by arrangement (example: $164/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 164,
        "lodging": 126,
        "noShow": 200,
        "avgDaysToNext": 49,
        "leadDays": 60,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Exact on maneuvers tolerances, fair debrief."
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
          "se": 164,
          "me": 437
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 126,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 0.8,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 0.8,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "ca12",
      "name": "Constance Wyndham-Ayer",
      "home": "KCNO",
      "travelNm": 30,
      "travelFee": 200,
      "retestFee": 725,
      "fsdo": "Riverside FSDO",
      "since": 2020,
      "languages": [
        "English",
        "Tagalog"
      ],
      "rating": 4.5,
      "reviews": 26,
      "responseHours": 8,
      "fees": {
        "ppl": 1050,
        "ir": 1000,
        "cpl": 1050,
        "me": 1125
      },
      "soonest": 7,
      "gap": 4,
      "count": 12,
      "bio": "Multi-engine add-ons and MEI rides; calendar fills fast in the spring.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 171,
        "lodging": 139,
        "noShow": 150,
        "avgDaysToNext": 8,
        "leadDays": 15,
        "reviewList": [
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
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
          "se": 171,
          "me": 380
        },
        "cfiRatePerHr": 95,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 200,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 139,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 725,
            "retestRentalHours": 1.3,
            "retestDualHours": 3
          },
          "ir": {
            "examinerFee": 1000,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 700,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 725,
            "retestRentalHours": 0.8,
            "retestDualHours": 3
          },
          "me": {
            "examinerFee": 1125,
            "rentalHoursTest": 2,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 800,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "ca13",
      "name": "Kaito Brennerman",
      "home": "KCNO",
      "travelNm": 50,
      "travelFee": 250,
      "retestFee": 525,
      "fsdo": "Riverside FSDO",
      "since": 2009,
      "languages": [
        "English"
      ],
      "rating": 4.6,
      "reviews": 120,
      "responseHours": 18,
      "fees": {
        "ppl": 950,
        "me": 1050
      },
      "soonest": 55,
      "gap": 5,
      "count": 11,
      "bio": "Former airline check airman; ATP and multi-engine rides are a large share of the calendar.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1400,
          "costModel": {
            "examinerFee": 1400,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 775,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          }
        }
      ],
      "sample": {
        "rental": 210,
        "lodging": 162,
        "noShow": 150,
        "avgDaysToNext": 53,
        "leadDays": 69,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "me",
            "stars": 4,
            "text": "Knows the twin inside out."
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
          "se": 210,
          "me": 388
        },
        "cfiRatePerHr": 85,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 162,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 950,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 525,
            "retestRentalHours": 1.5,
            "retestDualHours": 1.5
          },
          "me": {
            "examinerFee": 1050,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.2,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "ca14",
      "name": "Liesl Vanterpool",
      "home": "KRAL",
      "travelNm": 40,
      "travelFee": 200,
      "retestFee": 675,
      "fsdo": "Riverside FSDO",
      "since": 2014,
      "languages": [
        "English",
        "Mandarin"
      ],
      "rating": 4.5,
      "reviews": 202,
      "responseHours": 4,
      "fees": {
        "ir": 1075,
        "me": 1150
      },
      "soonest": 7,
      "gap": 2,
      "count": 9,
      "bio": "Multi-engine add-ons and MEI rides; calendar fills fast in the spring.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "A Piper Seminole twin is available for multi-engine checkrides by arrangement (example: $337/hr wet). Otherwise applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 199,
        "lodging": 113,
        "noShow": 200,
        "avgDaysToNext": 12,
        "leadDays": 16,
        "reviewList": [
          {
            "cert": "me",
            "stars": 4,
            "text": "Great engine-out briefing before the flight."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "me",
            "stars": 4,
            "text": "Knows the twin inside out."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 199,
          "me": 337
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 40,
          "travelFee": 200,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 113,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ir": {
            "examinerFee": 1075,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.5,
            "retestDualHours": 1.5
          },
          "me": {
            "examinerFee": 1150,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 725,
            "retestRentalHours": 1.2,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "ca15",
      "name": "Joaquín Ledesma-Price",
      "home": "KPOC",
      "travelNm": 30,
      "travelFee": 175,
      "retestFee": 450,
      "fsdo": "Riverside FSDO",
      "since": 2019,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.7,
      "reviews": 171,
      "responseHours": 36,
      "fees": {
        "ppl": 875,
        "ir": 975,
        "sport": 775
      },
      "soonest": 19,
      "gap": 7,
      "count": 11,
      "bio": "Sport pilot and LSA-friendly examiner; relaxed tone, exact standards.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 187,
        "lodging": 175,
        "noShow": 200,
        "avgDaysToNext": 24,
        "leadDays": 25,
        "reviewList": [
          {
            "cert": "sport",
            "stars": 5,
            "text": "Flew out to our grass strip, saved us a trip."
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
          "se": 187,
          "me": 425
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 30,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 175,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 2,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.3,
            "retestDualHours": 2
          },
          "sport": {
            "examinerFee": 775,
            "rentalHoursTest": 1.1,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 400,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "ca16",
      "name": "Ottoline Marsh-Keller",
      "home": "KCRQ",
      "travelNm": 50,
      "travelFee": 250,
      "retestFee": 725,
      "fsdo": "San Diego FSDO",
      "since": 2019,
      "languages": [
        "English"
      ],
      "rating": 4.4,
      "reviews": 127,
      "responseHours": 4,
      "fees": {
        "ppl": 975,
        "ir": 1050,
        "cfi": 1575,
        "cfii": 1225
      },
      "soonest": 53,
      "gap": 7,
      "count": 6,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 211,
        "lodging": 122,
        "noShow": 250,
        "avgDaysToNext": 59,
        "leadDays": 57,
        "reviewList": [
          {
            "cert": "cfii",
            "stars": 4,
            "text": "Good debrief on instrument instruction."
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
          "se": 211,
          "me": 368
        },
        "cfiRatePerHr": 90,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 122,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 725,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 1050,
            "rentalHoursTest": 2,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 800,
            "retestRentalHours": 1.4,
            "retestDualHours": 1
          },
          "cfi": {
            "examinerFee": 1575,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 1175,
            "retestRentalHours": 1.5,
            "retestDualHours": 1.5
          },
          "cfii": {
            "examinerFee": 1225,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 925,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "ca17",
      "name": "Raymond Agbayani",
      "home": "KMYF",
      "travelNm": 100,
      "travelFee": 250,
      "retestFee": 550,
      "fsdo": "San Diego FSDO",
      "since": 2021,
      "languages": [
        "English"
      ],
      "rating": 4.9,
      "reviews": 32,
      "responseHours": 12,
      "fees": {
        "ir": 1075,
        "me": 1100
      },
      "soonest": 7,
      "gap": 2,
      "count": 6,
      "bio": "Multi-engine add-ons and MEI rides; calendar fills fast in the spring.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 192,
        "lodging": 163,
        "noShow": 250,
        "avgDaysToNext": 7,
        "leadDays": 10,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
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
          "se": 192,
          "me": 421
        },
        "cfiRatePerHr": 90,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 250,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 163,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ir": {
            "examinerFee": 1075,
            "rentalHoursTest": 2.3,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 550,
            "retestRentalHours": 0.9,
            "retestDualHours": 1.5
          },
          "me": {
            "examinerFee": 1100,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 550,
            "retestRentalHours": 1,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "ca18",
      "name": "Sabine Rothgerber",
      "home": "KMYF",
      "travelNm": 75,
      "travelFee": 175,
      "retestFee": 575,
      "fsdo": "San Diego FSDO",
      "since": 2022,
      "languages": [
        "English",
        "Korean"
      ],
      "rating": 4.5,
      "reviews": 193,
      "responseHours": 4,
      "fees": {
        "ppl": 925
      },
      "soonest": 7,
      "gap": 2,
      "count": 9,
      "bio": "Primary-training examiner who keeps the oral scenario-based and the flight on schedule.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 180,
        "lodging": 174,
        "noShow": 200,
        "avgDaysToNext": 7,
        "leadDays": 17,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
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
          "se": 180,
          "me": 433
        },
        "cfiRatePerHr": 90,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 75,
          "travelFee": 175,
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
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 0.8,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "ca19",
      "name": "Tobiah Quarrington",
      "home": "KSEE",
      "travelNm": 80,
      "travelFee": 150,
      "retestFee": 475,
      "fsdo": "San Diego FSDO",
      "since": 2008,
      "languages": [
        "English"
      ],
      "rating": 4.4,
      "reviews": 18,
      "responseHours": 48,
      "fees": {
        "ppl": 950,
        "ir": 975,
        "cpl": 975
      },
      "soonest": 19,
      "gap": 4,
      "count": 9,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 180,
        "lodging": 119,
        "noShow": 300,
        "avgDaysToNext": 24,
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
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 180,
          "me": 362
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 80,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 119,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 950,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 475,
            "retestRentalHours": 1,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 975,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.1,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.5,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "ca20",
      "name": "Ines Carvalhal",
      "home": "KPAO",
      "travelNm": 75,
      "travelFee": 75,
      "retestFee": 600,
      "fsdo": "San Jose FSDO",
      "since": 2006,
      "languages": [
        "English",
        "Tagalog"
      ],
      "rating": 4.4,
      "reviews": 50,
      "responseHours": 36,
      "fees": {
        "ppl": 1000,
        "ir": 1025,
        "cpl": 1100,
        "me": 1100,
        "cfi": 1575,
        "mei": 1300
      },
      "soonest": 7,
      "gap": 6,
      "count": 11,
      "bio": "Holds rotorcraft-helicopter authorizations alongside airplane ratings.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft or helicopter (R22/R44 typical). Bring all maintenance logbooks.",
      "otherAuthorizations": [
        {
          "id": "rh",
          "name": "Rotorcraft-Helicopter (Private/Commercial/Instrument)",
          "detail": "Rotorcraft Helicopter",
          "fee": 1150
        }
      ],
      "sample": {
        "rental": 175,
        "lodging": 113,
        "noShow": 200,
        "avgDaysToNext": 13,
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
          "se": 175,
          "me": 417
        },
        "cfiRatePerHr": 80,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 75,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 113,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1000,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 600,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 625,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 1100,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "me": {
            "examinerFee": 1100,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 650,
            "retestRentalHours": 0.8,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1575,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 950,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          },
          "mei": {
            "examinerFee": 1300,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 2,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 775,
            "retestRentalHours": 0.8,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "ca21",
      "name": "Wesley Okimoto-Dunn",
      "home": "KRHV",
      "travelNm": 50,
      "travelFee": 200,
      "retestFee": 550,
      "fsdo": "San Jose FSDO",
      "since": 2018,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 7,
      "responseHours": 8,
      "fees": {
        "ppl": 925,
        "cpl": 975,
        "sport": 750
      },
      "soonest": 7,
      "gap": 4,
      "count": 10,
      "bio": "Sport pilot and LSA-friendly examiner; relaxed tone, exact standards.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 192,
        "lodging": 114,
        "noShow": 200,
        "avgDaysToNext": 7,
        "leadDays": 10,
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
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 192,
          "me": 450
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 200,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 114,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 550,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          },
          "cpl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 575,
            "retestRentalHours": 1.3,
            "retestDualHours": 3
          },
          "sport": {
            "examinerFee": 750,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 450,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "ca22",
      "name": "Fernanda Sepúlveda-Ross",
      "home": "KSQL",
      "travelNm": 50,
      "travelFee": 150,
      "retestFee": 650,
      "fsdo": "San Jose FSDO",
      "since": 2018,
      "languages": [
        "English"
      ],
      "rating": 4.6,
      "reviews": 223,
      "responseHours": 12,
      "fees": {
        "ppl": 1075,
        "me": 1125,
        "cfi": 1550,
        "cfii": 1300,
        "mei": 1300
      },
      "soonest": 48,
      "gap": 2,
      "count": 11,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft. Twins must have a current weight & balance on board.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 218,
        "lodging": 156,
        "noShow": 200,
        "avgDaysToNext": 54,
        "leadDays": 62,
        "reviewList": [
          {
            "cert": "me",
            "stars": 5,
            "text": "Knows the twin inside out."
          },
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
          },
          {
            "cert": "cfii",
            "stars": 5,
            "text": "Asked me to teach an approach from the right seat."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 218,
          "me": 443
        },
        "cfiRatePerHr": 90,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 156,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1075,
            "rentalHoursTest": 2,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 1125,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1550,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 925,
            "retestRentalHours": 1.4,
            "retestDualHours": 2.5
          },
          "cfii": {
            "examinerFee": 1300,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 775,
            "retestRentalHours": 1.2,
            "retestDualHours": 2
          },
          "mei": {
            "examinerFee": 1300,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 775,
            "retestRentalHours": 0.8,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "ca23",
      "name": "Darius Khorramshahi",
      "home": "KHWD",
      "travelNm": 50,
      "travelFee": 100,
      "retestFee": 775,
      "fsdo": "Oakland FSDO",
      "since": 2014,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.4,
      "reviews": 204,
      "responseHours": 4,
      "fees": {
        "ir": 1025,
        "cfi": 1450
      },
      "soonest": 14,
      "gap": 3,
      "count": 11,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 214,
        "lodging": 146,
        "noShow": 250,
        "avgDaysToNext": 18,
        "leadDays": 24,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
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
          "se": 214,
          "me": 406
        },
        "cfiRatePerHr": 70,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 100,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 146,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ir": {
            "examinerFee": 1025,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 775,
            "retestRentalHours": 1.1,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1450,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 1100,
            "retestRentalHours": 1,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "ca24",
      "name": "Mirela Dobrescu",
      "home": "KOAK",
      "travelNm": 80,
      "travelFee": 75,
      "retestFee": 775,
      "fsdo": "Oakland FSDO",
      "since": 2014,
      "languages": [
        "English",
        "Korean"
      ],
      "rating": 4.9,
      "reviews": 219,
      "responseHours": 48,
      "fees": {
        "ppl": 1025,
        "ir": 1150,
        "cpl": 1150
      },
      "soonest": 14,
      "gap": 6,
      "count": 6,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant normally provides the aircraft. A Piper PA-28 Archer is available to rent for the test by arrangement (example: $182/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 182,
        "lodging": 164,
        "noShow": 150,
        "avgDaysToNext": 16,
        "leadDays": 26,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Structured day, finished early."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
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
          "se": 182,
          "me": 405
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 80,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 164,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 1025,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 775,
            "retestRentalHours": 0.8,
            "retestDualHours": 1
          },
          "ir": {
            "examinerFee": 1150,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 875,
            "retestRentalHours": 1,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 1150,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 875,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          }
        }
      }
    },
    {
      "id": "ca25",
      "name": "Ansel Winterbourne",
      "home": "KLVK",
      "travelNm": 100,
      "travelFee": 150,
      "retestFee": 450,
      "fsdo": "Oakland FSDO",
      "since": 2022,
      "languages": [
        "English"
      ],
      "rating": 4.6,
      "reviews": 96,
      "responseHours": 48,
      "fees": {
        "ppl": 875,
        "ir": 900,
        "cpl": 900
      },
      "soonest": 7,
      "gap": 3,
      "count": 9,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 180,
        "lodging": 151,
        "noShow": 300,
        "avgDaysToNext": 10,
        "leadDays": 14,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Structured day, finished early."
          }
        ]
      },
      "costModel": {
        "fictional": true,
        "rentalRatePerHr": {
          "se": 180,
          "me": 377
        },
        "cfiRatePerHr": 65,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 151,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 875,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 1.2,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 900,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 450,
            "retestRentalHours": 0.8,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 900,
            "rentalHoursTest": 2,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 450,
            "retestRentalHours": 1.4,
            "retestDualHours": 2
          }
        }
      }
    },
    {
      "id": "ca26",
      "name": "Paz Undurraga",
      "home": "KCCR",
      "travelNm": 100,
      "travelFee": 125,
      "retestFee": 475,
      "fsdo": "Oakland FSDO",
      "since": 2019,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 104,
      "responseHours": 3,
      "fees": {
        "ppl": 850,
        "ir": 825,
        "cpl": 925
      },
      "soonest": 35,
      "gap": 6,
      "count": 6,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 182,
        "lodging": 121,
        "noShow": 250,
        "avgDaysToNext": 41,
        "leadDays": 43,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
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
          "se": 182,
          "me": 401
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 100,
          "travelFee": 125,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 121,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 850,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 475,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "ir": {
            "examinerFee": 825,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1.5,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 450,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "cpl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 500,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          }
        }
      }
    },
    {
      "id": "ca27",
      "name": "Grady Hollenbeck",
      "home": "KSAC",
      "travelNm": 60,
      "travelFee": 75,
      "retestFee": 425,
      "fsdo": "Sacramento FSDO",
      "since": 2023,
      "languages": [
        "English",
        "Japanese"
      ],
      "rating": 4.4,
      "reviews": 67,
      "responseHours": 48,
      "fees": {
        "ppl": 825,
        "me": 975
      },
      "soonest": 24,
      "gap": 5,
      "count": 11,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1300,
          "costModel": {
            "examinerFee": 1300,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.07,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.3,
            "retestDualHours": 1.5
          }
        }
      ],
      "sample": {
        "rental": 197,
        "lodging": 171,
        "noShow": 250,
        "avgDaysToNext": 24,
        "leadDays": 32,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
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
          "se": 197,
          "me": 379
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 171,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.7,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 425,
            "retestRentalHours": 1.3,
            "retestDualHours": 2.5
          },
          "me": {
            "examinerFee": 975,
            "rentalHoursTest": 1.3,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.131,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 0.9,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "ca28",
      "name": "Hyun-woo Pemberton",
      "home": "KMHR",
      "travelNm": 80,
      "travelFee": 175,
      "retestFee": 650,
      "fsdo": "Sacramento FSDO",
      "since": 2020,
      "languages": [
        "English",
        "Korean"
      ],
      "rating": 4.3,
      "reviews": 24,
      "responseHours": 2,
      "fees": {
        "ppl": 925,
        "cpl": 975
      },
      "soonest": 46,
      "gap": 2,
      "count": 11,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 195,
        "lodging": 140,
        "noShow": 200,
        "avgDaysToNext": 47,
        "leadDays": 56,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
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
          "se": 195,
          "me": 448
        },
        "cfiRatePerHr": 90,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 80,
          "travelFee": 175,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 140,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 925,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 975,
            "rentalHoursTest": 1.4,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 675,
            "retestRentalHours": 1.2,
            "retestDualHours": 3
          }
        }
      }
    },
    {
      "id": "ca29",
      "name": "Celestine Abernethy-Rao",
      "home": "KFAT",
      "travelNm": 60,
      "travelFee": 75,
      "retestFee": 375,
      "fsdo": "Fresno FSDO",
      "since": 2011,
      "languages": [
        "English"
      ],
      "rating": 4.5,
      "reviews": 97,
      "responseHours": 8,
      "fees": {
        "ppl": 725,
        "cpl": 825,
        "cfi": 1300,
        "sport": 600
      },
      "soonest": 7,
      "gap": 6,
      "count": 6,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 210,
        "lodging": 125,
        "noShow": 200,
        "avgDaysToNext": 9,
        "leadDays": 15,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
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
          "se": 210,
          "me": 383
        },
        "cfiRatePerHr": 75,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 60,
          "travelFee": 75,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 125,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 725,
            "rentalHoursTest": 1.9,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 375,
            "retestRentalHours": 1.1,
            "retestDualHours": 2
          },
          "cpl": {
            "examinerFee": 825,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 3,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 425,
            "retestRentalHours": 1.4,
            "retestDualHours": 1.5
          },
          "cfi": {
            "examinerFee": 1300,
            "rentalHoursTest": 2,
            "cfiPrepHours": 5,
            "cfiPrepGroundHours": 2,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 650,
            "retestRentalHours": 1.4,
            "retestDualHours": 1
          },
          "sport": {
            "examinerFee": 600,
            "rentalHoursTest": 1.5,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.1,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 300,
            "retestRentalHours": 0.9,
            "retestDualHours": 1
          }
        }
      }
    },
    {
      "id": "ca30",
      "name": "Ivo Marchbanks",
      "home": "KBFL",
      "travelNm": 50,
      "travelFee": 150,
      "retestFee": 400,
      "fsdo": "Fresno FSDO",
      "since": 2016,
      "languages": [
        "English"
      ],
      "rating": 5,
      "reviews": 168,
      "responseHours": 6,
      "fees": {
        "ppl": 775,
        "ir": 825,
        "cpl": 850,
        "cfi": 1350,
        "cfii": 975
      },
      "soonest": 10,
      "gap": 6,
      "count": 11,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 196,
        "lodging": 119,
        "noShow": 200,
        "avgDaysToNext": 8,
        "leadDays": 17,
        "reviewList": [
          {
            "cert": "cfii",
            "stars": 5,
            "text": "Asked me to teach an approach from the right seat."
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
          "se": 196,
          "me": 349
        },
        "cfiRatePerHr": 80,
        "travel": {
          "mode": "examinerTravels",
          "travelNm": 50,
          "travelFee": 150,
          "ferryKt": 105,
          "driveRatePerMile": 0.76,
          "lodgingPerNight": 119,
          "lodgingOverNm": 100
        },
        "byCert": {
          "ppl": {
            "examinerFee": 775,
            "rentalHoursTest": 1.8,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 400,
            "retestRentalHours": 0.9,
            "retestDualHours": 2.5
          },
          "ir": {
            "examinerFee": 825,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4.5,
            "cfiPrepGroundHours": 1,
            "retestProbability": 0.227,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 425,
            "retestRentalHours": 1.2,
            "retestDualHours": 1
          },
          "cpl": {
            "examinerFee": 850,
            "rentalHoursTest": 1.6,
            "cfiPrepHours": 4,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.3,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 425,
            "retestRentalHours": 1.2,
            "retestDualHours": 3
          },
          "cfi": {
            "examinerFee": 1350,
            "rentalHoursTest": 2.2,
            "cfiPrepHours": 2.5,
            "cfiPrepGroundHours": 3,
            "retestProbability": 0.33,
            "retestProbabilitySource": "sourced+assumption",
            "retestFee": 675,
            "retestRentalHours": 0.8,
            "retestDualHours": 1
          },
          "cfii": {
            "examinerFee": 975,
            "rentalHoursTest": 2.1,
            "cfiPrepHours": 3.5,
            "cfiPrepGroundHours": 2.5,
            "retestProbability": 0.125,
            "retestProbabilitySource": "derived+assumption",
            "retestFee": 500,
            "retestRentalHours": 1,
            "retestDualHours": 3
          }
        }
      }
    }
  ];

  const data = { region: { name: "California", short: "CA" }, airports, dpes, fictional: true };
  if (typeof module !== "undefined" && module.exports) module.exports = data;
  if (root) root.CC_SAMPLE_CA = data;
})(typeof window !== "undefined" ? window : null);
