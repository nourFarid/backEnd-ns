const router = require("express").Router();
const conn = require("../db/dbConnection");
const util = require("util"); // helper

const { body, validationResult } = require("express-validator");
const auth= require('../middleware/authInst')
const {encryptData}= require('../helper/encryptionAndDecryption')
//------------- list students-----------------
router.get(
  "/list/:id",
  auth.auth([auth.roles.instructor]),
  body("id"),
  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      const usersID = await query(
        `SELECT users.name AS student_name, users.id, courses.name AS course_name,users.iv, courses.iv As course_iv
        FROM users
        JOIN studentcourse ON users.id = studentcourse.studentID
        JOIN courses ON studentcourse.courseID = courses.id
        WHERE courses.id = '${req.params.id}'
        
        `,
        []
      );
      //   const usersName = await query("select name from users where id = ?", [
      //     req.params.id,
      //   ]);
     return res.status(200).json(usersID);
    } catch (error) {
      console.log(error);
      return  res.status(500).json({ err: err });
    }
  }
);

//----------set grades--------------------
router.post(
  "/assignGrades",
  auth.auth([auth.roles.instructor]),
  body("courseID"),
  body("grade"),
  body("studentID"),
  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      // 2- CHECK IF user EXISTS OR NOT
      const user = await query(
        "select * from studentcourse where studentID = ?",
        [req.body.studentID]
      );
      if (!user[0]) {
      return  res.status(404).json({ ms: "User not found !" });
      }
      // 2- CHECK IF course EXISTS OR NOT
      const course = await query(
        "select * from studentcourse where courseID = ?",
        [req.body.courseID]
      );
      if (!course[0]) {
      return  res.status(404).json({ ms: "course not found !" });
      }
const{grade}=req.body;

      // 3- PREPARE grade OBJECT
      const gradeObj = {
        grades: grade,
        
      };

      // 4- ASSIGN COURSE
      await query(
        "update studentcourse set ? where courseID = ? && studentID = ?",
        [gradeObj, req.body.courseID, req.body.studentID]
      );

     return res.status(200).json({
        msg: "assign grade successfully",
      });
    } catch (err) {
      console.log(err);
    return  res.status(500).json(err);
    }
  }
);

module.exports = router;
