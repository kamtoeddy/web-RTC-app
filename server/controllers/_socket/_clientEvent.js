const isDebugOpen = process.env.IS_DEBUG_OPEN;

const { getTask } = require("./getTask");

global.emitEvent = ({ name, data, rooms = [] }) => {
  if (!global.io) return;
  global.io.to(rooms).emit(name, data);
};

const handleEvent = async ({ name = "", props = {}, rooms = [] }, socket) => {
  const socketID = socket.id;

  try {
    if (!global.io) throw new Error("Socket connection not established");

    if (!name?.startsWith("cE-"))
      throw new Error(`${name} is not a valid event name`);

    if (isDebugOpen)
      console.log(`\nClient Event {${name}} by ${socketID} Started`);

    const { task, _props } = getTask({ name, props });

    const data = await task(_props, socket);

    if (rooms.length) emitEvent({ name, data, rooms });

    if (isDebugOpen)
      console.log(`Client Event {${name}} by ${socketID} Successful\n`);
  } catch (err) {
    if (isDebugOpen) {
      console.log("\n========== [ Log Start ] ==========");
      console.log("Error @_clientEvent");
      console.log(err);
      console.log("=========== [ Log End ] ===========\n");
    }

    emitEvent({
      name: "_cE-error",
      data: { message: err.message },
      rooms: [socketID],
    });
  }
};

module.exports = { handleEvent };
