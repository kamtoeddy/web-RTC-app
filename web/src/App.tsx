import { lazy } from "react";

// contexts
import { useAuthCTX } from "./contexts/AuthContext";
import { useCallCTX } from "./contexts/CallContext";
import { useSocketCTX } from "./contexts/SocketContext";

// components
import AppBar from "./components/AppBar";
const IncommingCallScreen = lazy(
  () => import("./components/IncommingCallScreen")
);
const OnlineUsers = lazy(() => import("./components/OnlineUsers"));
const VideoCallScreen = lazy(() => import("./components/VideoCallScreen"));

function App() {
  const { user } = useAuthCTX();
  const {
    acceptCall,
    callStatus,
    correspondent,
    endCall,
    makeCall,
    localStream,
    remoteStream,
    isCallConnected,
    isIncommingCall,
    isOnCall,
    isAudioOn,
    isVideoOn,
    toggleAudio,
    toggleVideo,
  } = useCallCTX()!;

  const { onlineUsers } = useSocketCTX();
  return (
    <div className="App">
      <AppBar />

      {isOnCall && (
        <VideoCallScreen
          correspondent={correspondent}
          localStream={localStream}
          remoteStream={remoteStream}
          isCallConnected={isCallConnected}
          callStatus={callStatus}
          isVideoOn={isVideoOn}
          isAudioOn={isAudioOn}
          endCall={endCall}
          toggleVideo={toggleVideo}
          toggleAudio={toggleAudio}
        />
      )}

      {!isOnCall && isIncommingCall && (
        <IncommingCallScreen
          acceptCall={acceptCall}
          endCall={endCall}
          correspondent={correspondent}
        />
      )}

      {!isOnCall && !isIncommingCall && (
        <OnlineUsers
          onlineUsers={onlineUsers}
          myId={user.id}
          makeCall={makeCall}
        />
      )}
    </div>
  );
}

export default App;
