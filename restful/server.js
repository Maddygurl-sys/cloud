const express = require("express");
const app = express();
app.use(express.json());
let courses = [
    { courseCode: "22IT580", courseName: "Cloud Computing Lab" },
    { courseCode: "22IT510", courseName: "Information Security" },
    { courseCode: "22IT590", courseName: "Project" },
    { courseCode: "22IT550", courseName: "Web Technologies" },
    { courseCode: "22IT530", courseName: "Cloud Computing" }
];

// Home
app.get("/", (req, res) => {
    res.send("Welcome to Course REST API");
});

// GET All Courses
app.get("/api/courses", (req, res) => {
    res.send(courses);
});

// GET One Course
app.get("/api/courses/:courseCode", (req, res) => {
    const course = courses.find(
        c => c.courseCode === req.params.courseCode
    );
    if (!course)
        return res.status(404).send("Course Not Found");
    res.send(course);
});

// POST - Add Course
app.post("/api/courses", (req, res) => {
   const course = {
        courseCode: req.body.courseCode,
        courseName: req.body.courseName
    };
    courses.push(course);
    res.status(201).send(course);
});

// PUT - Update Course
app.put("/api/courses/:courseCode", (req, res) => {
    const course = courses.find(
        c => c.courseCode === req.params.courseCode
    );
    if (!course)
        return res.status(404).send("Course Not Found");
    course.courseName = req.body.courseName;
   res.send(course);
});

// DELETE Course
app.delete("/api/courses/:courseCode", (req, res) => {
    const course = courses.find(
        c => c.courseCode === req.params.courseCode
    );

    if (!course)
        return res.status(404).send("Course Not Found");
   const index = courses.indexOf(course);
    courses.splice(index, 1);
    res.send(course);
});

const port = 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});