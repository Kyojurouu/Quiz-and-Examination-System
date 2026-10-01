# Quiz & Examination System

A quiz and examination platform with one shared frontend and two independently implemented Express backends:

- **Imperative backend** - uses loops, conditionals, mutable state, and array updates.
- **Logic backend** - uses facts, Horn clauses, unification, and backward-chaining resolution.

Both backends use the same MongoDB database and `students` collection. This allows the two programming paradigms to be compared using the same working application.

## Project Structure

```text
Quiz-and-Examination-System/
|
|-- frontend/                         # Shared application frontend
|   |-- login.html                    # Login, identity, and block selection
|   |-- home.html                     # Subject selection
|   |-- examtype.html                 # Quiz, Midterms, and Finals selection
|   |-- exam.html                     # Question-by-question exam screen
|   |-- result.html                   # Score, review, and report actions
|   |-- assets/
|   |   |-- nu-logo.png               # University crest
|   |   |-- nu-background.png         # Shared university background
|   |-- css/
|   |   |-- styles.css                # Shared responsive styles and palette
|   |-- js/
|       |-- config.js                 # Subjects, exam types, and durations
|       |-- store.js                  # Session storage management
|       |-- api.js                    # Frontend-backend API communication
|       |-- ui.js                     # Shared UI and session helpers
|       |-- pages/
|           |-- account-login.js      # Login validation and password toggle
|           |-- welcome.js            # Subject selection and student session setup
|           |-- login.js              # Legacy details-page compatibility
|           |-- examtype.js            # Exam type selection
|           |-- exam.js                # Exam questions and submission
|           |-- result.js              # Score review and navigation
|
|-- backend-imperative/               # Imperative backend, port 4000
|   |-- server.js                     # Express server and frontend hosting
|   |-- routes/
|   |   |-- examRoutes.js             # API routes and health check
|   |-- controllers/                  # Request handlers and PDF report generation
|   |-- services/                     # Question retrieval and evaluation
|   |-- config/
|   |   |-- db.js                     # MongoDB connection
|   |-- models/
|   |   |-- Student.js                # MongoDB student and result schema
|   |-- test/
|   |   |-- examService.test.js       # Imperative scoring tests
|   |-- package.json
|   |-- .env.example                  # Environment-variable template
|
|-- backend-logic/                    # Logic backend, port 5000
|   |-- server.js                     # Express server and frontend hosting
|   |-- routes/
|   |   |-- examRoutes.js             # API routes and exam configuration
|   |-- client/                       # Logic-specific frontend overrides
|   |-- logic/
|   |   |-- facts.js                  # Knowledge-base facts
|   |   |-- rules.js                  # Horn-clause evaluation rules
|   |   |-- logicEngine.js             # Unification and backward chaining
|   |-- services/                     # Question and logical evaluation services
|   |-- config/
|   |   |-- db.js                     # MongoDB connection
|   |-- models/
|   |   |-- Student.js                # MongoDB student and result schema
|   |-- test/
|       |-- backendRevision.test.js   # Backend contract tests
|       |-- logicEngine.test.js       # Inference-engine tests
|
|-- package.json                      # Root convenience scripts
|-- package-lock.json                 # Root npm dependency lockfile
|-- README.md
```

## Application Workflow

1. Start one of the backend servers.
2. Open the backend root URL. The root opens `login.html`.
3. Enter a student email ending in `@students.national-u.edu.ph`.
4. Enter a password with the required security rules. Use the eye button to show or hide it.
5. Enter a full name.
6. Select block `COM231` or `COM232`.
7. Select a subject.
8. Select an available assessment type.
9. Answer the examination questions using the circular progress markers.
10. Submit the examination.
11. View the score and complete answer review.
12. Click **Download PDF** on the result page.
13. The browser downloads the real `national-university-score-report.pdf` file to its configured downloads folder.

The normal page flow is:

```text
login.html -> home.html -> examtype.html -> exam.html -> result.html
```

The result page provides these actions:

- **Back to home** preserves the authenticated account and returns to subject selection.
- **Back to exams** returns to the current subject's exam-type list.
- **Download PDF** automatically downloads the professional PDF report; no report tab or second print step is required.

## Configuration

The shared frontend configuration is in:

```text
frontend/js/config.js
```

The active backend is selected from the browser origin when the application is opened through a backend server:

```js
API_BASE: window.location.origin
```

The resulting origins are:

```text
http://localhost:4000  -> backend-imperative
http://localhost:5000  -> backend-logic
```

The configuration contains:

- Available subjects
- Subject codes
- Professor names
- Assessment types
- Assessment availability windows
- Subject-specific assessment durations
- Subject-specific item counts
- Mock mode and API settings

Assessment durations are resolved using:

```js
CONFIG.getDuration(subjectId, examTypeId);
```

The duration configured for a specific subject takes priority over the global assessment duration. The backend response is also used to provide the authoritative exam item count and duration.

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

```powershell
cd backend-imperative
npm install
```

Install the logic backend dependencies:

```powershell
cd ..\backend-logic
npm install
```

On Windows PowerShell, use `npm.cmd` if the execution policy prevents `npm` from running.

## Running the Application

### Imperative Backend

From the backend directory:

```powershell
cd backend-imperative
npm start
```

The imperative backend runs at:

```text
http://localhost:4000
```

Open the application at:

```text
http://localhost:4000/login.html
```

The imperative backend evaluates examinations using explicit loops, conditional branches, mutable variables, and array updates.

### Logic Backend

From a separate terminal:

```powershell
cd backend-logic
npm start
```

The logic backend runs at:

```text
http://localhost:5000
```

Open the application at:

```text
http://localhost:5000/login.html
```

The logic backend evaluates examinations using facts, rules, unification, and backward-chaining resolution.

### Development Mode

Both backends support automatic server restart during development:

```powershell
npm run dev
```

Run the command inside the backend directory you want to develop.

### Running Both Backends

To compare both implementations, start each backend in a separate terminal:

```powershell
cd backend-imperative
npm start
```

```powershell
cd backend-logic
npm start
```

Use port `4000` for the imperative implementation and port `5000` for the logic implementation.

## API Endpoints

Both backends provide the following endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check whether the backend is running |
| `GET` | `/api/info` | View backend paradigm and configuration |
| `POST` | `/login` | Validate account details and return student completion status |
| `GET` | `/questions?subject=<id>&examType=<id>` | Retrieve examination questions |
| `GET` | `/exam-config?subject=<id>&examType=<id>` | Retrieve examination configuration |
| `POST` | `/submit-exam` | Submit, evaluate, and persist an examination |
| `GET` | `/results/:id/pdf` | Stream the professional result report as a PDF download |

For frontend compatibility, API routes are also available with the `/api` prefix where configured:

```text
/api/login
/api/questions
/api/exam-config
/api/submit-exam
/api/results/:id/pdf
```

## MongoDB Persistence

Both backends use the same `LogicalSystem.students` collection. New student result records store:

- `email`
- `name`
- `section` / block
- `subject`
- `examType`
- `score`
- `total`
- `review`
- `mistakes`
- timestamps

The persistent completion key is:

```text
email + subject + examType
```

When a student logs in again, the backend returns the completed exam keys, scores, and saved review data. The frontend uses those values to keep completed exams from reopening while allowing the student to open the saved result report.

The complete review data is also stored in MongoDB, allowing the result report to be rebuilt after a backend restart when MongoDB is available.

Existing records created before email persistence cannot be associated with an account automatically. New submissions include the email field.

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
- MongoDB persistence through explicit service operations

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
- MongoDB persistence around the deduced result

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
- Final score
- Complete answer review

## Testing

Run the imperative backend tests:

```powershell
cd backend-imperative
npm test
```

Run the logic-engine tests:

```powershell
cd backend-logic
npm test
```

The tests use Node.js's built-in test runner configured in each backend's `package.json`.

## Database Fallback

If MongoDB is unavailable, the backends use an in-memory student store so the application can continue running for demonstrations and testing.

Fallback records, completion status, score history, and reports are lost when the corresponding server stops. MongoDB is required for persistence across logout, server restarts, and new sessions.

## Package Files

The repository contains npm package files for managing the application:

- `package.json` - defines scripts and project metadata.
- `package-lock.json` - records exact npm dependency versions.
- `backend-imperative/package.json` - defines imperative backend dependencies and scripts.
- `backend-logic/package.json` - defines logic backend dependencies and scripts.

Install backend dependencies separately inside each backend directory before running the application.

## Security Notes

- Keep MongoDB credentials in local `.env` files.
- Never commit real connection strings or passwords.
- Use `.env.example` files as configuration templates.
- Replace exposed credentials immediately if they have previously been committed publicly.
- The current browser login validates the required student email and password format; production authentication should verify credentials server-side against an identity provider or credential store.
