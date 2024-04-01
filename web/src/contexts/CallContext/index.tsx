import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// contexts
import { useAuthCTX, User } from '../AuthContext';
import { useSocketCTX } from '../SocketContext';
import { useSoundCTX } from '../SoundContext';

// rtc configs
import { MEDIA_CONSTRAINTS, RTC_ICE_SERVERS } from './rtc-settings';

type CallStatusType = '' | 'Calling' | 'Connected' | 'Line Busy' | 'Ringing';

export type CallContextType = {
  callStatus: CallStatusType;
  correspondent?: User;
  isAudioOn: boolean;
  isCallConnected: boolean;
  isOnIncommingCall: boolean;
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

export const CallContext = createContext<CallContextType>(
  {} as CallContextType,
);
export const useCallCTX = () => useContext(CallContext);

type IceInfo = { correspondent_id: string; ice: RTCIceCandidate };
type CallSDPInfo = User & { sdp: RTCSessionDescription };

export default function CallContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuthCTX();
  const { setCallSound } = useSoundCTX();
  const { emitEvent, socket } = useSocketCTX();

  const [isOnCall, setIsOnCall] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [correspondent, setCorrespondent] = useState<User>();
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isOnIncommingCall, setIsOnIncommingCall] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatusType>('');

  // rtc state data
  const [remoteSdp, setRemoteSdp] = useState<RTCSessionDescription | null>(
    null,
  );

  const iamCallerRef = useRef(false);
  const iceCandidatesRef = useRef<IceInfo[]>([]);
  const peerConnRef = useRef<RTCPeerConnection | null>(null);

  // using references here because data gets losts with stateful values
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const releaseMediaResources = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnRef.current?.close();
    peerConnRef.current = null;
  };

  const createPeer = async (correspondent: User) => {
    const _peer = new RTCPeerConnection({ iceServers: RTC_ICE_SERVERS });

    const dataStream = await navigator.mediaDevices.getUserMedia(
      MEDIA_CONSTRAINTS,
    );

    dataStream
      .getTracks()
      .forEach((track) => _peer.addTrack(track, dataStream));

    _peer.onconnectionstatechange = () => {
      if (_peer.connectionState !== 'new')
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
    setIsOnIncommingCall(false);
    setIsOnCall(true);
  };

  const endCall = (correspondent?: User) => {
    if (correspondent)
      emitEvent({ name: 'cE-call-ended', rooms: [correspondent.id] });

    releaseMediaResources();

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
    setIsOnIncommingCall(false);
    setCorrespondent(undefined);
  };

  const toggleAudio = () => {
    if (!localStreamRef.current) return;

    const enabled = !isAudioOn;
    localStreamRef.current.getAudioTracks()[0].enabled = enabled;
    setIsAudioOn(enabled);
  };

  const toggleVideo = () => {
    if (!localStreamRef.current) return;

    const enabled = !isVideoOn;
    localStreamRef.current.getVideoTracks()[0].enabled = enabled;
    setIsVideoOn(enabled);
  };

  // socket listeners
  async function onCallAccepted(data: CallSDPInfo) {
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
  }

  const onCallEnded = () => endCall();

  async function onCorrespondentIce({ correspondent_id, ice }: IceInfo) {
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
  }

  function onLineBusy() {
    setCallSound({ play: true, profile: 'Line Busy' });
    setCallStatus('Line Busy');
  }

  function onRinging() {
    setCallStatus('Ringing');
  }

  function onIncommingCall(caller: CallSDPInfo) {
    if (isOnCall || isOnIncommingCall)
      return emitEvent({ name: 'cE-call-line busy', rooms: [caller.id] });

    emitEvent({ name: 'cE-call-ringing', rooms: [caller.id] });

    setCallSound({ play: true, profile: 'Incomming Call' });
    setRemoteSdp(caller.sdp);
    setIsOnIncommingCall(true);
    setCorrespondent(caller);
  }

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
    isOnIncommingCall,
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
}
