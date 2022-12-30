const express = require('express')
const router = express.Router()
const Chef = require('../models/Chef');
const adminMiddleware = require('../middlewares/admin');

router.get('/', async function (_, res) {
    const chefs = await Chef.findAll({ raw: true })
    res.status(200).json({ chefs })
})

// router.put('/:id', adminMiddleware, async function (req, res) {
//     const id = req.params.id
//     const { img } = req.body
//     if (!id) {
//         return res.status(400).send('Product not found')
//     }
//     const prod = await Product.findOne({ where: { id } })
//     if (!prod) {
//         return res.status(400).send('Product not found')
//     }
//     prod.set({
//         ...req.body,
//         ...(img
//             ? { img: `/public/images/${req.body.img}` }
//             : {})
//     })
//     await prod.save()
//     return res.status(200).send({ product: prod })
// })

// router.post('/', adminMiddleware, async function (req, res) {
//     const { img } = req.body
//     const product = await Product.create({
//         ...req.body,
//         ...(img
//             ? { img: `/public/images/${req.body.img}` }
//             : {})
//     })
//     res.status(200).json({ product })
// })

router.delete('/:id', adminMiddleware, async function (req, res) {
    const { id } = req.params
    const chef = await Chef.findOne({ where: { id } })
    if (!chef) {
        return res.status(400).send('Product not found')
    }
    await chef.destroy()
    res.status(200).send('Delete success!')
})

module.exports = router;