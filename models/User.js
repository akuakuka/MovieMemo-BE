
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    movies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Movie'
        }
      ],
}, { timestamps: true });




const User = mongoose.model('User', userSchema);

module.exports = User;