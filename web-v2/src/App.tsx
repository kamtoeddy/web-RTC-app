import AppBar from "@mui/material/AppBar";
import IncommingCallScreen from "./components/IncommingCallScreen";
import OnlineUsers from "./components/OnlineUsers";
import VideoCallScreen from "./components/VideoCallScreen";

import "./App.css";

function App() {
  return (
    <div className="App">
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
          myId={user.id}
          makeCall={makeCall}
        />
      )}
    </div>
  );
}

export default App;
