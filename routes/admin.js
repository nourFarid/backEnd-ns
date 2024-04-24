const router = require("express").Router();
const conn = require("../db/dbConnection");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const util = require("util"); // helper
bcrypt = require("bcrypt");
const crypto = require("crypto");
const upload = require("../middleware/upload");
const fs = require("fs");

//---1-COURSES---\\

//create
router.post(
  "/create",
  // admin,
  body("name")
    .isString()
    .withMessage("please enter a valid course name")
    .isLength({ min: 2 })
    .withMessage("please enter at least 2 characters"),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const course = {
        name: req.body.name,
      
      };
      const query = util.promisify(conn.query).bind(conn);
      await query("insert into courses set ? ", course);
    return  res.status(200).json({
        msg: "course created successfully !",
      });
    } catch (error) {
      console.log(error);
     return res.status(500).json(error);
    }
  }
);

//update
router.put(
  "/updateourse", // params
  // admin,
  body("name")
    .isString()
    .withMessage("please enter a valid course name")
    .isLength({ min: 2 })
    .withMessage("please enter at least 2 characters"),
 
  body("id"),

  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF COURSE EXISTS OR NOT
      const course = await query("select * from courses where id = ?", [
        req.body.id,
      ]);
      if (!course[0]) {
       return res.status(404).json({ ms: "course not found !" });
      }

      // 3- PREPARE COURSE OBJECT
      const courseObj = {
        name: req.body.name,
      
        id: req.body.id,
      };

      // 4- UPDATE COURSE
      await query("update courses set ? where id = ?", [
        courseObj,
        req.body.id,
      ]);

     return res.status(200).json({
        msg: "course updated successfully",
      });
    } catch (err) {
      console.log(err);
    return  res.status(500).json(err);
    }
  }
);

//delete
router.delete(
  "/delete/:id", // params
  // admin,
  async (req, res) => {
    try {
      // 1- CHECK IF COURSE EXISTS OR NOT
      const query = util.promisify(conn.query).bind(conn);
      const course = await query("select * from courses where id = ?", [
        req.params.id,
      ]);
      if (!course[0]) {
       return res.status(404).json({ ms: "course not found !" });
      }
      // 2- REMOVE COURSE

      await query("delete from courses where id = ?", [course[0].id]);
    return  res.status(200).json({
        msg: "course delete successfully",
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//list
router.get(
  "/listCourse", // params
  // admin,

  async (req, res) => {
    try {
      // 4- UPDATE COURSE
      const query = util.promisify(conn.query).bind(conn);
      const listInst = await query("select * from courses ");

     return res.status(200).json(listInst);
    } catch (err) {
      console.log(err);
     return res.status(500).json(err);
    }
  }
);
//______________________________________________________________________________\\

//---2-Instructors---\\
//create
router.post(
  "/createInstructor",
  // upload.single("image"),
  // admin,
  body("name")
    .isString()
    .withMessage("please enter a valid instructor name")
    .isLength({ min: 2 })
    .withMessage("please enter at least 2 characters"),

  body("email").isString().withMessage("please enter a valid email"),
  body("password")
    .isString()
    .withMessage("please enter a valid password")
    .isLength({ min: 8, max: 16 })
    .withMessage("please enter a valid password between 8 and 16 characters"),

  // body("role")
  //   .isString()
  //   .withMessage("please enter a valid role")
  //   .isLength({ max: 5 })
  //   .withMessage("please enter a valid role"),
  body("phone"),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const instructor = {
        name: req.body.name,
        // status: req.body.status,
        email: req.body.email,
        phone: req.body.phone,
        password: await bcrypt.hash(req.body.password, 10),
        role: "2",
        // token: crypto.randomBytes(16).toString("hex"),
      };
      const query = util.promisify(conn.query).bind(conn);
      await query("insert into users set ? ", instructor);
      return res.status(200).json({
        msg: "instructor created successfully !",
      });
    } catch (error) {
      console.log(error);
     return res.status(500).json(error);
    }
  }
);
//list
router.get(
  "/listInstructor", // params
  // admin,

  async (req, res) => {
    try {
      // 4- UPDATE COURSE
      const query = util.promisify(conn.query).bind(conn);
      const listInst = await query("select * from users  where role = 2");

     return res.status(200).json(listInst);
    } catch (err) {
      console.log(err);
     return res.status(500).json(err);
    }
  }
);

//update
router.put(
  "/updateInstructor", // params
  // admin,
  body("name")
    .isString()
    .withMessage("please enter a valid instructor name")
    .isLength({ min: 2 })
    .withMessage("please enter at least 2 characters"),
  // body("status")
  //   .isString()
  //   .withMessage("please enter a valid status")
  //   .isLength({ max: 5 })
  //   .withMessage("please enter at most 1 character"),
  body("email").isString().withMessage("please enter a valid email"),
  body("password")
    .isString()
    .withMessage("please enter a valid password")
    .isLength({ min: 8, max: 16 })
    .withMessage("please enter a valid password between 8 and 16 characters"),
  body("phone"),
  body("id"),

  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF Instructor EXISTS OR NOT
      const instructor = await query("select * from users where id = ?", [
        req.body.id,
      ]);
      if (!instructor[0]) {
       return res.status(404).json({ ms: "instructor not found !" });
      }

      // 3- PREPARE instructor OBJECT
      const instructorObj = {
        name: req.body.name,
        // status: req.body.status,
        email: req.body.email,
        phone: req.body.phone,
        id: req.body.id,

        password: await bcrypt.hash(req.body.password, 10),
      };

     
      await query("update users set ? where id = ?", [
        instructorObj,
        // instructor[0].id,
        req.body.id,
      ]);

    return  res.status(200).json({
        msg: "instructor updated successfully",
      });
    } catch (err) {
      console.log(err);
   return   res.status(500).json(err);
    }
  }
);

//delete
router.delete(
  "/deleteInstructor/:id", // params
  // admin,
  // body("id"),
  async (req, res) => {
    try {
      // 1- CHECK IF instructor EXISTS OR NOT
      const query = util.promisify(conn.query).bind(conn);
      const instructor = await query("select * from users where id = ?", [
        req.params.id,
      ]);
      if (!instructor[0]) {
       return res.status(404).json({ ms: "instructor not found !" });
      }
      // 2- REMOVE instructor
      await query("delete from users where id = ?", req.params.id);
    return  res.status(200).json({
        msg: "deleted instructor successfully",
      });
    } catch (err) {
    return  res.status(500).json(err);
    }
  }
);
//__________________________________________________________________________________\\

//---3-Assign Instructors to Courses---\\
router.post(
  "/AssignInstructor", // params
  // admin,
  body("name")
    .isString()
    .withMessage("please enter a valid instructor name")
    .isLength({ min: 2 })
    .withMessage("please enter at least 2 characters"),
  body("instructor_id"),
  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF Instructor EXISTS OR NOT
      const instructor = await query("select * from users where id = ?", [
        req.body.instructor_id,
      ]);
      if (!instructor[0]) {
      return  res.status(404).json({ ms: "instructor not found !" });
      }
      // 2- CHECK IF course EXISTS OR NOT
      const course = await query("select * from courses where name = ?", [
        req.body.name,
      ]);
      if (!course[0]) {
      return  res.status(404).json({ ms: "course not found !" });
      }

      // 3- PREPARE instructor OBJECT
      const instructorObj = {
        instructor_id: req.body.instructor_id,
      };

      // 4- ASSIGN COURSE
      await query("update courses set ? where name = ?", [
        instructorObj,
        req.body.name,
      ]);

    return  res.status(200).json({
        msg: "assign updated successfully",
      });
    } catch (err) {
      console.log(err);
    return  res.status(500).json(err);
    }
  }
);

module.exports = router;
