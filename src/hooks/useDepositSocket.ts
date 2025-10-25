'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocketClient } from '@/lib/socket-client';
import { DepositTransaction } from '@/types/deposit';
import { GetDepositsResponse } from '@/services/depositApiService';

export function useDepositSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocketClient();

    // 신규 입금 감지
    const handleDepositDetected = (data: { deposit: DepositTransaction; timestamp: string }) => {
      const deposit = data.deposit;
      console.log('[Socket] 신규 입금 감지:', deposit.txHash);

      // 모든 deposits 쿼리 업데이트 (필터/페이징 포함)
      queryClient.setQueriesData<GetDepositsResponse>(
        { queryKey: ['deposits'], exact: false },
        (old) => {
          if (!old) return old;

          // 중복 체크
          const exists = old.deposits.find((d) => d.id === deposit.id || d.txHash === deposit.txHash);
          if (exists) return old;

          // 신규 항목 추가 (맨 앞에)
          return {
            deposits: [deposit, ...old.deposits],
            total: old.total + 1,
          };
        }
      );

      // 통계 무효화 (자동 리프레시)
      queryClient.invalidateQueries({ queryKey: ['depositStats'] });
    };

    // 입금 상태 업데이트
    const handleDepositUpdate = (data: { deposit: DepositTransaction; timestamp: string }) => {
      const deposit = data.deposit;
      console.log('[Socket] 입금 업데이트:', deposit.txHash, deposit.status);

      // 모든 deposits 쿼리 업데이트
      queryClient.setQueriesData<GetDepositsResponse>(
        { queryKey: ['deposits'], exact: false },
        (old) => {
          if (!old) return old;

          // 해당 항목 업데이트
          const updatedDeposits = old.deposits.map((d) =>
            d.id === deposit.id || d.txHash === deposit.txHash ? deposit : d
          );

          return {
            ...old,
            deposits: updatedDeposits,
          };
        }
      );

      // 통계 무효화
      queryClient.invalidateQueries({ queryKey: ['depositStats'] });
    };

    // 입금 완료
    const handleDepositCredited = (data: { deposit: DepositTransaction; timestamp: string }) => {
      console.log('[Socket] 입금 완료:', data.deposit.txHash);
      handleDepositUpdate(data); // 업데이트와 동일 로직
    };

    // 이벤트 리스너 등록
    socket.on('deposit:detected', handleDepositDetected);
    socket.on('deposit:updated', handleDepositUpdate);
    socket.on('deposit:credited', handleDepositCredited);

    // 클린업
    return () => {
      socket.off('deposit:detected', handleDepositDetected);
      socket.off('deposit:updated', handleDepositUpdate);
      socket.off('deposit:credited', handleDepositCredited);
    };
  }, [queryClient]);
}
