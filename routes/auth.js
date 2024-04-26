const router = require("express").Router();

const conn = require("../db/dbConnection");
const { body, validationResult } = require("express-validator");
const util = require("util");

const hashAndCompare = require  ('../HashAndCompare.js')
const GenerateAndVerifyToken= require('../GenerateAndVerifyToken')
const {encryptData}= require('../encryptionAndDecryption')

//LOGIN

router.post(
  "/login",
  // authorized,
  //el hagat eli bttb3t when register
  body("email").isEmail().withMessage("please enter a valid email"),
  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("please enter a valid password between 8 and 16 characters"),
  async (req, res) => {
    try {
      //1- validation req
console.log('====================================');
console.log(req.body);
console.log('====================================');
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } //else

      //2-check if email exists
      //await/async
      const query = util.promisify(conn.query).bind(conn); //transform query mysql to promise to use await &a sync
      const checkEmailExists = await query(
        "select * from users where email =?",
        [req.body.email]
      );

      if (checkEmailExists.length == 0) {
      return  res.status(400).json({
          errors: [{ msg: "email or password is not found" }],
        });
      }
      console.log('====================================');
      console.log(checkEmailExists);
      console.log('====================================');

      //3- compare password

      const checkPassword =hashAndCompare.compare(req.body.password, checkEmailExists[0].password)
      console.log('====================================');
      console.log(checkPassword);
      console.log('====================================');

      if (checkPassword) {
        delete checkEmailExists[0].password;
        const payload = {
          id :checkEmailExists[0].id,
          email:checkEmailExists[0].email,
          role:checkEmailExists[0].role,
      }
    
      console.log('====================================');
      console.log(payload);
      console.log('====================================');
      const token = GenerateAndVerifyToken.generateToken({ payload, signature: process.env.TOKEN_SIGNATURE });
      checkEmailExists[0].token=token
        return res.status(200).json(checkEmailExists[0]);
      } else {
       return res.status(404).json({
          errors: [
            {
              msg: "email or password not found!",
            },
          ],
        });
      }
    } catch (error) {
      console.log("ERROR!!!!!!!!!");
      console.log(error);
      res.status(500).json({ error: error + "error" });
    }
  }
);

//REGISTER
router.post(
  "/register",
  //el hagat eli bttb3t when register
  body("email").isEmail().withMessage("please enter a valid email"),
  body("name").isString().withMessage("please enter a valid name"),
  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("please enter a valid password between 8 and 16 characters"),
  body("phone"),

  async (req, res) => {
    try {
      //1- validation req

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      } //else

      //check if email exists
      //await/async
      const query = util.promisify(conn.query).bind(conn); //transform query mysql to promise to use await &a sync
      const checkEmailExists = await query(
        "select * from users where email =?",
        [req.body.email]
      );

      if (checkEmailExists.length > 0) {
       return res.status(400).json({
          errors: [{ msg: "email already exists" }],
        });
      }

      //prepare object user to save

      const hashedPassword = hashAndCompare.hash(req.body.password)
      console.log('====================================');
      console.log(hashedPassword);
      console.log('====================================');
      const { name,email,phone } = req.body;
      const encryptedName  = encryptData(name);
      
      const encryptedPhone  = encryptData(phone);
      
      
      const userData = {
        name: encryptedName.encryptedData,
        email:email,
        phone:encryptedPhone.encryptedData,
        iv:encryptedName.iv,
      
        // password: hashAndCompare.hash(req.body.password),
        password: hashAndCompare.hash(req.body.password),
        
        role: "3",
      };

      //  INSERT USER OBJECT INTO DB
      await query("insert into users set ? ", userData);
      delete userData.password;
     return res.status(200).json(userData);

      
    } catch (error) {
      console.log("ERROR!!!!!!!!!");
      console.log(error);
     return res.status(500).json({ error: error });
    }
   
  }
);



module.exports = router;
