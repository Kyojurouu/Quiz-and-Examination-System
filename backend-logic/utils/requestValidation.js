const QuestionService = require("../services/questionService");
const { InputError } = QuestionService;

const VALID_SECTIONS = ["COM231", "COM232"];

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

function validateSection(value) {
  const text = requiredText(value, "Section", 1, 40);
  const upper = text.toUpperCase();
  if (!VALID_SECTIONS.includes(upper)) {
    throw new InputError(`Section must be one of: ${VALID_SECTIONS.join(", ")}.`);
  }
  return upper;
}

function validateLogin(body = {}) {
  const result = {
    name: requiredText(body.name, "Name", 2, 100),
    section: validateSection(body.section || body.block),
    subjectId: QuestionService.normalizeSubjectId(body.subjectId)
  };
  if (body.email !== undefined) {
    const email = requiredText(body.email, "Email", 5, 160).toLowerCase();
    if (!/^[^\s@]+@students\.national-u\.edu\.ph$/i.test(email)) {
      throw new InputError("A National University student email is required.");
    }
    result.email = email;
  }
  return result;
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
  const email = requiredText(body.email, "Email", 5, 160).toLowerCase();
  if (!/^[^\s@]+@students\.national-u\.edu\.ph$/i.test(email)) {
    throw new InputError("A National University student email is required.");
  }
  const answers = Array.isArray(body.answers) ? body.answers : [];

  return {
    studentId,
    name: requiredText(body.name, "Name", 2, 100),
    email,
    section: validateSection(body.section || body.block),
    subject,
    examType,
    answers
  };
}

module.exports = {
  VALID_SECTIONS,
  requiredText,
  validateSection,
  validateLogin,
  validateQuestionRequest,
  validateSubmission
};
