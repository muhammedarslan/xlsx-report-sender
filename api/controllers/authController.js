import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import path from "path";
import env from "dotenv";
import Settings from "./settingController.js";

env.config({
  path: path.resolve() + "\\..\\.env",
});

class Auth {
  constructor() {
    this.userName = process.env.userName;
  }

  async login(req, res) {
    // Add your custom authentication.
  }

  checkToken(req, res) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    return this.#isTokenValid(token)
      ? res.status(200).json({ status: true })
      : res.status(401).json({ status: false });
  }

  authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (this.#isTokenValid(token)) {
      next();
    } else {
      return res.status(401).json({ status: false, message: "Auth failed." });
    }
  }

  #isTokenValid(token) {
    if (token == null || token.length < 5) {
      return false;
    } else {
      try {
        const decodeToken = jwt.verify(token, process.env.secretKey);
        return decodeToken.userName.length > 0 ? true : false;
      } catch (error) {
        return false;
      }
    }
  }

  #generateJWT() {
    return jwt.sign(
      {
        userName: process.env.userName,
        app: "xlsxReport",
      },
      process.env.secretKey,
      {
        expiresIn: "4h",
      }
    );
  }

}

export default Auth;
