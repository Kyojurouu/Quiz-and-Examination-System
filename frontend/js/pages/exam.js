(async function () {
  const session = UI.requireSession(["studentId", "subjectId", "examTypeId"]);
  if (!session) return;

  const examType = CONFIG.EXAM_TYPES.find((item) => item.id === session.examTypeId);
  UI.setupAccountHeader(true);

  const response = await API.getQuestions(session.subjectId, session.examTypeId);
  const questions = response.questions || [];
  const answers = {};
  const questionArea = UI.qs("#question-area");
  const qnavGrid = UI.qs("#qnav-grid");
  UI.qs("#question-counter").textContent = questions.length + (questions.length === 1 ? " item" : " items");
  UI.qs("#progress-fill").style.width = "0%";

  function updateProgress() {
    const answered = Object.keys(answers).length;
    UI.qs("#progress-fill").style.width = ((answered / questions.length) * 100) + "%";
  }

  questions.forEach((question, questionIndex) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question-block";
    wrapper.id = "q-" + question.id;
    const choices = question.choices.map((choice, choiceIndex) =>
      '<label class="choice"><input type="radio" name="question-' + question.id + '" value="' + choiceIndex + '">' +
      '<span class="bubble">' + UI.choiceLetter(choiceIndex) + '</span>' +
      '<span>' + choice + '</span></label>'
    ).join("");
    wrapper.innerHTML = '<div class="question-text">' + (questionIndex + 1) + ". " + question.text + '</div><div class="choice-list">' + choices + '</div>';
    wrapper.querySelectorAll("input").forEach((input) => {
      input.addEventListener("change", () => {
        answers[question.id] = Number(input.value);
        wrapper.querySelectorAll(".choice").forEach((choice) => choice.classList.remove("is-selected"));
        input.closest(".choice").classList.add("is-selected");
        UI.qs("#answer-error").style.display = "none";
        updateProgress();
        const navItem = qnavGrid.querySelector('[data-question-id="' + question.id + '"]');
        if (navItem) navItem.classList.add("is-answered");
      });
    });
    questionArea.appendChild(wrapper);

    const navItem = document.createElement("button");
    navItem.type = "button";
    navItem.className = "qnav-item";
    navItem.dataset.questionId = question.id;
    navItem.textContent = questionIndex + 1;
    navItem.addEventListener("click", () => {
      wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
      qnavGrid.querySelectorAll(".qnav-item").forEach((item) => item.classList.remove("is-current"));
      navItem.classList.add("is-current");
    });
    qnavGrid.appendChild(navItem);
  });

  let remaining = (examType ? examType.durationMinutes : 10) * 60;
  let submitted = false;
  const timer = UI.qs("#timer");
  const interval = window.setInterval(() => {
    timer.textContent = UI.formatClock(remaining);
    timer.classList.toggle("is-warning", remaining <= 120 && remaining > 30);
    timer.classList.toggle("is-danger", remaining <= 30);
    if (remaining <= 0) {
      window.clearInterval(interval);
      submit();
    }
    remaining -= 1;
  }, 1000);
  timer.textContent = UI.formatClock(remaining);

  // Guard against an accidental refresh or tab close wiping an in-progress
  // attempt — the browser shows its own confirmation text.
  window.addEventListener("beforeunload", (event) => {
    if (submitted) return;
    event.preventDefault();
    event.returnValue = "";
  });

  function markCompleted(subjectId, examTypeId, result) {
    const key = subjectId + ":" + examTypeId;
    const current = Store.get();
    const completedExams = Array.isArray(current.completedExams)
      ? current.completedExams.filter((item) => typeof item === "string")
      : [];
    if (!completedExams.includes(key)) completedExams.push(key);
    const completedScores = current.completedScores && typeof current.completedScores === "object"
      ? current.completedScores
      : {};
    completedScores[key] = { score: result.score, total: result.total };
    const completedResults = current.completedResults && typeof current.completedResults === "object"
      ? current.completedResults
      : {};
    completedResults[key] = {
      resultId: result.studentId,
      score: result.score,
      total: result.total,
      review: result.review || [],
      mistakes: result.mistakes || []
    };
    Store.set({ completedExams, completedScores, completedResults });
  }

  async function submit() {
    if (submitted) return;

    const unanswered = questions.filter((question) => answers[question.id] === undefined);
    if (unanswered.length > 0) {
      const answerError = UI.qs("#answer-error");
      answerError.textContent = unanswered.length + (unanswered.length === 1
        ? " question is still unanswered."
        : " questions are still unanswered.");
      answerError.style.display = "block";
      const firstUnanswered = UI.qs("#q-" + unanswered[0].id);
      if (firstUnanswered) firstUnanswered.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    submitted = true;
    window.clearInterval(interval);
    UI.qs("#submit-btn").disabled = true;
    UI.qs("#submit-btn").textContent = "Submitting…";

    const result = await API.submitExam({
      studentId: session.studentId,
      subjectId: session.subjectId,
      examTypeId: session.examTypeId,
      answers: questions.map((question) => ({ questionId: question.id, choiceIndex: answers[question.id] }))
    });
    if (result.result?.completed === true) {
      markCompleted(session.subjectId, session.examTypeId, result.result);
    }
    Store.set({ result: result.result, resultId: result.result?.studentId });
    window.location.href = "result.html";
  }

  UI.qs("#submit-btn").addEventListener("click", () => submit(false));
})();
