'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Reservation.belongsTo(models.Apartment, {
        foreignKey: 'apartmentId',
        as: 'apartment'
      });

      Reservation.belongsTo(models.User, {
        foreignKey: 'createdByUserId',
        as: 'createdBy'
      });
    }
  }
  Reservation.init({
    apartmentId: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    status: DataTypes.STRING,
    createdByUserId: DataTypes.INTEGER,
    customerName: DataTypes.STRING,
    customerEmail: DataTypes.STRING,
    customerPhone: DataTypes.STRING,
    agreedPrice: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Reservation',
  });
  return Reservation;
};