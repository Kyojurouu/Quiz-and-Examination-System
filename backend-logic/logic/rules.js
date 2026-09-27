const { Predicate, Rule, LogicVariable } = require("./logicEngine");

/**
 * LOGICAL PROGRAMMING PARADIGM: RULES (HORN CLAUSES)
 * 
 * Rules express declarative relationships:
 * 
 * 1. Correctness Horn Clause:
 *    is_correct(Student, Question, Choice) :-
 *      submitted_answer(Student, Question, Choice),
 *      correct_answer(Question, Choice).
 * 
 * 2. Incorrectness Horn Clause:
 *    is_incorrect(Student, Question, Given, Actual) :-
 *      submitted_answer(Student, Question, Given),
 *      correct_answer(Question, Actual),
 *      diff(Given, Actual).
 *
 * 3. Completion Horn Clause:
 *    is_completed(Student) :- submitted_exam(Student).
 */

function setupEvaluationRules(kb) {
  const S = new LogicVariable("?Student");
  const Q = new LogicVariable("?Question");
  const C = new LogicVariable("?Choice");
  const Given = new LogicVariable("?Given");
  const Actual = new LogicVariable("?Actual");

  // Rule 1: Correctness Horn Clause
  kb.assertRule(
    new Predicate("is_correct", [S, Q, C]),
    [
      new Predicate("submitted_answer", [S, Q, C]),
      new Predicate("correct_answer", [Q, C])
    ]
  );

  // Rule 3: Completion Horn Clause
  kb.assertRule(
    new Predicate("is_completed", [S]),
    [new Predicate("submitted_exam", [S])]
  );

  // Rule 2: Incorrectness Horn Clause
  kb.assertRule(
    new Predicate("is_incorrect", [S, Q, Given, Actual]),
    [
      new Predicate("submitted_answer", [S, Q, Given]),
      new Predicate("correct_answer", [Q, Actual]),
      new Predicate("diff", [Given, Actual])
    ]
  );
}

/**
 * Declarative Evaluation Deduction
 * Leverages the logic engine to deduce correct/incorrect proofs.
 */
function deduceEvaluation(kb, studentId, questions) {
  // Goal 1: Find all proofs of correctness
  // ?- is_correct(studentId, ?Question, ?Choice).
  const correctGoal = new Predicate("is_correct", [
    studentId,
    new LogicVariable("?Question"),
    new LogicVariable("?Choice")
  ]);
  const correctProofs = kb.query(correctGoal);

  const correctQuestionMap = new Map();
  correctProofs.forEach((solution) => {
    const qId = solution["?Question"];
    const choice = solution["?Choice"];
    correctQuestionMap.set(qId, choice);
  });

  // Goal 2: Find all proofs of incorrectness
  // ?- is_incorrect(studentId, ?Question, ?Given, ?Actual).
  const incorrectGoal = new Predicate("is_incorrect", [
    studentId,
    new LogicVariable("?Question"),
    new LogicVariable("?Given"),
    new LogicVariable("?Actual")
  ]);
  const incorrectProofs = kb.query(incorrectGoal);

  const incorrectQuestionMap = new Map();
  incorrectProofs.forEach((solution) => {
    const qId = solution["?Question"];
    incorrectQuestionMap.set(qId, {
      given: solution["?Given"],
      actual: solution["?Actual"]
    });
  });

  // Goal 3: Prove that this student's validated exam was submitted.
  // ?- is_completed(studentId).
  const completionProofs = kb.query(new Predicate("is_completed", [studentId]));

  // Build review items based on logical deductions
  const review = [];
  const mistakes = [];

  questions.forEach((q) => {
    const isCorrect = correctQuestionMap.has(q.id);
    let yourAnswerText = "No answer";
    let correctAnswerText = q.choices[q.correctIndex] || "";

    if (isCorrect) {
      const choiceIdx = correctQuestionMap.get(q.id);
      yourAnswerText = q.choices[choiceIdx] !== undefined ? q.choices[choiceIdx] : "No answer";
    } else if (incorrectQuestionMap.has(q.id)) {
      const deduction = incorrectQuestionMap.get(q.id);
      yourAnswerText = deduction.given !== null && q.choices[deduction.given] !== undefined
        ? q.choices[deduction.given]
        : "No answer";
    }

    const reviewItem = {
      question: q.text,
      yourAnswer: yourAnswerText,
      correctAnswer: correctAnswerText,
      isCorrect: isCorrect
    };

    review.push(reviewItem);
    if (!isCorrect) {
      mistakes.push(reviewItem);
    }
  });

  // Deductive score: Number of distinct correct proofs
  const score = correctQuestionMap.size;

  return {
    completed: completionProofs.length > 0,
    score,
    total: questions.length,
    mistakes,
    review
  };
}

module.exports = {
  setupEvaluationRules,
  deduceEvaluation
};
