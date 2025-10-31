# 거래 목적 수집 기능 설계 문서

## 개요

자금출처 화면(FundSourceStep)에서 거래 목적도 함께 수집하여 AML/KYC 규정 준수 강화

## 요구사항

- 자금출처와 같은 화면에서 거래 목적 수집
- 필수 입력 항목으로 설정
- 기타 선택 시 상세 내용 입력 가능
- DB에 저장

## 거래 목적 옵션

```typescript
const transactionPurposes = [
  { value: 'investment', label: '투자/자산 보유' },
  { value: 'trading', label: '거래/매매' },
  { value: 'remittance', label: '송금/결제' },
  { value: 'business', label: '사업 운영' },
  { value: 'other', label: '기타' },
]
```

## DB 설계

### users 테이블 컬럼 추가

| 컬럼명 | 타입 | NULL 허용 | 설명 |
|--------|------|-----------|------|
| transactionPurpose | VARCHAR(50) | YES | 거래 목적 (investment, trading, remittance, business, other) |
| transactionPurposeDetail | VARCHAR(500) | YES | 거래 목적 상세 (기타 선택 시) |

### 마이그레이션 파일

**파일명**: `20250131100000-add-transaction-purpose-to-users.js`

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'transactionPurpose', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: '거래 목적'
    });

    await queryInterface.addColumn('users', 'transactionPurposeDetail', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: '거래 목적 상세 내용'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'transactionPurpose');
    await queryInterface.removeColumn('users', 'transactionPurposeDetail');
  }
};
```

## User 모델 수정

**파일**: `abc-custody-backend/src/models/User.js`

```javascript
// 자금 출처 다음에 추가
transactionPurpose: {
  type: DataTypes.STRING(50),
  allowNull: true,
  comment: '거래 목적'
},
transactionPurposeDetail: {
  type: DataTypes.STRING(500),
  allowNull: true,
  comment: '거래 목적 상세 내용'
}
```

## 프론트엔드 수정

### 1. SignupData 인터페이스 확장

**파일**: `src/app/signup/page.tsx`

```typescript
export interface SignupData {
  // ... 기존 필드들
  fundSource?: string
  fundSourceDetail?: string
  // 거래 목적 추가
  transactionPurpose?: string
  transactionPurposeDetail?: string
}
```

### 2. FundSourceStep 컴포넌트 수정

**파일**: `src/components/signup/FundSourceStep.tsx`

#### State 추가

```typescript
const [fundSource, setFundSource] = useState(initialData.fundSource || '')
const [fundSourceDetail, setFundSourceDetail] = useState(initialData.fundSourceDetail || '')
// 거래 목적 state 추가
const [transactionPurpose, setTransactionPurpose] = useState(initialData.transactionPurpose || '')
const [transactionPurposeDetail, setTransactionPurposeDetail] = useState(initialData.transactionPurposeDetail || '')
```

#### 거래 목적 옵션

```typescript
const transactionPurposes = [
  { value: 'investment', label: '투자/자산 보유' },
  { value: 'trading', label: '거래/매매' },
  { value: 'remittance', label: '송금/결제' },
  { value: 'business', label: '사업 운영' },
  { value: 'other', label: '기타' },
]
```

#### UI 구조

```tsx
{/* 자금 출처 선택 */}
<div>
  <label>주요 자금 출처</label>
  <select value={fundSource} onChange={...}>
    {fundSources.map(...)}
  </select>
</div>

{/* 자금 출처 기타 입력 */}
{fundSource === 'other' && (
  <div>
    <label>자금 출처 상세</label>
    <textarea value={fundSourceDetail} onChange={...} />
  </div>
)}

{/* 거래 목적 선택 (신규) */}
<div>
  <label>거래 목적</label>
  <select value={transactionPurpose} onChange={...}>
    <option value="">거래 목적을 선택하세요</option>
    {transactionPurposes.map(...)}
  </select>
</div>

{/* 거래 목적 기타 입력 (신규) */}
{transactionPurpose === 'other' && (
  <div>
    <label>거래 목적 상세</label>
    <textarea value={transactionPurposeDetail} onChange={...} />
  </div>
)}
```

#### 검증 로직

```typescript
const handleSubmit = async () => {
  // 자금 출처 검증
  if (!fundSource) {
    setMessage({ type: 'error', text: '자금 출처를 선택해주세요.' })
    return
  }

  if (fundSource === 'other' && !fundSourceDetail.trim()) {
    setMessage({ type: 'error', text: '자금 출처 상세 내용을 입력해주세요.' })
    return
  }

  // 거래 목적 검증 (신규)
  if (!transactionPurpose) {
    setMessage({ type: 'error', text: '거래 목적을 선택해주세요.' })
    return
  }

  if (transactionPurpose === 'other' && !transactionPurposeDetail.trim()) {
    setMessage({ type: 'error', text: '거래 목적 상세 내용을 입력해주세요.' })
    return
  }

  // ... DB 저장 로직
}
```

#### DB 저장

```typescript
// 자금 출처
newUser.fundSource = fundSource
if (fundSource === 'other') {
  newUser.fundSourceDetail = fundSourceDetail
}

// 거래 목적 (신규)
newUser.transactionPurpose = transactionPurpose
if (transactionPurpose === 'other') {
  newUser.transactionPurposeDetail = transactionPurposeDetail
}
```

## 구현 순서

1. **DB 마이그레이션**
   - 마이그레이션 파일 생성
   - 마이그레이션 실행
   - users 테이블에 2개 컬럼 추가

2. **백엔드 User 모델 수정**
   - transactionPurpose 필드 추가
   - transactionPurposeDetail 필드 추가

3. **프론트엔드 타입 수정**
   - SignupData 인터페이스 확장

4. **FundSourceStep 컴포넌트 수정**
   - state 추가 (transactionPurpose, transactionPurposeDetail)
   - UI 추가 (거래 목적 선택, 기타 입력)
   - 검증 로직 추가
   - DB 저장 로직 추가

5. **테스트**
   - 회원가입 플로우 테스트
   - 거래 목적 필수 검증
   - 기타 선택 시 상세 입력 검증
   - DB 저장 확인

## UI 레이아웃 (FundSourceStep)

```
┌─────────────────────────────────────────┐
│         자금출처를 확인합니다              │
├─────────────────────────────────────────┤
│                                         │
│  [안내 사항]                             │
│  • 특정금융정보법에 따라 필요             │
│                                         │
│  주요 자금 출처                          │
│  [급여 소득 ▼]                           │
│                                         │
│  (기타 선택 시)                          │
│  자금 출처 상세                          │
│  [상세 내용 입력...                      │
│   ...                                   │
│   ...                    ]              │
│                                         │
│  거래 목적 ⭐ 신규                       │
│  [투자/자산 보유 ▼]                      │
│                                         │
│  (기타 선택 시)                          │
│  거래 목적 상세                          │
│  [상세 내용 입력...                      │
│   ...                                   │
│   ...                    ]              │
│                                         │
│  [개인정보 처리 방침 안내]               │
│                                         │
│  [이전]              [가입 완료]         │
└─────────────────────────────────────────┘
```

## 데이터 예시

### 저장 예시 1
```json
{
  "fundSource": "salary",
  "fundSourceDetail": null,
  "transactionPurpose": "investment",
  "transactionPurposeDetail": null
}
```

### 저장 예시 2 (기타 선택)
```json
{
  "fundSource": "other",
  "fundSourceDetail": "프리랜서 수입",
  "transactionPurpose": "other",
  "transactionPurposeDetail": "NFT 거래 및 메타버스 자산 관리"
}
```

## 참고사항

- 자금출처와 거래 목적 모두 필수 입력
- 기타 선택 시 상세 내용 필수 입력
- AML/KYC 규정 준수를 위한 필수 정보
- 관리자 페이지에서도 확인 가능하도록 추후 확장 가능
