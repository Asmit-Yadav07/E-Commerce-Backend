import express from 'express'
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { User } from '../../../First-One/src/models/user.model.js'
import { uploadOnCloudinary } from '../utils/Cloudinary.js'
import jwt from 'jsonwebtoken'
import mongoose, { isValidObjectId } from 'mongoose'


const generateAccessAndRefreshToken = asyncHandler(async (userID) => {
    try {
        const user = await User.findById(userID)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")

    }

})

const registerUser = asyncHandler(async (req, res) => {

    const { username, email, fullName, password, address, phoneNumber } = req.body
    if (!username || !email || !fullName || !password || !phoneNumber) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(400, "User Already Exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const user = await User.create({
        username: username,
        email: email,
        fullName: fullName,
        password: password,
        avatar: avatar?.url || "",
        address: address,
        phoneNumber: phoneNumber

    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { User: createdUser }, "User Registered Successfully"))


})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    if (!username && !email) {
        throw new ApiError(400, "Username Or Email Is Required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(400, "User Is Not Registered")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(400, "Password Is Not Correct")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "User Logged In Successfully"))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User Logout Successfully")
        )
})

const updateProfile = asyncHandler(async (req, res) => {
    const { username, fullName, email, phoneNumber } = req.body
    if (!username || !fullName || !email || !phoneNumber) {
        throw new ApiError(400, "Fields Required To Update")
    }
    // const avatarLocalPath = req.files?.avatar?.[0]?.path
    // let newAvatar;

    // if (avatarLocalPath) {
    //     newAvatar = await uploadOnCloudinary(avatarLocalPath);
    // }
    const userID = req.user?._id
    if (!userID) {
        throw new ApiError(400, "Unauthorized Access")

    }

    const updateInfo = await User.findByIdAndUpdate(userID, {
        $set: {
            username: username,
            fullName: fullName,
            email: email,
            phoneNumber: phoneNumber
        }
    }, { new: true }).select("-password -refreshToken")
    return res
        .status(200)
        .json(new ApiResponse(200, { User: updateInfo }, "Profile Updated Successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorize Access")
    }
    try {
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(400, "Invalid RefreshToken")
        }
        if (incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access token Refreshed"

                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})
const getUserAddress = asyncHandler(async (req, res) => {
    const user = req.user?._id
    if (!user) {
        throw new ApiError(400, "Unauthorized Request")
    }
    const userAddress = await User.findById(user).select("address")

    return res
        .status(200)
        .json(new ApiResponse(200, { userADDRESS: userAddress.address }, "Address Fetched Successfully"))

})
const getUserProfile = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(400, "Unauthorized Request")
    }
    const userInfo = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                email: 1,
                fullName: 1,
                avatar: 1,
                isVerifiedSeller: 1,
                address: 1,
                phoneNumber: 1
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, { userProfile: userInfo[0] }, "Profile Fetched Successfully"))

})

const addAddress = asyncHandler(async (req, res) => {
    const { street, city, state, pincode, country } = req.body
    if (!street || !city || !state || !pincode || !country) {
        throw new ApiError(400, "All address fields are required");
    }
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(401, "Unauthorized Request")
    }
    const addedAddress = await User.findByIdAndUpdate(
        userId,
        {
            $push: {
                address: {
                    street,
                    city,
                    state,
                    pincode,
                    country
                }
            }
        },
        { new: true }
    ).select("address")
    return res
        .status(200)
        .json(new ApiResponse(200, { Addresses: addedAddress.address }, "Address Added Successfully"))
})

const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params
    if (!isValidObjectId(addressId)) {
        throw new ApiError(400, "Invalid Address ID")
    }
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "Unauthorized Request")
    }
    const { street, city, state, pincode, country } = req.body
    if (!street || !city || !state || !pincode || !country) {
        throw new ApiError(400, "All address fields are required");
    }
    const updatedAddress = await User.findOneAndUpdate(
        {
            _id: userId,
            "address._id": addressId
        },
        {
            $set: {
                "address.$.street": street,
                "address.$.city": city,
                "address.$.state": state,
                "address.$.pincode": pincode,
                "address.$.country": country
            }
        }, { new: true })
    if (!updatedAddress) {
        throw new ApiError(404, "Address not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { Addresses: updatedAddress.address }, "Address Updated Successfully"))
})

const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params
    if (!isValidObjectId(addressId)) {
        throw new ApiError(400, "Invalid Address ID")
    }
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "Unauthorized Request")
    }
    const updatedUser = await User.findByIdAndUpdate(userId, {
        $pull: {
            address: {
                _id: addressId
            }
        }
    }, { new: true })
    if (!updatedUser) {
        throw new ApiError(404, "Address not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Address Deleted Successfully"))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)
    const { oldPassword, newPassword } = req.body
    if (!user) {
        throw new ApiError(400, "User not authorized || logined")
    }
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old password and new password are required")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Password Incorrect")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully"))


})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    // Send OTP using your email service
    // await sendEmail(user.email, "Reset Password OTP", `Your OTP is ${otp}`);

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset OTP sent successfully")
    )
})

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.resetPasswordOTP !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.resetPasswordOTPExpiry < new Date()) {
        throw new ApiError(400, "OTP Expired");
    }

    user.password = newPassword;

    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successful")
    );
})

const applyForSeller = asyncHandler(async (req, res) => {

    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const panPath = req.files?.panCard?.[0]?.path;
    const gstPath = req.files?.gstCertificate?.[0]?.path;
    const aadhaarPath = req.files?.aadhaarCard?.[0]?.path;
    const businessPath = req.files?.businessLicense?.[0]?.path;

    if (!panPath || !aadhaarPath) {
        throw new ApiError(400, "Required documents missing");
    }

    const pan = await uploadOnCloudinary(panPath);
    const gst = gstPath
        ? await uploadOnCloudinary(gstPath)
        : null;

    const aadhaar = await uploadOnCloudinary(aadhaarPath);

    const business = businessPath
        ? await uploadOnCloudinary(businessPath)
        : null;

    user.sellerDocuments = {
        panCard: pan.url,
        gstCertificate: gst?.url,
        aadhaarCard: aadhaar.url,
        businessLicense: business?.url
    };

    user.sellerVerificationStatus = "pending";

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Seller verification request submitted"
        )
    );
})

const approveSeller = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.isSeller = true;
    user.isVerifiedSeller = true;
    user.role = "seller";
    user.sellerVerificationStatus = "approved";

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Seller approved successfully"
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    refreshAccessToken,
    getUserAddress,
    getUserProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    forgotPassword,
    resetPassword,
    applyForSeller,
    approveSeller

}