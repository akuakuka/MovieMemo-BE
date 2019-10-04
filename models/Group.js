const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      unique: true
    },
    Users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
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
    ]
  },
  { timestamps: true }
);
groupSchema.plugin(findOrCreate);
const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
