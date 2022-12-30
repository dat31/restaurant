const express = require('express')
const router = express.Router()
const User = require("../models/User")
const jwt = require('jsonwebtoken');
const adminMiddleware = require('../middlewares/admin');
const Order = require("../models/Order");
const noCacheMiddleware = require('../middlewares/noCache');
const Product = require('../models/Product');

router.get('/',
    noCacheMiddleware,
    async function (req, res) {
        const token = req.header('auth');
        const userId = jwt.verify(token, 'hehe')
        const user = await User.findOne({
            where: { id: userId }
        })
        const queryObj = {
            nest: true,
            include: [{ model: User }, { model: Product }],
            order: [['datetime', req.query.sort]]
        }
        const orders = user.get({ plain: true }).role === 'ADMIN'
            ? await Order.findAll(queryObj)
            : await user.getOrders(queryObj)
        res.status(200).json({ orders })
    })

router.post('/', async function (req, res) {

    const order = await Order.create(req.body)
    const token = req.header('auth');
    const userId = jwt.verify(token, 'hehe')
    const user = await User.findOne({
        where: { id: userId }
    })

    if (req.body.foods.length) {
        await Promise.all(req.body.foods.map(f => order.addProduct(f.id, { through: { qty: f.qty } })))
    }

    await user.addOrder(order)
    res.status(200).json({ order })
})

router.get('/:id', async function (req, res) {
    const { id } = req.params
    const order = await Order.findOne({ where: { id }, include: { model: Product, nest: true } })
    res.status(200).json({ order })
})

router.put('/:id', async function (req, res) {
    const id = req.params.id
    const { foods, ...od } = req.body
    if (!id) {
        return res.status(400).send('Order not found')
    }
    const order = await Order.findByPk(id)
    if (!order) {
        return res.status(400).send('Order not found')
    }
    await order.set(od)
    await order.setProducts([])
    await Promise.all(req.body.foods.map(f =>
        order.addProduct(f.id, { through: { qty: f.qty } })
    ))
    await order.save()
    return res.status(200).send({ order })
})

router.delete('/:id', adminMiddleware, async function (req, res) {
    const { id } = req.params
    const order = await Order.findOne({ where: { id } })
    if (!order) {
        return res.status(400).send('Order not found')
    }
    await order.destroy()
    res.status(200).send('Delete success!')
})

module.exports = router;