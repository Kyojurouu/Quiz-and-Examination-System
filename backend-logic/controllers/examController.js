const QuestionService = require("../services/questionService");
const ExamService = require("../services/examService");
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
      const { student, mistakes, total } = result;
      const mistakeItems = mistakes.length > 0
        ? mistakes.map((mistake) => `
            <li>
              <strong>${escapeHtml(mistake.question)}</strong><br>
              Your answer: ${escapeHtml(mistake.yourAnswer)}<br>
              Correct answer: ${escapeHtml(mistake.correctAnswer)}
            </li>`).join("")
        : "<li>No mistakes. Excellent work!</li>";

      // Printable HTML report that the browser can render/save as PDF
      res.setHeader("Content-Type", "text/html");
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Score Report - ${escapeHtml(student.name)}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .card { border: 2px solid #0f172a; padding: 24px; border-radius: 8px; max-width: 600px; margin: auto; }
            h1 { margin-top: 0; color: #0284c7; }
            .field { margin: 12px 0; font-size: 16px; }
            .score { font-size: 32px; font-weight: bold; color: #059669; }
            li { margin: 14px 0; line-height: 1.45; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="card">
            <h1>National University - Examination Report</h1>
            <div class="field"><strong>Student Name:</strong> ${escapeHtml(student.name)}</div>
            <div class="field"><strong>Section / Block:</strong> ${escapeHtml(student.section)}</div>
            <div class="field"><strong>Subject:</strong> ${escapeHtml(student.subject)}</div>
            <div class="field"><strong>Exam Type:</strong> ${escapeHtml(student.examType)}</div>
            <div class="field"><strong>Deductive Score:</strong> <span class="score">${student.score}/${total || "?"}</span></div>
            <h2>Mistakes</h2>
            <ol>${mistakeItems}</ol>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("[ExamController getResultPdf Error]", error);
      return res.status(500).send("Error generating report");
    }
  }
}

module.exports = ExamController;
