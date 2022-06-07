'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SendedProject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SendedProject.init({
    projectId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'SendedProject',
  });
  return SendedProject;
};