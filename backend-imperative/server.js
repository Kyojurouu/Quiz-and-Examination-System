const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const examRoutes = require("./routes/examRoutes");

const app = express();
const PORT = process.env.PORT || 4000;
const frontendPath = path.join(__dirname, "../frontend");

// Middleware prepares every request before it reaches an API route.
app.use(cors());
app.use(express.json());
app.use("/", examRoutes);
app.use(express.static(frontendPath));

// This endpoint makes it easy to confirm which paradigm server is running.
app.get("/api/info", (req, res) => {
  res.json({
    message: "Quiz and Examination System - Imperative Programming Paradigm Backend",
    paradigm: "Imperative Programming (state mutation, loops, and conditionals)",
    database: "LogicalSystem",
    collection: "students",
    port: PORT,
    endpoints: [
      "POST /login",
      "GET  /questions?subject=&examType=",
      "POST /submit-exam",
      "GET  /results/:id/pdf"
    ]
  });
});

app.get("/", (req, res) => {
  // Browsers receive the shared frontend; API clients receive server metadata.
  if (req.accepts("html")) {
    return res.sendFile(path.join(frontendPath, "login.html"));
  }

  return res.json({
    name: "LogicalSystem API (Imperative Backend)",
    paradigm: "Imperative Programming",
    database: "LogicalSystem",
    collection: "students"
  });
});

if (require.main === module) {
  // Start the server only when this file is run directly.
  // Keeping startup separate makes the Express app easy to test or import.
  app.listen(PORT, () => {
    console.log("=======================================================");
    console.log(" Quiz & Examination System [Imperative Backend]       ");
    console.log(` Listening on: http://localhost:${PORT}                 `);
    console.log(" Database:     LogicalSystem                          ");
    console.log(" Evaluation:   Explicit loops, conditionals, mutation ");
    console.log("=======================================================");

    // Database connection happens after the HTTP server starts so the API
    // remains available even when MongoDB is temporarily offline.
    connectDB().catch((error) => {
      console.error("[MongoDB Connection Error]", error.message);
    });
  });
}

module.exports = app;
