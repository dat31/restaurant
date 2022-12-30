const express = require('express')
const { Op } = require('sequelize')
const router = express.Router()
const User = require("../models/User")
const jwt = require('jsonwebtoken');
const argon2 = require("argon2")

router.get('/users', async function (_, res) {
    const users = await User.findAll({
        where: {
            username: {
                [Op.not]: 'admin'
            }
        },
        raw: true
    })
    res.status(200).json({
        users
    })
})

router.post('/login', async function (req, res) {
    const user = await User.findOne({
        where: {
            username: req.body.username,
        },
        raw: true
    })
    if (!user) {
        res.status(500).send('Invalid username or password')
        return;
    }
    if (!(await argon2.verify(user.password, req.body.password))) {
        res.status(500).send('Invalid username or password')
        return;
    }
    const token = jwt.sign(user.id, 'hehe')
    const { password, ...u } = user
    res.status(200).header('auth', token).json({ token, user: u })
})

router.post('/register', async function (req, res) {
    const { password, username, ...user } = req.body
    const existedUser = await User.findOne({
        where: {
            username,
        },
    })
    if (existedUser) {
        res.status(500).send('Username already existed!')
        return;
    }
    await User.create({
        ...user,
        username,
        password: await argon2.hash(password),
        role: 'MEMBER'
    })
    res.status(200).send('Account has been created successfully!')
})

router.get('/', async function (req, res) {
    const id = jwt.verify(req.header('auth'), 'hehe')
    const user = await User.findOne({
        where: {
            id,
        },
        raw: true
    })
    return res.status(200).json(user)
})

router.post('/update', async function (req, res) {
    const id = jwt.verify(req.header('auth'), 'hehe')
    const user = await User.findOne({
        where: {
            id,
        },
    })
    user.set(req.body)
    await user.save()
    res.status(200).send('Updated successfully!')
})

router.post('/changePassword', async function (req, res) {
    const id = jwt.verify(req.header('auth'), 'hehe')
    const { oldpw, renewpw, newpw } = req.body
    const user = await User.findOne({
        where: {
            id,
        },
    })
    if (!(await argon2.verify(user.password, oldpw))) {
        res.status(500).send('Incorrect password!')
        return;
    }
    if (renewpw !== newpw) {
        res.status(500).send('Password does not matches!')
        return;
    }
    user.set({
        password: await argon2.hash(newpw)
    })
    await user.save()
    res.status(200).send('Updated successfully!')
})

module.exports = router