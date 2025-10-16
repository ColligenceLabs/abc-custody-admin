# 온보딩 신규등록 기능 설계 문서

## 개요

온보딩 관리 페이지(`/admin/members/onboarding`)에 신규 회원(개인/기업) 온보딩 신청을 생성할 수 있는 기능을 추가합니다.

## 1. 요구사항

### 기능 요구사항
- 관리자가 수동으로 개인/기업 회원의 온보딩 신청을 생성할 수 있어야 함
- 현재 활성화된 탭(개인/기업)에 따라 적절한 폼을 표시
- 필수 정보 입력 및 문서 업로드 기능 제공
- 생성된 신청은 즉시 목록에 표시되어야 함

### UI/UX 요구사항
- 페이지 헤더 우측에 "신규등록" 버튼 배치
- Dialog 형태의 모달로 폼 표시
- 단계별(3단계) 진행 방식
- 각 단계별 validation 및 진행률 표시
- 직관적인 파일 업로드 UI

## 2. 컴포넌트 아키텍처

### 컴포넌트 구조
```
src/app/admin/members/onboarding/
├── page.tsx                              # 메인 페이지 (버튼 추가)
├── components/
│   ├── NewApplicationButton.tsx          # 신규등록 버튼
│   ├── NewApplicationDialog.tsx          # 다이얼로그 컨테이너
│   ├── IndividualApplicationForm.tsx     # 개인 신청 폼
│   ├── CorporateApplicationForm.tsx      # 기업 신청 폼
│   └── FileUploadField.tsx               # 파일 업로드 컴포넌트
```

### 컴포넌트 상세

#### 1. NewApplicationButton.tsx
```typescript
interface NewApplicationButtonProps {
  memberType: 'individual' | 'corporate';
  onSuccess: () => void;
}
```
- Sapphire variant 버튼
- UserPlus 아이콘 사용
- 클릭 시 Dialog 오픈

#### 2. NewApplicationDialog.tsx
```typescript
interface NewApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberType: 'individual' | 'corporate';
  onSuccess: () => void;
}
```
- Dialog 컴포넌트로 구현
- 크기: max-w-4xl
- 스크롤 가능한 컨텐츠 영역
- memberType에 따라 적절한 폼 렌더링

#### 3. IndividualApplicationForm.tsx
```typescript
interface IndividualApplicationFormProps {
  onSubmit: (data: IndividualOnboardingApplication) => Promise<void>;
  onCancel: () => void;
}
```
- 3단계 스텝 진행
- Progress 컴포넌트로 진행률 표시
- 각 스텝별 필드 validation

**Step 1: 기본 정보**
- 성명 (필수)
- 생년월일 (필수)
- 국적 (필수, Select)
- 주민등록번호 (필수, 포맷: ******-*******)

**Step 2: 연락처 및 주소**
- 이메일 (필수, 이메일 형식 체크)
- 전화번호 (필수, 포맷: 010-****-****)
- 주소 (도로명, 시/군/구, 시/도, 우편번호, 국가)

**Step 3: 문서 업로드**
- 신분증 (필수)
- 주소 증명서 (필수)
- 소득 증명서 (선택)
- 본인 확인 사진 (필수)

#### 4. CorporateApplicationForm.tsx
```typescript
interface CorporateApplicationFormProps {
  onSubmit: (data: CorporateOnboardingApplication) => Promise<void>;
  onCancel: () => void;
}
```
- 3단계 스텝 진행
- Progress 컴포넌트로 진행률 표시
- 각 스텝별 필드 validation

**Step 1: 기업 정보**
- 회사명 (필수)
- 사업자등록번호 (필수, 포맷: ***-**-*****)
- 법인등록번호 (필수)
- 업종 (필수, Select)
- 설립일 (필수)

**Step 2: 대표자 및 담당자 정보**
- 대표자명, 직책, 이메일, 전화번호 (필수)
- 담당자명, 이메일, 전화번호 (필수)
- 회사 주소 (도로명, 시/군/구, 시/도, 우편번호, 국가)

**Step 3: 문서 업로드**
- 사업자등록증 (필수)
- 법인등기부등본 (필수)
- 대표자 신분증 (필수)
- AML 관련 서류 (필수)

#### 5. FileUploadField.tsx
```typescript
interface FileUploadFieldProps {
  label: string;
  required?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
}
```
- Input type="file"을 사용한 커스텀 업로드 UI
- 파일 선택 시 파일명 표시
- 제거 버튼 제공
- accept prop으로 파일 타입 제한

## 3. 데이터 플로우

### 신청 생성 프로세스
```
1. 사용자가 "신규등록" 버튼 클릭
   ↓
2. Dialog 오픈 (memberType에 따라 적절한 폼 표시)
   ↓
3. 사용자가 3단계 스텝을 진행하며 정보 입력
   ↓
4. "제출" 버튼 클릭
   ↓
5. 폼 validation 실행
   ↓
6. onboardingApi.createApplication() 호출
   ↓
7. Mock DB에 신규 신청 추가
   ↓
8. Dialog 닫기 + 성공 Toast 표시
   ↓
9. 페이지 데이터 새로고침 (목록에 신규 신청 표시)
```

### 데이터 구조
```typescript
// 개인 신청 데이터
interface IndividualFormData {
  // Step 1
  personalInfo: {
    fullName: string;
    birthDate: string;
    nationality: string;
    idNumber: string;
  };

  // Step 2
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Step 3
  documents: {
    personalId: File | null;
    proofOfAddress: File | null;
    incomeProof: File | null;
    selfiePhoto: File | null;
  };
}

// 기업 신청 데이터
interface CorporateFormData {
  // Step 1
  companyInfo: {
    companyName: string;
    businessNumber: string;
    corporateNumber: string;
    industry: string;
    establishedDate: string;
  };

  // Step 2
  representative: {
    name: string;
    position: string;
    email: string;
    phone: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  companyAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Step 3
  documents: {
    businessRegistration: File | null;
    corporateRegistry: File | null;
    representativeId: File | null;
    amlDocuments: File | null;
  };
}
```

## 4. API 서비스 레이어

### 파일 생성
```
src/data/mockData/onboardingApi.ts
```

### API 함수
```typescript
// 신규 개인 신청 생성
export async function createIndividualApplication(
  data: Omit<IndividualOnboardingApplication, 'id' | 'submittedAt' | 'workflow'>
): Promise<IndividualOnboardingApplication>

// 신규 기업 신청 생성
export async function createCorporateApplication(
  data: Omit<CorporateOnboardingApplication, 'id' | 'submittedAt' | 'workflow'>
): Promise<CorporateOnboardingApplication>

// 신청 목록 조회 (기존)
export function getIndividualApplications(): IndividualOnboardingApplication[]
export function getCorporateApplications(): CorporateOnboardingApplication[]
```

### Mock 데이터 생성 로직
```typescript
// ID 생성: `IND-${timestamp}` 또는 `CORP-${timestamp}`
// submittedAt: 현재 시간
// status: 'submitted' (초기 상태)
// priority: 'medium' (기본값)
// workflow: 자동 생성
//   - currentStage: 'submitted'
//   - status: 'pending'
//   - progress: 0
//   - assignedTo: null
//   - dueDate: 현재 + 7일
//   - isOverdue: false
```

## 5. Validation 규칙

### 공통 Validation
```typescript
// 필수 필드 체크
required: (value) => !!value || '필수 입력 항목입니다'

// 이메일 형식
email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || '올바른 이메일 형식이 아닙니다'

// 전화번호 형식 (010-****-****)
phone: (value) => /^01[0-9]-\d{4}-\d{4}$/.test(value) || '올바른 전화번호 형식이 아닙니다'
```

### 개인 Validation
```typescript
// 주민등록번호 형식 (******-*******)
idNumber: (value) => /^\d{6}-\d{7}$/.test(value) || '올바른 주민등록번호 형식이 아닙니다'
```

### 기업 Validation
```typescript
// 사업자등록번호 형식 (***-**-*****)
businessNumber: (value) => /^\d{3}-\d{2}-\d{5}$/.test(value) || '올바른 사업자등록번호 형식이 아닙니다'

// 법인등록번호 형식 (******-*******)
corporateNumber: (value) => /^\d{6}-\d{7}$/.test(value) || '올바른 법인등록번호 형식이 아닙니다'
```

### 파일 Validation
```typescript
// 파일 크기 제한 (10MB)
fileSize: (file) => file.size <= 10 * 1024 * 1024 || '파일 크기는 10MB 이하여야 합니다'

// 파일 형식 제한 (PDF, JPG, PNG)
fileType: (file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
  || '지원하는 파일 형식: PDF, JPG, PNG'
```

## 6. UI 컴포넌트 사용

### 필요한 Shadcn UI 컴포넌트
- Dialog (모달)
- Button (버튼)
- Input (입력 필드)
- Label (라벨)
- Select (드롭다운)
- Textarea (멀티라인 입력)
- Progress (진행률 표시)
- ScrollArea (스크롤 영역)
- Separator (구분선)
- Badge (뱃지)
- Toast (알림)

### 스타일 가이드
- 버튼: Sapphire variant 사용
- 간격: space-y-4, gap-4 사용
- 라벨: text-sm font-medium
- 필수 표시: 빨간색 별표 (*)
- 에러 메시지: text-sm text-red-500

## 7. 구현 단계

### Phase 1: UI 컴포넌트 구조 생성
1. NewApplicationButton.tsx 생성
2. NewApplicationDialog.tsx 생성
3. FileUploadField.tsx 생성
4. page.tsx에 버튼 추가

### Phase 2: 개인 신청 폼 구현
1. IndividualApplicationForm.tsx 생성
2. 3단계 스텝 UI 구현
3. 각 스텝별 필드 구현
4. Validation 로직 추가

### Phase 3: 기업 신청 폼 구현
1. CorporateApplicationForm.tsx 생성
2. 3단계 스텝 UI 구현
3. 각 스텝별 필드 구현
4. Validation 로직 추가

### Phase 4: API 서비스 레이어 구현
1. onboardingApi.ts 생성
2. createIndividualApplication 함수 구현
3. createCorporateApplication 함수 구현
4. Mock 데이터 생성 로직 구현

### Phase 5: 통합 및 테스트
1. 폼 제출 → API 호출 연결
2. 성공 시 Dialog 닫기 및 Toast 표시
3. 페이지 데이터 새로고침 연결
4. 전체 플로우 테스트

## 8. 예상 파일 크기

각 파일의 예상 라인 수:
- NewApplicationButton.tsx: ~50 lines
- NewApplicationDialog.tsx: ~100 lines
- FileUploadField.tsx: ~80 lines
- IndividualApplicationForm.tsx: ~300 lines (스텝별 분리 가능)
- CorporateApplicationForm.tsx: ~350 lines (스텝별 분리 가능)
- onboardingApi.ts: ~150 lines

**참고**: 각 폼 컴포넌트가 300라인을 넘을 경우, 스텝별로 별도 컴포넌트로 분리하여 파일 크기 관리

## 9. 추가 고려사항

### 성능
- 파일 업로드는 실제로는 Base64 또는 별도 스토리지 사용
- Mock 환경에서는 파일명만 저장

### 접근성
- 모든 입력 필드에 적절한 label 연결
- 키보드 네비게이션 지원
- 에러 메시지는 스크린 리더가 읽을 수 있도록 구현

### 향후 확장
- 파일 미리보기 기능
- 드래그 앤 드롭 파일 업로드
- 폼 자동 저장 (LocalStorage)
- 중복 제출 방지
- 실제 백엔드 API 연동 시 인터페이스 유지

## 10. 참고 자료

### 관련 타입 정의
- `src/data/types/individualOnboarding.ts`
- `src/data/types/corporateOnboarding.ts`
- `src/types/approvalWorkflow.ts`

### 기존 컴포넌트 참고
- `src/app/admin/members/onboarding/IndividualReviewDialog.tsx`
- `src/app/admin/members/onboarding/CorporateReviewDialog.tsx`
