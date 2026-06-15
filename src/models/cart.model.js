import mongoose, { Schema } from 'mongoose'

const cartSchema = new mongoose.Schema({
    cartHolder: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                required: true

            }

        }
    ]
}, { timestamps: true })
export const Cart = mongoose.model("Cart", cartSchema)
