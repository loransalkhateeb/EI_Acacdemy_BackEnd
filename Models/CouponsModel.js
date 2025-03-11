
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect'); 

const Coupon = sequelize.define('Coupon', {
  id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  },
  coupon_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  coupon_type: {
    type: DataTypes.ENUM('course', 'department','testBank'),
    allowNull: false,
  },
  expiration_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'department',
      key: 'id',
    },
    onDelete: 'SET NULL', // Set to NULL if the related department is deleted
    onUpdate: 'CASCADE',
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'courses',
      key: 'id',
    },
    onDelete: 'SET NULL', // Set to NULL if the related department is deleted
    onUpdate: 'CASCADE',
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  testBank_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'TestBank',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
}, {
  timestamps: false,
  tableName: 'coupons',
});

module.exports = Coupon;
