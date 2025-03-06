const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const QuestionsModel = require('./QuestionsModel');

const Topic = sequelize.define('Topic', {
  topic_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});
Topic.hasMany(QuestionsModel, { 
  foreignKey: 'topic_id', 
  onDelete: 'CASCADE'  // This ensures that when a Unit is deleted, all associated Topics will be deleted
});

QuestionsModel.belongsTo(Topic, { 
  foreignKey: 'topic_id',
  onDelete: 'CASCADE'  // This ensures that if the related Unit is deleted, the Topic will also be deleted
});
// Define association (1:M relationship between Topic and QuestionModel)
Topic.hasMany(QuestionsModel, { foreignKey: 'topic_id' });
QuestionsModel.belongsTo(Topic, { foreignKey: 'topic_id' });

module.exports = Topic;