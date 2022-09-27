const config = {
  iceServersConfig: {
    iceServers: [
      {
        urls: [process.env.NEXT_PUBLIC_STUN_SERVER_HOST],
        username: process.env.NEXT_PUBLIC_TURN_SERVER_USERNAME,
        credential: process.env.NEXT_PUBLIC_TURN_SERVER_PASSWORD,
      },
      {
        urls: [process.env.NEXT_PUBLIC_TURN_SERVER_HOST],
        username: process.env.NEXT_PUBLIC_TURN_SERVER_USERNAME,
        credential: process.env.NEXT_PUBLIC_TURN_SERVER_PASSWORD,
      },
    ],
  },
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
  gdmOpition: {
    video: { cursor: "always" || "motion" || "never" },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
    },
  },
};

export default config;
