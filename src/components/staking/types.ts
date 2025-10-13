// 스테이킹 자산 인터페이스
export interface StakingAsset {
  symbol: string; // "ETH", "SOL", "ATOM"
  name: string; // "Ethereum", "Solana"
  balance: number; // 보유 수량
  availableBalance: number; // 스테이킹 가능 수량 (수수료 제외)
  minStakingAmount: number; // 최소 스테이킹 수량
  maxStakingAmount: number; // 최대 스테이킹 수량
  currentPrice: number; // 현재 가격 (KRW)
  avgApy: number; // 평균 APY (%)
  unstakingPeriod: {
    min: number; // 최소 대기 일수
    max: number; // 최대 대기 일수
  };
  networkFee: number; // 예상 네트워크 수수료
  slashingRisk: "low" | "medium" | "high"; // 슬래싱 리스크 레벨
}

// 슬래싱 이력 인터페이스
export interface SlashingEvent {
  date: string;
  reason: string;
  penaltyPercent: number;
}

// 검증인 인터페이스
export interface StakingValidator {
  id: string;
  name: string; // 검증인 이름
  apy: number; // 현재 APY (%)
  commissionRate: number; // 수수료율 (%)
  totalStaked: number; // 총 위임량
  totalStakedKrw: number; // 총 위임량 (KRW 환산)
  uptime: number; // 가동률 (%)
  trustScore: number; // 신뢰도 점수 (1-5)
  slashingHistory: SlashingEvent[]; // 슬래싱 이력
  recommended: boolean; // 추천 여부
  status: "active" | "inactive" | "jailed"; // 검증인 상태
  validatorAddress?: string; // 검증인 주소 (선택)
  website?: string; // 웹사이트 (선택)
  description?: string; // 설명 (선택)
}

// 스테이킹 폼 데이터 인터페이스
export interface StakingFormData {
  // Step 1: 자산 선택
  selectedAsset: StakingAsset | null;

  // Step 2: 수량 입력
  stakingAmount: number;

  // Step 3: 검증인 선택
  selectedValidator: StakingValidator | null;

  // Step 4: 약관 동의
  termsAgreed: boolean;
  riskAcknowledged: boolean;
}

// 유효성 검증 에러 인터페이스
export interface ValidationErrors {
  selectedAsset?: string;
  stakingAmount?: string;
  selectedValidator?: string;
  termsAgreed?: string;
  riskAcknowledged?: string;
}

// 스테이킹 보상 계산 인터페이스
export interface StakingCalculation {
  dailyReward: number; // 일일 예상 보상
  monthlyReward: number; // 월간 예상 보상
  yearlyReward: number; // 연간 예상 보상
  dailyRewardKrw: number; // 일일 보상 (KRW)
  monthlyRewardKrw: number; // 월간 보상 (KRW)
  yearlyRewardKrw: number; // 연간 보상 (KRW)
  effectiveApy: number; // 실효 APY (검증인 수수료 제외)
  networkFee: number; // 네트워크 수수료
  validatorFee: number; // 검증인 수수료
  netReturn: number; // 순수익 (수수료 제외)
}

// 모달 상태 인터페이스
export interface StakingModalState {
  isOpen: boolean;
  currentStep: 1 | 2 | 3 | 4;
  formData: StakingFormData;
  errors: ValidationErrors;
  isSubmitting: boolean;
  calculation: StakingCalculation | null;
}

// 모달 Props 인터페이스
export interface NewStakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StakingFormData) => void;
  availableAssets: StakingAsset[];
}
