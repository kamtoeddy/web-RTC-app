import { createContext, useContext, useEffect, useRef, useState } from 'react';

// contexts
import { useAuthCTX, User } from './AuthContext';
import { useSocketCTX } from './SocketContext';
import { useSoundCTX } from './SoundContext';

// rtc configs
import { RTCIceServers } from './rtc-settings';

type CallStatusType = '' | 'Calling' | 'Connected' | 'Line Busy' | 'Ringing';

export type CallContextType = {
  callStatus: CallStatusType;
  correspondent?: User;
  isAudioOn: boolean;
  isCallConnected: boolean;
  isIncommingCall: boolean;
  isOnCall: boolean;
  isVideoOn: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  // methods
  acceptCall: (u: User) => void;
  endCall: (u?: User) => void;
  makeCall: (u: User) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
};

const MEDIA_CONSTRAINTS = {
  video: {
    frameRate: { min: 24, ideal: 30, max: 60 },
    width: { min: 480, ideal: 720, max: 1280 },
    height: 'auto',
    aspectRatio: 1.33333,
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
  },
} as MediaStreamConstraints;

export const CallContext = createContext<CallContextType | null>(null);

type IceInfo = { correspondent_id: string; ice: RTCIceCandidate };
type CallSDPInfo = User & { sdp: RTCSessionDescription };

const CallContextProvider = ({ children }: any) => {
  const { user } = useAuthCTX();
  const { emitEvent, socket } = useSocketCTX();
  const { setCallSound } = useSoundCTX();

  const [isOnCall, setIsOnCall] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isIncommingCall, setIsIncommingCall] = useState(false);
  const [correspondent, setCorrespondent] = useState<User>();

  // rtc state data
  const [remoteSdp, setRemoteSdp] = useState<RTCSessionDescription | null>(
    null,
  );

  const iamCallerRef = useRef(false);
  const iceCandidatesRef = useRef<IceInfo[]>([]);
  const peerConnRef = useRef<RTCPeerConnection | null>(null);

  const callRangRef = useRef(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const [callStatus, setCallStatus] = useState<CallStatusType>('');

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  const releaseMediaResources = () => {
    // using references here because this function is also passed in useEffect
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnRef.current?.close();
    peerConnRef.current = null;
  };

  const createPeer = async (correspondent: User) => {
    const _peer = new RTCPeerConnection({ iceServers: RTCIceServers });

    const dataStream = await navigator.mediaDevices.getUserMedia(
      MEDIA_CONSTRAINTS,
    );

    dataStream
      .getTracks()
      .forEach((track) => _peer.addTrack(track, dataStream));

    _peer.onconnectionstatechange = () => {
      if (_peer.connectionState !== 'new')
        // TODO update type here
        setCallStatus(_peer.connectionState as any);

      if (_peer.connectionState !== 'connected') setIsCallConnected(false);

      if (_peer.connectionState === 'connected') setIsCallConnected(true);
    };

    _peer.ontrack = (e) => (remoteStreamRef.current = e.streams[0]);

    _peer.onicecandidate = ({ candidate: ice }) => {
      if (!ice?.candidate) return;

      emitEvent({
        name: 'cE-call-icecandidate',
        props: { correspondent_id: user.id, ice },
        rooms: [correspondent.id],
      });
    };

    _peer.onnegotiationneeded = async () => {
      if (!iamCallerRef.current) return;

      const offer = await _peer.createOffer();
      await _peer.setLocalDescription(offer);

      emitEvent({
        name: 'cE-call-incomming',
        props: {
          id: user.id,
          name: user.name,
          sdp: _peer.localDescription,
        },
        rooms: [correspondent.id],
      });
    };

    if (!iamCallerRef.current) {
      if (remoteSdp) {
        await _peer.setRemoteDescription(new RTCSessionDescription(remoteSdp));

        const answer = await _peer.createAnswer();

        await _peer.setLocalDescription(answer);

        emitEvent({
          name: 'cE-call-accepted',
          props: {
            id: user.id,
            name: user.name,
            sdp: _peer.localDescription,
          },
          rooms: [correspondent.id],
        });
      }

      if (iceCandidatesRef.current.length > 0) {
        iceCandidatesRef.current
          .filter(
            (candidate) => correspondent?.id == candidate.correspondent_id,
          )
          .forEach(async (candidate) => {
            await _peer
              .addIceCandidate(new RTCIceCandidate(candidate.ice))
              .catch((err) => console.error(err));
          });
      }
    }

    localStreamRef.current = dataStream;
    peerConnRef.current = _peer;
  };

  const makeCall = async (callee: User) => {
    iamCallerRef.current = true;

    await createPeer(callee);

    setCallSound({ play: true, profile: 'Outgoing Call' });
    setCallStatus('Calling');
    setIsOnCall(true);
    setCorrespondent(callee);
  };

  const acceptCall = async (caller: User) => {
    await createPeer(caller);

    setCallStatus('');
    setCallSound();
    setCorrespondent(caller);
    setIsIncommingCall(false);
    setIsOnCall(true);
  };

  const endCall = (correspondent?: User) => {
    if (correspondent && callRangRef.current) {
      emitEvent({ name: 'cE-call-ended', rooms: [correspondent.id] });
    }
    releaseMediaResources();

    callRangRef.current = false;
    iamCallerRef.current = false;
    iceCandidatesRef.current = [];
    peerConnRef.current = null;

    setCallSound({ play: false });
    setIsOnCall(false);
    setCallStatus('Calling');

    setRemoteSdp(null);

    localStreamRef.current = null;
    remoteStreamRef.current = null;

    setIsVideoOn(true);
    setIsAudioOn(true);
    setIsCallConnected(false);
    setIsIncommingCall(false);
    setCorrespondent(undefined);
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;

    localStreamRef.current.getVideoTracks()[0].enabled = !isVideoOn;
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    if (!localStreamRef.current) return;

    localStreamRef.current.getAudioTracks()[0].enabled = !isAudioOn;
    setIsAudioOn(!isAudioOn);
  };

  // socket listeners
  const onCallAccepted = async (data: CallSDPInfo) => {
    callRangRef.current = true;

    await peerConnRef.current?.setRemoteDescription(
      new RTCSessionDescription(data.sdp),
    );

    if (iceCandidatesRef.current.length > 0) {
      iceCandidatesRef.current.forEach(async (candidate) => {
        await peerConnRef.current?.addIceCandidate(
          new RTCIceCandidate(candidate.ice),
        );
      });
    }

    setCallSound();
    setCallStatus('');
  };

  const onCallEnded = () => endCall();

  const onCorrespondentIce = async ({ correspondent_id, ice }: IceInfo) => {
    if (iamCallerRef.current && peerConnRef.current?.remoteDescription)
      return peerConnRef.current.addIceCandidate(new RTCIceCandidate(ice));

    if (
      !iamCallerRef.current &&
      peerConnRef.current &&
      correspondent_id === correspondent?.id
    )
      return peerConnRef.current.addIceCandidate(new RTCIceCandidate(ice));

    iceCandidatesRef.current = [
      ...iceCandidatesRef.current,
      { correspondent_id, ice },
    ];
  };

  const onLineBusy = () => {
    setCallSound({ play: true, profile: 'Line Busy' });
    setCallStatus('Line Busy');
  };

  const onRinging = () => {
    callRangRef.current = true;
    setCallStatus('Ringing');
  };

  const onIncommingCall = (caller: CallSDPInfo) => {
    if (isOnCall || isIncommingCall)
      return emitEvent({ name: 'cE-call-line busy', rooms: [caller.id] });

    callRangRef.current = true;
    emitEvent({ name: 'cE-call-ringing', rooms: [caller.id] });

    setCallSound({ play: true, profile: 'Incomming Call' });
    setRemoteSdp(caller.sdp);
    setIsIncommingCall(true);
    setCorrespondent(caller);
  };

  useEffect(() => {
    socket.on('cE-call-accepted', onCallAccepted);

    socket.on('cE-call-ended', onCallEnded);

    socket.on('cE-call-icecandidate', onCorrespondentIce);

    socket.on('cE-call-incomming', onIncommingCall);

    socket.on('cE-call-line busy', onLineBusy);

    socket.on('cE-call-ringing', onRinging);

    return () => {
      socket.off('cE-call-accepted', onCallAccepted);

      socket.off('cE-call-ended', onCallEnded);

      socket.off('cE-call-icecandidate', onCorrespondentIce);

      socket.off('cE-call-incomming', onIncommingCall);

      socket.off('cE-call-line busy', onLineBusy);

      socket.off('cE-call-ringing', onRinging);

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
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
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

export const useCallCTX = () => useContext(CallContext);
