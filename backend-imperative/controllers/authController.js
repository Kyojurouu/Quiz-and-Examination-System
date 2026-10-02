const ExamService = require("../services/examService");

const VALID_SECTIONS = ["COM231", "COM232"];

// Validate the student's admission details and create an attempt identifier.
async function login(req, res) {
  const { name, email, block, section, subjectId } = req.body;
  // The frontend historically calls this value "block"; the API stores it as section.
  const studentSection = section || block;

  // Guard clauses stop invalid input before a student session is created.
  if (!name || !email || !studentSection) {
    return res.status(400).json({
      ok: false,
      error: "Name and Section (Block) are required."
    });
  }
  if (!VALID_SECTIONS.includes(studentSection.toUpperCase())) {
    return res.status(400).json({
      ok: false,
      error: `Section must be one of: ${VALID_SECTIONS.join(", ")}.`
    });
  }
  if (!/^[^\s@]+@students\.national-u\.edu\.ph$/i.test(email)) {
    return res.status(400).json({ ok: false, error: "A National University student email is required." });
  }

  // The identifier is used by the frontend while the student completes an exam.
  const studentId = `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const completedExams = await ExamService.getCompletedExamsByEmail(email);
  const completedScores = await ExamService.getCompletedScoresByEmail(email);
  const completedResults = await ExamService.getCompletedResultsByEmail(email);
  return res.json({
    ok: true,
    studentId,
    completedExams,
    completedScores,
    completedResults,
    student: { name, email: email.toLowerCase(), section: studentSection.toUpperCase(), subjectId }
  });
}

module.exports = { VALID_SECTIONS, login };
