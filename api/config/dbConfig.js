import env from "dotenv";
import path from "path";

env.config({
  path: path.resolve() + "\\..\\.env",
});

export default {
  development: {
    username: process.env.dbUser,
    password: process.env.dbPass,
    database: process.env.dbName,
    host: process.env.dbHost,
    dialect: process.env.dbConn,
  },
  test: {
    username: process.env.dbUser,
    password: process.env.dbPass,
    database: process.env.dbName,
    host: process.env.dbHost,
    dialect: process.env.dbConn,
  },
  production: {
    username: process.env.dbUser,
    password: process.env.dbPass,
    database: process.env.dbName,
    host: process.env.dbHost,
    dialect: process.env.dbConn,
  },
};
