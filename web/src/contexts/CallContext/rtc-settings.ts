export { RTC_ICE_SERVERS, MEDIA_CONSTRAINTS };

const stunServerHost = import.meta.env.VITE_STUN_SERVER_HOST!,
  turnServerHost = import.meta.env.VITE_TURN_SERVER_HOST!;

const RTC_ICE_SERVERS =
  stunServerHost && turnServerHost
    ? [
        {
          urls: import.meta.env.VITE_STUN_SERVER_HOST!,
        },
        {
          urls: import.meta.env.VITE_TURN_SERVER_HOST!,
          username: import.meta.env.VITE_TURN_SERVER_USERNAME!,
          credential: import.meta.env.VITE_TURN_SERVER_PASSWORD!,
        },
      ]
    : [];

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
