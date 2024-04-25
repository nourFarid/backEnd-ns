const express = require("express");
const app = express();
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
const { log } = require("console");

app.listen(4000, "localhost", () => {
  console.log("server is running");
});

function encrypt(text, key) {
  const iv = crypto.randomBytes(16); // Generate a new IV for each encryption
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

function decrypt(encryptedData, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Example usage
const secretKey = crypto.randomBytes(32);
console.log('====================================');
console.log(secretKey.toString('hex'));
console.log('====================================');
const plainText = 'Hello, world!';

const { iv, encryptedData } = encrypt(plainText, secretKey);
console.log('Encrypted:', encryptedData);

// Use the same secretKey and IV for decryption
const decryptedText = decrypt(encryptedData, secretKey, iv);
console.log('Decrypted:', decryptedText);
//APIs routs [end points]
app.use("/auth", auth);
app.use("/admin", Admin);
app.use("/student", student);
app.use("/instructor", instructor);
