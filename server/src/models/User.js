const db = require("../../db")
const Sequelize = require('sequelize');

const User = db.define('users', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: Sequelize.STRING,
    fullName: Sequelize.STRING,
    password: Sequelize.STRING,
    role: {
        type: Sequelize.ENUM,
        values: ['ADMIN', 'MEMBER', 'GUEST'],
        defaultValue: 'GUEST'
    },
    email: Sequelize.STRING,
    point: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    phoneNumber: Sequelize.STRING
})

module.exports = User