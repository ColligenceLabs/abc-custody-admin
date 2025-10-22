# 마이페이지 Google OTP 인증 시스템 설계

## 1. 시스템 개요

### 목적
회원용 프론트엔드에서 마이페이지(/setting) 진입 시 Google OTP 인증을 요구하여 개인정보 탭에 대한 추가 보안 계층을 제공합니다.

### 핵심 요구사항
- 마이페이지 진입 시 Google OTP 인증 필수
- OTP 인증 성공 후에만 개인정보 탭 접근 허용
- 기존 백엔드 OTP API (`/api/auth/verify-otp`) 재사용
- 인증 상태 30분 유효 (세션 기반)
- 브라우저 탭 닫으면 재인증 필요

### 기술 스택
- **프론트엔드**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **백엔드 API**: Node.js + Express (기존 `/api/auth/verify-otp`)
- **인증 라이브러리**: OTPAuth (백엔드에서 TOTP 검증)
- **상태 관리**: React Context API + sessionStorage

---

## 2. 인증 플로우

### 2.1 전체 플로우 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 사용자가 /setting 페이지 접근 시도                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. OTPAuthContext에서 인증 상태 확인                        │
│    - isVerified: boolean                                    │
│    - verifiedAt: timestamp                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
           ┌──────────┴──────────┐
           │                     │
      [인증됨]              [미인증/만료]
           │                     │
           ▼                     ▼
┌──────────────────┐  ┌──────────────────────────────────────┐
│ 3. 마이페이지    │  │ 4. OTP 인증 모달 표시                │
│    접근 허용     │  │    - 6자리 OTP 코드 입력 필드       │
└──────────────────┘  │    - 실시간 유효성 검증             │
                      │    - 제출 버튼                      │
                      └─────────────┬────────────────────────┘
                                    │
                                    ▼
                      ┌─────────────────────────────────────┐
                      │ 5. 백엔드 API 호출                  │
                      │    POST /api/auth/verify-otp        │
                      │    {email, memberType, otpCode}     │
                      └─────────────┬───────────────────────┘
                                    │
                      ┌─────────────┴─────────────┐
                      │                           │
                 [성공: 200]                [실패: 401/403]
                      │                           │
                      ▼                           ▼
        ┌──────────────────────────┐  ┌──────────────────────────┐
        │ 6. 인증 상태 저장        │  │ 7. 에러 메시지 표시      │
        │    - sessionStorage      │  │    - 잘못된 OTP 코드     │
        │    - OTPAuthContext      │  │    - 잔여 시도 횟수      │
        │    - 타임스탬프 기록     │  │    - 계정 잠금 (403)     │
        └──────────┬───────────────┘  └──────────┬───────────────┘
                   │                              │
                   ▼                              │
        ┌──────────────────────────┐              │
        │ 8. 모달 닫기 및          │              │
        │    마이페이지 접근 허용  │◄─────────────┘
        └──────────────────────────┘     (재시도)
```

### 2.2 상세 프로세스

#### Step 1: 마이페이지 접근 시도
```typescript
// app/setting/page.tsx or layout.tsx
const { user } = useAuth();
const { isVerified, isExpired } = useOTPAuth();

useEffect(() => {
  if (!isVerified || isExpired()) {
    setShowOTPModal(true);
  }
}, [isVerified, isExpired]);
```

#### Step 2: OTP 인증 상태 확인
```typescript
// contexts/OTPAuthContext.tsx
const OTP_TIMEOUT = 30 * 60 * 1000; // 30분

const isExpired = () => {
  if (!verifiedAt) return true;
  return Date.now() - verifiedAt > OTP_TIMEOUT;
};
```

#### Step 3: OTP 검증 API 호출
```typescript
// services/otpService.ts
export async function verifyOTP(
  email: string,
  memberType: 'individual' | 'corporate',
  otpCode: string
) {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, memberType, otpCode })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

#### Step 4: 인증 상태 저장
```typescript
// OTPAuthContext
const setVerified = () => {
  const timestamp = Date.now();
  setVerifiedAt(timestamp);
  setIsVerified(true);

  // sessionStorage에 저장 (브라우저 탭 닫으면 삭제)
  sessionStorage.setItem('otp_verified_at', timestamp.toString());
};
```

---

## 3. 컴포넌트 구조

### 3.1 컴포넌트 계층

```
app/setting/
├── layout.tsx (또는 page.tsx)
│   └── OTPAuthGuard 로직 포함
│
components/auth/
├── OTPVerificationModal.tsx       # OTP 입력 모달
│   ├── OTPInputField.tsx          # 6자리 입력 필드
│   └── OTPErrorMessage.tsx        # 에러 메시지 표시
│
contexts/
├── OTPAuthContext.tsx             # OTP 인증 상태 관리
│
services/
└── otpService.ts                  # OTP API 호출 서비스
```

### 3.2 주요 컴포넌트 상세

#### OTPVerificationModal.tsx
```typescript
interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OTPVerificationModal({
  isOpen,
  onClose,
  onSuccess
}: OTPVerificationModalProps) {
  const [otpCode, setOTPCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { setVerified } = useOTPAuth();

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyOTP(
        user.email,
        user.memberType,
        otpCode
      );

      if (result.success) {
        setVerified();
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google OTP 인증</DialogTitle>
          <DialogDescription>
            개인정보 보호를 위해 Google Authenticator 인증이 필요합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <OTPInputField
            value={otpCode}
            onChange={setOTPCode}
            onSubmit={handleSubmit}
            disabled={isLoading}
          />

          {error && <OTPErrorMessage message={error} />}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={otpCode.length !== 6 || isLoading}
          >
            {isLoading ? '확인 중...' : '확인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### OTPInputField.tsx
```typescript
interface OTPInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function OTPInputField({
  value,
  onChange,
  onSubmit,
  disabled
}: OTPInputFieldProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    // 숫자만 허용
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split('');
    newValue[index] = digit;
    onChange(newValue.join(''));

    // 다음 입력 필드로 자동 이동
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'Enter' && value.length === 6) {
      onSubmit();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
```

#### OTPAuthContext.tsx
```typescript
interface OTPAuthContextType {
  isVerified: boolean;
  verifiedAt: number | null;
  isExpired: () => boolean;
  setVerified: () => void;
  clearVerification: () => void;
}

const OTP_TIMEOUT = 30 * 60 * 1000; // 30분
const STORAGE_KEY = 'otp_verified_at';

export function OTPAuthProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState<number | null>(null);

  // 초기화: sessionStorage에서 복원
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const timestamp = parseInt(stored, 10);
      if (Date.now() - timestamp < OTP_TIMEOUT) {
        setVerifiedAt(timestamp);
        setIsVerified(true);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const isExpired = useCallback(() => {
    if (!verifiedAt) return true;
    return Date.now() - verifiedAt > OTP_TIMEOUT;
  }, [verifiedAt]);

  const setVerified = useCallback(() => {
    const timestamp = Date.now();
    setVerifiedAt(timestamp);
    setIsVerified(true);
    sessionStorage.setItem(STORAGE_KEY, timestamp.toString());
  }, []);

  const clearVerification = useCallback(() => {
    setVerifiedAt(null);
    setIsVerified(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // 자동 만료 체크 (1분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isVerified && isExpired()) {
        clearVerification();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [isVerified, isExpired, clearVerification]);

  return (
    <OTPAuthContext.Provider
      value={{
        isVerified,
        verifiedAt,
        isExpired,
        setVerified,
        clearVerification
      }}
    >
      {children}
    </OTPAuthContext.Provider>
  );
}

export function useOTPAuth() {
  const context = useContext(OTPAuthContext);
  if (!context) {
    throw new Error('useOTPAuth must be used within OTPAuthProvider');
  }
  return context;
}
```

---

## 4. API 연동 명세

### 4.1 백엔드 API 엔드포인트

#### `POST /api/auth/verify-otp`

**요청**
```typescript
interface VerifyOTPRequest {
  email: string;           // 사용자 이메일
  memberType: string;      // 'individual' | 'corporate'
  otpCode: string;         // 6자리 숫자 문자열
}
```

**성공 응답 (200)**
```typescript
interface VerifyOTPResponse {
  success: true;
  message: string;
  token: string;           // JWT 토큰
  expiresIn: string;       // 토큰 만료 시간 (예: '24h')
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    memberType: string;
    phone: string;
    department?: string;
    position?: string;
    hasGASetup: boolean;
  };
}
```

**에러 응답**

**401 Unauthorized - OTP 코드 오류**
```json
{
  "error": "Invalid OTP",
  "message": "The OTP code is incorrect or expired",
  "loginFailCount": 3,
  "remainingAttempts": 2,
  "blockFailCount": 5
}
```

**403 Forbidden - 계정 잠금**
```json
{
  "error": "Account locked",
  "locked": true,
  "unlockAt": "2025-01-15T10:30:00Z",
  "remainingSeconds": 300,
  "message": "계정이 일시적으로 잠겼습니다. 300초 후 다시 시도하세요.",
  "loginFailCount": 5
}
```

**400 Bad Request - Google Authenticator 미설정**
```json
{
  "error": "Google Authenticator not set up",
  "message": "Please set up Google Authenticator first"
}
```

### 4.2 프론트엔드 API 서비스

```typescript
// services/otpService.ts
import { API_BASE_URL } from '@/config';

export interface VerifyOTPParams {
  email: string;
  memberType: 'individual' | 'corporate';
  otpCode: string;
}

export interface VerifyOTPResult {
  success: boolean;
  token: string;
  user: any;
}

export async function verifyOTP({
  email,
  memberType,
  otpCode
}: VerifyOTPParams): Promise<VerifyOTPResult> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, memberType, otpCode }),
  });

  const data = await response.json();

  if (!response.ok) {
    // 에러 처리
    if (response.status === 401) {
      throw new Error(
        data.message || 'OTP 코드가 올바르지 않거나 만료되었습니다.'
      );
    }

    if (response.status === 403) {
      throw new Error(
        `계정이 일시적으로 잠겼습니다. ${data.remainingSeconds}초 후 다시 시도하세요.`
      );
    }

    if (response.status === 400) {
      throw new Error(
        'Google Authenticator가 설정되지 않았습니다. 먼저 설정해주세요.'
      );
    }

    throw new Error(data.message || '인증에 실패했습니다.');
  }

  return data;
}
```

---

## 5. 상태 관리 전략

### 5.1 전역 상태 (Context API)

**OTPAuthContext 책임**
- OTP 인증 상태 관리 (isVerified, verifiedAt)
- 인증 만료 여부 판단 (isExpired)
- 인증 상태 설정/해제 (setVerified, clearVerification)
- sessionStorage와 동기화

**AuthContext와의 관계**
- AuthContext: 사용자 로그인 상태 및 정보 관리
- OTPAuthContext: 추가 보안 레이어로서 민감한 페이지 접근 제어
- 독립적으로 동작하되, AuthContext의 user 정보 참조

### 5.2 로컬 저장소 (sessionStorage)

**저장 데이터**
```typescript
// sessionStorage key: 'otp_verified_at'
// value: timestamp (number as string)
```

**선택 이유**
- **sessionStorage**: 브라우저 탭 닫으면 자동 삭제 (보안 강화)
- **localStorage**: 영구 저장되어 보안 위험
- **쿠키**: 서버 통신에 불필요한 오버헤드

**암호화**
- 현재는 타임스탬프만 저장하므로 민감 정보 없음
- 필요시 AES 암호화 추가 가능

### 5.3 인증 타임아웃 관리

```typescript
const OTP_TIMEOUT = 30 * 60 * 1000; // 30분

// 주기적 만료 체크 (1분마다)
useEffect(() => {
  const interval = setInterval(() => {
    if (isVerified && isExpired()) {
      clearVerification();
      // 사용자에게 재인증 필요 알림
    }
  }, 60 * 1000);

  return () => clearInterval(interval);
}, [isVerified, isExpired]);
```

---

## 6. 보안 고려사항

### 6.1 공격 벡터 및 대응

| 공격 유형 | 대응 방안 |
|-----------|-----------|
| Brute Force | 백엔드에서 시도 횟수 제한 (5회) 및 계정 잠금 (5분) |
| Replay Attack | TOTP의 시간 기반 특성으로 자연스럽게 방어 (30초 윈도우) |
| Session Hijacking | sessionStorage 사용으로 탭 간 격리, HTTPS 필수 |
| XSS | CSP (Content Security Policy) 설정, 입력 검증 |
| CSRF | SameSite 쿠키 속성, CSRF 토큰 (API 레벨) |

### 6.2 추가 보안 조치

**1. HTTPS 강제**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};
```

**2. CSP 헤더 설정**
```typescript
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline';"
}
```

**3. Rate Limiting (백엔드)**
- IP 기반 요청 제한
- Email + IP 조합으로 차단 관리
- 5회 실패 시 5분 차단 (기존 구현됨)

**4. 입력 검증**
```typescript
// OTP 코드 검증
const isValidOTP = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

// 프론트엔드에서 사전 검증
if (!isValidOTP(otpCode)) {
  setError('OTP 코드는 6자리 숫자여야 합니다.');
  return;
}
```

---

## 7. 접근성 (Accessibility)

### 7.1 키보드 네비게이션

```typescript
// OTP 입력 필드 키보드 지원
const handleKeyDown = (index: number, e: KeyboardEvent) => {
  // Backspace: 이전 필드로 이동
  if (e.key === 'Backspace' && !value[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }

  // Arrow Left/Right: 필드 간 이동
  if (e.key === 'ArrowLeft' && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }

  if (e.key === 'ArrowRight' && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }

  // Enter: 폼 제출
  if (e.key === 'Enter' && value.length === 6) {
    onSubmit();
  }
};
```

### 7.2 ARIA 레이블

```typescript
<div role="group" aria-labelledby="otp-input-label">
  <label id="otp-input-label" className="sr-only">
    Google Authenticator OTP 코드 6자리
  </label>
  {[0, 1, 2, 3, 4, 5].map((index) => (
    <input
      key={index}
      aria-label={`OTP 코드 ${index + 1}번째 숫자`}
      aria-required="true"
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? 'otp-error' : undefined}
      // ...
    />
  ))}
</div>

{error && (
  <div id="otp-error" role="alert" aria-live="polite">
    {error}
  </div>
)}
```

### 7.3 스크린 리더 지원

```typescript
// 상태 변경 알림
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isLoading && '인증 확인 중입니다...'}
  {error && `오류: ${error}`}
  {success && '인증이 완료되었습니다.'}
</div>
```

### 7.4 고대비 모드

```css
/* Tailwind CSS 고대비 모드 지원 */
@media (prefers-contrast: high) {
  .otp-input {
    @apply border-4 border-black;
  }

  .otp-input:focus {
    @apply ring-4 ring-black;
  }
}
```

---

## 8. 구현 가이드

### 8.1 구현 순서

**Phase 1: 기반 구조 (1-2일)**
1. OTPAuthContext 생성 및 Provider 설정
2. otpService.ts API 서비스 레이어 구현
3. app/layout.tsx에 OTPAuthProvider 추가

**Phase 2: UI 컴포넌트 (2-3일)**
4. OTPInputField 컴포넌트 구현
5. OTPErrorMessage 컴포넌트 구현
6. OTPVerificationModal 컴포넌트 통합

**Phase 3: 라우트 보호 (1일)**
7. /setting 페이지에 OTP 가드 로직 추가
8. 인증 만료 시 자동 재인증 플로우

**Phase 4: 테스트 및 개선 (2-3일)**
9. 단위 테스트 작성
10. 통합 테스트 및 E2E 테스트
11. UX 개선 및 버그 수정

### 8.2 파일 생성 체크리스트

```
[ ] src/contexts/OTPAuthContext.tsx
[ ] src/services/otpService.ts
[ ] src/components/auth/OTPVerificationModal.tsx
[ ] src/components/auth/OTPInputField.tsx
[ ] src/components/auth/OTPErrorMessage.tsx
[ ] src/app/setting/layout.tsx (또는 page.tsx 수정)
[ ] src/types/otp.ts (타입 정의)
```

### 8.3 의존성 추가

```json
// package.json
{
  "dependencies": {
    "@headlessui/react": "^1.7.17",    // Dialog 컴포넌트
    // 기존 의존성 사용 (Next.js, React, TypeScript)
  }
}
```

---

## 9. 테스트 시나리오

### 9.1 기능 테스트

**TC-01: 정상 인증 플로우**
1. 사용자가 /setting 페이지 접근
2. OTP 모달이 자동으로 표시됨
3. 6자리 OTP 코드 입력
4. 확인 버튼 클릭
5. 백엔드 API 호출 및 성공 응답
6. 모달 닫히고 마이페이지 접근 가능
7. 30분 이내 재접근 시 모달 표시 안됨

**TC-02: 잘못된 OTP 코드 입력**
1. 사용자가 /setting 페이지 접근
2. OTP 모달 표시
3. 잘못된 6자리 코드 입력
4. 401 에러 응답 받음
5. 에러 메시지 표시 ("OTP 코드가 올바르지 않거나 만료되었습니다.")
6. 잔여 시도 횟수 표시 (2/5)
7. 재입력 가능

**TC-03: 계정 잠금 (5회 실패)**
1. 5회 연속 잘못된 OTP 입력
2. 403 에러 응답 받음
3. 계정 잠금 메시지 및 타이머 표시
4. 5분 후 자동 해제

**TC-04: 인증 만료 (30분 후)**
1. OTP 인증 후 마이페이지 사용
2. 30분 후 다른 탭 클릭하여 마이페이지 재접근
3. OTP 모달이 다시 표시됨
4. 재인증 필요

**TC-05: Google Authenticator 미설정**
1. GA 미설정 사용자가 /setting 접근
2. OTP 모달 표시
3. 코드 입력 후 400 에러 응답
4. "Google Authenticator가 설정되지 않았습니다" 메시지
5. 보안 설정 페이지로 이동 링크 제공

### 9.2 접근성 테스트

**TC-A01: 키보드 네비게이션**
- Tab 키로 입력 필드 간 이동
- Arrow Left/Right로 필드 이동
- Backspace로 이전 필드 이동
- Enter 키로 폼 제출

**TC-A02: 스크린 리더 호환성**
- NVDA/JAWS로 모달 읽기
- 입력 필드 레이블 읽기
- 에러 메시지 실시간 알림
- 상태 변경 알림

**TC-A03: 고대비 모드**
- Windows 고대비 모드에서 테스트
- 색상 대비율 4.5:1 이상 확인

### 9.3 보안 테스트

**TC-S01: Rate Limiting**
- 5회 실패 후 계정 잠금 확인
- 5분 후 자동 해제 확인
- IP 기반 차단 확인

**TC-S02: Session Storage 격리**
- 브라우저 탭 닫기 후 재인증 필요 확인
- 다른 탭에서 인증 상태 공유 안됨 확인

**TC-S03: XSS 방어**
- OTP 입력 필드에 스크립트 주입 시도
- CSP 헤더로 차단 확인

---

## 10. 주의사항 및 제약사항

### 10.1 제약사항

**1. Google Authenticator 필수**
- 백엔드 정책상 GA 설정이 필수이므로, 미설정 사용자는 먼저 설정 필요
- 설정 안내 링크를 모달에 포함해야 함

**2. 브라우저 호환성**
- sessionStorage 지원 브라우저만 가능 (IE11 미지원)
- Modern browsers (Chrome, Firefox, Safari, Edge) 지원

**3. 시간 동기화**
- TOTP는 시간 기반이므로 사용자 기기의 시간이 정확해야 함
- 시간 오차가 크면 인증 실패 가능 (±2 윈도우 = ±60초 허용)

### 10.2 주의사항

**1. 백엔드 의존성**
- `/api/auth/verify-otp` 엔드포인트가 정상 작동해야 함
- 백엔드 API 변경 시 프론트엔드 동기화 필요

**2. 에러 처리**
- 네트워크 오류, 타임아웃 등 예외 상황 고려
- 사용자에게 명확한 에러 메시지 제공

**3. UX 고려**
- 너무 자주 재인증 요구하지 않도록 타임아웃 적절히 설정 (30분)
- 인증 성공/실패 시 명확한 피드백 제공

**4. 성능**
- OTP 모달 컴포넌트 lazy loading 고려
- API 요청 디바운싱으로 중복 요청 방지

### 10.3 향후 개선 방향

**1. "이 기기에서 30일간 기억" 옵션**
- localStorage + 기기 고유 ID로 구현
- 보안 리스크 vs 사용자 편의성 trade-off

**2. 백업 코드 지원**
- Google Authenticator 분실 시 백업 코드로 인증
- 백엔드 API 추가 필요

**3. QR 코드 재스캔 기능**
- 모달에서 QR 코드 다시 표시하여 재설정 지원

**4. 다중 인증 수단**
- SMS, Email OTP 등 대체 인증 수단 추가

**5. 인증 히스토리 로깅**
- 언제, 어디서 OTP 인증했는지 기록
- 보안 모니터링 강화

---

## 11. 참고 자료

### 11.1 관련 문서
- [Google Authenticator 가이드](https://support.google.com/accounts/answer/1066447)
- [TOTP RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js 14 App Router 문서](https://nextjs.org/docs/app)

### 11.2 유사 구현 사례
- GitHub 2FA 인증 플로우
- AWS Console MFA 인증
- Google Account 2단계 인증

### 11.3 라이브러리 문서
- [OTPAuth](https://www.npmjs.com/package/otpauth)
- [React Context API](https://react.dev/reference/react/useContext)
- [Headless UI Dialog](https://headlessui.com/react/dialog)

---

## 12. 버전 히스토리

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025-01-15 | 초안 작성 | Claude Code |

---

## 13. 승인 및 리뷰

| 역할 | 이름 | 승인 날짜 | 서명 |
|------|------|-----------|------|
| 프로덕트 오너 | | | |
| 기술 리드 | | | |
| 보안 담당자 | | | |
| UX 디자이너 | | | |

---

**문서 끝**
