import mongoose, { Schema } from 'mongoose'

const productSchema = new mongoose.Schema({

    productType: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    totalRating: {
        type: Number,
    },
    others: {
        type: String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["Electronics", "Clothing", "Books", "Home & Kitchen", "Beauty"],
        default: "Clothing"
    },
    stock: {
        type: Number,
        required: [true, "Product stock/inventory count is required"],
        min: [0, "Stock cannot be negative"],
        default: 0
    },

}, { timestamps: true })
export const Product = mongoose.model("Product", productSchema)
