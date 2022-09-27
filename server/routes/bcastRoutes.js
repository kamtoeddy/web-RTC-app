const Router = require("express").Router();

const { bcastController } = require("../controllers/bcastController");

Router.get("/getActiveBcasts", bcastController.getActiveBcasts);

Router.post("/create", bcastController.createBcast);

Router.patch("/dislike", bcastController.dislikeBcast);
Router.patch("/like", bcastController.likeBcast);
Router.patch("/stop", bcastController.stopBcast);
Router.patch("/stop-watching", bcastController.stopWatching);

module.exports = Router;
