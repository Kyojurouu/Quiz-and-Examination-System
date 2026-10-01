/**
 * UI
 * Small shared helpers. Nothing paradigm-specific lives here — this file
 * is pure presentation and is identical no matter which backend answers.
 */
const UI = {
  qs(sel, root) {
    return (root || document).querySelector(sel);
  },
  qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  },
  formatWindow(isoStart, isoEnd) {
    const opts = { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
    const start = new Date(isoStart).toLocaleString(undefined, opts);
    const end = new Date(isoEnd).toLocaleString(undefined, opts);
    return start + " – " + end;
  },
  formatDateTime(isoDate) {
    return new Date(isoDate).toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
    });
  },
  isWithinWindow(isoStart, isoEnd) {
    const now = Date.now();
    return now >= new Date(isoStart).getTime() && now <= new Date(isoEnd).getTime();
  },
  formatClock(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return m + ":" + s;
  },
  subjectName(subjectId) {
    const found = CONFIG.SUBJECTS.find((s) => s.id === subjectId);
    return found ? found.name : "Subject";
  },
  examTypeName(examTypeId) {
    const found = CONFIG.EXAM_TYPES.find((e) => e.id === examTypeId);
    return found ? found.name : "Exam";
  },
  // Roman numerals for exam-type ordering (Quiz -> Midterms -> Finals is a
  // genuine academic sequence, so a numeral badge carries real information).
  toRoman(num) {
    const table = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return table[num - 1] || String(num);
  },
  choiceLetter(index) {
    return String.fromCharCode(65 + index);
  },
  setupAccountHeader(includeSubject) {
    const session = Store.get();
    const label = UI.qs("#student-label");
    const logoutButton = UI.qs("#logout-btn");
    if (label) {
      label.textContent = includeSubject && session.subjectId
        ? (session.name || "Student") + " | " + UI.subjectName(session.subjectId)
        : (session.name || "Student");
    }
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        if (!window.confirm("Are you sure you want to log out?")) return;
        Store.clear();
        window.location.replace("login.html");
      });
    }
  },
  requireSession(keys) {
    // Redirects back to the start of the flow if required session data
    // is missing (e.g. someone opens exam.html directly).
    const session = Store.get();
    const missing = keys.some((k) => !session[k]);
    if (missing) {
      const accountFields = ["authenticated", "name", "accountEmail", "block"];
      const accountIsIncomplete = session.authenticated !== true ||
        accountFields.some((field) => !session[field]);
      window.location.href = accountIsIncomplete ? "login.html" : "home.html";
      return null;
    }
    return session;
  }
};
