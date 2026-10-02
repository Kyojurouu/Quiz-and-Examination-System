const QuestionService = require("../services/questionService");
const ExamService = require("../services/examService");
const PDFDocument = require("pdfkit");
const { InputError } = QuestionService;
const {
  validateQuestionRequest,
  validateSubmission
} = require("../utils/requestValidation");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

function handleError(res, error, fallback) {
  if (error instanceof InputError) {
    return res.status(400).json({ ok: false, error: error.message });
  }
  console.error(`[Logic Backend] ${fallback}`, error);
  return res.status(500).json({ ok: false, error: fallback });
}

/**
 * EXAM CONTROLLER
 * Handles question delivery and exam submissions
 */
class ExamController {
  /**
   * GET /questions?subject=:subject&examType=:examType
   */
  static async getQuestions(req, res) {
    try {
      const { subject, examType } = validateQuestionRequest(req.query);
      const result = QuestionService.getQuestionsForClient(subject, examType);
      return res.json({
        ok: true,
        questions: result.questions,
        examConfig: result.examConfig
      });
    } catch (error) {
      return handleError(res, error, "Failed to load questions.");
    }
  }

  static getExamConfig(req, res) {
    try {
      const { subject, examType } = validateQuestionRequest(req.query);
      return res.json({
        ok: true,
        examConfig: QuestionService.getExamConfig(subject, examType)
      });
    } catch (error) {
      return handleError(res, error, "Failed to load exam configuration.");
    }
  }

  /**
   * POST /submit-exam
   */
  static async submitExam(req, res) {
    try {
      const submission = validateSubmission(req.body);
      const result = await ExamService.evaluateAndSave(submission);

      return res.json({
        ok: true,
        result
      });
    } catch (error) {
      if (error.code === "ATTEMPT_COMPLETED") {
        return res.status(409).json({ ok: false, error: error.message });
      }
      return handleError(res, error, "Failed to evaluate exam.");
    }
  }

  /**
   * GET /results/:id/pdf
   */
  static async getResultPdf(req, res) {
    try {
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
    } catch (error) {
      console.error("[ExamController getResultPdf Error]", error);
      return res.status(500).send("Error generating report");
    }
  }
}

module.exports = ExamController;
