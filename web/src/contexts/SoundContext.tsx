import { createContext, useContext, useEffect, useState } from "react";

const profiles = {
  default: "/audio/on-hold-ringtone-1361.wav",
  "Incomming Call": "/audio/waiting-ringtone-1354.wav",
  "Outgoing Call": "/audio/UKphoneringing.mp3",
  "Line Busy": "/audio/Busysignal.mp3",
};

type SoundProfileType = keyof typeof profiles;

type CallSoundType = {
  play?: boolean;
  profile?: SoundProfileType;
  url?: string;
};

type SoundCtxType = {
  callSound: CallSoundType;
  playSound: (url: string) => void;
  pauseSound: () => void;
  setCallSound: (dt?: CallSoundType) => void;
};

const SoundContext = createContext<SoundCtxType>({} as SoundCtxType);

const SoundContextProvider = ({ children }: any) => {
  const [audio] = useState(new Audio());
  const [callSound, set_CallSound] = useState<CallSoundType>({
    play: false,
    profile: "default",
    url: profiles.default,
  });

  const onSoundEnded = () => audio.play();

  useEffect(() => {
    if (!audio) return;

    audio.addEventListener("ended", onSoundEnded);

    return () => {
      audio.removeEventListener("ended", onSoundEnded);
    };
  }, [audio]);

  useEffect(() => {
    callSound.play ? playSound(callSound.url as string) : pauseSound();
  }, [callSound]);

  const getSoundByProfile = (profile: SoundProfileType = "default") => {
    return profiles[profile];
  };

  const setCallSound = (
    { play = false, profile = "default" }: CallSoundType = { play: false }
  ) => {
    const _callSound: CallSoundType = { play };
    if (play) _callSound.url = getSoundByProfile(profile);

    set_CallSound(_callSound);
  };

  const playSound = (url: string) => {
    audio.src = url;
    audio?.play();
  };

  const pauseSound = () => audio?.pause();

  const context = { callSound, playSound, pauseSound, setCallSound };

  return (
    <SoundContext.Provider value={context}>{children}</SoundContext.Provider>
  );
};

export default SoundContextProvider;

export const useSoundCTX = () => useContext(SoundContext);
