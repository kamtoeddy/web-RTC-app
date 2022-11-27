const defaultTask = (dt) => dt;

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

module.exports = calls;
