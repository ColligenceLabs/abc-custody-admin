/**
 * QuickNode Sepolia RPC API 유틸리티
 * Token and NFT API v2 Bundle 포함
 */

const QUICKNODE_URL = process.env.NEXT_PUBLIC_QUICKNODE_SEPOLIA_URL!;

interface RPCRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

interface RPCResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * JSON-RPC 호출 공통 함수
 */
async function rpcCall(method: string, params: any[] = []): Promise<any> {
  const request: RPCRequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: 1,
  };

  try {
    const response = await fetch(QUICKNODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: RPCResponse = await response.json();

    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    return data.result;
  } catch (error) {
    console.error(`RPC call failed for method ${method}:`, error);
    throw error;
  }
}

/**
 * 현재 블록 높이 조회
 * @returns 현재 블록 번호 (hex string)
 */
export async function getCurrentBlock(): Promise<string> {
  return await rpcCall('eth_blockNumber', []);
}

/**
 * 특정 주소의 트랜잭션 조회 (QuickNode 전용 메소드)
 * Token and NFT API v2 Bundle 필요
 * @param address - 이더리움 주소
 * @param page - 페이지 번호 (기본값: 1)
 * @param perPage - 페이지당 결과 수 (기본값: 100)
 * @returns 트랜잭션 목록
 */
export async function getTransactionsByAddress(
  address: string,
  page: number = 1,
  perPage: number = 100
): Promise<any> {
  return await rpcCall('qn_getTransactionsByAddress', [
    {
      address,
      page,
      perPage,
    },
  ]);
}

/**
 * 트랜잭션 영수증 조회
 * @param txHash - 트랜잭션 해시
 * @returns 트랜잭션 영수증
 */
export async function getTransactionReceipt(txHash: string): Promise<any> {
  return await rpcCall('eth_getTransactionReceipt', [txHash]);
}

/**
 * 트랜잭션 상세 조회
 * @param txHash - 트랜잭션 해시
 * @returns 트랜잭션 상세 정보
 */
export async function getTransactionByHash(txHash: string): Promise<any> {
  return await rpcCall('eth_getTransactionByHash', [txHash]);
}

/**
 * 주소의 잔액 조회
 * @param address - 이더리움 주소
 * @param blockTag - 블록 태그 (기본값: 'latest')
 * @returns 잔액 (wei, hex string)
 */
export async function getBalance(
  address: string,
  blockTag: string = 'latest'
): Promise<string> {
  return await rpcCall('eth_getBalance', [address, blockTag]);
}

/**
 * 확인 수 계산
 * @param txBlockNumber - 트랜잭션 블록 번호
 * @param currentBlock - 현재 블록 번호
 * @returns 확인 수
 */
export function calculateConfirmations(
  txBlockNumber: number,
  currentBlock: number
): number {
  return Math.max(0, currentBlock - txBlockNumber);
}

/**
 * Wei를 ETH로 변환
 * @param wei - Wei 금액 (hex string 또는 number)
 * @returns ETH 금액 (소수점 6자리)
 */
export function weiToEth(wei: string | number): string {
  const weiValue = typeof wei === 'string' ? parseInt(wei, 16) : wei;
  return (weiValue / 1e18).toFixed(6);
}

/**
 * Hex string을 decimal number로 변환
 * @param hex - Hex string (예: '0x1a')
 * @returns Decimal number
 */
export function hexToDecimal(hex: string): number {
  return parseInt(hex, 16);
}
