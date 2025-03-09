const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const Exam = sequelize.define('Exam', {
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
    answers: {
        type: DataTypes.JSON, 
        allowNull: false,
        defaultValue: []
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
    tableName: 'Exam'
});

module.exports = Exam;