const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const examRoutes = require("./routes/examRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const logicClientPath = path.join(__dirname, "client");

// Enable CORS for frontend interaction
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Mount API routes
app.use("/", examRoutes);

// Serve Logic-specific browser behavior without changing the group's shared
// frontend files. These routes take precedence over express.static below.
const clientOverrides = {
  "/js/config.js": "config.js",
  "/js/pages/exam.js": "exam.js",
  "/js/pages/examtype.js": "examtype.js",
  "/js/pages/result.js": "result.js"
};

Object.entries(clientOverrides).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    return res.sendFile(path.join(logicClientPath, file));
  });
});

// Serve existing frontend static files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// Informative API status endpoint
app.get("/api/info", (req, res) => {
  res.json({
    message: "Quiz and Examination System - Logical Programming Paradigm Backend",
    paradigm: "Logical Programming (Horn Clauses / Resolution / Unification)",
    database: "LogicalSystem",
    collection: "students",
    port: PORT,
    endpoints: [
      "POST /login",
      "GET  /questions?subject=&examType=",
      "GET  /exam-config?subject=&examType=",
      "POST /submit-exam",
      "GET  /results/:id/pdf"
    ]
  });
});

// Root: redirect browser to home.html, or return JSON if API client
app.get("/", (req, res) => {
  if (req.accepts("html")) {
    return res.sendFile(path.join(frontendPath, "login.html"));
  }
  return res.json({
    name: "LogicalSystem API",
    paradigm: "Logical Programming",
    database: "LogicalSystem",
    collection: "students"
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Quiz & Examination System [Logical Paradigm Backend] `);
  console.log(` Listening on: http://localhost:${PORT}                 `);
  console.log(` Database:     LogicalSystem                           `);
  console.log(` Collection:   students                                `);
  console.log(` Engine:       Horn-clause Resolution & Unification    `);
  console.log(`=======================================================`);

  // Connect to MongoDB Atlas
  connectDB().catch((err) => {
    console.error(`[MongoDB Connection Error]`, err.message);
  });
});

module.exports = app;
