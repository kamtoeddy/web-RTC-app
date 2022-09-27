const tasks = require("./tasks");

const getTask = ({ name = "", props = {} }) => {
  const data = tasks[name];
  if (!data) throw new Error(`${name} is not a known event`);

  const propKeys = Object.keys(props);

  const { task, taskProps } = data;

  const _props = {};

  taskProps.forEach((key) => {
    if (propKeys.includes(key)) _props[key] = props[key];
  });

  return { task, _props };
};

module.exports = { getTask };
