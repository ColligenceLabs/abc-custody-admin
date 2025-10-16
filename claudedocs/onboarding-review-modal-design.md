# 온보딩 검토 모달 설계 문서
## Onboarding Review Modal Design Document

**작성일**: 2025-10-13
**대상 페이지**: `/admin/members/onboarding`
**목적**: 개인/기업 회원 신청 검토 버튼 클릭 시 표시되는 모달 UI 및 기능 구현

---

## 1. 개요 (Overview)

### 1.1 현재 상태
- 개인 회원 신청 목록 (`IndividualTable.tsx`)과 기업 회원 신청 목록 (`CorporateTable.tsx`)에 "검토" 버튼이 존재
- 현재는 `alert()` 창만 표시되며, 실제 검토 기능은 미구현 (TODO 주석)
- 각 테이블의 "작업" 열에 "Eye" 아이콘과 함께 "검토" 버튼 표시

### 1.2 구현 목표
- 개인 회원 검토 모달 (`IndividualReviewDialog.tsx`) 구현
- 기업 회원 검토 모달 (`CorporateReviewDialog.tsx`) 구현
- 신청서 정보 표시, 문서 검증, 승인/반려/보류 처리 기능 포함
- 반응형 디자인 및 접근성 준수

---

## 2. 개인 회원 검토 모달 (Individual Review Dialog)

### 2.1 UI 구조

#### 전체 레이아웃
```
┌─────────────────────────────────────────────────────────┐
│ [X] 개인 회원 신청 검토 - 홍길동                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ ┌─ Tabs ──────────────────────────────────────────────┐ │
│ │ [신청 정보] [문서 검증] [검토 처리]                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                           │
│ [Tab Content Area - 스크롤 가능]                         │
│                                                           │
│                                                           │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                          [닫기] [승인] [반려] [보류]    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Tab 1: 신청 정보

#### Section 1: 개인 정보
```typescript
// PersonalInfo 표시
- 성명: {fullName}
- 생년월일: {birthDate} (YYYY-MM-DD)
- 국적: {nationality}
- 주민등록번호: {idNumber} (마스킹: 123456-1******)
```

#### Section 2: 연락처 정보
```typescript
// ContactInfo 표시
- 담당자명: {name}
- 이메일: {email}
- 전화번호: {phone}
```

#### Section 3: 주소 정보
```typescript
// AddressInfo 표시
- 도로명 주소: {street}
- 시/군/구: {city}
- 시/도: {state}
- 우편번호: {postalCode}
- 국가: {country}
```

#### Section 4: 신청 상태
```typescript
// Application Status
- 신청 ID: {id}
- 신청일: {submittedAt}
- 현재 상태: {status} - Badge 컴포넌트 사용
- 우선순위: {priority} - Badge 컴포넌트 사용
- 진행률: {workflow.progress}% - Progress Bar
- 담당자: {workflow.assignedTo || "미배정"}
- 마감일: {workflow.dueDate}
- 기한 초과: {workflow.isOverdue ? "예" : "아니오"} - 빨강/초록 색상
```

### 2.3 Tab 2: 문서 검증

#### 문서 체크리스트 (4개 문서)
```typescript
// IndividualDocuments
각 문서에 대해:
┌─────────────────────────────────────────────────┐
│ ✓/✗ 신분증 (주민등록증/운전면허증/여권)          │
│   - 업로드 여부: {uploaded ? "완료" : "미완료"} │
│   - 검증 상태: {verified ? "검증완료" : "검증필요"} │
│   [문서 보기] [검증 완료] [재요청]              │
└─────────────────────────────────────────────────┘

1. personalId - 신분증 (필수)
2. proofOfAddress - 주소 증명서 (필수)
3. incomeProof - 소득 증명서 (선택)
4. selfiePhoto - 본인 확인 사진 (필수)
```

#### 문서별 UI 구성
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      {verified ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-gray-400" />}
      {INDIVIDUAL_DOCUMENT_LABELS[documentKey]}
      {!uploaded && <Badge variant="destructive">미업로드</Badge>}
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">업로드 여부</span>
        <Badge variant={uploaded ? "default" : "secondary"}>
          {uploaded ? "업로드 완료" : "미업로드"}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">검증 상태</span>
        <Badge variant={verified ? "default" : "secondary"}>
          {verified ? "검증 완료" : "검증 필요"}
        </Badge>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" disabled={!uploaded}>
          <Eye className="h-4 w-4 mr-1" />
          문서 보기
        </Button>
        <Button variant="sapphire" size="sm" disabled={!uploaded || verified}>
          <Check className="h-4 w-4 mr-1" />
          검증 완료
        </Button>
        <Button variant="outline" size="sm" disabled={!uploaded}>
          <RefreshCw className="h-4 w-4 mr-1" />
          재요청
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

#### 전체 진행률 표시
```tsx
<div className="mb-6">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium">문서 검증 진행률</span>
    <span className="text-sm text-muted-foreground">
      {verifiedCount}/{totalDocuments} 완료
    </span>
  </div>
  <Progress value={(verifiedCount / totalDocuments) * 100} />
</div>
```

### 2.4 Tab 3: 검토 처리

#### Section 1: 검토 의견 입력
```tsx
<Card>
  <CardHeader>
    <CardTitle>검토 의견</CardTitle>
    <CardDescription>
      승인, 반려, 또는 보류 처리 시 의견을 작성해주세요
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Textarea
      placeholder="검토 의견을 입력하세요..."
      value={reviewNotes}
      onChange={(e) => setReviewNotes(e.target.value)}
      rows={5}
    />
  </CardContent>
</Card>
```

#### Section 2: 처리 옵션
```tsx
<Card>
  <CardHeader>
    <CardTitle>처리 결정</CardTitle>
  </CardHeader>
  <CardContent>
    <RadioGroup value={decision} onValueChange={setDecision}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="approve" id="approve" />
        <Label htmlFor="approve" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          승인 - 회원 가입을 승인합니다
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="reject" id="reject" />
        <Label htmlFor="reject" className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-500" />
          반려 - 신청을 거부합니다
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="hold" id="hold" />
        <Label htmlFor="hold" className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-500" />
          보류 - 추가 검토가 필요합니다
        </Label>
      </div>
    </RadioGroup>
  </CardContent>
</Card>
```

#### Section 3: 반려 사유 (반려 선택 시에만 표시)
```tsx
{decision === 'reject' && (
  <Card>
    <CardHeader>
      <CardTitle>반려 사유 (필수)</CardTitle>
    </CardHeader>
    <CardContent>
      <Select value={rejectionReason} onValueChange={setRejectionReason}>
        <SelectTrigger>
          <SelectValue placeholder="반려 사유를 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="incomplete_documents">서류 미비</SelectItem>
          <SelectItem value="invalid_documents">서류 위조 의심</SelectItem>
          <SelectItem value="failed_aml">AML 검증 실패</SelectItem>
          <SelectItem value="ineligible">가입 자격 미달</SelectItem>
          <SelectItem value="other">기타 사유</SelectItem>
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
)}
```

### 2.5 Footer 액션 버튼

```tsx
<DialogFooter className="gap-2">
  <Button variant="outline" onClick={onClose}>
    닫기
  </Button>
  <Button
    variant="default"
    className="bg-green-600 hover:bg-green-700"
    onClick={handleApprove}
    disabled={decision !== 'approve' || !reviewNotes.trim()}
  >
    <CheckCircle className="h-4 w-4 mr-2" />
    승인
  </Button>
  <Button
    variant="destructive"
    onClick={handleReject}
    disabled={decision !== 'reject' || !reviewNotes.trim() || !rejectionReason}
  >
    <XCircle className="h-4 w-4 mr-2" />
    반려
  </Button>
  <Button
    variant="secondary"
    onClick={handleHold}
    disabled={decision !== 'hold' || !reviewNotes.trim()}
  >
    <Clock className="h-4 w-4 mr-2" />
    보류
  </Button>
</DialogFooter>
```

---

## 3. 기업 회원 검토 모달 (Corporate Review Dialog)

### 3.1 UI 구조

동일한 3개 탭 구조:
- Tab 1: 신청 정보
- Tab 2: 문서 검증
- Tab 3: 검토 처리

### 3.2 Tab 1: 신청 정보

#### Section 1: 기업 정보
```typescript
// CompanyInfo 표시
- 회사명: {companyName}
- 사업자등록번호: {businessNumber}
- 법인등록번호: {corporateNumber}
- 업종: {industry}
- 설립일: {establishedDate} (YYYY-MM-DD)
```

#### Section 2: 대표자 정보
```typescript
// RepresentativeInfo 표시
- 대표자명: {name}
- 직책: {position}
- 이메일: {email}
- 전화번호: {phone}
```

#### Section 3: 담당자 정보
```typescript
// ContactInfo 표시
- 담당자명: {name}
- 이메일: {email}
- 전화번호: {phone}
```

#### Section 4: 회사 주소
```typescript
// CompanyAddress 표시
- 도로명 주소: {street}
- 시/군/구: {city}
- 시/도: {state}
- 우편번호: {postalCode}
- 국가: {country}
```

#### Section 5: 신청 상태
(개인 회원과 동일한 구조)

### 3.3 Tab 2: 문서 검증

#### 문서 체크리스트 (4개 문서)
```typescript
// CorporateDocuments
1. businessRegistration - 사업자등록증 (필수)
2. corporateRegistry - 법인등기부등본 (필수)
3. representativeId - 대표자 신분증 (필수)
4. amlDocuments - AML 관련 서류 (필수)
```

문서별 UI 구성은 개인 회원과 동일하며, 라벨만 `CORPORATE_DOCUMENT_LABELS` 사용

### 3.4 Tab 3: 검토 처리

개인 회원과 동일한 구조:
- 검토 의견 입력
- 처리 옵션 (승인/반려/보류)
- 반려 사유 선택 (반려 시)

### 3.5 Footer 액션 버튼

개인 회원과 동일

---

## 4. 컴포넌트 구조 (Component Structure)

### 4.1 파일 구조
```
src/app/admin/members/onboarding/
├── page.tsx                       (기존)
├── IndividualTable.tsx            (기존 - 수정 필요)
├── CorporateTable.tsx             (기존 - 수정 필요)
├── IndividualReviewDialog.tsx     (신규 생성)
├── CorporateReviewDialog.tsx      (신규 생성)
└── components/
    ├── DocumentChecklistCard.tsx  (공통 컴포넌트)
    ├── ReviewNotesSection.tsx     (공통 컴포넌트)
    └── ReviewDecisionSection.tsx  (공통 컴포넌트)
```

### 4.2 IndividualReviewDialog.tsx Props
```typescript
interface IndividualReviewDialogProps {
  application: IndividualOnboardingApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (applicationId: string, notes: string) => Promise<void>;
  onReject: (applicationId: string, reason: string, notes: string) => Promise<void>;
  onHold: (applicationId: string, notes: string) => Promise<void>;
}
```

### 4.3 CorporateReviewDialog.tsx Props
```typescript
interface CorporateReviewDialogProps {
  application: CorporateOnboardingApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (applicationId: string, notes: string) => Promise<void>;
  onReject: (applicationId: string, reason: string, notes: string) => Promise<void>;
  onHold: (applicationId: string, notes: string) => Promise<void>;
}
```

---

## 5. 상태 관리 (State Management)

### 5.1 Dialog 상태 (테이블 컴포넌트)
```typescript
// IndividualTable.tsx
const [selectedApplication, setSelectedApplication] = useState<IndividualOnboardingApplication | null>(null);
const [isDialogOpen, setIsDialogOpen] = useState(false);

const handleReviewClick = (application: IndividualOnboardingApplication) => {
  setSelectedApplication(application);
  setIsDialogOpen(true);
};
```

### 5.2 Review Dialog 내부 상태
```typescript
const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'review'>('info');
const [reviewNotes, setReviewNotes] = useState('');
const [decision, setDecision] = useState<'approve' | 'reject' | 'hold' | null>(null);
const [rejectionReason, setRejectionReason] = useState('');
const [isProcessing, setIsProcessing] = useState(false);
```

---

## 6. API 함수 (Mock)

### 6.1 필요한 API 함수
```typescript
// src/data/mockData/onboardingApi.ts (신규 생성)

/**
 * 개인 회원 신청 승인
 */
export async function approveIndividualApplication(
  applicationId: string,
  notes: string
): Promise<void> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Approved individual application ${applicationId} with notes: ${notes}`);
}

/**
 * 개인 회원 신청 반려
 */
export async function rejectIndividualApplication(
  applicationId: string,
  reason: string,
  notes: string
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Rejected individual application ${applicationId} with reason: ${reason}, notes: ${notes}`);
}

/**
 * 개인 회원 신청 보류
 */
export async function holdIndividualApplication(
  applicationId: string,
  notes: string
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Put on hold individual application ${applicationId} with notes: ${notes}`);
}

// 기업 회원용 동일한 함수들
export async function approveCorporateApplication(...) { ... }
export async function rejectCorporateApplication(...) { ... }
export async function holdCorporateApplication(...) { ... }
```

---

## 7. Shadcn UI 컴포넌트 필요 목록

### 7.1 이미 설치된 컴포넌트
- Dialog ✓
- Tabs ✓
- Card ✓
- Badge ✓
- Button ✓
- Input ✓
- Textarea ✓
- Progress ✓

### 7.2 추가 설치 필요
```bash
npx shadcn@latest add radio-group
npx shadcn@latest add select
npx shadcn@latest add label
npx shadcn@latest add separator
```

---

## 8. 구현 순서 (Implementation Order)

### Phase 1: 기본 구조 (1-2시간)
1. `IndividualReviewDialog.tsx` 파일 생성 - 기본 Dialog 구조
2. `CorporateReviewDialog.tsx` 파일 생성 - 기본 Dialog 구조
3. 3개 탭 구조 구현 (빈 콘텐츠)
4. `IndividualTable.tsx`, `CorporateTable.tsx` 수정 - Dialog 연동

### Phase 2: Tab 1 - 신청 정보 (1시간)
1. 개인 회원 정보 표시 UI
2. 기업 회원 정보 표시 UI
3. 신청 상태 섹션 구현

### Phase 3: Tab 2 - 문서 검증 (1-2시간)
1. `DocumentChecklistCard.tsx` 공통 컴포넌트 생성
2. 개인 회원 문서 체크리스트 (4개 문서)
3. 기업 회원 문서 체크리스트 (4개 문서)
4. 문서 검증 진행률 Progress Bar

### Phase 4: Tab 3 - 검토 처리 (1-2시간)
1. 검토 의견 입력 섹션
2. 처리 옵션 라디오 그룹
3. 반려 사유 선택 드롭다운
4. Footer 액션 버튼 구현

### Phase 5: API 연동 및 상태 관리 (1시간)
1. `onboardingApi.ts` Mock API 함수 생성
2. 승인/반려/보류 핸들러 구현
3. Toast 알림 시스템 연동
4. 로딩 상태 처리

### Phase 6: 테스트 및 버그 수정 (1시간)
1. 모든 시나리오 테스트 (승인/반려/보류)
2. 반응형 디자인 확인
3. 접근성 검증
4. TypeScript 타입 오류 수정

**총 예상 시간**: 6-9시간 (약 1일)

---

## 9. 디자인 가이드라인

### 9.1 색상 시스템
- 승인 (Approve): Green - `bg-green-600`, `text-green-600`
- 반려 (Reject): Red - `bg-red-600`, `text-red-600`
- 보류 (Hold): Yellow - `bg-yellow-600`, `text-yellow-600`
- 정보 (Info): Blue - Sapphire 테마
- 중립 (Neutral): Gray - `bg-gray-500`, `text-muted-foreground`

### 9.2 반응형 디자인
- 모바일 (< 768px): 세로 스크롤, 풀 스크린 Dialog
- 태블릿 (768px - 1024px): 중간 크기 Dialog (80% width)
- 데스크톱 (> 1024px): 고정 크기 Dialog (max-w-4xl)

### 9.3 접근성
- 키보드 네비게이션 지원 (Tab, Enter, Esc)
- ARIA 라벨 및 역할 명시
- 색상 외에 아이콘으로도 상태 구분
- 스크린 리더 대응

---

## 10. 테스트 체크리스트

### 10.1 기능 테스트
- [ ] 개인 회원 "검토" 버튼 클릭 → 모달 오픈
- [ ] 기업 회원 "검토" 버튼 클릭 → 모달 오픈
- [ ] Tab 전환 동작 확인 (신청 정보 ↔ 문서 검증 ↔ 검토 처리)
- [ ] 신청 정보 표시 (개인: 4개 섹션, 기업: 5개 섹션)
- [ ] 문서 체크리스트 표시 (개인: 4개, 기업: 4개)
- [ ] 승인 처리 (검토 의견 필수)
- [ ] 반려 처리 (반려 사유 + 검토 의견 필수)
- [ ] 보류 처리 (검토 의견 필수)
- [ ] 처리 중 로딩 상태 표시
- [ ] 처리 완료 시 Toast 알림
- [ ] 모달 닫기 (X 버튼, ESC 키, "닫기" 버튼)

### 10.2 UI/UX 테스트
- [ ] 반응형 레이아웃 (모바일/태블릿/데스크톱)
- [ ] 다크모드 색상 대응
- [ ] 긴 텍스트 처리 (줄바꿈, 말줄임)
- [ ] 버튼 비활성화 조건 확인
- [ ] Progress Bar 애니메이션

### 10.3 접근성 테스트
- [ ] 키보드만으로 모든 기능 사용 가능
- [ ] 스크린 리더로 모든 콘텐츠 읽기 가능
- [ ] 포커스 표시 명확
- [ ] ARIA 라벨 적절

---

## 11. 참고 자료

### 11.1 관련 파일
- `/src/data/types/individualOnboarding.ts` - 개인 회원 타입 정의
- `/src/data/types/corporateOnboarding.ts` - 기업 회원 타입 정의
- `/src/app/admin/members/onboarding/page.tsx` - 온보딩 메인 페이지
- `/src/app/admin/members/onboarding/IndividualTable.tsx` - 개인 회원 테이블
- `/src/app/admin/members/onboarding/CorporateTable.tsx` - 기업 회원 테이블

### 11.2 Shadcn UI 문서
- Dialog: https://ui.shadcn.com/docs/components/dialog
- Tabs: https://ui.shadcn.com/docs/components/tabs
- RadioGroup: https://ui.shadcn.com/docs/components/radio-group
- Select: https://ui.shadcn.com/docs/components/select

---

**문서 버전**: 1.0
**최종 검토일**: 2025-10-13
**작성자**: SuperClaude Design System
