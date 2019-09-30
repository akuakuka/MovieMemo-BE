const OmdbRouter = require("express").Router();
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/User");
const Movie = require("../models/Movie");
const omdbkey = process.env.OMDB_KEY;

OmdbRouter.get(
  "/movies/search/:searchterm",
  async (request, response, next) => {
    let searchterm = request.params.searchterm;
    let url = `http://www.omdbapi.com/?apikey=${omdbkey}&s=${searchterm}`;
    console.log(url);
    try {
      const result = await axios.get(url);
      console.log(result);
      if (result.data.totalResults > 100) {
        response.status(300);
        return;
      }
      if (result.data.totalResults > 10) {
        const pages = Math.ceil(result.data.totalResults / 10);
        const movies = [];
        for (i = 2; i < pages; i++) {
          const url = `http://www.omdbapi.com/?apikey=${omdbkey}&s=${searchterm}&page=${i}`;
          const result = await axios.get(url);
          console.log(result.data.Search);
          Array.prototype.push.apply(movies, result.data.Search);
          //  movies = movies.concat(result.data.Search);
        }
        //     console.log(movies);
        response.send(movies);
      } else {
        response.send(result.data.Search);
      }
    } catch (e) {
      console.log(e);
      response.send(e);
    }
  }
);
OmdbRouter.get("/movies/", async (request, response, next) => {
  console.log("/MOVIES/ SISÄL");
  const userID = request.user._id;
  const user = await User.findById(userID).populate("movies");
  console.log(user.toWatch);
  response.json(user.toWatch);
});
OmdbRouter.delete("/movies/:movieID", async (request, response, next) => {
  //TODO ERROR IF IMDBID NOT FOUND
  const movieID = request.params.movieID;
  const userID = request.user._id;
  const user = await User.findById(userID).populate("movies");

  console.log(user.movies.length);
  const filteredmovies = user.movies.filter(movie => movie.imdbID !== movieID);
  console.log(filteredmovies.length);
  let doc = await User.findOneAndUpdate(
    { _id: userID },
    { movies: filteredmovies },
    { new: true }
  ).populate("movies");
  console.log(doc);
  response.send("updeittitehty");
});
OmdbRouter.get("/movies/:movieID", async (request, response, next) => {
  const movieID = request.params.movieID;
  const userFromDb = await User.findById(request.user._id);
  const url = `http://www.omdbapi.com/?apikey=${omdbkey}&i=${movieID}`;
  const movieomdb = await axios.get(url);
  const movieresponse = movieomdb.data;

  Movie.findOrCreate(
    { imdbID: movieID },
    {
      Title: movieresponse.Title,
      Year: movieresponse.Year,
      Runtime: movieresponse.Runtime,
      Director: movieresponse.Director,
      imdbRating: movieresponse.imdbRating,
      addedByUser: userFromDb
    }
  ).then(async result => {
    if (!userFromDb.toWatch.includes(result.doc._id)) {
      let doc = await User.findOneAndUpdate(
        { _id: userFromDb._id },
        { toWatch: userFromDb.toWatch.concat(result.doc._id) }
      );
      console.log(doc);
      response.send(doc.populate("toWatch"));
    } else {
      response.send("moviealredyonuser");
    }
  });
});
module.exports = OmdbRouter;
