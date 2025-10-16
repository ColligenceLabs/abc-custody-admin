// ============================================================================
// 출금 관리 API 서비스
// ============================================================================
// Task 4.1: 출금 요청 처리 시스템
// 용도: 출금 대기열, 우선순위 관리, 주소 검증, 한도 체크
// ============================================================================

import {
  Withdrawal,
  WithdrawalStatus,
  WithdrawalPriority,
  WithdrawalQueueFilter,
  WithdrawalQueueSort,
  WithdrawalStatistics,
  WithdrawalQueueResponse,
  ApproveWithdrawalRequest,
  RejectWithdrawalRequest,
  UpdatePriorityRequest,
  VerifyAddressRequest,
  CheckLimitRequest,
  AddressVerificationResult,
  DailyLimitCheck,
  // Task 4.2: AML 검증 관련 타입
  WithdrawalAMLCheck,
  WithdrawalAMLStats,
  WithdrawalAMLFilter,
  AMLReviewStatus,
  RiskLevel,
  ApproveAMLRequest,
  RejectAMLRequest,
  FlagAMLRequest,
} from "@/types/withdrawal";

// ============================================================================
// Mock Database 저장소 키
// ============================================================================

const WITHDRAWAL_STORAGE_KEY = "custody_admin_withdrawals";

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * LocalStorage에서 출금 데이터 로드
 */
function loadWithdrawals(): Withdrawal[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem(WITHDRAWAL_STORAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse withdrawals:", error);
    return [];
  }
}

/**
 * LocalStorage에 출금 데이터 저장
 */
function saveWithdrawals(withdrawals: Withdrawal[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(WITHDRAWAL_STORAGE_KEY, JSON.stringify(withdrawals));
  } catch (error) {
    console.error("Failed to save withdrawals:", error);
  }
}

/**
 * 대기 시간 계산 (분)
 */
function calculateWaitingTime(requestedAt: string): number {
  const now = new Date();
  const requested = new Date(requestedAt);
  const diff = now.getTime() - requested.getTime();
  return Math.floor(diff / (1000 * 60));
}

/**
 * 우선순위 자동 계산
 */
function calculatePriority(
  amount: string,
  memberPlanType: string,
  waitingTimeMinutes: number
): WithdrawalPriority {
  const amountNum = parseFloat(amount);

  // 긴급 조건
  if (
    memberPlanType === "enterprise" || // VIP 고객
    amountNum > 1_000_000_000 || // 10억원 초과
    waitingTimeMinutes > 120 // 2시간 이상 대기
  ) {
    return "urgent";
  }

  // 낮은 우선순위 조건
  if (amountNum < 100_000_000) {
    // 1억원 미만
    return "low";
  }

  // 기본: 일반 우선순위
  return "normal";
}

// ============================================================================
// API 함수
// ============================================================================

/**
 * 출금 대기열 조회
 */
export async function getWithdrawalQueue(
  filters?: WithdrawalQueueFilter,
  sort?: WithdrawalQueueSort
): Promise<WithdrawalQueueResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let withdrawals = loadWithdrawals();

  // 대기 시간 업데이트
  withdrawals = withdrawals.map((w) => ({
    ...w,
    waitingTimeMinutes: calculateWaitingTime(w.requestedAt),
  }));

  // 필터 적용
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      withdrawals = withdrawals.filter((w) =>
        filters.status!.includes(w.status)
      );
    }

    if (filters.priority && filters.priority.length > 0) {
      withdrawals = withdrawals.filter((w) =>
        filters.priority!.includes(w.priority)
      );
    }

    if (filters.memberId) {
      withdrawals = withdrawals.filter(
        (w) => w.memberId === filters.memberId
      );
    }

    if (filters.assetSymbol) {
      withdrawals = withdrawals.filter(
        (w) => w.assetSymbol === filters.assetSymbol
      );
    }

    if (filters.dateRange) {
      const from = new Date(filters.dateRange.from);
      const to = new Date(filters.dateRange.to);
      withdrawals = withdrawals.filter((w) => {
        const requestedAt = new Date(w.requestedAt);
        return requestedAt >= from && requestedAt <= to;
      });
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      withdrawals = withdrawals.filter(
        (w) =>
          w.memberInfo.companyName.toLowerCase().includes(term) ||
          w.toAddress.toLowerCase().includes(term)
      );
    }
  }

  // 정렬
  if (sort) {
    withdrawals.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case "requestedAt":
          aValue = new Date(a.requestedAt).getTime();
          bValue = new Date(b.requestedAt).getTime();
          break;
        case "amount":
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case "priority":
          const priorityOrder = { urgent: 3, normal: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case "waitingTime":
          aValue = a.waitingTimeMinutes;
          bValue = b.waitingTimeMinutes;
          break;
        case "riskScore":
          aValue = a.amlReview.riskScore;
          bValue = b.amlReview.riskScore;
          break;
        case "memberName":
          aValue = a.memberInfo.companyName;
          bValue = b.memberInfo.companyName;
          break;
        default:
          return 0;
      }

      if (sort.direction === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  } else {
    // 기본 정렬: 우선순위 높은 순 → 요청 시간 오래된 순
    withdrawals.sort((a, b) => {
      const priorityOrder = { urgent: 3, normal: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];

      if (priorityDiff !== 0) return priorityDiff;

      return (
        new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
      );
    });
  }

  // 통계 계산
  const statistics = calculateStatistics(loadWithdrawals());

  return {
    withdrawals,
    statistics,
    totalCount: withdrawals.length,
    pagination: {
      page: 1,
      pageSize: withdrawals.length,
      totalPages: 1,
    },
  };
}

/**
 * 출금 상세 조회
 */
export async function getWithdrawal(withdrawalId: string): Promise<Withdrawal> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const withdrawals = loadWithdrawals();
  const withdrawal = withdrawals.find((w) => w.id === withdrawalId);

  if (!withdrawal) {
    throw new Error("Withdrawal not found");
  }

  // 대기 시간 업데이트
  return {
    ...withdrawal,
    waitingTimeMinutes: calculateWaitingTime(withdrawal.requestedAt),
  };
}

/**
 * 우선순위 변경
 */
export async function updatePriority(
  request: UpdatePriorityRequest,
  adminId: string,
  adminName: string
): Promise<Withdrawal> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const withdrawals = loadWithdrawals();
  const index = withdrawals.findIndex((w) => w.id === request.withdrawalId);

  if (index === -1) {
    throw new Error("Withdrawal not found");
  }

  const withdrawal = withdrawals[index];
  const oldPriority = withdrawal.priority;

  // 우선순위 변경 이력 추가
  const priorityChange = {
    id: `pc_${Date.now()}`,
    fromPriority: oldPriority,
    toPriority: request.priority,
    reason: request.reason,
    changedBy: {
      adminId,
      adminName,
    },
    changedAt: new Date().toISOString(),
  };

  withdrawal.priority = request.priority;
  withdrawal.priorityHistory.push(priorityChange);

  withdrawals[index] = withdrawal;
  saveWithdrawals(withdrawals);

  return withdrawal;
}

/**
 * 주소 검증
 */
export async function verifyWithdrawalAddress(
  request: VerifyAddressRequest
): Promise<AddressVerificationResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock: 회원사 등록 주소 조회 (실제로는 memberApi.getMemberAddresses 호출)
  // 여기서는 간단히 Mock 데이터로 시뮬레이션

  // 검증된 주소 시뮬레이션 (실제로는 DB 조회)
  const isRegistered = Math.random() > 0.3; // 70% 확률로 등록된 주소
  const hasWithdrawPermission = isRegistered && Math.random() > 0.1; // 90% 확률로 출금 권한
  const isBlocked = isRegistered && Math.random() < 0.05; // 5% 확률로 차단

  let status: AddressVerificationResult["status"];
  let message: string;

  if (isBlocked) {
    status = "blocked";
    message = "차단된 주소입니다. 출금이 불가능합니다.";
  } else if (!isRegistered) {
    status = "unregistered";
    message = "회원사에 등록되지 않은 주소입니다. 관리자 승인이 필요합니다.";
  } else if (!hasWithdrawPermission) {
    status = "no_permission";
    message = "출금 권한이 없는 주소입니다.";
  } else {
    status = "verified";
    message = "검증된 주소입니다. 출금 가능합니다.";
  }

  return {
    status,
    message,
    addressInfo:
      isRegistered && !isBlocked
        ? {
            addressId: `addr_${Math.random().toString(36).substr(2, 9)}`,
            label: "Corporate Wallet",
            addressType: "corporate",
            registeredAt: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            permissions: {
              canDeposit: true,
              canWithdraw: hasWithdrawPermission,
            },
            status: isBlocked ? "blocked" : "active",
            dailyLimit: undefined, // Corporate는 한도 없음
          }
        : undefined,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * 일일 한도 체크
 */
export async function checkDailyLimit(
  request: CheckLimitRequest
): Promise<DailyLimitCheck> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock: 회원사 한도 및 사용량 조회
  const dailyLimit = "10000000000"; // 100억원
  const usedToday = (Math.random() * 5000000000).toFixed(0); // 0-50억원
  const pendingAmount = (Math.random() * 2000000000).toFixed(0); // 0-20억원

  const totalUsed = (
    parseFloat(usedToday) + parseFloat(pendingAmount)
  ).toFixed(0);
  const remainingLimit = (
    parseFloat(dailyLimit) - parseFloat(totalUsed)
  ).toFixed(0);
  const isWithinLimit = parseFloat(remainingLimit) >= parseFloat(request.amount);
  const usagePercentage = Math.min(
    100,
    (parseFloat(totalUsed) / parseFloat(dailyLimit)) * 100
  );

  // 다음 날 00:00에 리셋
  const resetAt = new Date();
  resetAt.setDate(resetAt.getDate() + 1);
  resetAt.setHours(0, 0, 0, 0);

  return {
    dailyLimit,
    usedToday,
    pendingAmount,
    totalUsed,
    remainingLimit,
    requestAmount: request.amount,
    isWithinLimit,
    usagePercentage,
    limitType: "member",
    resetAt: resetAt.toISOString(),
  };
}

/**
 * 출금 승인
 */
export async function approveWithdrawal(
  request: ApproveWithdrawalRequest,
  adminId: string,
  adminName: string
): Promise<Withdrawal> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const withdrawals = loadWithdrawals();
  const index = withdrawals.findIndex((w) => w.id === request.withdrawalId);

  if (index === -1) {
    throw new Error("Withdrawal not found");
  }

  const withdrawal = withdrawals[index];

  if (withdrawal.status !== "pending" && withdrawal.status !== "aml_review") {
    throw new Error("Withdrawal cannot be approved in current status");
  }

  withdrawal.status = "approved";
  withdrawal.approvedAt = new Date().toISOString();
  withdrawal.approvedBy = {
    adminId,
    adminName,
  };
  if (request.notes) {
    withdrawal.notes = request.notes;
  }

  withdrawals[index] = withdrawal;
  saveWithdrawals(withdrawals);

  return withdrawal;
}

/**
 * 출금 거부
 */
export async function rejectWithdrawal(
  request: RejectWithdrawalRequest,
  adminId: string,
  adminName: string
): Promise<Withdrawal> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const withdrawals = loadWithdrawals();
  const index = withdrawals.findIndex((w) => w.id === request.withdrawalId);

  if (index === -1) {
    throw new Error("Withdrawal not found");
  }

  const withdrawal = withdrawals[index];

  withdrawal.status = "rejected";
  withdrawal.rejectedAt = new Date().toISOString();
  withdrawal.rejectionReason = request.reason;
  withdrawal.rejectionNote = request.note;
  withdrawal.rejectedBy = {
    adminId,
    adminName,
  };

  withdrawals[index] = withdrawal;
  saveWithdrawals(withdrawals);

  return withdrawal;
}

/**
 * 통계 계산
 */
function calculateStatistics(
  withdrawals: Withdrawal[]
): WithdrawalStatistics {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const pending = withdrawals.filter((w) => w.status === "pending");
  const amlReview = withdrawals.filter((w) => w.status === "aml_review");
  const approved = withdrawals.filter((w) => w.status === "approved");
  const completedToday = withdrawals.filter(
    (w) =>
      w.status === "confirmed" &&
      w.confirmedAt &&
      new Date(w.confirmedAt) >= todayStart
  );
  const rejectedToday = withdrawals.filter(
    (w) =>
      w.status === "rejected" &&
      w.rejectedAt &&
      new Date(w.rejectedAt) >= todayStart
  );

  const sumAmount = (items: Withdrawal[]) =>
    items.reduce((sum, w) => sum + parseFloat(w.amount), 0).toFixed(0);

  // 평균 처리 시간 계산 (오늘 완료된 건)
  const processingTimes = completedToday
    .filter((w) => w.confirmedAt)
    .map((w) => {
      const requested = new Date(w.requestedAt).getTime();
      const confirmed = new Date(w.confirmedAt!).getTime();
      return (confirmed - requested) / (1000 * 60); // 분 단위
    });

  const averageProcessingTime =
    processingTimes.length > 0
      ? Math.round(
          processingTimes.reduce((sum, time) => sum + time, 0) /
            processingTimes.length
        )
      : 0;

  return {
    pending: {
      count: pending.length,
      totalAmount: sumAmount(pending),
    },
    amlReview: {
      count: amlReview.length,
      totalAmount: sumAmount(amlReview),
    },
    approved: {
      count: approved.length,
      totalAmount: sumAmount(approved),
    },
    completedToday: {
      count: completedToday.length,
      totalAmount: sumAmount(completedToday),
    },
    rejectedToday: {
      count: rejectedToday.length,
      totalAmount: sumAmount(rejectedToday),
    },
    byPriority: {
      urgent: withdrawals.filter((w) => w.priority === "urgent").length,
      normal: withdrawals.filter((w) => w.priority === "normal").length,
      low: withdrawals.filter((w) => w.priority === "low").length,
    },
    averageProcessingTime,
  };
}

// ============================================================================
// Mock 데이터 생성
// ============================================================================

/**
 * Mock 출금 데이터 생성
 */
export function generateMockWithdrawals(count: number = 20): Withdrawal[] {
  const members = [
    { id: "mem_001", name: "코빗", businessNumber: "123-45-67890", plan: "enterprise" as const },
    { id: "mem_002", name: "업비트", businessNumber: "234-56-78901", plan: "premium" as const },
    { id: "mem_003", name: "빗썸", businessNumber: "345-67-89012", plan: "standard" as const },
    { id: "mem_004", name: "코인원", businessNumber: "456-78-90123", plan: "basic" as const },
  ];

  const assets = [
    { symbol: "BTC", network: "Bitcoin" },
    { symbol: "ETH", network: "Ethereum" },
    { symbol: "USDT", network: "Ethereum" },
    { symbol: "XRP", network: "Ripple" },
  ];

  const statuses: WithdrawalStatus[] = [
    "pending",
    "aml_review",
    "approved",
    "signing",
    "confirmed",
  ];

  const withdrawals: Withdrawal[] = [];

  for (let i = 0; i < count; i++) {
    const member = members[Math.floor(Math.random() * members.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = (
      Math.random() * 10000000000 +
      100000000
    ).toFixed(0); // 1억~100억
    const networkFee = (Math.random() * 100000 + 10000).toFixed(0); // 1만~10만
    const requestedAt = new Date(
      Date.now() - Math.random() * 24 * 60 * 60 * 1000
    ).toISOString(); // 최근 24시간
    const waitingTimeMinutes = calculateWaitingTime(requestedAt);
    const priority = calculatePriority(amount, member.plan, waitingTimeMinutes);

    // 주소 검증 상태 시뮬레이션
    const addressVerified = Math.random() > 0.2;
    const addressVerification: AddressVerificationResult = {
      status: addressVerified ? "verified" : "unregistered",
      message: addressVerified
        ? "검증된 주소입니다."
        : "미등록 주소입니다.",
      addressInfo: addressVerified
        ? {
            addressId: `addr_${i}`,
            label: `Wallet ${i}`,
            addressType: "corporate",
            registeredAt: new Date(
              Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
            ).toISOString(),
            permissions: {
              canDeposit: true,
              canWithdraw: true,
            },
            status: "active",
          }
        : undefined,
      verifiedAt: requestedAt,
    };

    // 한도 체크
    const dailyLimit = "10000000000";
    const usedToday = (Math.random() * 5000000000).toFixed(0);
    const pendingAmount = (Math.random() * 2000000000).toFixed(0);
    const totalUsed = (parseFloat(usedToday) + parseFloat(pendingAmount)).toString();
    const remainingLimit = (parseFloat(dailyLimit) - parseFloat(totalUsed)).toString();
    const limitCheck: DailyLimitCheck = {
      dailyLimit,
      usedToday,
      pendingAmount,
      totalUsed,
      remainingLimit,
      requestAmount: amount,
      isWithinLimit: parseFloat(remainingLimit) >= parseFloat(amount),
      usagePercentage: (parseFloat(totalUsed) / parseFloat(dailyLimit)) * 100,
      limitType: "member",
      resetAt: new Date(
        new Date().setHours(24, 0, 0, 0)
      ).toISOString(),
    };

    // AML 검토
    const riskScore = Math.floor(Math.random() * 100);
    const amlReview = {
      status: (riskScore > 70
        ? "flagged"
        : riskScore > 40
        ? "pending"
        : "approved") as "pending" | "approved" | "flagged",
      riskScore,
      sanctionCheck: {
        isOnSanctionList: riskScore > 80,
        matchedLists: riskScore > 80 ? ["OFAC", "UN"] : [],
      },
      adverseMediaCheck: {
        hasNegativeNews: riskScore > 70,
        newsCount: riskScore > 70 ? Math.floor(Math.random() * 5) + 1 : 0,
      },
    };

    withdrawals.push({
      id: `wth_${Date.now()}_${i}`,
      memberId: member.id,
      memberInfo: {
        companyName: member.name,
        businessNumber: member.businessNumber,
        planType: member.plan,
      },
      assetSymbol: asset.symbol,
      network: asset.network,
      amount,
      toAddress: `0x${Math.random().toString(36).substr(2, 40)}`,
      networkFee,
      netAmount: (parseFloat(amount) - parseFloat(networkFee)).toFixed(0),
      priority,
      priorityHistory: [],
      status,
      addressVerification,
      limitCheck,
      amlReview,
      requestedAt,
      waitingTimeMinutes,
      ...(status === "approved" && {
        approvedAt: new Date(
          new Date(requestedAt).getTime() + Math.random() * 60 * 60 * 1000
        ).toISOString(),
        approvedBy: {
          adminId: "admin_001",
          adminName: "관리자",
        },
      }),
      ...(status === "confirmed" && {
        confirmedAt: new Date(
          new Date(requestedAt).getTime() + Math.random() * 2 * 60 * 60 * 1000
        ).toISOString(),
        txHash: `0x${Math.random().toString(36).substr(2, 64)}`,
      }),
    });
  }

  return withdrawals;
}

/**
 * Mock 데이터 초기화
 */
export function initializeMockWithdrawals(): void {
  const existing = loadWithdrawals();
  if (existing.length === 0) {
    const mockData = generateMockWithdrawals(20);
    saveWithdrawals(mockData);
    console.log("✅ Mock withdrawal data initialized:", mockData.length);
  }
}

/**
 * Mock 데이터 리셋
 */
export function resetWithdrawalDatabase(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WITHDRAWAL_STORAGE_KEY);
  console.log("✅ Withdrawal database reset");
}

// ============================================================================
// Task 4.2: 출금 AML 검증 시스템
// ============================================================================

/**
 * AML 자동 스크리닝 수행
 */
function performAMLScreening(withdrawal: Withdrawal): WithdrawalAMLCheck {
  const amountKRW = parseFloat(withdrawal.amount);

  // 리스크 점수 계산 (기본: 랜덤 + 규칙 기반)
  let riskScore = Math.floor(Math.random() * 100);

  // 1억원 이상: 리스크 +20
  if (amountKRW >= 100_000_000) {
    riskScore = Math.min(100, riskScore + 20);
  }

  // 특정 주소 패턴으로 블랙리스트 시뮬레이션
  const addressLower = withdrawal.toAddress.toLowerCase();
  const isBlacklisted = addressLower.includes("blacklist") || addressLower.includes("0xdead");
  const isSanctioned = addressLower.includes("sanction") || addressLower.includes("0xbad");

  if (isBlacklisted) riskScore = 95;
  if (isSanctioned) riskScore = 100;

  // 리스크 레벨 결정
  let riskLevel: RiskLevel;
  if (riskScore >= 80) riskLevel = "critical";
  else if (riskScore >= 60) riskLevel = "high";
  else if (riskScore >= 40) riskLevel = "medium";
  else riskLevel = "low";

  // 수동 검토 필요 여부
  const requiresManualReview =
    riskScore >= 60 ||
    amountKRW >= 100_000_000 ||
    isBlacklisted ||
    isSanctioned;

  // 초기 상태 결정
  let status: AMLReviewStatus;
  if (isBlacklisted || isSanctioned || riskScore >= 80) {
    status = "flagged";
  } else if (requiresManualReview) {
    status = "pending";
  } else {
    status = "approved";
  }

  // PEP 체크 시뮬레이션 (리스크 70 이상)
  const isPEP = riskScore >= 70;

  // 부정적 미디어 체크 (리스크 65 이상)
  const hasNegativeNews = riskScore >= 65;

  return {
    id: `aml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    withdrawalId: withdrawal.id,
    memberId: withdrawal.memberId,
    memberInfo: {
      companyName: withdrawal.memberInfo.companyName,
      businessNumber: withdrawal.memberInfo.businessNumber,
    },
    withdrawal: {
      asset: withdrawal.assetSymbol,
      amount: withdrawal.amount,
      amountInKRW: withdrawal.amount, // 실제로는 환율 적용 필요
      toAddress: withdrawal.toAddress,
      network: withdrawal.network,
    },
    checks: {
      blacklistCheck: {
        isListed: isBlacklisted,
        source: isBlacklisted ? "Chainalysis" : undefined,
        details: isBlacklisted ? "Known scam address" : undefined,
      },
      sanctionsCheck: {
        isListed: isSanctioned,
        sanctionType: isSanctioned ? "OFAC" : undefined,
        listName: isSanctioned ? "SDN List" : undefined,
      },
      riskScore,
      riskLevel,
      travelRuleCompliant: true, // 실제로는 Travel Rule 검증 필요
      addressType: Math.random() > 0.5 ? "personal" : "vasp",
      pepCheck: {
        isPEP,
        pepCategory: isPEP ? "Political Figure" : undefined,
      },
      adverseMediaCheck: {
        hasNegativeNews,
        newsCount: hasNegativeNews ? Math.floor(Math.random() * 5) + 1 : 0,
        severity: hasNegativeNews ?
          (riskScore >= 80 ? "high" : riskScore >= 65 ? "medium" : "low") : undefined,
      },
    },
    flags: {
      isLargeAmount: amountKRW >= 100_000_000,
      registeredAddressVerified: withdrawal.addressVerification.status === "verified",
      isNewAddress: Math.random() > 0.7, // 30% 확률로 새 주소
      unusualPattern: riskScore >= 70, // 높은 리스크일 경우 비정상 패턴
    },
    requiresManualReview,
    status,
    createdAt: withdrawal.requestedAt,
    updatedAt: withdrawal.requestedAt,
  };
}

/**
 * 출금 AML 검토 대기열 조회
 */
export async function getWithdrawalAMLQueue(
  filters?: WithdrawalAMLFilter
): Promise<WithdrawalAMLCheck[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 모든 출금 데이터 로드
  let withdrawals = loadWithdrawals();

  // AML 검토 필요한 출금만 필터링 (status: aml_review 또는 pending)
  withdrawals = withdrawals.filter(
    (w) => w.status === "aml_review" || w.status === "pending"
  );

  // 각 출금에 대해 AML 스크리닝 수행
  let amlChecks = withdrawals.map(performAMLScreening);

  // 필터 적용
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      amlChecks = amlChecks.filter((check) =>
        filters.status!.includes(check.status)
      );
    }

    if (filters.riskLevel && filters.riskLevel.length > 0) {
      amlChecks = amlChecks.filter((check) =>
        filters.riskLevel!.includes(check.checks.riskLevel)
      );
    }

    if (filters.memberId) {
      amlChecks = amlChecks.filter(
        (check) => check.memberId === filters.memberId
      );
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      amlChecks = amlChecks.filter(
        (check) =>
          check.memberInfo.companyName.toLowerCase().includes(term) ||
          check.withdrawal.toAddress.toLowerCase().includes(term) ||
          check.withdrawalId.toLowerCase().includes(term)
      );
    }

    if (filters.largeAmountOnly) {
      amlChecks = amlChecks.filter((check) => check.flags.isLargeAmount);
    }

    if (filters.manualReviewOnly) {
      amlChecks = amlChecks.filter((check) => check.requiresManualReview);
    }
  }

  // 정렬: 리스크 점수 높은 순 → 금액 높은 순
  amlChecks.sort((a, b) => {
    const riskDiff = b.checks.riskScore - a.checks.riskScore;
    if (riskDiff !== 0) return riskDiff;

    return parseFloat(b.withdrawal.amountInKRW) - parseFloat(a.withdrawal.amountInKRW);
  });

  return amlChecks;
}

/**
 * 출금 AML 통계 조회
 */
export async function getWithdrawalAMLStats(): Promise<WithdrawalAMLStats> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const checks = await getWithdrawalAMLQueue();

  const pending = checks.filter((c) => c.status === "pending");
  const approved = checks.filter((c) => c.status === "approved");
  const flagged = checks.filter((c) => c.status === "flagged");
  const rejected = checks.filter((c) => c.status === "rejected");

  const sumAmount = (items: WithdrawalAMLCheck[]) =>
    items
      .reduce((sum, c) => sum + parseFloat(c.withdrawal.amountInKRW), 0)
      .toFixed(0);

  const averageRiskScore =
    checks.length > 0
      ? Math.round(
          checks.reduce((sum, c) => sum + c.checks.riskScore, 0) / checks.length
        )
      : 0;

  const highRiskCount = checks.filter((c) => c.checks.riskScore >= 60).length;
  const largeAmountCount = checks.filter((c) => c.flags.isLargeAmount).length;

  return {
    pending: {
      count: pending.length,
      totalAmount: sumAmount(pending),
    },
    approved: {
      count: approved.length,
      totalAmount: sumAmount(approved),
    },
    flagged: {
      count: flagged.length,
      totalAmount: sumAmount(flagged),
    },
    rejected: {
      count: rejected.length,
      totalAmount: sumAmount(rejected),
    },
    averageRiskScore,
    highRiskCount,
    largeAmountCount,
  };
}

/**
 * 출금 AML 승인
 */
export async function approveWithdrawalAML(
  request: ApproveAMLRequest,
  adminId: string,
  adminName: string,
  adminEmail: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // AML 체크 ID에서 출금 ID 추출 (실제로는 별도 저장소에서 조회)
  // 여기서는 간단히 출금 목록에서 aml_review 상태인 항목 업데이트
  const withdrawals = loadWithdrawals();
  const withdrawal = withdrawals.find((w) => w.status === "aml_review");

  if (!withdrawal) {
    throw new Error("Withdrawal not found for AML review");
  }

  // 출금 상태 업데이트: aml_review → approved
  withdrawal.status = "approved";
  withdrawal.approvedAt = new Date().toISOString();
  withdrawal.approvedBy = {
    adminId,
    adminName,
  };
  withdrawal.notes = request.reviewNotes;

  // AML 검토 정보 업데이트
  withdrawal.amlReview.status = "approved";
  withdrawal.amlReview.reviewer = {
    adminId,
    adminName,
  };
  withdrawal.amlReview.reviewedAt = new Date().toISOString();
  withdrawal.amlReview.notes = request.reviewNotes;

  saveWithdrawals(withdrawals);

  console.log(`✅ AML approved: ${request.checkId} by ${adminName}`);
}

/**
 * 출금 AML 거부
 */
export async function rejectWithdrawalAML(
  request: RejectAMLRequest,
  adminId: string,
  adminName: string,
  adminEmail: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const withdrawals = loadWithdrawals();
  const withdrawal = withdrawals.find((w) => w.status === "aml_review");

  if (!withdrawal) {
    throw new Error("Withdrawal not found for AML review");
  }

  // 출금 상태 업데이트: aml_review → rejected
  withdrawal.status = "rejected";
  withdrawal.rejectedAt = new Date().toISOString();
  withdrawal.rejectionReason = "aml_flagged";
  withdrawal.rejectionNote = `${request.details}\n\n검토 노트: ${request.reviewNotes}`;
  withdrawal.rejectedBy = {
    adminId,
    adminName,
  };

  // AML 검토 정보 업데이트
  withdrawal.amlReview.status = "flagged";
  withdrawal.amlReview.reviewer = {
    adminId,
    adminName,
  };
  withdrawal.amlReview.reviewedAt = new Date().toISOString();
  withdrawal.amlReview.notes = request.reviewNotes;

  saveWithdrawals(withdrawals);

  console.log(`⛔ AML rejected: ${request.checkId} by ${adminName}`);
}

/**
 * 출금 AML 플래그 (추가 검토 필요)
 */
export async function flagWithdrawalAML(
  request: FlagAMLRequest,
  adminId: string,
  adminName: string,
  adminEmail: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const withdrawals = loadWithdrawals();
  const withdrawal = withdrawals.find((w) => w.status === "aml_review");

  if (!withdrawal) {
    throw new Error("Withdrawal not found for AML review");
  }

  // AML 검토 정보 업데이트 (상태는 aml_review 유지, 플래그만 추가)
  withdrawal.amlReview.status = "flagged";
  withdrawal.amlReview.reviewer = {
    adminId,
    adminName,
  };
  withdrawal.amlReview.reviewedAt = new Date().toISOString();
  withdrawal.amlReview.notes = `${request.reason}\n\n${request.reviewNotes}`;

  saveWithdrawals(withdrawals);

  console.log(`⚠️ AML flagged: ${request.checkId} by ${adminName}`);
}
