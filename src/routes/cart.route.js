import { Router } from 'express'
import { addItemTOCart, deleteItemFromCart, updateItemInCart } from '../controllers/cart.controller.js'
import { verifyJwt } from '../middlewares/auth.middlewares.js'



const router = Router()
router.route("/")
    .post(verifyJwt, addItemTOCart)
    .patch(verifyJwt, updateItemInCart)
    .delete(verifyJwt, deleteItemFromCart)


export default router