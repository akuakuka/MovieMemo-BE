const mongoose = require("mongoose");

const friendRequestScrhema = new mongoose.Schema(
  {
    requestor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    requestee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String
    }
  },
  { timestamps: true }
);

const friendRequest = mongoose.model("FriendRequest", friendRequestScrhema);

module.exports = friendRequest;
