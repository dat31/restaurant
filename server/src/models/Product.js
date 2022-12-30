const db = require("../../db")
const Sequelize = require('sequelize');

const Product = db.define('products', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.STRING,
    price: {
        type: Sequelize.INTEGER,
        set(v) {
            this.setDataValue('price', Number(v));
        },
        defaultValue: 0,
    },
    description: Sequelize.STRING(500),
    type: {
        type: Sequelize.ENUM,
        values: ['Breakfast', 'Lunch', 'Dinner'],
        defaultValue: 'Breakfast'
    },
    img: Sequelize.STRING,
})


module.exports = Product