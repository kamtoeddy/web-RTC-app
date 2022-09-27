import { useContext } from "react";

import { AuthContext } from "../contexts/AuthContext";
import { CallContext } from "../contexts/CallContext";
import { SocketContext } from "../contexts/SocketContext";

// components
import OnlineUsers from "../components/calls/OnlineUsers";

const Home = () => {
  const { user } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);

  const {
    onCall,
    incommingCall,
    // methods
    makeCall,
  } = useContext(CallContext);

  return (
    <>
      {!onCall && !incommingCall && (
        <OnlineUsers
          onlineUsers={onlineUsers}
          myId={user._id}
          makeCall={makeCall}
        />
      )}
    </>
  );
};

export default Home;
