const crypto = require("crypto");
const { validateLogin } = require("../utils/requestValidation");
const { InputError } = require("../services/questionService");

/**
 * AUTH CONTROLLER
 * Handles student admission and details registration
 */
class AuthController {
  static async login(req, res) {
    try {
      const { name, section, subjectId } = validateLogin(req.body);

      // Generate a unique session student identifier for the attempt
      const studentId = `std-${crypto.randomUUID()}`;

      return res.json({
        ok: true,
        studentId,
        student: {
          name,
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
