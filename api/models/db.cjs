"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = require("dotenv");
const db = {};

env.config({
  path: path.resolve() + "\\..\\.env",
});

let sequelize = new Sequelize(
  process.env.dbName,
  process.env.dbUser,
  process.env.dbPass,
  {
    host: process.env.dbHost,
    dialect: process.env.dbConn,
  }
);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== "db.cjs" && file.slice(-4) === ".cjs"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
