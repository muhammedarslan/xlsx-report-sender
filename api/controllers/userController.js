import { validationResult } from "express-validator";
import db from "../models/db.cjs";
import { v4 as uuidv4 } from "uuid";

class User {
  async listUser(req, res) {
    try {
      const users = await db.GfList.findAll({
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json({
        status: true,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
      });
    }
  }

  async deleteUser(req, res) {
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
      } else {
        await db.GfList.destroy({
          where: {
            contactToken: req.body.token,
          },
        });
      }
      return res.status(200).json({
        status: true,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
      });
    }
  }

  async addUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: false, errors: errors.array() });
    } else {
      const checkEmail = await db.GfList.findOne({
        where: {
          gfType: req.body.gf_type,
          contactEmail: req.body.email,
        },
      });
      if (checkEmail == null) {
        try {
          const insertUser = await db.GfList.create({
            gfType: req.body.gf_type,
            contactFirstName: req.body.first_name,
            contactLastName: req.body.last_name,
            contactEmail: req.body.email,
            contactToken: uuidv4(),
          });
          return res.status(200).json({
            status: true,
            message: "User has been successfully created.",
          });
        } catch (error) {
          return res.status(500).json({
            status: false,
          });
        }
      } else {
        return res
          .status(200)
          .json({ status: true, message: "User already exist." });
      }
    }
  }
}

export default User;
