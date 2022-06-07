'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class JobHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  JobHistory.init({
    jobToken: DataTypes.STRING,
    jobStatus: DataTypes.ENUM('started', 'in_progress', 'successful', 'failed'),
    jobProjects: DataTypes.JSON,
    jobMessage: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'JobHistory',
  });
  return JobHistory;
};