// ============================================================================
// Air-gap Signing API 서비스
// ============================================================================
// Task 4.3: Air-gap 통신 시스템
// 용도: QR 코드 기반 오프라인 서명, 다중 서명 관리, 서명 검증
// ============================================================================

import {
  AirGapSigningRequest,
  UnsignedTransaction,
  SignedTransaction,
  SignerInfo,
  SigningStatus,
  SigningRequestType,
} from "@/types/vault";

// ============================================================================
// 통계 인터페이스
// ============================================================================

export interface AirGapStatistics {
  pendingSignatures: {
    count: number;
    totalAmount: string;
  };
  partialSigned: {
    count: number;
    signatures: string; // "3/5 서명 완료"
  };
  completedToday: {
    count: number;
    totalAmount: string;
  };
  expiringSoon: {
    count: number;
    hoursRemaining: number;
  };
}

export interface AirGapFilter {
  status?: SigningStatus[];
  type?: SigningRequestType[];
  signatureProgress?: string[]; // "완전서명대기" | "부분서명완료" | "완료"
  dateRange?: { from: string; to: string };
  searchTerm?: string;
}

export interface GenerateQRRequest {
  requestId: string;
  transactions: UnsignedTransaction[];
}

export interface QRCodeResponse {
  qrCode: string; // Base64 encoded QR image
  rawData: string; // Raw JSON data (for copy/paste)
  expiresAt: string;
  downloadUrl?: string; // Optional: URL to download QR image
}

export interface ScanSignatureRequest {
  requestId: string;
  qrData?: string; // QR 스캔 데이터
  signedTxFile?: File; // 파일 업로드
  signedTxRaw?: string; // Raw paste
}

export interface SignatureVerificationResult {
  isValid: boolean;
  signer: SignerInfo;
  signature: string;
  signedAt: string;
  verificationDetails: {
    publicKeyMatch: boolean;
    signatureValid: boolean;
    transactionMatch: boolean;
  };
  errors?: string[];
}

export interface AddSignatureRequest {
  requestId: string;
  signerId: string;
  signature: string;
  signedTransaction: SignedTransaction;
}

export interface CompleteSigningRequest {
  requestId: string;
  signedTransactions: SignedTransaction[];
}

export interface BroadcastResult {
  transactionId: string;
  txHash: string;
  status: "pending" | "confirmed" | "failed";
  confirmations: number;
}

// ============================================================================
// Mock Database 저장소 키
// ============================================================================

const AIRGAP_STORAGE_KEY = "custody_admin_airgap_requests";

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * LocalStorage에서 Air-gap 요청 로드
 */
function loadAirGapRequests(): AirGapSigningRequest[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(AIRGAP_STORAGE_KEY);
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    // Date 문자열을 Date 객체로 변환
    return parsed.map((req: any) => ({
      ...req,
      createdAt: new Date(req.createdAt),
      expiresAt: new Date(req.expiresAt),
      completedAt: req.completedAt ? new Date(req.completedAt) : undefined,
      signers: req.signers.map((s: any) => ({
        ...s,
        hasSignedAt: s.hasSignedAt ? new Date(s.hasSignedAt) : undefined,
      })),
    }));
  } catch (error) {
    console.error("Failed to parse air-gap requests:", error);
    return [];
  }
}

/**
 * LocalStorage에 Air-gap 요청 저장
 */
function saveAirGapRequests(requests: AirGapSigningRequest[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(AIRGAP_STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Failed to save air-gap requests:", error);
  }
}

/**
 * 남은 시간 계산 (시간)
 */
function calculateRemainingHours(expiresAt: Date): number {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}

/**
 * QR 코드 생성 (Mock - Base64 placeholder)
 */
function generateQRCodeImage(data: string): string {
  // 실제로는 qrcode.react 라이브러리 사용
  // 여기서는 Mock Base64 이미지 반환
  const base64Placeholder =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  return base64Placeholder;
}

/**
 * 서명 검증 (Mock)
 */
function verifySignature(
  publicKey: string,
  signature: string,
  transaction: UnsignedTransaction
): boolean {
  // 실제로는 암호학적 검증 수행
  // Mock: 서명 길이만 체크
  return signature.length > 100;
}

// ============================================================================
// API 함수
// ============================================================================

/**
 * Air-gap 통계 조회
 */
export async function getAirGapStatistics(): Promise<AirGapStatistics> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 데이터가 없으면 자동 초기화
  let requests = loadAirGapRequests();
  if (requests.length === 0) {
    const mockData = generateMockAirGapRequests(10);
    saveAirGapRequests(mockData);
    requests = mockData;
    console.log("✅ Auto-initialized air-gap data:", mockData.length);
  }
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 서명 대기 중 (status: pending 또는 partial)
  const pending = requests.filter(
    (r) => r.status === SigningStatus.PENDING || r.status === SigningStatus.PARTIAL
  );

  // 부분 서명 완료 (status: partial)
  const partialSigned = requests.filter((r) => r.status === SigningStatus.PARTIAL);

  // 오늘 완료된 서명 (status: completed)
  const completedToday = requests.filter(
    (r) =>
      r.status === SigningStatus.COMPLETED &&
      r.completedAt &&
      new Date(r.completedAt) >= todayStart
  );

  // 곧 만료될 서명 (6시간 이내 만료)
  const expiringSoon = requests.filter((r) => {
    const remaining = calculateRemainingHours(r.expiresAt);
    return remaining <= 6 && r.status !== SigningStatus.COMPLETED;
  });

  const sumAmount = (items: AirGapSigningRequest[]) =>
    items
      .reduce(
        (sum, r) =>
          sum +
          r.transactions.reduce((txSum, tx) => txSum + parseFloat(tx.amount), 0),
        0
      )
      .toFixed(4);

  const avgRemaining =
    expiringSoon.length > 0
      ? Math.round(
          expiringSoon.reduce(
            (sum, r) => sum + calculateRemainingHours(r.expiresAt),
            0
          ) / expiringSoon.length
        )
      : 0;

  return {
    pendingSignatures: {
      count: pending.length,
      totalAmount: sumAmount(pending),
    },
    partialSigned: {
      count: partialSigned.length,
      signatures:
        partialSigned.length > 0
          ? `${partialSigned[0].obtainedSignatures}/${partialSigned[0].requiredSignatures} 서명 완료`
          : "0/0",
    },
    completedToday: {
      count: completedToday.length,
      totalAmount: sumAmount(completedToday),
    },
    expiringSoon: {
      count: expiringSoon.length,
      hoursRemaining: avgRemaining,
    },
  };
}

/**
 * Air-gap 서명 대기열 조회
 */
export async function getAirGapQueue(
  filters?: AirGapFilter
): Promise<AirGapSigningRequest[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 데이터가 없으면 자동 초기화
  let requests = loadAirGapRequests();
  if (requests.length === 0) {
    const mockData = generateMockAirGapRequests(10);
    saveAirGapRequests(mockData);
    requests = mockData;
    console.log("✅ Auto-initialized air-gap data for queue:", mockData.length);
  }

  // 필터 적용
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      requests = requests.filter((r) => filters.status!.includes(r.status));
    }

    if (filters.type && filters.type.length > 0) {
      requests = requests.filter((r) => filters.type!.includes(r.type));
    }

    if (filters.signatureProgress && filters.signatureProgress.length > 0) {
      requests = requests.filter((r) => {
        if (filters.signatureProgress!.includes("완전서명대기")) {
          return r.obtainedSignatures === 0;
        }
        if (filters.signatureProgress!.includes("부분서명완료")) {
          return (
            r.obtainedSignatures > 0 &&
            r.obtainedSignatures < r.requiredSignatures
          );
        }
        if (filters.signatureProgress!.includes("완료")) {
          return r.obtainedSignatures >= r.requiredSignatures;
        }
        return true;
      });
    }

    if (filters.dateRange) {
      const from = new Date(filters.dateRange.from);
      const to = new Date(filters.dateRange.to);
      requests = requests.filter((r) => {
        const created = new Date(r.createdAt);
        return created >= from && created <= to;
      });
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      requests = requests.filter(
        (r) =>
          r.id.toLowerCase().includes(term) ||
          r.type.toLowerCase().includes(term) ||
          r.signers.some((s) => s.name.toLowerCase().includes(term))
      );
    }
  }

  // 정렬: 만료 임박 순 → 생성 시간 최신 순
  requests.sort((a, b) => {
    const aRemaining = calculateRemainingHours(a.expiresAt);
    const bRemaining = calculateRemainingHours(b.expiresAt);

    if (aRemaining !== bRemaining) return aRemaining - bRemaining;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return requests;
}

/**
 * Air-gap 서명 요청 상세 조회
 */
export async function getAirGapRequest(
  requestId: string
): Promise<AirGapSigningRequest> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const requests = loadAirGapRequests();
  const request = requests.find((r) => r.id === requestId);

  if (!request) {
    throw new Error("Air-gap request not found");
  }

  return request;
}

/**
 * QR 코드 생성
 */
export async function generateSigningQR(
  request: GenerateQRRequest
): Promise<QRCodeResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const requests = loadAirGapRequests();
  const requestIndex = requests.findIndex((r) => r.id === request.requestId);

  if (requestIndex === -1) {
    throw new Error("Air-gap request not found");
  }

  // QR 데이터 구성
  const qrData = {
    requestId: request.requestId,
    transactions: request.transactions,
    timestamp: new Date().toISOString(),
  };

  const rawData = JSON.stringify(qrData, null, 2);
  const qrCode = generateQRCodeImage(rawData);

  // QR 코드 저장
  requests[requestIndex].qrCode = qrCode;
  saveAirGapRequests(requests);

  return {
    qrCode,
    rawData,
    expiresAt: requests[requestIndex].expiresAt.toISOString(),
    downloadUrl: undefined, // 추후 구현
  };
}

/**
 * 서명 스캔 및 검증
 */
export async function scanAndVerifySignature(
  request: ScanSignatureRequest
): Promise<SignatureVerificationResult> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const requests = loadAirGapRequests();
  const signingRequest = requests.find((r) => r.id === request.requestId);

  if (!signingRequest) {
    throw new Error("Air-gap request not found");
  }

  // 서명 데이터 파싱 (QR, 파일, Raw 중 하나)
  let signedData: any;
  try {
    if (request.qrData) {
      signedData = JSON.parse(request.qrData);
    } else if (request.signedTxRaw) {
      signedData = JSON.parse(request.signedTxRaw);
    } else if (request.signedTxFile) {
      // 파일 처리는 클라이언트에서 먼저 읽어야 함
      throw new Error("File upload not yet implemented");
    } else {
      throw new Error("No signature data provided");
    }
  } catch (error) {
    return {
      isValid: false,
      signer: signingRequest.signers[0],
      signature: "",
      signedAt: new Date().toISOString(),
      verificationDetails: {
        publicKeyMatch: false,
        signatureValid: false,
        transactionMatch: false,
      },
      errors: ["Invalid signature data format"],
    };
  }

  // 서명자 찾기 (Mock: 첫 번째 미서명자)
  const signer = signingRequest.signers.find((s) => !s.hasSignedAt);

  if (!signer) {
    return {
      isValid: false,
      signer: signingRequest.signers[0],
      signature: "",
      signedAt: new Date().toISOString(),
      verificationDetails: {
        publicKeyMatch: false,
        signatureValid: false,
        transactionMatch: false,
      },
      errors: ["All required signatures already obtained"],
    };
  }

  // 서명 검증
  const signature = signedData.signature || "";
  const publicKeyMatch = signedData.publicKey === signer.publicKey;
  const signatureValid = verifySignature(
    signer.publicKey,
    signature,
    signingRequest.transactions[0]
  );
  const transactionMatch = signedData.transactionId === signingRequest.transactions[0].id;

  const isValid = publicKeyMatch && signatureValid && transactionMatch;

  return {
    isValid,
    signer,
    signature,
    signedAt: new Date().toISOString(),
    verificationDetails: {
      publicKeyMatch,
      signatureValid,
      transactionMatch,
    },
    errors: isValid
      ? undefined
      : [
          !publicKeyMatch && "Public key mismatch",
          !signatureValid && "Invalid signature",
          !transactionMatch && "Transaction mismatch",
        ].filter(Boolean) as string[],
  };
}

/**
 * 서명 추가
 */
export async function addSignature(
  request: AddSignatureRequest,
  adminId: string,
  adminName: string
): Promise<AirGapSigningRequest> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const requests = loadAirGapRequests();
  const requestIndex = requests.findIndex((r) => r.id === request.requestId);

  if (requestIndex === -1) {
    throw new Error("Air-gap request not found");
  }

  const signingRequest = requests[requestIndex];

  // 서명자 업데이트
  const signerIndex = signingRequest.signers.findIndex(
    (s) => s.id === request.signerId
  );

  if (signerIndex === -1) {
    throw new Error("Signer not found");
  }

  signingRequest.signers[signerIndex].hasSignedAt = new Date();
  signingRequest.signers[signerIndex].signature = request.signature;
  signingRequest.obtainedSignatures += 1;

  // 상태 업데이트
  if (signingRequest.obtainedSignatures >= signingRequest.requiredSignatures) {
    signingRequest.status = SigningStatus.COMPLETED;
    signingRequest.completedAt = new Date();
  } else {
    signingRequest.status = SigningStatus.PARTIAL;
  }

  requests[requestIndex] = signingRequest;
  saveAirGapRequests(requests);

  console.log(
    `✅ Signature added: ${request.signerId} for ${request.requestId} by ${adminName}`
  );

  return signingRequest;
}

/**
 * Air-gap 서명 완료 및 브로드캐스트
 */
export async function completeAirGapSigning(
  request: CompleteSigningRequest,
  adminId: string,
  adminName: string
): Promise<{
  success: boolean;
  broadcastResults: BroadcastResult[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const requests = loadAirGapRequests();
  const requestIndex = requests.findIndex((r) => r.id === request.requestId);

  if (requestIndex === -1) {
    throw new Error("Air-gap request not found");
  }

  const signingRequest = requests[requestIndex];

  // 서명 정족수 확인
  if (signingRequest.obtainedSignatures < signingRequest.requiredSignatures) {
    throw new Error(
      `Insufficient signatures: ${signingRequest.obtainedSignatures}/${signingRequest.requiredSignatures}`
    );
  }

  // Mock 브로드캐스트 결과
  const broadcastResults: BroadcastResult[] = request.signedTransactions.map(
    (tx) => ({
      transactionId: tx.id,
      txHash: `0x${Math.random().toString(36).substr(2, 64)}`,
      status: "pending" as const,
      confirmations: 0,
    })
  );

  // 상태 업데이트
  signingRequest.status = SigningStatus.COMPLETED;
  signingRequest.completedAt = new Date();

  requests[requestIndex] = signingRequest;
  saveAirGapRequests(requests);

  console.log(
    `✅ Air-gap signing completed: ${request.requestId} by ${adminName}`
  );

  return {
    success: true,
    broadcastResults,
  };
}

/**
 * Air-gap 서명 요청 취소
 */
export async function cancelAirGapRequest(
  requestId: string,
  reason: string,
  adminId: string,
  adminName: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const requests = loadAirGapRequests();
  const requestIndex = requests.findIndex((r) => r.id === requestId);

  if (requestIndex === -1) {
    throw new Error("Air-gap request not found");
  }

  requests[requestIndex].status = SigningStatus.CANCELLED;
  requests[requestIndex].metadata = {
    ...requests[requestIndex].metadata,
    cancelledBy: { adminId, adminName },
    cancelledAt: new Date().toISOString(),
    cancelReason: reason,
  };

  saveAirGapRequests(requests);

  console.log(`⛔ Air-gap request cancelled: ${requestId} by ${adminName}`);
}

/**
 * 만료된 요청 확인
 */
export async function checkExpiredRequests(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const requests = loadAirGapRequests();
  const now = new Date();

  const expiredIds: string[] = [];

  requests.forEach((request, index) => {
    if (
      request.status !== SigningStatus.COMPLETED &&
      request.status !== SigningStatus.CANCELLED &&
      new Date(request.expiresAt) < now
    ) {
      requests[index].status = SigningStatus.EXPIRED;
      expiredIds.push(request.id);
    }
  });

  if (expiredIds.length > 0) {
    saveAirGapRequests(requests);
    console.log(`⏰ Expired air-gap requests: ${expiredIds.join(", ")}`);
  }

  return expiredIds;
}

// ============================================================================
// Mock 데이터 생성
// ============================================================================

/**
 * Mock Air-gap 요청 데이터 생성
 */
export function generateMockAirGapRequests(
  count: number = 10
): AirGapSigningRequest[] {
  const requests: AirGapSigningRequest[] = [];

  const signers: SignerInfo[] = [
    { id: "signer_001", name: "김철수", publicKey: "0x1234abcd5678ef01" },
    { id: "signer_002", name: "이영희", publicKey: "0x2345bcde6789f012" },
    { id: "signer_003", name: "박민수", publicKey: "0x3456cdef789a0123" },
    { id: "signer_004", name: "최지훈", publicKey: "0x4567def08ab1234" },
    { id: "signer_005", name: "정수진", publicKey: "0x5678ef019bc2345" },
  ];

  const types = [
    SigningRequestType.REBALANCING,
    SigningRequestType.EMERGENCY_WITHDRAWAL,
    SigningRequestType.MAINTENANCE,
  ];

  const assets = ["BTC", "ETH", "USDT"];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];

    const requiredSignatures =
      type === SigningRequestType.EMERGENCY_WITHDRAWAL ? 3 : 2;
    const obtainedSignatures = Math.floor(
      Math.random() * (requiredSignatures + 1)
    );

    let status: SigningStatus;
    if (obtainedSignatures === 0) status = SigningStatus.PENDING;
    else if (obtainedSignatures < requiredSignatures)
      status = SigningStatus.PARTIAL;
    else status = SigningStatus.COMPLETED;

    const createdAt = new Date(
      Date.now() - Math.random() * 24 * 60 * 60 * 1000
    );
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    // 서명자 목록 (필요 서명 수 + 2명 여유)
    const selectedSigners = signers.slice(0, requiredSignatures + 2).map((s, idx) => ({
      ...s,
      hasSignedAt: idx < obtainedSignatures ? new Date() : undefined,
      signature:
        idx < obtainedSignatures
          ? `0x${Math.random().toString(36).substr(2, 128)}`
          : undefined,
    }));

    requests.push({
      id: `airgap_${Date.now()}_${i}`,
      type,
      rebalancingId:
        type === SigningRequestType.REBALANCING ? `rb_${i}` : undefined,
      transactions: [
        {
          id: `tx_${i}`,
          assetSymbol: asset,
          amount: (Math.random() * 10).toFixed(4),
          fromAddress: "bc1q...cold...wallet",
          toAddress: "bc1q...hot...wallet",
          rawTransaction: `0x${Math.random().toString(36).substr(2, 128)}`,
          estimatedFee: "0.0001",
        },
      ],
      requiredSignatures,
      obtainedSignatures,
      signers: selectedSigners,
      status,
      createdAt,
      expiresAt,
      completedAt: status === SigningStatus.COMPLETED ? new Date() : undefined,
      qrCode:
        status === SigningStatus.PENDING ? generateQRCodeImage("mock") : undefined,
      metadata: {
        priority:
          type === SigningRequestType.EMERGENCY_WITHDRAWAL ? "emergency" : "normal",
        reason:
          type === SigningRequestType.EMERGENCY_WITHDRAWAL
            ? "Hot Wallet 긴급 보충"
            : "일일 리밸런싱",
      },
    });
  }

  return requests;
}

/**
 * Mock 데이터 초기화
 */
export function initializeMockAirGapRequests(): void {
  const existing = loadAirGapRequests();
  if (existing.length === 0) {
    const mockData = generateMockAirGapRequests(10);
    saveAirGapRequests(mockData);
    console.log("✅ Mock air-gap data initialized:", mockData.length);
  }
}

/**
 * Mock 데이터 리셋
 */
export function resetAirGapDatabase(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AIRGAP_STORAGE_KEY);
  console.log("✅ Air-gap database reset");
}
