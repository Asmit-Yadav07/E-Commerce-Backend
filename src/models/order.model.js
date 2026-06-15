import mongoose, { Schema } from 'mongoose'

const orderSchema = new mongoose.Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true

        },
        priceAtPurchase: {
            type: Number,
            required: true
        }
    }],
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    discounts: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["Upi", "Card", "Cod"],
        default: "Cod"

    },
    orderCancel: {
        type: Boolean,
        default: false
    }



}, { timestamps: true })
export const Order = mongoose.model("Order", orderSchema)
