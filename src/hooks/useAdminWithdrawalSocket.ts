import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// WebSocket URL (Socket.IO는 루트 경로에서 실행되므로 /api 없이)
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

interface WithdrawalUpdateEvent {
  withdrawal: any;
  timestamp: string;
}

interface UseAdminWithdrawalSocketOptions {
  onWithdrawalUpdate?: (withdrawal: any) => void;
}

export function useAdminWithdrawalSocket({ onWithdrawalUpdate }: UseAdminWithdrawalSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 최신 콜백을 항상 참조하기 위한 ref
  const onWithdrawalUpdateRef = useRef(onWithdrawalUpdate);

  // onWithdrawalUpdate가 변경될 때마다 ref 업데이트
  useEffect(() => {
    onWithdrawalUpdateRef.current = onWithdrawalUpdate;
  }, [onWithdrawalUpdate]);

  useEffect(() => {
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
      console.log('관리자 WebSocket 연결됨:', socket.id);
      setIsConnected(true);
      setError(null);

      // 관리자 인증 및 admin 룸 조인
      const token = localStorage.getItem('token');
      socket.emit('authenticate', { role: 'admin', token });
    });

    // 인증 응답
    socket.on('authenticated', (response: { success: boolean; message: string; roomName?: string }) => {
      if (response.success) {
        console.log('관리자 WebSocket 인증 성공:', response.roomName);
      } else {
        console.error('관리자 WebSocket 인증 실패:', response.message);
        setError(response.message);
      }
    });

    // 출금 업데이트 이벤트 수신
    socket.on('withdrawal:updated', (data: WithdrawalUpdateEvent) => {
      console.log('관리자 출금 업데이트 수신:', data);
      if (onWithdrawalUpdateRef.current) {
        onWithdrawalUpdateRef.current(data.withdrawal);
      }
    });

    // 연결 해제
    socket.on('disconnect', (reason: string) => {
      console.log('관리자 WebSocket 연결 해제:', reason);
      setIsConnected(false);
    });

    // 재연결 시도
    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('관리자 WebSocket 재연결 시도:', attemptNumber);
    });

    // 재연결 성공
    socket.on('reconnect', (attemptNumber: number) => {
      console.log('관리자 WebSocket 재연결 성공:', attemptNumber);
      setIsConnected(true);
      setError(null);

      // 재연결 후 다시 인증
      const token = localStorage.getItem('token');
      socket.emit('authenticate', { role: 'admin', token });
    });

    // 연결 에러
    socket.on('connect_error', (err: Error) => {
      console.error('관리자 WebSocket 연결 에러:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // 정리 함수
    return () => {
      console.log('관리자 WebSocket 연결 정리');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // 빈 배열 - 컴포넌트 마운트 시 1번만 실행

  return {
    socket: socketRef.current,
    isConnected,
    error,
  };
}
