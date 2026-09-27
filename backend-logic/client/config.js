/**
 * Logic-backend runtime configuration.
 *
 * The shared frontend files remain unchanged in the repository. When the
 * application is opened through the Logic server, server.js serves this file
 * at /js/config.js instead of modifying frontend/js/config.js.
 */
const CONFIG = {
  API_BASE: window.location.origin,
  MOCK_MODE: false,

  SUBJECTS: [
    { id: "ccincoml", code: "CCINCOML", name: "Introduction to Computing" },
    { id: "ccsfen1l", code: "CCSFEN1L", name: "Software Engineering 1" },
    { id: "ctprfiss", code: "CTPRFISS", name: "Social and Professional Issues" }
  ],

  // The backend returns the actual item count and duration for the selected
  // professor, subject, and exam type. These remain safe UI fallbacks.
  EXAM_TYPES: [
    {
      id: "quiz",
      name: "Quiz",
      opensAt: "2026-01-01T00:00",
      closesAt: "2026-12-31T23:59",
      durationMinutes: 30
    },
    {
      id: "midterms",
      name: "Midterms",
      opensAt: "2026-01-01T00:00",
      closesAt: "2026-12-31T23:59",
      durationMinutes: 60
    },
    {
      id: "finals",
      name: "Finals",
      opensAt: "2026-01-01T00:00",
      closesAt: "2026-12-31T23:59",
      durationMinutes: 60
    }
  ]
};
