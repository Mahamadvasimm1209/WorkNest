import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["owner", "manager", "member"],
            default: "member",
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: {
            type: [teamMemberSchema],
            default: [],
        },
    },
    { timestamps: true }
);

teamSchema.index({ "members.user": 1, createdAt: -1 });

const Team = mongoose.model("Team", teamSchema);

export default Team;