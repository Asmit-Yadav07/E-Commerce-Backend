import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(cookieParser())
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))


import userRouter from './routes/user.route.js'
import productRouter from './routes/product.route.js'
import cartRouter from './routes/cart.route.js'
import orderRouter from './routes/order.route.js'
import reviewRouter from './routes/review.route.js'


app.use("/api/v1/users", userRouter)
app.use("/api/v1/products", productRouter)
app.use("/api/v1/carts", cartRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/reviews", reviewRouter)



export { app }