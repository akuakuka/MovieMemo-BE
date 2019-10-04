const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: false
    },
    displayName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String
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
