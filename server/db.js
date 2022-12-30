const Sequelize = require('sequelize');

const db = new Sequelize('restaurant', 'thanh', '123456', {
    dialect: 'mssql',
    host: 'localhost',
    port: 1433, // Default port
    dialectOptions: {
        requestTimeout: 30000 // timeout = 30 seconds
    }
});

module.exports = db