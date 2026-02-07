'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inquiry extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Inquiry.belongsTo(models.Apartment, {
        foreignKey: 'apartmentId',
        as: 'apartment'
      });
    }
  }
  Inquiry.init({
    apartmentId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    message: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Inquiry',
  });
  return Inquiry;
};