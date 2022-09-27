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

  let conns = user.conns.filter((_conn) => _conn !== conn);

  if (conns.length) return _updateUser({ _id, conns });

  global.users.delete(_id);

  global.emitEvent({
    name: "User offline",
    data: { _id },
    rooms: [onlineUsersRoom],
  });
};

const getOnlineUsers = () => {
  return Array.from(users.values()).map(({ _id, name, conn }) => ({
    _id,
    name,
    conn,
  }));
};

const updateOnlineUsers = (socket) => {
  const onlineUsers = getOnlineUsers();

  global.emitEvent({
    name: "Online Users",
    data: onlineUsers,
    rooms: [socket.id],
  });
};

function socketController(socket) {
  socket.on("register", ({ _id, name }) => {
    let user = global._getUser(_id);

    if (user) {
      _updateUser({ _id, conns: [...user.conns, socket.id] });
    } else {
      global.users.set(_id, { _id, name, conns: [socket.id] });
    }

    global.usersSocketToId.set(socket.id, _id);

    socket.join(_id);

    if (!user) {
      global.emitEvent({
        name: "User online",
        data: { _id, name },
        rooms: [onlineUsersRoom],
      });
    }

    socket.join(onlineUsersRoom);

    updateOnlineUsers(socket);
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
  });
}

module.exports = { socketController };
