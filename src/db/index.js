import mongoose from "mongoose";
import { DB_Name } from "../constant.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const connectDB = asyncHandler(async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        console.log("\n MONGODB Connected : ", connection.connection.host);
    } catch (error) {
        console.log("\n MONGODB Connected : ", connection.connection.host);
    }
})

export default connectDB