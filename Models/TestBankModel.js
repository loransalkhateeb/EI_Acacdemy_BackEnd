const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const UnitModel = require('./UnitModel');

const TestBank = sequelize.define('TestBank', {
  testBankCourse_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,  
    allowNull: true
  },
  video: {
    type: DataTypes.STRING,  
    allowNull: true
  },
  before_price: {
    type: DataTypes.DECIMAL(10, 2),  
    allowNull: true
  },
  after_price: {
    type: DataTypes.DECIMAL(10, 2),  
    allowNull: true
  },
});

// Remove the duplicate association definitions and keep only one set
TestBank.hasMany(UnitModel, { 
  foreignKey: 'testBank_id', 
  onDelete: 'CASCADE'  // This ensures that when a TestBank is deleted, all associated Units will be deleted
});

UnitModel.belongsTo(TestBank, { 
  foreignKey: 'testBank_id'
});

module.exports = TestBank;