import { io } from 'socket.io-client';

const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const createSocket = (token) => {
  if (!token) {
    return null;
  }

  return io(socketURL, {
    auth: {
      token,
    },
    transports: ['websocket'],
  });
};
