(async function () {
  const session = UI.requireSession(["subjectId", "name", "block"]);
  if (!session) return;

  function clearCompletedAfterRefresh() {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const wasReloaded = navigationEntry
      ? navigationEntry.type === "reload"
      : performance.navigation && performance.navigation.type === 1;
    if (!wasReloaded) return;

    const current = Store.get();
    delete current.completedExams;
    sessionStorage.setItem("nu-exam-session", JSON.stringify(current));
  }

  function isCompleted(subjectId, examTypeId) {
    const completedExams = Store.get().completedExams;
    return Array.isArray(completedExams) && completedExams.includes(subjectId + ":" + examTypeId);
  }

  async function getExamConfig(subjectId, examTypeId) {
    const query = "?subject=" + encodeURIComponent(subjectId) + "&examType=" + encodeURIComponent(examTypeId);
    const response = await fetch(CONFIG.API_BASE + "/exam-config" + query);
    if (!response.ok) throw new Error("Unable to load exam configuration.");
    return response.json();
  }

  function addCompletionStyles() {
    const style = document.createElement("style");
    style.textContent = [
      ".tile-card.is-completed{cursor:default;border-color:rgba(5,150,105,.35);background:var(--success-bg)}",
      ".tile-card.is-completed:hover{transform:none;box-shadow:var(--shadow-card);border-color:rgba(5,150,105,.35)}",
      ".pill.is-completed{background:var(--success);color:#fff}"
    ].join("");
    document.head.appendChild(style);
  }

  clearCompletedAfterRefresh();
  addCompletionStyles();
  UI.qs("#student-label").textContent = session.name + " | " + UI.subjectName(session.subjectId);
  UI.qs("#back-btn").addEventListener("click", () => {
    window.location.href = "details.html";
  });

  const list = UI.qs("#examtype-list");
  const arrow = '<span class="tile-go">Begin<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

  const examTypes = await Promise.all(CONFIG.EXAM_TYPES.map(async (examType) => {
    try {
      const response = await getExamConfig(session.subjectId, examType.id);
      return response?.examConfig ? { ...examType, ...response.examConfig } : examType;
    } catch {
      return examType;
    }
  }));

  examTypes.forEach((examType) => {
    const available = UI.isWithinWindow(examType.opensAt, examType.closesAt);
    const completed = isCompleted(session.subjectId, examType.id);
    const enabled = available && !completed;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile-card" + (completed ? " is-completed" : (available ? "" : " is-locked"));
    button.disabled = !enabled;
    const duration = examType.durationMinutes === 60 ? "1 hour" : examType.durationMinutes + " minutes";
    const itemCount = examType.itemCount ? examType.itemCount + " items - " : "";
    button.innerHTML =
      '<span class="tile-title">' + examType.name + '</span>' +
      '<span class="tile-desc"><span>' + itemCount + duration + '</span><span class="tile-window">Open: ' + UI.formatDateTime(examType.opensAt) + '<br>Close: ' + UI.formatDateTime(examType.closesAt) + '</span></span>' +
      '<span class="tile-footer"><span class="pill ' + (completed ? "is-completed" : (available ? "" : "is-locked")) + '">' + (completed ? "Completed" : (available ? "Available" : "Locked")) + '</span>' + (enabled ? arrow : "") + '</span>';
    if (enabled) {
      button.addEventListener("click", () => {
        Store.set({ examTypeId: examType.id });
        window.location.href = "exam.html";
      });
    }
    list.appendChild(button);
  });
})();
