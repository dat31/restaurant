const PORT = 3000

const express = require('express')
const cors = require('cors');
const bodyParser = require("body-parser")
const argon2 = require("argon2");
const path = require("path")

const db = require("./db")
const authMiddleware = require("./src/middlewares/auth");

const productRouter = require("./src/routers/product")
const authRouter = require("./src/routers/auth")
const orderRouter = require("./src/routers/order");
const chefRouter = require("./src/routers/chef")

const Chef = require('./src/models/Chef');
const Order = require('./src/models/Order');
const Product = require('./src/models/Product');
const User = require("./src/models/User")
const OrderItem = require('./src/models/OrderItem');
const app = express()

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(cors())
app.use(bodyParser.json())
app.use(authMiddleware)
app.use('/auth', authRouter)
app.use('/product', productRouter)
app.use('/order', orderRouter)
app.use('/chef', chefRouter)

app.get('/', (_, res) => {
    res.send('hello')
})


main()

async function main() {
    defineAssociate()
    await db.sync({ force: true })
    await genData()
}

async function genData() {

    const products = require("./src/data/products")
    const chefs = require('./src/data/chefs');

    const thanh = await User.create({
        username: 'dat',
        fullName: 'tran quoc thanh',
        password: await argon2.hash('123456'),
        email: 'dat@gmail.com',
        role: 'MEMBER',
        phoneNumber: '0123456789'
    })

    const admin = await User.create({
        username: 'admin',
        fullName: 'tran cong thanh',
        password: await argon2.hash('123456'),
        email: 'admin@gmail.com',
        role: 'ADMIN',
        phoneNumber: '0123456789'
    })

    await Product.bulkCreate(
        products.map(p => ({
            ...p,
            img: `/public/images/${p.img}`
        }))
    )

    await Chef.bulkCreate(
        chefs.map(c => ({
            ...c,
            img: `/public/images/${c.image}`
        }))
    )

    const order = await Order.create({
        datetime: new Date(),
        numOfGuests: 12,
    })

    await admin.addOrder(order)

    app.listen(PORT, function () {
        console.log('OKBABE')
    })
}

function defineAssociate() {
    User.hasMany(Order)
    Order.belongsTo(User)
    Product.belongsToMany(Order, { through: OrderItem })
    Order.belongsToMany(Product, { through: OrderItem })
}
