import express from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.model.js"
import { asyncHandler } from '../../../First-One/src/utils/AsyncHandler.js'

const verifyJwt = asyncHandler(async (req, res, next) => {

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
        throw new ApiError(400, "Unauthorized Access")
    }
    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if (!user) {
        throw new ApiError(400, "Invalid Acceess Token")
    }
    req.user = user
    next()

})

export { verifyJwt }
