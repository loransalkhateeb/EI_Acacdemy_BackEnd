
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const Answers = sequelize.define('Answers', {
  answer_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer_id: {
    type: DataTypes.STRING(1),
    allowNull: false
  }
});

module.exports = Answers;