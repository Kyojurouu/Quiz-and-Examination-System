# Quiz & Examination System

A quiz and examination platform with one shared frontend and two independently implemented Express backends:

- **Imperative backend** — uses loops, conditionals, mutable state, and array updates.
- **Logic backend** — uses facts, Horn clauses, unification, and backward-chaining resolution.

Both backends use the same MongoDB database and `students` collection. This allows the two programming paradigms to be compared using the same working application.

## Features

- Student login using name, block, and subject information.
- Subject selection.
- Quiz, Midterms, and Finals assessment types.
- Three configured subjects:
  - **CCINCOML** — Introduction to Computing
  - **CTPRFISS** — Social and Professional Issues
  - **CCSFEN1L** — Software Engineering 1
- Subject-specific exam durations.
- Professor-informed question banks and assessment sizes.
- Question randomization using Fisher–Yates shuffle.
- Multiple-choice answer evaluation.
- Exam submission and score calculation.
- Answer review and mistake tracking.
- Exam completion tracking.
- PDF result report generation.
- Health-check endpoints.
- Backend information endpoints.
- Shared MongoDB database configuration.
- In-memory fallback storage when MongoDB is unavailable.
- Automated tests for imperative scoring and logic inference.

## Project Structure

```text
Quiz-and-Examination-System/
│
├── frontend/                         # Shared application frontend
│   ├── home.html                     # Subject selection
│   ├── details.html                  # Student name and block entry
│   ├── examtype.html                 # Quiz, Midterms, and Finals selection
│   ├── exam.html                     # Question-by-question exam screen
│   ├── result.html                   # Score, review, and result report
│   ├── css/
│   │   └── styles.css                # Application styles
│   └── js/
│       ├── config.js                 # Backend, subjects, and duration settings
│       ├── store.js                  # Session storage management
│       ├── api.js                    # Frontend-backend API communication
│       ├── ui.js                     # Shared user-interface helpers
│       └── pages/                    # Page-specific scripts
│
├── backend-imperative/               # Imperative backend, port 4000
│   ├── server.js                     # Express server and frontend hosting
│   ├── routes/
│   │   └── examRoutes.js             # API routes and health check
│   ├── controllers/                  # Request handlers
│   ├── services/                     # Question retrieval and exam evaluation
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── models/
│   │   └── Student.js                # Shared student schema
│   ├── test/
│   │   └── examService.test.js       # Imperative scoring tests
│   ├── package.json
│   └── .env.example                  # Environment-variable template
│
├── backend-logic/                    # Logic backend, port 5000
│   ├── server.js                     # Express server and frontend hosting
│   ├── routes/
│   │   └── examRoutes.js             # API routes and exam configuration
│   ├── client/                       # Logic-specific frontend behavior
│   ├── logic/
│   │   ├── facts.js                  # Knowledge-base facts
│   │   ├── rules.js                  # Horn-clause evaluation rules
│   │   └── logicEngine.js            # Unification and backward chaining
│   ├── services/                     # Question and logical evaluation services
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── models/
│   │   └── Student.js                # Shared student schema
│   ├── test/
│   │   └── logicEngine.test.js       # Inference-engine tests
│   ├── package.json
│   └── .env.example                  # Environment-variable template
│
├── package.json                      # Root convenience scripts
├── package-lock.json                 # Root npm dependency lockfile
└── README.md
```

## Application Workflow

1. Start one of the backend servers.
2. Open the frontend from the running backend.
3. Select a subject.
4. Enter the student's name and block.
5. Select an assessment type.
6. Answer the examination questions.
7. Submit the examination.
8. View the score, mistakes, and answer review.
9. Generate or print the result report.

The shared frontend communicates with the selected backend through `frontend/js/api.js`.

## Configuration

The active backend is configured in:

```text
frontend/js/config.js
```

For the imperative backend:

```js
API_BASE: "http://localhost:4000"
```

For the logic backend:

```js
API_BASE: "http://localhost:5000"
```

The configuration file also contains:

- Available subjects
- Subject codes
- Professor names
- Assessment types
- Assessment availability windows
- Subject-specific assessment durations

Assessment durations are resolved using:

```js
CONFIG.getDuration(subjectId, examTypeId);
```

The duration configured for a specific subject takes priority over the global assessment duration.

## Backend Setup

### 1. Configure Environment Variables

Create a private `.env` file in each backend directory using the provided templates:

```powershell
Copy-Item backend-imperative\.env.example backend-imperative\.env
Copy-Item backend-logic\.env.example backend-logic\.env
```

Set a valid MongoDB connection string in both `.env` files.

Both backends use:

```text
Database: LogicalSystem
Collection: students
```

Do not commit `.env` files or database credentials to the repository.

### 2. Install Dependencies

Install the imperative backend dependencies:

```bash
cd backend-imperative
npm install
```

Install the logic backend dependencies:

```bash
cd ../backend-logic
npm install
```

On Windows PowerShell, use `npm.cmd` if the execution policy prevents `npm` from running.

## Running the Application

### Imperative Backend

From the repository root:

```bash
npm start
```

Or from the backend directory:

```bash
cd backend-imperative
npm start
```

The imperative backend runs at:

```text
http://localhost:4000
```

Open the application at:

```text
http://localhost:4000/home.html
```

The imperative backend evaluates examinations using explicit loops, conditional branches, mutable variables, and array updates.

### Logic Backend

From the backend directory:

```bash
cd backend-logic
npm start
```

The logic backend runs at:

```text
http://localhost:5000
```

Open the application at:

```text
http://localhost:5000/home.html
```

The logic backend evaluates examinations using facts, rules, unification, and backward-chaining resolution.

### Development Mode

Both backends support automatic server restart during development:

```bash
npm run dev
```

Run the command inside the backend directory you want to develop.

### Running Both Backends

To compare both implementations, start each backend in a separate terminal:

```bash
cd backend-imperative
npm start
```

```bash
cd backend-logic
npm start
```

Then change `API_BASE` in `frontend/js/config.js` to the backend that you want to test.

## API Endpoints

Both backends provide the following endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check whether the backend is running |
| `GET` | `/api/info` | View backend paradigm and configuration |
| `POST` | `/login` | Register or identify a student |
| `GET` | `/questions?subject=<id>&examType=<id>` | Retrieve examination questions |
| `POST` | `/submit-exam` | Submit and evaluate an examination |
| `GET` | `/results/:id/pdf` | Generate the examination result report |

The logic backend also provides:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/exam-config?subject=<id>&examType=<id>` | Retrieve examination configuration |

For frontend compatibility, API routes are also available with the `/api` prefix:

```text
/api/login
/api/questions
/api/exam-config
/api/submit-exam
/api/results/:id/pdf
```

## Programming Paradigm Comparison

### Imperative Backend

The imperative backend evaluates examinations through explicit step-by-step procedures.

It uses:

- `for` loops
- Conditional statements
- Mutable score counters
- Array updates
- Explicit question randomization
- Direct state changes during evaluation

Important files include:

```text
backend-imperative/services/
backend-imperative/controllers/
backend-imperative/routes/
```

### Logic Backend

The logic backend evaluates examinations declaratively using a knowledge base.

It uses:

- Facts
- Predicates
- Logic variables
- Horn clauses
- Unification
- Backward-chaining resolution
- Logical proof of correct and incorrect answers
- Logical proof of examination completion

Important files include:

```text
backend-logic/logic/facts.js
backend-logic/logic/rules.js
backend-logic/logic/logicEngine.js
```

The logic rules derive:

- Correct answers
- Incorrect answers
- Student examination completion
- Final score and answer review

## Testing

Run the imperative backend tests:

```bash
cd backend-imperative
npm test
```

Run the logic-engine tests:

```bash
cd backend-logic
npm test
```

The tests use Node.js's built-in test runner configured in each backend's `package.json`.

## Database Fallback

If MongoDB is unavailable, the backends use an in-memory student store so the application can continue running for demonstrations and testing.

Data stored in the fallback store is lost when the corresponding server stops.

## Package Files

The repository contains npm package files for managing the application:

- `package.json` — defines scripts and project metadata.
- `package-lock.json` — records exact npm dependency versions.
- `backend-imperative/package.json` — defines imperative backend dependencies and scripts.
- `backend-logic/package.json` — defines logic backend dependencies and scripts.

Install backend dependencies separately inside each backend directory before running the application.

## Security Notes

- Keep MongoDB credentials in local `.env` files.
- Never commit real connection strings or passwords.
- Use `.env.example` files as configuration templates.
- Replace exposed credentials immediately if they have previously been committed publicly.
