const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const TopicModel = require('./TopicsModel');

const Unit = sequelize.define('Unit', {
  unit_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});
Unit.hasMany(TopicModel, { 
  foreignKey: 'unit_id', 
  onDelete: 'CASCADE'  // This ensures that when a Unit is deleted, all associated Topics will be deleted
});

TopicModel.belongsTo(Unit, { 
  foreignKey: 'unit_id',
  onDelete: 'CASCADE'  // This ensures that if the related Unit is deleted, the Topic will also be deleted
});
// Define association (1:M relationship between Unit and TopicModel)
Unit.hasMany(TopicModel, { foreignKey: 'unit_id' });
TopicModel.belongsTo(Unit, { foreignKey: 'unit_id' });

module.exports = Unit;