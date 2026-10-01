const crypto = require("crypto");
const { validateLogin } = require("../utils/requestValidation");
const { InputError } = require("../services/questionService");
const ExamService = require("../services/examService");

/**
 * AUTH CONTROLLER
 * Handles student admission and details registration
 */
class AuthController {
  static async login(req, res) {
    try {
      const { name, email, section, subjectId } = validateLogin(req.body);
      if (!email) {
        return res.status(400).json({ ok: false, error: "A National University student email is required." });
      }

      // Generate a unique session student identifier for the attempt
      const studentId = `std-${crypto.randomUUID()}`;

      const completedExams = await ExamService.getCompletedExamsByEmail(email);
      const completedScores = await ExamService.getCompletedScoresByEmail(email);
      const completedResults = await ExamService.getCompletedResultsByEmail(email);
      return res.json({
        ok: true,
        studentId,
        completedExams,
        completedScores,
        completedResults,
        student: {
          name,
          email,
          section,
          subjectId
        }
      });
    } catch (error) {
      if (error instanceof InputError) {
        return res.status(400).json({ ok: false, error: error.message });
      }
      console.error("[AuthController Error]", error);
      return res.status(500).json({ ok: false, error: "Internal server error" });
    }
  }
}

module.exports = AuthController;
