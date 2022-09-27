const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const broadcastSchema = Schema({
  active: { type: Boolean, default: true },
  hostId: { type: String, required: true },
  hostName: { type: String, required: true },

  stream: { type: Object },

  // views and watchers
  views: [],
  watchingNow: [],

  // reviews
  likes: [],
  dislikes: [],

  // comments
  // map: userID -> set({ userID: "", message: "", timeStamp: 0 })
  comments: [{ type: Schema.Types.String, ref: "comment" }],
});

const Broadcast = mongoose.model("broadcast", broadcastSchema);

module.exports = { Broadcast };
