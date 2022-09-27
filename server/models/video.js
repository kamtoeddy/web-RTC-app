const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoSchema = new Schema({
  _id: { type: String, required: true }, // _id could be the path of the video

  datePosted: {
    type: Number,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  comments: [
    {
      type: Schema.Types.String,
      ref: "comment",
    },
  ],

  views: [], // set of user _ids

  likes: [], // set of user _ids

  dislikes: [], // set of user _ids
});

const PlaylistSchema = new Schema({
  _id: { type: String, required: true }, // also the playlist name

  description: String,

  videos: [{ type: mongoose.Schema.Types.String, ref: "video" }],
});

const Video = mongoose.model("video", VideoSchema);
const Playlist = mongoose.model("playlist", PlaylistSchema);

module.exports = { Video, Playlist };
