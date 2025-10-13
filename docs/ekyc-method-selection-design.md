# eKYC 인증 방식 선택 기능 설계

## 1. 개요

### 1.1 목적
사용자가 eKYC 인증을 진행할 때 **모바일 촬영** 또는 **PC 업로드** 두 가지 방식 중 선택할 수 있도록 개선하여 사용자 편의성을 향상시킵니다.

### 1.2 핵심 요구사항
1. **인증 방식 선택 화면**: 사용자가 모바일/PC 중 선택할 수 있는 UI 제공
2. **모바일 촬영 방식**: QR 코드를 통해 모바일에서 신분증 촬영 및 인증 진행
3. **PC 업로드 방식**: PC에서 직접 신분증 업로드 및 인증 진행 (현재 방식)
4. **다음에 하기**: 인증을 나중으로 미루는 옵션 제공 (이미 구현됨)

### 1.3 기대 효과
- **사용자 편의성**: 사용자가 상황에 맞는 인증 방식 선택 가능
- **모바일 우선**: 더 선명한 촬영을 위한 모바일 카메라 활용
- **PC 대안**: PC만 있는 환경에서도 파일 업로드로 인증 가능

---

## 2. 현재 상태 분석

### 2.1 기존 플로우
```
[회원가입 시작]
    ↓
[회원 유형 선택]
    ↓
[이메일 인증]
    ↓
[본인인증 (휴대폰)]
    ↓
[eKYC 인증] ← 현재: PC 업로드만 지원
    ├─ eKYC 인증 시작 (iframe에서 직접 진행)
    └─ 다음에 하기 (skip)
    ↓
[자금출처 입력]
    ↓
[회원가입 완료]
```

### 2.2 기존 구현 파일
- **메인 컴포넌트**: `src/components/signup/IDAndAccountVerificationStep.tsx`
  - 현재: iframe을 통해 useB eKYC 직접 실행
  - 신분증 + 계좌 인증 통합 진행
  - "다음에 하기" 버튼으로 skip 기능 제공

- **인증 페이지**: `src/app/kyc/verification/page.tsx`
  - 로그인 후 eKYC 완료를 위한 독립 페이지

- **환경 변수**: `.env.local`
  - `EKYC_CUSTOMER_ID=224`
  - `EKYC_CLIENT_ID=8pTkDgU2B9`
  - `EKYC_CLIENT_SECRET=Z2DrjFtSu81v9$B`

### 2.3 useB eKYC 방식
- **기본 URL**: `https://kyc.useb.co.kr/auth`
- **QR 방식 URL**: `https://kyc.useb.co.kr/qr` (추정)
- **통신**: postMessage API를 통한 양방향 통신
- **인증 단계**:
  1. 신분증 OCR + 얼굴 인증
  2. 1원 계좌 인증

---

## 3. 설계 상세

### 3.1 새로운 플로우

```
[eKYC 인증 단계 진입]
    ↓
[인증 방식 선택 화면] ← 신규
    ├─ [모바일로 촬영]
    │   ↓
    │   [QR 코드 표시 + 안내]
    │   ↓
    │   [useB QR iframe]
    │   ↓
    │   [모바일에서 eKYC 진행]
    │   ↓
    │   [인증 완료 대기]
    │
    ├─ [PC에서 업로드]
    │   ↓
    │   [useB eKYC iframe] (기존 방식)
    │   ↓
    │   [PC에서 eKYC 진행]
    │   ↓
    │   [인증 완료]
    │
    └─ [다음에 하기] (skip)
        ↓
        [kycStatus: 'skipped']
```

### 3.2 데이터 모델 확장

#### SignupData 인터페이스 확장
```typescript
export interface SignupData {
  // ... 기존 필드들 ...
  kycStatus?: 'pending' | 'verified' | 'skipped'
  idVerified?: boolean
  accountVerified?: boolean

  // 신규 필드
  kycMethod?: 'mobile' | 'pc'  // 선택한 인증 방식
  kycTransactionId?: string     // useB transaction ID
}
```

### 3.3 컴포넌트 구조

#### 3.3.1 IDAndAccountVerificationStep 컴포넌트 개선

**Phase 정의 확장**
```typescript
type VerificationPhase =
  | "intro"           // 인증 방식 선택 화면
  | "qr"              // QR 코드 표시 화면 (모바일 방식)
  | "id"              // 신분증 인증 (PC 방식 - 기존)
  | "account"         // 계좌 인증 (PC 방식 - 기존)
  | "complete"        // 인증 완료
```

**State 확장**
```typescript
const [currentPhase, setCurrentPhase] = useState<VerificationPhase>("intro")
const [selectedMethod, setSelectedMethod] = useState<'mobile' | 'pc' | null>(null)
const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
const [loading, setLoading] = useState(false)
const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null)
```

---

## 4. UI 구성

### 4.1 인증 방식 선택 화면 (Phase: intro)

```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
  {/* 헤더 */}
  <div className="text-center mb-8">
    <h2 className="text-2xl font-semibold text-gray-900">
      신분증 인증 방법을 선택하세요
    </h2>
    <p className="text-gray-600 mt-2">
      편리한 방법으로 신분증 인증을 진행하세요
    </p>
  </div>

  {/* 방식 선택 카드 */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    {/* 모바일 촬영 카드 */}
    <button
      onClick={() => handleMethodSelect('mobile')}
      className="p-8 border-2 border-primary-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-center group"
    >
      <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200">
        <DevicePhoneMobileIcon className="w-10 h-10 text-primary-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        모바일로 촬영
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        스마트폰으로 직접 촬영하여 업로드
      </p>

      <div className="space-y-2 text-left">
        <div className="flex items-start text-xs text-gray-600">
          <CheckCircleIcon className="w-4 h-4 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
          <span>더 선명한 촬영 품질</span>
        </div>
        <div className="flex items-start text-xs text-gray-600">
          <CheckCircleIcon className="w-4 h-4 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
          <span>간편한 촬영 가이드</span>
        </div>
        <div className="flex items-start text-xs text-gray-600">
          <CheckCircleIcon className="w-4 h-4 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
          <span>실시간 얼굴 가이드</span>
        </div>
      </div>

      <span className="inline-block mt-4 px-3 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full">
        추천
      </span>
    </button>

    {/* PC 업로드 카드 */}
    <button
      onClick={() => handleMethodSelect('pc')}
      className="p-8 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-center group"
    >
      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200">
        <ComputerDesktopIcon className="w-10 h-10 text-gray-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        PC에서 업로드
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        이미 촬영한 사진을 업로드
      </p>

      <div className="space-y-2 text-left">
        <div className="flex items-start text-xs text-gray-600">
          <CheckCircleIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
          <span>기존 사진 활용</span>
        </div>
        <div className="flex items-start text-xs text-gray-600">
          <CheckCircleIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
          <span>PC 환경에서 처리</span>
        </div>
        <div className="flex items-start text-xs text-gray-600">
          <CheckCircleIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
          <span>파일 선택 선택</span>
        </div>
      </div>
    </button>
  </div>

  {/* 안내 사항 */}
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h4 className="text-sm font-semibold text-blue-900 mb-2">
      안내 사항
    </h4>
    <ul className="text-xs text-blue-700 space-y-1">
      <li>• 주민등록증, 운전면허증, 여권을 사용할 수 있습니다</li>
      <li>• 신분증의 모든 정보가 선명하게 보여야 합니다</li>
      <li>• 인증 후 계좌 인증(1원 인증)이 이어서 진행됩니다</li>
      <li>• 전체 인증 과정은 약 5-7분 소요됩니다</li>
    </ul>
  </div>

  {/* Skip 안내 */}
  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p className="text-xs text-yellow-800">
      eKYC 인증을 나중에 진행하실 수 있습니다. 단, 일부 서비스 이용이 제한될 수 있습니다.
    </p>
  </div>

  {/* 버튼 그룹 */}
  <div className="flex space-x-3">
    <button
      onClick={onBack}
      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
    >
      이전
    </button>

    <button
      onClick={handleSkipVerification}
      className="flex-1 px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
    >
      다음에 하기
    </button>
  </div>
</div>
```

### 4.2 모바일 QR 화면 (Phase: qr)

```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
  {/* 헤더 */}
  <div className="text-center mb-6">
    <h2 className="text-xl font-semibold text-gray-900">
      모바일로 QR 코드를 스캔하세요
    </h2>
    <p className="text-gray-600 mt-2">
      카메라 앱으로 QR 코드를 스캔하면 인증이 시작됩니다
    </p>
  </div>

  {/* 메시지 */}
  {message && (
    <div className={`mb-4 p-4 rounded-lg border ${
      message.type === 'success'
        ? 'bg-primary-50 border-primary-200 text-primary-800'
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-center">
        {message.type === 'success' ? (
          <CheckCircleIcon className="w-5 h-5 mr-2" />
        ) : (
          <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
        )}
        <span className="text-sm">{message.text}</span>
      </div>
    </div>
  )}

  {/* QR 코드 영역 */}
  <div className="flex justify-center mb-6">
    <div className="p-8 bg-white border-4 border-primary-200 rounded-2xl shadow-lg">
      {loading ? (
        <div className="w-64 h-64 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          id="kyc_qr_iframe"
          className="w-64 h-64"
          src={KYC_QR_URL}
          title="eKYC QR 코드"
          style={{ border: 'none' }}
        />
      )}
    </div>
  </div>

  {/* 안내 단계 */}
  <div className="mb-6 space-y-3">
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
        1
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-700">
          모바일 카메라 앱으로 QR 코드를 스캔하세요
        </p>
      </div>
    </div>

    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
        2
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-700">
          모바일에서 인증 화면이 열리면 안내에 따라 진행하세요
        </p>
      </div>
    </div>

    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
        3
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-700">
          신분증 촬영 → 얼굴 인증 → 계좌 인증 순으로 진행됩니다
        </p>
      </div>
    </div>
  </div>

  {/* 주의사항 */}
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h4 className="text-sm font-semibold text-blue-900 mb-2">
      주의사항
    </h4>
    <ul className="text-xs text-blue-700 space-y-1">
      <li>• QR 코드는 10분간 유효합니다</li>
      <li>• 모바일에서 인증이 완료되면 자동으로 다음 단계로 이동합니다</li>
      <li>• 인증 중 이 화면을 벗어나지 마세요</li>
    </ul>
  </div>

  {/* 버튼 */}
  <div className="flex space-x-3">
    <button
      onClick={handleBackToMethodSelection}
      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
    >
      방식 다시 선택
    </button>

    <button
      onClick={handleCancel}
      className="flex-1 px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
    >
      인증 취소
    </button>
  </div>
</div>
```

### 4.3 PC 업로드 화면 (Phase: id/account) - 기존 유지

현재 구현된 iframe 방식 그대로 유지:
- useB eKYC iframe 표시 (900px 높이)
- 신분증 OCR + 얼굴 인증
- 계좌 1원 인증
- postMessage 기반 상태 관리

---

## 5. 기술 구현

### 5.1 useB API 통합

#### 5.1.1 QR 방식 URL 및 파라미터

```typescript
// QR 코드 생성 URL (추정)
const KYC_QR_URL = "https://kyc.useb.co.kr/qr"

// QR 코드 생성 시 전달할 파라미터
const qrParams = {
  customer_id: 224,
  id: "8pTkDgU2B9",
  key: "Z2DrjFtSu81v9$B",
  name: initialData.name || "",
  birthday: birthday,
  phone_number: phoneNumber,
  email: initialData.email || "",
  isWasmOCRMode: "true",
  isWasmSSAMode: "true",
  // QR 방식 구분자 (추정)
  mode: "qr"
}
```

#### 5.1.2 PC 업로드 방식 (기존)

```typescript
// 기존 PC 업로드 URL
const KYC_URL = "https://kyc.useb.co.kr/auth"

// 동일한 파라미터 구조 사용
const pcParams = {
  customer_id: 224,
  id: "8pTkDgU2B9",
  key: "Z2DrjFtSu81v9$B",
  name: initialData.name || "",
  birthday: birthday,
  phone_number: phoneNumber,
  email: initialData.email || "",
  isWasmOCRMode: "true",
  isWasmSSAMode: "true"
}
```

### 5.2 핵심 함수 구현

#### 5.2.1 인증 방식 선택 핸들러

```typescript
const handleMethodSelect = async (method: 'mobile' | 'pc') => {
  setSelectedMethod(method)
  setMessage(null)

  if (method === 'mobile') {
    // QR 코드 화면으로 전환
    setCurrentPhase('qr')
    setLoading(true)
  } else if (method === 'pc') {
    // 기존 PC 방식으로 전환
    setCurrentPhase('id')
    setLoading(true)
  }
}
```

#### 5.2.2 QR 코드 iframe 초기화

```typescript
useEffect(() => {
  if (currentPhase !== 'qr' || !iframeRef.current) return

  const iframe = iframeRef.current

  const handleLoad = async () => {
    try {
      // QR 파라미터 생성
      const qrParams = {
        customer_id: 224,
        id: "8pTkDgU2B9",
        key: "Z2DrjFtSu81v9$B",
        name: initialData.name || "",
        birthday: birthday,
        phone_number: phoneNumber,
        email: initialData.email || "",
        isWasmOCRMode: "true",
        isWasmSSAMode: "true",
        mode: "qr"
      }

      const encodedParams = btoa(encodeURIComponent(JSON.stringify(qrParams)))
      iframe.contentWindow?.postMessage(encodedParams, KYC_TARGET_ORIGIN)

      setLoading(false)
      setMessage({
        type: 'success',
        text: '모바일에서 QR 코드를 스캔하여 인증을 시작하세요.'
      })
    } catch (error) {
      console.error('QR 코드 생성 오류:', error)
      setMessage({
        type: 'error',
        text: 'QR 코드 생성 중 오류가 발생했습니다.'
      })
      setLoading(false)
    }
  }

  iframe.addEventListener('load', handleLoad)
  return () => iframe.removeEventListener('load', handleLoad)
}, [currentPhase, initialData])
```

#### 5.2.3 postMessage 응답 처리 (공통)

모바일/PC 방식 모두 동일한 postMessage 응답 처리:
- `result: 'success'` + `review_result` → 신분증/계좌 인증 완료 확인
- `result: 'complete'` → 전체 인증 완료
- `result: 'close'` → 인증 중단
- `result: 'failed'` → 인증 실패

```typescript
// 기존 handleMessage 함수 그대로 사용
// 모바일/PC 구분 없이 동일한 응답 처리
```

### 5.3 아이콘 임포트

```typescript
import {
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DevicePhoneMobileIcon,     // 모바일 아이콘 (신규)
  ComputerDesktopIcon,        // PC 아이콘 (신규)
  QrCodeIcon                  // QR 코드 아이콘 (옵션)
} from '@heroicons/react/24/outline'
```

---

## 6. 구현 순서

### Phase 1: UI 개선 (프론트엔드)

#### Step 1: 인증 방식 선택 화면 구현
- [ ] `intro` phase UI를 방식 선택 화면으로 개선
- [ ] 모바일/PC 선택 카드 UI 구현
- [ ] `handleMethodSelect` 함수 구현
- [ ] 아이콘 임포트 및 적용

#### Step 2: QR 코드 화면 구현
- [ ] `qr` phase 추가 및 UI 구현
- [ ] QR iframe 렌더링 로직 구현
- [ ] QR 파라미터 생성 및 postMessage 전송
- [ ] 안내 단계 UI 구현

#### Step 3: PC 방식 유지
- [ ] 기존 `id`/`account` phase 로직 유지
- [ ] PC 선택 시 기존 플로우로 진행하도록 연결

#### Step 4: 상태 관리 개선
- [ ] `selectedMethod` state 추가
- [ ] `kycMethod` 필드를 `SignupData`에 추가
- [ ] 인증 완료 시 선택한 방식 저장

#### Step 5: 테스트
- [ ] 모바일 방식 플로우 테스트
- [ ] PC 방식 플로우 테스트 (기존)
- [ ] "다음에 하기" 플로우 테스트 (기존)
- [ ] 반응형 디자인 확인

### Phase 2: useB API 확인 및 조정

#### Step 6: useB QR API 확인
- [ ] useB 문서에서 QR 방식 URL 확인
- [ ] QR 파라미터 구조 확인
- [ ] QR 방식 postMessage 응답 차이점 확인

#### Step 7: API 통합 조정
- [ ] 확인된 URL/파라미터로 코드 수정
- [ ] QR 방식 응답 처리 로직 조정 (필요시)
- [ ] 에러 핸들링 강화

### Phase 3: 백엔드 통합 (향후)

#### Step 8: 데이터베이스 스키마 업데이트
- [ ] `kycMethod` 필드 추가
- [ ] 인증 방식별 통계 수집 (옵션)

#### Step 9: API 엔드포인트 개선
- [ ] 회원가입 API에 `kycMethod` 저장
- [ ] KYC 완료 API에 `kycMethod` 포함
- [ ] 사용자 정보 조회 API에 인증 방식 반환

---

## 7. 기술적 고려사항

### 7.1 QR 코드 타임아웃
- **문제**: QR 코드는 보통 10분 후 만료
- **해결책**:
  - 만료 시간 표시 (카운트다운 타이머)
  - 재생성 버튼 제공
  - 만료 시 자동 알림

```typescript
const [qrExpireTime, setQrExpireTime] = useState<number>(600) // 10분 = 600초

useEffect(() => {
  if (currentPhase !== 'qr') return

  const timer = setInterval(() => {
    setQrExpireTime(prev => {
      if (prev <= 1) {
        clearInterval(timer)
        setMessage({
          type: 'error',
          text: 'QR 코드가 만료되었습니다. 다시 생성해주세요.'
        })
        return 0
      }
      return prev - 1
    })
  }, 1000)

  return () => clearInterval(timer)
}, [currentPhase])
```

### 7.2 모바일 인증 상태 동기화
- **문제**: PC 화면에서 모바일 인증 진행 상태를 알 수 없음
- **해결책**:
  - postMessage 응답을 통한 실시간 상태 업데이트
  - 로딩 인디케이터 표시
  - 진행 단계 안내 메시지

### 7.3 네트워크 오류 처리
- **문제**: iframe 로드 실패, postMessage 타임아웃
- **해결책**:
  - iframe 로드 타임아웃 (30초)
  - 재시도 버튼 제공
  - 명확한 오류 메시지

```typescript
const [iframeLoadTimeout, setIframeLoadTimeout] = useState<NodeJS.Timeout | null>(null)

useEffect(() => {
  if (currentPhase === 'qr' && iframeRef.current) {
    const timeout = setTimeout(() => {
      setMessage({
        type: 'error',
        text: 'QR 코드를 불러올 수 없습니다. 네트워크 연결을 확인하고 다시 시도해주세요.'
      })
      setLoading(false)
    }, 30000) // 30초

    setIframeLoadTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }
}, [currentPhase])
```

### 7.4 반응형 디자인
- **모바일**: 카드를 세로로 배치, QR 코드 크기 조정
- **태블릿**: 카드를 가로로 배치
- **PC**: 카드를 가로로 배치, 넓은 간격

```css
/* Tailwind 클래스 활용 */
grid-cols-1 md:grid-cols-2  /* 모바일: 1열, 태블릿+: 2열 */
w-64 h-64 md:w-80 md:h-80   /* QR 코드 크기 조정 */
```

---

## 8. 예상 이슈 및 해결 방안

### 8.1 useB QR API 미확인
- **문제**: useB 문서에 QR 방식 API가 명시되지 않을 수 있음
- **해결책**:
  1. useB 고객 지원팀에 QR 방식 API 문의
  2. 테스트 계정으로 QR 방식 직접 확인
  3. 대안: PC 방식만 먼저 구현하고 QR 방식은 추후 추가

### 8.2 QR 코드 스캔 실패
- **사용자 문제**: 카메라 권한, 조명 불량, QR 코드 인식 실패
- **해결책**:
  - 상세한 안내 문구 제공
  - "잘 안 되나요?" FAQ 링크
  - PC 방식으로 전환 버튼 제공

### 8.3 모바일/PC 인증 차이
- **문제**: 모바일과 PC에서 인증 정확도가 다를 수 있음
- **해결책**:
  - 두 방식 모두 동일한 useB OCR 엔진 사용
  - 사용자에게 권장 방식(모바일) 안내
  - 실패 시 대안 방식 제시

---

## 9. 성공 지표

### 9.1 사용자 경험
- [ ] 모바일 방식 선택률 > 60%
- [ ] eKYC 인증 완료율 증가 (skip 비율 감소)
- [ ] 평균 인증 소요 시간 감소

### 9.2 기술 성능
- [ ] QR 코드 로딩 시간 < 3초
- [ ] iframe 로딩 실패율 < 1%
- [ ] postMessage 통신 성공률 > 99%

### 9.3 품질
- [ ] 모바일 방식 인증 성공률 > 95%
- [ ] PC 방식 인증 성공률 > 90% (기존 유지)
- [ ] 사용자 피드백 점수 > 4.5/5.0

---

## 10. 참고 자료

### 10.1 관련 파일
- `src/components/signup/IDAndAccountVerificationStep.tsx`
- `src/app/signup/page.tsx`
- `src/app/kyc/verification/page.tsx`
- `src/components/dashboard/KYCStatusBanner.tsx`

### 10.2 useB 문서
- useB eKYC 공식 문서: (확인 필요)
- useB QR 방식 API: (확인 필요)

### 10.3 디자인 참고
- 첨부된 이미지: 모바일 촬영 / PC 업로드 선택 UI

---

## 11. 다음 단계

1. **useB 문서 확인**: QR 방식 API URL 및 파라미터 확인
2. **UI 구현**: 인증 방식 선택 화면 및 QR 화면 개발
3. **통합 테스트**: 실제 useB 환경에서 모바일/PC 방식 검증
4. **사용자 테스트**: 베타 사용자 대상 테스트 및 피드백 수집
5. **배포**: 프로덕션 환경 배포 및 모니터링

---

**문서 작성일**: 2025년 (현재)
**작성자**: AI Assistant
**버전**: 1.0
