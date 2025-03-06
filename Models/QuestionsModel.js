const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const AnswersModel = require('./AnswersModel');

const Questions = sequelize.define('Questions', {
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  question_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correct_answer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT
  }
});
Questions.hasMany(AnswersModel, { 
  foreignKey: 'question_id', 
  onDelete: 'CASCADE'  // This ensures that when a Unit is deleted, all associated Topics will be deleted
});

AnswersModel.belongsTo(Questions, { 
  AnswersModel: 'question_id',
  onDelete: 'CASCADE'  // This ensures that if the related Unit is deleted, the Topic will also be deleted
});
// Define association (1:M relationship between Question and AnswersModel)
Questions.hasMany(AnswersModel, { foreignKey: 'question_id' });
AnswersModel.belongsTo(Questions, { foreignKey: 'question_id' });

module.exports = Questions;