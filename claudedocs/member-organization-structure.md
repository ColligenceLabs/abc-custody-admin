# 회원-조직-사용자 3계층 구조 설계 문서

## 개요

가상자산 커스터디 시스템의 회원 구조를 **회원(Member) - 조직(Organization) - 사용자(User)** 3계층으로 설계하여, 기업 회원과 개인 회원을 모두 지원하는 확장 가능한 구조입니다.

## 데이터 구조

### 계층 구조

```
회원(Member) - 최상위 계정
├─ 기업 회원 (type: corporate)
│  ├─ 조직(Organization)
│  └─ 조직 사용자(OrganizationUser) - 직원들
│
└─ 개인 회원 (type: individual)
   └─ 개인 사용자(IndividualUser)
```

### 1. 회원 (Member) - 최상위 계정

**파일**: `src/types/member.ts`, `src/data/memberMockData.ts`

```typescript
interface Member {
  memberId: string;                  // 회원 고유 ID
  type: 'corporate' | 'individual';  // 회원 타입
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  plan: string;                      // 요금제
  hasAgreedToAllTerms: boolean;      // 필수 약관 동의 여부
  termsAgreedAt?: string;
}
```

**특징**:
- 모든 회원의 공통 메타 정보만 포함
- 로그인 정보(이메일, 비밀번호) 없음
- 약관 동의 여부는 간단한 플래그만 유지 (상세 이력은 별도 관리)

**Mock 데이터**:
- 기업 회원: M001, M002
- 개인 회원: M100, M101, M102

### 2. 조직 (Organization) - 기업 회원 전용

**파일**: `src/types/organization.ts`, `src/data/organizationMockData.ts`

```typescript
interface Organization {
  organizationId: string;
  memberId: string;              // 소유 회원 ID
  organizationName: string;
  businessNumber: string;        // 사업자등록번호
  industry: string;
  representativeEmail: string;
  address?: string;
  phoneNumber?: string;
  establishedDate?: string;
  isVerified: boolean;
  verifiedAt?: string;
}
```

**특징**:
- 기업 회원(type: corporate)만 조직 데이터 보유
- 개인 회원(type: individual)은 조직 데이터 없음

**Mock 데이터**:
- ORG001 (M001 소유, 주식회사 에이)
- ORG002 (M002 소유, 주식회사 비)

### 3. 조직 사용자 (OrganizationUser) - 기업 회원의 직원

**파일**: `src/types/organizationUser.ts`, `src/data/organizationUserMockData.ts`

```typescript
interface OrganizationUser {
  // 기존 User 필드 모두 포함
  id: string;
  name: string;
  email: string;                 // 로그인 키
  phone: string;                 // SMS 인증용
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  permissions: string[];
  department: string;
  position: string;
  hasGASetup: boolean;           // GA(OTP) 설정 여부
  gaSetupDate?: string;
  isFirstLogin: boolean;

  // 새로 추가된 필드
  organizationUserId: string;
  organizationId: string;
  memberId: string;
}
```

**특징**:
- 기존 User 타입의 모든 필드 유지
- 조직 내부 역할(role), 부서(department), 직급(position) 관리
- 로그인 가능 (email 사용)
- 비밀번호 없음 (이메일 + SMS + GA 인증 방식)

**Mock 데이터**:
- ORG001: 10명 (OU001~OU010)
- ORG002: 6명 (OU011~OU016)

### 4. 개인 사용자 (IndividualUser) - 개인 회원

**파일**: `src/types/individualUser.ts`, `src/data/individualUserMockData.ts`

```typescript
interface IndividualUser {
  id: string;
  individualUserId: string;
  memberId: string;

  // 기본 정보
  name: string;
  email: string;                 // 로그인 키
  phone: string;                 // SMS 인증용
  status: IndividualUserStatus;
  lastLogin: string;

  // 인증 정보
  hasGASetup: boolean;
  gaSetupDate?: string;
  isFirstLogin: boolean;

  // 개인 회원 전용 필드
  birthDate?: string;
  identityVerified: boolean;
  kycLevel: 'level1' | 'level2' | 'level3';
  kycVerifiedAt?: string;

  // 권한 및 한도
  permissions: string[];
  walletLimit: {
    daily: number;
    monthly: number;
  };
}
```

**특징**:
- 조직 개념 없음 (department, position 없음)
- KYC 레벨별 차등 지갑 한도 적용
- 로그인 가능 (email 사용)
- 비밀번호 없음 (이메일 + SMS + GA 인증 방식)

**KYC 레벨별 기본 한도** (KRW):
- Level 1: 일 100만원, 월 1,000만원
- Level 2: 일 500만원, 월 5,000만원
- Level 3: 일 5,000만원, 월 5억원

**Mock 데이터**:
- IU001 (M100, Level 3)
- IU002 (M101, Level 2)
- IU003 (M102, Level 1)

### 5. 약관 동의 (Terms Agreement)

**파일**: `src/types/termsAgreement.ts`, `src/data/termsAgreementMockData.ts`

```typescript
interface Terms {
  termsId: string;
  type: TermsType;               // 4가지 필수 약관
  version: string;
  title: string;
  content: string;
  isRequired: boolean;           // 모두 true
  effectiveDate: string;
  isActive: boolean;
}

interface MemberTermsAgreement {
  agreementId: string;
  memberId: string;
  termsId: string;
  termsType: TermsType;
  termsVersion: string;
  agreedAt: string;
  ipAddress?: string;            // 법적 증빙용
  userAgent?: string;
}
```

**4가지 필수 약관**:
1. `personal_info`: 개인정보 수집 및 이용 동의
2. `certification_service`: 인증사 서비스 이용약관 동의
3. `unique_id`: 고유식별정보 처리 동의
4. `telecom_service`: 통신사 이용약관 동의

**특징**:
- 회원별 약관 동의 이력 관리
- 약관 버전 관리 가능
- IP 주소, User Agent 저장 (법적 증빙)

## 데이터 관계도

```
┌─────────────────┐
│ Member (M001)   │
│ type: corporate │
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐         ┌──────────────────────┐
│ Organization    │         │ TermsAgreement       │
│ (ORG001)        │         │ (4개 필수 약관)      │
└─────────────────┘         └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ OrganizationUser (OU001~OU010)          │
│ - email: 로그인 키                       │
│ - phone: SMS 인증                       │
│ - hasGASetup: GA(OTP) 인증              │
└─────────────────────────────────────────┘


┌─────────────────┐
│ Member (M100)   │
│ type: individual│
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐         ┌──────────────────────┐
│ IndividualUser  │         │ TermsAgreement       │
│ (IU001)         │         │ (4개 필수 약관)      │
│ - kycLevel: 3   │         └──────────────────────┘
│ - walletLimit   │
└─────────────────┘
```

## 로그인 흐름

### 1. 이메일 입력
사용자가 이메일 주소 입력

### 2. 사용자 조회
```typescript
const result = getUserByEmail(email);
// result = { type: 'organization', user: OrganizationUser } 또는
//          { type: 'individual', user: IndividualUser }
```

### 3. SMS 인증
휴대폰 번호로 인증 코드 전송 및 확인

### 4. GA(OTP) 인증
`hasGASetup === true`인 경우 Google Authenticator 인증

### 5. 로그인 완료 및 Context 설정
```typescript
if (result.type === 'organization') {
  const member = getMemberById(result.user.memberId);
  const organization = getOrganizationByMemberId(result.user.memberId);
  // Context에 member, organization, user 정보 저장
} else {
  const member = getMemberById(result.user.memberId);
  // Context에 member, user 정보 저장
}
```

## 유틸리티 함수

**파일**: `src/utils/memberUtils.ts`

### 주요 함수

```typescript
// 회원 조회
getMemberById(memberId: string): Member | undefined

// 조직 조회
getOrganizationByMemberId(memberId: string): Organization | undefined

// 조직 사용자 조회
getOrganizationUsersByOrganizationId(organizationId: string): OrganizationUser[]
getOrganizationUsersByMemberId(memberId: string): OrganizationUser[]

// 개인 회원 조회
getIndividualUserByMemberId(memberId: string): IndividualUser | undefined

// 통합 사용자 조회 (로그인용)
getUserByEmail(email: string):
  { type: 'organization'; user: OrganizationUser } |
  { type: 'individual'; user: IndividualUser } |
  null

// 회원 타입 확인
isCorporateMember(memberId: string): boolean
isIndividualMember(memberId: string): boolean

// 전체 정보 조회
getFullMemberInfo(memberId: string): {
  member: Member;
  organization?: Organization;
  users?: OrganizationUser[];
  individualUser?: IndividualUser;
}
```

## 파일 구조

```
src/
├── types/
│   ├── member.ts                    # 회원 타입
│   ├── organization.ts              # 조직 타입
│   ├── organizationUser.ts          # 조직 사용자 타입
│   ├── individualUser.ts            # 개인 사용자 타입
│   ├── termsAgreement.ts            # 약관 동의 타입
│   └── user.ts                      # @deprecated (호환성 유지)
│
├── data/
│   ├── memberMockData.ts            # 회원 Mock 데이터
│   ├── organizationMockData.ts      # 조직 Mock 데이터
│   ├── organizationUserMockData.ts  # 조직 사용자 Mock 데이터
│   ├── individualUserMockData.ts    # 개인 사용자 Mock 데이터
│   ├── termsAgreementMockData.ts    # 약관 동의 Mock 데이터
│   └── userMockData.ts              # @deprecated (호환성 유지)
│
└── utils/
    └── memberUtils.ts               # 회원 관련 유틸리티
```

## 기존 코드 마이그레이션 가이드

### 1. 타입 임포트 변경

**변경 전**:
```typescript
import { User } from '@/types/user';
```

**변경 후**:
```typescript
// 조직 사용자인 경우
import { OrganizationUser } from '@/types/organizationUser';

// 개인 회원인 경우
import { IndividualUser } from '@/types/individualUser';

// 회원 정보가 필요한 경우
import { Member } from '@/types/member';
```

### 2. Mock 데이터 임포트 변경

**변경 전**:
```typescript
import { MOCK_USERS, getUserByEmail } from '@/data/userMockData';
```

**변경 후**:
```typescript
import { MOCK_ORGANIZATION_USERS } from '@/data/organizationUserMockData';
import { getUserByEmail } from '@/utils/memberUtils';
```

### 3. 사용자 조회 로직 변경

**변경 전**:
```typescript
const user = getUserByEmail(email);
```

**변경 후**:
```typescript
const result = getUserByEmail(email);
if (result?.type === 'organization') {
  const orgUser = result.user;
  // 조직 사용자 처리
} else if (result?.type === 'individual') {
  const individualUser = result.user;
  // 개인 회원 처리
}
```

## 향후 개선 사항

### 개인 회원 필드 추가 검토
- 주소 정보
- 직업 정보
- 자금 출처 정보
- AML/CTF 관련 필드

### 조직 기능 확장
- 조직 계층 구조 (부서 트리)
- 조직 간 자산 이동
- 조직 설정 관리

### 약관 관리 개선
- 약관 버전 업데이트 시 재동의 프로세스
- 선택 약관 추가 (마케팅 동의 등)
- 약관 동의 철회 기능

## 참고 사항

### 인증 방식
현재 시스템은 **비밀번호 없는 인증** 방식 사용:
1. 이메일 (로그인 키)
2. SMS 인증 (휴대폰)
3. GA(OTP) 인증 (Google Authenticator)

### 호환성
- 기존 `User` 타입은 `@deprecated` 처리되었으나 호환성을 위해 유지
- 기존 `userMockData.ts`도 유지
- 점진적 마이그레이션 권장

### 테스트 계정
- 기업 회원: M001 (ORG001, 10명), M002 (ORG002, 6명)
- 개인 회원: M100 (Level 3), M101 (Level 2), M102 (Level 1)
