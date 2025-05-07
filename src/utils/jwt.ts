import jwt from "jsonwebtoken";
import internal from "stream";
require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET_KEY || "default-secret-key"
console.log("JWT Secret:", JWT_SECRET); ; // Replace with a secure key in production

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};