const defaultTask = (dt) => dt;

const {
  createHostServerPeer,
  getBcastStats,
  handleIcecandidate,
  stopWatching,
  watchBcast,
} = require("./bcastTasks");

const broadcasts = {
  "cE-bcast-start": {
    task: createHostServerPeer,
    taskProps: ["bcastId", "hostId", "sdp"],
  },
  "cE-bcast-get-stats": { task: getBcastStats, taskProps: ["bcastId"] },
  "cE-bcast-icecandidate": {
    task: handleIcecandidate,
    taskProps: ["bcastId", "ice", "userId"],
  },
  "cE-bcast-stop-watching": {
    task: stopWatching,
    taskProps: ["bcastId", "userId"],
  },
  "cE-bcast-start-watching": {
    task: watchBcast,
    taskProps: ["bcastId", "sdp", "userId", "userName"],
  },
  "cE-bcast-stopped": { task: defaultTask, taskProps: [] },
};

const calls = {
  "cE-call-accepted": {
    task: ({ _id, name, sdp }) => ({ _id, name, sdp }),
    taskProps: ["_id", "name", "sdp"],
  },
  "cE-call-ended": { task: defaultTask, taskProps: [] },
  "cE-call-icecandidate": {
    task: ({ correspondent_id, ice }) => ({ correspondent_id, ice }),
    taskProps: ["correspondent_id", "ice"],
  },
  "cE-call-incomming": {
    task: ({ _id, name, sdp }) => ({ _id, name, sdp }),
    taskProps: ["_id", "name", "sdp"],
  },
  "cE-call-line busy": { task: defaultTask, taskProps: [] },
  "cE-call-ringing": { task: defaultTask, taskProps: [] },
};

module.exports = { ...broadcasts, ...calls };
