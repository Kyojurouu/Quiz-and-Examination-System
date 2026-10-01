const mongoose = require("mongoose");

/**
 * Student Schema matching exact user specification:
 * {
 *   "name": "",
 *   "section": "",
 *   "subject": "",
 *   "examType": "",
 *   "score": 0
 * }
 * 
 * Target Collection: students
 * Target Database: LogicalSystem
 */
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    section: {
      type: String,
      required: [true, "Student section is required"],
      trim: true
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true
    },
    examType: {
      type: String,
      required: [true, "Exam type is required"],
      trim: true
    },
    score: {
      type: Number,
      required: true,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      default: 0
    },
    review: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    mistakes: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  {
    collection: "students",
    timestamps: true,
    bufferCommands: false
  }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
