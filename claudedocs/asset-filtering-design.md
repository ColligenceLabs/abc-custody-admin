# 지원 자산 필터링 변경 설계서

## 개요

CLAUDE.md에 명시된 지원 자산 정책에 따라 모든 입금 관리 페이지의 자산 필터를 업데이트합니다.

### 지원 자산 (5개로 제한)
- **BTC** (Bitcoin)
- **ETH** (Ethereum - ERC20)
- **USDT** (Tether USD - ERC20)
- **USDC** (USD Coin - ERC20)
- **SOL** (Solana)

### 제거 대상 자산
- ~~XRP~~ (Ripple)
- ~~ADA~~ (Cardano)

## 영향 범위

### 1. 입금 모니터링 (Deposit Monitoring)
**경로**: `/admin/deposits/monitoring`
**컴포넌트**: `DepositFilters.tsx`

**현재 상태**:
```typescript
const assets: Currency[] = ['BTC', 'ETH', 'USDT', 'USDC', 'XRP', 'ADA', 'SOL'];
```

**변경 후**:
```typescript
const assets: Currency[] = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL'];
```

**우선순위**: 🔴 HIGH (가장 먼저 수정)

---

### 2. 주소 검증 (Address Verification)
**경로**: `/admin/deposits/address-verification`
**컴포넌트**: `AddressVerificationFilters.tsx`

**확인 필요**: 자산 필터 존재 여부 및 동일한 패턴 적용

**우선순위**: 🟡 MEDIUM

---

### 3. AML 스크리닝 (AML Screening)
**경로**: `/admin/deposits/aml-screening`
**컴포넌트**: `AMLScreeningFilters.tsx`

**확인 필요**: 자산 필터 존재 여부 및 동일한 패턴 적용

**우선순위**: 🟡 MEDIUM

---

### 4. 여행 규칙 (Travel Rule)
**경로**: `/admin/deposits/travel-rule`

**확인 필요**: 필터 컴포넌트 존재 여부 및 자산 필터 사용

**우선순위**: 🟢 LOW

---

### 5. 반환 처리 (Returns)
**경로**: `/admin/deposits/returns`
**컴포넌트**: `ReturnFilters.tsx`

**확인 필요**: 자산 필터 존재 여부 및 동일한 패턴 적용

**우선순위**: 🟢 LOW

---

## 구현 계획

### Phase 1: 분석 및 검증 ✅
- [x] 현재 입금 관리 페이지 구조 파악
- [x] 각 페이지의 필터 컴포넌트 식별
- [x] 자산 필터 사용 여부 확인

### Phase 2: 입금 모니터링 수정 (최우선) ✅
- [x] `DepositFilters.tsx` 자산 배열 수정 (line 29)
- [x] 빌드 및 타입 체크 검증 - 통과
- [x] 브라우저에서 UI 동작 확인 - 대기 (사용자 테스트 필요)

### Phase 3: 나머지 페이지 순차 수정 ✅
- [x] Address Verification 필터 업데이트 (line 35)
- [x] AML Screening 필터 업데이트 (line 41)
- [x] Travel Rule 페이지 확인 - 자산 필터 없음 (status 필터만 존재)
- [x] Returns 필터 확인 - 자산 필터 없음 (status, reason 필터만 존재)

### Phase 4: 통합 테스트 ✅
- [x] 모든 입금 관리 페이지에서 자산 필터 코드 수정 완료
- [x] Mock 데이터 생성 시 5개 자산만 생성 (depositApi.ts에서 이미 적용됨)
- [x] TypeScript 타입 체크 통과 확인 - 성공
- [x] Production build 성공 확인 - 성공

---

## 코드 변경 패턴

### 변경 전
```typescript
const assets: Currency[] = ['BTC', 'ETH', 'USDT', 'USDC', 'XRP', 'ADA', 'SOL'];
```

### 변경 후
```typescript
// CLAUDE.md에 명시된 지원 자산만 포함 (XRP, ADA 제외)
const assets: Currency[] = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL'];
```

---

## 검증 체크리스트

### 코드 레벨
- [ ] 모든 필터 컴포넌트에서 assets 배열이 5개 자산만 포함
- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 경고 없음

### UI/UX 레벨
- [ ] 필터 UI에 5개 자산 배지만 표시
- [ ] 자산 선택/해제 동작 정상
- [ ] 선택된 자산에 따라 테이블 필터링 정상 작동

### 데이터 레벨
- [ ] Mock 데이터 생성 시 XRP, ADA 미생성
- [ ] 기존 localStorage 데이터 재생성 안내
- [ ] API 응답에서 5개 자산만 처리

---

## 주의사항

1. **타입 안전성**: `Currency` 타입은 이미 `deposit.ts`에서 5개로 제한되어 있음
2. **순서 변경 없음**: 기존 배열 순서 유지 (XRP, ADA만 제거)
3. **주석 추가**: 코드에 CLAUDE.md 참조 주석 추가
4. **일관성**: 모든 입금 관리 페이지에서 동일한 자산 목록 사용

---

## 타임라인

| Phase | 예상 시간 | 상태 |
|-------|----------|------|
| Phase 1: 분석 | 10분 | ✅ 완료 |
| Phase 2: 모니터링 수정 | 5분 | ✅ 완료 |
| Phase 3: 나머지 페이지 | 15분 | ✅ 완료 |
| Phase 4: 통합 테스트 | 10분 | ✅ 완료 |
| **총계** | **40분** | **✅ 완료** |

---

## 참조 문서

- **CLAUDE.md** (lines 109-125): 지원 자산 정책
- **src/types/deposit.ts** (lines 12-20): Currency 타입 정의
- **src/services/depositApi.ts** (line 550): Mock 데이터 생성 로직

---

## 구현 완료 요약 ✅

### 변경된 파일 (3개)

1. **src/app/admin/deposits/monitoring/components/DepositFilters.tsx** (line 29)
   - 변경 전: `['BTC', 'ETH', 'USDT', 'USDC', 'XRP', 'ADA', 'SOL']`
   - 변경 후: `['BTC', 'ETH', 'USDT', 'USDC', 'SOL']`
   - 주석 추가: "CLAUDE.md에 명시된 지원 자산만 포함 (XRP, ADA 제외)"

2. **src/app/admin/deposits/address-verification/components/AddressVerificationFilters.tsx** (line 35)
   - 변경 전: `['BTC', 'ETH', 'USDT', 'USDC', 'XRP', 'ADA', 'SOL']`
   - 변경 후: `['BTC', 'ETH', 'USDT', 'USDC', 'SOL']`
   - 주석 추가: "CLAUDE.md에 명시된 지원 자산만 포함 (XRP, ADA 제외)"

3. **src/app/admin/deposits/aml-screening/components/AMLScreeningFilters.tsx** (line 41)
   - 변경 전: `['BTC', 'ETH', 'USDT', 'USDC', 'XRP', 'ADA', 'SOL']`
   - 변경 후: `['BTC', 'ETH', 'USDT', 'USDC', 'SOL']`
   - 주석 추가: "CLAUDE.md에 명시된 지원 자산만 포함 (XRP, ADA 제외)"

### 확인된 페이지 (2개)

4. **src/app/admin/deposits/travel-rule/page.tsx**
   - 자산 필터 없음 (status 필터만 존재)
   - 수정 불필요

5. **src/app/admin/deposits/returns/components/ReturnFilters.tsx**
   - 자산 필터 없음 (status, reason 필터만 존재)
   - 수정 불필요

### 빌드 검증 결과

```bash
✓ Compiled successfully in 3.6s
✓ Linting and checking validity of types
✓ Generating static pages (18/18)
✓ Production build successful
```

- TypeScript 컴파일 에러: 0개
- ESLint 경고: 0개
- 빌드 시간: 3.6초

### 사용자 테스트 필요

브라우저에서 다음 페이지들을 확인해주세요:

1. **입금 모니터링** (`/admin/deposits/monitoring`)
   - 자산 필터에 BTC, ETH, USDT, USDC, SOL만 표시되는지 확인
   - 기존 XRP, ADA 배지가 사라졌는지 확인

2. **주소 검증** (`/admin/deposits/address-verification`)
   - 자산 필터에 5개 자산만 표시되는지 확인

3. **AML 스크리닝** (`/admin/deposits/aml-screening`)
   - 자산 필터에 5개 자산만 표시되는지 확인

4. **Mock 데이터 생성**
   - "Mock 데이터 생성" 버튼 클릭 시 XRP, ADA 거래가 생성되지 않는지 확인

---

## 일관성 체크 ✅

| 컴포넌트 | 지원 자산 | 상태 |
|---------|---------|------|
| Currency 타입 (deposit.ts) | BTC, ETH, USDT, USDC, SOL | ✅ 일치 |
| Mock 데이터 생성 (depositApi.ts) | BTC, ETH, USDT, USDC, SOL | ✅ 일치 |
| 입금 모니터링 필터 | BTC, ETH, USDT, USDC, SOL | ✅ 일치 |
| 주소 검증 필터 | BTC, ETH, USDT, USDC, SOL | ✅ 일치 |
| AML 스크리닝 필터 | BTC, ETH, USDT, USDC, SOL | ✅ 일치 |
| CLAUDE.md 문서 | BTC, ETH, USDT, USDC, SOL | ✅ 일치 |

**모든 컴포넌트가 CLAUDE.md에 명시된 5개 자산으로 통일되었습니다.**
