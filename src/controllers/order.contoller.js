import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Order } from "../models/order.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from '../models/product.model.js'


const placeOrder = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(401, "Unauthorized Access")
    }
    const { productId } = req.params
    if (!productId) {
        throw new ApiError(400, "product Not Found")
    }
    const { quantity, address, phoneNumber, paymentMethod, discounts } = req.body

    if (!quantity || !address || !paymentMethod) {
        throw new ApiError(400, "Product ID, quantity, address, and payment method are required");
    }

    if (Number(quantity) <= 0) {
        throw new ApiError(400, "Quantity must be at least 1");
    }
    const productData = await Product.findById(productId);
    if (!productData) {
        throw new ApiError(404, "Product not found");
    }
    if (productData.stock !== undefined && productData.stock < quantity) {
        throw new ApiError(400, `Insufficient stock. Only ${productData.stock} units available.`);
    }

    const securePrice = productData.price;
    const appliedDiscount = discounts ? Number(discounts) : 0;


    const calculatedTotal = (securePrice * Number(quantity)) - appliedDiscount;

    if (calculatedTotal < 0) {
        throw new ApiError(400, "Invalid discount amount. Total price cannot be negative.");
    }
    if (productData.stock !== undefined) {
        productData.stock -= quantity;
        await productData.save();
    }
    const order = await Order.create({
        owner: user._id,
        products: [
            {
                product: productId,
                quantity,
                priceAtPurchase: securePrice
            }],
        address,
        phoneNumber,
        discounts: appliedDiscount,
        totalPrice: calculatedTotal,
        paymentMethod
    })
    return res
        .status(200)
        .json(new ApiResponse(200, { orderDetails: order }, "Order Placed Successfully"))
})

const cancelOrder = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(401, "Unauthorized Access")
    }
    const { orderId } = req.params
    if (!orderId) {
        throw new ApiError(400, "OrderNotFound Or Invalid Credentials")
    }
    const order = await Order.findById(orderId)
    if (!order) {
        throw new ApiError(400, "Order Not Found")
    }
    if (order.owner.toString() != user._id.toString()) {
        throw new ApiError(400, "Your Are Not Allowed To Cancel The Order")
    }
    if (order.status === "Cancelled") {
        throw new ApiError(400, "This order is already cancelled");
    }
    if (order.status === "Delivered" || order.status === "Shipped") {
        throw new ApiError(400, `Cannot cancel an order that has already been ${order.status.toLowerCase()}`);
    }

    for (const items of order.products) {
        await Product.findByIdAndUpdate(items.product, {
            $inc: { stock: Number(items.quantity) }
        }, { new: true })


    }

    const discount = order.discounts
    const refundAmount = order.totalPrice


    order.orderCancel = true
    order.status = "Cancelled"
    await order.save()

    return res
        .status(200)
        .json(new ApiResponse(200, { refundedAmount: refundAmount, discountAvailed: discount }, "Order Cancelled Successfully"))
})

export { placeOrder, cancelOrder }