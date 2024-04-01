const { handleEvent } = require('./_clientEvent');

const onlineUsersRoom = 'room-online_users';

global._updateUser = ({ id, ...changes }) => {
  const user = global._getUser(id);

  if (!user) return;

  global.users.set(id, { ...user, ...changes });
};

const _removeUser = (id) => {
  const user = global._getUser(id);

  if (!user) return;

  global.users.delete(id);
};

const getOnlineUsers = () => {
  return Array.from(users.values()).map(({ id, name, conn }) => ({
    id,
    name,
    conn,
  }));
};

const updateOnlineUsers = () => {
  const onlineUsers = getOnlineUsers();

  global.emitEvent({
    name: 'Online Users',
    data: onlineUsers,
    rooms: [onlineUsersRoom],
  });
};

function socketController(socket) {
  socket.on('register', ({ id, name }) => {
    global.users.set(id, { id, name, socketId: socket.id });

    global.usersSocketToId.set(socket.id, id);

    socket.join(id);

    socket.join(onlineUsersRoom);

    updateOnlineUsers();
  });

  socket.on('Get online users', updateOnlineUsers);

  socket.on('_clientEvent', ({ name = '', props = {}, rooms = [] }) => {
    // console.log("Client event", { name, props, rooms });
    handleEvent({ name, props, rooms }, socket);
  });

  socket.on('disconnect', (reason) => {
    const userId = global._getUserId(socket.id);

    if (!userId) return;

    _removeUser(userId, socket.id);

    updateOnlineUsers();
  });
}

module.exports = { socketController };
