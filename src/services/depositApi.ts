// @ts-nocheck
/**
 * 입금 모니터링 API 서비스 (LEGACY - Mock Data)
 *
 * ⚠️ DEPRECATED: 이 파일은 구형 Mock 데이터 API입니다.
 *
 * 새로운 개발에는 depositApiService.ts를 사용하세요.
 * - depositApiService.ts는 실제 백엔드 API와 연동됩니다.
 * - 이 파일은 다른 페이지 (returns, travel-rule, aml-screening 등)에서 임시로 사용 중입니다.
 *
 * @deprecated Use depositApiService.ts for new development
 */

import {
  DepositTransaction,
  DepositStats,
  DepositFilter,
  GetDepositsRequest,
  GetDepositsResponse,
  UpdateDepositStatusRequest,
  ProcessReturnRequest,
  ReturnTransaction,
  DepositDetails,
  DepositStatus,
  DepositReturnReason,
  Currency,
  AddressVerificationListItem,
  AddressVerificationStats,
  AddressVerificationFilter,
  GetAddressVerificationsRequest,
  GetAddressVerificationsResponse,
  FlagAddressRequest,
  AddressVerificationDetail,
  AMLScreeningItem,
  AMLScreeningStats,
  AMLScreeningFilter,
  GetAMLScreeningRequest,
  GetAMLScreeningResponse,
  AMLReviewActionRequest,
  AMLScreeningDetail,
  TravelRuleQueueItem,
  TravelRuleStats,
  TravelRuleFilter,
  GetTravelRuleQueueRequest,
  GetTravelRuleQueueResponse,
  ApproveTravelRuleRequest,
  TriggerTravelRuleReturnRequest,
  TravelRuleDetail,
  TravelRuleComplianceStatus,
  TravelRuleViolation,
} from '@/types/deposit';
import { mockDb } from './mockDatabase';
import type { Member } from '@/types/member';
import { getMemberName, isIndividualMember, isCorporateMember } from '@/types/member';
import { MemberType } from '@/data/types/individualOnboarding';

// ============================================================================
// Mock Database 키
// ============================================================================

const DEPOSITS_KEY = 'deposits';
const RETURNS_KEY = 'deposit_returns';

// ============================================================================
// Helper 함수
// ============================================================================

/**
 * localStorage에서 입금 목록 가져오기
 */
const getDepositsFromStorage = (): DepositTransaction[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(DEPOSITS_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * localStorage에 입금 목록 저장
 */
const saveDepositsToStorage = (deposits: DepositTransaction[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEPOSITS_KEY, JSON.stringify(deposits));
};

/**
 * localStorage에서 환불 목록 가져오기
 */
const getReturnsFromStorage = (): ReturnTransaction[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(RETURNS_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * localStorage에 환불 목록 저장
 */
const saveReturnsToStorage = (returns: ReturnTransaction[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RETURNS_KEY, JSON.stringify(returns));
};

/**
 * 필터 적용
 */
const applyFilters = (
  deposits: DepositTransaction[],
  filter?: DepositFilter
): DepositTransaction[] => {
  if (!filter) return deposits;

  let filtered = [...deposits];

  // 상태 필터
  if (filter.status && filter.status.length > 0) {
    filtered = filtered.filter((d) => filter.status!.includes(d.status));
  }

  // 회원사 필터
  if (filter.memberId) {
    filtered = filtered.filter((d) => d.memberId === filter.memberId);
  }

  // 회원 유형 필터
  if (filter.memberType && filter.memberType.length > 0) {
    filtered = filtered.filter((d) => d.memberType && filter.memberType!.includes(d.memberType));
  }

  // 자산 필터
  if (filter.asset && filter.asset.length > 0) {
    filtered = filtered.filter((d) => filter.asset!.includes(d.asset));
  }

  // 우선순위 필터
  if (filter.priority && filter.priority.length > 0) {
    filtered = filtered.filter((d) => d.priority && filter.priority!.includes(d.priority));
  }

  // 날짜 범위 필터
  if (filter.dateRange) {
    const startTime = new Date(filter.dateRange.start).getTime();
    const endTime = new Date(filter.dateRange.end).getTime();
    filtered = filtered.filter((d) => {
      const depositTime = new Date(d.detectedAt || d.createdAt).getTime();
      return depositTime >= startTime && depositTime <= endTime;
    });
  }

  // 금액 범위 필터
  if (filter.amountRange) {
    const minAmount = parseFloat(filter.amountRange.min);
    const maxAmount = parseFloat(filter.amountRange.max);
    filtered = filtered.filter((d) => {
      if (!d.amountKRW) return false;
      const amount = parseFloat(d.amountKRW);
      return amount >= minAmount && amount <= maxAmount;
    });
  }

  // 검색 쿼리 (주소, TxHash)
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.txHash.toLowerCase().includes(query) ||
        d.fromAddress.toLowerCase().includes(query) ||
        d.toAddress.toLowerCase().includes(query) ||
        (d.memberName && d.memberName.toLowerCase().includes(query))
    );
  }

  // 리스크 레벨 필터
  if (filter.riskLevel && filter.riskLevel.length > 0) {
    filtered = filtered.filter(
      (d) => d.amlCheck && filter.riskLevel!.includes(d.amlCheck.riskLevel)
    );
  }

  // AML 플래그 필터
  if (filter.hasAMLFlag !== undefined) {
    filtered = filtered.filter((d) =>
      filter.hasAMLFlag
        ? d.amlCheck && !d.amlCheck.isClean
        : !d.amlCheck || d.amlCheck.isClean
    );
  }

  // Travel Rule 이슈 필터
  if (filter.hasTravelRuleIssue !== undefined) {
    filtered = filtered.filter((d) =>
      filter.hasTravelRuleIssue
        ? d.travelRuleCheck && d.travelRuleCheck.requiresReturn
        : !d.travelRuleCheck || !d.travelRuleCheck.requiresReturn
    );
  }

  return filtered;
};

// ============================================================================
// API 함수
// ============================================================================

/**
 * 입금 목록 조회
 */
export const getDeposits = async (
  request?: GetDepositsRequest
): Promise<GetDepositsResponse> => {
  // 시뮬레이션: API 호출 지연
  await new Promise((resolve) => setTimeout(resolve, 300));

  const allDeposits = getDepositsFromStorage();
  const filtered = applyFilters(allDeposits, request?.filter);

  // 정렬
  const sortBy = request?.sortBy || 'timestamp';
  const sortOrder = request?.sortOrder || 'desc';

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'timestamp':
        comparison =
          new Date(a.detectedAt || a.createdAt).getTime() - new Date(b.detectedAt || b.createdAt).getTime();
        break;
      case 'amount':
        comparison = parseFloat(a.amountKRW || '0') - parseFloat(b.amountKRW || '0');
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'riskScore':
        const aRisk = a.amlCheck?.riskScore || 0;
        const bRisk = b.amlCheck?.riskScore || 0;
        comparison = aRisk - bRisk;
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 페이지네이션
  const page = request?.page || 1;
  const pageSize = request?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDeposits = sorted.slice(startIndex, endIndex);

  return {
    deposits: paginatedDeposits,
    total: sorted.length,
    page,
    pageSize,
    hasMore: endIndex < sorted.length,
  };
};

/**
 * 입금 상세 조회
 */
export const getDepositById = async (id: string): Promise<DepositDetails | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const deposits = getDepositsFromStorage();
  const deposit = deposits.find((d) => d.id === id);

  if (!deposit) return null;

  // 상세 정보 추가
  const details: DepositDetails = {
    ...deposit,
    blockNumber: Math.floor(Math.random() * 1000000),
    blockTime: deposit.detectedAt || deposit.createdAt,
    networkFee: (parseFloat(deposit.amount) * 0.0001).toFixed(8),
    memberInfo: {
      id: deposit.memberId || deposit.userId,
      companyName: deposit.memberName || 'Unknown',
      contactEmail: `contact@${(deposit.memberName || 'unknown').toLowerCase().replace(/\s/g, '')}.com`,
      riskScore: deposit.amlCheck?.riskScore || 0,
    },
    verificationTimeline: generateVerificationTimeline(deposit),
    relatedTransactions: {
      previousDeposits: Math.floor(Math.random() * 50),
      suspiciousActivity: false,
    },
  };

  return details;
};

/**
 * 입금 통계 조회
 */
export const getDepositStats = async (): Promise<DepositStats> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const deposits = getDepositsFromStorage();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 오늘 입금
  const todayDeposits = deposits.filter(
    (d) => new Date(d.detectedAt || d.createdAt) >= todayStart
  );
  const todayTotal = todayDeposits.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  // 검증중 (confirming)
  const verifying = deposits.filter((d) => d.status === 'confirming');
  const verifyingTotal = verifying.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  // 환불 예정 (travelRuleCheck가 requiresReturn인 경우)
  const toReturn = deposits.filter(
    (d) => d.travelRuleCheck?.requiresReturn
  );
  const toReturnTotal = toReturn.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  // 완료 (credited)
  const completed = deposits.filter((d) => d.status === 'credited');
  const completedTotal = completed.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  // 가장 큰 입금
  const largestDeposit = deposits.length > 0 ? deposits.reduce((max, d) =>
    parseFloat(d.amountKRW || '0') > parseFloat(max.amountKRW || '0') ? d : max
  , deposits[0]) : { amountKRW: '0', amount: '0', asset: 'BTC' as Currency, memberName: '-' };

  // 각 상태별 카운트
  const detected = deposits.filter((d) => d.status === 'detected');
  const confirming = deposits.filter((d) => d.status === 'confirming');
  const confirmed = deposits.filter((d) => d.status === 'confirmed');
  const credited = deposits.filter((d) => d.status === 'credited');

  return {
    detected: { count: detected.length, totalKRW: '0' },
    confirming: { count: confirming.length, totalKRW: '0' },
    confirmed: { count: confirmed.length, totalKRW: '0' },
    credited: { count: credited.length, totalKRW: '0' },
  };
};

/**
 * 입금 상태 업데이트
 */
export const updateDepositStatus = async (
  request: UpdateDepositStatusRequest
): Promise<DepositTransaction> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const deposits = getDepositsFromStorage();
  const index = deposits.findIndex((d) => d.id === request.depositId);

  if (index === -1) {
    throw new Error('Deposit not found');
  }

  const deposit = deposits[index];
  deposit.status = request.newStatus;

  if (request.newStatus === 'credited') {
    deposit.completedAt = new Date().toISOString();
  } else if (request.newStatus === 'returned') {
    deposit.returnedAt = new Date().toISOString();
  } else if (request.newStatus === 'flagged') {
    deposit.flagInfo = {
      reason: request.reason || 'Manual review required',
      flaggedBy: request.performedBy,
      flaggedAt: new Date().toISOString(),
      reviewNotes: request.notes,
    };
  }

  deposits[index] = deposit;
  saveDepositsToStorage(deposits);

  return deposit;
};

/**
 * 환불 처리
 */
export const processReturn = async (
  request: ProcessReturnRequest
): Promise<ReturnTransaction> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const deposits = getDepositsFromStorage();
  const deposit = deposits.find((d) => d.id === request.depositId);

  if (!deposit) {
    throw new Error('Deposit not found');
  }

  // 환불 거래 생성
  const returnTx: ReturnTransaction = {
    id: `return-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    depositId: request.depositId,
    originalTxHash: deposit.txHash,
    originalAmount: deposit.amount,
    returnType: 'refund' as const,
    asset: deposit.asset,
    network: deposit.network,
    currency: deposit.asset,
    returnAddress: deposit.fromAddress,
    reason: request.reason,
    status: 'pending' as any,
    requestedBy: 'admin',
    requestedAt: new Date().toISOString(),
    networkFee: (parseFloat(deposit.amount) * 0.001).toFixed(8),
    returnAmount: (parseFloat(deposit.amount) * 0.999).toFixed(8),
  };

  // 환불 목록에 추가
  const returns = getReturnsFromStorage();
  returns.push(returnTx);
  saveReturnsToStorage(returns);

  // 입금 상태 업데이트
  const index = deposits.findIndex((d) => d.id === request.depositId);
  deposits[index].status = 'returned';
  deposits[index].returnedAt = new Date().toISOString();
  deposits[index].returnInfo = {
    reason: request.reason,
    networkFee: returnTx.networkFee || '0',
    returnedAmount: returnTx.returnAmount,
  };
  saveDepositsToStorage(deposits);

  return returnTx;
};

/**
 * 환불 목록 조회
 */
export const getReturns = async (): Promise<ReturnTransaction[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return getReturnsFromStorage();
};

/**
 * 환불 통계 조회
 */
export const getReturnStats = async (): Promise<{
  pending: { count: number; volumeKRW: string };
  processing: { count: number; volumeKRW: string };
  completed: { count: number; volumeKRW: string };
  failed: { count: number; volumeKRW: string };
}> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const returns = getReturnsFromStorage();

  // Pending
  const pending = returns.filter((r) => r.status === 'pending');
  const pendingVolume = pending.reduce(
    (sum, r) => {
      const deposits = getDepositsFromStorage();
      const deposit = deposits.find((d) => d.id === r.depositId);
      return sum + (deposit && deposit.amountKRW ? parseFloat(deposit.amountKRW) : 0);
    },
    0
  );

  // Processing
  const processing = returns.filter((r) => r.status === 'processing');
  const processingVolume = processing.reduce(
    (sum, r) => {
      const deposits = getDepositsFromStorage();
      const deposit = deposits.find((d) => d.id === r.depositId);
      return sum + (deposit && deposit.amountKRW ? parseFloat(deposit.amountKRW) : 0);
    },
    0
  );

  // Completed
  const completed = returns.filter((r) => r.status === 'completed');
  const completedVolume = completed.reduce(
    (sum, r) => {
      const deposits = getDepositsFromStorage();
      const deposit = deposits.find((d) => d.id === r.depositId);
      return sum + (deposit && deposit.amountKRW ? parseFloat(deposit.amountKRW) : 0);
    },
    0
  );

  // Failed
  const failed = returns.filter((r) => r.status === 'failed');
  const failedVolume = failed.reduce(
    (sum, r) => {
      const deposits = getDepositsFromStorage();
      const deposit = deposits.find((d) => d.id === r.depositId);
      return sum + (deposit && deposit.amountKRW ? parseFloat(deposit.amountKRW) : 0);
    },
    0
  );

  return {
    pending: {
      count: pending.length,
      volumeKRW: pendingVolume.toFixed(0),
    },
    processing: {
      count: processing.length,
      volumeKRW: processingVolume.toFixed(0),
    },
    completed: {
      count: completed.length,
      volumeKRW: completedVolume.toFixed(0),
    },
    failed: {
      count: failed.length,
      volumeKRW: failedVolume.toFixed(0),
    },
  };
};

// ============================================================================
// Mock 데이터 생성 함수
// ============================================================================

/**
 * Mock 입금 데이터 생성 (실제 회원사 데이터 사용)
 */
export const generateMockDeposits = (count: number = 50): DepositTransaction[] => {
  const deposits: DepositTransaction[] = [];
  const statuses: DepositStatus[] = ['detected', 'confirming', 'confirmed', 'credited', 'returned', 'flagged'];
  const currencies: Currency[] = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL'];

  // mockDb에서 실제 회원사 데이터 가져오기
  const members = mockDb.getMembers();

  if (members.length === 0) {
    console.warn('⚠️  No members found in mockDb. Please initialize member data first.');
    return [];
  }

  console.log(`✅ Found ${members.length} members in mockDb for deposit generation`);

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];

    // 실제 회원사 중 랜덤 선택
    const randomMember = members[Math.floor(Math.random() * members.length)];

    // 회원 유형: 실제 회원사의 타입 사용 (Corporate 또는 Individual)
    // Member의 memberType이 CORPORATE면 'Corporate', INDIVIDUAL이면 'Individual'로 매핑
    const memberType: import('@/types/deposit').MemberType =
      randomMember.memberType === MemberType.CORPORATE ? 'Corporate' : 'Individual';

    const amount =
      currency === 'BTC'
        ? (Math.random() * 10).toFixed(8)
        : currency === 'ETH'
        ? (Math.random() * 100).toFixed(8)
        : currency === 'SOL'
        ? (Math.random() * 1000).toFixed(8)
        : (Math.random() * 100000).toFixed(2); // USDT, USDC

    // KRW 환산 (2025년 1월 기준 대략적인 가격)
    const priceInKRW =
      currency === 'BTC' ? 80000000 :  // BTC: 약 8천만원
      currency === 'ETH' ? 4000000 :   // ETH: 약 400만원
      currency === 'SOL' ? 150000 :    // SOL: 약 15만원
      1300;                             // USDT, USDC: 약 1,300원

    const amountKRW = (parseFloat(amount) * priceInKRW).toFixed(0);

    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();

    const deposit = {
      id: `deposit-${Date.now()}-${i}`,
      userId: randomMember.id,
      depositAddressId: `addr-${i}`,
      network: currency === 'BTC' ? 'Bitcoin' : currency === 'SOL' ? 'Solana' : 'Ethereum',
      senderVerified: Math.random() > 0.3,
      currentConfirmations: Math.floor(Math.random() * 20),
      requiredConfirmations: 12,
      blockHeight: Math.floor(Math.random() * 1000000),
      detectedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      txHash: `0x${Math.random().toString(36).substr(2, 64)}`,
      memberId: randomMember.id,        // 실제 회원사 ID
      memberName: getMemberName(randomMember),  // 실제 회원명 (개인/기업)
      memberType,                       // 회원 유형 (개인/기업)
      asset: currency,
      amount,
      amountKRW,
      fromAddress: `0x${Math.random().toString(36).substr(2, 40)}`,
      toAddress: `0x${Math.random().toString(36).substr(2, 40)}`,
      status,
      priority: Math.random() > 0.7 ? 'high' : 'normal',
      timestamp,
      confirmations: Math.floor(Math.random() * 12),
      addressVerification: {
        isRegistered: Math.random() > 0.2,
        hasPermission: Math.random() > 0.1,
        verificationStatus: status === 'returned' ? 'failed' : 'passed',
      },
      amlCheck: undefined,
      travelRuleCheck: undefined,
      dailyLimitCheck: undefined,
    } as DepositTransaction;

    // AML 체크 (일부만)
    if (Math.random() > 0.3) {
      const riskScore = Math.floor(Math.random() * 100);
      deposit.amlCheck = {
        riskScore,
        riskLevel:
          riskScore < 25 ? 'low' : riskScore < 50 ? 'medium' : riskScore < 75 ? 'high' : 'critical',
        isClean: riskScore < 50,
        checks: {
          blacklistCheck: Math.random() > 0.9,
          sanctionsListCheck: Math.random() > 0.95,
          pep: Math.random() > 0.98,
          adverseMedia: Math.random() > 0.92,
        },
        checkedAt: timestamp,
      };
    }

    // Travel Rule 체크 (100만원 초과 거래에만 적용)
    if (parseFloat(amountKRW) > 1000000) {
      const addressType = Math.random() > 0.5 ? 'vasp' : 'personal';
      const isVaspCompliant = Math.random() > 0.3;

      const travelRule: import('@/types/deposit').TravelRuleCheck = {
        isExceeding: true,
        thresholdKRW: '1000000',
        addressType,
        requiresReturn: false,
        complianceStatus: 'pending',
      };

      // VASP 주소인 경우
      if (addressType === 'vasp') {
        const vaspNames = ['Binance', 'Upbit', 'Bithumb', 'Coinbase', 'Kraken'];
        const vaspName = vaspNames[Math.floor(Math.random() * vaspNames.length)];

        travelRule.vaspInfo = {
          name: vaspName,
          hasCompleteInfo: isVaspCompliant,
          travelRuleCompliant: isVaspCompliant,
        };

        if (isVaspCompliant) {
          travelRule.complianceStatus = 'compliant';
          travelRule.requiresReturn = false;
        } else {
          travelRule.complianceStatus = 'non_compliant';
          travelRule.requiresReturn = true;
          travelRule.violationReason = 'insufficient_originator_info';
        }
      } else {
        // Personal 주소는 한도 초과로 위반
        travelRule.complianceStatus = 'non_compliant';
        travelRule.requiresReturn = true;
        travelRule.violationReason = 'exceeds_threshold_no_info';
      }

      deposit.travelRuleCheck = travelRule;
    }

    deposits.push(deposit);
  }

  return deposits;
};

/**
 * Mock 데이터 초기화
 */
export const initializeMockDeposits = (): void => {
  if (typeof window === 'undefined') return;

  const existing = getDepositsFromStorage();
  if (existing.length === 0) {
    const mockDeposits = generateMockDeposits(50);
    if (mockDeposits.length > 0) {
      saveDepositsToStorage(mockDeposits);
      console.log(`✅ Mock deposit data initialized (${mockDeposits.length} deposits with real member names)`);
    } else {
      console.warn('⚠️ Could not initialize deposits: No members found in mockDb');
    }
  } else {
    console.log(`ℹ️ ${existing.length} deposits already exist. Use "Mock 데이터 생성" button to regenerate with real member names.`);
  }
};

// ============================================================================
// Helper: 검증 타임라인 생성
// ============================================================================

const generateVerificationTimeline = (deposit: DepositTransaction): import('@/types/deposit').VerificationTimelineItem[] => {
  const timeline: import('@/types/deposit').VerificationTimelineItem[] = [
    {
      timestamp: deposit.timestamp || deposit.detectedAt,
      action: '입금 감지',
      status: 'info',
      description: `${deposit.amount} ${deposit.asset} 입금이 감지되었습니다.`,
    },
  ];

  if (deposit.addressVerification.verificationStatus === 'passed') {
    timeline.push({
      timestamp: new Date(new Date(deposit.timestamp || deposit.detectedAt).getTime() + 1000).toISOString(),
      action: '주소 검증 완료',
      status: 'success',
      description: '등록된 주소에서 입금되었습니다.',
    });
  } else if (deposit.addressVerification.verificationStatus === 'failed') {
    timeline.push({
      timestamp: new Date(new Date(deposit.timestamp || deposit.detectedAt).getTime() + 1000).toISOString(),
      action: '주소 검증 실패',
      status: 'error',
      description: '미등록 주소에서 입금되었습니다.',
    });
  }

  if (deposit.amlCheck) {
    timeline.push({
      timestamp: new Date(new Date(deposit.timestamp || deposit.detectedAt).getTime() + 2000).toISOString(),
      action: 'AML 스크리닝 완료',
      status: deposit.amlCheck.isClean ? 'success' : 'warning',
      description: `리스크 점수: ${deposit.amlCheck.riskScore}/100`,
    });
  }

  if (deposit.status === 'credited') {
    timeline.push({
      timestamp: deposit.completedAt!,
      action: 'Hot/Cold 배분 완료',
      status: 'success',
      description: 'Hot Wallet 20%, Cold Wallet 80% 배분 완료',
    });
  } else if (deposit.status === 'returned') {
    timeline.push({
      timestamp: deposit.returnedAt!,
      action: '환불 처리 완료',
      status: 'error',
      description: '검증 실패로 환불되었습니다.',
    });
  }

  return timeline;
};

// ============================================================================
// 주소 검증 API 함수
// ============================================================================

/**
 * 주소 검증 필터 적용
 */
const applyAddressVerificationFilters = (
  verifications: AddressVerificationListItem[],
  filter?: AddressVerificationFilter
): AddressVerificationListItem[] => {
  if (!filter) return verifications;

  let filtered = [...verifications];

  // 검증 상태 필터
  if (filter.verificationStatus && filter.verificationStatus.length > 0) {
    filtered = filtered.filter((v) =>
      filter.verificationStatus!.includes(v.verificationStatus)
    );
  }

  // 등록 여부 필터
  if (filter.isRegistered !== undefined) {
    filtered = filtered.filter((v) => v.isRegistered === filter.isRegistered);
  }

  // 권한 여부 필터
  if (filter.hasPermission !== undefined) {
    filtered = filtered.filter((v) => v.hasPermission === filter.hasPermission);
  }

  // 주소 타입 필터
  if (filter.addressType && filter.addressType.length > 0) {
    filtered = filtered.filter(
      (v) => v.addressType && filter.addressType!.includes(v.addressType)
    );
  }

  // 실패 사유 필터
  if (filter.failureReason && filter.failureReason.length > 0) {
    filtered = filtered.filter(
      (v) => v.failureReason && filter.failureReason!.includes(v.failureReason)
    );
  }

  // 회원사 필터
  if (filter.memberId) {
    filtered = filtered.filter((v) => v.memberId === filter.memberId);
  }

  // 자산 필터
  if (filter.asset && filter.asset.length > 0) {
    filtered = filtered.filter((v) => filter.asset!.includes(v.asset));
  }

  // 날짜 범위 필터
  if (filter.dateRange) {
    const startTime = new Date(filter.dateRange.start).getTime();
    const endTime = new Date(filter.dateRange.end).getTime();
    filtered = filtered.filter((v) => {
      const depositTime = new Date(v.timestamp).getTime();
      return depositTime >= startTime && depositTime <= endTime;
    });
  }

  // 검색 쿼리 (주소, TxHash)
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (v) =>
        v.txHash.toLowerCase().includes(query) ||
        v.fromAddress.toLowerCase().includes(query) ||
        v.toAddress.toLowerCase().includes(query) ||
        v.memberName.toLowerCase().includes(query)
    );
  }

  // 플래그 여부 필터
  if (filter.isFlagged !== undefined) {
    filtered = filtered.filter((v) => v.isFlagged === filter.isFlagged);
  }

  return filtered;
};

/**
 * 주소 검증 목록 조회
 */
export const getAddressVerifications = async (
  request?: GetAddressVerificationsRequest
): Promise<GetAddressVerificationsResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const deposits = getDepositsFromStorage();

  // DepositTransaction을 AddressVerificationListItem으로 변환
  const verifications = deposits.map((d) => ({
    id: d.id,
    depositId: d.id,
    txHash: d.txHash,
    memberId: d.memberId,
    memberName: d.memberName,
    asset: d.asset,
    amount: d.amount,
    amountKRW: d.amountKRW,
    fromAddress: d.fromAddress,
    toAddress: d.toAddress,
    timestamp: d.timestamp,
    verificationStatus: d.addressVerification.verificationStatus === 'passed'
      ? 'passed'
      : d.addressVerification.verificationStatus === 'failed'
      ? 'failed'
      : d.status === 'flagged'
      ? 'flagged'
      : 'pending',
    isRegistered: d.addressVerification.isRegistered,
    hasPermission: d.addressVerification.hasPermission,
    registeredAddressId: d.addressVerification.registeredAddressId,
    addressType: d.addressVerification.addressType,
    failureReason: d.addressVerification.failureReason,
    isFlagged: d.status === 'flagged',
    flaggedAt: d.flagInfo?.flaggedAt,
    flaggedBy: d.flagInfo?.flaggedBy,
    flagReason: d.flagInfo?.reason,
    depositStatus: d.status,
    priority: d.priority,
  }));

  const filtered = applyAddressVerificationFilters(
    verifications as any,
    request?.filter
  );

  // 정렬
  const sortBy = request?.sortBy || 'timestamp';
  const sortOrder = request?.sortOrder || 'desc';

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'timestamp':
        comparison =
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'amount':
        comparison = parseFloat(a.amountKRW) - parseFloat(b.amountKRW);
        break;
      case 'verificationStatus':
        comparison = a.verificationStatus.localeCompare(b.verificationStatus);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 페이지네이션
  const page = request?.page || 1;
  const pageSize = request?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedVerifications = sorted.slice(startIndex, endIndex);

  return {
    verifications: paginatedVerifications,
    total: sorted.length,
    page,
    pageSize,
    hasMore: endIndex < sorted.length,
  };
};

/**
 * 주소 검증 통계 조회
 */
export const getAddressVerificationStats = async (): Promise<AddressVerificationStats> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const deposits = getDepositsFromStorage();

  // 통과
  const passed = deposits.filter(
    (d) => d.addressVerification.verificationStatus === 'passed'
  );
  const passedTotal = passed.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  // 미등록
  const unregistered = deposits.filter(
    (d) =>
      !d.addressVerification.isRegistered ||
      d.addressVerification.failureReason === 'unregistered_address'
  );
  const unregisteredTotal = unregistered.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  // 권한 없음
  const noPermission = deposits.filter(
    (d) =>
      !d.addressVerification.hasPermission ||
      d.addressVerification.failureReason === 'no_deposit_permission'
  );
  const noPermissionTotal = noPermission.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  // 플래그됨
  const flagged = deposits.filter((d) => d.status === 'flagged');
  const flaggedTotal = flagged.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  const total = deposits.length;
  const totalVolume = deposits.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  // 시간대별 통계 (최근 1시간)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentDeposits = deposits.filter(
    (d) => d.timestamp && new Date(d.timestamp) >= oneHourAgo
  );
  const recentPassed = recentDeposits.filter(
    (d) => d.addressVerification.verificationStatus === 'passed'
  ).length;
  const recentFailed = recentDeposits.filter(
    (d) => d.addressVerification.verificationStatus === 'failed'
  ).length;

  return {
    total: {
      count: total,
      volumeKRW: totalVolume.toFixed(0),
    },
    passed: {
      count: passed.length,
      volumeKRW: passedTotal.toFixed(0),
      percentage: total > 0 ? (passed.length / total) * 100 : 0,
    },
    unregistered: {
      count: unregistered.length,
      volumeKRW: unregisteredTotal.toFixed(0),
      percentage: total > 0 ? (unregistered.length / total) * 100 : 0,
    },
    noPermission: {
      count: noPermission.length,
      volumeKRW: noPermissionTotal.toFixed(0),
      percentage: total > 0 ? (noPermission.length / total) * 100 : 0,
    },
    flagged: {
      count: flagged.length,
      volumeKRW: flaggedTotal.toFixed(0),
      percentage: total > 0 ? (flagged.length / total) * 100 : 0,
    },
    hourly: {
      passed: recentPassed,
      failed: recentFailed,
    },
  };
};

/**
 * 주소 플래그 처리
 */
export const flagSuspiciousAddress = async (
  request: FlagAddressRequest
): Promise<DepositTransaction> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const deposits = getDepositsFromStorage();
  const index = deposits.findIndex((d) => d.id === request.depositId);

  if (index === -1) {
    throw new Error('Deposit not found');
  }

  const deposit = deposits[index];

  // 플래그 정보 업데이트
  deposit.status = 'flagged';
  deposit.flagInfo = {
    reason: request.reason,
    flaggedBy: request.performedBy,
    flaggedAt: new Date().toISOString(),
    reviewNotes: request.notes,
  };

  deposits[index] = deposit;
  saveDepositsToStorage(deposits);

  return deposit;
};

/**
 * 주소 검증 상세 조회
 */
export const getAddressVerificationDetail = async (
  depositId: string
): Promise<AddressVerificationDetail | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const deposits = getDepositsFromStorage();
  const deposit = deposits.find((d) => d.id === depositId);

  if (!deposit) return null;

  // 회원사 등록 주소 목록 조회
  const member = mockDb.getMemberById(deposit.memberId || deposit.userId);
  const memberRegisteredAddresses = member?.registeredAddresses || [];

  // 검증 히스토리 생성
  const verificationHistory = [
    {
      timestamp: deposit.timestamp,
      action: '주소 검증 시작',
      status: 'info' as const,
      description: `송신 주소 ${deposit.fromAddress.slice(0, 10)}... 검증 시작`,
    },
    {
      timestamp: new Date(new Date(deposit.timestamp || deposit.detectedAt).getTime() + 500).toISOString(),
      action: '회원사 등록 주소 매칭',
      status: deposit.addressVerification.isRegistered ? ('success' as const) : ('error' as const),
      description: deposit.addressVerification.isRegistered
        ? '등록된 주소와 일치합니다.'
        : '등록되지 않은 주소입니다.',
    },
  ];

  if (deposit.addressVerification.isRegistered) {
    verificationHistory.push({
      timestamp: new Date(new Date(deposit.timestamp || deposit.detectedAt).getTime() + 1000).toISOString(),
      action: '입금 권한 확인',
      status: deposit.addressVerification.hasPermission ? ('success' as const) : ('error' as const),
      description: deposit.addressVerification.hasPermission
        ? '입금 권한이 있습니다.'
        : '입금 권한이 없습니다.',
    });
  }

  // 관련 정보
  const previousDeposits = deposits.filter(
    (d) => d.fromAddress === deposit.fromAddress && d.id !== deposit.id
  );

  const detail: AddressVerificationDetail = {
    id: deposit.id,
    depositId: deposit.id,
    txHash: deposit.txHash,
    memberId: deposit.memberId || deposit.userId,
    memberName: deposit.memberName || 'Unknown',
    asset: deposit.asset as any,
    amount: deposit.amount,
    amountKRW: deposit.amountKRW || '0',
    fromAddress: deposit.fromAddress,
    toAddress: deposit.toAddress,
    timestamp: deposit.timestamp || deposit.detectedAt,
    verificationStatus: deposit.addressVerification.verificationStatus === 'passed'
      ? 'passed'
      : deposit.addressVerification.verificationStatus === 'failed'
      ? 'failed'
      : deposit.status === 'flagged'
      ? 'flagged'
      : 'pending',
    isRegistered: deposit.addressVerification.isRegistered,
    hasPermission: deposit.addressVerification.hasPermission,
    registeredAddressId: deposit.addressVerification.registeredAddressId,
    addressType: deposit.addressVerification.addressType,
    failureReason: deposit.addressVerification.failureReason,
    isFlagged: deposit.status === 'flagged',
    flaggedAt: deposit.flagInfo?.flaggedAt,
    flaggedBy: deposit.flagInfo?.flaggedBy,
    flagReason: deposit.flagInfo?.reason,
    depositStatus: deposit.status,
    priority: deposit.priority || 'normal',
    memberRegisteredAddresses: memberRegisteredAddresses.map((addr) => ({
      id: addr.id,
      label: addr.label,
      address: addr.address,
      type: addr.type === 'personal' ? 'personal' : 'vasp',
      permissions: {
        canDeposit: addr.permissions.canDeposit,
        canWithdraw: addr.permissions.canWithdraw,
      },
      status: addr.status === 'active' ? 'active' : addr.status === 'suspended' ? 'suspended' : 'blocked',
      addedAt: addr.addedAt.toISOString(),
    })),
    verificationHistory: verificationHistory as any,
    relatedInfo: {
      previousDepositsFromAddress: previousDeposits.length,
      totalVolumeFromAddress: previousDeposits
        .reduce((sum, d) => sum + parseFloat(d.amountKRW || '0'), 0)
        .toFixed(0),
      lastDepositFromAddress:
        previousDeposits.length > 0
          ? previousDeposits.sort(
              (a, b) =>
                new Date(b.timestamp || b.detectedAt).getTime() -
                new Date(a.timestamp || a.detectedAt).getTime()
            )[0].timestamp || previousDeposits[0].detectedAt
          : undefined,
    },
  };

  return detail;
};

// ============================================================================
// AML Screening API
// ============================================================================

/**
 * AML 스크리닝 대기열 조회
 */
export const getAMLScreeningQueue = async (
  request?: GetAMLScreeningRequest
): Promise<GetAMLScreeningResponse> => {
  const depositsResponse = await getDeposits();
  const deposits = depositsResponse.deposits;
  const members = mockDb.getMembers();

  // Convert deposits to AML screening items
  const items = deposits
    .filter((deposit: DepositTransaction) => deposit.amlCheck) // Only deposits with AML checks
    .map((deposit: DepositTransaction) => {
      const member = members.find((m: Member) => m.id === deposit.memberId);
      const aml = deposit.amlCheck!;

      // Determine review status
      let reviewStatus: 'pending' | 'approved' | 'flagged' = 'pending';
      if (deposit.status === 'flagged') reviewStatus = 'flagged';
      else if (deposit.status === 'credited') reviewStatus = 'approved';

      return {
        id: `aml-${deposit.id}`,
        depositId: deposit.id,
        txHash: deposit.txHash,
        memberId: deposit.memberId,
        memberName: member ? getMemberName(member) : 'Unknown',
        asset: deposit.asset,
        amount: deposit.amount,
        amountKRW: deposit.amountKRW,
        fromAddress: deposit.fromAddress,
        timestamp: deposit.timestamp,
        riskScore: aml.riskScore,
        riskLevel: aml.riskLevel,
        isClean: aml.isClean,
        blacklistMatch: aml.checks.blacklistCheck,
        sanctionsMatch: aml.checks.sanctionsListCheck,
        pepMatch: aml.checks.pep,
        adverseMediaMatch: aml.checks.adverseMedia,
        reviewStatus,
        reviewedAt: aml.checkedAt,
        reviewedBy: aml.checkedBy,
        reviewNotes: aml.reviewNotes,
        depositStatus: deposit.status,
        priority: deposit.priority,
      };
    });

  // Apply filters
  let filteredItems = items;
  const filter = request?.filter;

  if (filter) {
    if (filter.riskLevel && filter.riskLevel.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        filter.riskLevel!.includes(item.riskLevel)
      );
    }

    if (filter.reviewStatus && filter.reviewStatus.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        filter.reviewStatus!.includes(item.reviewStatus)
      );
    }

    if (filter.hasBlacklistMatch !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.blacklistMatch === filter.hasBlacklistMatch
      );
    }

    if (filter.hasSanctionsMatch !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.sanctionsMatch === filter.hasSanctionsMatch
      );
    }

    if (filter.hasPEPMatch !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.pepMatch === filter.hasPEPMatch
      );
    }

    if (filter.hasAdverseMedia !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.adverseMediaMatch === filter.hasAdverseMedia
      );
    }

    if (filter.memberId) {
      filteredItems = filteredItems.filter(
        (item) => item.memberId === filter.memberId
      );
    }

    if (filter.asset && filter.asset.length > 0) {
      filteredItems = filteredItems.filter((item) =>
        filter.asset!.includes(item.asset as any)
      );
    }

    if (filter.dateRange) {
      const start = new Date(filter.dateRange.start);
      const end = new Date(filter.dateRange.end);
      filteredItems = filteredItems.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= start && itemDate <= end;
      });
    }

    if (filter.minRiskScore !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.riskScore >= filter.minRiskScore!
      );
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.fromAddress.toLowerCase().includes(query) ||
          item.txHash.toLowerCase().includes(query)
      );
    }
  }

  // Apply sorting
  const sortBy = request?.sortBy || 'timestamp';
  const sortOrder = request?.sortOrder || 'desc';

  filteredItems.sort((a, b) => {
    let compareValue = 0;

    if (sortBy === 'timestamp') {
      compareValue =
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (sortBy === 'riskScore') {
      compareValue = a.riskScore - b.riskScore;
    } else if (sortBy === 'amount') {
      compareValue = parseFloat(a.amountKRW) - parseFloat(b.amountKRW);
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // Apply pagination
  const page = request?.page || 1;
  const pageSize = request?.pageSize || 50;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: filteredItems.length,
    page,
    pageSize,
    hasMore: endIndex < filteredItems.length,
  };
};

/**
 * AML 스크리닝 통계 조회
 */
export const getAMLScreeningStats = async (): Promise<AMLScreeningStats> => {
  const depositsResponse = await getDeposits();
  const deposits = depositsResponse.deposits;
  const amlDeposits = deposits.filter((d: DepositTransaction) => d.amlCheck);

  // Pending reviews
  const pending = amlDeposits.filter(
    (d: DepositTransaction) => d.status === 'verifying' || d.status === 'pending'
  );
  const pendingVolume = pending.reduce(
    (sum: number, d: DepositTransaction) => sum + parseFloat(d.amountKRW),
    0
  );

  // High risk (risk score >= 50)
  const highRisk = amlDeposits.filter((d: DepositTransaction) => d.amlCheck!.riskScore >= 50);
  const highRiskVolume = highRisk.reduce(
    (sum: number, d: DepositTransaction) => sum + parseFloat(d.amountKRW),
    0
  );

  // Flagged
  const flagged = amlDeposits.filter((d: DepositTransaction) => d.status === 'flagged');
  const flaggedVolume = flagged.reduce(
    (sum: number, d: DepositTransaction) => sum + parseFloat(d.amountKRW),
    0
  );

  // Reviewed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewedToday = amlDeposits.filter((d: DepositTransaction) => {
    if (!d.amlCheck?.checkedAt) return false;
    const checkedDate = new Date(d.amlCheck.checkedAt);
    return checkedDate >= today;
  });
  const reviewedTodayVolume = reviewedToday.reduce(
    (sum: number, d: DepositTransaction) => sum + parseFloat(d.amountKRW),
    0
  );

  // Risk distribution
  const riskDistribution = {
    low: amlDeposits.filter((d: DepositTransaction) => d.amlCheck!.riskLevel === 'low').length,
    medium: amlDeposits.filter((d: DepositTransaction) => d.amlCheck!.riskLevel === 'medium')
      .length,
    high: amlDeposits.filter((d: DepositTransaction) => d.amlCheck!.riskLevel === 'high').length,
    critical: amlDeposits.filter((d: DepositTransaction) => d.amlCheck!.riskLevel === 'critical')
      .length,
  };

  return {
    pending: {
      count: pending.length,
      volumeKRW: pendingVolume.toFixed(0),
    },
    highRisk: {
      count: highRisk.length,
      volumeKRW: highRiskVolume.toFixed(0),
      percentage:
        amlDeposits.length > 0
          ? (highRisk.length / amlDeposits.length) * 100
          : 0,
    },
    flagged: {
      count: flagged.length,
      volumeKRW: flaggedVolume.toFixed(0),
    },
    reviewedToday: {
      count: reviewedToday.length,
      volumeKRW: reviewedTodayVolume.toFixed(0),
    },
    riskDistribution,
  };
};

/**
 * AML 검토 승인
 */
export const approveAMLReview = async (
  request: AMLReviewActionRequest
): Promise<DepositTransaction> => {
  const depositsResponse = await getDeposits();
  const deposits = depositsResponse.deposits;
  const depositIndex = deposits.findIndex((d: DepositTransaction) => d.id === request.depositId);

  if (depositIndex === -1) {
    throw new Error('Deposit not found');
  }

  const deposit = deposits[depositIndex];

  // Update deposit status
  deposit.status = 'verifying'; // Continue to next verification steps
  if (deposit.amlCheck) {
    deposit.amlCheck.checkedAt = new Date().toISOString();
    deposit.amlCheck.checkedBy = request.performedBy;
    deposit.amlCheck.reviewNotes = request.notes || 'AML review approved';
  }

  deposits[depositIndex] = deposit;
  saveDepositsToStorage(deposits);

  return deposit;
};

/**
 * AML 의심 거래 플래그
 */
export const flagAMLDeposit = async (
  request: AMLReviewActionRequest
): Promise<DepositTransaction> => {
  const depositsResponse = await getDeposits();
  const deposits = depositsResponse.deposits;
  const depositIndex = deposits.findIndex((d: DepositTransaction) => d.id === request.depositId);

  if (depositIndex === -1) {
    throw new Error('Deposit not found');
  }

  const deposit = deposits[depositIndex];

  // Update deposit to flagged status
  deposit.status = 'flagged';
  deposit.flagInfo = {
    reason: request.notes || 'AML flag: Manual review required',
    flaggedBy: request.performedBy,
    flaggedAt: new Date().toISOString(),
    reviewNotes: request.notes,
  };

  if (deposit.amlCheck) {
    deposit.amlCheck.checkedAt = new Date().toISOString();
    deposit.amlCheck.checkedBy = request.performedBy;
    deposit.amlCheck.reviewNotes = request.notes || 'Flagged for AML concerns';
  }

  deposits[depositIndex] = deposit;
  saveDepositsToStorage(deposits);

  return deposit;
};

/**
 * AML 스크리닝 상세 정보 조회
 */
export const getAMLScreeningDetail = async (
  depositId: string
): Promise<AMLScreeningDetail | null> => {
  const depositsResponse = await getDeposits();
  const deposits = depositsResponse.deposits;
  const members = mockDb.getMembers();

  const deposit = deposits.find((d: DepositTransaction) => d.id === depositId);
  if (!deposit || !deposit.amlCheck) return null;

  const member = members.find((m: Member) => m.id === deposit.memberId);
  const aml = deposit.amlCheck;

  // Review status
  let reviewStatus: 'pending' | 'approved' | 'flagged' = 'pending';
  if (deposit.status === 'flagged') reviewStatus = 'flagged';
  else if (deposit.status === 'credited') reviewStatus = 'approved';

  // Detailed AML check information
  const amlCheckDetails = {
    blacklistCheck: {
      matched: aml.checks.blacklistCheck,
      sources: aml.checks.blacklistCheck ? ['Internal Blacklist', 'FATF'] : [],
      matchDetails: aml.checks.blacklistCheck
        ? '주소가 내부 블랙리스트에 등록되어 있습니다.'
        : '블랙리스트 체크 통과',
    },
    sanctionsListCheck: {
      matched: aml.checks.sanctionsListCheck,
      lists: aml.checks.sanctionsListCheck ? ['OFAC', 'UN', 'EU'] : [],
      matchDetails: aml.checks.sanctionsListCheck
        ? '제재 목록에 일치하는 주소가 발견되었습니다.'
        : '제재 목록 체크 통과',
    },
    pepCheck: {
      matched: aml.checks.pep,
      position: aml.checks.pep ? 'Government Official' : undefined,
      country: aml.checks.pep ? 'Unknown' : undefined,
      matchDetails: aml.checks.pep
        ? 'PEP(정치적 주요 인물) 일치 가능성 발견'
        : 'PEP 체크 통과',
    },
    adverseMediaCheck: {
      matched: aml.checks.adverseMedia,
      sources: aml.checks.adverseMedia ? ['News Articles', 'Reports'] : [],
      summary: aml.checks.adverseMedia
        ? '부정적 미디어 노출 이력이 발견되었습니다.'
        : '부정적 미디어 체크 통과',
    },
  };

  // Review history
  const reviewHistory = [
    {
      timestamp: deposit.timestamp,
      action: 'AML 스크리닝 시작',
      status: 'info' as const,
      description: '입금 감지 후 자동 AML 스크리닝 시작',
    },
    {
      timestamp: aml.checkedAt,
      action: 'AML 체크 완료',
      status: aml.isClean ? ('success' as const) : ('error' as const),
      description: `리스크 점수: ${aml.riskScore}/100, 레벨: ${aml.riskLevel}`,
    },
  ];

  if (aml.checkedBy) {
    reviewHistory.push({
      timestamp: aml.checkedAt,
      action: '수동 검토 완료',
      status: reviewStatus === 'flagged' ? ('error' as const) : ('success' as const),
      description: aml.reviewNotes || '검토 완료',
    });
  }

  // Related info from same address
  const previousDeposits = deposits.filter(
    (d: DepositTransaction) => d.fromAddress === deposit.fromAddress && d.id !== deposit.id
  );

  const flaggedFromAddress = previousDeposits.filter(
    (d: DepositTransaction) => d.status === 'flagged'
  ).length;

  const avgRiskScore =
    previousDeposits.length > 0
      ? previousDeposits.reduce((sum: number, d: DepositTransaction) => sum + (d.amlCheck?.riskScore || 0), 0) /
        previousDeposits.length
      : 0;

  const detail: AMLScreeningDetail = {
    id: `aml-${deposit.id}`,
    depositId: deposit.id,
    txHash: deposit.txHash,
    memberId: deposit.memberId,
    memberName: member ? getMemberName(member) : 'Unknown',
    asset: deposit.asset,
    amount: deposit.amount,
    amountKRW: deposit.amountKRW,
    fromAddress: deposit.fromAddress,
    timestamp: deposit.timestamp,
    riskScore: aml.riskScore,
    riskLevel: aml.riskLevel,
    isClean: aml.isClean,
    blacklistMatch: aml.checks.blacklistCheck,
    sanctionsMatch: aml.checks.sanctionsListCheck,
    pepMatch: aml.checks.pep,
    adverseMediaMatch: aml.checks.adverseMedia,
    reviewStatus,
    reviewedAt: aml.checkedAt,
    reviewedBy: aml.checkedBy,
    reviewNotes: aml.reviewNotes,
    depositStatus: deposit.status,
    priority: deposit.priority,
    amlCheckDetails,
    reviewHistory,
    relatedInfo: {
      previousDepositsFromAddress: previousDeposits.length,
      totalVolumeFromAddress: previousDeposits
        .reduce((sum: number, d: DepositTransaction) => sum + parseFloat(d.amountKRW), 0)
        .toFixed(0),
      averageRiskScore: avgRiskScore,
      flaggedCount: flaggedFromAddress,
    },
  };

  return detail;
};

// ============================================================================
// Travel Rule 검증 API
// ============================================================================

/**
 * Travel Rule 필터 적용 헬퍼 함수
 */
const applyTravelRuleFilters = (
  items: TravelRuleQueueItem[],
  filter?: TravelRuleFilter
): TravelRuleQueueItem[] => {
  if (!filter) return items;

  let filtered = [...items];

  if (filter.complianceStatus && filter.complianceStatus.length > 0) {
    filtered = filtered.filter((item) =>
      filter.complianceStatus!.includes(item.complianceStatus)
    );
  }

  if (filter.addressType && filter.addressType.length > 0) {
    filtered = filtered.filter((item) =>
      filter.addressType!.includes(item.addressType)
    );
  }

  if (filter.isExceeding !== undefined) {
    filtered = filtered.filter((item) => item.isExceeding === filter.isExceeding);
  }

  if (filter.requiresReturn !== undefined) {
    filtered = filtered.filter((item) => item.requiresReturn === filter.requiresReturn);
  }

  if (filter.violationReason && filter.violationReason.length > 0) {
    filtered = filtered.filter(
      (item) => item.violationReason && filter.violationReason!.includes(item.violationReason)
    );
  }

  if (filter.reviewStatus && filter.reviewStatus.length > 0) {
    filtered = filtered.filter((item) =>
      filter.reviewStatus!.includes(item.reviewStatus)
    );
  }

  if (filter.memberId) {
    filtered = filtered.filter((item) => item.memberId === filter.memberId);
  }

  if (filter.asset && filter.asset.length > 0) {
    filtered = filtered.filter((item) => filter.asset!.includes(item.asset));
  }

  if (filter.dateRange) {
    const start = new Date(filter.dateRange.start);
    const end = new Date(filter.dateRange.end);
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= start && itemDate <= end;
    });
  }

  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.fromAddress.toLowerCase().includes(query) ||
        item.txHash.toLowerCase().includes(query) ||
        item.memberName.toLowerCase().includes(query)
    );
  }

  return filtered;
};

/**
 * Travel Rule 통계 조회
 */
export const getTravelRuleStats = async (): Promise<TravelRuleStats> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const deposits = getDepositsFromStorage();
  const exceedingDeposits = deposits.filter((d) => parseFloat(d.amountKRW) > 1000000);

  // 100만원 초과 거래
  const exceedingVolume = exceedingDeposits.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  // 준수 필요 (VASP 주소 + 정보 필요)
  const requiresCompliance = exceedingDeposits.filter(
    (d) =>
      d.travelRuleCheck?.addressType === 'vasp' &&
      (!d.travelRuleCheck?.vaspInfo?.hasCompleteInfo || d.travelRuleCheck?.complianceStatus === 'pending')
  );
  const requiresComplianceVolume = requiresCompliance.reduce(
    (sum, d) => sum + parseFloat(d.amountKRW || '0'),
    0
  );

  // 위반 (환불 필요)
  const violations = exceedingDeposits.filter((d) => d.travelRuleCheck?.requiresReturn);
  const violationsVolume = violations.reduce((sum, d) => sum + parseFloat(d.amountKRW), 0);

  // 준수 완료
  const compliant = exceedingDeposits.filter(
    (d) =>
      d.travelRuleCheck?.complianceStatus === 'compliant' ||
      (d.travelRuleCheck?.addressType === 'vasp' &&
        d.travelRuleCheck?.vaspInfo?.hasCompleteInfo &&
        d.travelRuleCheck?.vaspInfo?.travelRuleCompliant)
  );
  const compliantVolume = compliant.reduce((sum, d) => sum + parseFloat(d.amountKRW), 0);

  // 주소 타입 분포
  const personalCount = exceedingDeposits.filter(
    (d) => d.travelRuleCheck?.addressType === 'personal'
  ).length;
  const vaspCount = exceedingDeposits.filter(
    (d) => d.travelRuleCheck?.addressType === 'vasp'
  ).length;

  return {
    exceeding: {
      count: exceedingDeposits.length,
      volumeKRW: exceedingVolume.toFixed(0),
    },
    requiresCompliance: {
      count: requiresCompliance.length,
      volumeKRW: requiresComplianceVolume.toFixed(0),
      percentage:
        exceedingDeposits.length > 0
          ? (requiresCompliance.length / exceedingDeposits.length) * 100
          : 0,
    },
    violations: {
      count: violations.length,
      volumeKRW: violationsVolume.toFixed(0),
      percentage:
        exceedingDeposits.length > 0 ? (violations.length / exceedingDeposits.length) * 100 : 0,
    },
    compliant: {
      count: compliant.length,
      volumeKRW: compliantVolume.toFixed(0),
    },
    addressTypeDistribution: {
      personal: personalCount,
      vasp: vaspCount,
    },
  };
};

/**
 * Travel Rule 검증 대기열 조회
 */
export const getTravelRuleQueue = async (
  request?: GetTravelRuleQueueRequest
): Promise<GetTravelRuleQueueResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const deposits = getDepositsFromStorage();
  const members = mockDb.getMembers();

  // 100만원 초과 입금만 필터링하여 TravelRuleQueueItem으로 변환
  const items: TravelRuleQueueItem[] = deposits
    .filter((d) => parseFloat(d.amountKRW) > 1000000)
    .map((deposit) => {
      const member = members.find((m: Member) => m.id === deposit.memberId);
      const tr = deposit.travelRuleCheck;

      // 준수 상태 결정
      let complianceStatus: TravelRuleComplianceStatus = 'pending';
      if (tr?.complianceStatus) {
        complianceStatus = tr.complianceStatus;
      } else if (tr?.addressType === 'personal') {
        complianceStatus = 'non_compliant';
      } else if (
        tr?.addressType === 'vasp' &&
        tr?.vaspInfo?.hasCompleteInfo &&
        tr?.vaspInfo?.travelRuleCompliant
      ) {
        complianceStatus = 'compliant';
      } else if (tr?.addressType === 'vasp' && !tr?.vaspInfo?.hasCompleteInfo) {
        complianceStatus = 'non_compliant';
      }

      // 검토 상태
      let reviewStatus: 'pending' | 'approved' | 'rejected' = 'pending';
      if (deposit.status === 'credited') reviewStatus = 'approved';
      else if (deposit.status === 'returned') reviewStatus = 'rejected';

      const item: TravelRuleQueueItem = {
        id: `tr-${deposit.id}`,
        depositId: deposit.id,
        txHash: deposit.txHash,
        memberId: deposit.memberId,
        memberName: member ? getMemberName(member) : 'Unknown',
        asset: deposit.asset,
        amount: deposit.amount,
        amountKRW: deposit.amountKRW,
        fromAddress: deposit.fromAddress,
        timestamp: deposit.timestamp,
        isExceeding: true,
        thresholdKRW: '1000000',
        addressType: tr?.addressType || 'personal',
        complianceStatus,
        requiresReturn: tr?.requiresReturn || false,
        violationReason: tr?.violationReason,
        vaspInfo: tr?.vaspInfo,
        reviewStatus,
        reviewedAt: tr?.reviewedAt,
        reviewedBy: tr?.reviewedBy,
        reviewNotes: tr?.reviewNotes,
        depositStatus: deposit.status,
        priority: deposit.priority,
      };

      return item;
    });

  // 필터 적용
  const filtered = applyTravelRuleFilters(items, request?.filter);

  // 정렬
  const sortBy = request?.sortBy || 'timestamp';
  const sortOrder = request?.sortOrder || 'desc';

  filtered.sort((a, b) => {
    let compareValue = 0;

    if (sortBy === 'timestamp') {
      compareValue = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    } else if (sortBy === 'amount') {
      compareValue = parseFloat(a.amountKRW) - parseFloat(b.amountKRW);
    } else if (sortBy === 'complianceStatus') {
      compareValue = a.complianceStatus.localeCompare(b.complianceStatus);
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // 페이지네이션
  const page = request?.page || 1;
  const pageSize = request?.pageSize || 50;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: filtered.length,
    page,
    pageSize,
    hasMore: endIndex < filtered.length,
  };
};

/**
 * Travel Rule 상세 정보 조회
 */
export const getTravelRuleDetail = async (
  depositId: string
): Promise<TravelRuleDetail | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const deposits = getDepositsFromStorage();
  const members = mockDb.getMembers();

  const deposit = deposits.find((d) => d.id === depositId);
  if (!deposit || parseFloat(deposit.amountKRW) <= 1000000) return null;

  const member = members.find((m: Member) => m.id === deposit.memberId);
  const tr = deposit.travelRuleCheck;

  // 준수 상태 결정
  let complianceStatus: TravelRuleComplianceStatus = 'pending';
  if (tr?.complianceStatus) {
    complianceStatus = tr.complianceStatus;
  } else if (tr?.addressType === 'personal') {
    complianceStatus = 'non_compliant';
  } else if (
    tr?.addressType === 'vasp' &&
    tr?.vaspInfo?.hasCompleteInfo &&
    tr?.vaspInfo?.travelRuleCompliant
  ) {
    complianceStatus = 'compliant';
  } else if (tr?.addressType === 'vasp' && !tr?.vaspInfo?.hasCompleteInfo) {
    complianceStatus = 'non_compliant';
  }

  // 검토 상태
  let reviewStatus: 'pending' | 'approved' | 'rejected' = 'pending';
  if (deposit.status === 'credited') reviewStatus = 'approved';
  else if (deposit.status === 'returned') reviewStatus = 'rejected';

  // VASP 상세 정보 (Mock)
  const vaspDetailInfo =
    tr?.addressType === 'vasp' && tr?.vaspInfo
      ? {
          name: tr.vaspInfo.name,
          jurisdiction: 'South Korea',
          licenseNumber: `KR-VASP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          address: {
            streetAddress: '123 Blockchain Street',
            city: 'Seoul',
            country: 'South Korea',
          },
          contactEmail: `compliance@${tr.vaspInfo.name.toLowerCase().replace(/\s/g, '')}.com`,
          contactPhone: '+82-2-1234-5678',
          travelRuleCompliant: tr.vaspInfo.travelRuleCompliant,
          lastComplianceUpdate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      : undefined;

  // 검증 히스토리 타임라인
  const verificationHistory: import('@/types/deposit').VerificationTimelineItem[] = [
    {
      timestamp: deposit.timestamp,
      action: '입금 감지',
      status: 'info' as const,
      description: `${deposit.amount} ${deposit.asset} (${parseFloat(deposit.amountKRW).toLocaleString()}원) 입금 감지`,
    },
    {
      timestamp: new Date(new Date(deposit.timestamp || deposit.detectedAt).getTime() + 500).toISOString(),
      action: 'Travel Rule 금액 체크',
      status: 'warning' as const,
      description: `금액 100만원 초과 (${parseFloat(deposit.amountKRW).toLocaleString()}원) - Travel Rule 적용 대상`,
    },
    {
      timestamp: new Date(new Date(deposit.timestamp || deposit.detectedAt).getTime() + 1000).toISOString(),
      action: '주소 타입 확인',
      status: tr?.addressType === 'vasp' ? ('info' as const) : ('warning' as const),
      description:
        tr?.addressType === 'vasp'
          ? `VASP 주소 확인됨: ${tr.vaspInfo?.name || 'Unknown'}`
          : 'Personal wallet 주소 확인됨 - 한도 초과 위반',
    },
  ];

  if (tr?.addressType === 'vasp') {
    verificationHistory.push({
      timestamp: new Date(new Date(deposit.timestamp || deposit.detectedAt).getTime() + 1500).toISOString(),
      action: 'VASP 정보 검증',
      status: tr.vaspInfo?.hasCompleteInfo ? ('success' as const) : ('error' as const),
      description: tr.vaspInfo?.hasCompleteInfo
        ? 'VASP 정보 완전 - Travel Rule 준수'
        : 'VASP 정보 불완전 - 추가 정보 필요',
    });
  }

  if (complianceStatus === 'compliant') {
    verificationHistory.push({
      timestamp: tr?.reviewedAt || new Date(new Date(deposit.timestamp).getTime() + 2000).toISOString(),
      action: 'Travel Rule 준수 확인',
      status: 'success' as const,
      description: '모든 Travel Rule 요구사항 충족',
      performedBy: tr?.reviewedBy,
    });
  } else if (tr?.requiresReturn) {
    verificationHistory.push({
      timestamp: new Date(new Date(deposit.timestamp || deposit.detectedAt).getTime() + 2000).toISOString(),
      action: 'Travel Rule 위반 판정',
      status: 'error' as const,
      description: `위반 사유: ${tr.violationReason || 'Unknown'} - 환불 필요`,
    });
  }

  // 관련 정보
  const previousDeposits = deposits.filter(
    (d) => d.fromAddress === deposit.fromAddress && d.id !== deposit.id
  );

  const previousComplianceIssues = previousDeposits.filter(
    (d) => d.travelRuleCheck?.requiresReturn
  ).length;

  const detail: TravelRuleDetail = {
    id: `tr-${deposit.id}`,
    depositId: deposit.id,
    txHash: deposit.txHash,
    memberId: deposit.memberId,
    memberName: member ? getMemberName(member) : 'Unknown',
    asset: deposit.asset,
    amount: deposit.amount,
    amountKRW: deposit.amountKRW,
    fromAddress: deposit.fromAddress,
    timestamp: deposit.timestamp,
    blockNumber: Math.floor(Math.random() * 1000000),
    blockTime: deposit.timestamp,
    networkFee: (parseFloat(deposit.amount) * 0.0001).toFixed(8),
    isExceeding: true,
    thresholdKRW: '1000000',
    addressType: tr?.addressType || 'personal',
    complianceStatus,
    requiresReturn: tr?.requiresReturn || false,
    violationReason: tr?.violationReason,
    vaspInfo: tr?.vaspInfo,
    reviewStatus,
    reviewedAt: tr?.reviewedAt,
    reviewedBy: tr?.reviewedBy,
    reviewNotes: tr?.reviewNotes,
    depositStatus: deposit.status,
    priority: deposit.priority,
    memberInfo: {
      id: deposit.memberId,
      companyName: member ? getMemberName(member) : 'Unknown',
      contactEmail: member?.contacts?.[0]?.email || `contact@${deposit.memberName.toLowerCase().replace(/\s/g, '')}.com`,
      riskScore: deposit.amlCheck?.riskScore || 0,
    },
    vaspDetailInfo,
    originatorInfo: tr?.originatorInfo,
    verificationHistory: verificationHistory as any,
    relatedInfo: {
      previousDepositsFromAddress: previousDeposits.length,
      totalVolumeFromAddress: previousDeposits
        .reduce((sum, d) => sum + parseFloat(d.amountKRW || '0'), 0)
        .toFixed(0),
      previousComplianceIssues,
    },
  };

  return detail;
};

/**
 * Travel Rule 준수 승인
 */
export const approveTravelRuleCompliance = async (
  request: ApproveTravelRuleRequest
): Promise<DepositTransaction> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const deposits = getDepositsFromStorage();
  const index = deposits.findIndex((d) => d.id === request.depositId);

  if (index === -1) {
    throw new Error('Deposit not found');
  }

  const deposit = deposits[index];

  // Travel Rule 준수 승인: 다음 검증 단계로 진행
  deposit.status = 'verifying';

  if (deposit.travelRuleCheck) {
    deposit.travelRuleCheck.complianceStatus = 'compliant';
    deposit.travelRuleCheck.requiresReturn = false;
    deposit.travelRuleCheck.reviewedAt = new Date().toISOString();
    deposit.travelRuleCheck.reviewedBy = request.performedBy;
    deposit.travelRuleCheck.reviewNotes = request.notes || 'Travel Rule compliance approved';
  }

  deposits[index] = deposit;
  saveDepositsToStorage(deposits);

  return deposit;
};

/**
 * Travel Rule 위반으로 환불 처리
 */
export const triggerTravelRuleReturn = async (
  request: TriggerTravelRuleReturnRequest
): Promise<ReturnTransaction> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const deposits = getDepositsFromStorage();
  const deposit = deposits.find((d) => d.id === request.depositId);

  if (!deposit) {
    throw new Error('Deposit not found');
  }

  // 환불 거래 생성 (Travel Rule 위반 사유 포함)
  const returnTx: ReturnTransaction = {
    id: `return-tr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    depositId: request.depositId,
    originalTxHash: deposit.txHash,
    amount: deposit.amount,
    currency: deposit.asset,
    returnAddress: deposit.fromAddress,
    reason: `travel_rule_${request.reason}` as DepositReturnReason,
    status: 'pending',
    networkFee: (parseFloat(deposit.amount) * 0.001).toFixed(8),
    returnAmount: (parseFloat(deposit.amount) * 0.999).toFixed(8),
  };

  // 환불 목록에 추가
  const returns = getReturnsFromStorage();
  returns.push(returnTx);
  saveReturnsToStorage(returns);

  // 입금 상태 업데이트
  const index = deposits.findIndex((d) => d.id === request.depositId);
  deposits[index].status = 'returned';
  deposits[index].returnedAt = new Date().toISOString();
  deposits[index].returnInfo = {
    reason: returnTx.reason,
    networkFee: returnTx.networkFee,
    returnedAmount: returnTx.returnAmount,
  };

  // Travel Rule 체크 정보 업데이트
  if (deposits[index].travelRuleCheck) {
    deposits[index].travelRuleCheck!.complianceStatus = 'non_compliant';
    deposits[index].travelRuleCheck!.requiresReturn = true;
    deposits[index].travelRuleCheck!.violationReason = request.reason;
    deposits[index].travelRuleCheck!.reviewedAt = new Date().toISOString();
    deposits[index].travelRuleCheck!.reviewedBy = request.performedBy;
    deposits[index].travelRuleCheck!.reviewNotes =
      request.notes || `Travel Rule violation: ${request.reason}`;
  }

  saveDepositsToStorage(deposits);

  return returnTx;
};

// ============================================================================
// 환불 Mock 데이터 생성
// ============================================================================

/**
 * Mock 환불 데이터 생성
 * - 기존 deposit 데이터 중 returned/flagged 상태인 것들로부터 생성
 * - 다양한 환불 사유와 상태 포함
 */
export const generateMockReturns = (count: number = 20): ReturnTransaction[] => {
  const deposits = getDepositsFromStorage();

  if (deposits.length === 0) {
    console.warn('⚠️ No deposits found. Please generate deposit data first.');
    return [];
  }

  const returns: ReturnTransaction[] = [];

  // 환불 사유 분포
  const reasonDistribution: { reason: DepositReturnReason; weight: number }[] = [
    { reason: 'member_unregistered_address', weight: 0.30 },
    { reason: 'travel_rule_violation', weight: 0.25 },
    { reason: 'daily_limit_exceeded', weight: 0.20 },
    { reason: 'aml_flag', weight: 0.15 },
    { reason: 'no_permission', weight: 0.10 },
  ];

  // 상태 분포
  const statusDistribution: { status: 'pending' | 'processing' | 'completed' | 'failed'; weight: number }[] = [
    { status: 'pending', weight: 0.40 },
    { status: 'processing', weight: 0.20 },
    { status: 'completed', weight: 0.35 },
    { status: 'failed', weight: 0.05 },
  ];

  // Weighted random selection helper
  const weightedRandom = <T extends { weight: number }>(items: T[]): T => {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of items) {
      random -= item.weight;
      if (random <= 0) return item;
    }

    return items[items.length - 1];
  };

  for (let i = 0; i < count; i++) {
    // 랜덤 deposit 선택
    const deposit = deposits[Math.floor(Math.random() * deposits.length)];

    // 환불 사유 및 상태 선택
    const { reason } = weightedRandom(reasonDistribution);
    const { status } = weightedRandom(statusDistribution);

    // 네트워크 수수료 계산 (0.1% ~ 0.2%)
    const feeRate = 0.001 + Math.random() * 0.001;
    const networkFee = (parseFloat(deposit.amount) * feeRate).toFixed(8);
    const returnAmount = (parseFloat(deposit.amount) - parseFloat(networkFee)).toFixed(8);

    // 시간 계산
    const createdTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const processedTime = new Date(createdTime.getTime() + Math.random() * 30 * 60 * 1000);
    const completedTime = status === 'completed'
      ? new Date(processedTime.getTime() + Math.random() * 60 * 60 * 1000)
      : undefined;

    const returnTx: ReturnTransaction = {
      id: `return-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      depositId: deposit.id,
      originalTxHash: deposit.txHash,
      returnTxHash: status === 'completed'
        ? `0x${Math.random().toString(36).substr(2, 64)}`
        : undefined,
      amount: deposit.amount,
      currency: deposit.asset,
      returnAddress: deposit.fromAddress,
      reason,
      status,
      networkFee,
      returnAmount,
      processedAt: processedTime.toISOString(),
      completedAt: completedTime?.toISOString(),
      failureReason: status === 'failed'
        ? ['Network congestion', 'Insufficient gas', 'Address validation failed'][Math.floor(Math.random() * 3)]
        : undefined,
    };

    returns.push(returnTx);
  }

  // 최신순 정렬
  returns.sort((a, b) =>
    new Date(b.processedAt || 0).getTime() - new Date(a.processedAt || 0).getTime()
  );

  return returns;
};

/**
 * Mock 환불 데이터 초기화
 */
export const initializeMockReturns = (): void => {
  if (typeof window === 'undefined') return;

  const existing = getReturnsFromStorage();
  if (existing.length === 0) {
    const deposits = getDepositsFromStorage();

    if (deposits.length === 0) {
      console.warn('⚠️ Cannot initialize returns: No deposits found. Please initialize deposits first.');
      return;
    }

    const mockReturns = generateMockReturns(20);
    if (mockReturns.length > 0) {
      saveReturnsToStorage(mockReturns);
      console.log(`✅ Mock return data initialized (${mockReturns.length} returns)`);
    }
  } else {
    console.log(`ℹ️ ${existing.length} returns already exist.`);
  }
};