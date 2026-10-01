/**
 * API
 * Every page calls these functions instead of using fetch() directly.
 * That means swapping CONFIG.API_BASE between the imperative server
 * (:4000) and the logic server (:5000) — or turning MOCK_MODE off —
 * never requires touching the page scripts.
 */
const API = {
  async login(payload) {
    // payload: { name, block, subjectId }
    if (CONFIG.MOCK_MODE) {
      await API._delay();
      return { ok: true, studentId: "mock-" + Date.now() };
    }
    return API._post("/login", payload);
  },

  async getQuestions(subjectId, examTypeId) {
    if (CONFIG.MOCK_MODE) {
      await API._delay();
      return { ok: true, questions: getMockQuestions(subjectId, examTypeId) };
    }
    return API._get("/questions?subject=" + subjectId + "&examType=" + examTypeId);
  },

  async submitExam(payload) {
    const session = typeof Store !== "undefined" ? Store.get() : {};
    const fullPayload = {
      name: session.name || payload.name,
      email: session.accountEmail || payload.email,
      section: session.block || payload.section || payload.block,
      block: session.block || payload.block,
      ...payload
    };

    if (CONFIG.MOCK_MODE) {
      await API._delay();
      const questions = getMockQuestions(payload.subjectId, payload.examTypeId);
      const mistakes = [];
      const review = [];
      let correctCount = 0;

      questions.forEach((q) => {
        const given = payload.answers.find((a) => a.questionId === q.id);
        const givenIndex = given && given.choiceIndex != null ? given.choiceIndex : null;
        const isCorrect = givenIndex === q.correctIndex;
        const answerReview = {
          question: q.text,
          yourAnswer: givenIndex === null ? "No answer" : q.choices[givenIndex],
          correctAnswer: q.choices[q.correctIndex],
          isCorrect
        };
        review.push(answerReview);
        if (isCorrect) {
          correctCount++;
        } else {
          mistakes.push(answerReview);
        }
      });

      return {
        ok: true,
        result: {
          score: correctCount,
          total: questions.length,
          mistakes,
          review
        }
      };
    }
    return API._post("/submit-exam", fullPayload);
  },

  async downloadResultPdf(resultId) {
    const openReport = (html) => {
      const reportDocument = new DOMParser().parseFromString(html, "text/html");
      reportDocument.body.removeAttribute("onload");
      reportDocument.querySelectorAll("script").forEach((script) => script.remove());
      const reportUrl = URL.createObjectURL(new Blob([
        "<!DOCTYPE html>\n",
        reportDocument.documentElement.outerHTML
      ], { type: "text/html" }));
      const reportWindow = window.open(reportUrl, "_blank");
      if (reportWindow) {
        window.setTimeout(() => URL.revokeObjectURL(reportUrl), 60000);
      } else {
        URL.revokeObjectURL(reportUrl);
      }
    };

    if (CONFIG.MOCK_MODE) {
      const printableDocument = document.documentElement.cloneNode(true);
      printableDocument.querySelectorAll("script").forEach((script) => script.remove());
      openReport(printableDocument.outerHTML);
      return { ok: true, mocked: true };
    }
    const session = typeof Store !== "undefined" ? Store.get() : {};
    const resolvedResultId = resultId || session.resultId || session.result?.studentId;
    if (!resolvedResultId) {
      throw new Error("Result ID is missing.");
    }
    const response = await fetch(
      CONFIG.API_BASE + "/results/" + encodeURIComponent(resolvedResultId) + "/pdf",
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error("Unable to generate the result report.");
    }
    const pdfBlob = await response.blob();
    const downloadUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = "national-university-score-report.pdf";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
    return { ok: true };
  },

  async _get(path) {
    const res = await fetch(CONFIG.API_BASE + path);
    return res.json();
  },

  async _post(path, body) {
    const res = await fetch(CONFIG.API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return res.json();
  },

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms || 350));
  }
};
