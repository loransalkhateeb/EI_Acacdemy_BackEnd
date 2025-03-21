const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const User = require('./UserModel');
const TestBank = require('./TestBankModel');

const course_users = sequelize.define('course_users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    payment_status: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
}, {
    timestamps: false,
    tableName: 'course_users',
});


User.hasMany(course_users, { foreignKey: 'user_id' });
course_users.belongsTo(User, { foreignKey: 'user_id' }); 


TestBank.hasMany(course_users, { foreignKey: 'testBank_id' });  
course_users.belongsTo(TestBank, { foreignKey: 'testBank_id' });  

module.exports = course_users;
