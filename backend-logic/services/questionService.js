const {
  SUBJECTS,
  EXAM_CONFIGS,
  QUESTION_BANKS
} = require("../data/hardcodedQuestionBank");

const SUBJECT_ALIASES = {
  "first-sub": "ccincoml",
  "second-sub": "ccsfen1l",
  "third-sub": "ctprfiss"
};
const EXAM_TYPES = new Set(["quiz", "midterms", "finals"]);

class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = "InputError";
    this.statusCode = 400;
  }
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

class QuestionService {
  static normalizeSubjectId(subjectId) {
    const normalized = String(subjectId || "").trim().toLowerCase();
    const resolved = SUBJECT_ALIASES[normalized] || normalized;
    if (!Object.hasOwn(SUBJECTS, resolved)) {
      throw new InputError("Unknown subject. Use CCINCOML, CCSFEN1L, or CTPRFISS.");
    }
    return resolved;
  }

  static normalizeExamType(examType) {
    const normalized = String(examType || "").trim().toLowerCase();
    if (!EXAM_TYPES.has(normalized)) {
      throw new InputError("Unknown exam type. Use quiz, midterms, or finals.");
    }
    return normalized;
  }

  static getExamConfig(subjectId, examType) {
    const subject = this.normalizeSubjectId(subjectId);
    const type = this.normalizeExamType(examType);
    const subjectInfo = SUBJECTS[subject];
    return {
      subjectId: subject,
      courseCode: subjectInfo.code,
      subjectName: subjectInfo.name,
      examType: type,
      ...EXAM_CONFIGS[subject][type]
    };
  }

  static getEligiblePool(subjectId, examType) {
    const config = this.getExamConfig(subjectId, examType);
    const bank = QUESTION_BANKS[config.subjectId];
    // Quizzes focus on the first ten course concepts. Major exams use the
    // complete 100-question subject bank.
    return config.examType === "quiz" ? bank.slice(0, 40) : [...bank];
  }

  static getQuestionsWithAnswers(subjectId, examType, questionIds = null) {
    const config = this.getExamConfig(subjectId, examType);
    const eligible = this.getEligiblePool(config.subjectId, config.examType);

    if (questionIds) {
      const requestedIds = new Set(questionIds);
      return eligible.filter((question) => requestedIds.has(question.id));
    }

    const ordered = config.randomize ? shuffle(eligible) : eligible;
    return ordered.slice(0, config.itemCount);
  }

  static getQuestionsForClient(subjectId, examType) {
    const config = this.getExamConfig(subjectId, examType);
    const questions = this.getQuestionsWithAnswers(config.subjectId, config.examType);
    return {
      examConfig: config,
      questions: questions.map(({ correctIndex, ...clientSafe }) => clientSafe)
    };
  }

  static validateSubmittedQuestions(subjectId, examType, answers) {
    const config = this.getExamConfig(subjectId, examType);
    if (!Array.isArray(answers) || answers.length !== config.itemCount) {
      throw new InputError(`This ${config.examType} requires exactly ${config.itemCount} answers.`);
    }

    const ids = answers.map((answer) => answer.questionId);
    if (new Set(ids).size !== ids.length) {
      throw new InputError("A question can only be answered once.");
    }

    const questions = this.getQuestionsWithAnswers(config.subjectId, config.examType, ids);
    if (questions.length !== answers.length) {
      throw new InputError("The submission contains a question that does not belong to this exam.");
    }

    const questionMap = new Map(questions.map((question) => [question.id, question]));
    answers.forEach((answer) => {
      const question = questionMap.get(answer.questionId);
      if (!Number.isInteger(answer.choiceIndex) ||
          answer.choiceIndex < 0 ||
          answer.choiceIndex >= question.choices.length) {
        throw new InputError(`Invalid answer choice for ${answer.questionId}.`);
      }
    });

    // Preserve the same order sent to the student for the result review.
    return ids.map((id) => questionMap.get(id));
  }
}

module.exports = QuestionService;
module.exports.InputError = InputError;
module.exports.shuffle = shuffle;
