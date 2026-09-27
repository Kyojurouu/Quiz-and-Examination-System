/**
 * LOGICAL PROGRAMMING PARADIGM: FACTS
 * 
 * Facts are ground assertions of truth in the Knowledge Base.
 * They represent atomic domain propositions without conditional requirements.
 */

/**
 * Asserts question answer keys into the KnowledgeBase
 * @param {KnowledgeBase} kb 
 * @param {Array} questions 
 */
function assertQuestionFacts(kb, questions) {
  questions.forEach((q) => {
    // Fact: correct_answer(questionId, correctIndex)
    kb.assertFact("correct_answer", [q.id, q.correctIndex]);

    // Fact: question_meta(questionId, text, choices, correctIndex)
    kb.assertFact("question_meta", [q.id, q.text, q.choices, q.correctIndex]);
  });
}

/**
 * Asserts student submitted answers into the KnowledgeBase
 * @param {KnowledgeBase} kb 
 * @param {string} studentId 
 * @param {Array} answers [{ questionId, choiceIndex }]
 */
function assertSubmissionFacts(kb, studentId, answers) {
  // Fact: submitted_exam(studentId)
  // A completion can only be proved after a validated submission reaches
  // the knowledge base.
  kb.assertFact("submitted_exam", [studentId]);

  answers.forEach((ans) => {
    // Fact: submitted_answer(studentId, questionId, choiceIndex)
    const choice = ans.choiceIndex !== undefined ? ans.choiceIndex : null;
    kb.assertFact("submitted_answer", [studentId, ans.questionId, choice]);
  });
}

module.exports = {
  assertQuestionFacts,
  assertSubmissionFacts
};
