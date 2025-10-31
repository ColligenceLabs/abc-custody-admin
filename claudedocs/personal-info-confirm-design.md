# PersonalInfoConfirmStep 컴포넌트 설계 문서

## 개요

PASS 본인인증 완료 후 사용자 정보 확인, 약관 동의, 주소 등록을 처리하는 회원가입 중간 단계 컴포넌트입니다.

## 배경

- 기존 `PhoneVerificationStep.tsx` 파일을 재활용하여 새로운 단계 생성
- SMS 인증 관련 로직 제거, 주소 검색 기능으로 대체
- PASS 인증과 eKYC 인증 사이에 위치하는 새로운 단계

## 회원가입 프로세스 변경

### 기존 프로세스
```
회원 유형 선택 → 이메일 인증 → PASS 본인인증 → eKYC 인증 → 자금출처
```

### 변경된 프로세스
```
회원 유형 선택 → 이메일 인증 → PASS 본인인증 → [개인정보 확인 및 주소 등록] → eKYC 인증 → 자금출처
```

## 컴포넌트 사양

### 파일 정보
- **파일명**: `PersonalInfoConfirmStep.tsx`
- **위치**: `/src/components/signup/PersonalInfoConfirmStep.tsx`
- **기반 파일**: `PhoneVerificationStep.tsx` (재활용)

### Props 인터페이스

```typescript
interface PersonalInfoConfirmStepProps {
  initialData: SignupData;  // PASS 인증 정보 포함
  onComplete: (data: Partial<SignupData>) => void;
  onBack: () => void;
}
```

### State 구조

```typescript
// 약관 동의
const [allAgreed, setAllAgreed] = useState(false);
const [agreements, setAgreements] = useState({
  serviceTerms: false,    // 서비스 이용약관 (필수)
  personalInfo: false,    // 개인정보 수집 및 이용 (필수)
  marketing: false        // 마케팅 정보 수신 (선택)
});

// 개인정보 (PASS에서 전달받음, 읽기 전용)
const [name, setName] = useState(initialData.passName || "");
const [residentNumber, setResidentNumber] = useState(
  initialData.passBirthDate ?
    `${initialData.passBirthDate.replace(/-/g, '').substring(2)}-${initialData.passGender === 'MALE' ? '1' : '2'}******` :
    ""
);

// 주소 정보
const [zipCode, setZipCode] = useState("");
const [address, setAddress] = useState("");
const [detailAddress, setDetailAddress] = useState("");

// UI 상태
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState<{
  type: "success" | "error";
  text: string;
} | null>(null);
```

## UI 구조

### 1. 헤더 섹션
```typescript
<div className="text-center mb-6">
  <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
    <UserIcon className="w-6 h-6 text-primary-600" />
  </div>
  <h2 className="text-xl font-semibold text-gray-900">
    개인정보 확인 및 주소 등록
  </h2>
  <p className="text-gray-600 mt-1">
    본인 정보를 확인하고 주소를 등록해주세요
  </p>
</div>
```

### 2. 메시지 영역
- 성공/에러 메시지 표시
- 조건부 렌더링

### 3. 약관 동의 섹션
```typescript
<div className="mb-6 p-4 bg-gray-50 rounded-lg">
  {/* 전체 동의 체크박스 */}
  <label className="flex items-center cursor-pointer mb-3 pb-3 border-b border-gray-200">
    <input type="checkbox" checked={allAgreed} onChange={handleAllAgreement} />
    <span className="ml-3 text-sm font-semibold text-gray-900">전체 동의</span>
  </label>

  {/* 개별 약관 체크박스 */}
  <div className="space-y-2">
    {/* 서비스 이용약관 (필수) */}
    {/* 개인정보 수집 및 이용 (필수) */}
    {/* 마케팅 정보 수신 (선택) */}
  </div>
</div>
```

### 4. 개인정보 확인 섹션 (읽기 전용)
```typescript
<div className="space-y-4 mb-6">
  {/* 이름 - 읽기 전용 */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      이름
    </label>
    <input
      type="text"
      value={name}
      readOnly
      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
    />
  </div>

  {/* 주민번호 앞자리 - 읽기 전용 */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      생년월일
    </label>
    <input
      type="text"
      value={residentNumber}
      readOnly
      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
    />
  </div>
</div>
```

### 5. 주소 등록 섹션
```typescript
<div className="space-y-4">
  {/* 우편번호 + 주소 검색 버튼 */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      우편번호
    </label>
    <div className="flex space-x-2">
      <input
        type="text"
        value={zipCode}
        readOnly
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
        placeholder="우편번호"
      />
      <button
        onClick={handleAddressSearch}
        className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
      >
        주소 검색
      </button>
    </div>
  </div>

  {/* 기본 주소 - 읽기 전용 */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      기본 주소
    </label>
    <input
      type="text"
      value={address}
      readOnly
      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
      placeholder="주소 검색 버튼을 클릭해주세요"
    />
  </div>

  {/* 상세 주소 - 입력 가능 */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      상세 주소
    </label>
    <input
      type="text"
      value={detailAddress}
      onChange={(e) => setDetailAddress(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      placeholder="동, 호수 등 상세 주소를 입력해주세요"
    />
  </div>
</div>
```

### 6. 버튼 영역
```typescript
<div className="flex space-x-3 mt-6">
  <button onClick={onBack} className="flex-1 border">
    이전
  </button>
  <button
    onClick={handleNext}
    disabled={!isValid || loading}
    className="flex-1 bg-primary-600"
  >
    {loading ? "처리 중..." : "다음"}
  </button>
</div>
```

## 다음 주소 검색 API 통합

### 스크립트 로드 방법

**Option 1: 컴포넌트 내 동적 로드 (권장)**
```typescript
useEffect(() => {
  const script = document.createElement('script');
  script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
  script.async = true;
  document.head.appendChild(script);

  return () => {
    document.head.removeChild(script);
  };
}, []);
```

**Option 2: 전역 Script 로드**
- `_app.tsx` 또는 `layout.tsx`에 추가
- 타입 정의 필요: `declare global { interface Window { daum: any } }`

### 주소 검색 함수

```typescript
const handleAddressSearch = () => {
  if (!window.daum) {
    setMessage({
      type: "error",
      text: "주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
    });
    return;
  }

  new window.daum.Postcode({
    oncomplete: function(data: any) {
      // 도로명 주소 또는 지번 주소 선택
      const fullAddress = data.userSelectedType === 'R'
        ? data.roadAddress
        : data.jibunAddress;

      setZipCode(data.zonecode);
      setAddress(fullAddress);
      setMessage({
        type: "success",
        text: "주소가 입력되었습니다. 상세 주소를 입력해주세요."
      });
    }
  }).open();
};
```

### 타입 정의 (필요시)

```typescript
// src/types/daum.d.ts
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

interface DaumPostcodeData {
  zonecode: string;           // 우편번호
  address: string;            // 기본 주소
  roadAddress: string;        // 도로명 주소
  jibunAddress: string;       // 지번 주소
  buildingName: string;       // 건물명
  userSelectedType: 'R' | 'J'; // 사용자 선택 타입 (R: 도로명, J: 지번)
}

export {};
```

## SignupData 인터페이스 확장

### 추가 필드

```typescript
export interface SignupData {
  // ... 기존 필드들

  // 주소 관련 추가
  zipCode?: string;
  address?: string;
  detailAddress?: string;

  // 약관 동의 추가
  serviceTermsAgreed?: boolean;
  personalInfoAgreed?: boolean;
  marketingAgreed?: boolean;
}
```

## 검증 로직

### 다음 단계 진행 조건

```typescript
const isValid =
  // 필수 약관 동의 확인
  agreements.serviceTerms &&
  agreements.personalInfo &&
  // 주소 정보 입력 확인
  zipCode.length > 0 &&
  address.length > 0 &&
  detailAddress.length > 0;
```

### handleNext 함수

```typescript
const handleNext = () => {
  if (!isValid) {
    setMessage({
      type: "error",
      text: "필수 약관에 동의하고 주소 정보를 모두 입력해주세요."
    });
    return;
  }

  // 데이터 전달
  onComplete({
    zipCode,
    address,
    detailAddress,
    serviceTermsAgreed: agreements.serviceTerms,
    personalInfoAgreed: agreements.personalInfo,
    marketingAgreed: agreements.marketing
  });
};
```

## 회원가입 페이지 수정사항

### 1. SignupStep 타입 수정

```typescript
// page.tsx
export type SignupStep = 'type' | 'email' | 'phone' | 'info' | 'kyc' | 'fund' | 'completed'
```

### 2. steps 배열 수정

```typescript
const steps = [
  { key: 'type' as SignupStep, label: '회원 유형', icon: UserGroupIcon },
  { key: 'email' as SignupStep, label: '이메일 인증', icon: EnvelopeIcon },
  { key: 'phone' as SignupStep, label: '본인인증', icon: DocumentTextIcon },
  { key: 'info' as SignupStep, label: '정보 확인', icon: UserIcon }, // 추가
  { key: 'kyc' as SignupStep, label: 'eKYC 인증', icon: CreditCardIcon },
  { key: 'fund' as SignupStep, label: '자금출처', icon: DocumentCheckIcon },
]
```

### 3. stepOrder 배열 수정

```typescript
const stepOrder: SignupStep[] = ['type', 'email', 'phone', 'info', 'kyc', 'fund', 'completed']
```

### 4. 컴포넌트 렌더링 추가

```typescript
// import 추가
import PersonalInfoConfirmStep from '@/components/signup/PersonalInfoConfirmStep'

// 렌더링 추가
{currentStep === 'info' && (
  <PersonalInfoConfirmStep
    initialData={signupData}
    onComplete={(data) => handleStepComplete('info', data)}
    onBack={handleBack}
  />
)}
```

## 구현 순서

1. **SignupData 인터페이스 확장** (`src/app/signup/page.tsx`)
   - 주소 관련 필드 추가
   - 약관 동의 필드 추가

2. **PersonalInfoConfirmStep 컴포넌트 생성**
   - PhoneVerificationStep.tsx 복사하여 시작
   - SMS 인증 관련 로직 제거
   - 주소 검색 기능 추가
   - 약관 항목 수정

3. **회원가입 페이지 수정** (`src/app/signup/page.tsx`)
   - SignupStep 타입에 'info' 추가
   - steps 배열 업데이트
   - stepOrder 배열 업데이트
   - PersonalInfoConfirmStep 컴포넌트 import 및 렌더링

4. **다음 주소 검색 API 통합 및 테스트**
   - 스크립트 로드 확인
   - 주소 검색 팝업 동작 확인
   - 주소 데이터 저장 확인

5. **전체 회원가입 플로우 테스트**
   - PASS 인증 → 개인정보 확인 → eKYC 전환 확인
   - 데이터 전달 검증

## 주의사항

1. **PASS 인증 데이터 의존성**
   - initialData에 passName, passPhone, passBirthDate, passGender가 반드시 있어야 함
   - 없는 경우 빈 값 또는 기본값 처리 필요

2. **주소 검색 API 로딩**
   - 스크립트 로딩 전 버튼 클릭 방지
   - 로딩 상태 표시 고려

3. **읽기 전용 필드 스타일**
   - `bg-gray-50`, `text-gray-500`, `cursor-not-allowed` 클래스 사용
   - 사용자가 수정 불가능함을 명확히 표시

4. **선택 약관 처리**
   - 마케팅 정보 수신은 선택사항
   - 필수 약관만 검증에 포함

5. **타입 안전성**
   - 다음 API window 객체 타입 정의
   - TypeScript 에러 방지

## 예상 화면 구성

```
┌─────────────────────────────────────────┐
│         개인정보 확인 및 주소 등록          │
│     본인 정보를 확인하고 주소를 등록해주세요   │
├─────────────────────────────────────────┤
│                                         │
│  ☑ 전체 동의                             │
│  ──────────────────────                 │
│  ☑ 서비스 이용약관 동의 (필수)       >    │
│  ☑ 개인정보 수집 및 이용 동의 (필수) >    │
│  ☐ 마케팅 정보 수신 동의 (선택)      >    │
│                                         │
│  이름                                    │
│  [홍길동                    ] (읽기전용)  │
│                                         │
│  생년월일                                │
│  [901231-1******            ] (읽기전용)  │
│                                         │
│  우편번호                                │
│  [12345        ] [주소 검색]             │
│                                         │
│  기본 주소                               │
│  [서울시 강남구 테헤란로 123    ] (읽기전용)│
│                                         │
│  상세 주소                               │
│  [101동 101호                          ]│
│                                         │
│  [이전]              [다음]              │
└─────────────────────────────────────────┘
```

## 테스트 시나리오

### 1. 정상 플로우
1. PASS 인증 완료 후 개인정보 확인 단계 진입
2. 이름, 주민번호가 PASS 정보로 자동 입력됨 (읽기 전용)
3. 전체 동의 체크 → 모든 약관 자동 체크
4. 주소 검색 버튼 클릭 → 다음 팝업 오픈
5. 주소 선택 → 우편번호, 기본주소 자동 입력
6. 상세 주소 입력
7. 다음 버튼 클릭 → eKYC 단계로 이동

### 2. 에러 케이스
- 필수 약관 미동의 시 다음 버튼 비활성화
- 주소 미입력 시 다음 버튼 비활성화
- 상세 주소 미입력 시 경고 메시지

### 3. 이전 버튼
- PASS 본인인증 단계로 돌아가기
- 입력한 주소 정보 유지 여부 확인

## 참고 자료

- [다음 주소 검색 API 공식 문서](https://postcode.map.daum.net/guide)
- Next.js Script 컴포넌트: https://nextjs.org/docs/app/api-reference/components/script
- 기존 PhoneVerificationStep.tsx 파일 참고
