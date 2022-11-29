import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Peer } from "peerjs";

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

  const [callConnection, setCallConnection] = useState(null);
  const [callStatus, setCallStatus] = useState("");
  const [correspondent, setCorrespondent] = useState(null);
  const [onCall, setOnCall] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [incommingCall, setIncommingCall] = useState(false);
  const [myPeer] = useState(new Peer(user.id));

  // video streams
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const localStreamRef = useRef(localStream);
  const remoteStreamRef = useRef(remoteStream);

  const iamCaller = useRef(false);

  const callRang = useRef(false);
  const correspondentRef = useRef(correspondent);
  const incommingCallRef = useRef(incommingCall);
  const onCallRef = useRef(onCall);

  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  const onCallListener = (call) => {
    if (!iamCaller.current) return;

    call.answer(localStream);
  };

  const onStreamListener = (remoteStream) => {
    setRemoteStream(remoteStream);
  };

  useEffect(() => {
    correspondentRef.current = correspondent;
    localStreamRef.current = localStream;
    remoteStreamRef.current = remoteStream;
    onCallRef.current = onCall;
    incommingCallRef.current = incommingCall;
  });

  useEffect(() => {
    if (!myPeer) return;

    myPeer.on("call", onCallListener);

    return () => {
      myPeer.off("call", onCallListener);
    };
  }, [myPeer]);

  useEffect(() => {
    if (!callConnection) return;

    callConnection.on("stream", onStreamListener);

    return () => {
      callConnection.off("stream", onStreamListener);
    };
  }, [callConnection]);

  const releaseMediaResources = () => {
    // using references here because this function is also passed in useEffect
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
  };

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(
      RTCSettings.constraints
    );

    stream.getTracks().forEach((track) => _peer.addTrack(track, stream));

    setLocalStream(stream);

    return stream;
  };

  const makeCall = async (callee) => {
    const stream = await getLocalStream();

    iamCaller.current = true;

    setLocalStream(stream);

    setCallSound({ play: true, profile: "Outgoing Call" });
    setCallStatus("Calling");
    setOnCall(true);
    setCorrespondent(callee);
  };

  const acceptCall = async (caller) => {
    const stream = await getLocalStream();

    const call = myPeer.call(caller.id, stream);

    setLocalStream(stream);
    setCallConnection(call);

    setCallStatus("");
    setCallSound();
    setCorrespondent(caller);
    setIncommingCall(false);
    setOnCall(true);
  };

  const endCall = (correspondent) => {
    callConnection?.close();

    // console.log(correspondent);
    if (correspondent && callRang.current) {
      // console.log("Stopping Call");

      emitEvent({ name: "cE-call-ended", rooms: [correspondent.id] });
    }

    releaseMediaResources();

    callRang.current = false;
    iamCaller.current = false;

    setCallSound({ play: false });
    setOnCall(false);
    setCallStatus("Calling");

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
  const onCallAccepted = async (data) => {
    callRang.current = true;

    setCallSound();
    setCallStatus("");
  };

  const onCallEnded = () => endCall();

  const onLineBusy = () => {
    setCallSound({ play: true, profile: "Line Busy" });
    setCallStatus("Line Busy");
  };

  const onRinging = () => {
    callRang.current = true;
    setCallStatus("Ringing");
  };

  const onIncommingCall = (caller) => {
    // Incomming Calls
    if (onCallRef.current || incommingCallRef.current)
      return emitEvent({ name: "cE-call-line busy", rooms: [caller.id] });

    callRang.current = true;
    emitEvent({ name: "cE-call-ringing", rooms: [caller.id] });

    setCallSound({ play: true, profile: "Incomming Call" });
    setIncommingCall(true);
    setCorrespondent(caller);
  };

  useEffect(() => {
    socket.on("cE-call-accepted", onCallAccepted);

    socket.on("cE-call-ended", onCallEnded);

    socket.on("cE-call-incomming", onIncommingCall);

    socket.on("cE-call-line busy", onLineBusy);

    socket.on("cE-call-ringing", onRinging);

    return () => {
      socket.off("cE-call-accepted", onCallAccepted);

      socket.off("cE-call-ended", onCallEnded);

      socket.off("cE-call-incomming", onIncommingCall);

      socket.off("cE-call-line busy", onLineBusy);

      socket.off("cE-call-ringing", onRinging);

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
