# 온보딩 AML 관리 시스템 개발 계획서 (수정본)

## 문서 정보
- **작성일**: 2025-01-21
- **수정일**: 2025-01-21
- **프로젝트**: ABC Custody Admin - 온보딩 AML 관리 시스템
- **버전**: 3.0.0 (수동 등록 기능 추가)

### 변경 이력
- v3.0.0 (2025-01-21): **수동 등록 기능 추가** (온라인/오프라인 신청 경로 통합)
  - 관리자가 오프라인 서류 기반으로 직접 등록 가능
  - registrationSource 필드 추가 (ONLINE, OFFLINE_BRANCH, PHONE_INQUIRY, EMAIL_REQUEST)
  - ManualRegistrationDialog, IndividualRegistrationForm, CorporateRegistrationForm 컴포넌트 추가
  - 수동 등록 API 엔드포인트 추가
- v2.1.0 (2025-01-21): 경로 변경 `/admin/onboarding-aml` → `/admin/members/onboarding-aml`
- v2.0.0 (2025-01-21): 외부 AML 솔루션 연동 구조로 전면 수정
- v1.0.0 (2025-01-21): 초기 작성

---

## 1. 프로젝트 개요

### 1.1 비즈니스 모델
- **본업**: 가상자산 커스터디 서비스
- **AML/KYC**: 규제 준수를 위해 **외부 AML 솔루션** 활용
  - 예시: Chainalysis KYT, ComplyAdvantage, Elliptic 등

### 1.2 시스템 역할 명확화

#### 외부 AML 솔루션이 하는 일
1. PEP (정치적 노출인물) 데이터베이스 조회
2. 제재리스트 확인 (OFAC, UN, EU 등)
3. 블랙리스트 확인 (내부 DB)
4. **위험도 자동 평가** (LOW/MEDIUM/HIGH)
5. **위험도 수동 조정** (AML 솔루션 담당자가)
6. 거주지 위험도 평가
7. UBO (실질적 소유자) 검증

#### 이 관리자 UI가 하는 일
1. 외부 AML 시스템의 **결과를 받아서 표시**
2. AML 결과를 **참고하여** 온보딩 승인/거부/보류 **결정**
3. 4단계 온보딩 프로세스 **워크플로우 관리**
4. 추가 서류 요청, 검토 노트 작성 등 **행정 처리**
5. 온보딩 완료 후 지속적 **모니터링** (갱신 일정 관리)

#### 이 관리자 UI가 하지 않는 일
- ❌ AML 스크리닝 직접 실행
- ❌ 위험도 점수 직접 계산
- ❌ PEP/제재리스트 데이터베이스 관리
- ❌ 위험도 수동 조정 (외부 AML 솔루션에서 함)

### 1.3 기술 스택
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **상태 관리**: React Query + Zustand
- **UI**: Shadcn UI (Sapphire Theme)
- **데이터**: Mock JSON (개발), REST API (배포)
- **외부 연동**: 백엔드를 통한 외부 AML API 연동

---

## 2. 시스템 아키텍처

### 2.1 전체 데이터 흐름

#### 신청 경로 (2가지)

**온라인 신청 경로:**
```
[회원 직접 신청] → [프론트엔드] → [백엔드 API] → [외부 AML 솔루션]
```

**오프라인 수동 등록 경로:**
```
[관리자 수동 등록] → [관리자 UI] → [백엔드 API] → [외부 AML 솔루션]
     ↑
[오프라인 서류 수령]
```

#### 전체 처리 흐름

```
[회원 신청 또는 수동 등록] → [백엔드 API] → [외부 AML 솔루션]
                                              ↓
                                        [AML 결과 수신]
                                              ↓
                                        [백엔드 DB 저장]
                                              ↓
           [관리자 UI] ← [백엔드 API] ← [AML 결과 조회]
                ↓
      [승인/거부/보류 결정]
                ↓
     [백엔드 API] → [온보딩 상태 업데이트]
```

**주요 시나리오:**
1. **온라인 신청**: 회원이 웹/앱에서 직접 KYC 정보 입력 및 서류 업로드
2. **오프라인 수동 등록**: 관리자가 오프라인에서 받은 서류를 바탕으로 대신 등록

### 2.2 메뉴 구조
새로운 메뉴 경로: `/admin/members/onboarding-aml`

```
/admin/members/onboarding-aml/
├── dashboard          # 전체 통계 및 대시보드
├── individual         # 개인회원 신청 관리
├── corporate          # 법인회원 신청 관리
├── review/[id]        # 상세 검토 페이지
└── monitoring         # 온보딩 후 모니터링
```

### 2.3 데이터 모델

#### 2.3.1 개인회원 온보딩 (IndividualOnboarding)

```typescript
interface IndividualOnboarding {
  // 기본 정보
  id: string
  userId: string
  userName: string
  userEmail: string
  createdAt: string
  updatedAt: string

  // 신청 경로 정보
  registrationSource: 'ONLINE' | 'OFFLINE_BRANCH' | 'PHONE_INQUIRY' | 'EMAIL_REQUEST'
  registrationNote?: string  // 오프라인 등록 시 사유

  // 1단계: KYC (신원확인) - 온라인 신청 또는 관리자 수동 입력
  kyc: {
    idType: 'RESIDENT_CARD' | 'DRIVER_LICENSE' | 'PASSPORT'
    idNumber: string
    idImageUrl: string
    addressProofType: 'REGISTRY' | 'UTILITY_BILL'
    addressProofUrl: string
    phoneVerified: boolean
    emailVerified: boolean
    completedAt?: string
  }

  // 2단계: AML 스크리닝 - 외부 AML 솔루션 결과 (읽기 전용)
  aml: {
    pepStatus: 'CLEAR' | 'MATCHED' | 'POSSIBLE_MATCH'
    pepDetails?: string  // 매칭된 PEP 정보
    sanctionListStatus: 'CLEAR' | 'MATCHED'
    sanctionDetails?: string  // 제재리스트 상세
    blacklistStatus: 'CLEAR' | 'MATCHED'
    blacklistReason?: string
    countryRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    screeningDate: string
    screeningProvider: string  // 외부 AML 솔루션명
    externalReferenceId?: string  // 외부 시스템 참조 ID
  } | null  // 아직 스크리닝 전이면 null

  // 3단계: 위험도 등급 - 외부 AML 솔루션 평가 결과 (읽기 전용)
  riskAssessment: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    riskScore?: number  // 외부 시스템의 점수
    factors: string[]  // 위험 요소 목록
    assessedAt: string
    assessedBy: 'SYSTEM' | 'MANUAL'  // 자동 평가 vs 수동 조정
    externalReferenceId?: string
  } | null  // 아직 평가 전이면 null

  // 4단계: 등급별 추가 절차 - 외부 AML 솔루션이 권장 (읽기 전용)
  additionalProcedures: {
    residenceProofRequired: boolean
    incomeProofRequired: boolean
    videoInterviewRequired: boolean
    eddRequired: boolean  // Enhanced Due Diligence
    supervisorApprovalRequired: boolean
    recommendedActions: string[]  // 외부 시스템 권장 액션
  } | null

  // 관리자 작업 영역 - 관리자가 직접 수정
  adminReview: {
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ON_HOLD'
    currentStep: 1 | 2 | 3 | 4 | 5
    reviewedBy?: string  // 관리자 ID
    reviewedAt?: string
    decision?: 'APPROVE' | 'REJECT' | 'HOLD'
    decisionReason?: string  // 승인/거부 사유
    notes: ReviewNote[]  // 검토 노트
  }
}
```

#### 2.3.2 법인회원 온보딩 (CorporateOnboarding)

```typescript
interface CorporateOnboarding {
  // 기본 정보
  id: string
  companyId: string
  companyName: string
  businessNumber: string
  createdAt: string
  updatedAt: string

  // 신청 경로 정보
  registrationSource: 'ONLINE' | 'OFFLINE_BRANCH' | 'PHONE_INQUIRY' | 'EMAIL_REQUEST'
  registrationNote?: string  // 오프라인 등록 시 사유

  // 1단계: 법인 기본정보 확인 - 온라인 신청 또는 관리자 수동 입력
  corporateInfo: {
    businessLicenseUrl: string
    corporateRegistryUrl: string
    articlesOfIncorporationUrl: string
    shareholderListUrl: string
    representativeIdUrl: string
    representativeSealCertUrl: string
    completedAt?: string
  }

  // 2단계: UBO 확인 - 외부 AML 솔루션 검증 결과 (읽기 전용)
  ubo: {
    structure: {
      name: string
      sharePercentage: number
      isUBO: boolean  // 25% 이상 지분
      pepStatus: 'CLEAR' | 'MATCHED'  // 외부 시스템 결과
      pepDetails?: string
      idVerified: boolean  // 외부 시스템 검증 여부
      documentUrl?: string
    }[]
    complexStructure: boolean  // 외부 시스템 분석 결과
    trustStructure: boolean
    verifiedAt?: string
    verifiedBy?: string  // 외부 시스템 참조
    externalReferenceId?: string
  } | null

  // 3단계: 법인 위험도 평가 - 외부 AML 솔루션 평가 (읽기 전용)
  riskAssessment: {
    industryType: string
    industryRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    businessLocation: string
    locationRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    uboRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    riskScore?: number
    assessedAt: string
    assessedBy: 'SYSTEM' | 'MANUAL'
    externalReferenceId?: string
  } | null

  // 4단계: 등급별 절차 - 외부 AML 솔루션 권장 + 관리자 체크
  procedures: {
    // 외부 시스템 권장 (읽기 전용)
    recommendedDocuments: string[]
    backgroundCheckRequired: boolean
    onSiteInspectionRequired: boolean
    executiveInterviewRequired: boolean

    // 관리자 진행 상황 체크
    businessPlanUrl?: string
    financialStatementsUrl?: string
    clientListUrl?: string
    transactionPurposeUrl?: string
    backgroundCheckCompleted: boolean
    onSiteInspectionCompleted: boolean
    executiveInterviewCompleted: boolean
  }

  // 관리자 작업 영역
  adminReview: {
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ON_HOLD'
    currentStep: 1 | 2 | 3 | 4 | 5
    reviewedBy?: string
    reviewedAt?: string
    decision?: 'APPROVE' | 'REJECT' | 'HOLD'
    decisionReason?: string
    notes: ReviewNote[]
  }
}
```

#### 2.3.3 공통 타입

```typescript
interface ReviewNote {
  id: string
  createdBy: string  // 관리자명
  createdAt: string
  content: string
  type: 'INFO' | 'WARNING' | 'DECISION'
}

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
type OnboardingStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ON_HOLD'
```

---

## 3. API 설계

### 3.1 개인회원 온보딩 API

```typescript
// 수동 등록 (관리자가 오프라인 서류 기반으로 등록)
POST /api/admin/onboarding/individual/manual-register
Body: {
  // 개인 정보
  userName: string
  userEmail: string

  // KYC 정보
  kyc: {
    idType: 'RESIDENT_CARD' | 'DRIVER_LICENSE' | 'PASSPORT'
    idNumber: string
    idImageUrl: string  // 업로드된 신분증 이미지
    addressProofType: 'REGISTRY' | 'UTILITY_BILL'
    addressProofUrl: string  // 업로드된 주소증명 이미지
    phoneVerified: boolean
    emailVerified: boolean
  }

  // 등록 사유
  registrationSource: 'OFFLINE_BRANCH' | 'PHONE_INQUIRY' | 'EMAIL_REQUEST'
  registrationNote?: string  // 오프라인 등록 사유
}
Response: {
  id: string
  message: "개인회원 온보딩이 등록되었습니다. 외부 AML 스크리닝이 진행 중입니다."
}

// 목록 조회 (외부 AML 결과 포함)
GET /api/admin/onboarding/individual
Query: {
  page: number
  limit: number
  status?: OnboardingStatus
  riskLevel?: RiskLevel
  registrationSource?: 'ONLINE' | 'OFFLINE_BRANCH' | 'PHONE_INQUIRY' | 'EMAIL_REQUEST'
  search?: string
}
Response: {
  applications: IndividualOnboarding[]
  total: number
  page: number
  totalPages: number
}

// 상세 조회 (외부 AML 결과 포함)
GET /api/admin/onboarding/individual/:id
Response: IndividualOnboarding

// 검토 노트 추가 (관리자 작업)
POST /api/admin/onboarding/individual/:id/notes
Body: {
  content: string
  type: 'INFO' | 'WARNING' | 'DECISION'
}

// 승인 (관리자 결정)
POST /api/admin/onboarding/individual/:id/approve
Body: {
  decisionReason: string
  reviewNote?: string
}

// 거부 (관리자 결정)
POST /api/admin/onboarding/individual/:id/reject
Body: {
  decisionReason: string
  reviewNote?: string
}

// 보류 (관리자 결정)
POST /api/admin/onboarding/individual/:id/hold
Body: {
  reason: string
  requiredDocuments?: string[]
}

// 외부 AML 재검증 요청 (백엔드가 외부 API 호출)
POST /api/admin/onboarding/individual/:id/request-aml-rescan
Response: {
  requestId: string
  message: "외부 AML 시스템에 재검증 요청을 전송했습니다."
}
```

### 3.2 법인회원 온보딩 API

```typescript
// 수동 등록 (관리자가 오프라인 서류 기반으로 등록)
POST /api/admin/onboarding/corporate/manual-register
Body: {
  // 법인 정보
  companyName: string
  businessNumber: string

  // 법인 기본정보
  corporateInfo: {
    businessLicenseUrl: string
    corporateRegistryUrl: string
    articlesOfIncorporationUrl: string
    shareholderListUrl: string
    representativeIdUrl: string
    representativeSealCertUrl: string
  }

  // 담당자 정보
  contactPerson: {
    name: string
    email: string
    phone: string
  }

  // 등록 사유
  registrationSource: 'OFFLINE_BRANCH' | 'PHONE_INQUIRY' | 'EMAIL_REQUEST'
  registrationNote?: string
}
Response: {
  id: string
  message: "법인회원 온보딩이 등록되었습니다. 외부 AML 스크리닝 및 UBO 검증이 진행 중입니다."
}

// 목록 조회
GET /api/admin/onboarding/corporate
Query: {
  page: number
  limit: number
  status?: OnboardingStatus
  riskLevel?: RiskLevel
  registrationSource?: 'ONLINE' | 'OFFLINE_BRANCH' | 'PHONE_INQUIRY' | 'EMAIL_REQUEST'
  search?: string
}

// 상세 조회
GET /api/admin/onboarding/corporate/:id

// 검토 노트 추가
POST /api/admin/onboarding/corporate/:id/notes

// 승인
POST /api/admin/onboarding/corporate/:id/approve

// 거부
POST /api/admin/onboarding/corporate/:id/reject

// 보류
POST /api/admin/onboarding/corporate/:id/hold

// UBO 재검증 요청 (외부 시스템)
POST /api/admin/onboarding/corporate/:id/request-ubo-rescan
```

### 3.3 통계 및 모니터링 API

```typescript
// 전체 통계
GET /api/admin/onboarding/stats
Response: {
  total: number
  pending: number
  underReview: number
  approved: number
  rejected: number
  onHold: number
  byRiskLevel: { low: number, medium: number, high: number }
  byType: { individual: number, corporate: number }
  externalAmlPending: number  // 외부 AML 결과 대기 중
}

// 위험도 분포
GET /api/admin/onboarding/risk-distribution

// 최근 활동 피드
GET /api/admin/onboarding/activity-feed
Query: { limit: number }

// 갱신 예정 목록
GET /api/admin/onboarding/monitoring/renewal-due

// 재평가 큐
GET /api/admin/onboarding/monitoring/reassessment-queue
```

---

## 4. 컴포넌트 설계

### 4.1 공통 컴포넌트

#### 4.1.1 RiskLevelBadge
```tsx
// 외부 시스템의 위험도 결과 표시 (읽기 전용)
<RiskLevelBadge level="HIGH" source="외부 AML 솔루션" />
// Colors: LOW=sky, MEDIUM=yellow, HIGH=red
```

#### 4.1.2 OnboardingStatusBadge
```tsx
// 관리자가 결정한 온보딩 상태 표시
<OnboardingStatusBadge status="UNDER_REVIEW" />
```

#### 4.1.3 ProcessStepIndicator
```tsx
// 4단계 프로세스 진행 표시
<ProcessStepIndicator
  currentStep={2}
  totalSteps={4}
  type="individual"
  amlCompleted={true}  // 외부 AML 완료 여부
/>
```

#### 4.1.4 AMLScreeningResult
```tsx
// 외부 AML 시스템 결과 표시 (읽기 전용)
<AMLScreeningResult
  result={amlData}
  provider="Chainalysis KYT"
  readonly={true}
/>
```

#### 4.1.5 ManualRegistrationButton (신규)
```tsx
// 수동 등록 버튼 (대시보드 및 목록 페이지 상단)
<ManualRegistrationButton
  onOpenDialog={() => setDialogOpen(true)}
/>
```

#### 4.1.6 ManualRegistrationDialog (신규)
```tsx
// 수동 등록 다이얼로그
interface ManualRegistrationDialogProps {
  open: boolean
  onClose: () => void
  memberType: 'individual' | 'corporate'
  onSuccess: (applicationId: string) => void
}

// 기능:
// - 개인/법인 선택 (Tabs)
// - 개인회원: KYC 정보 입력 폼
//   - 이름, 이메일
//   - 신분증 타입 선택
//   - 신분증 번호
//   - 신분증 이미지 업로드
//   - 주소증명 타입 선택
//   - 주소증명 이미지 업로드
//   - 전화번호/이메일 인증 여부 체크
//   - 등록 경로 선택 (OFFLINE_BRANCH | PHONE_INQUIRY | EMAIL_REQUEST)
//   - 등록 사유 입력
// - 법인회원: 법인 정보 입력 폼
//   - 회사명, 사업자번호
//   - 사업자등록증 업로드
//   - 법인등기부등본 업로드
//   - 정관 업로드
//   - 주주명부 업로드
//   - 대표자 신분증 업로드
//   - 대표자 인감증명서 업로드
//   - 담당자 정보 (이름, 이메일, 전화)
//   - 등록 경로 선택
//   - 등록 사유 입력
```

#### 4.1.7 RegistrationSourceBadge (신규)
```tsx
// 신청 경로 표시 배지
<RegistrationSourceBadge source="OFFLINE_BRANCH" />
// ONLINE: 온라인 신청
// OFFLINE_BRANCH: 지점 방문
// PHONE_INQUIRY: 전화 문의
// EMAIL_REQUEST: 이메일 요청
```

### 4.2 개인회원 전용 컴포넌트

#### 4.2.1 AMLSection (수정)
```tsx
// 외부 AML 스크리닝 결과 표시 - 읽기 전용
interface AMLSectionProps {
  aml: IndividualOnboarding['aml']
  readonly: true  // 항상 읽기 전용
}

// 표시 내용:
// - PEP 상태 (CLEAR/MATCHED)
// - 제재리스트 결과
// - 블랙리스트 결과
// - 국가 위험도
// - 스크리닝 제공자 정보
// - 외부 참조 ID
```

#### 4.2.2 RiskAssessmentSection (수정)
```tsx
// 외부 시스템의 위험도 평가 결과 표시 - 읽기 전용
interface RiskAssessmentSectionProps {
  riskAssessment: IndividualOnboarding['riskAssessment']
  readonly: true
}

// 표시 내용:
// - 위험등급 (LOW/MEDIUM/HIGH)
// - 위험점수 (있는 경우)
// - 위험요소 목록
// - 평가 방식 (자동/수동)
// - 평가 일시
```

#### 4.2.3 AdditionalProceduresSection (수정)
```tsx
// 외부 시스템이 권장하는 추가 절차 표시
interface AdditionalProceduresSectionProps {
  procedures: IndividualOnboarding['additionalProcedures']
  readonly: true  // 권장사항만 표시
}

// 표시 내용:
// - 필요한 추가 서류 (외부 시스템 권장)
// - EDD 필요 여부
// - 화상 인터뷰 필요 여부
// - 상급자 승인 필요 여부
```

#### 4.2.4 AdminDecisionPanel (신규)
```tsx
// 관리자 결정 패널 - 관리자가 직접 작업
interface AdminDecisionPanelProps {
  applicationId: string
  amlResult: IndividualOnboarding['aml']
  riskAssessment: IndividualOnboarding['riskAssessment']
  onApprove: (reason: string) => void
  onReject: (reason: string) => void
  onHold: (reason: string, docs: string[]) => void
}

// 기능:
// - AML 결과 요약 표시
// - 위험도 결과 요약 표시
// - 승인/거부/보류 버튼
// - 결정 사유 입력
// - 검토 노트 작성
```

### 4.3 법인회원 전용 컴포넌트

#### 4.3.1 UBOStructureViewer (수정)
```tsx
// 외부 AML 시스템이 검증한 UBO 구조 표시 - 읽기 전용
interface UBOStructureViewerProps {
  ubo: CorporateOnboarding['ubo']
  readonly: true
}

// 표시 내용:
// - UBO 소유구조 시각화
// - 각 UBO의 PEP 상태 (외부 시스템 결과)
// - 신원 검증 여부 (외부 시스템)
// - 복잡한 구조 여부
// - 외부 참조 ID
```

### 4.4 Dialog 컴포넌트

#### 4.4.1 ApprovalDialog (수정)
```tsx
<ApprovalDialog
  applicationId={id}
  applicantName={name}
  amlSummary={amlResult}  // 외부 AML 결과 요약
  riskLevel={riskAssessment.riskLevel}
  onConfirm={(reason) => handleApprove(reason)}
/>
```

#### 4.4.2 RejectionDialog (수정)
```tsx
<RejectionDialog
  applicationId={id}
  amlIssues={amlResult.issues}  // AML 이슈 표시
  onConfirm={(reason) => handleReject(reason)}
/>
```

---

## 5. 파일 구조

```
abc-custody-admin/src/
├── app/
│   └── admin/
│       └── members/
│           └── onboarding-aml/
│               ├── layout.tsx
│               ├── dashboard/
│               │   ├── page.tsx
│               │   └── components/
│               │       ├── OnboardingStats.tsx
│               │       ├── RiskDistributionChart.tsx
│               │       ├── ExternalAmlStatusPanel.tsx  # 외부 AML 연동 상태
│               │       └── RecentActivityFeed.tsx
│               ├── individual/
│               │   ├── page.tsx
│               │   └── components/
│               │       ├── IndividualTable.tsx
│               │       ├── IndividualFilters.tsx
│               │       ├── KYCSection.tsx  # 입력된 정보 표시
│               │       ├── AMLSection.tsx  # 외부 시스템 결과 표시 (읽기)
│               │       ├── RiskAssessmentSection.tsx  # 외부 결과 (읽기)
│               │       ├── AdditionalProceduresSection.tsx  # 권장사항 (읽기)
│               │       └── AdminDecisionPanel.tsx  # 관리자 결정
│               ├── corporate/
│               │   ├── page.tsx
│               │   └── components/
│               │       ├── CorporateTable.tsx
│               │       ├── CorporateInfoSection.tsx
│               │       ├── UBOStructureViewer.tsx  # 외부 검증 결과 (읽기)
│               │       ├── CorporateRiskSection.tsx  # 외부 결과 (읽기)
│               │       └── AdminDecisionPanel.tsx
│               ├── review/
│               │   └── [applicationId]/
│               │       ├── page.tsx
│               │       └── components/
│               │           ├── ReviewHeader.tsx
│               │           ├── ExternalAmlResultSummary.tsx  # 외부 결과 요약
│               │           ├── DocumentViewer.tsx
│               │           ├── ReviewNotes.tsx
│               │           ├── AdminDecisionPanel.tsx
│               │           └── ActionHistory.tsx
│               ├── monitoring/
│               │   ├── page.tsx
│               │   └── components/
│               │       ├── RenewalDueList.tsx
│               │       └── ReassessmentQueue.tsx
│               └── components/
│                   ├── RiskLevelBadge.tsx
│                   ├── OnboardingStatusBadge.tsx
│                   ├── RegistrationSourceBadge.tsx  # 신청 경로 배지
│                   ├── ProcessStepIndicator.tsx
│                   ├── AMLScreeningResult.tsx  # 외부 결과 표시
│                   ├── ManualRegistrationButton.tsx  # 수동 등록 버튼
│                   ├── ManualRegistrationDialog.tsx  # 수동 등록 다이얼로그
│                   ├── IndividualRegistrationForm.tsx  # 개인회원 등록 폼
│                   ├── CorporateRegistrationForm.tsx  # 법인회원 등록 폼
│                   ├── ApprovalDialog.tsx
│                   ├── RejectionDialog.tsx
│                   └── OnHoldDialog.tsx
├── types/
│   ├── onboarding.ts  # 수정: 외부 AML 결과 필드 추가
│   └── onboarding-filters.ts
├── data/
│   └── mockData/
│       ├── individualOnboarding.json  # Mock: 외부 AML 결과 포함
│       ├── corporateOnboarding.json
│       └── onboardingStats.json
└── services/
    ├── onboarding/
    │   ├── individualOnboardingService.ts
    │   ├── corporateOnboardingService.ts
    │   ├── onboardingStatsService.ts
    │   └── externalAmlService.ts  # 외부 AML 결과 조회 전용
    └── api/
        └── onboardingApi.ts
```

---

## 6. 상태 관리 설계

### 6.1 React Query 활용

#### 6.1.1 목록 조회 (외부 AML 결과 포함)
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['onboarding', 'individual', filters],
  queryFn: ({ pageParam = 1 }) =>
    fetchIndividualOnboarding({ page: pageParam, ...filters }),
  // 외부 AML 결과가 포함된 데이터 반환
  staleTime: 30000  // 30초 (외부 시스템 결과는 자주 변하지 않음)
})
```

#### 6.1.2 관리자 결정 (낙관적 업데이트)
```typescript
const approveMutation = useMutation({
  mutationFn: approveOnboarding,
  onMutate: async (variables) => {
    // 낙관적 업데이트: adminReview.status만 변경
    // aml, riskAssessment는 변경하지 않음 (외부 시스템 데이터)
    queryClient.setQueryData(['onboarding', 'individual', variables.id], old => ({
      ...old,
      adminReview: {
        ...old.adminReview,
        status: 'APPROVED',
        decision: 'APPROVE'
      }
    }))
  },
  onSettled: () => {
    queryClient.invalidateQueries(['onboarding', 'individual'])
    queryClient.invalidateQueries(['onboarding', 'stats'])
  }
})
```

---

## 7. 개발 단계 계획 (수정)

### Phase 1: 기초 인프라 구축 (1주)
- [ ] 타입 정의 작성 (외부 AML 결과 + registrationSource 필드 포함)
- [ ] Mock 데이터 생성 (외부 AML 결과 + 온라인/오프라인 신청 포함)
- [ ] 서비스 레이어 구현
  - [ ] 외부 API 결과 조회 전용
  - [ ] 수동 등록 API 서비스
- [ ] API 추상화 레이어
- [ ] 기본 레이아웃 구성

**핵심 산출물:**
- `types/onboarding.ts` (외부 AML 필드 + registrationSource)
- `data/mockData/individualOnboarding.json` (온라인/오프라인 신청 구분)
- `services/externalAmlService.ts` (외부 결과 조회)
- `services/manualRegistrationService.ts` (수동 등록)

### Phase 2: 공통 컴포넌트 개발 (1.5주)
- [ ] RiskLevelBadge (외부 결과 표시)
- [ ] OnboardingStatusBadge
- [ ] **RegistrationSourceBadge** (신청 경로 표시)
- [ ] ProcessStepIndicator
- [ ] DocumentViewer
- [ ] AMLScreeningResult (외부 결과 표시, 읽기 전용)
- [ ] **ManualRegistrationButton** (수동 등록 버튼)
- [ ] **ManualRegistrationDialog** (수동 등록 다이얼로그)
- [ ] **IndividualRegistrationForm** (개인회원 등록 폼)
- [ ] **CorporateRegistrationForm** (법인회원 등록 폼)
- [ ] ApprovalDialog (외부 AML 요약 포함)
- [ ] RejectionDialog
- [ ] OnHoldDialog

**핵심 기능:**
- 수동 등록 시 서류 업로드 (신분증, 주소증명 등)
- 등록 경로 선택 (OFFLINE_BRANCH | PHONE_INQUIRY | EMAIL_REQUEST)
- 등록 사유 입력

### Phase 3: 대시보드 개발 (1주)
- [ ] 대시보드 레이아웃
- [ ] OnboardingStats 통계 카드
- [ ] RiskDistributionChart (외부 평가 기준)
- [ ] ExternalAmlStatusPanel (외부 연동 상태)
- [ ] RecentActivityFeed

### Phase 4: 개인회원 관리 (2주)
- [ ] 목록 페이지 + IndividualTable
- [ ] IndividualFilters (registrationSource 필터 포함)
- [ ] **ManualRegistrationButton 통합** (목록 페이지 상단)
- [ ] KYCSection (입력 정보 표시)
- [ ] AMLSection (외부 결과 표시, **읽기 전용**)
- [ ] RiskAssessmentSection (외부 결과, **읽기 전용**)
- [ ] AdditionalProceduresSection (외부 권장, **읽기 전용**)
- [ ] **AdminDecisionPanel** (관리자 결정 UI)
- [ ] 상세 검토 페이지
- [ ] 승인/거부/보류 워크플로우
- [ ] **수동 등록 워크플로우 테스트**

**중요**:
- AML 결과는 모두 읽기 전용으로 표시만
- 온라인/오프라인 신청 모두 동일한 검토 프로세스

### Phase 5: 법인회원 관리 (2주)
- [ ] 목록 페이지 + CorporateTable
- [ ] CorporateFilters (registrationSource 필터 포함)
- [ ] **ManualRegistrationButton 통합** (목록 페이지 상단)
- [ ] CorporateInfoSection
- [ ] UBOStructureViewer (외부 검증 결과, **읽기 전용**)
- [ ] CorporateRiskSection (외부 결과, **읽기 전용**)
- [ ] AdminDecisionPanel
- [ ] 상세 검토 페이지
- [ ] **수동 등록 워크플로우 테스트** (법인)

### Phase 6: 모니터링 기능 (1주)
- [ ] 갱신 일정 관리
- [ ] 재평가 큐
- [ ] 외부 AML 재검증 요청 UI

### Phase 7: 통합 테스트 및 최적화 (1주)
- [ ] 컴포넌트 단위 테스트
- [ ] 워크플로우 E2E 테스트
  - [ ] 온라인 신청 플로우
  - [ ] **오프라인 수동 등록 플로우**
- [ ] 외부 AML 연동 Mock 테스트
- [ ] 성능 최적화
- [ ] 접근성 검증

**총 개발 기간: 9.5주** (Phase 2가 0.5주 증가)

---

## 8. 주요 기술적 고려사항

### 8.1 외부 AML 연동 처리
- 외부 시스템 결과는 **읽기 전용**으로 처리
- 재검증 요청 시 **비동기 처리** (결과는 나중에 조회)
- 외부 참조 ID 저장으로 추적 가능

### 8.2 에러 처리
- 외부 AML 시스템 타임아웃 처리
- 재검증 요청 실패 시 사용자 알림
- 외부 결과 대기 중 상태 표시

### 8.3 보안
- 외부 AML API 키는 백엔드에서만 관리
- 민감한 AML 결과는 권한 있는 관리자만 조회

---

## 9. 위험 요소 및 대응 방안

| 위험 | 영향도 | 발생 확률 | 대응 방안 |
|------|--------|-----------|-----------|
| 외부 AML API 장애 | 높음 | 중간 | 재시도 로직, 타임아웃 설정, 사용자 알림 |
| 외부 결과 지연 | 중간 | 높음 | 비동기 처리, 대기 상태 UI 표시 |
| Mock 데이터와 실제 외부 API 구조 불일치 | 높음 | 중간 | 백엔드 팀과 API 스펙 사전 합의 |
| UBO 구조 시각화 복잡도 | 중간 | 높음 | 단계적 구현 |

---

## 10. 성공 지표

### 10.1 기능적 지표
- [ ] 외부 AML 결과 정확히 표시
- [ ] 관리자 승인/거부/보류 워크플로우 정상 작동
- [ ] 4단계 온보딩 프로세스 완료율 95% 이상
- [ ] **온라인/오프라인 신청 모두 정상 처리**
- [ ] **수동 등록 워크플로우 정상 작동** (서류 업로드 포함)

### 10.2 성능 지표
- [ ] 페이지 로딩 시간 < 2초
- [ ] 외부 AML 결과 조회 < 1초 (캐싱)

### 10.3 품질 지표
- [ ] TypeScript 에러 0건
- [ ] ESLint 경고 0건
- [ ] 접근성 테스트 통과

---

## 11. 결론

본 개발 계획서는 **외부 AML 솔루션 연동**과 **온라인/오프라인 신청 통합**을 전제로 한 온보딩 관리 시스템입니다.

**핵심 원칙:**
- **신청 경로**: 온라인 회원 신청 + 오프라인 관리자 수동 등록 (2가지 경로)
- **외부 AML 솔루션**: 스크리닝, 위험도 평가, 수동 조정
- **관리자 UI**: 외부 결과 **표시 + 참고하여 승인/거부 결정**
- **명확한 역할 분리**로 시스템 복잡도 최소화

**주요 기능:**
1. **온라인 신청 처리**: 회원이 직접 KYC 정보 입력 및 서류 업로드
2. **오프라인 수동 등록**: 관리자가 지점 방문, 전화, 이메일로 받은 서류 기반 등록
3. **통합 검토 프로세스**: 온라인/오프라인 구분 없이 동일한 AML 검토 및 승인 워크플로우
4. **신청 경로 추적**: registrationSource로 신청 경로 구분 및 필터링

**기대 효과:**
- 전문 AML 솔루션 활용으로 규제 준수 강화
- 온라인/오프라인 고객 모두 수용 가능한 유연한 시스템
- 관리자는 의사결정에 집중 (스크리닝은 외부 시스템)
- 커스터디 본업에 집중할 수 있는 환경 구축

**총 개발 기간**: 9.5주 (수동 등록 기능 포함)
