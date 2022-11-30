import { createContext, useContext, useEffect, useRef, useState } from "react";
import { MediaConnection, Peer } from "peerjs";

// contexts
import { useAuthCTX, User } from "./AuthContext";
import { useSocketCTX } from "./SocketContext";
import { useSoundCTX } from "./SoundContext";

type CallStatusType = "" | "Calling" | "Connected" | "Line Busy" | "Ringing";

type CallContextType = {
  callStatus: CallStatusType;
  correspondent?: User;
  isAudioOn: boolean;
  isCallConnected: boolean;
  isIncommingCall: boolean;
  isOnCall: boolean;
  isVideoOn: boolean;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  // methods
  acceptCall: (u: User) => void;
  endCall: (u?: User) => void;
  makeCall: (u: User) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
};

const RTCSettings = {
  constraints: {
    video: {
      frameRate: { min: 24, ideal: 30, max: 60 },
      width: { min: 480, ideal: 720, max: 1280 },
      height: "auto",
      aspectRatio: 1.33333,
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
    },
  },
};

export const CallContext = createContext<CallContextType | null>(null);

const CallContextProvider = ({ children }: any) => {
  const { user } = useAuthCTX();
  const { emitEvent, socket } = useSocketCTX();
  const { setCallSound } = useSoundCTX();

  const [callConnection, setCallConnection] = useState<MediaConnection | null>(
    null
  );
  const [callStatus, setCallStatus] = useState<CallStatusType>("");
  const [correspondent, setCorrespondent] = useState<User | null>(null);
  const [isOnCall, setIsOnCall] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isIncommingCall, setIsIncommingCall] = useState(false);
  const [myPeer] = useState(new Peer(user.id));

  // video streams
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  const localStreamRef = useRef(localStream);
  const remoteStreamRef = useRef(remoteStream);

  const iamCaller = useRef(false);

  const callRang = useRef(false);
  const correspondentRef = useRef(correspondent);
  const incommingCallRef = useRef(isIncommingCall);
  const onCallRef = useRef(isOnCall);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  const onCallListener = (call: MediaConnection) => {
    if (!iamCaller.current) return;

    call.answer(localStream);
  };

  const onStreamListener = (remoteStream: MediaStream) => {
    setRemoteStream(remoteStream);
  };

  useEffect(() => {
    correspondentRef.current = correspondent;
    localStreamRef.current = localStream;
    remoteStreamRef.current = remoteStream;
    onCallRef.current = isOnCall;
    incommingCallRef.current = isIncommingCall;
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
    localStreamRef.current?.getTracks().forEach((track: any) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track: any) => track.stop());
  };

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(
      RTCSettings.constraints as MediaStreamConstraints
    );

    setLocalStream(stream);

    return stream;
  };

  const makeCall = async (callee: User) => {
    const stream = await getLocalStream();

    iamCaller.current = true;

    setLocalStream(stream);

    setCallSound({ play: true, profile: "Outgoing Call" });
    setCallStatus("Calling");
    setIsOnCall(true);
    setCorrespondent(callee);
  };

  const acceptCall = async (caller: User) => {
    const stream = await getLocalStream();

    const call = myPeer.call(caller.id, stream);

    setLocalStream(stream);
    setCallConnection(call);

    setCallStatus("");
    setCallSound();
    setCorrespondent(caller);
    setIsIncommingCall(false);
    setIsOnCall(true);
  };

  const endCall = (correspondent?: User) => {
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
    setIsOnCall(false);
    setCallStatus("Calling");

    setLocalStream(undefined);
    setRemoteStream(undefined);

    setIsVideoOn(true);
    setIsAudioOn(true);
    setIsCallConnected(false);
    setIsIncommingCall(false);
    setCorrespondent(null);
  };

  const toggleVideo = () => {
    localStream!.getVideoTracks()[0].enabled = !isVideoOn;
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    localStream!.getAudioTracks()[0].enabled = !isAudioOn;
    setIsAudioOn(!isAudioOn);
  };

  // socket listeners
  const onCallAccepted = async () => {
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

  const onIncommingCall = (caller: User) => {
    // Incomming Calls
    if (onCallRef.current || incommingCallRef.current)
      return emitEvent({ name: "cE-call-line busy", rooms: [caller.id] });

    callRang.current = true;
    emitEvent({ name: "cE-call-ringing", rooms: [caller.id] });

    setCallSound({ play: true, profile: "Incomming Call" });
    setIsIncommingCall(true);
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
    callStatus,
    correspondent,
    isAudioOn,
    isCallConnected,
    isIncommingCall,
    isOnCall,
    isVideoOn,
    localStream,
    remoteStream,
    // methods
    acceptCall,
    endCall,
    makeCall,
    toggleAudio,
    toggleVideo,
  } as CallContextType;

  return (
    <CallContext.Provider value={context}>{children}</CallContext.Provider>
  );
};

export default CallContextProvider;

export const useCallCTX = () => useContext(CallContext);
