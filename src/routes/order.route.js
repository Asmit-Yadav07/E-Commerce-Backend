import { Router } from 'express'
import { verifyJwt } from '../middlewares/auth.middlewares.js'
import { cancelOrder, placeOrder } from '../controllers/order.contoller.js'


const router = Router()

router.route("/:productId")
    .post(verifyJwt, placeOrder)
router.route("/cancel/:orderId")
    .patch(verifyJwt, cancelOrder)

export default router