const { KnowledgeBase, Predicate, LogicVariable } = require("../logic/logicEngine");
const { assertQuestionFacts, assertSubmissionFacts } = require("../logic/facts");
const { setupEvaluationRules, deduceEvaluation } = require("../logic/rules");

function testLogicEngine() {
  console.log("=== Testing Logic Engine Deduction ===");

  const kb = new KnowledgeBase();
  setupEvaluationRules(kb);

  const sampleQuestions = [
    {
      id: "q1",
      text: "Which paradigm uses Horn clauses and unification?",
      choices: ["Imperative", "Logic", "Object-Oriented", "Functional"],
      correctIndex: 1
    },
    {
      id: "q2",
      text: "Which database stores student documents?",
      choices: ["PostgreSQL", "MongoDB Atlas", "Redis", "Cassandra"],
      correctIndex: 1
    },
    {
      id: "q3",
      text: "What does 'unification' do?",
      choices: ["Matches terms and finds variable substitutions", "Loops through an array", "Sorts items", "Sends an HTTP request"],
      correctIndex: 0
    }
  ];

  // Assert facts
  assertQuestionFacts(kb, sampleQuestions);

  const studentId = "test-student-123";
  // Student answers: q1 correct (1), q2 wrong (0 instead of 1), q3 correct (0)
  const answers = [
    { questionId: "q1", choiceIndex: 1 },
    { questionId: "q2", choiceIndex: 0 },
    { questionId: "q3", choiceIndex: 0 }
  ];
  assertSubmissionFacts(kb, studentId, answers);

  const result = deduceEvaluation(kb, studentId, sampleQuestions);

  console.log("Deduction Result:", JSON.stringify(result, null, 2));

  if (result.score === 2 && result.total === 3 && result.mistakes.length === 1 && result.completed === true) {
    console.log("TEST PASSED: Score and deduction match expected logical evaluation!");
  } else {
    console.error("TEST FAILED: Score mismatch", result);
    process.exit(1);
  }
}

testLogicEngine();
