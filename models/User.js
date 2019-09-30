const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true
    },
    displayName: {
      type: String,
      required: true
    },
    toWatch: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie"
      }
    ],
    watched: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie"
      }
    ],
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
      }
    ],
    groupJoinRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
      }
    ]
  },

  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
