const UsersRouter = require("express").Router();
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/User");
const Movie = require("../models/Movie");

UsersRouter.get("/search/:searchterm", async (request, response, next) => {
  let searchterm = request.params.searchterm;
  try {
    const result = await User.find({
      displayName: { $regex: searchterm, $options: "i" }
    }).limit(5);
    console.log(result);
    response.send(result);
  } catch (e) {
    console.log(e);
    response.send(e);
  }
});

module.exports = UsersRouter;
