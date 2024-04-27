const jwt = require("jsonwebtoken");

const generateToken = ({
  
  payload = {},
  signature = process.env.TOKEN_SIGNATURE,
  expiresIn = 60 * 60 * 60 * 60 * 60 * 60,
} = {}) => {
  
  const token = jwt.sign(payload, signature, {
    expiresIn: parseInt(expiresIn),
  });
  
  return token;
};

const verifyToken = ({
  token,
  signature = process.env.TOKEN_SIGNATURE,
} = {}) => {
  const decoded = jwt.verify(token, signature);
  return decoded;
};

module.exports = { generateToken, verifyToken };
