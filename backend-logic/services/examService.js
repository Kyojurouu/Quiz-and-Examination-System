const Student = require("../models/Student");
const QuestionService = require("./questionService");
const { isDbConnected } = require("../config/db");
const { KnowledgeBase } = require("../logic/logicEngine");
const { assertQuestionFacts, assertSubmissionFacts } = require("../logic/facts");
const { setupEvaluationRules, deduceEvaluation } = require("../logic/rules");

// In-memory student store fallback
const fallbackStudentStore = [];
const resultReviewStore = new Map();
const completedAttemptKeys = new Set();

class ExamService {
  /**
   * Evaluates student submission using the Logical Programming Paradigm,
   * stores the record in MongoDB Atlas (LogicalSystem.students),
   * and returns the deduced score and review.
   */
  static async evaluateAndSave({ name, email, section, subject, examType, answers, studentId }) {
    // Validate the submitted hard-coded question IDs and choices before
    // asserting them as facts in the knowledge base.
    const questions = QuestionService.validateSubmittedQuestions(subject, examType, answers);

    // 2. Instantiate Knowledge Base
    const kb = new KnowledgeBase();

    // 3. Assert Horn Clauses / Deduction Rules
    setupEvaluationRules(kb);

    // 4. Assert Domain Facts (Question keys & Student answers)
    assertQuestionFacts(kb, questions);
    assertSubmissionFacts(kb, studentId, answers);

    // 5. Deduce Evaluation via Backward-Chaining Resolution (Pure Logic Paradigm)
    const evaluation = deduceEvaluation(kb, studentId, questions);
    const identity = String(email || studentId || name).trim().toLowerCase();
    const attemptKey = [identity, subject, examType].join(":");
    if (completedAttemptKeys.has(attemptKey)) {
      const error = new Error("This exam has already been completed.");
      error.code = "ATTEMPT_COMPLETED";
      throw error;
    }

    if (isDbConnected() && email) {
      const existingAttempt = await Student.findOne({ email, subject, examType });
      if (existingAttempt) {
        const error = new Error("This exam has already been completed.");
        error.code = "ATTEMPT_COMPLETED";
        throw error;
      }
    }

    // 6. Persist Student Document to MongoDB Atlas
    // Target Database: LogicalSystem | Target Collection: students
    const studentData = {
      name: name || "Student",
      email: email ? String(email).trim().toLowerCase() : undefined,
      section: section || "N/A",
      subject: subject || "General",
      examType: examType || "quiz",
      score: evaluation.score,
      total: evaluation.total,
      review: evaluation.review,
      mistakes: evaluation.mistakes
    };

    let savedStudent = null;

    if (isDbConnected()) {
      try {
        savedStudent = await Student.create(studentData);
        console.log(`[MongoDB Atlas] Successfully saved student document to LogicalSystem.students:`, savedStudent._id);
      } catch (dbErr) {
        console.warn(`[MongoDB Notice] Write error: ${dbErr.message}. Storing in memory.`);
      }
    }

    if (!savedStudent) {
      savedStudent = {
        _id: "rec-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        ...studentData,
        createdAt: new Date()
      };
      fallbackStudentStore.push(savedStudent);
    }

    const resultId = String(savedStudent._id);
    resultReviewStore.set(resultId, {
      mistakes: evaluation.mistakes,
      review: evaluation.review,
      total: evaluation.total
    });
    completedAttemptKeys.add(attemptKey);

    return {
      completed: evaluation.completed,
      score: evaluation.score,
      total: evaluation.total,
      mistakes: evaluation.mistakes,
      review: evaluation.review,
      studentId: resultId,
      student: savedStudent
    };
  }

  /**
   * Retrieves student by ID for reporting
   */
  static async getStudentById(id) {
    if (isDbConnected()) {
      try {
        const found = await Student.findById(id);
        if (found) return found;
      } catch {
        // Fall through
      }
    }
    return fallbackStudentStore.find((s) => String(s._id) === String(id)) || null;
  }

  static async getResultById(id) {
    const student = await this.getStudentById(id);
    if (!student) return null;
    const review = resultReviewStore.get(String(id)) || {
      mistakes: student.mistakes || [],
      review: student.review || [],
      total: student.total || null
    };
    return { student, ...review };
  }

  static async getCompletedExamsByEmail(email) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) return [];
    const completed = [];
    if (isDbConnected()) {
      const records = await Student.find({ email: normalizedEmail }).lean();
      records.forEach((record) => completed.push(record.subject + ":" + record.examType));
    }
    fallbackStudentStore.forEach((record) => {
      if (String(record.email || "").toLowerCase() === normalizedEmail) {
        completed.push(record.subject + ":" + record.examType);
      }
    });
    return [...new Set(completed)];
  }

  static async getCompletedScoresByEmail(email) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) return {};
    const scores = {};
    const addRecord = (record) => {
      scores[record.subject + ":" + record.examType] = {
        score: record.score,
        total: record.total || null
      };
    };
    if (isDbConnected()) {
      const records = await Student.find({ email: normalizedEmail }).lean();
      records.forEach(addRecord);
    }
    fallbackStudentStore.forEach((record) => {
      if (String(record.email || "").toLowerCase() === normalizedEmail) addRecord(record);
    });
    return scores;
  }

  static async getCompletedResultsByEmail(email) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) return {};
    const results = {};
    const addRecord = (record) => {
      const key = record.subject + ":" + record.examType;
      results[key] = {
        resultId: String(record._id),
        score: record.score,
        total: record.total || null,
        review: record.review || [],
        mistakes: record.mistakes || []
      };
    };
    if (isDbConnected()) {
      const records = await Student.find({ email: normalizedEmail }).lean();
      records.forEach(addRecord);
    }
    fallbackStudentStore.forEach((record) => {
      if (String(record.email || "").toLowerCase() === normalizedEmail) addRecord(record);
    });
    return results;
  }
}

module.exports = ExamService;
