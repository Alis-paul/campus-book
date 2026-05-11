import { Server, Socket } from 'socket.io';

export const initSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join', (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
