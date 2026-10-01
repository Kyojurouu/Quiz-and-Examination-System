const ExamService = require("../services/examService");
const QuestionService = require("../services/questionService");
const PDFDocument = require("pdfkit");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

// Return only questions that are safe for the browser to receive.
function getQuestions(req, res) {
  // Defaults keep the endpoint usable even when query parameters are omitted.
  const subject = req.query.subject || "first-sub";
  const examType = req.query.examType || "quiz";
  return res.json({
    ok: true,
    questions: QuestionService.getQuestionsForClient(subject, examType)
  });
}

function getExamConfig(req, res) {
  const subject = req.query.subject || "first-sub";
  const examType = req.query.examType || "quiz";
  return res.json({
    ok: true,
    examConfig: QuestionService.getExamConfig(subject, examType)
  });
}

// Convert the HTTP payload into the service's normalized input shape.
async function submitExam(req, res) {
  try {
    const body = req.body;
    // Normalize both frontend naming conventions before calling the service.
    const subject = body.subject || body.subjectId || "General";
    const examType = body.examType || body.examTypeId || "quiz";
    const section = body.section || body.block || "COM232";
    const answers = Array.isArray(body.answers) ? body.answers : [];

    const result = await ExamService.evaluateAndSave({
      name: body.name || "Student",
      email: body.email,
      section,
      subject,
      examType,
      answers,
      studentId: body.studentId
    });

    return res.json({ ok: true, result });
  } catch (error) {
    console.error("[Imperative submitExam Error]", error);
    if (error.code === "ATTEMPT_COMPLETED") {
      return res.status(409).json({ ok: false, error: error.message });
    }
    return res.status(500).json({ ok: false, error: "Failed to evaluate exam" });
  }
}

async function getResultPdf(req, res) {
  try {
    // The report is printable HTML, allowing the browser to save it as a PDF.
    const result = await ExamService.getResultById(req.params.id);
    if (!result) {
      return res.status(404).send("Report not found");
    }
    const { student, total } = result;
    const review = result.review || result.mistakes || [];
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="national-university-${String(student.examType).toLowerCase()}-result.pdf"`);

    const document = new PDFDocument({ size: "A4", margin: 44 });
    document.pipe(res);
    document.info.Title = "National University Examination Result";
    document.info.Author = "National University Quiz & Examination System";
    const pageWidth = document.page.width - 88;
    const drawSummaryField = (label, value, x, y, width) => {
      document.roundedRect(x, y, width, 44, 3).fillAndStroke("#f3f5fb", "#d9deec");
      document.fillColor("#687795").font("Helvetica-Bold").fontSize(7).text(label.toUpperCase(), x + 9, y + 9, { width: width - 18 });
      document.fillColor("#35408e").font("Helvetica-Bold").fontSize(10).text(String(value), x + 9, y + 23, { width: width - 18, ellipsis: true });
    };

    document.rect(0, 0, document.page.width, 82).fill("#35408e");
    document.rect(0, 77, document.page.width, 5).fill("#ffd41c");
    document.fillColor("#fcfcfc").font("Helvetica-Bold").fontSize(19).text("National University", 44, 25);
    document.fillColor("#dfe4ff").font("Helvetica").fontSize(9).text("Quiz & Examination System", 44, 49);
    document.fillColor("#ffd41c").font("Helvetica-Bold").fontSize(8).text("OFFICIAL RESULT", 390, 27, { width: 158, align: "right" });
    document.fillColor("#fcfcfc").font("Helvetica-Bold").fontSize(18).text("Score report", 390, 41, { width: 158, align: "right" });

    const fieldGap = 8;
    const fieldWidth = (pageWidth - fieldGap * 3) / 4;
    const summaryY = 105;
    drawSummaryField("Student name", student.name, 44, summaryY, fieldWidth);
    drawSummaryField("Block", student.section, 44 + fieldWidth + fieldGap, summaryY, fieldWidth);
    drawSummaryField("Subject", String(student.subject).toUpperCase(), 44 + (fieldWidth + fieldGap) * 2, summaryY, fieldWidth);
    drawSummaryField("Exam type", String(student.examType).toUpperCase(), 44 + (fieldWidth + fieldGap) * 3, summaryY, fieldWidth);
    document.fillColor("#53627b").font("Helvetica-Bold").fontSize(10).text("FINAL SCORE", 44, 174);
    document.fillColor("#31708f").font("Helvetica-Bold").fontSize(25).text(`${student.score}/${total || "?"}`, 44, 188);
    document.moveTo(44, 226).lineTo(551, 226).strokeColor("#d9deec").stroke();
    document.fillColor("#35408e").font("Helvetica-Bold").fontSize(16).text("Answer review", 44, 246);
    document.fillColor("#687795").font("Helvetica").fontSize(9).text("Each response is shown with the submitted answer and answer key.", 44, 267);
    document.y = 292;

    review.forEach((answer, index) => {
      const questionHeight = document.heightOfString(String(answer.question), { width: 430, font: "Helvetica-Bold", size: 10 });
      const answerHeight = Math.max(document.heightOfString(String(answer.yourAnswer), { width: 190, font: "Helvetica", size: 9 }), document.heightOfString(String(answer.correctAnswer), { width: 190, font: "Helvetica", size: 9 }));
      const cardHeight = Math.max(68, questionHeight + answerHeight + 34);
      if (document.y + cardHeight > 775) document.addPage();
      const y = document.y;
      document.roundedRect(44, y, pageWidth, cardHeight, 3).fill(answer.isCorrect ? "#eef9f3" : "#fff2f1");
      document.fillColor("#35408e").font("Helvetica-Bold").fontSize(10).text(String(index + 1).padStart(2, "0"), 56, y + 14);
      document.fillColor("#26324a").font("Helvetica-Bold").fontSize(10).text(String(answer.question), 88, y + 12, { width: 430 });
      const answerY = y + questionHeight + 20;
      document.fillColor("#687795").font("Helvetica-Bold").fontSize(7).text("YOUR ANSWER", 88, answerY, { width: 205 });
      document.fillColor(answer.isCorrect ? "#28734f" : "#b33b38").font("Helvetica").fontSize(9).text(String(answer.yourAnswer), 88, answerY + 10, { width: 205 });
      document.fillColor("#687795").font("Helvetica-Bold").fontSize(7).text("CORRECT ANSWER", 310, answerY, { width: 205 });
      document.fillColor("#28734f").font("Helvetica").fontSize(9).text(String(answer.correctAnswer), 310, answerY + 10, { width: 205 });
      document.y = y + cardHeight + 10;
    });
    document.end();
    return;
    const reviewItems = review.length > 0
      ? review.map((answer) => `
          <li class="answer-card ${answer.isCorrect ? "correct" : "incorrect"}">
            <div class="question-number">${String(review.indexOf(answer) + 1).padStart(2, "0")}</div>
            <div class="answer-content">
              <div class="question">${escapeHtml(answer.question)}</div>
              <div class="answer-grid">
                <div><span>Your answer</span><strong>${escapeHtml(answer.yourAnswer)}</strong></div>
                <div><span>Correct answer</span><strong>${escapeHtml(answer.correctAnswer)}</strong></div>
              </div>
            </div>
          </li>`).join("")
      : "<li>No answers were recorded.</li>";

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "text/html");
    return res.send(`
      <!DOCTYPE html>
      <html><head>
        <title>Score Report - ${escapeHtml(student.name)}</title>
        <style>
          :root { color-scheme: light; }
          * { box-sizing: border-box; }
          body { margin: 0; padding: 32px 18px; background: #f4f6fb; color: #26324a; font-family: Arial, "Helvetica Neue", sans-serif; }
          .report { max-width: 820px; margin: 0 auto; background: #fcfcfc; box-shadow: 0 10px 30px rgba(53,64,142,.14); }
          .report-header { padding: 28px 34px 24px; background: #35408e; color: #fcfcfc; border-bottom: 6px solid #ffd41c; display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
          .brand { font-size: 20px; font-weight: 700; letter-spacing: .01em; }
          .brand small { display: block; margin-top: 5px; color: rgba(252,252,252,.72); font-size: 11px; font-weight: 400; }
          .report-heading { text-align: right; }
          .report-heading span { display: block; color: #ffd41c; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
          .report-heading h1 { margin: 5px 0 0; color: #fcfcfc; font-size: 28px; line-height: 1.1; }
          .print-button { margin-top: 14px; padding: 8px 12px; border: 1px solid rgba(252,252,252,.55); background: transparent; color: #fcfcfc; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
          .print-button:hover { background: #ffd41c; border-color: #ffd41c; color: #35408e; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 22px 34px; border-bottom: 1px solid #d9deec; }
          .summary-item { min-width: 0; padding: 10px 12px; background: #f3f5fb; border: 1px solid #d9deec; }
          .summary-item span { display: block; color: #687795; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
          .summary-item strong { display: block; overflow-wrap: anywhere; margin-top: 4px; color: #35408e; font-size: 14px; }
          .score-panel { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 0 34px; padding: 18px 0; border-bottom: 1px solid #d9deec; }
          .score-panel span { color: #53627b; font-size: 13px; font-weight: 700; }
          .score { color: #31708f; font-size: 30px; font-weight: 700; }
          .review { padding: 24px 34px 34px; }
          .review-heading { margin-bottom: 14px; }
          .review-heading h2 { margin: 0; color: #35408e; font-size: 20px; }
          .review-heading p { margin: 4px 0 0; color: #687795; font-size: 12px; }
          .review-list { margin: 0; padding: 0; list-style: none; }
          .answer-card { display: grid; grid-template-columns: 34px 1fr; gap: 14px; margin: 10px 0; padding: 14px; border: 1px solid #d9deec; }
          .answer-card.correct { background: #eef9f3; }
          .answer-card.incorrect { background: #fff2f1; }
          .question-number { color: #35408e; font-size: 13px; font-weight: 700; }
          .question { color: #26324a; font-size: 14px; font-weight: 700; line-height: 1.45; }
          .answer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
          .answer-grid div { padding: 9px 10px; background: rgba(252,252,252,.72); }
          .answer-grid span { display: block; color: #687795; font-size: 10px; font-weight: 700; text-transform: uppercase; }
          .answer-grid strong { display: block; margin-top: 3px; color: #26324a; font-size: 12px; line-height: 1.4; }
          .answer-card.incorrect .answer-grid div:first-child strong { color: #b33b38; }
          .answer-card.correct .answer-grid div strong { color: #28734f; }
          @media (max-width: 620px) { body { padding: 0; } .report-header, .summary, .review { padding-left: 20px; padding-right: 20px; } .summary { grid-template-columns: 1fr 1fr; } .score-panel { margin-left: 20px; margin-right: 20px; } .answer-grid { grid-template-columns: 1fr; } }
          @media print { body { padding: 0; background: #fcfcfc; } .report { box-shadow: none; max-width: none; } .report-header, .answer-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .print-button { display: none; } }
        </style>
      </head>
      <body>
        <div class="report">
          <header class="report-header"><div class="brand">National University<small>Quiz &amp; Examination System</small></div><div class="report-heading"><span>Official result</span><h1>Score report</h1><button class="print-button" type="button" onclick="window.print()">Save as PDF</button></div></header>
          <section class="summary"><div class="summary-item"><span>Student name</span><strong>${escapeHtml(student.name)}</strong></div><div class="summary-item"><span>Block</span><strong>${escapeHtml(student.section)}</strong></div><div class="summary-item"><span>Subject</span><strong>${escapeHtml(String(student.subject).toUpperCase())}</strong></div><div class="summary-item"><span>Exam type</span><strong>${escapeHtml(String(student.examType).toUpperCase())}</strong></div></section>
          <div class="score-panel"><span>Final score</span><strong class="score">${student.score}/${total || "?"}</strong></div>
          <section class="review"><div class="review-heading"><h2>Answer review</h2><p>Each response is shown with the submitted answer and answer key.</p></div><ol class="review-list">${reviewItems}</ol></section>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("[Imperative getResultPdf Error]", error);
    return res.status(500).send("Error generating report");
  }
}

module.exports = { getQuestions, getExamConfig, submitExam, getResultPdf };
