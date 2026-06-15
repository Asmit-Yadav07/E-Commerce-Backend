import mongoose from 'mongoose'

const sellerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    shopName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })
export const Seller = mongoose.model("Seller", sellerSchema)
