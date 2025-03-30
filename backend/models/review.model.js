import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        unique: true,
    },
    reviews: [
        {
            userEmail: {  // Changed from 'user' to 'userEmail'
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
            comment: {
                type: String,
                required: true,
            },
            images: {
                type: [String], 
                validate: {
                    validator: function (arr) {
                        return arr.length <= 3;
                    },
                    message: "You can upload a maximum of 3 images per review.",
                },
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }
    ]
}, {
    timestamps: true,
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;