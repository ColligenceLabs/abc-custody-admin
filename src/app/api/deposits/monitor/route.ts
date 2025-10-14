import { NextRequest, NextResponse } from 'next/server';
import {
  getTransactionsByAddress,
  getCurrentBlock,
  hexToDecimal,
  weiToEth,
  calculateConfirmations,
} from '@/utils/quicknode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * 입금 모니터링 API
 * - 사용자의 등록된 ETH 주소에 새 입금이 있는지 확인
 * - 진행 중인 입금의 확인 수 업데이트
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 1. 사용자의 ETH 입금 주소 조회 (depositAddresses 테이블 사용)
    const depositAddressesRes = await fetch(
      `${API_URL}/depositAddresses?userId=${userId}&coin=ETH&isActive=true`
    );
    if (!depositAddressesRes.ok) {
      throw new Error('Failed to fetch deposit addresses');
    }
    const depositAddresses = await depositAddressesRes.json();

    if (depositAddresses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No deposit addresses found',
      });
    }

    // 2. 현재 블록 높이 조회
    const currentBlockHex = await getCurrentBlock();
    const currentBlock = hexToDecimal(currentBlockHex);

    // 3. 각 주소별 트랜잭션 확인 및 신규 입금 감지
    for (const addr of depositAddresses) {
      try {
        const txsResult = await getTransactionsByAddress(addr.address, 1, 10);

        // QuickNode API 응답 구조 확인
        const transactions = txsResult?.paginatedItems || [];

        for (const tx of transactions) {
          // 입금 트랜잭션인지 확인 (toAddress가 우리 주소)
          // QuickNode API 응답: transactionHash, toAddress, fromAddress, blockNumber(string), value(string decimal)
          if (tx.toAddress?.toLowerCase() === addr.address.toLowerCase()) {
            // 이미 DB에 있는 트랜잭션인지 확인
            const existingRes = await fetch(
              `${API_URL}/deposits?txHash=${tx.transactionHash}`
            );
            const existing = await existingRes.json();

            if (existing.length === 0 && tx.value !== '0') {
              // 발신 주소 화이트리스트 검증
              // json-server는 대소문자를 구분하므로 모든 주소를 가져와서 필터링
              const whitelistRes = await fetch(
                `${API_URL}/addresses?userId=${userId}`
              );
              const allAddresses = await whitelistRes.json();

              // 화이트리스트에 등록되어 있고 canDeposit=true인지 확인 (대소문자 무시)
              const isAllowedSender = allAddresses.some(
                (wAddr: any) =>
                  wAddr.address.toLowerCase() === tx.fromAddress.toLowerCase() &&
                  wAddr.permissions?.canDeposit === true
              );

              // 신규 입금 발견 - DB에 저장
              const txBlockNumber = parseInt(tx.blockNumber); // 이미 decimal string
              const confirmations = calculateConfirmations(
                txBlockNumber,
                currentBlock
              );

              // 발신자 검증 결과와 무관하게 컨펌 진행
              let status = 'detected';
              if (confirmations >= 1 && confirmations < 12) {
                status = 'confirming';
              } else if (confirmations >= 12) {
                status = 'confirmed';
              }

              // value는 이미 wei decimal string이므로 그대로 사용
              const ethAmount = (parseInt(tx.value) / 1e18).toFixed(6);

              await fetch(`${API_URL}/deposits`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId,
                  depositAddressId: addr.id,
                  txHash: tx.transactionHash,
                  asset: 'ETH',
                  network: addr.network || 'Sepolia',
                  amount: ethAmount,
                  fromAddress: tx.fromAddress,
                  toAddress: tx.toAddress,
                  status,
                  senderVerified: isAllowedSender,
                  currentConfirmations: confirmations,
                  requiredConfirmations: 12,
                  blockHeight: txBlockNumber,
                  detectedAt: new Date().toISOString(),
                  ...(status === 'confirmed' && {
                    confirmedAt: new Date().toISOString(),
                  }),
                }),
              });

              console.log(
                `새 입금 감지: ${tx.transactionHash} (${ethAmount} ETH) - 발신자 검증: ${isAllowedSender ? '적합' : '부적합'}`
              );
            }
          }
        }
      } catch (error) {
        console.error(`주소 ${addr.address} 트랜잭션 조회 실패:`, error);
        // 다음 주소 계속 처리
      }
    }

    // 4. 진행 중인 입금의 확인 수 업데이트
    const activeRes = await fetch(
      `${API_URL}/deposits?userId=${userId}&status=detected&status=confirming`
    );
    if (activeRes.ok) {
      const activeDeposits = await activeRes.json();

      for (const deposit of activeDeposits) {
        const confirmations = calculateConfirmations(
          deposit.blockHeight,
          currentBlock
        );

        let newStatus = deposit.status;
        if (confirmations >= 1 && confirmations < 12) {
          newStatus = 'confirming';
        } else if (confirmations >= 12) {
          newStatus = 'confirmed';
        }

        // 상태 또는 확인 수가 변경된 경우에만 업데이트
        if (
          newStatus !== deposit.status ||
          confirmations !== deposit.currentConfirmations
        ) {
          await fetch(`${API_URL}/deposits/${deposit.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              currentConfirmations: confirmations,
              status: newStatus,
              ...(newStatus === 'confirmed' &&
                !deposit.confirmedAt && {
                  confirmedAt: new Date().toISOString(),
                }),
            }),
          });

          console.log(
            `입금 업데이트: ${deposit.txHash} - ${confirmations} confirmations (${newStatus})`
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      currentBlock,
      addressCount: depositAddresses.length,
    });
  } catch (error) {
    console.error('입금 모니터링 오류:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
