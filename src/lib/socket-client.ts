import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[Socket] 연결 성공:', socket?.id);

      // 관리자로 인증하여 admin 룸에 조인
      socket?.emit('authenticate', {
        role: 'admin',
        token: null, // TODO: JWT 토큰 추가
      });
    });

    socket.on('authenticated', (response) => {
      console.log('[Socket] 인증 완료:', response);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] 연결 종료:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] 연결 오류:', error.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
