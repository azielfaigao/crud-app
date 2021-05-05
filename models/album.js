const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const albumSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title cannot be blank']
    },
    artist: {
        type: String,
        required: [true, 'Artist cannot be blank']
    },
    genre: {
        type: String,
        lowercase: true,
        required: [true, 'Genre cannot be blank']
    },
    image: {
        type: String
    },
    year: {
        type: Number
    }
});

const Album = mongoose.model('Album', albumSchema);

module.exports = Album;