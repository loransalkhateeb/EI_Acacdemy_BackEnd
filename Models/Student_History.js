const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Questions = require('./QuestionsModel');

const Student_History = sequelize.define('Student_History', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Questions', 
            key: 'id'
        }
    },
    answer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Answers', 
            key: 'id'
        }
    },
    mark: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            isIn: [[0, 1]] 
        }
    }
}, {
    timestamps: false,
    tableName: 'Student_History'
});


Student_History.belongsTo(Questions, { foreignKey: 'question_id' });

module.exports = Student_History;