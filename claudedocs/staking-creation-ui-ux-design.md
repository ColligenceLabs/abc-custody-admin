# 스테이킹 생성 UI/UX 종합 설계 문서

**작성일**: 2025-10-13
**대상**: http://localhost:3000/services/staking - "새 스테이킹" 버튼 클릭 후 UI/UX
**설계 방법론**: Sequential Thinking MCP를 활용한 체계적 분석

---

## 1. 비즈니스 요구사항 분석

### 1.1 핵심 사용자 목표
1. **수익 창출**: 보유한 가상자산을 활용하여 수동적 수익(스테이킹 보상) 획득
2. **간편한 진입**: 복잡한 블록체인 지식 없이도 스테이킹 서비스 이용
3. **안전한 운영**: 검증인 선택, 리스크 이해, 자산 안전성 확보
4. **투명한 수익**: APY, 예상 보상, 수수료 등 명확한 수익 계산

### 1.2 사용자 의사결정 항목

**필수 결정사항:**
- **스테이킹 자산**: ETH, SOL, ATOM 등 스테이킹 지원 자산 선택
- **스테이킹 수량**: 최소/최대 한도 내에서 수량 결정
- **검증인(Validator)**: 신뢰할 수 있는 검증인 선택
- **잠금 기간**: 언스테이킹 소요 시간 이해 (자산별 상이)

**부가 고려사항:**
- **APY 비교**: 검증인별 수익률 차이
- **수수료**: 네트워크 수수료, 검증인 수수료
- **리스크**: 슬래싱(Slashing) 위험, 가격 변동성

### 1.3 정보 우선순위

**Critical (반드시 표시):**
- 선택 가능한 스테이킹 자산 목록
- 보유 수량 및 사용 가능 수량
- 검증인 정보 (이름, APY, 수수료, 신뢰도)
- 예상 연간 보상 (APY 기반)
- 잠금 기간 및 언스테이킹 소요 시간
- 최소 스테이킹 수량

**Important (명확하게 표시):**
- 네트워크 수수료 예상치
- 검증인 수수료율
- 슬래싱 리스크 경고
- 언스테이킹 프로세스 설명

**Nice-to-have (선택적 표시):**
- 검증인 상세 통계 (위임량, 가동률, 역사)
- 과거 APY 변동 차트
- 다른 사용자 선호도

### 1.4 리스크 커뮤니케이션

**명확히 전달해야 할 위험:**
1. **가격 변동 리스크**: 스테이킹 중에도 자산 가격은 변동 (손실 가능)
2. **유동성 잠김**: 언스테이킹 시 대기 기간 존재 (ETH 2-7일, SOL 2-3일)
3. **슬래싱 리스크**: 검증인 오작동 시 일부 자산 손실 가능
4. **APY 변동**: 표시된 APY는 예상치이며 실제 보상은 변동 가능

---

## 2. 사용자 플로우 설계

### 2.1 전체 플로우 개요

```
[새 스테이킹 버튼 클릭]
    ↓
[모달 오픈: Step 1 - 자산 선택]
    ↓
[Step 2 - 수량 입력]
    ↓
[Step 3 - 검증인 선택]
    ↓
[Step 4 - 확인 및 검토]
    ↓
[제출 → 트랜잭션 처리]
    ↓
[성공/실패 결과]
```

### 2.2 단계별 상세 플로우

#### Step 1: 스테이킹 자산 선택

**목표**: 사용자가 스테이킹할 자산 선택

**표시 정보**:
- 스테이킹 가능한 자산 목록 (ETH, SOL, ATOM 등)
- 각 자산별:
  - 보유 수량
  - 현재 가격 (KRW)
  - 평균 APY
  - 최소 스테이킹 수량
- 자산 아이콘 (CryptoIcon 컴포넌트 사용)

**유효성 검증**:
- 보유 수량이 최소 스테이킹 수량 미만인 자산은 비활성화
- 비활성화된 경우 이유 표시 (예: "보유 수량 부족")

**UX 고려사항**:
- 라디오 버튼 또는 카드 선택 방식
- 선택된 자산 강조 표시
- 자산별 간단한 정보 툴팁 제공

#### Step 2: 스테이킹 수량 입력

**목표**: 스테이킹할 정확한 수량 결정

**표시 정보**:
- 선택된 자산 아이콘 및 이름
- 보유 수량
- 입력 필드 (숫자 + "전체" 버튼)
- 실시간 계산:
  - 예상 일일 보상
  - 예상 월간 보상
  - 예상 연간 보상
- KRW 환산 금액

**유효성 검증**:
- 최소 수량 이상
- 보유 수량 이하
- 숫자 형식 검증
- 네트워크 수수료 고려한 잔액 확인

**UX 고려사항**:
- 슬라이더 + 직접 입력 방식 병행
- "25% / 50% / 75% / 100%" 퀵 버튼
- 실시간 보상 계산 애니메이션

#### Step 3: 검증인 선택

**목표**: 신뢰할 수 있는 검증인 선택

**표시 정보**:
- 검증인 목록 (최소 3-5개)
- 각 검증인별:
  - 이름
  - APY (연간 수익률)
  - 수수료율
  - 총 위임량
  - 가동률 (Uptime)
  - 신뢰도 점수 (별점 또는 색상 배지)
- 추천 검증인 표시 (예: "추천" 배지)

**정렬 및 필터**:
- 기본 정렬: APY 높은 순
- 옵션: 신뢰도 높은 순, 수수료 낮은 순

**유효성 검증**:
- 검증인 선택 필수
- 가동률 70% 미만인 경우 경고 표시

**UX 고려사항**:
- 테이블 또는 카드 레이아웃
- 검증인 상세 정보 모달 또는 확장 가능
- 슬래싱 이력이 있는 검증인 경고 표시

#### Step 4: 확인 및 검토

**목표**: 최종 제출 전 모든 정보 검토

**표시 정보**:
- **요약 카드**:
  - 스테이킹 자산 및 수량
  - 검증인 이름
  - 예상 연간 보상 (APY 기반)
  - 예상 월간 보상
  - 네트워크 수수료
  - 검증인 수수료
- **중요 안내사항**:
  - 언스테이킹 대기 기간 (예: "언스테이킹 시 2-7일 소요")
  - 슬래싱 리스크 경고
  - APY 변동 가능성 안내
- **약관 동의**:
  - 스테이킹 약관 동의 체크박스
  - 리스크 이해 확인 체크박스

**유효성 검증**:
- 약관 동의 필수
- 최종 금액 재확인

**UX 고려사항**:
- 편집 버튼으로 이전 단계 수정 가능
- 중요 경고는 색상 강조 (주황색/빨간색)
- 제출 버튼은 모든 조건 충족 시 활성화

---

## 3. UI 컴포넌트 구조 설계

### 3.1 모달 레이아웃

```
┌─────────────────────────────────────────────────┐
│  헤더                                           │
│  - 제목: "새 스테이킹"                          │
│  - 닫기 버튼                                    │
├─────────────────────────────────────────────────┤
│  진행 표시기 (Step Indicator)                   │
│  ○────○────○────●  (현재 Step 4/4)             │
├─────────────────────────────────────────────────┤
│                                                 │
│  본문 (Body)                                    │
│  - 단계별 컨텐츠 영역                          │
│  - 스크롤 가능 (max-height: 70vh)              │
│                                                 │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  푸터                                           │
│  - 뒤로 버튼 (Step 2-4)                        │
│  - 다음/제출 버튼                              │
│  - 진행 상황 저장 (선택)                       │
└─────────────────────────────────────────────────┘
```

### 3.2 컴포넌트 계층 구조

```
NewStakingModal (부모 컴포넌트)
├─ StakingModalHeader
│  ├─ Title
│  └─ CloseButton
├─ StakingProgressIndicator
│  └─ StepDots (1, 2, 3, 4)
├─ StakingModalBody
│  ├─ Step1AssetSelection
│  │  └─ AssetCard[] (각 스테이킹 가능 자산)
│  ├─ Step2AmountInput
│  │  ├─ AmountSlider
│  │  ├─ QuickSelectButtons
│  │  └─ RewardCalculator (실시간 보상 계산)
│  ├─ Step3ValidatorSelection
│  │  ├─ ValidatorTable
│  │  │  └─ ValidatorRow[]
│  │  └─ ValidatorDetailModal (선택)
│  └─ Step4Confirmation
│     ├─ SummaryCard
│     ├─ ImportantNotices
│     └─ TermsAgreement
└─ StakingModalFooter
   ├─ BackButton
   └─ NextButton / SubmitButton
```

### 3.3 주요 컴포넌트 UI 명세

#### AssetCard 컴포넌트
```tsx
<div className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <CryptoIcon symbol={asset.symbol} size={32} />
      <div>
        <h4 className="font-medium text-gray-900">{asset.name}</h4>
        <p className="text-sm text-gray-600">보유: {asset.balance} {asset.symbol}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-semibold text-sky-600">APY {asset.avgApy}%</p>
      <p className="text-xs text-gray-500">최소 {asset.minStaking} {asset.symbol}</p>
    </div>
  </div>
</div>
```

#### RewardCalculator 컴포넌트
```tsx
<div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
  <h4 className="font-medium text-gray-900 mb-3">예상 보상</h4>
  <dl className="space-y-2 text-sm">
    <div className="flex justify-between">
      <dt className="text-gray-600">일일 보상</dt>
      <dd className="font-medium text-gray-900">{dailyReward} {asset}</dd>
    </div>
    <div className="flex justify-between">
      <dt className="text-gray-600">월간 보상</dt>
      <dd className="font-medium text-gray-900">{monthlyReward} {asset}</dd>
    </div>
    <div className="flex justify-between border-t pt-2">
      <dt className="text-gray-600">연간 예상 보상</dt>
      <dd className="font-semibold text-sky-600">{yearlyReward} {asset}</dd>
    </div>
  </dl>
</div>
```

#### ValidatorRow 컴포넌트
```tsx
<tr className="hover:bg-gray-50 cursor-pointer" onClick={handleSelect}>
  <td className="px-4 py-3">
    <div className="flex items-center space-x-2">
      <input type="radio" checked={isSelected} />
      <span className="font-medium text-gray-900">{validator.name}</span>
      {validator.recommended && (
        <span className="px-2 py-1 bg-sky-50 text-sky-600 text-xs rounded-full">
          추천
        </span>
      )}
    </div>
  </td>
  <td className="px-4 py-3 text-sky-600 font-semibold">{validator.apy}%</td>
  <td className="px-4 py-3 text-gray-600">{validator.commission}%</td>
  <td className="px-4 py-3">
    <span className={`px-2 py-1 rounded-full text-xs ${uptimeBadgeColor}`}>
      {validator.uptime}%
    </span>
  </td>
</tr>
```

---

## 4. 데이터 모델 설계 (TypeScript)

### 4.1 StakingFormData 인터페이스
```typescript
interface StakingFormData {
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
```

### 4.2 StakingAsset 인터페이스
```typescript
interface StakingAsset {
  symbol: string;                  // "ETH", "SOL", "ATOM"
  name: string;                    // "Ethereum", "Solana"
  balance: number;                 // 보유 수량
  availableBalance: number;        // 스테이킹 가능 수량 (수수료 제외)
  minStakingAmount: number;        // 최소 스테이킹 수량
  maxStakingAmount: number;        // 최대 스테이킹 수량
  currentPrice: number;            // 현재 가격 (KRW)
  avgApy: number;                  // 평균 APY (%)
  unstakingPeriod: {
    min: number;                   // 최소 대기 일수
    max: number;                   // 최대 대기 일수
  };
  networkFee: number;              // 예상 네트워크 수수료
  slashingRisk: "low" | "medium" | "high"; // 슬래싱 리스크 레벨
}
```

### 4.3 StakingValidator 인터페이스
```typescript
interface StakingValidator {
  id: string;
  name: string;                    // 검증인 이름
  apy: number;                     // 현재 APY (%)
  commissionRate: number;          // 수수료율 (%)
  totalStaked: number;             // 총 위임량
  totalStakedKrw: number;          // 총 위임량 (KRW 환산)
  uptime: number;                  // 가동률 (%)
  trustScore: number;              // 신뢰도 점수 (1-5)
  slashingHistory: SlashingEvent[]; // 슬래싱 이력
  recommended: boolean;            // 추천 여부
  status: "active" | "inactive" | "jailed"; // 검증인 상태
  validatorAddress?: string;       // 검증인 주소 (선택)
  website?: string;                // 웹사이트 (선택)
  description?: string;            // 설명 (선택)
}

interface SlashingEvent {
  date: string;
  reason: string;
  penaltyPercent: number;
}
```

### 4.4 ValidationErrors 타입
```typescript
interface ValidationErrors {
  selectedAsset?: string;
  stakingAmount?: string;
  selectedValidator?: string;
  termsAgreed?: string;
  riskAcknowledged?: string;
}
```

### 4.5 StakingCalculation 인터페이스
```typescript
interface StakingCalculation {
  dailyReward: number;             // 일일 예상 보상
  monthlyReward: number;           // 월간 예상 보상
  yearlyReward: number;            // 연간 예상 보상
  dailyRewardKrw: number;          // 일일 보상 (KRW)
  monthlyRewardKrw: number;        // 월간 보상 (KRW)
  yearlyRewardKrw: number;         // 연간 보상 (KRW)
  effectiveApy: number;            // 실효 APY (검증인 수수료 제외)
  networkFee: number;              // 네트워크 수수료
  validatorFee: number;            // 검증인 수수료
  netReturn: number;               // 순수익 (수수료 제외)
}
```

### 4.6 Modal State 인터페이스
```typescript
interface StakingModalState {
  isOpen: boolean;
  currentStep: 1 | 2 | 3 | 4;
  formData: StakingFormData;
  errors: ValidationErrors;
  isSubmitting: boolean;
  calculation: StakingCalculation | null;
}
```

---

## 5. 유효성 검증 및 리스크 관리

### 5.1 입력 검증 규칙

#### 자산 선택 검증
```typescript
const validateAssetSelection = (asset: StakingAsset | null): string | null => {
  if (!asset) {
    return "스테이킹할 자산을 선택해주세요";
  }

  if (asset.balance < asset.minStakingAmount) {
    return `보유 수량이 최소 스테이킹 수량(${asset.minStakingAmount} ${asset.symbol})보다 적습니다`;
  }

  return null;
};
```

#### 수량 검증
```typescript
const validateAmount = (
  amount: number,
  asset: StakingAsset
): string | null => {
  if (!amount || amount <= 0) {
    return "스테이킹 수량을 입력해주세요";
  }

  if (amount < asset.minStakingAmount) {
    return `최소 스테이킹 수량은 ${asset.minStakingAmount} ${asset.symbol}입니다`;
  }

  if (amount > asset.availableBalance) {
    return `사용 가능한 수량(${asset.availableBalance} ${asset.symbol})을 초과했습니다`;
  }

  // 네트워크 수수료 고려
  const totalRequired = amount + asset.networkFee;
  if (totalRequired > asset.balance) {
    return `네트워크 수수료를 포함한 총 필요 수량이 보유 수량을 초과합니다`;
  }

  return null;
};
```

#### 검증인 선택 검증
```typescript
const validateValidator = (
  validator: StakingValidator | null
): string | null => {
  if (!validator) {
    return "검증인을 선택해주세요";
  }

  if (validator.status !== "active") {
    return "선택한 검증인이 현재 활성 상태가 아닙니다";
  }

  if (validator.uptime < 70) {
    return "선택한 검증인의 가동률이 낮습니다 (70% 미만). 다른 검증인을 선택하시는 것을 권장합니다";
  }

  return null;
};
```

### 5.2 리스크 레벨 표시

#### 슬래싱 리스크 색상 코딩
```typescript
const getSlashingRiskBadge = (risk: "low" | "medium" | "high") => {
  const config = {
    low: {
      text: "낮음",
      className: "text-sky-600 bg-sky-50 border-sky-200"
    },
    medium: {
      text: "보통",
      className: "text-yellow-600 bg-yellow-50 border-yellow-200"
    },
    high: {
      text: "높음",
      className: "text-red-600 bg-red-50 border-red-200"
    }
  };

  return config[risk];
};
```

#### 검증인 신뢰도 표시
```typescript
const getTrustScoreBadge = (score: number) => {
  if (score >= 4.5) return { text: "우수", color: "sky" };
  if (score >= 3.5) return { text: "양호", color: "indigo" };
  if (score >= 2.5) return { text: "보통", color: "yellow" };
  return { text: "주의", color: "red" };
};
```

### 5.3 경고 메시지 시스템

#### 경고 우선순위
1. **Critical (빨간색)**: 진행 불가능한 오류
   - 보유 수량 부족
   - 검증인 비활성화
   - 네트워크 수수료 부족

2. **Warning (주황색/노란색)**: 주의 필요
   - 검증인 가동률 낮음
   - 슬래싱 이력 존재
   - 높은 수수료율

3. **Info (파란색)**: 참고 정보
   - 언스테이킹 대기 기간 안내
   - APY 변동 가능성
   - 추천 검증인 표시

---

## 6. 구현 권장사항

### 6.1 컴포넌트 파일 구조
```
src/components/staking/
├── NewStakingModal.tsx              # 메인 모달 컴포넌트
├── StakingModalHeader.tsx           # 헤더
├── StakingProgressIndicator.tsx     # 진행 표시기
├── steps/
│   ├── AssetSelectionStep.tsx       # Step 1: 자산 선택
│   ├── AmountInputStep.tsx          # Step 2: 수량 입력
│   ├── ValidatorSelectionStep.tsx   # Step 3: 검증인 선택
│   └── ConfirmationStep.tsx         # Step 4: 확인
├── components/
│   ├── AssetCard.tsx                # 자산 카드
│   ├── RewardCalculator.tsx         # 보상 계산기
│   ├── ValidatorTable.tsx           # 검증인 테이블
│   └── RiskWarningBanner.tsx        # 리스크 경고
├── utils/
│   ├── stakingValidation.ts         # 유효성 검증 함수
│   ├── stakingCalculations.ts       # 보상 계산 함수
│   └── stakingConstants.ts          # 상수 정의
└── types.ts                         # TypeScript 타입 정의
```

### 6.2 상태 관리 접근 방식

**Option 1: useState 기반 (Simple)**
```typescript
const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
const [formData, setFormData] = useState<StakingFormData>({
  selectedAsset: null,
  stakingAmount: 0,
  selectedValidator: null,
  termsAgreed: false,
  riskAcknowledged: false,
});
const [errors, setErrors] = useState<ValidationErrors>({});
```

**Option 2: useReducer 기반 (Complex)**
```typescript
type StakingAction =
  | { type: "SELECT_ASSET"; payload: StakingAsset }
  | { type: "SET_AMOUNT"; payload: number }
  | { type: "SELECT_VALIDATOR"; payload: StakingValidator }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_ERROR"; payload: ValidationErrors };

const stakingReducer = (
  state: StakingModalState,
  action: StakingAction
): StakingModalState => {
  // Reducer 로직
};
```

### 6.3 기존 코드 통합

#### AdditionalServices.tsx 수정사항
```typescript
// Line 334-336 수정
const [stakingModalOpen, setStakingModalOpen] = useState(false);

<button
  onClick={() => setStakingModalOpen(true)}
  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
>
  <PlusIcon className="h-5 w-5 mr-2" />
  새 스테이킹
</button>

// 모달 컴포넌트 추가
<NewStakingModal
  isOpen={stakingModalOpen}
  onClose={() => setStakingModalOpen(false)}
  onSubmit={handleStakingSubmit}
  availableAssets={stakingAssets}
/>
```

### 6.4 테스트 고려사항

#### 단위 테스트
- 유효성 검증 함수 테스트
- 보상 계산 정확도 테스트
- 상태 전환 로직 테스트

#### 통합 테스트
- 전체 플로우 진행 테스트
- 에러 핸들링 테스트
- API 통신 모킹 테스트

#### E2E 테스트
- 사용자 시나리오 기반 테스트
- 모바일 반응형 테스트
- 접근성 테스트

---

## 7. UX 개선 사항

### 7.1 툴팁 및 도움말

#### 주요 툴팁 위치
- **APY**: "연간 예상 수익률입니다. 네트워크 상황에 따라 변동될 수 있습니다."
- **검증인 수수료**: "검증인이 보상에서 가져가는 수수료 비율입니다."
- **슬래싱**: "검증인의 오작동 시 일부 스테이킹 자산이 삭감될 수 있는 위험입니다."
- **언스테이킹 기간**: "스테이킹 해제 시 자산을 다시 사용하기까지 걸리는 시간입니다."

### 7.2 Progressive Disclosure

#### 기본 정보 (항상 표시)
- 자산명, 수량, APY
- 예상 보상
- 검증인 이름, APY

#### 상세 정보 (펼침/모달)
- 검증인 통계 (총 위임량, 가동률, 슬래싱 이력)
- 과거 APY 차트
- 네트워크 수수료 상세

### 7.3 성공/에러 메시징

#### 성공 메시지
```tsx
<div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
  <div className="flex items-center space-x-3">
    <CheckCircleIcon className="h-6 w-6 text-sky-600" />
    <div>
      <h4 className="font-medium text-sky-800">스테이킹 신청 완료</h4>
      <p className="text-sm text-sky-700 mt-1">
        {stakingAmount} {asset} 스테이킹이 처리 중입니다.
        완료까지 약 5-10분 소요됩니다.
      </p>
    </div>
  </div>
</div>
```

#### 에러 메시지
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="flex items-center space-x-3">
    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
    <div>
      <h4 className="font-medium text-red-800">스테이킹 실패</h4>
      <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
      <button className="mt-2 text-sm text-red-600 underline">
        다시 시도
      </button>
    </div>
  </div>
</div>
```

### 7.4 접근성 기능

#### 키보드 네비게이션
- Tab: 다음 입력 필드/버튼으로 이동
- Shift+Tab: 이전 입력 필드/버튼으로 이동
- Enter: 다음 단계 진행 또는 제출
- Esc: 모달 닫기

#### ARIA 레이블
```tsx
<button
  aria-label="새 스테이킹 생성"
  aria-describedby="staking-description"
  onClick={handleOpen}
>
  새 스테이킹
</button>

<div id="staking-description" className="sr-only">
  가상자산을 스테이킹하여 보상을 받을 수 있는 모달을 엽니다
</div>
```

#### 색맹 친화적 디자인
- 색상 + 아이콘 병행 사용
- 텍스트 레이블 명확히 표시
- 대비율 4.5:1 이상 유지

---

## 8. 디자인 시스템 준수

### 8.1 컬러 팔레트 (프로젝트 규칙 준수)

#### 성공/긍정 상태
- **Primary**: `text-sky-600 bg-sky-50 border-sky-200`
- **용도**: 활성 스테이킹, 예상 보상, 추천 배지

#### 경고 상태
- **Warning**: `text-yellow-600 bg-yellow-50 border-yellow-200`
- **용도**: 중간 리스크, 주의 필요 정보

#### 위험 상태
- **Danger**: `text-red-600 bg-red-50 border-red-200`
- **용도**: 슬래싱 경고, 검증인 오류, 유효성 오류

#### 중성 상태
- **Neutral**: `text-gray-600 bg-gray-50 border-gray-200`
- **용도**: 일반 정보, 비활성 상태

### 8.2 타이포그래피

- **제목**: `text-xl font-semibold text-gray-900`
- **부제**: `text-sm text-gray-600`
- **본문**: `text-sm text-gray-700`
- **강조**: `font-medium text-gray-900`
- **숫자**: `font-semibold text-sky-600`

### 8.3 간격 및 레이아웃

- **모달 너비**: `max-w-4xl` (기본), `max-w-6xl` (상세)
- **패딩**: `p-6` (섹션), `p-4` (카드)
- **간격**: `space-y-6` (섹션), `space-y-4` (항목)
- **라운드**: `rounded-lg` (카드), `rounded-xl` (모달)

---

## 9. 최종 와이어프레임 (텍스트 기반)

### Step 1: 자산 선택
```
┌───────────────────────────────────────────────┐
│  새 스테이킹                           [X]    │
├───────────────────────────────────────────────┤
│  ●────○────○────○                            │
│  자산  수량  검증인 확인                      │
├───────────────────────────────────────────────┤
│                                               │
│  스테이킹할 자산을 선택하세요                 │
│                                               │
│  ┌──────────────────────┐                    │
│  │ [ETH아이콘] Ethereum  │  APY 4.2%         │
│  │ 보유: 5.5 ETH         │  최소 0.1 ETH     │
│  └──────────────────────┘  ← 선택됨           │
│                                               │
│  ┌──────────────────────┐                    │
│  │ [SOL아이콘] Solana    │  APY 6.8%         │
│  │ 보유: 100 SOL         │  최소 1 SOL       │
│  └──────────────────────┘                    │
│                                               │
│  ┌──────────────────────┐                    │
│  │ [ATOM아이콘] Cosmos   │  APY 12.5%        │
│  │ 보유: 0 ATOM          │  최소 1 ATOM      │
│  └──────────────────────┘  (비활성화)        │
│                                               │
├───────────────────────────────────────────────┤
│                          [취소]  [다음 →]    │
└───────────────────────────────────────────────┘
```

### Step 2: 수량 입력
```
┌───────────────────────────────────────────────┐
│  새 스테이킹                           [X]    │
├───────────────────────────────────────────────┤
│  ●────●────○────○                            │
│  자산  수량  검증인 확인                      │
├───────────────────────────────────────────────┤
│                                               │
│  스테이킹 수량을 입력하세요                   │
│  선택 자산: [ETH아이콘] Ethereum              │
│                                               │
│  ┌─────────────────────────────────┐         │
│  │ 스테이킹 수량                   │         │
│  │ ┌─────────────┐                 │         │
│  │ │  2.5  ETH   │ [전체]          │         │
│  │ └─────────────┘                 │         │
│  │                                 │         │
│  │ ━━━━━━●━━━━━━━━━━━━━━━━━       │         │
│  │ 0.1 ETH              5.5 ETH    │         │
│  │                                 │         │
│  │ [25%] [50%] [75%] [100%]        │         │
│  └─────────────────────────────────┘         │
│                                               │
│  ┌─────────────────────────────────┐         │
│  │ 예상 보상                       │         │
│  │                                 │         │
│  │ 일일 보상    0.00028 ETH        │         │
│  │ 월간 보상    0.0087 ETH         │         │
│  │ 연간 예상    0.105 ETH          │         │
│  │             (약 420,000원)      │         │
│  └─────────────────────────────────┘         │
│                                               │
├───────────────────────────────────────────────┤
│                     [← 뒤로]  [다음 →]       │
└───────────────────────────────────────────────┘
```

### Step 3: 검증인 선택
```
┌──────────────────────────────────────────────────┐
│  새 스테이킹                              [X]    │
├──────────────────────────────────────────────────┤
│  ●────●────●────○                               │
│  자산  수량  검증인 확인                         │
├──────────────────────────────────────────────────┤
│                                                  │
│  검증인을 선택하세요                             │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │ 검증인명      │ APY   │ 수수료 │ 가동률 │  │
│  ├───────────────────────────────────────────┤  │
│  │ ○ Lido [추천] │ 4.2%  │ 10%   │ 99.9%  │  │
│  │ ○ Coinbase    │ 3.8%  │ 25%   │ 99.5%  │  │
│  │ ● Kraken      │ 4.0%  │ 15%   │ 99.7%  │  │
│  │ ○ Binance     │ 3.9%  │ 20%   │ 98.9%  │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ⓘ 검증인 상세 정보                              │
│  ┌───────────────────────────────────────────┐  │
│  │ Kraken Staking                            │  │
│  │ 총 위임량: 1,250,000 ETH                  │  │
│  │ 신뢰도: ★★★★☆ (4.2/5)                    │  │
│  │ 슬래싱 이력: 없음                         │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
├──────────────────────────────────────────────────┤
│                        [← 뒤로]  [다음 →]       │
└──────────────────────────────────────────────────┘
```

### Step 4: 확인
```
┌──────────────────────────────────────────────────┐
│  새 스테이킹                              [X]    │
├──────────────────────────────────────────────────┤
│  ●────●────●────●                               │
│  자산  수량  검증인 확인                         │
├──────────────────────────────────────────────────┤
│                                                  │
│  스테이킹 정보를 확인해주세요                    │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │ 스테이킹 요약                             │  │
│  │                                           │  │
│  │ 자산          2.5 ETH (약 10,000,000원)   │  │
│  │ 검증인        Kraken Staking              │  │
│  │ 예상 APY      4.0%                        │  │
│  │ 연간 예상     0.1 ETH (약 400,000원)      │  │
│  │ 네트워크 수수료 0.001 ETH                 │  │
│  │ 검증인 수수료  15%                        │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ⚠️ 중요 안내사항                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ • 언스테이킹 시 2-7일 대기 필요          │  │
│  │ • APY는 네트워크 상황에 따라 변동        │  │
│  │ • 슬래싱 리스크: 낮음                    │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  □ 스테이킹 약관에 동의합니다                    │
│  □ 리스크를 이해하고 진행합니다                  │
│                                                  │
├──────────────────────────────────────────────────┤
│                 [← 뒤로]  [스테이킹 시작]       │
└──────────────────────────────────────────────────┘
```

---

## 요약 및 다음 단계

### 핵심 설계 원칙
1. **사용자 친화성**: 복잡한 블록체인 개념을 쉽게 이해할 수 있도록 설계
2. **투명성**: APY, 수수료, 리스크를 명확히 표시
3. **안전성**: 유효성 검증 및 경고 시스템으로 사용자 보호
4. **일관성**: 기존 LoanApplicationModal 패턴 참고하여 프로젝트 통일성 유지

### 구현 우선순위
1. **Phase 1**: 기본 4단계 플로우 구현 (자산 선택 → 수량 → 검증인 → 확인)
2. **Phase 2**: 실시간 보상 계산 및 유효성 검증
3. **Phase 3**: 검증인 상세 정보 및 필터링 기능
4. **Phase 4**: 고급 기능 (과거 APY 차트, 모바일 최적화)

### 참고 자료
- 기존 대출 신청 모달: `/src/components/lending/LoanApplicationModal.tsx`
- 프로젝트 디자인 시스템: `/src/utils/badgeColors.ts`
- 출금 모달 패턴: `/src/components/withdrawal/CreateWithdrawalModal.tsx`

---

**설계 완료일**: 2025-10-13
**설계 방법**: Sequential Thinking MCP 활용
**다음 단계**: 개발팀과 리뷰 후 구현 착수
