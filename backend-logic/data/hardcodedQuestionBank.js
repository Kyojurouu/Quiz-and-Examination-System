/**
 * Hard-coded domain knowledge for the logic-paradigm backend.
 * MongoDB is intentionally not used for questions or answer keys.
 *
 * Each professor's questionnaire controls the item count, duration, formats,
 * and randomization for the corresponding subject.
 */

const SUBJECTS = {
  ccincoml: { code: "CCINCOML", name: "Introduction to Computing" },
  ccsfen1l: { code: "CCSFEN1L", name: "Software Engineering 1" },
  ctprfiss: { code: "CTPRFISS", name: "Social and Professional Issues" }
};

const EXAM_CONFIGS = {
  ccincoml: {
    quiz: {
      itemCount: 15,
      durationMinutes: 15,
      formats: ["multiple-choice", "identification", "enumeration"],
      randomize: true
    },
    midterms: {
      itemCount: 80,
      durationMinutes: 75,
      formats: ["multiple-choice", "identification", "enumeration", "computation"],
      randomize: true
    },
    finals: {
      itemCount: 80,
      durationMinutes: 75,
      formats: ["multiple-choice", "true-or-false", "identification", "coding"],
      randomize: true
    }
  },
  ccsfen1l: {
    quiz: {
      itemCount: 30,
      durationMinutes: 30,
      formats: ["multiple-choice", "scenario-based"],
      randomize: true
    },
    midterms: {
      itemCount: 70,
      durationMinutes: 90,
      formats: ["multiple-choice", "scenario-based", "essay-concept"],
      randomize: true
    },
    finals: {
      itemCount: 75,
      durationMinutes: 90,
      formats: ["multiple-choice", "scenario-based"],
      randomize: true
    }
  },
  ctprfiss: {
    quiz: {
      itemCount: 10,
      durationMinutes: 30,
      formats: ["terms-and-definitions"],
      randomize: true
    },
    midterms: {
      itemCount: 100,
      durationMinutes: 120,
      formats: ["multiple-choice", "scenario-based"],
      randomize: true
    },
    finals: {
      itemCount: 100,
      durationMinutes: 120,
      formats: ["multiple-choice", "scenario-based"],
      randomize: true
    }
  }
};

const CONCEPTS = {
  ccincoml: [
    { term: "Computer system", definition: "An integrated set of hardware, software, data, people, and procedures", scenario: "A school combines devices, applications, users, and procedures to process enrollment data" },
    { term: "Hardware", definition: "The physical components of a computer that can be touched", scenario: "A technician replaces a damaged keyboard and motherboard" },
    { term: "Software", definition: "Programs and instructions that direct computer hardware", scenario: "A learner installs an application that edits documents" },
    { term: "Central Processing Unit", definition: "The component that interprets and executes program instructions", scenario: "A processor fetches, decodes, and executes an instruction" },
    { term: "Arithmetic Logic Unit", definition: "The CPU component that performs arithmetic and logical comparisons", scenario: "A processor adds two numbers and compares whether one is greater" },
    { term: "Random Access Memory", definition: "Volatile working memory used by active programs", scenario: "Unsaved data disappears when a computer suddenly loses power" },
    { term: "Read-Only Memory", definition: "Non-volatile memory that commonly stores startup instructions", scenario: "Firmware remains available after a device is powered off" },
    { term: "Secondary storage", definition: "Non-volatile storage used to retain files and applications", scenario: "A student saves a project on an SSD for use next week" },
    { term: "Operating system", definition: "System software that manages hardware resources and provides services to programs", scenario: "Software schedules processes, manages files, and controls connected devices" },
    { term: "Application software", definition: "Software designed to help a user perform a specific task", scenario: "A user creates a presentation in a slide-editing program" },
    { term: "Input device", definition: "Hardware used to enter data or commands into a computer", scenario: "A barcode scanner sends a product code to a point-of-sale system" },
    { term: "Output device", definition: "Hardware that presents processed information to a user", scenario: "A monitor displays the result of a calculation" },
    { term: "Binary number system", definition: "A base-two representation that uses only zero and one", scenario: "The value 13 is represented as 1101 inside a computer" },
    { term: "Algorithm", definition: "A finite, ordered set of steps for solving a problem", scenario: "A developer writes precise steps for finding the largest score" },
    { term: "Flowchart", definition: "A diagram that uses standard symbols to show an algorithm's flow", scenario: "A process is drawn with decision diamonds and directional arrows" },
    { term: "Pseudocode", definition: "A language-independent, structured description of an algorithm", scenario: "A solution is planned using IF, ELSE, and DISPLAY before coding" },
    { term: "Variable", definition: "A named storage location whose value can change while a program runs", scenario: "The identifier score changes after every correct answer" },
    { term: "Data type", definition: "A classification that determines the values and operations allowed for data", scenario: "A programmer chooses Boolean for a true-or-false value" },
    { term: "Conditional statement", definition: "A control structure that chooses an action based on a condition", scenario: "A program displays Passed only when the score is at least 60" },
    { term: "Loop", definition: "A control structure that repeats instructions while a condition or sequence permits", scenario: "The program processes every answer in an array" },
    { term: "Function", definition: "A reusable block of code that performs a defined task", scenario: "The same score-calculation behavior is called from several routes" },
    { term: "Computer network", definition: "Interconnected devices that exchange data and share resources", scenario: "Laboratory computers share a printer and files" },
    { term: "Database", definition: "An organized collection of data designed for storage and retrieval", scenario: "Student names and scores are queried from MongoDB" },
    { term: "Cybersecurity", definition: "The protection of systems, networks, and data from digital threats", scenario: "An organization applies access controls and updates to prevent attacks" },
    { term: "Cloud computing", definition: "On-demand delivery of computing resources over a network", scenario: "A team rents hosted storage and servers instead of buying local equipment" }
  ],
  ccsfen1l: [
    { term: "Software requirement", definition: "A documented capability or constraint that a software system must satisfy", scenario: "A client states that the system must generate score reports" },
    { term: "Functional requirement", definition: "A statement describing a service or behavior the system must provide", scenario: "The application must allow a student to submit an exam" },
    { term: "Non-functional requirement", definition: "A quality attribute or constraint such as performance, security, or usability", scenario: "Every page must load within two seconds" },
    { term: "Stakeholder", definition: "A person or group affected by or able to influence a software project", scenario: "Students, professors, and administrators discuss system expectations" },
    { term: "Use case", definition: "A description of interactions between an actor and a system to achieve a goal", scenario: "A document describes how a student selects and completes a quiz" },
    { term: "Feasibility study", definition: "An evaluation of whether a proposed project is practical and worthwhile", scenario: "A team evaluates cost, schedule, technology, and operational constraints" },
    { term: "Software Development Life Cycle", definition: "A structured process covering planning, analysis, design, implementation, testing, and maintenance", scenario: "A project moves through defined activities from requirements to support" },
    { term: "Waterfall model", definition: "A sequential development model in which phases generally finish before the next begins", scenario: "The team completes requirements before beginning system design" },
    { term: "Agile development", definition: "An iterative approach emphasizing collaboration, feedback, and frequent delivery", scenario: "A team delivers small increments and adapts after each review" },
    { term: "Sprint", definition: "A fixed-length iteration in which an Agile team completes selected work", scenario: "Developers commit to a two-week set of backlog items" },
    { term: "Product backlog", definition: "An ordered list of desired product work, features, and fixes", scenario: "A product owner prioritizes login, scoring, and reporting stories" },
    { term: "Version control", definition: "A system that records and manages changes to source files", scenario: "Developers review earlier file versions and combine their changes" },
    { term: "Git branch", definition: "An independent line of development within a Git repository", scenario: "A developer isolates a scoring feature before merging it" },
    { term: "Code review", definition: "A systematic examination of source code by another developer", scenario: "A teammate checks a pull request for defects and clarity" },
    { term: "Unit testing", definition: "Testing an individual function or component in isolation", scenario: "A test verifies that the scoring function returns 8 for eight correct answers" },
    { term: "Integration testing", definition: "Testing whether combined components communicate and work correctly", scenario: "Tests verify that an API route saves a computed score" },
    { term: "System testing", definition: "Testing the complete integrated application against its requirements", scenario: "The entire quiz workflow is checked from login through the result page" },
    { term: "Regression testing", definition: "Re-running tests to detect defects introduced by a change", scenario: "The team retests scoring after adding question randomization" },
    { term: "Black-box testing", definition: "Testing observable behavior without relying on internal implementation details", scenario: "A tester supplies inputs and compares outputs without reading the code" },
    { term: "White-box testing", definition: "Testing based on knowledge of internal code paths and structure", scenario: "A tester designs cases to execute each conditional branch" },
    { term: "Unified Modeling Language", definition: "A standard visual language for modeling software structure and behavior", scenario: "A team uses standardized diagrams to communicate its design" },
    { term: "Class diagram", definition: "A UML diagram showing classes, attributes, operations, and relationships", scenario: "A model shows Student, Exam, and Question with their associations" },
    { term: "Sequence diagram", definition: "A UML diagram showing messages between participants over time", scenario: "A model displays browser, API, and database calls from top to bottom" },
    { term: "Cohesion", definition: "The degree to which responsibilities inside a module belong together", scenario: "A scoring module contains only closely related evaluation behavior" },
    { term: "Coupling", definition: "The degree of dependency between software modules", scenario: "Changing one service forces changes in several unrelated components" }
  ],
  ctprfiss: [
    { term: "Digital divide", definition: "The gap between people who have effective access to digital technology and those who do not", scenario: "Students in remote areas cannot join online classes because broadband is unavailable" },
    { term: "Information privacy", definition: "A person's ability to control how personal information is collected and used", scenario: "An application asks permission before sharing a user's profile data" },
    { term: "Data protection", definition: "Practices and safeguards used to prevent unauthorized access, loss, or misuse of data", scenario: "An organization encrypts records and limits employee access" },
    { term: "Intellectual property", definition: "Legal rights protecting creations of the mind", scenario: "A developer protects original software, writing, and designs" },
    { term: "Copyright", definition: "A legal right that protects original expressive works from unauthorized copying", scenario: "A programmer obtains permission before redistributing a paid code library" },
    { term: "Plagiarism", definition: "Presenting another person's work or ideas as one's own without proper acknowledgment", scenario: "A student submits copied source code without attribution" },
    { term: "Software piracy", definition: "Unauthorized copying, distribution, or use of software", scenario: "A shop installs one licensed application on many unlicensed computers" },
    { term: "Cybercrime", definition: "Illegal activity that uses or targets computers, networks, or digital data", scenario: "An attacker steals account credentials and transfers funds" },
    { term: "Phishing", definition: "A deceptive attempt to obtain sensitive information by impersonating a trusted source", scenario: "A fake university email asks students to enter their passwords" },
    { term: "Malware", definition: "Software intentionally designed to damage, disrupt, spy on, or gain unauthorized access", scenario: "A downloaded program secretly encrypts a user's files" },
    { term: "Social engineering", definition: "Manipulating people into revealing information or performing unsafe actions", scenario: "A caller pretends to be technical support and requests an access code" },
    { term: "Digital footprint", definition: "The trace of information a person leaves through online activity", scenario: "Old posts and search activity continue to shape a person's online reputation" },
    { term: "Netiquette", definition: "Standards of respectful and appropriate behavior in online communication", scenario: "A forum participant avoids insults and stays on topic" },
    { term: "Accessibility", definition: "Designing technology so people with diverse abilities can use it", scenario: "A website supports keyboard navigation and screen readers" },
    { term: "Professional ethics", definition: "Principles that guide responsible conduct in a profession", scenario: "A developer reports a serious security risk instead of hiding it" },
    { term: "Code of ethics", definition: "A documented set of professional values and expected behaviors", scenario: "An association publishes standards for honesty, competence, and public welfare" },
    { term: "Whistleblowing", definition: "Reporting wrongdoing or serious risks within an organization", scenario: "An employee reports concealed misuse of customer information" },
    { term: "Conflict of interest", definition: "A situation in which personal interests may improperly influence professional judgment", scenario: "A manager selects a supplier owned by a close relative without disclosure" },
    { term: "Informed consent", definition: "Voluntary agreement given after receiving understandable information about purpose and risks", scenario: "Research participants review data-use details before choosing to join" },
    { term: "Algorithmic bias", definition: "Systematic unfair outcomes produced by data or computational decision processes", scenario: "A hiring model repeatedly disadvantages a demographic group because of biased training data" },
    { term: "Accountability", definition: "Responsibility for decisions, actions, and their consequences", scenario: "A development team documents who approved a harmful automated decision" },
    { term: "Transparency", definition: "Providing understandable information about processes, decisions, and data use", scenario: "A platform explains why content was recommended and what data influenced it" },
    { term: "Electronic waste", definition: "Discarded electrical or electronic devices and components", scenario: "Old computers are sent to a certified recycling facility" },
    { term: "Freedom of expression", definition: "The right to seek, receive, and communicate ideas subject to lawful limits", scenario: "A platform balances open discussion with rules against unlawful threats" },
    { term: "Cyberbullying", definition: "Repeated harassment or harm carried out through digital communication", scenario: "A group repeatedly sends humiliating messages to a classmate online" }
  ]
};

function arrangeOptions(correct, distractors, correctIndex) {
  const options = distractors.slice(0, 3);
  options.splice(correctIndex, 0, correct);
  return options;
}

function buildQuestionPool(subjectId, concepts) {
  const questions = [];
  concepts.forEach((concept, conceptIndex) => {
    const distractors = [1, 7, 13].map((offset) => concepts[(conceptIndex + offset) % concepts.length]);
    const variants = [
      {
        format: "terms-and-definitions",
        text: `Which term matches this definition: ${concept.definition}?`,
        correct: concept.term,
        distractors: distractors.map((item) => item.term)
      },
      {
        format: "scenario-based",
        text: `${concept.scenario}. Which concept is being demonstrated?`,
        correct: concept.term,
        distractors: distractors.map((item) => item.term)
      },
      {
        format: "identification",
        text: `Which statement correctly defines ${concept.term}?`,
        correct: concept.definition,
        distractors: distractors.map((item) => item.definition)
      },
      {
        format: "application",
        text: `Which example best demonstrates ${concept.term}?`,
        correct: concept.scenario,
        distractors: distractors.map((item) => item.scenario)
      }
    ];

    variants.forEach((variant, variantIndex) => {
      const correctIndex = (conceptIndex + variantIndex) % 4;
      questions.push(Object.freeze({
        id: `${subjectId}-${String(conceptIndex + 1).padStart(2, "0")}-${variantIndex + 1}`,
        format: variant.format,
        text: variant.text,
        choices: arrangeOptions(variant.correct, variant.distractors, correctIndex),
        correctIndex
      }));
    });
  });
  return Object.freeze(questions);
}

const QUESTION_BANKS = Object.freeze(Object.fromEntries(
  Object.entries(CONCEPTS).map(([subjectId, concepts]) => [
    subjectId,
    buildQuestionPool(subjectId, concepts)
  ])
));

module.exports = {
  SUBJECTS: Object.freeze(SUBJECTS),
  EXAM_CONFIGS: Object.freeze(EXAM_CONFIGS),
  QUESTION_BANKS
};
