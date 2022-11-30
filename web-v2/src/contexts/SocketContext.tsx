import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import { useAuthCTX, User } from "./AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type EmitProps = {
  name: string;
  props?: Record<string, any>;
  rooms: string[];
};

type SocketCtxType = {
  emitEvent: (props: EmitProps) => void;
  onlineUsers: User[];
  socket: Socket;
  isSocketConnected: boolean;
};

export const SocketContext = createContext<SocketCtxType>({} as SocketCtxType);

const SocketContextProvider = ({ children }: any) => {
  const { user } = useAuthCTX();

  const [socket] = useState(
    io(BACKEND_URL, { transports: ["websocket", "polling"] })
  );

  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const connectE = () => {
    console.log(socket.id);
    setIsSocketConnected(true);
    socket.emit("register", user);
  };

  const onlineUsersE = (users: User[]) => {
    // On users update listener
    console.log(users);
    setOnlineUsers(users);
  };

  const userOfflineE = ({ id: _id }: any) => {
    // On users update listener
    setOnlineUsers((users) => users.filter(({ id }) => _id !== id));
  };

  const userOnlineE = (user: User) =>
    setOnlineUsers((users) => [...users, user]);

  const disconnectE = () => {
    // console.log("disconnected");
    setIsSocketConnected(false);
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

  const emitEvent = ({ name, props = {}, rooms = [] }: EmitProps) => {
    socket.emit("_clientEvent", { name, props, rooms });
  };

  const context = {
    emitEvent,
    onlineUsers,
    socket,
    isSocketConnected,
  };

  return (
    <SocketContext.Provider value={context}>{children}</SocketContext.Provider>
  );
};

export default SocketContextProvider;

export const useSocketCTX = () => useContext(SocketContext);
