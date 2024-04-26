const router = require("express").Router();
const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const util = require("util"); // helper
const hashAndCompare = require  ('../HashAndCompare.js')
const auth= require('../auth')
const dotenv = require("dotenv");
dotenv.config();

const {encryptData}= require('../encryptionAndDecryption')
//---1-COURSES---\\

router.post(
  "/create",
  auth.auth([auth.roles.admin]),
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

      const { name } = req.body;
      const { encryptedData, iv } = encryptData(name);

const course = {
    name: encryptedData,
    iv: iv
};
      const query = util.promisify(conn.query).bind(conn);
      await query("insert into courses set ? ", course);

      return res.status(200).json({
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
  auth.auth([auth.roles.admin]),
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
      const { encryptedData, iv } = encryptData(req.body.name);
      const courseObj = {
        name: encryptedData,
        iv: iv,
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
  auth.auth([auth.roles.admin]),
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
  auth.auth([auth.roles.admin, auth.roles.instructor]), 

  async (req, res) => {
    try {
      // 4- UPDATE COURSE
      const query = util.promisify(conn.query).bind(conn);
      const listInst = await query("select * from courses ");
      console.log('====================================');
      console.log(listInst);
      console.log('====================================');
     // Decrypt course names
    //  const decryptedList = listInst.map(course => {
    //   if (course.iv && course.name) {
    //     const decryptedName = decrypt(course.name, course.iv);
    //     return { ...course, name: decryptedName };
    //   } else {
    //     return course;
    //   }
    // });
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
 
  auth.auth([auth.roles.admin]),
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
  body("phone"),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, email,  phone } = req.body;

      // Encrypt sensitive data
      const encryptedName = encryptData(name);
      const encryptedEmail = encryptData(email);
      const encryptedPhone = encryptData(phone);

      const instructor = {
        name: encryptedName.encryptedData,
        email: email,
        phone: encryptedPhone.encryptedData,
        password: hashAndCompare.hash(req.body.password),
        
        role: "2",
        iv:encryptedName.iv

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
  auth.auth([auth.roles.admin]),

  async (req, res) => {
    try {
      // 4- UPDATE COURSE
      const query = util.promisify(conn.query).bind(conn);
      const listInst = await query("select * from users  where role = 2");
      listInst.map((inst)=>{
        delete inst.password;
      })


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
  auth.auth([auth.roles.admin]),
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
      const { name, email,  phone } = req.body;

      // 3- PREPARE instructor OBJECT
      const encryptedName = encryptData(name);
      const encryptedEmail = encryptData(email);
      const encryptedPhone = encryptData(phone);

      const instructorObj = {
        name: encryptedName.encryptedData,
        email: encryptedEmail.encryptedData,
        phone: encryptedPhone.encryptedData,
        id: req.body.id,
        password:hashAndCompare.hash(req.body.password),
      };

     
      await query("update users set ? where id = ?", [
        instructorObj,
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
  auth.auth([auth.roles.admin]),
 
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
  auth.auth([auth.roles.admin]),
  body("course_id")
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
      const course = await query("select * from courses where id = ?", [
        req.body.course_id,
      ]);
      if (!course[0]) {
      return  res.status(404).json({ ms: "course not found !" });
      }

      // 3- PREPARE instructor OBJECT
      
      const instructorObj = {
        instructor_id: req.body.instructor_id,
      };
console.log('====================================');
console.log(req.body.id);
console.log('====================================');
      // 4- ASSIGN COURSE
      await query("update courses set ? where id = ?", [
        instructorObj,
        req.body.course_id,
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
