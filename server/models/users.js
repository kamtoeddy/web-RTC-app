const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  _id: { type: String, required: true },

  role: { type: String, required: true },

  name: { type: String, required: true },

  // firstName: { type: String, required: true },

  // lastName: { type: String, required: true },

  // email: { type: String, required: true },

  // phone: { type: String, required: true },

  client_ref: {
    type: Schema.Types.ObjectId,
    ref: "client",
  },

  admin_ref: {
    type: Schema.Types.ObjectId,
    ref: "admin",
  },

  usher_ref: {
    type: Schema.Types.ObjectId,
    ref: "usher",
  },
});

const ClientSchema = new Schema({
  user_ref: { type: Schema.Types.String, ref: "user", required: true },

  watchHistory: [],

  // address: { type: String, required: true },

  ePasses: [{ type: Schema.Types.String, ref: "eventPass", required: true }],
});

const AdminSchema = new Schema({
  user_ref: { type: Schema.Types.String, ref: "user", required: true },
});

const UsherSchema = new Schema({
  user_ref: { type: Schema.Types.String, ref: "user", required: true },
});

const OnlineUserSchema = new Schema({
  online_id: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
  },

  network_ids: [
    {
      type: String,
    },
  ],

  name: String,
});

const User = mongoose.model("user", UserSchema);
const OnlineUser = mongoose.model("onlineuser", OnlineUserSchema);
const Client = mongoose.model("client", ClientSchema);
const Admin = mongoose.model("admin", AdminSchema);
const Usher = mongoose.model("usher", UsherSchema);

module.exports = {
  User,
  OnlineUser,
  Client,
  Admin,
  Usher,
};
