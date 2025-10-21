# 이메일 인증 시스템 설계 문서

## 개요

온보딩 AML 관리 시스템의 수동 등록 프로세스에서 이메일 수집 시 인증 코드를 통한 증빙 시스템을 설계합니다.

### 적용 대상
- **개인회원 수동 등록**: 회원 이메일 인증
- **법인회원 수동 등록**: 담당자(contactPerson) 이메일 인증

### 핵심 요구사항
- 실제 이메일 발송을 통한 인증 코드 검증
- 재사용 가능한 컴포넌트 설계
- Mock 환경에서도 동작하는 구조
- 사용자 친화적인 UI/UX

---

## 시스템 아키텍처

### 1. 컴포넌트 구조

```
EmailVerificationInput (재사용 가능 컴포넌트)
├── Props 인터페이스
│   ├── email: string
│   ├── onEmailChange: (email: string) => void
│   ├── onVerified: (verified: boolean) => void
│   ├── disabled?: boolean
│   ├── label?: string
│   ├── required?: boolean
│   └── className?: string
│
├── 내부 상태
│   ├── verificationCode: string (입력된 인증 코드)
│   ├── codeSent: boolean (코드 발송 여부)
│   ├── isVerified: boolean (인증 완료 여부)
│   ├── isSending: boolean (발송 중)
│   ├── isVerifying: boolean (검증 중)
│   ├── timeLeft: number (남은 시간, 초 단위)
│   └── resendCount: number (재발송 횟수)
│
└── 메서드
    ├── sendCode() - 인증 코드 발송
    ├── verifyCode() - 인증 코드 검증
    ├── resendCode() - 인증 코드 재발송
    └── useEffect() - 타이머 관리
```

### 2. API 서비스 레이어

**파일**: `src/services/emailVerificationApi.ts`

```typescript
// 타입 정의
interface VerificationCodeResponse {
  success: boolean;
  expiresAt: string;        // ISO 8601 형식
  message: string;
  code?: string;            // Mock 환경에서만 반환 (개발용)
}

interface VerificationResult {
  verified: boolean;
  message: string;
}

// API 함수
async function sendVerificationCode(email: string): Promise<VerificationCodeResponse>
async function verifyCode(email: string, code: string): Promise<VerificationResult>
```

**Mock 구현 방식**:
- 인메모리 Map으로 코드 저장: `Map<email, {code: string, expiresAt: Date}>`
- 6자리 랜덤 숫자 생성
- 콘솔/Toast로 인증 코드 표시 (개발 환경)
- 실제 환경에서는 이메일 발송 API 호출

---

## UI/UX 플로우

### 상태별 UI

#### 1. 초기 상태 (인증 전)
```
┌─────────────────────────────────────┐
│ 이메일 *                            │
│ ┌─────────────────────┐ ┌─────────┐ │
│ │ example@email.com   │ │ 발송    │ │
│ └─────────────────────┘ └─────────┘ │
│                                     │
│ 인증 코드 (비활성)                  │
│ ┌─────────────────────┐ ┌─────────┐ │
│ │ (비활성)            │ │ (비활성)│ │
│ └─────────────────────┘ └─────────┘ │
└─────────────────────────────────────┘
```

**상태**:
- 이메일 입력: 활성
- 발송 버튼: 이메일 유효성 검사 통과 시 활성
- 인증 코드 입력: 비활성
- 인증 확인 버튼: 비활성

#### 2. 코드 발송 후
```
┌─────────────────────────────────────┐
│ 이메일 *                            │
│ ┌─────────────────────┐ ┌─────────┐ │
│ │ test@example.com    │ │ 재발송  │ │
│ └─────────────────────┘ └─────────┘ │
│ (비활성 - 변경 불가)      (60초 후) │
│                                     │
│ 인증 코드 * [2:45 남음]             │
│ ┌─────────────────────┐ ┌─────────┐ │
│ │ 123456              │ │ 확인    │ │
│ └─────────────────────┘ └─────────┘ │
└─────────────────────────────────────┘
```

**상태**:
- 이메일 입력: 비활성 (변경 불가)
- 재발송 버튼: 60초 후 활성화
- 타이머: 3:00 → 0:00 카운트다운
- 인증 코드 입력: 활성
- 인증 확인 버튼: 활성

#### 3. 인증 완료
```
┌─────────────────────────────────────┐
│ 이메일 *                    ✓ 인증 완료 │
│ ┌─────────────────────┐               │
│ │ test@example.com    │               │
│ └─────────────────────┘               │
│ (비활성)                              │
└─────────────────────────────────────┘
```

**상태**:
- 모든 필드: 비활성
- 인증 완료 배지: 표시
- 체크 아이콘: 파란색

---

## 기술 사양

### 1. 인증 코드 생성

```typescript
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

- 6자리 숫자
- 100000 ~ 999999 범위

### 2. 이메일 유효성 검사

```typescript
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### 3. 타이머 로직

- **만료 시간**: 3분 (180초)
- **카운트다운**: useEffect + setInterval
- **재발송 제한**: 최대 3회
- **재발송 대기**: 60초 (첫 발송 시), 이후 타이머 종료 시

### 4. Mock 데이터 저장소

```typescript
// 인메모리 저장소
const verificationStore = new Map<string, {
  code: string;
  expiresAt: Date;
}>();

// 저장
verificationStore.set(email, {
  code: '123456',
  expiresAt: new Date(Date.now() + 3 * 60 * 1000)
});

// 검증
const stored = verificationStore.get(email);
if (!stored || stored.expiresAt < new Date()) {
  return { verified: false, message: '인증 코드가 만료되었습니다.' };
}
```

---

## 에러 처리

### 에러 케이스 및 메시지

| 에러 유형 | 조건 | 사용자 메시지 |
|----------|------|---------------|
| 이메일 형식 오류 | 정규식 검증 실패 | "올바른 이메일 주소를 입력해주세요." |
| 코드 발송 실패 | API 호출 실패 | "인증 코드 발송에 실패했습니다. 다시 시도해주세요." |
| 코드 불일치 | 입력 코드 ≠ 발송 코드 | "인증 코드가 일치하지 않습니다." |
| 코드 만료 | 현재 시간 > expiresAt | "인증 코드가 만료되었습니다. 재발송해주세요." |
| 재발송 횟수 초과 | resendCount > 3 | "재발송 횟수를 초과했습니다. 잠시 후 다시 시도해주세요." |
| 네트워크 오류 | API 통신 실패 | "네트워크 오류가 발생했습니다." |

### Toast 메시지 표준

```typescript
// 성공
toast({
  description: "인증 코드가 발송되었습니다.",
});

// 에러
toast({
  variant: "destructive",
  description: "인증 코드가 일치하지 않습니다.",
});

// 정보
toast({
  description: "인증이 완료되었습니다.",
});
```

---

## 접근성 (Accessibility)

### ARIA 속성

```tsx
<Input
  id="email-input"
  type="email"
  aria-label="이메일 주소"
  aria-required="true"
  aria-invalid={!isValidEmail(email)}
  aria-describedby="email-error"
/>

<Input
  id="code-input"
  type="text"
  aria-label="인증 코드"
  aria-required="true"
  maxLength={6}
  disabled={!codeSent || isVerified}
/>
```

### 키보드 네비게이션

- Tab: 필드 간 이동
- Enter: 버튼 클릭 (발송/확인)
- Escape: 포커스 해제

### 스크린 리더 지원

- 버튼 상태 변화 알림
- 타이머 카운트다운 알림 (매 30초)
- 인증 완료 시 알림

---

## 통합 가이드

### IndividualRegistrationForm 통합

**변경 전**:
```tsx
<Input
  id="userEmail"
  type="email"
  value={userEmail}
  onChange={(e) => setUserEmail(e.target.value)}
/>
<Checkbox
  id="emailVerified"
  checked={emailVerified}
  onCheckedChange={(checked) => setEmailVerified(checked as boolean)}
/>
```

**변경 후**:
```tsx
<EmailVerificationInput
  email={userEmail}
  onEmailChange={setUserEmail}
  onVerified={setEmailVerified}
  label="이메일"
  required
/>
```

### CorporateRegistrationForm 통합

**담당자 이메일 인증**:
```tsx
<EmailVerificationInput
  email={contactEmail}
  onEmailChange={setContactEmail}
  onVerified={setContactEmailVerified}
  label="담당자 이메일"
  required
/>
```

---

## 개발 체크리스트

### Phase 1: API 서비스 레이어
- [ ] `emailVerificationApi.ts` 생성
- [ ] 타입 정의 작성
- [ ] `sendVerificationCode()` 함수 구현
- [ ] `verifyCode()` 함수 구현
- [ ] Mock 저장소 구현
- [ ] 에러 처리 로직 추가

### Phase 2: 재사용 컴포넌트
- [ ] `EmailVerificationInput.tsx` 생성
- [ ] Props 인터페이스 정의
- [ ] 상태 관리 로직 구현
- [ ] UI 레이아웃 구현
- [ ] 타이머 로직 구현
- [ ] 이메일 유효성 검사 추가
- [ ] 접근성 속성 추가

### Phase 3: 폼 통합
- [ ] `IndividualRegistrationForm.tsx` 수정
  - [ ] EmailVerificationInput import
  - [ ] 기존 이메일 입력/체크박스 제거
  - [ ] EmailVerificationInput 추가
  - [ ] 검증 로직 업데이트
- [ ] `CorporateRegistrationForm.tsx` 수정
  - [ ] EmailVerificationInput import
  - [ ] 담당자 이메일 부분에 적용
  - [ ] 검증 로직 업데이트

### Phase 4: 테스트
- [ ] TypeScript 타입 체크
- [ ] 이메일 발송 플로우 테스트
- [ ] 코드 검증 플로우 테스트
- [ ] 타이머 동작 확인
- [ ] 재발송 기능 테스트
- [ ] 에러 케이스 테스트
- [ ] 접근성 테스트

---

## 향후 개선 사항

### 실제 환경 전환 시

1. **이메일 발송 서비스 연동**
   - SendGrid, AWS SES, Nodemailer 등
   - 환경 변수로 API 키 관리

2. **서버 세션 관리**
   - Redis/Memcached로 인증 코드 저장
   - 보안 강화 (해시, 암호화)

3. **Rate Limiting**
   - IP 기반 발송 제한
   - 이메일별 시간당 제한

4. **로깅 및 모니터링**
   - 발송 실패율 추적
   - 인증 성공/실패율 모니터링

5. **보안 강화**
   - CAPTCHA 추가
   - 브루트포스 공격 방어
   - 코드 재사용 방지

---

## 참고 자료

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Email Verification Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
