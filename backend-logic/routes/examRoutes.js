const express = require("express");
const AuthController = require("../controllers/authController");
const ExamController = require("../controllers/examController");

const router = express.Router();

// Health Check
router.get("/health", (req, res) => {
  res.json({ status: "healthy", paradigm: "logical", timestamp: new Date() });
});

// Authentication / Admission
router.post("/login", AuthController.login);
router.post("/api/login", AuthController.login);

// Questions
router.get("/questions", ExamController.getQuestions);
router.get("/api/questions", ExamController.getQuestions);
router.get("/exam-config", ExamController.getExamConfig);
router.get("/api/exam-config", ExamController.getExamConfig);

// Exam Submission
router.post("/submit-exam", ExamController.submitExam);
router.post("/api/submit-exam", ExamController.submitExam);

// PDF / Printable Report
router.get("/results/:id/pdf", ExamController.getResultPdf);
router.get("/api/results/:id/pdf", ExamController.getResultPdf);

module.exports = router;
