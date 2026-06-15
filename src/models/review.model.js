import mongoose, { Schema } from 'mongoose'

const reviewSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: [1, "Minimum rating should be 1"],
        max: [5, "Maximum rating should be 5"]
    },
    comment: {
        type: String,
        trim: true,
        maxLength: [500, "Comment cannot exceed 500 characters"]
    }


}, { timestamps: true })
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.post("save", async function () {
    // 'this' points to the review document that was just saved
    const ReviewModel = this.constructor;

    const stats = await ReviewModel.aggregate([
        { $match: { product: this.product } },
        { $group: { _id: "$product", avgRating: { $avg: "$rating" } } }
    ]);

    if (stats.length > 0) {
        await mongoose.model("Product").findByIdAndUpdate(this.product, {
            rating: Number(stats[0].avgRating.toFixed(1))
        });
    }
});
export const Review = mongoose.model("Review", reviewSchema)
