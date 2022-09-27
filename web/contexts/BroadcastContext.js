import { createContext, useContext, useEffect, useRef, useState } from "react";

import axios from "axios";
import RTCSettings from "../public/rtc-settings";

import { AuthContext } from "./AuthContext";
import { SocketContext } from "./SocketContext";

export const BroadcastContext = createContext();

const BroadcastContextProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { emitEvent, socket, socketConnected } = useContext(SocketContext);

  const bcastVideo = useRef();
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [stream, setStream] = useState();

  const [views, setViews] = useState(0);
  const [watchingNow, setWatchingNow] = useState(0);
  const [dislikes, setDislikes] = useState([]);
  const [likes, setLikes] = useState([]);

  const iamHost = useRef(false);
  const bcastIdRef = useRef();
  const peer = useRef();
  const streamRef = useRef(stream);

  useEffect(() => (streamRef.current = stream), [stream]);

  const resetContext = () => {
    if (iamHost.current) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      iamHost.current = false;
      setIsBroadcasting(false);
    }

    peer.current?.close();
    setIsWatching(false);
    setStream(null);
    peer.current = null;
    bcastIdRef.current = null;
  };

  const createPeer = (iamHost = true, bcastId) => {
    const _peer = new RTCPeerConnection(RTCSettings.iceServersConfig);

    _peer.ontrack = (e) => setStream(e.streams[0]);

    _peer.onnegotiationneeded = async () => {
      const offer = await _peer.createOffer();
      await _peer.setLocalDescription(offer.localDescription);

      let data = {
        bcastId,
        hostId: user._id,
        hostName: user.name,
        sdp: _peer.localDescription,
      };

      if (iamHost) return emitEvent({ name: "cE-bcast-start", props: data });

      data.userId = user._id;
      data.userName = user.name;
      delete data.hostId;

      emitEvent({ name: "cE-bcast-start-watching", props: data });
    };

    _peer.onconnectionstatechange = (e) => console.log(_peer.connectionState);

    _peer.onicecandidate = ({ candidate: ice }) => {
      if (!ice?.candidate) return;

      emitEvent({
        name: "cE-bcast-icecandidate",
        props: { bcastId, ice, userId: user._id },
      });
    };

    peer.current = _peer;

    return peer.current;
  };

  const startBcast = async () => {
    if (!socketConnected) return console.error("sorry, you're offline");

    let localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND + "broadcasts/create"}`,
      { hostId: user._id, hostName: user.name }
    );

    if (res.statusText !== "OK")
      return console.log("Sorry your broadcast request couldn't proceed");

    iamHost.current = true;
    bcastIdRef.current = res.data.id;
    // might change in days ahead
    const peer = createPeer(true, res.data.id);

    localStream
      .getTracks()
      .forEach((track) => peer.addTrack(track, localStream));

    setStream(localStream);

    bcastVideo.current.srcObject = localStream;
  };

  const stopBcast = async () => {
    let localStream = stream;
    localStream?.getTracks().forEach((track) => track.stop());

    let res = await axios.patch(
      `${process.env.NEXT_PUBLIC_BACKEND + "broadcasts/stop"}`,
      { bcastId: bcastIdRef.current }
    );

    if (res.statusText == "OK") console.log("Broadcast Stopped successfully");

    resetContext();
  };

  const bcastStatsE = (data) => {
    const { dislikes, likes, views, watchingNow } = data;

    setViews(views);
    setWatchingNow(watchingNow);
    setDislikes(dislikes);
    setLikes(likes);
  };

  const bcastEndedE = async ({ bcastId }) => {
    if (bcastIdRef.current !== bcastId) return;

    resetContext();
  };

  const bcastAnswerE = ({ bcastId, sdp }) => {
    if (bcastId !== bcastIdRef.current)
      return console.log("sdp not set", bcastId, bcastIdRef.current);

    const desc = new RTCSessionDescription(sdp);
    peer?.current?.setRemoteDescription(desc).catch((err) => console.log(err));

    emitEvent({
      name: "cE-bcast-get-stats",
      props: { bcastId: bcastIdRef.current },
    });

    setIsBroadcasting(true);
  };

  const bcastWatchingE = ({ bcastId, sdp }) => {
    console.log("watching", bcastId);
    // if (bcastId !== bcastID)
    //   return console.log("sdp not set", bcastId, bcastID);

    const desc = new RTCSessionDescription(sdp);
    peer?.current?.setRemoteDescription(desc).catch((err) => console.log(err));

    emitEvent({
      name: "cE-bcast-get-stats",
      props: { bcastId: bcastIdRef.current },
    });

    setIsWatching(true);
  };

  const bcastIcecandidateE = ({ bcastId, ice }) => {
    if (bcastId !== bcastIdRef.current)
      return console.log("ice not set", bcastId, bcastIdRef.current);

    if (!peer.current?.remoteDescription) return;

    peer.current
      ?.addIceCandidate(new RTCIceCandidate(ice))
      .catch((err) => console.log(err));
  };

  const startWatching = (bcastId) => {
    bcastIdRef.current = bcastId;
    const _peer = createPeer(false, bcastId);

    _peer.addTransceiver("audio", { direction: "recvonly" });
    _peer.addTransceiver("video", { direction: "recvonly" });
  };

  const stopWatching = async () => {
    const res = await axios.patch(
      process.env.NEXT_PUBLIC_BACKEND + "broadcasts/stop-watching",
      { userId: user._id, bcastId: bcastIdRef.current }
    );

    if (res.statusText !== "OK") return console.log("An error occured!");

    emitEvent({
      name: "cE-bcast-get-stats",
      props: { bcastId: bcastIdRef.current },
    });

    setIsWatching(false);
    setStream(null);
    peer.current?.close();
    peer.current = null;
    bcastIdRef.current = null;
  };

  const dislikeVideo = async () => {
    const res = await axios.patch(
      process.env.NEXT_PUBLIC_BACKEND + "broadcasts/dislike",
      { userId: user._id, bcastId: bcastIdRef.current }
    );

    if (res.statusText !== "OK") return console.log("Could not dislike");

    emitEvent({
      name: "cE-bcast-get-stats",
      props: { bcastId: bcastIdRef.current },
    });
  };

  const likeVideo = async () => {
    const res = await axios.patch(
      process.env.NEXT_PUBLIC_BACKEND + "broadcasts/like",
      { userId: user._id, bcastId: bcastIdRef.current }
    );
    if (res.statusText !== "OK") return console.log("Could not like");
    emitEvent({
      name: "cE-bcast-get-stats",
      props: { bcastId: bcastIdRef.current },
    });
  };

  useEffect(() => {
    socket.on("cE-bcast-answer", bcastAnswerE);

    socket.on("cE-bcast-ended", bcastEndedE);

    socket.on("cE-bcast-icecandidate", bcastIcecandidateE);

    socket.on("cE-bcast-stats", bcastStatsE);

    socket.on("cE-bcast-watching", bcastWatchingE);

    return () => {
      socket.off("cE-bcast-answer", bcastAnswerE);

      socket.off("cE-bcast-ended", bcastEndedE);

      socket.off("cE-bcast-icecandidate", bcastIcecandidateE);

      socket.off("cE-bcast-stats", bcastStatsE);

      socket.off("cE-bcast-watching", bcastWatchingE);
    };
  }, [socket]);

  useEffect(() => {
    if (!bcastVideo?.current || !stream) return;

    if (stream) bcastVideo.current.srcObject = stream;
    if (isBroadcasting || isWatching) bcastVideo.current.play();
  }, [isWatching, stream]);

  const context = {
    bcastVideo,
    isBroadcasting,
    isWatching,
    views,
    watchingNow,
    dislikes,
    likes,

    dislikeVideo,
    likeVideo,
    startBcast,
    startWatching,
    stopBcast,
    stopWatching,
  };

  return (
    <BroadcastContext.Provider value={context}>
      {children}
    </BroadcastContext.Provider>
  );
};

export default BroadcastContextProvider;
