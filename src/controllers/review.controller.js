import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { ApiError } from "../utils/ApiError.js";

const sumbitReviewOfProduct = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(401, "Unauthorized Access")
    }
    const { productId } = req.params
    const { rating, comment } = req.body
    if (!productId || !rating || !comment) {
        throw new ApiError(400, "Credentials Required For Review")
    }
    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        throw new ApiError(400, "Rating must be a valid number between 1 and 5");
    }
    const review = await Review.create({
        user: userId,
        product: productId,
        rating: rating,
        comment: comment.trim()
    })
    return res
        .status(200)
        .json(new ApiResponse(200, { Review: review }, "Review Submitted Successfully"))
})

const takeReviewOfProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    if (!productId) {
        throw new ApiError(400, "product Not Found")
    }
    const reviewData = await Review.aggregate([
        {

            $match: {
                product: new mongoose.Types.ObjectId(productId)
            }
        },
        {

            $group: {
                _id: "$product",
                averageRating: { $avg: "$rating" },
                totalReviewsCount: { $sum: 1 },
                allComments: { $push: "$comment" }
            }
        }
    ])
    if (!reviewData || reviewData.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(
                200,
                { averageRating: 0, totalReviewsCount: 0, comments: [] },
                "No reviews found for this product yet"
            ));
    }
    const { averageRating, totalReviewsCount, allComments } = reviewData[0];

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                ratings: Number(averageRating.toFixed(1)),
                totalReviewsCount,
                reviews: allComments
            },
            "Review Fetched Successfully"
        ));


})




export { sumbitReviewOfProduct, takeReviewOfProduct }