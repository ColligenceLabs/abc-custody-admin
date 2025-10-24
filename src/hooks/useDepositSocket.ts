import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// WebSocket URL (Socket.IO는 루트 경로에서 실행되므로 /api 없이)
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface DepositUpdateEvent {
  deposit: any;
  timestamp: string;
}

interface UseDepositSocketOptions {
  userId: string | null;
  onDepositDetected?: (deposit: any) => void;
  onDepositUpdate?: (deposit: any) => void;
  onDepositCredited?: (deposit: any) => void;
}

export function useDepositSocket({
  userId,
  onDepositDetected,
  onDepositUpdate,
  onDepositCredited
}: UseDepositSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 최신 콜백을 항상 참조하기 위한 ref
  const onDepositDetectedRef = useRef(onDepositDetected);
  const onDepositUpdateRef = useRef(onDepositUpdate);
  const onDepositCreditedRef = useRef(onDepositCredited);

  // 콜백이 변경될 때마다 ref 업데이트
  useEffect(() => {
    onDepositDetectedRef.current = onDepositDetected;
    onDepositUpdateRef.current = onDepositUpdate;
    onDepositCreditedRef.current = onDepositCredited;
  }, [onDepositDetected, onDepositUpdate, onDepositCredited]);

  useEffect(() => {
    // userId가 없으면 연결하지 않음
    if (!userId) {
      return;
    }

    // Socket.IO 클라이언트 연결
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // 연결 성공
    socket.on('connect', () => {
      console.log('입금 WebSocket 연결됨:', socket.id);
      setIsConnected(true);
      setError(null);

      // 사용자 인증 및 룸 조인
      const token = localStorage.getItem('token');
      socket.emit('authenticate', { userId, token });
    });

    // 인증 응답
    socket.on('authenticated', (response: { success: boolean; message: string; roomName?: string }) => {
      if (response.success) {
        console.log('입금 WebSocket 인증 성공:', response.roomName);
      } else {
        console.error('입금 WebSocket 인증 실패:', response.message);
        setError(response.message);
      }
    });

    // 신규 입금 감지 이벤트 수신
    socket.on('deposit:detected', (data: DepositUpdateEvent) => {
      console.log('신규 입금 감지:', data);
      if (onDepositDetectedRef.current) {
        onDepositDetectedRef.current(data.deposit);
      }
    });

    // 입금 상태 업데이트 이벤트 수신
    socket.on('deposit:updated', (data: DepositUpdateEvent) => {
      console.log('입금 업데이트 수신:', data);
      if (onDepositUpdateRef.current) {
        onDepositUpdateRef.current(data.deposit);
      }
    });

    // 입금 완료 이벤트 수신
    socket.on('deposit:credited', (data: DepositUpdateEvent) => {
      console.log('입금 완료:', data);
      if (onDepositCreditedRef.current) {
        onDepositCreditedRef.current(data.deposit);
      }
    });

    // 연결 해제
    socket.on('disconnect', (reason: string) => {
      console.log('입금 WebSocket 연결 해제:', reason);
      setIsConnected(false);
    });

    // 재연결 시도
    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('입금 WebSocket 재연결 시도:', attemptNumber);
    });

    // 재연결 성공
    socket.on('reconnect', (attemptNumber: number) => {
      console.log('입금 WebSocket 재연결 성공:', attemptNumber);
      setIsConnected(true);
      setError(null);

      // 재연결 후 다시 인증
      const token = localStorage.getItem('token');
      socket.emit('authenticate', { userId, token });
    });

    // 연결 에러
    socket.on('connect_error', (err: Error) => {
      console.error('입금 WebSocket 연결 에러:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // 정리 함수
    return () => {
      console.log('입금 WebSocket 연결 정리');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]); // userId가 변경될 때만 재연결

  return {
    socket: socketRef.current,
    isConnected,
    error,
  };
}
