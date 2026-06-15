import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Cart } from "../models/cart.model.js";


const addItemTOCart = asyncHandler(async (req, res) => {
    const { cartId, productId, quantity } = req.body
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User Not Found")
    }
    if (!cartId || !productId || !quantity) {
        throw new ApiError(400, "Cart ID, Product ID, and Quantity are required");
    }
    if (quantity <= 0) {
        throw new ApiError(400, "Quantity must be greater than 0");
    }
    const cart = await Cart.findOne({ _id: cartId, user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }
    const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
    );

    if (productIndex > -1) {
        cart.products[productIndex].quantity += Number(quantity);
    } else {
        cart.products.push({
            product: productId,
            quantity: Number(quantity)
        });
    }

    await cart.save();
    return res
        .status(200)
        .json(new ApiResponse(200, { CartProduct: cart.products }, "Product added to cart successfully"))
})

const updateItemInCart = asyncHandler(async (req, res) => {
    const { cartId, productId, quantity } = req.body
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User Not Found")
    }
    if (!cartId || !productId || !quantity) {
        throw new ApiError(400, "Cart ID, Product ID, and Quantity are required");
    }
    const cart = await Cart.findOne({ _id: cartId, user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }
    const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
    )


    if (productIndex === -1) {
        throw new ApiError(404, "Product not found in this cart");
    }


    if (Number(quantity) <= 0) {
        cart.products.splice(productIndex, 1)
    } else {

        cart.products[productIndex].quantity = Number(quantity)
    }

    await cart.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { cartProducts: cart.products }, "Cart updated successfully"));
})

const deleteItemFromCart = asyncHandler(async (req, res) => {
    const { cartId, productId } = req.body
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User Not Found")
    }
    if (!cartId || !productId) {
        throw new ApiError(400, "Cart ID, Product ID are required");
    }
    const cart = await Cart.findOne({ _id: cartId, user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }
    const productIndex = cart.products.findIndex((p) =>
        p.product.toString() === productId
    )
    if (productIndex === -1) {
        throw new ApiError(404, "Product not found in this cart");
    }
    cart.products.splice(productIndex, 1)
    await cart.save()
    return res
        .status(200)
        .json(new ApiResponse(200, { cartProducts: cart.products }, "Item Deleted successfully"));
})


export {
    addItemTOCart,
    updateItemInCart,
    deleteItemFromCart
}