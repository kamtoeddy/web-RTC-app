const webrtc = require("wrtc");

const { Broadcast } = require("../../models/broadcastSchema");

const iceServersConfig = {
  iceServers: [
    {
      urls: [process.env.STUN_SERVER_HOST],
      username: process.env.TURN_SERVER_USERNAME,
      credential: process.env.TURN_SERVER_PASSWORD,
    },
    {
      urls: [process.env.TURN_SERVER_HOST],
      username: process.env.TURN_SERVER_USERNAME,
      credential: process.env.TURN_SERVER_PASSWORD,
    },
  ],
};

const createHostServerPeer = async ({ bcastId, hostId, sdp }, socket) => {
  // create peer connection btwn broadcaster and server

  global.broadcasts.set(bcastId, {
    hostId,
    hostPeerConn: null,
    stream: null,
    watchers: new Map(),
  });

  let bcast = global.broadcasts.get(bcastId);

  const peer = new webrtc.RTCPeerConnection(iceServersConfig);

  peer.ontrack = (e) => (bcast.stream = e.streams[0]);

  const desc = new webrtc.RTCSessionDescription(sdp);
  await peer.setRemoteDescription(desc);

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  peer.onconnectionstatechange = (e) =>
    console.log("server-host connection state:", peer.connectionState);

  peer.onicecandidate = ({ candidate: ice }) => {
    if (!ice?.candidate) return;

    // console.log("server-host ice:", ice);
    const data = { bcastId, ice };

    global.emitEvent({ name: "cE-bcast-icecandidate", data, rooms: [hostId] });
  };

  global.broadcasts.set(bcastId, {
    hostId,
    hostPeerConn: peer,
    stream: bcast.stream,
    watchers: new Map(),
  });

  const data = { bcastId, sdp: peer.localDescription };

  socket.join(bcastId);
  global.emitEvent({ name: "cE-bcast-answer", data, rooms: [hostId] });
};

const getBcastStats = async ({ bcastId }) => {
  const bcast = await Broadcast.findOne({ _id: bcastId });

  if (!bcast) throw new Error("Not found broadcast");

  const data = {
    dislikes: bcast.dislikes,
    likes: bcast.likes,
    views: bcast.views.length,
    watchingNow: bcast.watchingNow.length,
  };

  global.emitEvent({ name: "cE-bcast-stats", data, rooms: [bcastId] });
};

const handleIcecandidate = ({ bcastId, ice, userId }) => {
  const bcast = global._getBroadcast(bcastId);

  if (!bcast) throw new Error("Not found broadcast");

  if (bcast.hostId === userId)
    return bcast.hostPeerConn.addIceCandidate(new webrtc.RTCIceCandidate(ice));

  let userData = bcast.watchers.get(userId);

  if (!userData) throw new Error("Not found watcher");

  userData.forEach((dt) =>
    dt.peer
      .addIceCandidate(new webrtc.RTCIceCandidate(ice))
      .catch((err) => console.log(err))
  );
};

const watchBcast = async ({ bcastId, sdp, userId, userName }, socket) => {
  let dbBcast = await Broadcast.findOne({ _id: bcastId, active: true });

  if (!dbBcast) throw new Error("Not found broadcast");

  const { views, watchingNow } = dbBcast;

  // create peer connection
  const peer = new webrtc.RTCPeerConnection(iceServersConfig);

  const bcast = global._getBroadcast(bcastId);

  bcast.stream
    .getTracks()
    .forEach((track) => peer.addTrack(track, bcast.stream));

  const desc = new webrtc.RTCSessionDescription(sdp);
  await peer.setRemoteDescription(desc);

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  peer.onconnectionstatechange = (e) =>
    console.log("server-watcher connection state:", peer.connectionState);

  peer.onicecandidate = ({ candidate: ice }) => {
    if (!ice?.candidate) return;

    // console.log("server-watcher ice:", ice);
    const data = { bcastId, ice };

    global.emitEvent({
      name: "cE-bcast-icecandidate",
      data,
      rooms: [socket.id],
    });
  };

  const watchingInstances = bcast.watchers.get(userId);

  const newData = { conn: socket.id, peer };

  if (watchingInstances?.length > 0) {
    watchingInstances.push(newData);
  } else {
    bcast.watchers.set(userId, [newData]);
  }

  if (views.indexOf(userId) === -1) dbBcast.views.push(userId);

  if (watchingNow.indexOf(userId) === -1) dbBcast.watchingNow.push(userId);

  await dbBcast.save();

  console.log(`${userName} is watching broadcast @${bcastId}`);

  const data = { bcastId, sdp: peer.localDescription };

  socket.join(bcastId);
  emitEvent({ name: "cE-bcast-watching", data, rooms: [socket.id] });
};

const stopWatching = async ({ bcastId, userId }, socket) => {
  const bcast = global._getBroadcast(bcastId);
  if (!bcast) return;

  let watcher = bcast.watchers.get(userId);
  if (!watcher) return;

  // find user data with other socket connections
  let peerConns = watcher.peerConns.filter(({ conn, peer }) => {
    if (conn !== socket.id) return true;

    peer.close();

    return false;
  });

  // replace old user data with updated data if data is greater than or equal to 1 else delete user data from bcastMap
  if (peerConns.length > 0) return bcast.watchers.set(userId, peerConns);

  bcast.watchers.delete(userId);

  // if there is no existing user data for this broadcast, it means users watching bcast at the moment should drop
  const dbBcast = await Broadcast.findOne({ _id: bcastId });

  if (!dbBcast) return;

  let index = dbBcast.watchingNow.indexOf(userId);

  // if not found
  if (index === -1) return;

  dbBcast.watchingNow.splice(index, 1);

  await dbBcast.save();

  const data = await getBcastStats(bcastId);

  socket.leave(bcastId);

  global.emitEvent({ name: "cE-bcast-stats", data, rooms: [bcastId] });
};

module.exports = {
  createHostServerPeer,
  getBcastStats,
  handleIcecandidate,
  stopWatching,
  watchBcast,
};
