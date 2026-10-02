const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluateSubmission } = require("../services/examService");
const { VALID_SECTIONS } = require("../controllers/authController");

test("evaluateSubmission counts correct answers and builds review items", () => {
  const questions = [
    { id: "q1", text: "One", choices: ["A", "B"], correctIndex: 0 },
    { id: "q2", text: "Two", choices: ["C", "D"], correctIndex: 1 }
  ];

  // The first answer is correct; the second exercises the mistake branch.
  const result = evaluateSubmission(questions, [
    { questionId: "q1", choiceIndex: 0 },
    { questionId: "q2", choiceIndex: 0 }
  ]);

  assert.equal(result.score, 1);
  assert.equal(result.total, 2);
  assert.equal(result.mistakes.length, 1);
  assert.equal(result.review[1].yourAnswer, "C");
  assert.equal(result.review[1].correctAnswer, "D");
});

test("evaluateSubmission treats a missing answer as incorrect", () => {
  const result = evaluateSubmission(
    [{ id: "q1", text: "One", choices: ["A"], correctIndex: 0 }],
    []
  );

  assert.equal(result.score, 0);
  assert.equal(result.mistakes[0].yourAnswer, "No answer");
  assert.equal(result.mistakes[0].isCorrect, false);
});

test("VALID_SECTIONS contains only COM231 and COM232", () => {
  assert.deepEqual(VALID_SECTIONS, ["COM231", "COM232"]);
});

test("VALID_SECTIONS rejects values that are not COM231 or COM232", () => {
  // Simulate what authController and examController do at the guard clause.
  const isValid = (section) => VALID_SECTIONS.includes(String(section).toUpperCase());
  assert.equal(isValid("COM231"), true);
  assert.equal(isValid("COM232"), true);
  assert.equal(isValid("com231"), true);  // case-insensitive normalisation
  assert.equal(isValid("COM999"), false);
  assert.equal(isValid(""), false);
  assert.equal(isValid("garbage"), false);
});
