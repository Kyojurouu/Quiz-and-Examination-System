const express = require("express");
const AuthController = require("../controllers/authController");
const ExamController = require("../controllers/examController");

const router = express.Router();

// A lightweight health check used when demonstrating the backend.
router.get("/health", (req, res) => {
  res.json({ status: "healthy", paradigm: "imperative", timestamp: new Date() });
});

// Register both short and /api-prefixed paths for frontend compatibility.
router.post("/login", AuthController.login);
router.post("/api/login", AuthController.login);
router.get("/questions", ExamController.getQuestions);
router.get("/api/questions", ExamController.getQuestions);
router.get("/exam-config", ExamController.getExamConfig);
router.get("/api/exam-config", ExamController.getExamConfig);
router.post("/submit-exam", ExamController.submitExam);
router.post("/api/submit-exam", ExamController.submitExam);
router.get("/results/:id/pdf", ExamController.getResultPdf);
router.get("/api/results/:id/pdf", ExamController.getResultPdf);

module.exports = router;
