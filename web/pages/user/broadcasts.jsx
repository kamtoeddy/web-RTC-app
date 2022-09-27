import { useContext } from "react";

// components
import MainVideo from "../../components/MainVideo";

// contexts
import { AuthContext } from "../../contexts/AuthContext";
import { BroadcastContext } from "../../contexts/BroadcastContext";

// hooks
import useTitle from "../../hooks/useTitle";

const Broadcasts = () => {
  const {
    bcastVideo,
    dislikeVideo,
    likeVideo,
    isBroadcasting,
    isWatching,
    startBcast,
    startWatching,
    stopBcast,
    stopWatching,
    views,
    watchingNow,
    dislikes,
    likes,
  } = useContext(BroadcastContext);

  // setting page title
  useTitle("Watch Broadcasts");

  return (
    <MainVideo
      src={bcastVideo}
      isWatching={isWatching}
      views={views}
      watchingNow={watchingNow}
      dislikes={dislikes}
      likes={likes}
      startWatching={startWatching}
      stopWatching={stopWatching}
      dislikeVideo={dislikeVideo}
      likeVideo={likeVideo}
    />
  );
};

export default Broadcasts;
