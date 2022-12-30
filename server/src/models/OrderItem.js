const db = require("../../db")
const Sequelize = require('sequelize');
const Product = require("./Product");
const Order = require("./Order")

const OrderItem = db.define('orderItem', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    qty: Sequelize.INTEGER,
})


module.exports = OrderItem;