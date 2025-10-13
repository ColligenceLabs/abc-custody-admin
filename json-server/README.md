# Custody Dashboard Mock API Server

json-server를 사용한 사용자 계정 관리 Mock API 서버입니다.

## 설치 및 실행

```bash
# 의존성 설치
cd json-server
npm install

# 서버 실행
npm start

# 개발 모드 (nodemon)
npm run dev
```

서버는 `http://localhost:3001`에서 실행됩니다.

## API 엔드포인트

### 사용자 관리 (Users)

#### 전체 사용자 조회
```bash
GET http://localhost:3001/users
```

#### 특정 사용자 조회
```bash
GET http://localhost:3001/users/1
```

#### 이메일로 사용자 조회 (로그인용)
```bash
GET http://localhost:3001/users?email=ceo@company.com
```

#### 역할별 필터링
```bash
GET http://localhost:3001/users?role=admin
GET http://localhost:3001/users?role=manager&status=active
```

#### 상태별 필터링
```bash
GET http://localhost:3001/users?status=active
GET http://localhost:3001/users?status=pending
```

#### 부서별 필터링
```bash
GET http://localhost:3001/users?department=경영진
```

#### 사용자 생성
```bash
POST http://localhost:3001/users
Content-Type: application/json

{
  "name": "홍길동",
  "email": "hong@company.com",
  "phone": "+82 010-1234-5678",
  "role": "operator",
  "status": "pending",
  "lastLogin": "",
  "permissions": ["permission.assets.view"],
  "department": "운영팀",
  "position": "담당자",
  "hasGASetup": false,
  "isFirstLogin": true
}
```

#### 사용자 정보 수정
```bash
PATCH http://localhost:3001/users/1
Content-Type: application/json

{
  "status": "active",
  "lastLogin": "2025-10-02T10:00:00Z"
}
```

#### 사용자 삭제
```bash
DELETE http://localhost:3001/users/1
```

### 인증 (Authentication)

#### 로그인 (커스텀 엔드포인트)
```bash
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "ceo@company.com",
  "password": "any-password"
}
```

**응답 (성공):**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "name": "김대표",
    "email": "ceo@company.com",
    "role": "admin",
    "status": "active",
    "lastLogin": "2025-10-02T10:30:00Z",
    ...
  },
  "token": "mock-jwt-token-1"
}
```

**응답 (실패):**
```json
{
  "error": "사용자를 찾을 수 없습니다."
}
```

## json-server 고급 기능

### 페이지네이션
```bash
GET http://localhost:3001/users?_page=1&_per_page=10
```

### 정렬
```bash
# 이름 오름차순
GET http://localhost:3001/users?_sort=name&_order=asc

# 마지막 로그인 내림차순
GET http://localhost:3001/users?_sort=lastLogin&_order=desc
```

### 전문 검색
```bash
# 모든 필드에서 "김" 검색
GET http://localhost:3001/users?q=김
```

### 범위 필터
```bash
# ID 1~5 범위
GET http://localhost:3001/users?id_gte=1&id_lte=5
```

## 테스트 계정

| 이름 | 이메일 | 역할 | 상태 |
|------|--------|------|------|
| 김대표 | ceo@company.com | admin | active |
| 박재무 | cfo@company.com | manager | active |
| 이기술 | cto@company.com | manager | active |
| 최관리 | manager@company.com | manager | active |
| 정부관 | sub-manager@company.com | operator | active |
| 박조회자 | viewer@company.com | viewer | active |
| 임대기중 | pending@company.com | viewer | pending |
| 전비활성 | inactive@company.com | operator | inactive |

## 개발 워크플로우

### 1. Next.js와 함께 실행
```bash
# 터미널 1: json-server 실행
cd json-server
npm start

# 터미널 2: Next.js 실행
cd ..
npm run dev
```

### 2. 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. API 클라이언트 사용 예시
```typescript
// src/lib/api/users.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}

export async function getUsers() {
  const response = await fetch(`${API_URL}/users`);
  return response.json();
}
```

## 주의사항

- 이 서버는 **개발 및 테스트 목적**으로만 사용해야 합니다.
- 실제 비밀번호 인증은 구현되어 있지 않습니다.
- 프로덕션 환경에서는 실제 백엔드 API로 교체해야 합니다.
- db.json 파일을 직접 수정하면 서버를 재시작해야 적용됩니다.
