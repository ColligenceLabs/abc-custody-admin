# 회원사 온보딩 시스템 - 개인/기업 회원 분리 설계서

## 📋 설계 개요

### 목적
기존 단일 온보딩 시스템을 **개인 회원(Individual)**과 **기업 회원(Corporate)**으로 분리하여 각 회원 유형에 맞는 최적화된 온보딩 프로세스 제공

### 비즈니스 요구사항
- 개인 회원: 일반 개인 투자자 대상 간소화된 KYC 프로세스
- 기업 회원: 법인 고객 대상 KYB(Know Your Business) 프로세스
- 각 회원 유형별 차별화된 문서 요구사항
- 통합된 관리자 인터페이스에서 두 유형 모두 처리 가능

### 현재 시스템 상태
- **현재**: 모든 회원이 기업(Corporate) 형태로 처리됨
- **데이터**: 사업자등록증, 법인등기부등본 등 기업 전용 문서만 관리
- **타입**: `OnboardingApplication` 하나의 타입만 존재

---

## 🏗️ 아키텍처 설계

### 시스템 구성도

```
┌─────────────────────────────────────────────────────────┐
│         Member Onboarding Management Page               │
│                 /admin/members/onboarding                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      Tab Selector (Tabs Component)    │
        │  ┌──────────┐        ┌──────────┐    │
        │  │ 개인 회원 │        │ 기업 회원 │    │
        │  │Individual│        │Corporate │    │
        │  └──────────┘        └──────────┘    │
        └──────────────────────────────────────┘
                │                        │
                ▼                        ▼
    ┌───────────────────┐    ┌───────────────────┐
    │ Individual        │    │ Corporate         │
    │ Applications      │    │ Applications      │
    │                   │    │                   │
    │ - Personal ID     │    │ - Business Reg.   │
    │ - Proof of Address│    │ - Corporate Reg.  │
    │ - Income Proof    │    │ - Rep. ID         │
    │ - Selfie Photo    │    │ - AML Docs        │
    └───────────────────┘    └───────────────────┘
                │                        │
                └────────┬───────────────┘
                         ▼
              ┌─────────────────────┐
              │  Approval Workflow   │
              │  (4-Stage Process)   │
              └─────────────────────┘
```

### 데이터 흐름

```
[User Application] → [Type Selection] → [Document Upload]
     → [Verification] → [Approval Workflow] → [Account Creation]
```

---

## 📊 데이터 모델 설계

### 1. Member Type Enum

```typescript
/**
 * 회원 유형
 */
export enum MemberType {
  INDIVIDUAL = "individual",  // 개인 회원
  CORPORATE = "corporate"      // 기업 회원
}
```

### 2. Document Types

#### 개인 회원 문서
```typescript
export interface IndividualDocuments {
  // 신분증 (필수)
  personalId: OnboardingDocument;

  // 주소 증명서 (필수) - 공과금 고지서, 주민등록등본 등
  proofOfAddress: OnboardingDocument;

  // 소득 증명서 (선택) - 재직증명서, 소득금액증명원 등
  incomeProof: OnboardingDocument;

  // 셀카 사진 (필수) - 신분증 들고 찍은 사진
  selfiePhoto: OnboardingDocument;
}
```

#### 기업 회원 문서 (기존 유지)
```typescript
export interface CorporateDocuments {
  // 사업자등록증 (필수)
  businessRegistration: OnboardingDocument;

  // 법인등기부등본 (필수)
  corporateRegistry: OnboardingDocument;

  // 대표자 신분증 (필수)
  representativeId: OnboardingDocument;

  // AML 관련 서류 (필수)
  amlDocuments: OnboardingDocument;
}
```

### 3. Onboarding Application Types

#### 개인 회원 신청
```typescript
export interface IndividualOnboardingApplication {
  id: string;
  memberType: MemberType.INDIVIDUAL;

  // 개인 정보
  personalInfo: {
    fullName: string;          // 성명
    birthDate: string;         // 생년월일
    nationality: string;       // 국적
    idNumber: string;          // 주민등록번호 (암호화)
  };

  // 연락처 정보
  contact: OnboardingContact;

  // 주소 정보
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // 개인 회원 전용 문서
  documents: IndividualDocuments;

  // 공통 필드
  submittedAt: string;
  status: 'submitted' | 'document_review' | 'compliance_review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  workflow: OnboardingWorkflow;
}
```

#### 기업 회원 신청 (기존 확장)
```typescript
export interface CorporateOnboardingApplication {
  id: string;
  memberType: MemberType.CORPORATE;

  // 기업 정보
  companyInfo: {
    companyName: string;       // 회사명
    businessNumber: string;    // 사업자등록번호
    corporateNumber: string;   // 법인등록번호
    industry: string;          // 업종
    establishedDate: string;   // 설립일
  };

  // 대표자 정보
  representative: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };

  // 담당자 정보 (대표자와 다를 수 있음)
  contact: OnboardingContact;

  // 기업 주소
  companyAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // 기업 회원 전용 문서
  documents: CorporateDocuments;

  // 공통 필드
  submittedAt: string;
  status: 'submitted' | 'document_review' | 'compliance_review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  workflow: OnboardingWorkflow;
}
```

#### 통합 타입 (Discriminated Union)
```typescript
export type OnboardingApplication =
  | IndividualOnboardingApplication
  | CorporateOnboardingApplication;
```

### 4. Type Guards

```typescript
export function isIndividualApplication(
  app: OnboardingApplication
): app is IndividualOnboardingApplication {
  return app.memberType === MemberType.INDIVIDUAL;
}

export function isCorporateApplication(
  app: OnboardingApplication
): app is CorporateOnboardingApplication {
  return app.memberType === MemberType.CORPORATE;
}
```

---

## 🎨 UI/UX 설계

### 1. Page Structure

```tsx
<OnboardingManagementPage>
  {/* Page Header */}
  <PageHeader
    title="회원사 온보딩 관리"
    description="개인 및 기업 회원 가입 신청을 처리합니다"
  />

  {/* Tabs for Member Type Selection */}
  <Tabs defaultValue="individual">
    <TabsList>
      <TabsTrigger value="individual">
        <User className="h-4 w-4 mr-2" />
        개인 회원
        <Badge className="ml-2">{individualCount}</Badge>
      </TabsTrigger>
      <TabsTrigger value="corporate">
        <Building className="h-4 w-4 mr-2" />
        기업 회원
        <Badge className="ml-2">{corporateCount}</Badge>
      </TabsTrigger>
    </TabsList>

    {/* Individual Tab Content */}
    <TabsContent value="individual">
      <IndividualApplicationsTable />
    </TabsContent>

    {/* Corporate Tab Content */}
    <TabsContent value="corporate">
      <CorporateApplicationsTable />
    </TabsContent>
  </Tabs>
</OnboardingManagementPage>
```

### 2. Statistics Cards (Type-Specific)

#### 개인 회원 통계
```tsx
<div className="grid gap-4 md:grid-cols-4">
  <StatCard
    title="전체 개인 신청"
    value={individualApps.length}
    icon={<User />}
  />
  <StatCard
    title="검토 대기"
    value={pendingIndividual}
    icon={<Clock />}
    variant="warning"
  />
  <StatCard
    title="승인 완료"
    value={approvedIndividual}
    icon={<CheckCircle />}
    variant="success"
  />
  <StatCard
    title="기한 초과"
    value={overdueIndividual}
    icon={<AlertTriangle />}
    variant="danger"
  />
</div>
```

#### 기업 회원 통계
```tsx
<div className="grid gap-4 md:grid-cols-4">
  <StatCard
    title="전체 기업 신청"
    value={corporateApps.length}
    icon={<Building />}
  />
  <StatCard
    title="검토 대기"
    value={pendingCorporate}
    icon={<Clock />}
    variant="warning"
  />
  <StatCard
    title="승인 완료"
    value={approvedCorporate}
    icon={<CheckCircle />}
    variant="success"
  />
  <StatCard
    title="기한 초과"
    value={overdueCorporate}
    icon={<AlertTriangle />}
    variant="danger"
  />
</div>
```

### 3. Table Columns

#### 개인 회원 테이블
| 컬럼 | 설명 | 데이터 |
|------|------|--------|
| 성명 | 신청자 이름 | `personalInfo.fullName` |
| 주민번호 | 마스킹 처리 | `***-*******` |
| 연락처 | 이메일/전화 | `contact.email` |
| 신청일 | 신청 날짜 | `submittedAt` |
| 상태 | 현재 상태 | Badge 컴포넌트 |
| 우선순위 | 처리 우선순위 | Badge 컴포넌트 |
| 진행률 | 워크플로우 진행률 | Progress Bar |
| 작업 | 검토 버튼 | Dialog 트리거 |

#### 기업 회원 테이블 (기존 유지)
| 컬럼 | 설명 | 데이터 |
|------|------|--------|
| 회사명 | 회사 이름 | `companyInfo.companyName` |
| 사업자번호 | 사업자등록번호 | `companyInfo.businessNumber` |
| 담당자 | 담당자 정보 | `contact.name` |
| 신청일 | 신청 날짜 | `submittedAt` |
| 상태 | 현재 상태 | Badge 컴포넌트 |
| 우선순위 | 처리 우선순위 | Badge 컴포넌트 |
| 진행률 | 워크플로우 진행률 | Progress Bar |
| 작업 | 검토 버튼 | Dialog 트리거 |

### 4. Document Labels

#### 개인 회원 문서 라벨
```typescript
const INDIVIDUAL_DOCUMENT_LABELS = {
  personalId: "신분증 (주민등록증/운전면허증/여권)",
  proofOfAddress: "주소 증명서 (공과금 고지서/주민등록등본)",
  incomeProof: "소득 증명서 (재직증명서/소득금액증명원)",
  selfiePhoto: "본인 확인 사진 (신분증 들고 촬영)"
};
```

#### 기업 회원 문서 라벨 (기존)
```typescript
const CORPORATE_DOCUMENT_LABELS = {
  businessRegistration: "사업자등록증",
  corporateRegistry: "법인등기부등본",
  representativeId: "대표자 신분증",
  amlDocuments: "AML 관련 서류"
};
```

### 5. Visual Indicators

#### Member Type Badge
```tsx
// 개인 회원
<Badge variant="default" className="bg-blue-500">
  <User className="h-3 w-3 mr-1" />
  개인
</Badge>

// 기업 회원
<Badge variant="sapphire" className="bg-purple-500">
  <Building className="h-3 w-3 mr-1" />
  기업
</Badge>
```

---

## 🔄 Workflow 설계

### 승인 워크플로우 (공통)

두 회원 유형 모두 동일한 4단계 워크플로우 사용:

1. **문서 검증 (DOCUMENT_VERIFICATION)**
   - 개인: 신분증, 주소증명서, 셀카 확인
   - 기업: 사업자등록증, 법인등기부, 대표자 신분증 확인

2. **컴플라이언스 체크 (COMPLIANCE_CHECK)**
   - 개인: 신원 확인, 제재 대상 여부
   - 기업: KYB 검증, 사업자 진위 확인

3. **리스크 평가 (RISK_ASSESSMENT)**
   - 개인: 자금 출처, 거래 목적
   - 기업: 업종별 리스크, 자금세탁 위험도

4. **최종 승인 (FINAL_APPROVAL)**
   - 최종 승인 시 자동 계정 생성
   - 초기 자산 및 주소 설정

### Type-Specific Validation

```typescript
function validateDocuments(app: OnboardingApplication): ValidationResult {
  if (isIndividualApplication(app)) {
    return validateIndividualDocuments(app.documents);
  } else {
    return validateCorporateDocuments(app.documents);
  }
}

function validateIndividualDocuments(docs: IndividualDocuments): ValidationResult {
  const errors: string[] = [];

  if (!docs.personalId.uploaded) errors.push("신분증을 업로드해주세요");
  if (!docs.proofOfAddress.uploaded) errors.push("주소 증명서를 업로드해주세요");
  if (!docs.selfiePhoto.uploaded) errors.push("본인 확인 사진을 업로드해주세요");

  return { isValid: errors.length === 0, errors };
}

function validateCorporateDocuments(docs: CorporateDocuments): ValidationResult {
  const errors: string[] = [];

  if (!docs.businessRegistration.uploaded) errors.push("사업자등록증을 업로드해주세요");
  if (!docs.corporateRegistry.uploaded) errors.push("법인등기부등본을 업로드해주세요");
  if (!docs.representativeId.uploaded) errors.push("대표자 신분증을 업로드해주세요");

  return { isValid: errors.length === 0, errors };
}
```

---

## 📁 파일 구조

### 새로 생성할 파일

```
src/
├── data/
│   ├── types/
│   │   ├── onboarding.ts                    # 기존 파일 수정
│   │   ├── individualOnboarding.ts          # 🆕 개인 회원 타입
│   │   └── corporateOnboarding.ts           # 🆕 기업 회원 타입
│   │
│   ├── mockData/
│   │   ├── onboardingApplications.ts        # 기존 파일 수정
│   │   ├── individualApplications.ts        # 🆕 개인 회원 Mock 데이터
│   │   └── corporateApplications.ts         # 🆕 기업 회원 Mock 데이터
│   │
│   └── services/
│       ├── onboardingService.ts             # 🆕 통합 온보딩 서비스
│       ├── individualOnboardingService.ts   # 🆕 개인 회원 서비스
│       └── corporateOnboardingService.ts    # 🆕 기업 회원 서비스
│
└── app/
    └── admin/
        └── members/
            └── onboarding/
                ├── page.tsx                  # 기존 파일 대폭 수정
                ├── IndividualTable.tsx       # 🆕 개인 회원 테이블
                ├── CorporateTable.tsx        # 🆕 기업 회원 테이블
                ├── IndividualDialog.tsx      # 🆕 개인 회원 검토 다이얼로그
                └── CorporateDialog.tsx       # 🆕 기업 회원 검토 다이얼로그
```

### 컴포넌트 분리 이유

**현재**: `page.tsx` 파일이 700+ 라인으로 비대함
**개선**: 기능별로 분리하여 200-300라인 유지

```
page.tsx (Main Orchestrator - 200 lines)
├── IndividualTable.tsx (150 lines)
│   └── IndividualDialog.tsx (250 lines)
└── CorporateTable.tsx (150 lines)
    └── CorporateDialog.tsx (250 lines)
```

---

## 🔨 구현 계획

### Phase 1: Type System (1-2 hours)

1. **타입 정의 생성**
   - `src/data/types/individualOnboarding.ts` 작성
   - `src/data/types/corporateOnboarding.ts` 작성
   - `src/data/types/onboarding.ts` 통합 타입으로 수정

2. **Type Guards 구현**
   - `isIndividualApplication()`
   - `isCorporateApplication()`

### Phase 2: Mock Data (1 hour)

1. **개인 회원 Mock 데이터**
   - 10개의 샘플 개인 회원 신청 생성
   - 다양한 상태 및 우선순위 포함

2. **기업 회원 Mock 데이터**
   - 기존 데이터를 `CorporateOnboardingApplication`으로 변환
   - `memberType: MemberType.CORPORATE` 추가

### Phase 3: Service Layer (2 hours)

1. **통합 서비스 레이어**
   - `onboardingService.ts`: 타입에 따라 적절한 서비스로 라우팅
   - `individualOnboardingService.ts`: 개인 회원 전용 로직
   - `corporateOnboardingService.ts`: 기업 회원 전용 로직

2. **Validation 로직**
   - 타입별 문서 검증
   - 필수/선택 필드 체크

### Phase 4: UI Components (3-4 hours)

1. **Main Page 리팩토링**
   - Tabs 컴포넌트 추가
   - 타입별 통계 카드
   - 검색/필터 타입 대응

2. **개별 테이블 컴포넌트**
   - `IndividualTable.tsx`: 개인 회원 전용 테이블
   - `CorporateTable.tsx`: 기업 회원 전용 테이블

3. **Dialog 컴포넌트**
   - `IndividualDialog.tsx`: 개인 회원 검토 UI
   - `CorporateDialog.tsx`: 기업 회원 검토 UI (기존 로직)

### Phase 5: Integration & Testing (1-2 hours)

1. **통합 테스트**
   - 두 타입 간 전환 테스트
   - 필터링 및 검색 동작 확인
   - 워크플로우 처리 확인

2. **Edge Cases**
   - 빈 목록 처리
   - 타입 변경 시 상태 유지
   - 에러 처리

---

## 📋 체크리스트

### 설계 단계
- [x] 현재 시스템 분석
- [x] 비즈니스 요구사항 정의
- [x] 데이터 모델 설계
- [x] UI/UX 설계
- [x] 파일 구조 계획
- [x] 구현 계획 수립

### 구현 단계
- [ ] MemberType enum 생성
- [ ] Individual/Corporate 타입 정의
- [ ] Type Guards 구현
- [ ] Mock 데이터 생성
- [ ] Service Layer 구현
- [ ] Main Page Tabs 추가
- [ ] Individual Table 컴포넌트
- [ ] Corporate Table 컴포넌트
- [ ] Individual Dialog 컴포넌트
- [ ] Corporate Dialog 컴포넌트
- [ ] Validation 로직 구현
- [ ] 통합 테스트

### 테스트 단계
- [ ] 개인 회원 신청 플로우 테스트
- [ ] 기업 회원 신청 플로우 테스트
- [ ] 타입 전환 테스트
- [ ] 문서 검증 테스트
- [ ] 워크플로우 승인 테스트
- [ ] Edge Cases 테스트

---

## 🎯 예상 결과

### 사용자 경험

#### 관리자 워크플로우
1. `/admin/members/onboarding` 접속
2. **탭 선택**: "개인 회원" 또는 "기업 회원"
3. 해당 타입의 신청 목록 확인
4. "워크플로우 검토" 버튼 클릭
5. **타입별 다른 UI 표시**:
   - 개인: 성명, 주민번호, 신분증, 주소증명서, 셀카
   - 기업: 회사명, 사업자번호, 법인서류, 대표자 정보
6. 문서 검토 및 승인 처리
7. 워크플로우 진행

#### 시각적 개선
- 🎨 **명확한 구분**: 탭으로 회원 유형 분리
- 📊 **타입별 통계**: 각 유형의 현황을 별도로 파악
- 🏷️ **Badge 표시**: 테이블에서 회원 유형 시각적 구분
- 📝 **적절한 라벨**: 각 타입에 맞는 문서명 표시

### 기술적 이점

1. **타입 안전성**: TypeScript Discriminated Union으로 타입 체크
2. **코드 재사용**: 공통 로직은 공유, 차별화된 부분만 분리
3. **확장성**: 새로운 회원 유형 추가 시 쉽게 확장 가능
4. **유지보수성**: 컴포넌트 분리로 파일 크기 감소 (700→200 lines)

---

## 📝 참고사항

### Backward Compatibility

기존 데이터 마이그레이션:
```typescript
// 기존 OnboardingApplication을 CorporateOnboardingApplication으로 변환
function migrateToTyped(oldApp: any): CorporateOnboardingApplication {
  return {
    ...oldApp,
    memberType: MemberType.CORPORATE,
    companyInfo: {
      companyName: oldApp.companyName,
      businessNumber: oldApp.businessNumber,
      // ... 기타 필드 매핑
    }
  };
}
```

### 향후 확장 가능성

추가 회원 유형:
- **기관 투자자 (Institutional)**: 연기금, 자산운용사
- **비영리 단체 (Non-Profit)**: 재단, 협회
- **정부 기관 (Government)**: 공공기관

각 유형별 별도 탭 및 문서 요구사항 정의 가능

---

**작성일**: 2025-10-13
**작성자**: Design System
**버전**: 1.0.0
**상태**: 설계 완료 (구현 대기)
