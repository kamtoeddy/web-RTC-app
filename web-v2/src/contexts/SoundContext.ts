import { createContext, useEffect, useState } from "react";

const profiles = {
  default: "/audio/on-hold-ringtone-1361.wav",
  "Incommig Call": "/audio/waiting-ringtone-1354.wav",
  "Outgoing Call": "/audio/UKphoneringing.mp3",
  "Line Busy": "/audio/Busysignal.mp3",
};

export const SoundContext = createContext();

const SoundContextProvider = ({ children }) => {
  const [audio] = useState(new Audio());
  const [callSound, set_CallSound] = useState({
    play: false,
    profile: "",
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
    callSound.play ? playSound(callSound.url) : pauseSound();
  }, [callSound]);

  const getSoundByProfile = ({ profile = "" }) => {
    return profiles[profile] ?? profiles.default;
  };

  const setCallSound = ({ play = false, profile = "" } = { play: false }) => {
    const _callSound = { play };
    if (play) _callSound.url = getSoundByProfile({ profile });

    set_CallSound(_callSound);
  };

  const playSound = (url) => {
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