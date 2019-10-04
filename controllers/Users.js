const UsersRouter = require("express").Router();
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/User");
const Movie = require("../models/Movie");
const friendrequest = require("../models/FriendRequest");
const Group = require("../models/Group");
UsersRouter.get("/search/:searchterm", async (request, response, next) => {
  let searchterm = request.params.searchterm;
  try {
    const result = await User.find({
      displayName: { $regex: searchterm, $options: "i" }
    }).limit(5);
    response.send(result);
  } catch (e) {
    console.log(e);
    response.send(e);
  }
});
UsersRouter.get(
  "/friendrequest/:requesteeid",
  async (request, response, next) => {
    console.log(request.user);
    try {
      new friendrequest({
        requestor: request.user._id,
        requestee: request.params.requesteeid,
        status: "open"
      })
        .save()
        .then(freq => {
          console.log(freq);
        });
      response.send("OK");
    } catch (e) {
      console.log(e);
      response.send(e);
    }
  }
);
UsersRouter.get(
  "/friendrequest/accept/:answer",
  async (request, response, next) => {
    console.log(request.user);
    console.log(request.params.answer);
    try {
      friendrequest.findOneAndUpdate(
        {
          requestee: request.user._id,
          requestor: request.params.answer
        },
        { status: request.answer.answer }
      );
      response.send("OK");
    } catch (e) {
      console.log(e);
      response.send(e);
    }
  }
);
UsersRouter.get("/friendrequest/", async (request, response, next) => {
  try {
    console.log(request.user._id);
    let frequests = await friendrequest.find({ requestee: request.user._id });
    console.log("FREQUESTS");
    console.log(frequests);
    response.send(frequests);
  } catch (e) {
    console.log(e);
    response.send(e);
  }
});
UsersRouter.get("/getme/", async (request, response, next) => {
  console.log("GETME");
  console.log(request);
  try {
    let user = await User.findById(request.user._id).populate("groups");
    response.send(user);
  } catch (e) {
    console.log(e);
    response.send(e);
  }
});
UsersRouter.get("/group/", async (request, response, next) => {
  try {
    const userID = request.user._id;
    //db.inventory.find( { tags: ["red", "blank"] } )
    let frequests = await Group.find({ Users: [userID] });
    console.log("FREQUESTS");
    console.log(frequests);
    response.send(frequests);
  } catch (e) {
    console.log(e);
    response.send(e);
  }
});
UsersRouter.post("/group/:name", async (request, response, next) => {
  console.log(request.params.name);
  try {
    Group.findOrCreate(
      { groupName: request.params.name },
      {
        groupName: request.params.name,
        Users: [request.user._id]
      }
    ).then(async result => {
      const userID = request.user._id;
      console.log(result);

      let user = await User.findById(userID);
      //a = {...a, ...theNewPropertiesToAdd};
      user.groups = [...user.groups, result.doc._id];
      await user.save();
      response.send(result.doc);
    });
  } catch (e) {
    console.log(e);
    response.send(e);
  }
});

module.exports = UsersRouter;
