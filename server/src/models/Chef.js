const db = require("../../db")
const Sequelize = require('sequelize');

const Chef = db.define('chefs', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.STRING,
    phoneNumber: Sequelize.STRING,
    introduction: Sequelize.STRING(500),
    img: Sequelize.STRING,
})

module.exports = Chef