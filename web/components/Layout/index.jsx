import { useContext } from "react";

import { makeStyles } from "@mui/styles";

// components
import IncommingCallScreen from "../calls/IncommingCallScreen";
import VideoCallScreen from "../calls/VideoCallScreen";
import AppBar from "./AppBar";

// contexts
import { CallContext } from "../../contexts/CallContext";

const useStyles = makeStyles((theme) => {
  return {
    toolbar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
    },
  };
});

const Layout = ({ children }) => {
  const classes = useStyles();
  const {
    onCall,
    incommingCall,
    acceptCall,
    endCall,
    correspondent,
    localStream,
    remoteStream,
    callConnected,
    callStatus,
    videoOn,
    audioOn,
    toggleVideo,
    toggleAudio,
  } = useContext(CallContext);

  let viewToShow;

  if (!onCall && incommingCall)
    viewToShow = (
      <IncommingCallScreen
        acceptCall={acceptCall}
        endCall={endCall}
        correspondent={correspondent}
      />
    );

  if (onCall)
    viewToShow = (
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
    );

  if (!viewToShow)
    viewToShow = <div className={classes.content}>{children}</div>;

  return (
    <>
      <AppBar />

      <div className={classes.toolbar} />

      {viewToShow}
    </>
  );
};

export default Layout;
