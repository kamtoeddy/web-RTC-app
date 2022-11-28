const { handleEvent } = require("./_clientEvent");

const onlineUsersRoom = "room-online_users";

global._updateUser = ({ _id, ...changes }) => {
  const user = global._getUser(_id);

  if (!user) return;

  global.users.set(_id, { ...user, ...changes });
};

const _removeUser = (_id, conn) => {
  const user = global._getUser(_id);

  if (!user) return;

  global.users.delete(_id);
};

const getOnlineUsers = () => {
  return Array.from(users.values()).map(({ _id, name, conn }) => ({
    _id,
    name,
    conn,
  }));
};

const updateOnlineUsers = () => {
  const onlineUsers = getOnlineUsers();

  global.emitEvent({
    name: "Online Users",
    data: onlineUsers,
    rooms: [onlineUsersRoom],
  });
};

function socketController(socket) {
  socket.on("register", ({ _id, name }) => {
    global.users.set(_id, { _id, name, socketId: socket.id });

    global.usersSocketToId.set(socket.id, _id);

    socket.join(_id);

    socket.join(onlineUsersRoom);

    updateOnlineUsers();
  });

  socket.on("Get online users", updateOnlineUsers);

  socket.on("_clientEvent", ({ name = "", props = {}, rooms = [] }) => {
    // console.log("Client event", { name, props, rooms });
    handleEvent({ name, props, rooms }, socket);
  });

  socket.on("disconnect", (reason) => {
    const userId = global._getUserId(socket.id);

    if (!userId) return;

    _removeUser(userId, socket.id);

    updateOnlineUsers();
  });
}

module.exports = { socketController };
