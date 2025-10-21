# CDD/EDD 분리 설계 문서

## 문제점 분석

### 현재 구조의 문제

**사용자 지적사항**:
> "수동 등록 할때 개인회원/법인회원 둘다 CDD 기준으로 정보를 수집하고 온보딩 대기 상태에서 AML 시스템에서 AML 후 리스크 레벨에 따라서 EDD 기준으로 정보 요청을 다시 해야 하는거 같은데 지금 UI는 CDD나 EDD가 다 섞여 있는거 같애"

**핵심 문제**:
1. 수동 등록 시 CDD와 EDD 정보가 혼재되어 수집됨
2. AML 리스크 평가 없이 모든 회원에게 동일한 정보 요구
3. HIGH 리스크 회원에게만 필요한 EDD 정보를 일괄 수집

**올바른 프로세스**:
```
수동 등록 (CDD) → AML 평가 → 리스크 레벨 결정 → HIGH인 경우만 EDD 추가 요청
```

---

## CDD vs EDD 정의

### CDD (Customer Due Diligence - 기본 고객확인)

**목적**: 고객의 신원 확인 및 기본적인 위험 평가

**개인회원 CDD 항목**:
- 이름, 이메일, 전화번호 (인증 필수)
- 신분증 종류 및 번호
- 신분증 사본
- 주소 증명 종류 및 사본

**법인회원 CDD 항목**:
- 법인명, 사업자번호
- 담당자 정보 (이름, 이메일, 전화번호 - 인증 필수)
- 사업자등록증
- 법인등기부등본
- 정관
- 주주명부
- 대표자 신분증
- 대표자 인감증명서
- 대표자 KYC (신분증, 주소증명)
- **UBO 기본정보** (이름, 지분율, 관계만)

### EDD (Enhanced Due Diligence - 강화된 고객확인)

**목적**: HIGH 리스크 고객에 대한 추가 검증 및 모니터링

**개인회원 EDD 항목**:
- 소득 증명서
- 거주지 증명서 (추가)
- 자금 출처 증명
- 영상 인터뷰

**법인회원 EDD 항목**:
- 사업계획서
- 재무제표 (최근 3년)
- 주요 거래처 목록
- 거래 목적 상세 설명
- **UBO 상세정보** (신분증, 자금출처)
- 배경 조사 (Background Check)
- 현장 실사 (On-site Inspection)
- 임원 인터뷰 (Executive Interview)

---

## 올바른 온보딩 프로세스

### Phase 1: 수동 등록 (CDD 수집)

**목표**: CDD 정보만 수집하여 초기 등록 완료

**개인회원**:
```typescript
interface IndividualCDD {
  // 기본 정보
  userName: string;
  userEmail: string;           // 인증 필수
  userPhone: string;           // 인증 필수

  // 신분증
  idType: IdType;
  idNumber: string;
  idImageUrl: string;

  // 주소 증명
  addressProofType: AddressProofType;
  addressProofUrl: string;

  // 검증 상태
  emailVerified: boolean;
  phoneVerified: boolean;
}
```

**법인회원**:
```typescript
interface CorporateCDD {
  // 법인 정보
  companyName: string;
  businessNumber: string;

  // 법인 서류
  businessLicenseUrl: string;
  corporateRegistryUrl: string;
  articlesOfIncorporationUrl: string;
  shareholderListUrl: string;
  representativeIdUrl: string;
  representativeSealCertUrl: string;

  // 대표자 KYC
  representativeKyc: {
    idType: IdType;
    idNumber: string;
    idImageUrl: string;
    addressProofType: AddressProofType;
    addressProofUrl: string;
  };

  // UBO 기본정보 (신분증 제외)
  initialUboInfo: {
    name: string;
    sharePercentage: number;
    relationship: string;
    // idNumber 제외
    // idImageUrl 제외
  }[];

  // 담당자
  contactPerson: {
    name: string;
    email: string;              // 인증 필수
    phone: string;
    emailVerified: boolean;
  };
}
```

**결과 상태**: `PENDING`

**다음 단계**: 외부 AML 시스템으로 전송

---

### Phase 2: AML 스크리닝 (외부 시스템)

**목표**: 외부 AML 솔루션을 통한 자동 위험도 평가

**처리 내용**:
1. PEP (Politically Exposed Person) 확인
2. 제재 리스트 확인
3. 블랙리스트 확인
4. 국가 위험도 평가
5. 종합 위험도 레벨 산출 → `LOW` / `MEDIUM` / `HIGH`

**결과 상태**: `UNDER_REVIEW`

**데이터 구조**:
```typescript
interface AMLScreening {
  pepStatus: PEPStatus;
  sanctionListStatus: ListStatus;
  blacklistStatus: ListStatus;
  countryRiskLevel: RiskLevel;
  screeningDate: string;
  screeningProvider: string;
}

interface RiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore?: number;
  factors: string[];
  assessedAt: string;
}
```

---

### Phase 3: 위험도별 처리 분기

**LOW / MEDIUM 리스크**:
- CDD 정보만으로 승인 진행
- 상태 전환: `UNDER_REVIEW` → `APPROVED`
- EDD 불필요

**HIGH 리스크**:
- EDD 추가 정보 요청
- 상태 전환: `UNDER_REVIEW` → `ON_HOLD`
- 관리자가 필요 서류 목록 지정

**외부 시스템 권장사항**:
```typescript
interface AdditionalProcedures {
  // 외부 AML 시스템 권장 (읽기 전용)
  residenceProofRequired: boolean;
  incomeProofRequired: boolean;
  videoInterviewRequired: boolean;
  eddRequired: boolean;
  supervisorApprovalRequired: boolean;
  recommendedActions: string[];
}
```

---

### Phase 4: EDD 추가 정보 수집 (HIGH 리스크만)

**목표**: 강화된 고객확인을 위한 추가 서류 수집

**개인회원 EDD**:
```typescript
interface IndividualEDD {
  // 소득 증명
  incomeProofUrl?: string;
  incomeProofType?: 'PAYSLIP' | 'TAX_RETURN' | 'BANK_STATEMENT';

  // 추가 거주지 증명
  additionalResidenceProofUrl?: string;

  // 자금 출처
  fundSourceUrl?: string;
  fundSourceDescription?: string;

  // 영상 인터뷰
  videoInterviewUrl?: string;
  videoInterviewDate?: string;
  videoInterviewNotes?: string;
}
```

**법인회원 EDD**:
```typescript
interface CorporateEDD {
  // 사업 관련
  businessPlanUrl?: string;
  financialStatementsUrl?: string;        // 최근 3년
  clientListUrl?: string;
  transactionPurposeUrl?: string;

  // UBO 상세정보
  detailedUboInfo?: {
    name: string;
    sharePercentage: number;
    relationship: string;
    idNumber: string;                     // EDD에서 추가
    idImageUrl: string;                   // EDD에서 추가
    fundSourceUrl?: string;               // 자금 출처
  }[];

  // 추가 검증
  backgroundCheckCompleted: boolean;
  backgroundCheckUrl?: string;

  onSiteInspectionCompleted: boolean;
  onSiteInspectionUrl?: string;
  onSiteInspectionDate?: string;

  executiveInterviewCompleted: boolean;
  executiveInterviewUrl?: string;
  executiveInterviewDate?: string;
}
```

**수집 방법**:
1. 관리자가 ON_HOLD 상태 신청 확인
2. 필요 서류 목록 확인 (외부 AML 권장사항 참고)
3. 회원에게 추가 서류 요청 (이메일/문자)
4. 회원이 서류 제출 (온라인 업로드 또는 오프라인 제출)
5. 관리자가 서류 검토 및 등록

**결과 상태**: `ON_HOLD` → 재검토 → `APPROVED` / `REJECTED`

---

## 타입 정의 개선안

### 현재 문제점

**ManualRegisterCorporateRequest** (현재):
```typescript
interface ManualRegisterCorporateRequest {
  // ... 법인 정보

  // 문제: UBO에 신분증 정보 포함
  initialUboInfo?: {
    name: string;
    sharePercentage: number;
    relationship: string;
    idNumber?: string;        // EDD 정보가 CDD에 혼재
    idImageUrl?: string;      // EDD 정보가 CDD에 혼재
  }[];
}
```

### 개선안

**1. CDD 타입 (수동 등록용)**:
```typescript
// 개인회원 CDD
interface IndividualCDDRequest {
  userName: string;
  userEmail: string;
  userPhone: string;
  kyc: {
    idType: IdType;
    idNumber: string;
    idImageUrl: string;
    addressProofType: AddressProofType;
    addressProofUrl: string;
    phoneVerified: boolean;
    emailVerified: boolean;
  };
  registrationSource: Exclude<RegistrationSource, 'ONLINE'>;
  registrationNote?: string;
}

// 법인회원 CDD
interface CorporateCDDRequest {
  companyName: string;
  businessNumber: string;
  corporateInfo: CorporateInfo;
  representativeKyc: KYCInfo;

  // UBO 기본정보만 (신분증 제외)
  initialUboInfo?: {
    name: string;
    sharePercentage: number;
    relationship: string;
    // idNumber 제거
    // idImageUrl 제거
  }[];

  contactPerson: {
    name: string;
    email: string;
    phone: string;
    emailVerified: boolean;
  };
  registrationSource: Exclude<RegistrationSource, 'ONLINE'>;
  registrationNote?: string;
}
```

**2. EDD 타입 (추가 정보 제출용)**:
```typescript
// 개인회원 EDD
interface IndividualEDDSubmission {
  applicationId: string;
  incomeProofUrl?: string;
  incomeProofType?: 'PAYSLIP' | 'TAX_RETURN' | 'BANK_STATEMENT';
  additionalResidenceProofUrl?: string;
  fundSourceUrl?: string;
  fundSourceDescription?: string;
  videoInterviewUrl?: string;
  submittedAt: string;
}

// 법인회원 EDD
interface CorporateEDDSubmission {
  applicationId: string;
  businessPlanUrl?: string;
  financialStatementsUrl?: string;
  clientListUrl?: string;
  transactionPurposeUrl?: string;

  // UBO 상세정보 (신분증 추가)
  detailedUboInfo?: {
    uboId: string;                        // 기존 UBO ID 참조
    idNumber: string;
    idImageUrl: string;
    fundSourceUrl?: string;
  }[];

  backgroundCheckUrl?: string;
  onSiteInspectionUrl?: string;
  onSiteInspectionDate?: string;
  executiveInterviewUrl?: string;
  executiveInterviewDate?: string;
  submittedAt: string;
}
```

**3. 통합 온보딩 타입 (최종)**:
```typescript
interface IndividualOnboarding {
  id: string;
  userId: string;

  // CDD 정보
  cdd: IndividualCDDRequest;

  // AML 정보
  aml: AMLScreening | null;
  riskAssessment: RiskAssessment | null;

  // EDD 정보 (HIGH 리스크만)
  edd: IndividualEDDSubmission | null;
  eddRequired: boolean;
  eddRequestedAt?: string;
  eddSubmittedAt?: string;

  // 관리자 작업
  adminReview: AdminReview;

  createdAt: string;
  updatedAt: string;
}

interface CorporateOnboarding {
  id: string;
  companyId: string;

  // CDD 정보
  cdd: CorporateCDDRequest;

  // AML 정보
  aml: AMLScreening | null;
  riskAssessment: CorporateRiskAssessment | null;
  ubo: UBOVerification | null;

  // EDD 정보 (HIGH 리스크만)
  edd: CorporateEDDSubmission | null;
  eddRequired: boolean;
  eddRequestedAt?: string;
  eddSubmittedAt?: string;

  // 관리자 작업
  adminReview: AdminReview;

  createdAt: string;
  updatedAt: string;
}
```

---

## UI 구조 개선안

### 현재 구조

**문제점**:
- 수동 등록 폼에서 모든 정보를 한번에 입력
- UBO 신분증 정보까지 초기에 수집

### 개선안

#### 1. 수동 등록 폼 (CDD만)

**IndividualRegistrationForm**:
```
기본 정보
├── 이름
├── 이메일 (인증)
└── 전화번호 (인증)

KYC 신원확인
├── 신분증 종류
├── 신분증 번호
├── 신분증 사본
├── 주소증명 종류
└── 주소증명 사본

등록 경로
├── 등록 소스
└── 비고
```

**CorporateRegistrationForm**:
```
법인 정보
├── 법인명
└── 사업자번호

법인 서류
├── 사업자등록증
├── 법인등기부등본
├── 정관
├── 주주명부
├── 대표자 신분증
└── 대표자 인감증명서

대표자 KYC
├── 신분증 종류
├── 신분증 번호
├── 신분증 사본
├── 주소증명 종류
└── 주소증명 사본

UBO 기본정보 (신분증 제외!)
└── UBO 목록
    ├── 이름
    ├── 지분율 (%)
    └── 관계

담당자 정보
├── 담당자명
├── 이메일 (인증)
└── 전화번호
```

#### 2. EDD 추가 정보 요청 UI (신규)

**위치**: `/admin/members/onboarding-aml/edd-request/[id]`

**개인회원 EDD 요청 폼**:
```
EDD 추가 서류 제출

필수 서류 (외부 AML 권장)
├── ☐ 소득 증명서
├── ☐ 추가 거주지 증명
├── ☐ 자금 출처 증명
└── ☐ 영상 인터뷰

서류 업로드
├── 소득 증명 유형 선택
├── 파일 업로드
└── 설명 작성

제출 상태
└── 대기중 / 제출완료 / 승인 / 거부
```

**법인회원 EDD 요청 폼**:
```
EDD 추가 서류 제출

사업 관련 서류
├── ☐ 사업계획서
├── ☐ 재무제표 (최근 3년)
├── ☐ 주요 거래처 목록
└── ☐ 거래 목적 설명

UBO 상세정보
└── UBO 목록 (기존)
    ├── [기본정보: 이름, 지분율, 관계]
    ├── 신분증 번호 (추가)
    ├── 신분증 사본 (추가)
    └── 자금 출처 증명 (추가)

추가 검증
├── ☐ 배경 조사
├── ☐ 현장 실사
└── ☐ 임원 인터뷰

제출 상태
└── 대기중 / 제출완료 / 승인 / 거부
```

---

## 워크플로우 개선

### 관리자 워크플로우

#### 1. 수동 등록 (CDD 수집)

```
개인/법인 온보딩 목록 페이지
  ↓ [수동 등록 버튼]
수동 등록 폼 (CDD 정보만)
  ↓ [제출]
PENDING 상태로 등록
  ↓ [자동]
외부 AML 시스템 전송
```

#### 2. AML 평가 대기

```
PENDING 상태 목록
  ↓ [외부 AML 처리 완료 시]
UNDER_REVIEW 상태 전환
  ↓
리스크 레벨 확인
```

#### 3. 위험도별 처리

**LOW/MEDIUM 리스크**:
```
UNDER_REVIEW 상태
  ↓ [관리자 검토]
승인/거부 결정
  ↓
APPROVED / REJECTED
```

**HIGH 리스크**:
```
UNDER_REVIEW 상태
  ↓ [EDD 필요 판단]
ON_HOLD 상태 전환
  ↓
EDD 요청 서류 지정
  ↓ [회원에게 알림]
추가 서류 제출 대기
  ↓ [제출 완료]
관리자 재검토
  ↓
APPROVED / REJECTED
```

---

## 구현 우선순위

### Phase 1: 타입 정의 분리 (필수)

**작업 내용**:
1. `onboardingAml.ts` 타입 수정
   - `ManualRegisterCorporateRequest`에서 UBO `idNumber`, `idImageUrl` 제거
   - `IndividualEDDSubmission` 타입 추가
   - `CorporateEDDSubmission` 타입 추가
   - `IndividualOnboarding`, `CorporateOnboarding`에 `edd` 필드 추가

2. 기존 폼 수정
   - `CorporateRegistrationForm`: UBO 신분증 필드 제거
   - `IndividualRegistrationForm`: 현재 상태 유지 (이미 CDD만 수집)

**예상 소요 시간**: 2-3시간

---

### Phase 2: EDD 요청 UI 개발 (중요)

**작업 내용**:
1. EDD 요청 페이지 생성
   - `/admin/members/onboarding-aml/edd-request/individual/[id]`
   - `/admin/members/onboarding-aml/edd-request/corporate/[id]`

2. EDD 서류 업로드 컴포넌트
   - `IndividualEDDForm.tsx`
   - `CorporateEDDForm.tsx`

3. EDD API 서비스
   - `submitIndividualEDD()`
   - `submitCorporateEDD()`

**예상 소요 시간**: 1-2일

---

### Phase 3: 워크플로우 통합 (선택)

**작업 내용**:
1. 상태 관리 개선
   - PENDING → UNDER_REVIEW 자동 전환 로직
   - UNDER_REVIEW → ON_HOLD 조건부 전환

2. 알림 시스템
   - EDD 요청 이메일 발송
   - 제출 완료 알림

3. 대시보드 개선
   - EDD 대기 중 건수 표시
   - HIGH 리스크 건 별도 표시

**예상 소요 시간**: 2-3일

---

## 체크리스트

### CDD/EDD 분리 검증

- [ ] 수동 등록 폼에서 EDD 정보 제거 확인
- [ ] UBO 기본정보에서 신분증 필드 제거
- [ ] EDD 타입 정의 완료
- [ ] EDD 요청 UI 구현
- [ ] HIGH 리스크 판단 로직 구현
- [ ] EDD 제출 프로세스 구현
- [ ] 관리자 재검토 기능 구현

### 금융규정 준수

- [ ] CDD 정보가 금융감독원 가이드라인 준수
- [ ] EDD 정보가 FATF 권고사항 준수
- [ ] 리스크 평가 기준 명확화
- [ ] 문서 보관 기간 설정 (최소 5년)

---

## 참고 자료

### 금융감독원 가이드라인

- 특정 금융거래정보의 보고 및 이용 등에 관한 법률
- 금융회사의 고객확인제도 운영 가이드라인
- FATF (Financial Action Task Force) 권고사항

### AML/KYC 모범 사례

- CDD는 모든 고객에게 적용
- EDD는 HIGH 리스크 고객에게만 적용
- 리스크 기반 접근 (Risk-Based Approach)
- 지속적 모니터링 (Ongoing Monitoring)
