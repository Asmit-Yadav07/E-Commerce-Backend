import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Product } from "../models/product.model.js";
import { Cart } from '../models/cart.model.js'
import { ApiError } from "../utils/ApiError.js";
import { Review } from "../models/review.model.js";
import mongoose, { isValidObjectId } from "mongoose";



const addProduct = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(401, "Unauthorized Request")
    }
    const { productType, price, size, rating, category, others } = req.body
    if (!productType || price === undefined || size === undefined || rating === undefined || !category) {
        throw new ApiError(400, "Credentials Required For Adding The Product")
    }
    if (!user.isVerifiedSeller) {
        throw new ApiError(400, "You Need Seller Badge To Add/Sell The Products")
    }
    const addedProduct = await Product.create({
        productType: productType,
        price: Number(price),
        size: Number(size),
        rating: rating,
        others: others || "",
        owner: user._id,
        category: category
    })
    return res
        .status(200)
        .json(new ApiResponse(200, { Product: addedProduct }, "Product Added Successfully"))
})

const updateProduct = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(401, "Unauthorized Request")
    }
    const { productId } = req.params
    if (!productId) {
        throw new ApiError(400, "Product ID Is Invalid Or Missing")
    }
    const { productType, price, size, rating, category, others } = req.body
    if (!productType || price === undefined || size === undefined || rating === undefined || !category) {
        throw new ApiError(400, "Credentials Required For Updating The Product")
    }
    if (!user.isVerifiedSeller) {
        throw new ApiError(400, "You Need Seller Badge To Update The Products")
    }
    const updatedProduct = await Product.findOneAndUpdate(
        {
            _id: productId,
            owner: user._id
        },
        {
            $set: {
                productType,
                price: Number(price),
                size: Number(size),
                rating: Number(rating),
                others: others || "",
                category
            }
        },
        { new: true }
    );

    if (!updatedProduct) {
        throw new ApiError(404, "Product not found or you are not authorized to update it");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { Product: updatedProduct }, "Product Updated Successfully"))
})

const deleteProduct = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(401, "Unauthorized Request")
    }
    if (!user.isVerifiedSeller) {
        throw new ApiError(403, "You Need Seller Badge To Delete Products");
    }
    const { productId } = req.params
    if (!productId) {
        throw new ApiError(400, "Product ID Is Invalid Or Missing")
    }
    const deletedProduct = await Product.findOneAndDelete({
        _id: productId,
        owner: user._id
    })
    if (!deletedProduct) {
        throw new ApiError(400, "Product Not Found Or You Are Not Authorized To Delete The Product")
    }
    await Cart.updateMany(
        {},
        { $pull: { products: { product: productId } } }
    )
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Product Deleted Successfully"))

})

const addRatingOfProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) {
        throw new ApiError(400, "Product ID Is Invalid Or Missing");
    }

    // 1. Calculate the fresh average rating across all reviews for this product
    const aggregateResult = await Review.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId)
            }
        },
        {
            $group: {
                _id: "$product",
                averageRating: { $avg: "$rating" } // Computes mathematical mean
            }
        }
    ]);

    // Fallback to 0 if no reviews exist yet
    let freshAverage = 0;
    if (aggregateResult.length > 0) {
        // Round to 1 decimal point cleanly (e.g., 4.666666 -> 4.7)
        freshAverage = Number(aggregateResult[0].averageRating.toFixed(1));
    }

    // 2. Update the product's totalRating field directly
    const productWithNewRating = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                totalRating: freshAverage // FIXED: Maps directly to your updated schema field
            }
        },
        {
            new: true,
            runValidators: true // Enforces your schema's min(0)/max(5) validation rules
        }
    );

    if (!productWithNewRating) {
        throw new ApiError(404, "Product not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { Rating: productWithNewRating.totalRating },
            "Product Rating Updated Successfully"
        ));
})
export {
    addProduct,
    updateProduct,
    deleteProduct,
    addRatingOfProduct
}