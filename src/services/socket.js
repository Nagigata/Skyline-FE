import { io } from "socket.io-client";

export const socket = io("https://skn7vgp9-10005.asse.devtunnels.ms", {
  autoConnect: true,
  transports: ["websocket"],
});
