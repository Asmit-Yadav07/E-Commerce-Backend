import { Router } from 'express'
import { addProduct, addRatingOfProduct, deleteProduct, updateProduct } from '../controllers/product.controller.js'
import { verifyJwt } from '../middlewares/auth.middlewares.js'

const router = Router()

router.route("/")
    .post(verifyJwt, addProduct)


router.route("/:productId")
    .patch(verifyJwt, updateProduct)
    .delete(verifyJwt, deleteProduct)

router.route("/:productId/rating")
    .patch(verifyJwt, addRatingOfProduct)



export default router  
