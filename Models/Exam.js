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
        allowNull: false,
        validate: {
            isIn: [[0, 1]] 
        }
    }
}, {
    timestamps: false,
    tableName: 'Exam'
});

module.exports = Exam;