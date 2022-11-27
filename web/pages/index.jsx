import { useContext } from "react";

import { AuthContext } from "../contexts/AuthContext";
import { CallContext } from "../contexts/CallContext";
import { SocketContext } from "../contexts/SocketContext";

// components
import AppBar from "../components/AppBar";
import IncommingCallScreen from "../components/calls/IncommingCallScreen";
import OnlineUsers from "../components/calls/OnlineUsers";
import VideoCallScreen from "../components/calls/VideoCallScreen";

const Home = () => {
  const { user } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);

  const {
    onCall,
    incommingCall,
    correspondent,
    localStream,
    remoteStream,
    callConnected,
    callStatus,
    videoOn,
    audioOn,

    // methods
    acceptCall,
    endCall,
    makeCall,
    toggleVideo,
    toggleAudio,
  } = useContext(CallContext);

  return (
    <>
      <AppBar />

      {onCall && (
        <VideoCallScreen
          correspondent={correspondent}
          localStream={localStream}
          remoteStream={remoteStream}
          callConnected={callConnected}
          callStatus={callStatus}
          videoOn={videoOn}
          audioOn={audioOn}
          endCall={endCall}
          toggleVideo={toggleVideo}
          toggleAudio={toggleAudio}
        />
      )}

      {!onCall && incommingCall && (
        <IncommingCallScreen
          acceptCall={acceptCall}
          endCall={endCall}
          correspondent={correspondent}
        />
      )}

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
