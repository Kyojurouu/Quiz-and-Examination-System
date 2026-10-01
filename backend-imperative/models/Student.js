const mongoose = require("mongoose");

// This schema records the data needed to display a student's result report.
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    section: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    examType: { type: String, required: true, trim: true },
    score: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    review: { type: [mongoose.Schema.Types.Mixed], default: [] },
    mistakes: { type: [mongoose.Schema.Types.Mixed], default: [] }
  },
  {
    collection: "students",
    timestamps: true,
    bufferCommands: false
  }
);

module.exports = mongoose.model("ImperativeStudent", studentSchema);
