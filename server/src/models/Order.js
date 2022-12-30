const db = require("../../db")
const Sequelize = require('sequelize');
const Product = require("./Product");
const User = require("./User");
const OrderItem = require("./OrderItem");

const Order = db.define('orders', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    datetime: Sequelize.DATE,
    numOfGuests: Sequelize.INTEGER,
    message: Sequelize.STRING,
    status: {
        type: Sequelize.DataTypes.ENUM,
        values: ['SUBMITTED', 'CANCELLED', 'COMPLETED'],
        defaultValue: 'SUBMITTED'
    }
})

module.exports = Order