# 기업용 커스터디 관리자 페이지 프로젝트

## Git Commit Message Policy

**CRITICAL: Claude 서명 제거 (Commercial Product)**

- **Claude 서명 절대 금지**: 모든 커밋 메시지에서 Claude 관련 서명 제거
- **제거 대상 내용**:
  - `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
  - `Co-Authored-By: Claude <noreply@anthropic.com>`
  - Claude, AI, 자동 코드 생성 관련 모든 언급
- **이유**: 외부 클라이언트 납품용 상업 제품
- **적용 범위**: 모든 커밋

## 프로젝트 개요

- **프로젝트명**: 기업용 가상자산 커스터디 관리자 페이지
- **목적**: 커스터디 서비스 관리자용 모니터링 및 운영 시스템
- **테마**: Shadcn UI Sapphire 스타일 기반

## 세션 초기화 규칙 ⚠️

**Claude Code 진입 시 반드시 수행할 작업:**

1. **문서 스캔**: `claudedocs/` 폴더 내 모든 .md 파일 읽기
2. **상태 파악**: 현재 구현 진행 상황 확인
3. **컨텍스트 로드**: 비즈니스 플로우 및 Task 목록 숙지
4. **준비 완료**: 사용자 요청 대기 상태로 전환

### 자동 로드 대상 파일

- `claudedocs/admin-panel-implementation-plan.md` - 전체 비즈니스 플로우 및 구현 계획
- `claudedocs/admin-implementation-tasks.md` - 12주 단계별 구현 Task 목록
- `claudedocs/` 내 기타 모든 .md 파일

### 필수 인식 사항

- **비즈니스 구조**: 회원사가 자산 추가 시 입금 주소 자동 생성
- **핵심 원칙**: 회원사 직접 입출금 주소 등록/관리, 관리자는 모니터링 역할
- **보안 시스템**: Hot/Cold 지갑 구조 (20%/80%), Air-gap 서명

## 개발 원칙 및 가이드라인 🔥

### UI/UX 디자인 원칙

- **이모지 사용 금지**: 모든 UI 요소에서 이모지 절대 사용 금지
  - ❌ 금지: ✓, ✅, ❌, ⚠️, 🔥, 💡 등 모든 이모지
  - ✅ 허용: Lucide React 아이콘만 사용 (Check, X, AlertTriangle 등)
  - 이유: 전문적인 디자인 일관성 유지, 크로스 플랫폼 호환성

### 파일 관리 원칙

- **적정 파일 크기 유지**: 단일 파일 최대 200-300라인 권장
- **기능별 모듈화**: 관련 기능끼리 묶어서 별도 파일로 분리
- **지속적 리팩토링**: 파일이 커지면 즉시 분할하여 가독성 유지
- **명확한 책임 분리**: 각 파일은 단일 책임 원칙(SRP) 준수

### 파일 분할 기준

```typescript
// ❌ 나쁜 예: 모든 기능이 하나의 파일에
components/AdminDashboard.tsx (800라인)

// ✅ 좋은 예: 기능별로 분리
components/admin/
├── dashboard/
│   ├── AdminDashboard.tsx (100라인)
│   ├── AssetOverview.tsx (150라인)
│   ├── RecentTransactions.tsx (120라인)
│   └── AlertPanel.tsx (80라인)
```

### 데이터 처리 전략

#### Mock Data 시스템 (개발 단계)

- **JSON DB 사용**: 실제 백엔드 없이 CRUD 기능 구현
- **타입 안전성**: TypeScript 인터페이스로 데이터 구조 정의
- **API 추상화**: 서비스 레이어로 데이터 접근 로직 캡슐화
- **실 DB 교체 용이성**: 인터페이스만 유지하면 쉬운 전환

#### 데이터 구조 예시

```typescript
// Mock Data 구조
/src/data/
├── mockData/
│   ├── members.json        # 회원사 데이터
│   ├── assets.json         # 자산 데이터
│   ├── transactions.json   # 거래 내역
│   └── vaultStatus.json    # 볼트 상태
├── types/
│   ├── member.ts
│   ├── asset.ts
│   └── transaction.ts
└── services/
    ├── memberService.ts    # 회원사 CRUD
    ├── assetService.ts     # 자산 CRUD
    └── mockDbService.ts    # JSON DB 처리
```

#### API 서비스 레이어 패턴

```typescript
// 추상화 인터페이스
interface MemberService {
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member>;
  createMember(member: CreateMemberRequest): Promise<Member>;
  updateMember(id: string, updates: UpdateMemberRequest): Promise<Member>;
  deleteMember(id: string): Promise<void>;
}

// Mock 구현 (개발용)
class MockMemberService implements MemberService { ... }

// 실제 API 구현 (배포용)
class ApiMemberService implements MemberService { ... }
```

## 지원 자산 (Supported Assets) 🪙

이 프로젝트에서 지원하는 가상자산은 **다음 5개로 고정**되어 있습니다:

| 자산 | 심볼 | 네트워크 | 설명 |
|------|------|----------|------|
| Bitcoin | BTC | Bitcoin | 비트코인 네이티브 |
| Ethereum | ETH | Ethereum (ERC20) | 이더리움 네이티브 |
| Tether USD | USDT | Ethereum (ERC20) | 스테이블코인 |
| USD Coin | USDC | Ethereum (ERC20) | 스테이블코인 |
| Solana | SOL | Solana | 솔라나 네이티브 |

**중요**:
- ADA (Cardano), XRP (Ripple) 등 다른 자산은 **지원하지 않습니다**
- 모든 ERC20 토큰(ETH, USDT, USDC)은 Ethereum 네트워크를 사용합니다
- 타입 정의는 `src/types/deposit.ts`의 `Currency` 타입에서 관리됩니다
- Mock 데이터 생성 시에도 이 5개 자산만 사용됩니다

## 가상자산 아이콘 시스템

### 기본 원칙

- **CryptoIcon 컴포넌트 사용**: 모든 가상자산 아이콘은 `src/components/ui/CryptoIcon.tsx` 컴포넌트 사용
- **로컬 파일 시스템**: 외부 CDN 의존성 제거, 로컬 cryptocurrency-icons 패키지 활용
- **Fallback 시스템**: 지원되지 않는 자산에 대한 텍스트 기반 fallback 제공
- **일관성**: Lucide React 일반 아이콘 대신 가상자산 전용 CryptoIcon 사용

### 구현 방식

```tsx
// CryptoIcon 컴포넌트 사용 예시
import CryptoIcon from "@/components/ui/CryptoIcon";

// 기본 사용
<CryptoIcon symbol="BTC" size={24} />

// 클래스명과 함께 사용
<CryptoIcon symbol="ETH" size={32} className="mr-2 flex-shrink-0" />

// 다양한 크기
<CryptoIcon symbol="USDT" size={16} />  // 작은 아이콘
<CryptoIcon symbol="USDC" size={24} />  // 중간 아이콘
<CryptoIcon symbol="SOL" size={48} />   // 큰 아이콘
```

### 아이콘 파일 위치

- **패키지**: `cryptocurrency-icons@^0.18.1`
- **로컬 경로**: `public/cryptocurrency-icons/32/color/`
- **지원 형식**: PNG 파일 (32x32 픽셀)

### 지원 가상자산

- **BTC** (Bitcoin): `btc.png`
- **ETH** (Ethereum): `eth.png`
- **USDC** (USD Coin): `usdc.png`
- **USDT** (Tether): `usdt.png`
- **SOL** (Solana): `sol.png`
- **기타**: 500+ 가상자산 지원

### 사용 규칙

```tsx
// ✅ 좋은 예: CryptoIcon 사용
import CryptoIcon from "@/components/ui/CryptoIcon";
<CryptoIcon symbol="BTC" size={24} className="mr-2" />

// ❌ 나쁜 예: Lucide 아이콘 사용
import { Bitcoin, Coins } from "lucide-react";
<Bitcoin className="w-6 h-6" />
```

**중요**: 가상자산을 표시할 때는 항상 CryptoIcon 컴포넌트를 사용하고, Lucide React의 Bitcoin, Coins 등의 아이콘은 사용하지 않습니다.

## 기술 스택

### 핵심 프레임워크

- **Next.js 15+**: React 프레임워크 (App Router 사용)
- **React 19**: UI 라이브러리
- **TypeScript**: 정적 타입 시스템

### 스타일링 시스템

- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **Shadcn UI**: 현대적인 React 컴포넌트 라이브러리
- **Sapphire 테마**: 블루/퍼플 그라데이션 컬러 팔레트

### 의존성 라이브러리

- **@radix-ui/react-slot**: 컴포넌트 슬롯 시스템
- **class-variance-authority**: CSS 클래스 변형 관리
- **clsx & tailwind-merge**: 조건부 클래스 이름 유틸리티
- **lucide-react**: 아이콘 라이브러리
- **tailwindcss-animate**: 애니메이션 유틸리티

### 데이터 처리 스택

- **JSON Server / lowdb**: 개발용 Mock JSON DB
- **React Query**: 서버 상태 관리 및 캐싱
- **Zustand**: 클라이언트 상태 관리
- **Axios**: HTTP 클라이언트 (API 호출)

## Sapphire 테마 컬러 시스템

### 라이트 모드 컬러

```css
--sapphire-50: 240 100% 98%; /* 가장 연한 블루 */
--sapphire-100: 238 84% 92%;
--sapphire-200: 239 84% 85%;
--sapphire-300: 240 84% 75%;
--sapphire-400: 241 81% 65%;
--sapphire-500: 239 79% 55%; /* 기본 Sapphire */
--sapphire-600: 238 75% 50%;
--sapphire-700: 237 69% 42%;
--sapphire-800: 236 64% 35%;
--sapphire-900: 233 52% 29%;
--sapphire-950: 231 48% 19%; /* 가장 진한 블루 */
```

### 다크 모드 컬러 (반전된 값)

다크 모드에서는 컬러 스케일이 반전되어 사용됩니다.

## 컴포넌트 표준

### 기본 컴포넌트 목록

설치된 핵심 컴포넌트들:

#### 1. Button 컴포넌트

- **경로**: `@/components/ui/button`
- **변형**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `sapphire`
- **크기**: `default`, `sm`, `lg`, `icon`
- **특별 기능**: Sapphire 그라데이션 변형 포함

#### 2. Card 컴포넌트

- **경로**: `@/components/ui/card`
- **구성 요소**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **용도**: 정보를 구조화된 형태로 표시

#### 3. Input 컴포넌트

- **경로**: `@/components/ui/input`
- **특징**: 접근성과 사용성에 최적화된 입력 필드

#### 4. Badge 컴포넌트

- **경로**: `@/components/ui/badge`
- **변형**: `default`, `secondary`, `destructive`, `outline`, `sapphire`
- **특별 기능**: Sapphire 그라데이션 변형 포함

#### 5. Toast 컴포넌트 (알림 메시지 시스템)

- **경로**: `@/components/ui/toast`, `@/components/ui/toaster`
- **훅**: `@/hooks/use-toast`
- **용도**: 사용자 액션에 대한 피드백 메시지 표시
- **설정**: `src/app/layout.tsx`에 `<Toaster />` 컴포넌트 추가됨

**사용 방법:**

```tsx
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { toast } = useToast();

  const handleAction = () => {
    // 기본 토스트
    toast({
      description: "작업이 완료되었습니다.",
    });

    // 제목과 설명이 있는 토스트
    toast({
      title: "성공",
      description: "데이터가 성공적으로 저장되었습니다.",
    });

    // 에러 토스트
    toast({
      variant: "destructive",
      title: "오류 발생",
      description: "작업을 완료할 수 없습니다.",
    });

    // 지속 시간 설정 (기본: 5초)
    toast({
      description: "3초 후 사라집니다.",
      duration: 3000,
    });
  };

  return <button onClick={handleAction}>액션 실행</button>;
}
```

**일관성 가이드라인:**

1. **Alert 대신 Toast 사용**: 사용자 액션 피드백에는 `alert()` 대신 항상 `toast()` 사용
2. **간결한 메시지**: description은 한 줄로 간결하게 작성
3. **적절한 variant 사용**:
   - 성공/완료: variant 생략 (기본값)
   - 오류/실패: `variant: "destructive"`
4. **중복 호출 방지**: 동일한 액션에 대해 여러 번 toast 호출하지 않기
5. **적절한 타이밍**: 액션 완료 직후에 즉시 표시

**사용 예시:**

```tsx
// ✅ 좋은 예
toast({ description: "파일이 복사되었습니다." });
toast({ description: "변경사항이 저장되었습니다." });

// ❌ 나쁜 예
alert("파일이 복사되었습니다."); // alert 대신 toast 사용
toast({ description: "파일이 성공적으로 복사되었습니다. 클립보드를 확인하세요." }); // 메시지가 너무 김
```

## 프로젝트 구조

```
admin-custody/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   ├── page.tsx           # 홈페이지
│   │   └── globals.css        # 전역 스타일 (Sapphire 테마 포함)
│   ├── components/
│   │   └── ui/                # Shadcn UI 컴포넌트
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── badge.tsx
│   └── lib/
│       └── utils.ts           # 유틸리티 함수 (cn 함수)
├── components.json            # Shadcn UI 설정
├── tailwind.config.js         # Tailwind 설정
├── tsconfig.json             # TypeScript 설정
├── package.json              # 프로젝트 의존성
└── CLAUDE.md                 # 이 문서
```

## UI/UX 가이드라인

### 디자인 원칙

1. **일관성**: 모든 컴포넌트에서 Sapphire 테마 일관 적용
2. **접근성**: WCAG 2.1 AA 표준 준수
3. **반응형**: 모바일 우선 반응형 디자인
4. **사용자 중심**: 직관적이고 사용하기 쉬운 인터페이스

### 컴포넌트 사용법

#### Button 컴포넌트 예시

```tsx
import { Button } from "@/components/ui/button"

// 기본 버튼
<Button>Click me</Button>

// Sapphire 테마 버튼
<Button variant="sapphire">Sapphire Button</Button>

// 크기 변형
<Button size="lg">Large Button</Button>
```

#### Card 컴포넌트 예시

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here.</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content...</p>
  </CardContent>
</Card>;
```

## 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린팅
npm run lint
```

## 앞으로 추가할 컴포넌트들

### 계획된 추가 컴포넌트

- Dialog (모달)
- Sheet (사이드 패널)
- Select (드롭다운)
- Textarea (멀티라인 입력)
- Checkbox & Radio (선택 컨트롤)
- Table (데이터 테이블)
- Form (폼 관리)
- Toast (알림)
- Navigation Menu (내비게이션)
- Tabs (탭 인터페이스)
- Avatar (프로필 이미지)
- Progress (진행률 표시기)

### 커스텀 컴포넌트 계획

- Sapphire 테마에 최적화된 커스텀 레이아웃
- 그라데이션 효과를 활용한 특별한 UI 요소들
- 애니메이션과 트랜지션 효과

## 테마 커스터마이징

### Sapphire 컬러 사용법

CSS 변수로 정의된 Sapphire 컬러들을 다음과 같이 사용할 수 있습니다:

```css
/* HSL 값으로 직접 사용 */
background-color: hsl(var(--sapphire-500));

/* Tailwind 유틸리티 클래스로 사용 (확장 시) */
.custom-sapphire {
  @apply bg-gradient-to-r from-blue-600 to-purple-600;
}
```

## 개발 실행 가이드

### 리팩토링 신호

- 단일 파일이 300라인 초과 시 즉시 분할 검토
- 하나의 컴포넌트에서 3개 이상의 서로 다른 기능 처리 시
- 코드 리뷰 시 "이해하기 어렵다"는 피드백 발생 시
- Import 구문이 10개 이상 필요한 파일

### Mock DB 설정 절차

```bash
# 1. 필요한 패키지 설치
npm install json-server lowdb axios react-query zustand

# 2. Mock 데이터 디렉토리 생성
mkdir -p src/data/mockData src/data/services src/data/types

# 3. JSON 파일 초기화
echo '[]' > src/data/mockData/members.json
echo '[]' > src/data/mockData/assets.json
echo '[]' > src/data/mockData/transactions.json
```

### 서비스 레이어 구현 패턴

```typescript
// 1. 타입 정의 (src/data/types/)
// 2. Mock 서비스 구현 (src/data/services/)
// 3. React 컴포넌트에서 서비스 사용
// 4. React Query로 상태 관리
// 5. 추후 실제 API로 교체 시 서비스만 변경
```

## 주의사항

1. **파일 크기 관리**: 300라인 넘으면 즉시 분할 고려
2. **컴포넌트 책임**: 하나의 컴포넌트는 하나의 책임만
3. **데이터 추상화**: 항상 서비스 레이어를 통해 데이터 접근
4. **타입 안전성**: 모든 데이터 구조에 TypeScript 타입 정의
5. **실 DB 대비**: Mock과 실제 API 인터페이스 동일하게 유지

## 📝 개발 체크리스트

**새 기능 추가 시:**

- [ ] 기능별로 파일 분리했는가?
- [ ] 타입 정의를 먼저 작성했는가?
- [ ] Mock 데이터와 서비스 레이어를 구현했는가?
- [ ] 컴포넌트 크기가 적정한가? (200-300라인)
- [ ] 추후 실 DB 전환이 쉬운 구조인가?

이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.
