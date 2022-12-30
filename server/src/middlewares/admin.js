const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (request, response, next) {
    const token = request.header('auth');
    if (!token) return response.status(401).send('Access denied');
    try {
        const id = jwt.verify(token, 'hehe');
        const user = await User.findOne({ where: { id }, raw: true })
        if (user.username !== 'admin') {
            return response.status(401).send('Permission denied')
        }
        next()
    } catch (err) {
        return response.status(500).send('Error!');
    }
};