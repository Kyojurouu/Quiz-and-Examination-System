const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const QuestionService = require("../services/questionService");
const ExamService = require("../services/examService");
const { QUESTION_BANKS } = require("../data/hardcodedQuestionBank");
const { validateLogin, validateSubmission } = require("../utils/requestValidation");

const EXPECTED_CONFIGS = {
  ccincoml: { quiz: [15, 15], midterms: [80, 75], finals: [80, 75] },
  ccsfen1l: { quiz: [30, 30], midterms: [70, 90], finals: [75, 90] },
  ctprfiss: { quiz: [10, 30], midterms: [100, 120], finals: [100, 120] }
};

test("contains 100 unique hard-coded questions for every subject", () => {
  Object.values(QUESTION_BANKS).forEach((questions) => {
    assert.equal(questions.length, 100);
    assert.equal(new Set(questions.map((question) => question.id)).size, 100);
    questions.forEach((question) => {
      assert.equal(question.choices.length, 4);
      assert.ok(Number.isInteger(question.correctIndex));
    });
  });
});

test("uses the item counts and durations gathered from each professor", () => {
  Object.entries(EXPECTED_CONFIGS).forEach(([subjectId, examTypes]) => {
    Object.entries(examTypes).forEach(([examType, [itemCount, durationMinutes]]) => {
      const config = QuestionService.getExamConfig(subjectId, examType);
      assert.equal(config.itemCount, itemCount);
      assert.equal(config.durationMinutes, durationMinutes);
      assert.equal(config.randomize, true);
    });
  });
});

test("never sends hard-coded answer keys to the browser", () => {
  const response = QuestionService.getQuestionsForClient("ccincoml", "quiz");
  assert.equal(response.questions.length, 15);
  response.questions.forEach((question) => {
    assert.equal(Object.hasOwn(question, "correctIndex"), false);
  });
});

test("rejects incomplete, duplicate, and out-of-range answers", () => {
  const questions = QuestionService.getQuestionsWithAnswers("ctprfiss", "quiz");
  const answers = questions.map((question) => ({ questionId: question.id, choiceIndex: 0 }));

  assert.throws(
    () => QuestionService.validateSubmittedQuestions("ctprfiss", "quiz", answers.slice(1)),
    /exactly 10 answers/
  );

  const duplicates = [...answers];
  duplicates[1] = { ...duplicates[0] };
  assert.throws(
    () => QuestionService.validateSubmittedQuestions("ctprfiss", "quiz", duplicates),
    /only be answered once/
  );

  const invalidChoice = answers.map((answer, index) =>
    index === 0 ? { ...answer, choiceIndex: 4 } : answer
  );
  assert.throws(
    () => QuestionService.validateSubmittedQuestions("ctprfiss", "quiz", invalidChoice),
    /Invalid answer choice/
  );
});

test("validates and normalizes student details", () => {
  assert.deepEqual(
    validateLogin({ name: "  Juan  Dela Cruz ", block: " COM232 ", subjectId: "CCINCOML" }),
    { name: "Juan Dela Cruz", section: "COM232", subjectId: "ccincoml" }
  );
  assert.throws(
    () => validateLogin({ name: "J", block: "", subjectId: "unknown" }),
    /Name must contain/
  );
});

test("rejects a section that is not COM231 or COM232", () => {
  assert.throws(
    () => validateLogin({ name: "Juan Dela Cruz", block: "COM999", subjectId: "ccincoml" }),
    /Section must be one of/
  );
  assert.throws(
    () => validateLogin({ name: "Juan Dela Cruz", block: "garbage", subjectId: "ccincoml" }),
    /Section must be one of/
  );
});

test("rejects an invalid section in exam submission", () => {
  assert.throws(
    () => validateSubmission({
      studentId: "std-test-001",
      name: "Juan Dela Cruz",
      email: "juan@students.national-u.edu.ph",
      block: "INVALID",
      subject: "ccincoml",
      examType: "quiz",
      answers: []
    }),
    /Section must be one of/
  );
});

test("evaluates a real hard-coded quiz through the logic rules", async () => {
  const questions = QuestionService.getQuestionsWithAnswers("ctprfiss", "quiz");
  const answers = questions.map((question) => ({
    questionId: question.id,
    choiceIndex: question.correctIndex
  }));
  const result = await ExamService.evaluateAndSave({
    studentId: "std-test-logic",
    name: "Test Student",
    section: "COM232",
    subject: "ctprfiss",
    examType: "quiz",
    answers
  });

  assert.equal(result.score, 10);
  assert.equal(result.total, 10);
  assert.equal(result.mistakes.length, 0);
  assert.equal(result.completed, true);
});

test("marks completion only after the logic engine proves a submitted exam", () => {
  const { KnowledgeBase, Predicate } = require("../logic/logicEngine");
  const { assertSubmissionFacts } = require("../logic/facts");
  const { setupEvaluationRules } = require("../logic/rules");
  const kb = new KnowledgeBase();
  setupEvaluationRules(kb);

  assert.equal(kb.query(new Predicate("is_completed", ["student-1"])).length, 0);
  assertSubmissionFacts(kb, "student-1", []);
  assert.equal(kb.query(new Predicate("is_completed", ["student-1"])).length, 1);
});

test("keeps Logic browser changes inside backend-logic", () => {
  const server = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
  const examTypeClient = fs.readFileSync(path.join(__dirname, "../client/examtype.js"), "utf8");
  const examClient = fs.readFileSync(path.join(__dirname, "../client/exam.js"), "utf8");

  assert.match(server, /clientOverrides/);
  assert.match(examTypeClient, /Completed/);
  assert.doesNotMatch(examTypeClient, /navigationEntry\.type === "reload"/);
  assert.match(examClient, /response\.examConfig\?\.durationMinutes/);
  assert.match(examClient, /result\.result\?\.completed === true/);
});
