const jwt = require('jsonwebtoken');

module.exports = function (request, response, next) {

    if (request.url !== '/auth/users') {
        return next()
    }

    const token = request.header('auth');
    if (!token) return response.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, 'hehe');
        if (verified) {
            next();
        }
    } catch (err) {
        return response.status(400).send('Invalid Token');
    }
};