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
  }
});
TestBank.hasMany(UnitModel, { 
  foreignKey: 'testBank_id', 
  onDelete: 'CASCADE'  // This ensures that when a Unit is deleted, all associated Topics will be deleted
});

UnitModel.belongsTo(TestBank, { 
  foreignKey: 'testBank_id',
  onDelete: 'CASCADE'  // This ensures that if the related Unit is deleted, the Topic will also be deleted
});
// Define association (1:M relationship between TestBank and UnitModel)
TestBank.hasMany(UnitModel, { foreignKey: 'testBank_id' });
UnitModel.belongsTo(TestBank, { foreignKey: 'testBank_id' });

module.exports = TestBank;