import { model, Schema } from "mongoose";

const reviewSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, "Il commento non può superare i 500 caratteri"]
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

    
const Review = model("Review", reviewSchema);
export default Review;