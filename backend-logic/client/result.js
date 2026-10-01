(function () {
  const session = UI.requireSession(["name", "block", "subjectId", "examTypeId", "result"]);
  if (!session) return;
  UI.setupAccountHeader();

  const result = session.result;
  UI.qs("#score-value").textContent = result.score + "/" + result.total;
  UI.qs("#summary-name").textContent = session.name;
  UI.qs("#summary-block").textContent = session.block;
  UI.qs("#summary-subject").textContent = UI.subjectName(session.subjectId);
  UI.qs("#summary-examtype").textContent = UI.examTypeName(session.examTypeId);

  const reviewList = UI.qs("#review-list");
  const review = result.review || result.mistakes || [];
  review.forEach((answer, index) => {
    const item = document.createElement("article");
    item.className = "review-item " + (answer.isCorrect ? "is-correct" : "is-incorrect");
    const answerDetails = answer.isCorrect
      ? '<div class="review-answers"><div><span>Correct answer</span><strong class="correct-answer"></strong></div></div>'
      : '<div class="review-answers"><div><span>Your answer</span><strong class="your-answer"></strong></div><div><span>Correct answer</span><strong class="correct-answer"></strong></div></div>';
    item.innerHTML = '<div class="review-number">' + String(index + 1).padStart(2, "0") + '</div><div class="review-content"><div class="review-status">' + (answer.isCorrect ? "Correct" : "Review this answer") + '</div><div class="review-question"></div>' + answerDetails + '</div>';
    item.querySelector(".review-question").textContent = answer.question;
    item.querySelector(".correct-answer").textContent = answer.correctAnswer;
    if (!answer.isCorrect) {
      item.querySelector(".your-answer").textContent = answer.yourAnswer;
    }
    reviewList.appendChild(item);
  });

  UI.qs("#pdf-btn").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await API.downloadResultPdf(session.resultId);
    } catch (error) {
      console.error("[Result PDF Error]", error);
    } finally {
      button.disabled = false;
    }
  });
  UI.qs("#home-btn").addEventListener("click", () => {
    Store.set({
      subjectId: null,
      examTypeId: null,
      studentId: null,
      result: null,
      resultId: null
    });
    window.location.href = "home.html";
  });
})();
