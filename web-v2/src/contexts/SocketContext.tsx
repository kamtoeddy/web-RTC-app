import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import { useAuthCTX, User } from "./AuthContext";

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

const SocketContextProvider: React.FC<React.ReactNode> = ({
  children,
}: any) => {
  const { user } = useAuthCTX();

  const [socket] = useState(
    io(process.env.NEXT_PUBLIC_BACKEND!, { transports: ["websocket"] })
  );

  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const connectE = () => {
    setIsSocketConnected(true);
    socket.emit("register", user);
  };

  const onlineUsersE = (users: User[]) => {
    // On users update listener
    setOnlineUsers(users);
  };

  const userOfflineE = ({ id }: any) => {
    // On users update listener
    setOnlineUsers((users) => users.filter(({ id }) => id !== id));
  };

  const userOnlineE = (user: User) =>
    setOnlineUsers((users) => [...users, user]);

  const disconnectE = () => {
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
