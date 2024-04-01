export const RTCIceServers = [
  {
    urls: import.meta.env.VITE_STUN_SERVER_HOST!,
  },
  {
    urls: import.meta.env.VITE_TURN_SERVER_HOST!,
    username: import.meta.env.VITE_TURN_SERVER_USERNAME!,
    credential: import.meta.env.VITE_TURN_SERVER_PASSWORD!,
  },
];
