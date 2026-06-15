import mongoose from "mongoose"
// import bcrypt from "bcrypt-ts";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,

    },
    fullName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    avatar: {
        type: String,
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    refreshToken: {
        type: String
    },
    password: {
        type: String,
        required: [true, "Password Is Required"]
    },
    role: {
        type: String,
        enum: ["customer", "seller", "admin"],
        default: "customer"
    },
    isSeller: {
        type: Boolean,
        default: false
    },
    isVerifiedSeller: {
        type: Boolean,
        required: true,
        default: false
    },
    sellerDocuments: {
        panCard: {
            type: String
        },
        gstCertificate: {
            type: String
        },
        aadhaarCard: {
            type: String
        },
        businessLicense: {
            type: String
        }
    },

    sellerVerificationStatus: {
        type: String,
        enum: ["not_applied", "pending", "approved", "rejected"],
        default: "not_applied"
    },
    address: [
        {
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            pincode: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true,
                default: "India"
            }
        }
    ],

    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOTP: {
        type: String
    },

    emailVerificationOTPExpiry: {
        type: Date
    },

    resetPasswordOTP: {
        type: String
    },

    resetPasswordOTPExpiry: {
        type: Date
    },



}, { timestamps: true })




userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) { return next() }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)