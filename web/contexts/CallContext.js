import { createContext, useContext, useEffect, useRef, useState } from "react";

// contexts
import { AuthContext } from "./AuthContext";
import { SocketContext } from "./SocketContext";
import { SoundContext } from "./SoundContext";

// rtc configs
import RTCSettings from "../public/rtc-settings";

export const CallContext = createContext();

const CallContextProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { emitEvent, socket } = useContext(SocketContext);
  const { setCallSound } = useContext(SoundContext);

  const [onCall, setOnCall] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [incommingCall, setIncommingCall] = useState(false);
  const [correspondent, setCorrespondent] = useState(null);

  // rtc state data
  const [remoteSdp, setRemoteSdp] = useState();
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const iamCaller = useRef(false);
  const iceCandidates = useRef([]);
  const peer = useRef(null);

  const localStreamRef = useRef(localStream);
  const remoteStreamRef = useRef(remoteStream);
  const correspondentRef = useRef(correspondent);

  const onCallRef = useRef(onCall);
  const incommingCallRef = useRef(incommingCall);
  const [callStatus, setCallStatus] = useState("");
  const callRang = useRef(false);

  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  useEffect(() => {
    correspondentRef.current = correspondent;
    localStreamRef.current = localStream;
    remoteStreamRef.current = remoteStream;
    onCallRef.current = onCall;
    incommingCallRef.current = incommingCall;
  });

  const releaseMediaResources = () => {
    // using references here because this function is also passed in useEffect
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    peer.current?.close();
    peer.current = null;
  };

  const createPeer = async (correspondent) => {
    const _peer = new RTCPeerConnection(RTCSettings.iceServersConfig);

    const dataStream = await navigator.mediaDevices.getUserMedia(
      RTCSettings.constraints
    );

    dataStream
      .getTracks()
      .forEach((track) => _peer.addTrack(track, dataStream));

    _peer.onconnectionstatechange = (e) => {
      if (_peer.connectionState !== "new") setCallStatus(_peer.connectionState);

      if (_peer.connectionState !== "connected") setCallConnected(false);

      if (_peer.connectionState === "connected") setCallConnected(true);

      console.log("Connection State:", _peer, _peer.connectionState);
    };

    _peer.ontrack = (e) => setRemoteStream(e.streams[0]);

    _peer.onicecandidate = ({ candidate: ice }) => {
      if (!ice?.candidate) return;
      // console.log("my ice:", ice);

      emitEvent({
        name: "cE-call-icecandidate",
        props: { correspondent_id: user._id, ice },
        rooms: [correspondent._id],
      });
    };

    _peer.onnegotiationneeded = async (e) => {
      if (!iamCaller.current) return;

      const offer = await _peer.createOffer();
      await _peer.setLocalDescription(offer.localDescription);

      emitEvent({
        name: "cE-call-incomming",
        props: {
          _id: user._id,
          name: user.name,
          sdp: _peer.localDescription,
        },
        rooms: [correspondent._id],
      });
    };

    if (!iamCaller.current) {
      if (remoteSdp) {
        console.log("Remote Sdp set");

        await _peer.setRemoteDescription(new RTCSessionDescription(remoteSdp));

        const answer = await _peer.createAnswer();

        await _peer.setLocalDescription(answer);

        emitEvent({
          name: "cE-call-accepted",
          props: {
            _id: user._id,
            name: user.name,
            sdp: _peer.localDescription,
          },
          rooms: [correspondent._id],
        });

        // console.log("Answer Sent");
      }

      console.log();

      if (iceCandidates.current.length > 0) {
        iceCandidates.current
          .filter(
            (candidate) => correspondent?._id == candidate.correspondent_id
          )
          .forEach(async (candidate) => {
            await _peer
              .addIceCandidate(new RTCIceCandidate(candidate.ice))
              .then(() => console.log("saved ice set:", candidate))
              .catch((err) => console.log(err));
          });
      }
    }

    setLocalStream(dataStream);
    peer.current = _peer;
    return _peer;
  };

  const makeCall = async (callee) => {
    iamCaller.current = true;

    await createPeer(callee);

    setCallSound({ play: true, profile: "Outgoing Call" });
    setCallStatus("Calling");
    setOnCall(true);
    setCorrespondent(callee);
  };

  const acceptCall = async (caller) => {
    await createPeer(caller);

    setCallStatus("");
    setCallSound();
    setCorrespondent(caller);
    setIncommingCall(false);
    setOnCall(true);
  };

  const endCall = (correspondent) => {
    // console.log(correspondent);
    if (correspondent && callRang.current) {
      // console.log("Stopping Call");

      emitEvent({ name: "cE-call-ended", rooms: [correspondent._id] });
    }
    releaseMediaResources();

    callRang.current = false;
    iamCaller.current = false;
    iceCandidates.current = [];
    peer.current = null;

    setCallSound({ play: false });
    setOnCall(false);
    setCallStatus("Calling");

    setRemoteSdp(null);

    setLocalStream(null);
    setRemoteStream(null);

    setVideoOn(true);
    setAudioOn(true);
    setCallConnected(false);
    setIncommingCall(false);
    setCorrespondent(null);
  };

  const toggleVideo = () => {
    localStream.getVideoTracks()[0].enabled = !videoOn;
    setVideoOn(!videoOn);
  };

  const toggleAudio = () => {
    localStream.getAudioTracks()[0].enabled = !audioOn;
    setAudioOn(!audioOn);
  };

  // socket listeners
  const callAcceptedE = async (data) => {
    callRang.current = true;

    await peer.current?.setRemoteDescription(
      new RTCSessionDescription(data.sdp)
    );

    // console.log("Remote description set");
    if (iceCandidates.current.length > 0) {
      iceCandidates.current.forEach(async (candidate) => {
        // console.log("Callee ice set:", candidate);
        await peer.current.addIceCandidate(new RTCIceCandidate(candidate.ice));
      });
    }

    setCallSound();
    setCallStatus("");
  };

  const callEndedE = () => endCall();

  const correspondentIceE = async ({ correspondent_id, ice }) => {
    if (iamCaller.current && peer.current?.remoteDescription)
      return peer.current.addIceCandidate(new RTCIceCandidate(ice));

    if (
      !iamCaller.current &&
      peer.current &&
      correspondent_id === correspondentRef.current?._id
    )
      return peer.current.addIceCandidate(new RTCIceCandidate(ice));

    iceCandidates.current = [
      ...iceCandidates.current,
      { correspondent_id, ice },
    ];
  };

  const lineBusyE = () => {
    setCallSound({ play: true, profile: "Line Busy" });
    setCallStatus("Line Busy");
  };

  const ringingE = () => {
    callRang.current = true;
    setCallStatus("Ringing");
  };

  const incommingCallE = (caller) => {
    // Incomming Calls
    if (onCallRef.current || incommingCallRef.current)
      return emitEvent({ name: "cE-call-line busy", rooms: [caller._id] });

    callRang.current = true;
    emitEvent({ name: "cE-call-ringing", rooms: [caller._id] });

    setCallSound({ play: true, profile: "Incomming Call" });
    setRemoteSdp(caller.sdp);
    setIncommingCall(true);
    setCorrespondent(caller);
  };

  useEffect(() => {
    socket.on("cE-call-accepted", callAcceptedE);

    socket.on("cE-call-ended", callEndedE);

    socket.on("cE-call-icecandidate", correspondentIceE);

    socket.on("cE-call-incomming", incommingCallE);

    socket.on("cE-call-line busy", lineBusyE);

    socket.on("cE-call-ringing", ringingE);

    return () => {
      socket.off("cE-call-accepted", callAcceptedE);

      socket.off("cE-call-ended", callEndedE);

      socket.off("cE-call-icecandidate", correspondentIceE);

      socket.off("cE-call-incomming", incommingCallE);

      socket.off("cE-call-line busy", lineBusyE);

      socket.off("cE-call-ringing", ringingE);

      releaseMediaResources();
    };
  }, [socket]);

  const context = {
    audioOn,
    callConnected,
    callStatus,
    correspondent,
    incommingCall,
    localStream,
    onCall,
    remoteStream,
    videoOn,
    // methods
    acceptCall,
    endCall,
    makeCall,
    toggleAudio,
    toggleVideo,
  };

  return (
    <CallContext.Provider value={context}>{children}</CallContext.Provider>
  );
};

export default CallContextProvider;
