(function () {
  const session = UI.requireSession(["subjectId", "name", "block"]);
  if (!session) return;

  function isCompleted(examTypeId) {
    const completedExams = Store.get().completedExams;
    return Array.isArray(completedExams) && completedExams.includes(session.subjectId + ":" + examTypeId);
  }

  function completedScore(examTypeId) {
    const scores = Store.get().completedScores || {};
    return scores[session.subjectId + ":" + examTypeId];
  }

  function completedResult(examTypeId) {
    const results = Store.get().completedResults || {};
    return results[session.subjectId + ":" + examTypeId];
  }

  UI.setupAccountHeader(true);
  UI.qs("#back-btn").addEventListener("click", () => {
    window.location.href = "home.html";
  });

  const list = UI.qs("#examtype-list");
  const arrow = '<span class="tile-go">Begin<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  const subjectConfig = CONFIG.SUBJECTS.find((subject) => subject.id === session.subjectId);

  Promise.all(CONFIG.EXAM_TYPES.map(async (examType) => {
    const fallback = subjectConfig && subjectConfig.itemCounts
      ? { itemCount: subjectConfig.itemCounts[examType.id] }
      : {};
    try {
      const response = await API._get("/exam-config?subject=" + encodeURIComponent(session.subjectId) + "&examType=" + encodeURIComponent(examType.id));
      return Object.assign({}, examType, fallback, response.examConfig || {});
    } catch (error) {
      return Object.assign({}, examType, fallback);
    }
  })).then((examTypes) => {
    examTypes.forEach((examType) => {
      const available = UI.isWithinWindow(examType.opensAt, examType.closesAt);
      const completed = isCompleted(examType.id);
      const score = completedScore(examType.id);
      const savedResult = completedResult(examType.id);
      const enabled = available && !completed;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tile-card" + (completed ? " is-completed" : (available ? "" : " is-locked"));
      button.disabled = !available && !completed;
      const duration = examType.durationMinutes === 60 ? "1 hour" : examType.durationMinutes + " minutes";
      const itemCount = examType.itemCount ? examType.itemCount + " items - " : "";
      const completedLabel = score ? "Completed - " + score.score + "/" + score.total : "Completed";
      button.innerHTML =
        '<span class="tile-title">' + examType.name + '</span>' +
        '<span class="tile-desc"><span>' + itemCount + duration + '</span><span class="tile-window">Open: ' + UI.formatDateTime(examType.opensAt) + '<br>Close: ' + UI.formatDateTime(examType.closesAt) + '</span></span>' +
        '<span class="tile-footer"><span class="pill ' + (completed ? "is-completed" : (available ? "" : "is-locked")) + '">' + (completed ? completedLabel : (available ? "Available" : "Locked")) + '</span>' + (enabled ? arrow : "") + '</span>';
      if (enabled) {
        button.addEventListener("click", () => {
          Store.set({ examTypeId: examType.id });
          window.location.href = "exam.html";
        });
      } else if (completed && savedResult) {
        button.addEventListener("click", () => {
          Store.set({
            examTypeId: examType.id,
            result: savedResult,
            resultId: savedResult.resultId
          });
          window.location.href = "result.html";
        });
      }
      list.appendChild(button);
    });
  });
})();
