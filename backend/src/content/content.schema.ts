import mongoose, { model, Schema } from "mongoose";


const contentSchema = new Schema({
    title: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    url: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default model("Content", contentSchema);
    