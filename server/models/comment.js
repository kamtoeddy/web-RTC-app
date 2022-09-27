const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  _id: { type: String, required: true },

  video: { type: Schema.Types.String, ref: "video" },

  postDate: { type: Number, required: true },

  content: { type: String, required: true },

  likes: [], // set of user _ids

  dislikes: [], // set of user _ids
});

const Comment = mongoose.model("comment", commentSchema);

module.exports = Comment;
