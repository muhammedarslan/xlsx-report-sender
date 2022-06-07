"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GfList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GfList.init(
    {
      gfType: DataTypes.STRING,
      contactFirstName: DataTypes.STRING,
      contactLastName: DataTypes.STRING,
      contactEmail: DataTypes.STRING,
      contactToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "GfList",
    }
  );
  return GfList;
};
