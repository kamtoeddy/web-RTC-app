import { useEffect, useRef } from "react";

import styles from "./videoCallStyles.module.scss";

// mui icons
import Fab from "@mui/material/Fab";
import { red } from "@mui/material/colors";
import CallEndIcon from "@mui/icons-material/CallEnd";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

const VideoCallScreen = ({
  correspondent,
  localStream,
  remoteStream,
  callConnected,
  callStatus,
  videoOn,
  audioOn,
  toggleVideo,
  toggleAudio,
  endCall,
}) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    localVideoRef.current.srcObject = localStream;
    remoteVideoRef.current.srcObject = remoteStream;

    return () => {};
  }, [localStream, remoteStream]);

  return (
    <div className={styles.videos}>
      <div className={styles.correspondent}>{correspondent?.name}</div>

      {!callConnected && <div className={styles.callStatus}>{callStatus}</div>}

      <video ref={remoteVideoRef} className={styles.remoteVideo} autoPlay />

      <video className={styles.localVideo} ref={localVideoRef} muted autoPlay />

      <div className={styles.btns}>
        <Fab
          className={styles.btn}
          sx={{
            color: "white",
            bgcolor: red[500],
            "&:hover": { bgcolor: red[600] },
          }}
          onClick={() => endCall(correspondent)}
        >
          <CallEndIcon />
        </Fab>
        <Fab
          className={styles.btn}
          sx={{
            "&:hover": {
              color: "white",
              bgcolor: red[600],
            },
          }}
          onClick={toggleVideo}
        >
          {videoOn ? <VideocamOffIcon /> : <VideocamIcon />}
        </Fab>
        <Fab
          className={styles.btn}
          sx={{
            "&:hover": { color: "white", bgcolor: red[600] },
          }}
          onClick={toggleAudio}
        >
          {audioOn ? <MicOffIcon /> : <MicIcon />}
        </Fab>
      </div>
    </div>
  );
};

export default VideoCallScreen;
