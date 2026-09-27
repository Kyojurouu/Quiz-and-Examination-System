const QuestionService = require("../services/questionService");
const { InputError } = QuestionService;

function requiredText(value, field, minLength, maxLength) {
  if (typeof value !== "string") {
    throw new InputError(`${field} is required.`);
  }
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new InputError(`${field} must contain ${minLength} to ${maxLength} characters.`);
  }
  if (/[\u0000-\u001f\u007f]/.test(normalized)) {
    throw new InputError(`${field} contains invalid characters.`);
  }
  return normalized;
}

function validateLogin(body = {}) {
  return {
    name: requiredText(body.name, "Name", 2, 100),
    section: requiredText(body.section || body.block, "Section", 1, 40),
    subjectId: QuestionService.normalizeSubjectId(body.subjectId)
  };
}

function validateQuestionRequest(query = {}) {
  return {
    subject: QuestionService.normalizeSubjectId(query.subject),
    examType: QuestionService.normalizeExamType(query.examType)
  };
}

function validateSubmission(body = {}) {
  const studentId = requiredText(body.studentId, "Student ID", 6, 100);
  if (!/^std-[a-z0-9-]+$/i.test(studentId)) {
    throw new InputError("Student ID has an invalid format.");
  }
  const subject = QuestionService.normalizeSubjectId(body.subject || body.subjectId);
  const examType = QuestionService.normalizeExamType(body.examType || body.examTypeId);
  const answers = Array.isArray(body.answers) ? body.answers : [];

  return {
    studentId,
    name: requiredText(body.name, "Name", 2, 100),
    section: requiredText(body.section || body.block, "Section", 1, 40),
    subject,
    examType,
    answers
  };
}

module.exports = {
  requiredText,
  validateLogin,
  validateQuestionRequest,
  validateSubmission
};
