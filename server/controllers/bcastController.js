const { Broadcast } = require("../models/broadcastSchema");

const bcastController = {
  createBcast: async (req, res) => {
    const { hostId, hostName } = req.body;

    console.log("new bcast by:", hostId, hostName);

    const found = await Broadcast.findOne({ hostId, active: true });

    if (found)
      return res.status(410).json({ error: "You're already broadcasting" });

    let bcast = new Broadcast({ hostId, hostName });

    const { _id: id, ...rest } = await bcast.save();

    res.status(200).json({ id, ...rest });
  },

  getActiveBcasts: async (req, res) => {
    const bcasts = await Broadcast.find({ active: true });
    const data = bcasts.map((bcast) => ({
      id: bcast.id,
      hostName: bcast.hostName,
    }));
    res.json(data);
  },

  dislikeBcast: async (req, res) => {
    const { userId, bcastId } = req.body;
    let bcast = await Broadcast.findOne({ _id: bcastId });

    if (!bcast) return res.status(410).json({ error: "Not found broadcast" });

    if (bcast.dislikes.indexOf(userId) === -1) {
      bcast.dislikes.push(userId);

      // removing likes if any
      const index = bcast.likes.indexOf(userId);
      if (index !== -1) bcast.likes.splice(index, 1);

      await bcast.save();
    }
    res.json({ done: true });
  },

  likeBcast: async (req, res) => {
    const { userId, bcastId } = req.body;

    const bcast = await Broadcast.findOne({ _id: bcastId });

    if (!bcast) return res.status(410).json({ error: "Not found broadcast" });

    if (bcast.likes.indexOf(userId) === -1) {
      bcast.likes.push(userId);

      // removing dislikes if any
      const index = bcast.dislikes.indexOf(userId);
      if (index !== -1) bcast.dislikes.splice(index, 1);

      await bcast.save();
    }

    res.json({ done: true });
  },

  stopBcast: async (req, res) => {
    const { bcastId } = req.body;

    const bcast = global._getBroadcast(bcastId);

    if (!bcast) return res.status(410).json({ error: "Not found broadcast" });

    // close peer conn btwn host and server
    bcast.hostPeerConn?.close();

    // close peer conn with all watchers' instances
    Array.from(bcast.watchers.values()).forEach((instances) => {
      instances.forEach(({ peer }) => peer?.close());
    });

    const dbBcast = await Broadcast.findOne({ _id: bcastId });

    // delete bcast from bcast map at the end
    dbBcast.active = false;
    await dbBcast.save();

    global.emitEvent({
      name: "cE-bcast-ended",
      data: { bcastId },
      rooms: [bcastId],
    });

    res.json({ done: true });
  },

  stopWatching: async (req, res) => {
    const { userId, bcastId } = req.body;
    const bcast = await Broadcast.findOne({ _id: bcastId });

    if (!bcast) return res.status(410).json({ error: "Not found broadcast" });

    let index = bcast.watchingNow.indexOf(userId);

    if (index !== -1) {
      bcast.watchingNow.splice(index, 1);

      await bcast.save();
    }
    res.json({ done: true });
  },
};

module.exports = { bcastController };
