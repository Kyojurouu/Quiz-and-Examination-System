/**
 * CONFIG
 * Central place that decides which backend the frontend talks to.
 * Flip API_BASE to point at whichever engine you're demoing:
 *   http://localhost:4000  -> backend-imperative
 *   http://localhost:5000  -> backend-logic
 * Set MOCK_MODE to false once a real backend is running.
 */
const CONFIG = {
  API_BASE: "http://localhost:4000",
  MOCK_MODE: false,

  /**
   * SUBJECTS
   * Each subject carries a `durations` map (examTypeId -> minutes) that
   * overrides the global EXAM_TYPES.durationMinutes for that subject.
   * Source: professor survey responses (Sept 2026).
   */
  SUBJECTS: [
    {
      id: "ccincoml",
      code: "CCINCOML",
      name: "Introduction to Computing",
      professor: "Prof. Renee Claudette V. Pelagio",
      durations: { quiz: 15, midterms: 75, finals: 75 }
    },
    {
      id: "ctprfiss",
      code: "CTPRFISS",
      name: "Social and Professional Issues",
      professor: "Prof. Eliseo Q. Ramirez",
      durations: { quiz: 30, midterms: 120, finals: 120 }
    },
    {
      id: "ccsfen1l",
      code: "CCSFEN1L",
      name: "Software Engineering 1",
      professor: "Prof. Elsie V. Isip",
      durations: { quiz: 30, midterms: 90, finals: 90 }
    }
  ],

  /**
   * EXAM_TYPES
   * durationMinutes here is a global fallback only.
   * The active subject's durations map takes priority.
   * See: getDuration(subjectId, examTypeId) helper below.
   */
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
      durationMinutes: 90
    },
    {
      id: "finals",
      name: "Finals",
      opensAt: "2026-01-01T00:00",
      closesAt: "2026-12-31T23:59",
      durationMinutes: 90
    }
  ],

  /**
   * getDuration(subjectId, examTypeId)
   * Returns the correct exam duration in minutes for a given subject + exam type.
   * Checks the subject's durations map first; falls back to EXAM_TYPES default.
   */
  getDuration(subjectId, examTypeId) {
    const subject = this.SUBJECTS.find(function (s) { return s.id === subjectId; });
    if (subject && subject.durations && subject.durations[examTypeId] !== undefined) {
      return subject.durations[examTypeId];
    }
    const examType = this.EXAM_TYPES.find(function (e) { return e.id === examTypeId; });
    return examType ? examType.durationMinutes : 60;
  }
};
