// FICTIONAL SAMPLE DATA - invented examiners for UI development, not real people; airport identifiers are real.
//
// 50 invented Florida examiners for the Checkride Connect prototype (/workspace/checkride-connect).
// Names, ratings, reviews, fees, wait times, FSDO assignments and bios are all made up. No phone numbers or
// email addresses are included (the data.js examiner schema has no contact fields).
// Generated deterministically by /workspace/tools/gen_fl_sample.js.
//
// Shape matches the `dpes` entries in checkride-connect/data.js (same field names and types, with `sample`
// already attached the way data.js attaches sampleExtras). Two additions, both ignored by app.js:
//   - otherAuthorizations: [{ id, name, detail, fee }] for ATP and rotorcraft, which are NOT in data.js `certs`.
//     They are kept out of `fees` on purpose: app.js calls certById() on every fee key and would break.
//   - airports: superset of data.js airports (same fields) adding the extra home fields used here.
//
// Drop-in (browser): load after data.js, then
//   <script src="sample-fl-examiners.js"></script>
//   CC_DATA.airports = CC_SAMPLE_FL.airports; CC_DATA.dpes = CC_SAMPLE_FL.dpes;   // replace
//   // or append: CC_DATA.dpes.push(...CC_SAMPLE_FL.dpes)  (ids are fl01.., so no clash with d1..d13)
// Note: data.js seededBookings / school data reference "d1"; keep d1 if you replace the list.
// Node: const { dpes, airports } = require("./sample-fl-examiners.js");
(function (root) {
  const airports = [
    {
      "id": "KORL",
      "name": "Orlando Executive",
      "city": "Orlando",
      "lat": 28.545,
      "lng": -81.333,
      "tz": "America/New_York"
    },
    {
      "id": "KSFB",
      "name": "Orlando Sanford Intl",
      "city": "Sanford",
      "lat": 28.778,
      "lng": -81.238,
      "tz": "America/New_York"
    },
    {
      "id": "KISM",
      "name": "Kissimmee Gateway",
      "city": "Kissimmee",
      "lat": 28.29,
      "lng": -81.437,
      "tz": "America/New_York"
    },
    {
      "id": "KDAB",
      "name": "Daytona Beach Intl",
      "city": "Daytona Beach",
      "lat": 29.18,
      "lng": -81.058,
      "tz": "America/New_York"
    },
    {
      "id": "KMLB",
      "name": "Melbourne Orlando Intl",
      "city": "Melbourne",
      "lat": 28.103,
      "lng": -80.645,
      "tz": "America/New_York"
    },
    {
      "id": "KVRB",
      "name": "Vero Beach Regional",
      "city": "Vero Beach",
      "lat": 27.656,
      "lng": -80.418,
      "tz": "America/New_York"
    },
    {
      "id": "KLAL",
      "name": "Lakeland Linder Intl",
      "city": "Lakeland",
      "lat": 27.989,
      "lng": -82.019,
      "tz": "America/New_York"
    },
    {
      "id": "KTPA",
      "name": "Tampa Intl",
      "city": "Tampa",
      "lat": 27.976,
      "lng": -82.533,
      "tz": "America/New_York"
    },
    {
      "id": "KVDF",
      "name": "Tampa Executive",
      "city": "Tampa",
      "lat": 28.014,
      "lng": -82.345,
      "tz": "America/New_York"
    },
    {
      "id": "KPIE",
      "name": "St. Pete–Clearwater Intl",
      "city": "Clearwater",
      "lat": 27.91,
      "lng": -82.687,
      "tz": "America/New_York"
    },
    {
      "id": "KSRQ",
      "name": "Sarasota Bradenton Intl",
      "city": "Sarasota",
      "lat": 27.395,
      "lng": -82.554,
      "tz": "America/New_York"
    },
    {
      "id": "KFMY",
      "name": "Page Field",
      "city": "Fort Myers",
      "lat": 26.587,
      "lng": -81.863,
      "tz": "America/New_York"
    },
    {
      "id": "KRSW",
      "name": "Southwest Florida Intl",
      "city": "Fort Myers",
      "lat": 26.536,
      "lng": -81.755,
      "tz": "America/New_York"
    },
    {
      "id": "KAPF",
      "name": "Naples Municipal",
      "city": "Naples",
      "lat": 26.152,
      "lng": -81.775,
      "tz": "America/New_York"
    },
    {
      "id": "KFXE",
      "name": "Fort Lauderdale Executive",
      "city": "Fort Lauderdale",
      "lat": 26.197,
      "lng": -80.171,
      "tz": "America/New_York"
    },
    {
      "id": "KFLL",
      "name": "Fort Lauderdale–Hollywood Intl",
      "city": "Fort Lauderdale",
      "lat": 26.072,
      "lng": -80.153,
      "tz": "America/New_York"
    },
    {
      "id": "KPMP",
      "name": "Pompano Beach Airpark",
      "city": "Pompano Beach",
      "lat": 26.247,
      "lng": -80.111,
      "tz": "America/New_York"
    },
    {
      "id": "KBCT",
      "name": "Boca Raton",
      "city": "Boca Raton",
      "lat": 26.379,
      "lng": -80.108,
      "tz": "America/New_York"
    },
    {
      "id": "KOPF",
      "name": "Miami-Opa Locka Executive",
      "city": "Opa-locka",
      "lat": 25.907,
      "lng": -80.278,
      "tz": "America/New_York"
    },
    {
      "id": "KTMB",
      "name": "Miami Executive",
      "city": "Miami",
      "lat": 25.648,
      "lng": -80.433,
      "tz": "America/New_York"
    },
    {
      "id": "KEYW",
      "name": "Key West Intl",
      "city": "Key West",
      "lat": 24.556,
      "lng": -81.76,
      "tz": "America/New_York"
    },
    {
      "id": "KJAX",
      "name": "Jacksonville Intl",
      "city": "Jacksonville",
      "lat": 30.494,
      "lng": -81.688,
      "tz": "America/New_York"
    },
    {
      "id": "KCRG",
      "name": "Jacksonville Executive",
      "city": "Jacksonville",
      "lat": 30.336,
      "lng": -81.514,
      "tz": "America/New_York"
    },
    {
      "id": "KVQQ",
      "name": "Cecil Airport",
      "city": "Jacksonville",
      "lat": 30.219,
      "lng": -81.877,
      "tz": "America/New_York"
    },
    {
      "id": "KGNV",
      "name": "Gainesville Regional",
      "city": "Gainesville",
      "lat": 29.69,
      "lng": -82.272,
      "tz": "America/New_York"
    },
    {
      "id": "KOCF",
      "name": "Ocala Intl",
      "city": "Ocala",
      "lat": 29.177,
      "lng": -82.224,
      "tz": "America/New_York"
    },
    {
      "id": "KTLH",
      "name": "Tallahassee Intl",
      "city": "Tallahassee",
      "lat": 30.397,
      "lng": -84.35,
      "tz": "America/New_York"
    },
    {
      "id": "KECP",
      "name": "Northwest Florida Beaches Intl",
      "city": "Panama City",
      "lat": 30.358,
      "lng": -85.796,
      "tz": "America/Chicago"
    },
    {
      "id": "KPNS",
      "name": "Pensacola Intl",
      "city": "Pensacola",
      "lat": 30.473,
      "lng": -87.187,
      "tz": "America/Chicago"
    }
  ];

  const dpes = [
    {
      "id": "fl01",
      "name": "Delia Marchetti",
      "home": "KORL",
      "travelNm": 50,
      "travelFee": 250,
      "retestFee": 550,
      "fsdo": "Orlando FSDO",
      "since": 2009,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.9,
      "reviews": 96,
      "responseHours": 6,
      "fees": {
        "ppl": 1000,
        "cpl": 1100
      },
      "soonest": 13,
      "gap": 4,
      "count": 11,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 128,
        "lodging": 101,
        "noShow": 200,
        "avgDaysToNext": 14,
        "leadDays": 26,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      }
    },
    {
      "id": "fl02",
      "name": "Owen Thibodeaux",
      "home": "KORL",
      "travelNm": 80,
      "travelFee": 125,
      "retestFee": 600,
      "fsdo": "Orlando FSDO",
      "since": 2007,
      "languages": [
        "English",
        "Haitian Creole"
      ],
      "rating": 4.5,
      "reviews": 237,
      "responseHours": 3,
      "fees": {
        "ppl": 1075,
        "ir": 1025
      },
      "soonest": 31,
      "gap": 2,
      "count": 7,
      "bio": "Instrument specialist. Expect a full approach set and a thorough systems and weather oral.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 126,
        "lodging": 157,
        "noShow": 150,
        "avgDaysToNext": 31,
        "leadDays": 38,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Tough systems questions but fair."
          }
        ]
      }
    },
    {
      "id": "fl03",
      "name": "Renata Kowalczyk",
      "home": "KSFB",
      "travelNm": 80,
      "travelFee": 100,
      "retestFee": 450,
      "fsdo": "Orlando FSDO",
      "since": 2021,
      "languages": [
        "English",
        "Spanish",
        "Portuguese"
      ],
      "rating": 4.3,
      "reviews": 116,
      "responseHours": 24,
      "fees": {
        "ppl": 925,
        "ir": 925,
        "cfi": 1300,
        "cfii": 975,
        "sport": 700
      },
      "soonest": 45,
      "gap": 2,
      "count": 7,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 153,
        "lodging": 113,
        "noShow": 200,
        "avgDaysToNext": 50,
        "leadDays": 53,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Firm on standards, generous with teaching tips."
          },
          {
            "cert": "cfii",
            "stars": 4,
            "text": "Asked me to teach an approach from the right seat."
          },
          {
            "cert": "sport",
            "stars": 5,
            "text": "Relaxed but exact."
          }
        ]
      }
    },
    {
      "id": "fl04",
      "name": "Silas Okonjo",
      "home": "KSFB",
      "travelNm": 50,
      "travelFee": 75,
      "retestFee": 550,
      "fsdo": "Orlando FSDO",
      "since": 2024,
      "languages": [
        "English"
      ],
      "rating": 4.4,
      "reviews": 91,
      "responseHours": 4,
      "fees": {
        "ppl": 900,
        "cpl": 1150,
        "me": 1250
      },
      "soonest": 33,
      "gap": 6,
      "count": 8,
      "bio": "Former airline check airman; ATP and multi-engine rides are a large share of the calendar.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "A Piper Seminole twin is available for multi-engine checkrides by arrangement (example: $395/hr wet). Otherwise applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1375
        }
      ],
      "sample": {
        "rental": 174,
        "lodging": 152,
        "noShow": 250,
        "avgDaysToNext": 32,
        "leadDays": 45,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
          }
        ]
      }
    },
    {
      "id": "fl05",
      "name": "Hollis Vanderpool",
      "home": "KISM",
      "travelNm": 100,
      "travelFee": 250,
      "retestFee": 400,
      "fsdo": "Orlando FSDO",
      "since": 2024,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.5,
      "reviews": 147,
      "responseHours": 4,
      "fees": {
        "ppl": 875,
        "ir": 900
      },
      "soonest": 10,
      "gap": 3,
      "count": 7,
      "bio": "Private and instrument checkrides for local flight schools and independent CFIs.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 149,
        "lodging": 110,
        "noShow": 300,
        "avgDaysToNext": 10,
        "leadDays": 24,
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
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      }
    },
    {
      "id": "fl06",
      "name": "Bettina Carrow",
      "home": "KDAB",
      "travelNm": 50,
      "travelFee": 175,
      "retestFee": 400,
      "fsdo": "Orlando FSDO",
      "since": 2007,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 178,
      "responseHours": 6,
      "fees": {
        "ppl": 875,
        "ir": 950,
        "cpl": 1025
      },
      "soonest": 24,
      "gap": 3,
      "count": 6,
      "bio": "Rotorcraft and airplane examiner serving helicopter schools in the area.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft or helicopter (R22/R44 typical). Bring all maintenance logbooks.",
      "otherAuthorizations": [
        {
          "id": "rh",
          "name": "Rotorcraft-Helicopter (Private/Commercial/Instrument)",
          "detail": "Rotorcraft Helicopter",
          "fee": 1050
        }
      ],
      "sample": {
        "rental": 127,
        "lodging": 137,
        "noShow": 250,
        "avgDaysToNext": 27,
        "leadDays": 35,
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
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          }
        ]
      }
    },
    {
      "id": "fl07",
      "name": "Desmond Achterberg",
      "home": "KDAB",
      "travelNm": 75,
      "travelFee": 250,
      "retestFee": 600,
      "fsdo": "Orlando FSDO",
      "since": 2009,
      "languages": [
        "English",
        "French"
      ],
      "rating": 4.9,
      "reviews": 76,
      "responseHours": 8,
      "fees": {
        "ppl": 975,
        "ir": 1100,
        "cpl": 1200,
        "me": 1275,
        "cfi": 1475,
        "cfii": 1125,
        "mei": 1350
      },
      "soonest": 46,
      "gap": 6,
      "count": 7,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 180,
        "lodging": 116,
        "noShow": 200,
        "avgDaysToNext": 52,
        "leadDays": 58,
        "reviewList": [
          {
            "cert": "mei",
            "stars": 5,
            "text": "Thorough but friendly."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Full approach set, very well organized."
          }
        ]
      }
    },
    {
      "id": "fl08",
      "name": "Marisol Quintanar",
      "home": "KDAB",
      "travelNm": 60,
      "travelFee": 100,
      "retestFee": 650,
      "fsdo": "Orlando FSDO",
      "since": 2008,
      "languages": [
        "English"
      ],
      "rating": 4.6,
      "reviews": 5,
      "responseHours": 24,
      "fees": {
        "ppl": 975,
        "ir": 1100,
        "sport": 825
      },
      "soonest": 7,
      "gap": 5,
      "count": 9,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 171,
        "lodging": 121,
        "noShow": 200,
        "avgDaysToNext": 11,
        "leadDays": 12,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "sport",
            "stars": 5,
            "text": "Flew out to our grass strip, saved us a trip."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      }
    },
    {
      "id": "fl09",
      "name": "Leland Prewitt",
      "home": "KMLB",
      "travelNm": 60,
      "travelFee": 100,
      "retestFee": 600,
      "fsdo": "Orlando FSDO",
      "since": 2023,
      "languages": [
        "English",
        "French"
      ],
      "rating": 5,
      "reviews": 192,
      "responseHours": 2,
      "fees": {
        "ppl": 925,
        "cpl": 1100,
        "cfi": 1350,
        "cfii": 1075
      },
      "soonest": 19,
      "gap": 6,
      "count": 6,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 133,
        "lodging": 156,
        "noShow": 300,
        "avgDaysToNext": 18,
        "leadDays": 23,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          },
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Firm on standards, generous with teaching tips."
          }
        ]
      }
    },
    {
      "id": "fl10",
      "name": "Ingrid Halvorsen",
      "home": "KMLB",
      "travelNm": 75,
      "travelFee": 75,
      "retestFee": 600,
      "fsdo": "Orlando FSDO",
      "since": 2013,
      "languages": [
        "English",
        "Haitian Creole"
      ],
      "rating": 5,
      "reviews": 41,
      "responseHours": 3,
      "fees": {
        "ppl": 1050,
        "cpl": 1175,
        "cfi": 1400,
        "cfii": 1100
      },
      "soonest": 18,
      "gap": 3,
      "count": 11,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant normally provides the aircraft. A Piper PA-28 Archer is available to rent for the test by arrangement (example: $165/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 167,
        "lodging": 137,
        "noShow": 250,
        "avgDaysToNext": 24,
        "leadDays": 25,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Long FOI discussion. Prepare your lesson plans."
          },
          {
            "cert": "cfii",
            "stars": 5,
            "text": "Good debrief on instrument instruction."
          }
        ]
      }
    },
    {
      "id": "fl11",
      "name": "Cyrus Bellwether",
      "home": "KVRB",
      "travelNm": 30,
      "travelFee": 75,
      "retestFee": 450,
      "fsdo": "Orlando FSDO",
      "since": 2019,
      "languages": [
        "English",
        "Haitian Creole"
      ],
      "rating": 4.9,
      "reviews": 145,
      "responseHours": 2,
      "fees": {
        "ppl": 850,
        "ir": 900,
        "cfi": 1300,
        "cfii": 1025
      },
      "soonest": 11,
      "gap": 4,
      "count": 6,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant normally provides the aircraft. A Cessna 172 is available to rent for the test by arrangement (example: $175/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 153,
        "lodging": 117,
        "noShow": 250,
        "avgDaysToNext": 9,
        "leadDays": 18,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 4,
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
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      }
    },
    {
      "id": "fl12",
      "name": "Tamsin Ogilvy",
      "home": "KVRB",
      "travelNm": 60,
      "travelFee": 150,
      "retestFee": 750,
      "fsdo": "Orlando FSDO",
      "since": 2009,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.6,
      "reviews": 96,
      "responseHours": 24,
      "fees": {
        "ppl": 1100,
        "cpl": 1150,
        "me": 1250
      },
      "soonest": 7,
      "gap": 4,
      "count": 6,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1475
        }
      ],
      "sample": {
        "rental": 153,
        "lodging": 125,
        "noShow": 250,
        "avgDaysToNext": 6,
        "leadDays": 12,
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
            "cert": "cpl",
            "stars": 4,
            "text": "Structured day, finished early."
          }
        ]
      }
    },
    {
      "id": "fl13",
      "name": "Rafael Etcheverry",
      "home": "KLAL",
      "travelNm": 75,
      "travelFee": 200,
      "retestFee": 550,
      "fsdo": "Tampa FSDO",
      "since": 2022,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.9,
      "reviews": 216,
      "responseHours": 4,
      "fees": {
        "ppl": 825,
        "ir": 875,
        "cpl": 1075,
        "cfi": 1300
      },
      "soonest": 11,
      "gap": 4,
      "count": 8,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 166,
        "lodging": 125,
        "noShow": 250,
        "avgDaysToNext": 14,
        "leadDays": 15,
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
            "text": "Exact on maneuvers tolerances, fair debrief."
          }
        ]
      }
    },
    {
      "id": "fl14",
      "name": "Noreen Fitzhugh",
      "home": "KLAL",
      "travelNm": 60,
      "travelFee": 150,
      "retestFee": 450,
      "fsdo": "Tampa FSDO",
      "since": 2019,
      "languages": [
        "English"
      ],
      "rating": 4.3,
      "reviews": 12,
      "responseHours": 8,
      "fees": {
        "ppl": 825,
        "ir": 950,
        "cpl": 1000,
        "sport": 700
      },
      "soonest": 12,
      "gap": 5,
      "count": 8,
      "bio": "Sport pilot and LSA-friendly examiner; relaxed tone, exact standards.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 164,
        "lodging": 128,
        "noShow": 150,
        "avgDaysToNext": 16,
        "leadDays": 16,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "sport",
            "stars": 5,
            "text": "Flew out to our grass strip, saved us a trip."
          }
        ]
      }
    },
    {
      "id": "fl15",
      "name": "Wendell Ashcombe",
      "home": "KTPA",
      "travelNm": 60,
      "travelFee": 75,
      "retestFee": 550,
      "fsdo": "Tampa FSDO",
      "since": 2021,
      "languages": [
        "English",
        "Spanish",
        "Portuguese"
      ],
      "rating": 4.5,
      "reviews": 45,
      "responseHours": 48,
      "fees": {
        "ppl": 1025,
        "ir": 975,
        "cfi": 1400,
        "cfii": 1125
      },
      "soonest": 18,
      "gap": 3,
      "count": 7,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 150,
        "lodging": 151,
        "noShow": 250,
        "avgDaysToNext": 16,
        "leadDays": 22,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Firm on standards, generous with teaching tips."
          },
          {
            "cert": "cfii",
            "stars": 4,
            "text": "Asked me to teach an approach from the right seat."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      }
    },
    {
      "id": "fl16",
      "name": "Yesenia Arbeláez",
      "home": "KVDF",
      "travelNm": 30,
      "travelFee": 100,
      "retestFee": 600,
      "fsdo": "Tampa FSDO",
      "since": 2005,
      "languages": [
        "English"
      ],
      "rating": 4.8,
      "reviews": 94,
      "responseHours": 18,
      "fees": {
        "ppl": 875,
        "ir": 950,
        "me": 1175
      },
      "soonest": 31,
      "gap": 3,
      "count": 12,
      "bio": "Multi-engine add-ons and MEI rides; calendar fills fast in the spring.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 182,
        "lodging": 119,
        "noShow": 250,
        "avgDaysToNext": 34,
        "leadDays": 45,
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
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
          }
        ]
      }
    },
    {
      "id": "fl17",
      "name": "Gideon Sorensby",
      "home": "KVDF",
      "travelNm": 80,
      "travelFee": 75,
      "retestFee": 400,
      "fsdo": "Tampa FSDO",
      "since": 2014,
      "languages": [
        "English"
      ],
      "rating": 4.4,
      "reviews": 146,
      "responseHours": 6,
      "fees": {
        "ppl": 850,
        "ir": 925,
        "cpl": 1000
      },
      "soonest": 13,
      "gap": 6,
      "count": 6,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 129,
        "lodging": 151,
        "noShow": 300,
        "avgDaysToNext": 17,
        "leadDays": 24,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
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
      }
    },
    {
      "id": "fl18",
      "name": "Philippa Draycott",
      "home": "KPIE",
      "travelNm": 80,
      "travelFee": 125,
      "retestFee": 400,
      "fsdo": "Tampa FSDO",
      "since": 2017,
      "languages": [
        "English",
        "Haitian Creole"
      ],
      "rating": 4.8,
      "reviews": 25,
      "responseHours": 48,
      "fees": {
        "ppl": 875,
        "cpl": 1075
      },
      "soonest": 12,
      "gap": 5,
      "count": 10,
      "bio": "Rotorcraft and airplane examiner serving helicopter schools in the area.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
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
        "rental": 125,
        "lodging": 135,
        "noShow": 200,
        "avgDaysToNext": 9,
        "leadDays": 16,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
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
      }
    },
    {
      "id": "fl19",
      "name": "Dorian Kasprzak",
      "home": "KPIE",
      "travelNm": 90,
      "travelFee": 250,
      "retestFee": 500,
      "fsdo": "Tampa FSDO",
      "since": 2008,
      "languages": [
        "English",
        "French"
      ],
      "rating": 4.7,
      "reviews": 195,
      "responseHours": 24,
      "fees": {
        "ppl": 1000,
        "cpl": 1175
      },
      "soonest": 25,
      "gap": 4,
      "count": 8,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant normally provides the aircraft. A Piper PA-28 Archer is available to rent for the test by arrangement (example: $165/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 125,
        "lodging": 141,
        "noShow": 200,
        "avgDaysToNext": 23,
        "leadDays": 31,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      }
    },
    {
      "id": "fl20",
      "name": "Lucinda Ravelo",
      "home": "KSRQ",
      "travelNm": 30,
      "travelFee": 125,
      "retestFee": 650,
      "fsdo": "Tampa FSDO",
      "since": 2022,
      "languages": [
        "English"
      ],
      "rating": 4.5,
      "reviews": 61,
      "responseHours": 24,
      "fees": {
        "ppl": 1000,
        "ir": 975,
        "cpl": 1175,
        "me": 1250
      },
      "soonest": 35,
      "gap": 2,
      "count": 6,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1425
        }
      ],
      "sample": {
        "rental": 175,
        "lodging": 105,
        "noShow": 150,
        "avgDaysToNext": 40,
        "leadDays": 47,
        "reviewList": [
          {
            "cert": "me",
            "stars": 4,
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
            "text": "Full approach set, very well organized."
          }
        ]
      }
    },
    {
      "id": "fl21",
      "name": "Mateus Brandão",
      "home": "KSRQ",
      "travelNm": 75,
      "travelFee": 75,
      "retestFee": 400,
      "fsdo": "Tampa FSDO",
      "since": 2018,
      "languages": [
        "English"
      ],
      "rating": 4.5,
      "reviews": 53,
      "responseHours": 24,
      "fees": {
        "ppl": 825,
        "ir": 950,
        "cfi": 1250,
        "cfii": 975
      },
      "soonest": 26,
      "gap": 6,
      "count": 6,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 139,
        "lodging": 133,
        "noShow": 300,
        "avgDaysToNext": 30,
        "leadDays": 30,
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
      }
    },
    {
      "id": "fl22",
      "name": "Corinne Lemaistre",
      "home": "KFMY",
      "travelNm": 30,
      "travelFee": 150,
      "retestFee": 550,
      "fsdo": "Tampa FSDO",
      "since": 2006,
      "languages": [
        "English",
        "Spanish",
        "Portuguese"
      ],
      "rating": 4.4,
      "reviews": 210,
      "responseHours": 6,
      "fees": {
        "ppl": 825,
        "ir": 950,
        "cpl": 1050
      },
      "soonest": 10,
      "gap": 5,
      "count": 8,
      "bio": "Career-track focus: commercial maneuvers, complex/TAA aircraft and professional judgment.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 135,
        "lodging": 100,
        "noShow": 250,
        "avgDaysToNext": 16,
        "leadDays": 19,
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
      }
    },
    {
      "id": "fl23",
      "name": "Augustin Pelletier",
      "home": "KRSW",
      "travelNm": 75,
      "travelFee": 125,
      "retestFee": 750,
      "fsdo": "Tampa FSDO",
      "since": 2013,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.4,
      "reviews": 39,
      "responseHours": 4,
      "fees": {
        "ppl": 1000,
        "cpl": 1125
      },
      "soonest": 52,
      "gap": 4,
      "count": 12,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 161,
        "lodging": 128,
        "noShow": 150,
        "avgDaysToNext": 58,
        "leadDays": 55,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Exact on maneuvers tolerances, fair debrief."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      }
    },
    {
      "id": "fl24",
      "name": "Harriet Wexford",
      "home": "KAPF",
      "travelNm": 90,
      "travelFee": 250,
      "retestFee": 650,
      "fsdo": "Tampa FSDO",
      "since": 2010,
      "languages": [
        "English"
      ],
      "rating": 4.8,
      "reviews": 209,
      "responseHours": 6,
      "fees": {
        "ir": 975,
        "me": 1250
      },
      "soonest": 17,
      "gap": 7,
      "count": 8,
      "bio": "Former airline check airman; ATP and multi-engine rides are a large share of the calendar.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "A Piper Seminole twin is available for multi-engine checkrides by arrangement (example: $395/hr wet). Otherwise applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1425
        }
      ],
      "sample": {
        "rental": 160,
        "lodging": 137,
        "noShow": 200,
        "avgDaysToNext": 19,
        "leadDays": 29,
        "reviewList": [
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Knows the twin inside out."
          }
        ]
      }
    },
    {
      "id": "fl25",
      "name": "Emeka Nwosu-Hale",
      "home": "KFXE",
      "travelNm": 50,
      "travelFee": 150,
      "retestFee": 600,
      "fsdo": "South Florida FSDO",
      "since": 2014,
      "languages": [
        "English",
        "Portuguese"
      ],
      "rating": 4.3,
      "reviews": 42,
      "responseHours": 24,
      "fees": {
        "ppl": 1050
      },
      "soonest": 10,
      "gap": 2,
      "count": 8,
      "bio": "Primary-training examiner who keeps the oral scenario-based and the flight on schedule.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 162,
        "lodging": 151,
        "noShow": 150,
        "avgDaysToNext": 9,
        "leadDays": 22,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      }
    },
    {
      "id": "fl26",
      "name": "Saoirse Kinnard",
      "home": "KFXE",
      "travelNm": 50,
      "travelFee": 125,
      "retestFee": 550,
      "fsdo": "South Florida FSDO",
      "since": 2023,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.5,
      "reviews": 30,
      "responseHours": 24,
      "fees": {
        "ppl": 1025,
        "ir": 1025,
        "cpl": 1150
      },
      "soonest": 21,
      "gap": 2,
      "count": 8,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 154,
        "lodging": 100,
        "noShow": 300,
        "avgDaysToNext": 24,
        "leadDays": 35,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Structured day, finished early."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          }
        ]
      }
    },
    {
      "id": "fl27",
      "name": "Bertram Oyelaran",
      "home": "KFLL",
      "travelNm": 100,
      "travelFee": 175,
      "retestFee": 550,
      "fsdo": "South Florida FSDO",
      "since": 2008,
      "languages": [
        "English"
      ],
      "rating": 4.5,
      "reviews": 83,
      "responseHours": 8,
      "fees": {
        "ppl": 975,
        "cfi": 1375
      },
      "soonest": 28,
      "gap": 2,
      "count": 6,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 161,
        "lodging": 108,
        "noShow": 250,
        "avgDaysToNext": 31,
        "leadDays": 40,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Firm on standards, generous with teaching tips."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          }
        ]
      }
    },
    {
      "id": "fl28",
      "name": "Fabiola Duvergé",
      "home": "KPMP",
      "travelNm": 100,
      "travelFee": 75,
      "retestFee": 750,
      "fsdo": "South Florida FSDO",
      "since": 2007,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.4,
      "reviews": 152,
      "responseHours": 2,
      "fees": {
        "ppl": 1050,
        "ir": 1175
      },
      "soonest": 14,
      "gap": 7,
      "count": 8,
      "bio": "Instrument specialist. Expect a full approach set and a thorough systems and weather oral.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 146,
        "lodging": 101,
        "noShow": 300,
        "avgDaysToNext": 12,
        "leadDays": 22,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 4,
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
      }
    },
    {
      "id": "fl29",
      "name": "Judson Merrifield",
      "home": "KPMP",
      "travelNm": 30,
      "travelFee": 100,
      "retestFee": 400,
      "fsdo": "South Florida FSDO",
      "since": 2021,
      "languages": [
        "English",
        "Haitian Creole"
      ],
      "rating": 4.7,
      "reviews": 44,
      "responseHours": 18,
      "fees": {
        "ppl": 950,
        "ir": 1025,
        "cpl": 1125,
        "cfi": 1400
      },
      "soonest": 7,
      "gap": 4,
      "count": 11,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 125,
        "lodging": 118,
        "noShow": 250,
        "avgDaysToNext": 13,
        "leadDays": 15,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
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
      }
    },
    {
      "id": "fl30",
      "name": "Annika Strandberg",
      "home": "KBCT",
      "travelNm": 40,
      "travelFee": 175,
      "retestFee": 750,
      "fsdo": "South Florida FSDO",
      "since": 2018,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.8,
      "reviews": 123,
      "responseHours": 12,
      "fees": {
        "ppl": 1100,
        "ir": 1175
      },
      "soonest": 32,
      "gap": 2,
      "count": 11,
      "bio": "Holds rotorcraft-helicopter authorizations alongside airplane ratings.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft or helicopter (R22/R44 typical). Bring all maintenance logbooks.",
      "otherAuthorizations": [
        {
          "id": "rh",
          "name": "Rotorcraft-Helicopter (Private/Commercial/Instrument)",
          "detail": "Rotorcraft Helicopter",
          "fee": 1250
        }
      ],
      "sample": {
        "rental": 153,
        "lodging": 142,
        "noShow": 200,
        "avgDaysToNext": 34,
        "leadDays": 38,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Scenario-based oral, kept me thinking."
          }
        ]
      }
    },
    {
      "id": "fl31",
      "name": "Teodoro Villaseñor",
      "home": "KOPF",
      "travelNm": 100,
      "travelFee": 150,
      "retestFee": 550,
      "fsdo": "South Florida FSDO",
      "since": 2005,
      "languages": [
        "English",
        "Haitian Creole"
      ],
      "rating": 4.9,
      "reviews": 231,
      "responseHours": 4,
      "fees": {
        "ppl": 925,
        "ir": 950
      },
      "soonest": 10,
      "gap": 4,
      "count": 11,
      "bio": "Instrument specialist. Expect a full approach set and a thorough systems and weather oral.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant normally provides the aircraft. A Piper PA-28 Archer is available to rent for the test by arrangement (example: $165/hr wet).",
      "otherAuthorizations": [],
      "sample": {
        "rental": 130,
        "lodging": 137,
        "noShow": 300,
        "avgDaysToNext": 16,
        "leadDays": 24,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      }
    },
    {
      "id": "fl32",
      "name": "Calvin Ostrander",
      "home": "KOPF",
      "travelNm": 60,
      "travelFee": 150,
      "retestFee": 750,
      "fsdo": "South Florida FSDO",
      "since": 2019,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.6,
      "reviews": 50,
      "responseHours": 24,
      "fees": {
        "ppl": 1100,
        "ir": 1075
      },
      "soonest": 68,
      "gap": 7,
      "count": 9,
      "bio": "Former instrument ground school instructor; expects clean IACRA and logbook endorsements.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 164,
        "lodging": 118,
        "noShow": 200,
        "avgDaysToNext": 68,
        "leadDays": 73,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Scenario-based oral, kept me thinking."
          }
        ]
      }
    },
    {
      "id": "fl33",
      "name": "Imogen Pettibone",
      "home": "KTMB",
      "travelNm": 40,
      "travelFee": 100,
      "retestFee": 550,
      "fsdo": "South Florida FSDO",
      "since": 2016,
      "languages": [
        "English",
        "Haitian Creole"
      ],
      "rating": 4.7,
      "reviews": 239,
      "responseHours": 8,
      "fees": {
        "ppl": 1000,
        "ir": 1100,
        "cpl": 1175
      },
      "soonest": 21,
      "gap": 4,
      "count": 9,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 162,
        "lodging": 158,
        "noShow": 150,
        "avgDaysToNext": 20,
        "leadDays": 33,
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
            "text": "Tough systems questions but fair."
          }
        ]
      }
    },
    {
      "id": "fl34",
      "name": "Kenji Whitlow",
      "home": "KTMB",
      "travelNm": 40,
      "travelFee": 250,
      "retestFee": 700,
      "fsdo": "South Florida FSDO",
      "since": 2018,
      "languages": [
        "English"
      ],
      "rating": 4.3,
      "reviews": 124,
      "responseHours": 2,
      "fees": {
        "ppl": 975,
        "ir": 1025,
        "cpl": 1175
      },
      "soonest": 10,
      "gap": 4,
      "count": 7,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 153,
        "lodging": 109,
        "noShow": 300,
        "avgDaysToNext": 14,
        "leadDays": 24,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          }
        ]
      }
    },
    {
      "id": "fl35",
      "name": "Esperanza Galdámez",
      "home": "KEYW",
      "travelNm": 100,
      "travelFee": 150,
      "retestFee": 650,
      "fsdo": "South Florida FSDO",
      "since": 2022,
      "languages": [
        "English",
        "French"
      ],
      "rating": 4.3,
      "reviews": 44,
      "responseHours": 48,
      "fees": {
        "ppl": 1050,
        "ir": 1075,
        "cpl": 1175,
        "me": 1300,
        "cfi": 1475,
        "cfii": 1125,
        "sport": 775
      },
      "soonest": 11,
      "gap": 7,
      "count": 9,
      "bio": "Sport pilot and LSA-friendly examiner; relaxed tone, exact standards. Covers the Keys; travel to the mainland is by arrangement.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft. Twins must have a current weight & balance on board.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 156,
        "lodging": 103,
        "noShow": 150,
        "avgDaysToNext": 8,
        "leadDays": 24,
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
            "stars": 4,
            "text": "Scenario-based oral, kept me thinking."
          }
        ]
      }
    },
    {
      "id": "fl36",
      "name": "Thaddeus Brookover",
      "home": "KJAX",
      "travelNm": 40,
      "travelFee": 150,
      "retestFee": 600,
      "fsdo": "Jacksonville FSDO",
      "since": 2019,
      "languages": [
        "English"
      ],
      "rating": 4.9,
      "reviews": 55,
      "responseHours": 24,
      "fees": {
        "ppl": 925,
        "ir": 950,
        "cpl": 1025
      },
      "soonest": 70,
      "gap": 4,
      "count": 10,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 142,
        "lodging": 103,
        "noShow": 200,
        "avgDaysToNext": 74,
        "leadDays": 80,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Fair but thorough oral. Know your airspace."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          }
        ]
      }
    },
    {
      "id": "fl37",
      "name": "Rosalind Okerlund",
      "home": "KCRG",
      "travelNm": 60,
      "travelFee": 75,
      "retestFee": 500,
      "fsdo": "Jacksonville FSDO",
      "since": 2017,
      "languages": [
        "English"
      ],
      "rating": 4.8,
      "reviews": 137,
      "responseHours": 24,
      "fees": {
        "ppl": 900,
        "ir": 875,
        "sport": 725
      },
      "soonest": 11,
      "gap": 7,
      "count": 7,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel.",
      "cancellation": "$200 fee inside 72 hours unless weather.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 168,
        "lodging": 121,
        "noShow": 200,
        "avgDaysToNext": 8,
        "leadDays": 24,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Tough systems questions but fair."
          },
          {
            "cert": "sport",
            "stars": 5,
            "text": "Flew out to our grass strip, saved us a trip."
          }
        ]
      }
    },
    {
      "id": "fl38",
      "name": "Vaughn Castellano",
      "home": "KCRG",
      "travelNm": 50,
      "travelFee": 175,
      "retestFee": 450,
      "fsdo": "Jacksonville FSDO",
      "since": 2007,
      "languages": [
        "English",
        "Portuguese"
      ],
      "rating": 4.3,
      "reviews": 32,
      "responseHours": 4,
      "fees": {
        "ppl": 1000,
        "ir": 950,
        "me": 1175,
        "cfi": 1350,
        "cfii": 1075,
        "mei": 1300
      },
      "soonest": 49,
      "gap": 2,
      "count": 11,
      "bio": "Former airline check airman; ATP and multi-engine rides are a large share of the calendar.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1375
        }
      ],
      "sample": {
        "rental": 186,
        "lodging": 157,
        "noShow": 150,
        "avgDaysToNext": 46,
        "leadDays": 62,
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
            "cert": "cfi",
            "stars": 4,
            "text": "Firm on standards, generous with teaching tips."
          }
        ]
      }
    },
    {
      "id": "fl39",
      "name": "Mireille Toussaint",
      "home": "KVQQ",
      "travelNm": 75,
      "travelFee": 175,
      "retestFee": 550,
      "fsdo": "Jacksonville FSDO",
      "since": 2016,
      "languages": [
        "English",
        "Portuguese"
      ],
      "rating": 4.8,
      "reviews": 174,
      "responseHours": 12,
      "fees": {
        "ppl": 975,
        "ir": 950
      },
      "soonest": 24,
      "gap": 3,
      "count": 9,
      "bio": "Former instrument ground school instructor; expects clean IACRA and logbook endorsements.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 159,
        "lodging": 102,
        "noShow": 250,
        "avgDaysToNext": 27,
        "leadDays": 29,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "ir",
            "stars": 4,
            "text": "Scenario-based oral, kept me thinking."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          }
        ]
      }
    },
    {
      "id": "fl40",
      "name": "Ezra Lindqvist",
      "home": "KGNV",
      "travelNm": 60,
      "travelFee": 150,
      "retestFee": 600,
      "fsdo": "Jacksonville FSDO",
      "since": 2018,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.5,
      "reviews": 211,
      "responseHours": 24,
      "fees": {
        "ppl": 875,
        "ir": 975,
        "cpl": 1100,
        "sport": 700
      },
      "soonest": 25,
      "gap": 5,
      "count": 10,
      "bio": "Sport pilot and LSA-friendly examiner; relaxed tone, exact standards.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 144,
        "lodging": 150,
        "noShow": 150,
        "avgDaysToNext": 30,
        "leadDays": 35,
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
      }
    },
    {
      "id": "fl41",
      "name": "Petra Szabolcs",
      "home": "KOCF",
      "travelNm": 50,
      "travelFee": 200,
      "retestFee": 700,
      "fsdo": "Jacksonville FSDO",
      "since": 2009,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 8,
      "responseHours": 2,
      "fees": {
        "ppl": 950,
        "cfi": 1425,
        "cfii": 1100
      },
      "soonest": 32,
      "gap": 2,
      "count": 8,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 135,
        "lodging": 100,
        "noShow": 300,
        "avgDaysToNext": 34,
        "leadDays": 38,
        "reviewList": [
          {
            "cert": "cfi",
            "stars": 5,
            "text": "Firm on standards, generous with teaching tips."
          },
          {
            "cert": "cfii",
            "stars": 5,
            "text": "Good debrief on instrument instruction."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Calm and professional, easy to talk to before the test."
          }
        ]
      }
    },
    {
      "id": "fl42",
      "name": "Darnell Keough",
      "home": "KOCF",
      "travelNm": 60,
      "travelFee": 150,
      "retestFee": 400,
      "fsdo": "Jacksonville FSDO",
      "since": 2020,
      "languages": [
        "English",
        "French"
      ],
      "rating": 4.5,
      "reviews": 134,
      "responseHours": 18,
      "fees": {
        "ppl": 925,
        "cpl": 1125
      },
      "soonest": 12,
      "gap": 4,
      "count": 11,
      "bio": "Holds rotorcraft-helicopter authorizations alongside airplane ratings.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft or helicopter (R22/R44 typical). Bring all maintenance logbooks.",
      "otherAuthorizations": [
        {
          "id": "rh",
          "name": "Rotorcraft-Helicopter (Private/Commercial/Instrument)",
          "detail": "Rotorcraft Helicopter",
          "fee": 1100
        }
      ],
      "sample": {
        "rental": 127,
        "lodging": 157,
        "noShow": 150,
        "avgDaysToNext": 13,
        "leadDays": 19,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Briefed the plan up front and kept it on time."
          },
          {
            "cert": "cpl",
            "stars": 4,
            "text": "Structured day, finished early."
          }
        ]
      }
    },
    {
      "id": "fl43",
      "name": "Opal Wainscott",
      "home": "KTLH",
      "travelNm": 60,
      "travelFee": 250,
      "retestFee": 400,
      "fsdo": "Jacksonville FSDO",
      "since": 2010,
      "languages": [
        "English",
        "Spanish"
      ],
      "rating": 4.5,
      "reviews": 166,
      "responseHours": 24,
      "fees": {
        "ppl": 775,
        "ir": 775,
        "cpl": 1000,
        "me": 1075,
        "sport": 700
      },
      "soonest": 68,
      "gap": 3,
      "count": 6,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "Free reschedule with 72+ hours notice. Weather cancellations are always free.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1225
        }
      ],
      "sample": {
        "rental": 176,
        "lodging": 135,
        "noShow": 250,
        "avgDaysToNext": 66,
        "leadDays": 80,
        "reviewList": [
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Structured day, finished early."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
          },
          {
            "cert": "sport",
            "stars": 5,
            "text": "Relaxed but exact."
          }
        ]
      }
    },
    {
      "id": "fl44",
      "name": "Hugo Ferreira-Lunt",
      "home": "KECP",
      "travelNm": 40,
      "travelFee": 200,
      "retestFee": 600,
      "fsdo": "Jacksonville FSDO",
      "since": 2013,
      "languages": [
        "English"
      ],
      "rating": 4.6,
      "reviews": 72,
      "responseHours": 24,
      "fees": {
        "ppl": 900,
        "ir": 975,
        "cfi": 1300,
        "cfii": 1100
      },
      "soonest": 13,
      "gap": 2,
      "count": 7,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "Free reschedule with 5 days notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 152,
        "lodging": 150,
        "noShow": 200,
        "avgDaysToNext": 16,
        "leadDays": 22,
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
            "text": "Scenario-based oral, kept me thinking."
          }
        ]
      }
    },
    {
      "id": "fl45",
      "name": "Beatriz Solórzano",
      "home": "KPNS",
      "travelNm": 50,
      "travelFee": 125,
      "retestFee": 600,
      "fsdo": "Jacksonville FSDO",
      "since": 2020,
      "languages": [
        "English",
        "French"
      ],
      "rating": 4.6,
      "reviews": 117,
      "responseHours": 18,
      "fees": {
        "ppl": 950,
        "ir": 875,
        "me": 1175
      },
      "soonest": 42,
      "gap": 4,
      "count": 12,
      "bio": "Also does ATP practical tests for regional-airline pipeline students.",
      "cancellation": "50% of the fee is forfeited inside 24 hours.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [
        {
          "id": "atp",
          "name": "Airline Transport Pilot (ATP)",
          "detail": "Airplane Multi-Engine Land",
          "fee": 1325
        }
      ],
      "sample": {
        "rental": 168,
        "lodging": 153,
        "noShow": 300,
        "avgDaysToNext": 46,
        "leadDays": 48,
        "reviewList": [
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
          },
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          }
        ]
      }
    },
    {
      "id": "fl46",
      "name": "Quentin Ashby-Rowe",
      "home": "KPNS",
      "travelNm": 100,
      "travelFee": 100,
      "retestFee": 650,
      "fsdo": "Jacksonville FSDO",
      "since": 2013,
      "languages": [
        "English",
        "Spanish",
        "Portuguese"
      ],
      "rating": 4.7,
      "reviews": 116,
      "responseHours": 36,
      "fees": {
        "ppl": 950,
        "me": 1225,
        "cfi": 1425,
        "cfii": 1100,
        "mei": 1325
      },
      "soonest": 17,
      "gap": 3,
      "count": 12,
      "bio": "Retired Part 141 chief instructor who now does CFI, CFII and MEI checkrides.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft. Twins must have a current weight & balance on board.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 159,
        "lodging": 112,
        "noShow": 200,
        "avgDaysToNext": 18,
        "leadDays": 22,
        "reviewList": [
          {
            "cert": "ppl",
            "stars": 4,
            "text": "Calm and professional, easy to talk to before the test."
          },
          {
            "cert": "me",
            "stars": 5,
            "text": "Great engine-out briefing before the flight."
          },
          {
            "cert": "cfi",
            "stars": 4,
            "text": "Firm on standards, generous with teaching tips."
          }
        ]
      }
    },
    {
      "id": "fl47",
      "name": "Ximena Barahona",
      "home": "KORL",
      "travelNm": 80,
      "travelFee": 200,
      "retestFee": 500,
      "fsdo": "Orlando FSDO",
      "since": 2020,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 236,
      "responseHours": 12,
      "fees": {
        "ppl": 1000,
        "ir": 1025,
        "cpl": 1100
      },
      "soonest": 7,
      "gap": 2,
      "count": 10,
      "bio": "Works with several Part 141 programs; publishes cancellations quickly.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 145,
        "lodging": 136,
        "noShow": 150,
        "avgDaysToNext": 13,
        "leadDays": 11,
        "reviewList": [
          {
            "cert": "ir",
            "stars": 5,
            "text": "Full approach set, very well organized."
          },
          {
            "cert": "cpl",
            "stars": 5,
            "text": "Exact on maneuvers tolerances, fair debrief."
          },
          {
            "cert": "ppl",
            "stars": 5,
            "text": "Fair but thorough oral. Know your airspace."
          }
        ]
      }
    },
    {
      "id": "fl48",
      "name": "Wallace Teague",
      "home": "KSFB",
      "travelNm": 100,
      "travelFee": 125,
      "retestFee": 700,
      "fsdo": "Orlando FSDO",
      "since": 2010,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 146,
      "responseHours": 12,
      "fees": {
        "ppl": 1050,
        "ir": 1050,
        "cpl": 1125,
        "sport": 775
      },
      "soonest": 62,
      "gap": 2,
      "count": 10,
      "bio": "Light-sport and private checkrides at smaller fields. Happy to travel.",
      "cancellation": "$150 fee inside 48 hours unless weather or mechanical.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 141,
        "lodging": 103,
        "noShow": 300,
        "avgDaysToNext": 67,
        "leadDays": 68,
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
      }
    },
    {
      "id": "fl49",
      "name": "Sunil Varadarajan",
      "home": "KLAL",
      "travelNm": 90,
      "travelFee": 75,
      "retestFee": 650,
      "fsdo": "Tampa FSDO",
      "since": 2022,
      "languages": [
        "English"
      ],
      "rating": 5,
      "reviews": 22,
      "responseHours": 3,
      "fees": {
        "ppl": 900,
        "ir": 1000,
        "cpl": 1125,
        "cfi": 1350,
        "cfii": 1050
      },
      "soonest": 13,
      "gap": 2,
      "count": 11,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 174,
        "lodging": 132,
        "noShow": 250,
        "avgDaysToNext": 18,
        "leadDays": 21,
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
            "text": "Calm and professional, easy to talk to before the test."
          }
        ]
      }
    },
    {
      "id": "fl50",
      "name": "Colette Brannigan",
      "home": "KFXE",
      "travelNm": 90,
      "travelFee": 250,
      "retestFee": 650,
      "fsdo": "South Florida FSDO",
      "since": 2016,
      "languages": [
        "English"
      ],
      "rating": 4.7,
      "reviews": 181,
      "responseHours": 6,
      "fees": {
        "ppl": 1100,
        "ir": 1150,
        "cpl": 1225,
        "cfi": 1475
      },
      "soonest": 56,
      "gap": 3,
      "count": 10,
      "bio": "Instructor checkride examiner. Bring complete lesson plans and expect a long FOI discussion.",
      "cancellation": "Free reschedule with 48 hours notice.",
      "aircraft": "Applicant provides the aircraft. IFR-capable with a current GPS database for instrument rides.",
      "otherAuthorizations": [],
      "sample": {
        "rental": 175,
        "lodging": 121,
        "noShow": 300,
        "avgDaysToNext": 57,
        "leadDays": 61,
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
            "text": "Firm on standards, generous with teaching tips."
          }
        ]
      }
    }
  ];

  const data = { region: { name: "Florida", short: "FL" }, airports, dpes, fictional: true };
  if (typeof module !== "undefined" && module.exports) module.exports = data;
  if (root) root.CC_SAMPLE_FL = data;
})(typeof window !== "undefined" ? window : null);
