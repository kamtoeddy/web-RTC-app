import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

const SocketContextProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [socket] = useState(
    io(process.env.NEXT_PUBLIC_BACKEND, { transports: ["websocket"] })
  );

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const connectE = () => {
    setSocketConnected(true);
    socket.emit("register", user);
  };

  const onlineUsersE = (users) => {
    // On users update listener
    console.log(users);
    setOnlineUsers(users);
  };

  const userOfflineE = ({ _id }) => {
    // On users update listener
    setOnlineUsers((users) => users.filter(({ _id: id }) => id !== _id));
  };

  const userOnlineE = (user) => setOnlineUsers((users) => [...users, user]);

  const disconnectE = () => {
    setSocketConnected(false);
    setOnlineUsers([]);
  };

  useEffect(() => {
    socket.on("connect", connectE);

    socket.on("Online Users", onlineUsersE);

    socket.on("User online", userOnlineE);

    socket.on("User offline", userOfflineE);

    socket.on("disconnect", disconnectE);

    return () => {
      socket.off("connect", connectE);

      socket.off("Online Users", onlineUsersE);

      socket.off("User online", userOnlineE);

      socket.off("User offline", userOfflineE);

      socket.off("disconnect", disconnectE);

      socket.close();
    };
  }, [socket]);

  const emitEvent = ({ name, props = {}, rooms = [] }) => {
    socket.emit("_clientEvent", { name, props, rooms });
  };

  const context = { emitEvent, onlineUsers, socket, socketConnected };

  return (
    <SocketContext.Provider value={context}>{children}</SocketContext.Provider>
  );
};

export default SocketContextProvider;
