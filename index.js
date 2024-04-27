const express = require("express");
const app = express();
const session = require('express-session');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors()); 
const crypto = require('crypto');
const dotenv = require("dotenv");
dotenv.config();
const auth = require("./routes/auth");
const Admin = require("./routes/admin");
const student = require("./routes/student");
const instructor = require("./routes/instructor");

// Use express-session middleware
// Use express-session middleware
app.use(session({
  secret: 'your_secret_here',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 1000 } // 10 seconds
}));



// APIs routes [end points]
app.use("/auth", auth);
app.use("/admin", Admin);
app.use("/student", student);
app.use("/instructor", instructor);

app.listen(4000, "localhost", () => {
  console.log("server is running");
});
