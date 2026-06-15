import { Router } from 'express'
import { verifyJwt } from '../middlewares/auth.middlewares.js'
import { sumbitReviewOfProduct, takeReviewOfProduct } from '../controllers/review.controller.js'

const router = Router()


router.route("/:productId")
    .post(verifyJwt, sumbitReviewOfProduct)
    .get(takeReviewOfProduct)





export default router   