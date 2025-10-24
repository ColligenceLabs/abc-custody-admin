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
    const handleDepositDetected = (deposit: DepositTransaction) => {
      console.log('[Socket] 신규 입금 감지:', deposit.txHash);

      queryClient.setQueryData<GetDepositsResponse>(
        ['deposits'],
        (old) => {
          if (!old) return old;

          // 중복 체크
          const exists = old.deposits.find((d) => d.txHash === deposit.txHash);
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
    const handleDepositUpdate = (deposit: DepositTransaction) => {
      console.log('[Socket] 입금 업데이트:', deposit.txHash, deposit.status);

      queryClient.setQueryData<GetDepositsResponse>(
        ['deposits'],
        (old) => {
          if (!old) return old;

          // 해당 항목 업데이트
          const updatedDeposits = old.deposits.map((d) =>
            d.txHash === deposit.txHash ? deposit : d
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
    const handleDepositCredited = (deposit: DepositTransaction) => {
      console.log('[Socket] 입금 완료:', deposit.txHash);
      handleDepositUpdate(deposit); // 업데이트와 동일 로직
    };

    // 이벤트 리스너 등록
    socket.on('deposit:detected:admin', handleDepositDetected);
    socket.on('deposit:update:admin', handleDepositUpdate);
    socket.on('deposit:credited:admin', handleDepositCredited);

    // 클린업
    return () => {
      socket.off('deposit:detected:admin', handleDepositDetected);
      socket.off('deposit:update:admin', handleDepositUpdate);
      socket.off('deposit:credited:admin', handleDepositCredited);
    };
  }, [queryClient]);
}
