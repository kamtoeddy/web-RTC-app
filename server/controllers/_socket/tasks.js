const defaultTask = (dt) => dt;

const calls = {
  "cE-call-accepted": {
    task: ({ id, name }) => ({ id, name }),
    taskProps: ["id", "name"],
  },
  "cE-call-ended": { task: defaultTask, taskProps: [] },
  "cE-call-incomming": {
    task: ({ id, name }) => ({ id, name }),
    taskProps: ["id", "name"],
  },
  "cE-call-line busy": { task: defaultTask, taskProps: [] },
  "cE-call-ringing": { task: defaultTask, taskProps: [] },
};

module.exports = calls;
