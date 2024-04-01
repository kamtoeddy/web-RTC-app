import { useEffect, useRef } from 'react';

import styles from './videoCallStyles.module.scss';

import Fab from '@mui/material/Fab';
import { Tooltip } from '@mui/material';
import { red } from '@mui/material/colors';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';

// contexts
import { useCallCTX } from '../contexts/CallContext';

const VideoCallScreen = () => {
  const {
    callStatus,
    correspondent,
    localStream,
    remoteStream,
    isCallConnected,
    isAudioOn,
    isVideoOn,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useCallCTX();
  const localVideoRef = useRef<HTMLVideoElement>();
  const remoteVideoRef = useRef<HTMLVideoElement>();

  useEffect(() => {
    localVideoRef.current!.srcObject = localStream!;
    remoteVideoRef.current!.srcObject = remoteStream!;
  }, [localStream, remoteStream]);

  return (
    <div className={styles.videos}>
      <div className={styles.correspondent}>{correspondent?.name}</div>

      {!isCallConnected && (
        <div className={styles.callStatus}>{callStatus}</div>
      )}

      <video
        ref={remoteVideoRef as any}
        className={styles.remoteVideo}
        autoPlay
      />

      <video
        className={styles.localVideo}
        ref={localVideoRef as any}
        muted
        autoPlay
      />

      <div className={styles.btns}>
        <Fab
          className={styles.btn}
          sx={{
            color: 'white',
            bgcolor: red[500],
            '&:hover': { bgcolor: red[600] },
          }}
          onClick={() => endCall?.(correspondent)}
        >
          <CallEndIcon />
        </Fab>

        <Tooltip title={`Turn your video ${isVideoOn ? 'off' : 'on'}`}>
          <Fab
            className={styles.btn}
            sx={{ '&:hover': { color: 'white', bgcolor: red[600] } }}
            onClick={toggleVideo}
          >
            {isVideoOn ? <VideocamOffIcon /> : <VideocamIcon />}
          </Fab>
        </Tooltip>

        <Tooltip title={`Turn your audio ${isAudioOn ? 'off' : 'on'}`}>
          <Fab
            className={styles.btn}
            sx={{ '&:hover': { color: 'white', bgcolor: red[600] } }}
            onClick={toggleAudio}
          >
            {isAudioOn ? <MicOffIcon /> : <MicIcon />}
          </Fab>
        </Tooltip>
      </div>
    </div>
  );
};

export default VideoCallScreen;
