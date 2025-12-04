/**
 * 감사 로그 포맷팅 유틸리티 함수들
 */

export const getActionLabel = (action: string, details?: any): string => {
  const hasRoleChange =
    details?.targetUser?.roleChange?.previousRole &&
    details?.targetUser?.roleChange?.newRole;
  const hasOtherFieldChanges =
    details?.targetUser?.fieldChanges &&
    Object.keys(details.targetUser.fieldChanges).some(
      (field) => field !== "role"
    );

  if (hasRoleChange && hasOtherFieldChanges) return "권한변경 및 수정";
  if (hasRoleChange) return "권한변경";

  if (details?.url || details?.path) {
    const url = details.url || details.path;
    if (url.includes("/send-verification-email")) return "이메일 재발송";
    if (url.includes("/resend-verification")) return "이메일 재발송";
  }

  const actionMap: Record<string, string> = {
    create: "생성",
    read: "조회",
    update: "수정",
    delete: "삭제",
    login: "로그인",
    logout: "로그아웃",
    first_login: "최초 로그인",
    verify_sms: "SMS 인증",
    verify_otp: "OTP 인증",
    upload_logo: "로고 업로드",
    credit: "입금 완료",
    detect: "입금 감지",
    confirm: "입금 확인",
    complete: "출금 완료",
    transfer: "전송중",
    approve: "승인",
    reject: "반려",
    suspend: "정지",
    archive: "반려처리완료",
    aml_review: "보안검증",
    reactivate: "재활성화",
  };

  return actionMap[action] || action;
};

export const getResourceLabel = (resource: string): string => {
  const resourceMap: Record<string, string> = {
    auth: "인증",
    users: "사용자",
    withdrawals: "출금",
    deposits: "입금",
    depositReturns: "입금 환불",
    "deposit-returns": "입금 환불",
    groups: "그룹",
    company: "회사 설정",
    addresses: "주소",
    balances: "잔액",
    settings: "설정",
    supportedTokens: "지원 토큰 설정",
    "/": "사용자",
  };
  return resourceMap[resource] || resource;
};

export const getRoleLabel = (roleValue: string): string => {
  const roleMap: Record<string, string> = {
    super_admin: "슈퍼 관리자",
    system_admin: "시스템 관리자",
    admin: "관리자",
    manager: "매니저",
    operator: "운영자",
    viewer: "뷰어",
    user: "사용자",
  };
  return roleMap[roleValue] || roleValue;
};

export const getMemberTypeLabel = (memberType: string): string => {
  const typeMap: Record<string, string> = {
    individual: "개인회원",
    corporate: "법인회원",
  };
  return typeMap[memberType] || memberType || "-";
};

export const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: "승인 대기",
    budget_pending: "예산 승인 대기",
    active: "활성",
    rejected: "반려됨",
    suspended: "중지됨",
    archived: "처리완료",
    detected: "감지됨",
    confirming: "확인 중",
    confirmed: "확인 완료",
    credited: "입금 반영 완료",
    withdrawal_wait: "출금 대기",
    withdrawal_request: "출금 요청",
    aml_review: "보안검증 중",
    processing: "처리 중",
    transferring: "전송 중",
    success: "완료",
    completed: "완료",
    cancelled: "취소됨",
    failed: "실패",
    blockchain_failed: "블록체인 실패",
    withdrawal_stopped: "출금 중지",
  };
  return statusMap[status] || status;
};

export const getResultLabel = (result: string): string => {
  return result === "SUCCESS" ? "성공" : "실패";
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDateTime(dateString);
};

export const parseUserAgent = (userAgent: string | null | undefined): { browser: string; os: string } => {
  if (!userAgent) return { browser: "-", os: "-" };

  let browser = "Unknown";
  const chromeMatch = userAgent.match(/Chrome\/([\d]+)/);
  const firefoxMatch = userAgent.match(/Firefox\/([\d]+)/);
  const safariMatch = userAgent.match(/Safari\/([\d]+)/);
  const edgeMatch = userAgent.match(/Edge\/([\d]+)/);

  if (edgeMatch) {
    browser = `Edge ${edgeMatch[1]}`;
  } else if (chromeMatch && !userAgent.includes("Edge")) {
    browser = `Chrome ${chromeMatch[1]}`;
  } else if (firefoxMatch) {
    browser = `Firefox ${firefoxMatch[1]}`;
  } else if (safariMatch && !userAgent.includes("Chrome")) {
    browser = `Safari ${safariMatch[1]}`;
  }

  let os = "Unknown";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  return { browser, os };
};

export const truncateDynamic = (text: string, maxChars: number): string => {
  if (!text || text.length <= maxChars) return text;
  const dotsLength = 3;
  const availableChars = maxChars - dotsLength;
  const frontChars = Math.ceil(availableChars * 0.65);
  const backChars = availableChars - frontChars;
  return text.slice(0, frontChars) + "..." + text.slice(-backChars);
};

export const getFieldLabel = (field: string): string => {
  const fieldLabels: Record<string, string> = {
    name: "이름",
    email: "이메일",
    phone: "전화번호",
    department: "부서",
    position: "직책",
    role: "역할",
    status: "상태",
  };
  return fieldLabels[field] || field;
};

// 필터 옵션 상수
export const ACTION_OPTIONS = [
  { value: "", label: "전체" },
  { value: "login", label: "로그인" },
  { value: "logout", label: "로그아웃" },
  { value: "first_login", label: "최초 로그인" },
  { value: "create", label: "생성" },
  { value: "read", label: "조회" },
  { value: "update", label: "수정" },
  { value: "delete", label: "삭제" },
  { value: "approve", label: "승인" },
  { value: "reject", label: "반려" },
  { value: "suspend", label: "정지" },
  { value: "reactivate", label: "재활성화" },
  { value: "credit", label: "입금 완료" },
  { value: "detect", label: "입금 감지" },
  { value: "complete", label: "출금 완료" },
  { value: "transfer", label: "전송중" },
  { value: "aml_review", label: "보안검증" },
];

export const RESOURCE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "auth", label: "인증" },
  { value: "users", label: "사용자" },
  { value: "withdrawals", label: "출금" },
  { value: "deposits", label: "입금" },
  { value: "groups", label: "그룹" },
  { value: "company", label: "회사 설정" },
  { value: "addresses", label: "주소" },
  { value: "balances", label: "잔액" },
  { value: "settings", label: "설정" },
];

export const RESULT_OPTIONS = [
  { value: "", label: "전체" },
  { value: "SUCCESS", label: "성공" },
  { value: "FAILED", label: "실패" },
];
