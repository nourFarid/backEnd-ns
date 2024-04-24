const router = require("express").Router();
const conn = require("../db/dbConnection");
const student = require("../middleware/student");
const { body, validationResult } = require("express-validator");
const util = require("util"); // helper

// register course
router.post(
  "/registerCourse",
  // student,
  body("studentID ")
    .isLength({ max: 2 })
    .withMessage("please enter a your valid ID!"),
  body("courseID")
    .isLength({ max: 2 })
    .withMessage("please enter valid course ID"),
  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST [manual, express validation]
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF student EXISTS
      const query = util.promisify(conn.query).bind(conn); // transform query mysql --> promise to use [await/async]
      const checkstudentExists = await query(
        "select * from users where id = ?",
        [req.body.studentID]
      );
      if (checkstudentExists.length == 0) {
      return  res.status(404).json({
          errors: [
            {
              msg: "student is not found !",
            },
          ],
        });
      }
      const checkcourseExists = await query(
        "select * from courses where id = ?",
        [req.body.courseID]
      );
      if (checkcourseExists.length == 0) {
     return   res.status(404).json({
          errors: [
            {
              msg: "course is not found !",
            },
          ],
        });
      }
      // if (checkstudentExists.length == 0 && checkcourseExists.length == 0) {
      //   res.status(404).json({
      //     errors: [
      //       {
      //         msg: "student and course are not found !",
      //       },
      //     ],
      //   });
      // }

      // 3- PREPARE OBJECT register data TO -> SAVE
      const registerdata = {
        studentID: req.body.studentID,
        courseID: req.body.courseID,
      };

      // 4- INSERT USER OBJECT INTO DB
      await query("insert into studentcourse set ? ", registerdata);
    return  res.status(200).json(registerdata);
    } catch (err) {
      console.log(err);
    return  res.status(500).json({ err: err });
    }
  }
);

// view grades
router.get(
  "/listGrades/:id",
  // student,
  // body("id"),
  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      const users = await query(
        "select grades,courseID from studentcourse where studentID = ?",
        [req.params.id]
      );
      res.status(200).json(users);
    } catch (error) {
      console.log(error);
      return  res.status(500).json({ err: err });
    }
  }
);

module.exports = router;
