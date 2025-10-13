/**
 * 슬래싱 리스크 레벨 색상 설정
 */
export const getSlashingRiskBadge = (risk: "low" | "medium" | "high") => {
  const config = {
    low: {
      text: "낮음",
      className: "text-sky-600 bg-sky-50 border-sky-200",
    },
    medium: {
      text: "보통",
      className: "text-yellow-600 bg-yellow-50 border-yellow-200",
    },
    high: {
      text: "높음",
      className: "text-red-600 bg-red-50 border-red-200",
    },
  };

  return config[risk];
};

/**
 * 검증인 신뢰도 배지 설정
 */
export const getTrustScoreBadge = (score: number) => {
  if (score >= 4.5) {
    return {
      text: "우수",
      color: "text-sky-600",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
    };
  }
  if (score >= 3.5) {
    return {
      text: "양호",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    };
  }
  if (score >= 2.5) {
    return {
      text: "보통",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    };
  }
  return {
    text: "주의",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  };
};

/**
 * 가동률 배지 색상 설정
 */
export const getUptimeBadgeColor = (uptime: number) => {
  if (uptime >= 99) {
    return "text-sky-600 bg-sky-50";
  }
  if (uptime >= 95) {
    return "text-indigo-600 bg-indigo-50";
  }
  if (uptime >= 90) {
    return "text-yellow-600 bg-yellow-50";
  }
  return "text-red-600 bg-red-50";
};

/**
 * 스텝 진행 상태 배지
 */
export const stepStatuses = {
  completed: "●",
  current: "●",
  pending: "○",
};

/**
 * 퀵 선택 버튼 비율
 */
export const QUICK_SELECT_RATIOS = [0.25, 0.5, 0.75, 1.0];

/**
 * 퀵 선택 버튼 레이블
 */
export const QUICK_SELECT_LABELS = ["25%", "50%", "75%", "100%"];
