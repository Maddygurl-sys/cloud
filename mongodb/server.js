
require("dotenv").config();
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  registerNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  department: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true }
});

const Student = mongoose.model("Student", studentSchema);

// CREATE student
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (e) {
    handleError(e, res);
  }
});

// READ all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (e) {
    handleError(e, res);
  }
});

// READ one student
app.get("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (e) {
    handleError(e, res);
  }
});

// UPDATE student
app.put("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (e) {
    handleError(e, res);
  }
});

// DELETE student
app.delete("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (e) {
    handleError(e, res);
  }
});

// Error handling
function handleError(e, res) {
  if (e.code === 11000) {
    return res.status(409).json({
      message: "Register number already exists"
    });
  }

  if (e.name === "ValidationError") {
    return res.status(400).json({ message: e.message });
  }

  console.error(e);
  res.status(500).json({ message: "Server error" });
}

// Start server after connecting to MongoDB
async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Check your .env file.");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB Atlas using Google DNS...");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(
        `Student CRUD app running at http://localhost:${PORT}`
      );
    });
  } catch (e) {
    console.error("MongoDB Atlas connection failed:", e.message);
    process.exit(1);
  }
}

start();
