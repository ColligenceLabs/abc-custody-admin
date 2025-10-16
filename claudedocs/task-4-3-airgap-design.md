# Task 4.3: Air-gap 통신 시스템 설계

## 📋 설계 개요

### 목적
Cold Wallet과의 안전한 오프라인 서명 시스템 구축

### 핵심 요구사항
- QR 코드 기반 트랜잭션 전송/수신
- 다중 서명 지원 (2-of-3, 3-of-5)
- 서명 상태 실시간 모니터링
- 서명 검증 및 감사 로깅

---

## 🏗️ 시스템 아키텍처

### 1. 워크플로우

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  온라인 시스템   │         │  Air-gap 장치     │         │   블록체인       │
│  (관리자 웹)    │         │  (오프라인 서명)  │         │   네트워크       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        │ 1. 서명 요청 생성           │                            │
        │ - TX 데이터 준비            │                            │
        │ - QR 코드 생성              │                            │
        ├─────────────────────────>  │                            │
        │                            │                            │
        │                            │ 2. 서명 수행               │
        │                            │ - QR 스캔                  │
        │                            │ - 오프라인 서명             │
        │                            │ - 서명된 TX QR 생성        │
        │  <─────────────────────────┤                            │
        │                            │                            │
        │ 3. 서명 검증                │                            │
        │ - QR 스캔                   │                            │
        │ - 서명 유효성 검증          │                            │
        │ - 다중 서명 확인            │                            │
        │                            │                            │
        │ 4. 브로드캐스트             │                            │
        ├───────────────────────────────────────────────────────> │
        │                            │                            │
        │                            │                 5. 컨펌 추적
        │  <─────────────────────────────────────────────────────┤
        │                            │                            │
```

### 2. 보안 모델

#### Air-gap 보안 원칙
1. **물리적 격리**: 네트워크 완전 차단
2. **단방향 데이터 전송**: QR 코드만 사용
3. **서명 키 분리**: Cold Wallet 전용 Private Key
4. **다중 서명 요구**: 최소 2명 이상 승인
5. **타임아웃 설정**: 서명 요청 만료 시간

---

## 📊 데이터 구조 (이미 구현됨)

### AirGapSigningRequest (vault.ts)
```typescript
export interface AirGapSigningRequest {
  id: string;
  type: SigningRequestType;            // rebalancing | emergency_withdrawal | maintenance
  rebalancingId?: string;
  transactions: UnsignedTransaction[];
  requiredSignatures: number;          // 필요한 서명 수 (2 or 3)
  obtainedSignatures: number;          // 현재 서명 수
  signers: SignerInfo[];               // 서명자 정보
  status: SigningStatus;               // pending | partial | completed | expired | cancelled
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  qrCode?: string;                     // Base64 encoded QR code
  metadata: Record<string, any>;
}

export interface UnsignedTransaction {
  id: string;
  assetSymbol: string;
  amount: string;
  fromAddress: string;                 // Cold Wallet 주소
  toAddress: string;                   // Hot Wallet 주소
  rawTransaction: string;              // Unsigned raw TX
  estimatedFee: string;
}

export interface SignedTransaction {
  id: string;
  unsignedTransaction: UnsignedTransaction;
  signature: string;
  signedRawTransaction: string;
  signedBy: string;                    // 서명자 ID
  signedAt: string;
}

export interface SignerInfo {
  id: string;
  name: string;
  publicKey: string;
  hasSignedAt?: Date;
  signature?: string;
}
```

---

## 🎨 UI 구현 계획

### 페이지: `/admin/withdrawals/airgap`

#### 1. 상단 통계 카드 (4개)

```typescript
interface AirGapStatistics {
  pendingSignatures: {
    count: number;
    totalAmount: string;
  };
  partialSigned: {
    count: number;
    signatures: string;  // "3/5 서명 완료"
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
```

**통계 카드 레이아웃:**
```
┌────────────────┬────────────────┬────────────────┬────────────────┐
│  서명 대기      │  부분 서명      │  오늘 완료      │  곧 만료       │
│  2건           │  3건           │  5건           │  1건           │
│  ₩5억          │  4/5 서명 완료 │  ₩12억         │  2시간 남음    │
└────────────────┴────────────────┴────────────────┴────────────────┘
```

#### 2. 필터 및 검색

```typescript
interface AirGapFilter {
  status: SigningStatus[];              // pending | partial | completed | expired
  type: SigningRequestType[];           // rebalancing | emergency_withdrawal
  signatureProgress: string[];          // "완전서명대기" | "부분서명완료" | "완료"
  dateRange?: { from: string; to: string };
  searchTerm?: string;                  // 회원사명, TX ID, 서명자명
}
```

**필터 UI:**
```
┌───────────────────────────────────────────────────────────────────┐
│ 상태: [●전체] [○대기] [○부분서명] [○완료] [○만료]                 │
│ 유형: [●전체] [○리밸런싱] [○긴급출금] [○유지보수]                 │
│ 검색: [_________________________________________] [🔍 검색]        │
└───────────────────────────────────────────────────────────────────┘
```

#### 3. 서명 대기열 테이블

**테이블 컬럼:**
1. **요청 ID** - `req_xxx` (복사 가능)
2. **유형** - 리밸런싱 | 긴급출금 | 유지보수 (배지)
3. **자산/금액** - BTC 1.5, ETH 10.0 등
4. **서명 진행률** - Progress Bar (2/3 완료)
5. **서명자** - 아바타 3개 (완료/대기 표시)
6. **만료 시간** - "2시간 30분 남음" (긴급: 빨간색)
7. **상태** - 대기/부분/완료/만료 (색상 구분)
8. **작업** - [QR 생성] [서명 스캔] [상세]

**Progress Bar 예시:**
```
서명 진행률: ████████░░ 2/3 (66%)
          ✓김철수  ✓이영희  ○박민수
```

#### 4. QR 코드 생성 모달

**모달 구성:**
```
┌─────────────────────────────────────────────────────────────┐
│  Air-gap 서명 요청 QR 코드                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    ▄▄▄▄▄▄▄  ▄  ▄▄▄▄▄▄▄                      │
│                    █ ▄▄▄ █ ▄█▀ █ ▄▄▄ █                      │
│                    █ ███ █ █▄▄ █ ███ █                      │
│                    █▄▄▄▄▄█ ▄ █ █▄▄▄▄▄█                      │
│                    ▄▄▄ ▄▄▄▄█▀▀ ▄▄▄▄ ▄                       │
│                    ...QR CODE...                             │
│                                                              │
│  요청 ID: req_20250113_001                                   │
│  유형: Cold → Hot 리밸런싱                                    │
│  자산: BTC 1.5                                               │
│  금액: ₩1,500,000,000                                        │
│  필요 서명: 3/5                                              │
│  만료: 2025-01-13 18:00 (23시간 30분 남음)                   │
│                                                              │
│  ⚠️ 주의사항:                                                │
│  - Air-gap 장치로 QR 코드를 스캔하세요                        │
│  - 네트워크에 연결되지 않은 장치만 사용하세요                 │
│  - 서명 후 다시 이 페이지로 돌아와 "서명 스캔" 버튼을 누르세요│
│                                                              │
│  [💾 QR 이미지 저장]  [🖨️ 인쇄]  [📋 Raw Data 복사]  [닫기]  │
└─────────────────────────────────────────────────────────────┘
```

#### 5. 서명 스캔 모달

**모달 구성:**
```
┌─────────────────────────────────────────────────────────────┐
│  서명된 트랜잭션 스캔                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Air-gap 장치에서 생성된 서명 QR 코드를 스캔하세요            │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │                                                   │      │
│  │              📷 카메라 활성화                      │      │
│  │                                                   │      │
│  │          QR 코드를 카메라에 비춰주세요             │      │
│  │                                                   │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  또는                                                        │
│                                                              │
│  [📁 서명 파일 업로드] [📋 Paste Signed TX]                 │
│                                                              │
│  ✓ 서명 검증 중...                                          │
│  ✓ 서명자: 김철수 (pubkey: 0x123...)                        │
│  ✓ 서명 시간: 2025-01-13 15:30:45                           │
│  ✓ 서명 유효성: 확인됨                                      │
│                                                              │
│  진행률: ████████░░ 2/3 (66%)                               │
│  ✓ 김철수 (15:30)  ✓ 이영희 (15:25)  ○ 박민수 (대기중)      │
│                                                              │
│  [서명 저장]  [취소]                                         │
└─────────────────────────────────────────────────────────────┘
```

#### 6. 상세 정보 모달 (3개 탭)

**탭 1: 트랜잭션 정보**
```
┌─────────────────────────────────────────────────────────────┐
│  [트랜잭션 정보] [서명 현황] [감사 로그]                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  요청 ID: req_20250113_001                                   │
│  유형: 리밸런싱 (Cold → Hot)                                 │
│  생성 시간: 2025-01-13 14:00:00                             │
│  만료 시간: 2025-01-13 18:00:00 (23시간 30분 남음)          │
│  우선순위: 긴급                                              │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                              │
│  트랜잭션 상세                                               │
│                                                              │
│  자산: BTC (Bitcoin)                                         │
│  금액: 1.5 BTC (₩1,500,000,000)                             │
│  From: bc1q...cold...wallet (Cold Wallet)                   │
│  To: bc1q...hot...wallet (Hot Wallet)                       │
│  수수료: 0.0001 BTC (₩100,000)                              │
│  순 금액: 1.4999 BTC (₩1,499,900,000)                       │
│                                                              │
│  Raw Transaction (Unsigned):                                 │
│  ┌────────────────────────────────────────────────┐        │
│  │ 0100000001abcdef...                             │        │
│  └────────────────────────────────────────────────┘        │
│  [📋 복사]                                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**탭 2: 서명 현황**
```
┌─────────────────────────────────────────────────────────────┐
│  [트랜잭션 정보] [서명 현황] [감사 로그]                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  필요 서명: 3/5 (60% 정족수)                                 │
│  현재 서명: 2/3 (66%)                                        │
│  상태: 부분 서명 완료                                        │
│                                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                              │
│  서명자 목록                                                 │
│                                                              │
│  ✓ 김철수 (Signer 1)                                        │
│    Public Key: 0x1234...abcd                                │
│    서명 시간: 2025-01-13 15:30:45                           │
│    Signature: 0x5678...ef01                                 │
│    상태: 검증 완료                                           │
│                                                              │
│  ✓ 이영희 (Signer 2)                                        │
│    Public Key: 0x2345...bcde                                │
│    서명 시간: 2025-01-13 15:25:30                           │
│    Signature: 0x6789...f012                                 │
│    상태: 검증 완료                                           │
│                                                              │
│  ○ 박민수 (Signer 3) - 대기 중                              │
│    Public Key: 0x3456...cdef                                │
│    서명 시간: -                                              │
│    마지막 알림: 2025-01-13 15:35:00                         │
│    [🔔 알림 재발송]                                          │
│                                                              │
│  ○ 최지훈 (Signer 4) - 대기 중                              │
│  ○ 정수진 (Signer 5) - 대기 중                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**탭 3: 감사 로그**
```
┌─────────────────────────────────────────────────────────────┐
│  [트랜잭션 정보] [서명 현황] [감사 로그]                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  타임라인                                                    │
│                                                              │
│  ● 2025-01-13 15:30:45 - 서명 추가                          │
│    김철수(admin_003)가 서명을 완료했습니다                   │
│    Signature: 0x5678...ef01                                 │
│    서명 진행률: 2/3 (66%)                                    │
│                                                              │
│  ● 2025-01-13 15:25:30 - 서명 추가                          │
│    이영희(admin_005)가 서명을 완료했습니다                   │
│    Signature: 0x6789...f012                                 │
│    서명 진행률: 1/3 (33%)                                    │
│                                                              │
│  ● 2025-01-13 14:15:00 - QR 코드 생성                       │
│    관리자(admin_001)가 서명 요청 QR 코드를 생성했습니다      │
│    만료 시간: 2025-01-13 18:00:00                           │
│                                                              │
│  ● 2025-01-13 14:00:00 - 서명 요청 생성                     │
│    시스템이 리밸런싱 요청에 대한 Air-gap 서명을 요청했습니다 │
│    Rebalancing ID: rb_20250113_001                          │
│    요청자: admin_001 (관리자)                                │
│    사유: Hot Wallet 잔액 부족 (15%)                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 API 함수 설계

### 1. Air-gap API 서비스 (`/src/services/airgapApi.ts`)

```typescript
// ============================================================================
// Air-gap Signing API 서비스
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
// 통계 조회
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

export async function getAirGapStatistics(): Promise<AirGapStatistics>;

// ============================================================================
// 서명 요청 관리
// ============================================================================

export interface AirGapFilter {
  status?: SigningStatus[];
  type?: SigningRequestType[];
  signatureProgress?: string[];  // "완전서명대기" | "부분서명완료" | "완료"
  dateRange?: { from: string; to: string };
  searchTerm?: string;
}

export async function getAirGapQueue(
  filters?: AirGapFilter
): Promise<AirGapSigningRequest[]>;

export async function getAirGapRequest(
  requestId: string
): Promise<AirGapSigningRequest>;

// ============================================================================
// QR 코드 생성
// ============================================================================

export interface GenerateQRRequest {
  requestId: string;
  transactions: UnsignedTransaction[];
}

export interface QRCodeResponse {
  qrCode: string;              // Base64 encoded QR image
  rawData: string;             // Raw JSON data (for copy/paste)
  expiresAt: string;
  downloadUrl?: string;        // Optional: URL to download QR image
}

export async function generateSigningQR(
  request: GenerateQRRequest
): Promise<QRCodeResponse>;

// ============================================================================
// 서명 스캔 및 검증
// ============================================================================

export interface ScanSignatureRequest {
  requestId: string;
  qrData?: string;             // QR 스캔 데이터
  signedTxFile?: File;         // 파일 업로드
  signedTxRaw?: string;        // Raw paste
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

export async function scanAndVerifySignature(
  request: ScanSignatureRequest
): Promise<SignatureVerificationResult>;

// ============================================================================
// 서명 추가
// ============================================================================

export interface AddSignatureRequest {
  requestId: string;
  signerId: string;
  signature: string;
  signedTransaction: SignedTransaction;
}

export async function addSignature(
  request: AddSignatureRequest,
  adminId: string,
  adminName: string
): Promise<AirGapSigningRequest>;

// ============================================================================
// 서명 완료 처리
// ============================================================================

export interface CompleteSigningRequest {
  requestId: string;
  signedTransactions: SignedTransaction[];
}

export async function completeAirGapSigning(
  request: CompleteSigningRequest,
  adminId: string,
  adminName: string
): Promise<{
  success: boolean;
  broadcastResults: BroadcastResult[];
}>;

export interface BroadcastResult {
  transactionId: string;
  txHash: string;
  status: "pending" | "confirmed" | "failed";
  confirmations: number;
}

// ============================================================================
// 서명 취소/만료
// ============================================================================

export async function cancelAirGapRequest(
  requestId: string,
  reason: string,
  adminId: string,
  adminName: string
): Promise<void>;

export async function checkExpiredRequests(): Promise<string[]>;  // 만료된 요청 ID 목록
```

---

## 🔄 통합 플로우

### 1. 리밸런싱 → Air-gap → 출금 완료

```typescript
// Step 1: 리밸런싱 요청 생성 (이미 구현됨 - vaultApi.ts)
const rebalancingRequest = await createRebalancingRequest({
  type: RebalancingType.COLD_TO_HOT,
  assets: [{
    symbol: "BTC",
    amount: "1.5",
    fromWallet: WalletType.COLD,
    toWallet: WalletType.HOT,
  }],
  reason: "Hot Wallet 잔액 부족",
  priority: RebalancingPriority.HIGH,
});

// Step 2: Air-gap 서명 요청 생성
const unsignedTx = await vaultApi.generateUnsignedTransaction({
  id: `airgap_${Date.now()}`,
  type: SigningRequestType.REBALANCING,
  rebalancingId: rebalancingRequest.id,
  transactions: [...],
  requiredSignatures: 3,
  obtainedSignatures: 0,
  signers: [김철수, 이영희, 박민수, 최지훈, 정수진],
  status: SigningStatus.PENDING,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),  // 24시간
  metadata: {},
});

// Step 3: QR 코드 생성
const qrCode = await airgapApi.generateSigningQR({
  requestId: unsignedTx.id,
  transactions: unsignedTx.transactions,
});

// Step 4: 서명자가 Air-gap 장치로 서명 (오프라인)
// ...Air-gap 장치에서 서명 수행...

// Step 5: 서명 스캔 및 검증
const verificationResult = await airgapApi.scanAndVerifySignature({
  requestId: unsignedTx.id,
  qrData: scannedQRData,
});

// Step 6: 서명 추가
const updatedRequest = await airgapApi.addSignature({
  requestId: unsignedTx.id,
  signerId: verificationResult.signer.id,
  signature: verificationResult.signature,
  signedTransaction: signedTx,
}, adminId, adminName);

// Step 7: 정족수 충족 시 서명 완료 및 브로드캐스트
if (updatedRequest.obtainedSignatures >= updatedRequest.requiredSignatures) {
  const result = await airgapApi.completeAirGapSigning({
    requestId: updatedRequest.id,
    signedTransactions: updatedRequest.transactions.map(tx => ({
      ...tx,
      signature: "...",
      signedRawTransaction: "...",
    })),
  }, adminId, adminName);

  // Step 8: 출금 상태 업데이트 (withdrawalApi.ts)
  if (result.success) {
    await updateWithdrawalStatus(withdrawalId, "confirmed", result.broadcastResults[0].txHash);
  }
}
```

---

## 📝 Mock 데이터 설계

```typescript
// Mock Air-gap 요청 데이터
export function generateMockAirGapRequests(count: number = 10): AirGapSigningRequest[] {
  const requests: AirGapSigningRequest[] = [];

  const signers: SignerInfo[] = [
    { id: "signer_001", name: "김철수", publicKey: "0x1234...abcd" },
    { id: "signer_002", name: "이영희", publicKey: "0x2345...bcde" },
    { id: "signer_003", name: "박민수", publicKey: "0x3456...cdef" },
    { id: "signer_004", name: "최지훈", publicKey: "0x4567...def0" },
    { id: "signer_005", name: "정수진", publicKey: "0x5678...ef01" },
  ];

  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.7
      ? SigningRequestType.EMERGENCY_WITHDRAWAL
      : SigningRequestType.REBALANCING;

    const requiredSignatures = type === SigningRequestType.EMERGENCY_WITHDRAWAL ? 3 : 2;
    const obtainedSignatures = Math.floor(Math.random() * (requiredSignatures + 1));

    let status: SigningStatus;
    if (obtainedSignatures === 0) status = SigningStatus.PENDING;
    else if (obtainedSignatures < requiredSignatures) status = SigningStatus.PARTIAL;
    else status = SigningStatus.COMPLETED;

    const createdAt = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    requests.push({
      id: `airgap_${Date.now()}_${i}`,
      type,
      rebalancingId: type === SigningRequestType.REBALANCING ? `rb_${i}` : undefined,
      transactions: [{
        id: `tx_${i}`,
        assetSymbol: "BTC",
        amount: (Math.random() * 10).toFixed(4),
        fromAddress: "bc1q...cold...wallet",
        toAddress: "bc1q...hot...wallet",
        rawTransaction: `0x${Math.random().toString(36).substr(2, 64)}`,
        estimatedFee: "0.0001",
      }],
      requiredSignatures,
      obtainedSignatures,
      signers: signers.slice(0, requiredSignatures + 2),  // +2 for redundancy
      status,
      createdAt,
      expiresAt,
      completedAt: status === SigningStatus.COMPLETED ? new Date() : undefined,
      qrCode: status === SigningStatus.PENDING ? generateMockQRCode() : undefined,
      metadata: {
        priority: type === SigningRequestType.EMERGENCY_WITHDRAWAL ? "emergency" : "normal",
        reason: type === SigningRequestType.EMERGENCY_WITHDRAWAL
          ? "Hot Wallet 긴급 보충"
          : "일일 리밸런싱",
      },
    });
  }

  return requests;
}

function generateMockQRCode(): string {
  // Base64 encoded QR code placeholder
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
}
```

---

## ✅ 구현 체크리스트

### Phase 1: 데이터 레이어 (이미 완료)
- [x] `AirGapSigningRequest` 타입 정의 (vault.ts)
- [x] `UnsignedTransaction` 타입 정의
- [x] `SignedTransaction` 타입 정의
- [x] `SignerInfo` 타입 정의

### Phase 2: API 서비스 레이어
- [ ] `/src/services/airgapApi.ts` 생성
- [ ] `getAirGapStatistics()` - 통계 조회
- [ ] `getAirGapQueue()` - 서명 요청 목록
- [ ] `getAirGapRequest()` - 상세 조회
- [ ] `generateSigningQR()` - QR 코드 생성
- [ ] `scanAndVerifySignature()` - 서명 스캔/검증
- [ ] `addSignature()` - 서명 추가
- [ ] `completeAirGapSigning()` - 서명 완료
- [ ] `cancelAirGapRequest()` - 취소
- [ ] Mock 데이터 생성 함수

### Phase 3: React Query Hooks
- [ ] `/src/hooks/useAirGap.ts` 생성
- [ ] `useAirGapStatistics()`
- [ ] `useAirGapQueue(filters)`
- [ ] `useGenerateQR()`
- [ ] `useScanSignature()`
- [ ] `useAddSignature()`
- [ ] `useCompleteSignin()`

### Phase 4: UI 컴포넌트
- [ ] `/src/app/admin/withdrawals/airgap/page.tsx` - 메인 페이지
- [ ] `/src/app/admin/withdrawals/airgap/AirGapStats.tsx` - 통계 카드
- [ ] `/src/app/admin/withdrawals/airgap/AirGapTable.tsx` - 서명 대기열 테이블
- [ ] `/src/app/admin/withdrawals/airgap/QRGenerateModal.tsx` - QR 생성 모달
- [ ] `/src/app/admin/withdrawals/airgap/SignatureScanModal.tsx` - 서명 스캔 모달
- [ ] `/src/app/admin/withdrawals/airgap/AirGapDetailModal.tsx` - 상세 모달 (3 탭)

### Phase 5: 통합 및 테스트
- [ ] 리밸런싱 → Air-gap → 출금 완료 플로우 통합
- [ ] QR 코드 라이브러리 설치 (`qrcode.react`)
- [ ] 카메라 스캔 라이브러리 설치 (`react-qr-reader`)
- [ ] 서명 검증 로직 구현
- [ ] 만료 처리 자동화

---

## 🎯 핵심 기능 우선순위

### P0 (필수)
1. ✅ 타입 정의 (완료)
2. 서명 요청 목록 조회
3. QR 코드 생성
4. 서명 스캔 및 검증
5. 서명 진행률 표시

### P1 (중요)
6. 다중 서명 관리
7. 만료 처리
8. 상세 정보 모달
9. 감사 로그

### P2 (추가)
10. 서명자 알림
11. 통계 대시보드
12. 필터링/검색

---

## 📚 필요한 라이브러리

```bash
# QR 코드 생성
npm install qrcode.react

# QR 코드 스캔 (카메라)
npm install react-qr-reader

# 또는 최신 라이브러리
npm install @yudiel/react-qr-scanner
```

---

## 🔐 보안 고려사항

1. **Private Key 격리**: Air-gap 장치에만 저장
2. **QR 데이터 검증**: 무결성 검증 필수
3. **서명 검증**: 공개키로 서명 검증
4. **타임아웃**: 24시간 후 자동 만료
5. **감사 로그**: 모든 서명 활동 기록
6. **다중 서명**: 최소 2명 이상 필수

---

## 📊 성공 지표

- **서명 완료율**: > 95%
- **평균 서명 시간**: < 30분
- **서명 오류율**: < 1%
- **만료율**: < 5%

---

_설계 완료: 2025-01-13_
_다음 단계: API 서비스 레이어 구현_
