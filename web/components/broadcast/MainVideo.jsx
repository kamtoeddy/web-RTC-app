import { useContext } from "react";

// mui components
import React from "react";
import { Button, Fab } from "@mui/material/";

// mui icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

// contexts
import { SocketContext } from "../../contexts/SocketContext";

// styles
import styles from "./video.module.scss";

const MainVideo = (props) => {
  const { socketConnected } = useContext(SocketContext);

  const {
    isBroadcasting,
    dislikes,
    likes,
    src,
    startBcast,
    stopBcast,
    views,
    watchingNow,
  } = props;

  const handleBcastStartStop = () => {
    if (!socketConnected) return console.log("You're not connected");
    return isBroadcasting ? stopBcast() : startBcast();
  };

  return (
    <>
      <div className={styles.mainVideo}>
        <video ref={src} autoPlay muted />
      </div>

      <div className={styles.videoFeedIcons}>
        <Button startIcon={<VisibilityIcon />}>{views > 0 ? views : ""}</Button>
        <Button startIcon={<TrackChangesIcon />}>
          {watchingNow > 0 ? watchingNow : ""}
        </Button>
        <Button startIcon={<ThumbUpIcon />}>
          {likes.length > 0 ? likes.length : ""}
        </Button>
        <Button startIcon={<ThumbDownAltIcon />}>
          {dislikes.length > 0 ? dislikes.length : ""}
        </Button>

        <Fab className={styles.startStopBtn} onClick={handleBcastStartStop}>
          {isBroadcasting ? (
            <StopIcon className={styles.stopBtn} />
          ) : (
            <PlayArrowIcon
              className={socketConnected ? "" : styles.disconnected}
            />
          )}
        </Fab>
      </div>
    </>
  );
};

export default MainVideo;
