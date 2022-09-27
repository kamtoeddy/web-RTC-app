import { useContext } from "react";

// components
import MainVideo from "../../components/broadcast/MainVideo";

// import { AuthContext } from "../../contexts/AuthContext";
import { BroadcastContext } from "../../contexts/BroadcastContext";
import { SocketContext } from "../../contexts/SocketContext";

import useTitle from "../../hooks/useTitle";

const Broadcasts = () => {
  const {
    bcastVideo,
    startBcast,
    stopBcast,
    isBroadcasting,
    views,
    watchingNow,
    dislikes,
    likes,
  } = useContext(BroadcastContext);
  const { socketConnected } = useContext(SocketContext);

  useTitle("Broadcast");

  return (
    <MainVideo
      src={bcastVideo}
      startBcast={startBcast}
      stopBcast={stopBcast}
      views={views}
      watchingNow={watchingNow}
      dislikes={dislikes}
      likes={likes}
      isBroadcasting={isBroadcasting}
      socketConnected={socketConnected}
    />
  );
};

export default Broadcasts;
