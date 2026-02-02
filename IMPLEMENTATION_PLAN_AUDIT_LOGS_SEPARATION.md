# 감사 로그 분리 구현 계획

## 📋 현황 분석

### 현재 상태
- **DB 테이블**:
  - `audit_logs`: 일반 사용자(개인/법인) 감사 로그 ✅ 존재
  - `admin_audit_logs`: 슈퍼관리자 감사 로그 ✅ 존재
- **백엔드 모델**:
  - `AuditLog`: 일반 사용자용
  - `AdminAuditLog`: 슈퍼관리자용 ✅ 존재
- **현재 API**: `/api/reports/audit-logs` - AuditLog만 조회
- **문제점**: 관리자 페이지에서 두 테이블이 섞여 보이고 있으며, UI가 분리되지 않음

### 요구사항
1. 슈퍼관리자 로그와 사용자 로그를 명확히 분리
2. 각각 별도의 UI/페이지로 관리
3. 데이터 구조 및 API 엔드포인트 분리

## 🎯 구현 계획

### Phase 1: 백엔드 API 분리 및 개선

#### 1.1. 새로운 API 엔드포인트 생성

**파일**: `src/routes/reports.js`

```javascript
// 관리자 전용 감사 로그 엔드포인트 (admin_audit_logs 조회)
router.get('/admin-audit-logs', authenticate, reportController.getAdminAuditLogs);
router.get('/admin-audit-logs/statistics', authenticate, reportController.getAdminAuditLogStatistics);
router.get('/admin-audit-logs/export', authenticate, reportController.exportAdminAuditLogs);

// 기존: 사용자 감사 로그 엔드포인트 (audit_logs 조회)
router.get('/audit-logs', authenticate, reportController.getAuditLogs); // 그대로 유지
router.get('/audit-logs/statistics', authenticate, reportController.getAuditLogStatistics);
router.get('/audit-logs/export', authenticate, reportController.exportAuditLogs);
```

#### 1.2. reportController.js에 새로운 함수 추가

**파일**: `src/controllers/reportController.js`

```javascript
/**
 * 관리자 감사 로그 조회 (admin_audit_logs 테이블)
 */
exports.getAdminAuditLogs = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      action,
      resource,
      result,
      userId,
      page = 1,
      limit = 100,
    } = req.query;

    const { AdminAuditLog } = require("../models");
    const whereClause = {};

    // 날짜 필터
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate);
      if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate);
    }

    // 작업 유형 필터
    if (action) whereClause.action = action;

    // 리소스 필터
    if (resource) whereClause.resource = resource;

    // 결과 필터
    if (result) {
      whereClause.result = result.toLowerCase();
    }

    // 사용자 ID 필터
    if (userId) whereClause.userId = userId;

    const offset = (page - 1) * limit;

    const { rows: logs, count: total } = await AdminAuditLog.findAndCountAll({
      where: whereClause,
      order: [["timestamp", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("관리자 감사 로그 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "관리자 감사 로그 조회 중 오류가 발생했습니다.",
    });
  }
};

/**
 * 관리자 감사 로그 통계
 */
exports.getAdminAuditLogStatistics = async (req, res) => {
  // 구현 내용
};

/**
 * 관리자 감사 로그 CSV 내보내기
 */
exports.exportAdminAuditLogs = async (req, res) => {
  // 구현 내용
};
```

#### 1.3. 기존 getAuditLogs 함수 유지
- 현재 `getAuditLogs`는 `AuditLog` 테이블만 조회하도록 유지
- 일반 사용자(개인/법인) 감사 로그 전용

### Phase 2: 프론트엔드 UI 분리 (abc-custody-admin)

#### 2.1. 페이지 구조 재설계

**디렉토리 구조**:
```
src/app/admin/audit-reports/
├── audit-logs/              # 사용자 감사 로그 (기존)
│   └── page.tsx
├── admin-audit-logs/        # 관리자 감사 로그 (신규)
│   └── page.tsx
└── page.tsx                 # 개요 페이지
```

#### 2.2. 관리자 감사 로그 페이지 생성

**파일**: `src/app/admin/audit-reports/admin-audit-logs/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
// ... (기존 audit-logs/page.tsx와 유사한 구조)

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      // 필터 파라미터 추가
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.action) params.append("action", filters.action);
      if (filters.resource) params.append("resource", filters.resource);
      if (filters.result) params.append("result", filters.result);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/reports/admin-audit-logs?${params}`,
        {
          credentials: 'include',
          headers: {
            'X-Request-Source': 'admin',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setLogs(result.data);
      }
    } catch (error) {
      console.error("관리자 감사 로그 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... 나머지 UI 로직
}
```

#### 2.3. 네비게이션 메뉴 수정

감사 리포트 섹션에 두 개의 메뉴 항목 추가:
- **사용자 감사 로그**: `/admin/audit-reports/audit-logs`
- **관리자 감사 로그**: `/admin/audit-reports/admin-audit-logs`

#### 2.4. 개요 페이지 수정

**파일**: `src/app/admin/audit-reports/page.tsx`

두 가지 감사 로그 카드 표시:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* 사용자 감사 로그 카드 */}
  <Card>
    <CardHeader>
      <CardTitle>사용자 감사 로그</CardTitle>
      <CardDescription>개인/법인 회원의 활동 로그</CardDescription>
    </CardHeader>
    <CardContent>
      <Link href="/admin/audit-reports/audit-logs">
        <Button>보기</Button>
      </Link>
    </CardContent>
  </Card>

  {/* 관리자 감사 로그 카드 */}
  <Card>
    <CardHeader>
      <CardTitle>관리자 감사 로그</CardTitle>
      <CardDescription>슈퍼관리자의 활동 로그</CardDescription>
    </CardHeader>
    <CardContent>
      <Link href="/admin/audit-reports/admin-audit-logs">
        <Button>보기</Button>
      </Link>
    </CardContent>
  </Card>
</div>
```

### Phase 3: 데이터 모델 일관성 확인

#### 3.1. AdminAuditLog 모델 필드 확인

**현재 AdminAuditLog 필드**:
- `timestamp` (Date) ← `audit_logs`는 `createdAt` 사용
- `result` (success/failure) ← `audit_logs`는 `SUCCESS/FAILED` 사용

**통일 필요 여부 검토**:
1. 시간 필드: `timestamp` vs `createdAt`
2. 결과 값: `success/failure` vs `SUCCESS/FAILED`

#### 3.2. 필요 시 마이그레이션

일관성을 위해 AdminAuditLog 테이블 수정:
```javascript
// 옵션 1: AdminAuditLog를 AuditLog 스타일로 변경
ALTER TABLE admin_audit_logs
  RENAME COLUMN timestamp TO created_at;

// 옵션 2: 코드에서 매핑 처리
```

### Phase 4: 공통 컴포넌트 추출

#### 4.1. 재사용 가능한 컴포넌트 생성

**파일**: `src/components/admin/audit-logs/`

```
src/components/admin/audit-logs/
├── AuditLogFilters.tsx      # 필터 UI
├── AuditLogTable.tsx         # 테이블 UI
├── AuditLogDetails.tsx       # 상세 정보
└── types.ts                  # 공통 타입
```

두 페이지에서 공통으로 사용:
- 사용자 감사 로그 페이지
- 관리자 감사 로그 페이지

## 📅 구현 순서

### Week 1: 백엔드 구현
- [ ] Day 1-2: API 엔드포인트 추가 (`/api/reports/admin-audit-logs`)
- [ ] Day 3: AdminAuditLog 조회 로직 구현
- [ ] Day 4: 통계 및 내보내기 기능 구현
- [ ] Day 5: 테스트 및 검증

### Week 2: 프론트엔드 구현
- [ ] Day 1-2: 공통 컴포넌트 추출 및 리팩토링
- [ ] Day 3: 관리자 감사 로그 페이지 생성
- [ ] Day 4: 네비게이션 및 개요 페이지 수정
- [ ] Day 5: UI/UX 테스트 및 최종 점검

## 🔍 검증 체크리스트

### 백엔드
- [ ] `/api/reports/admin-audit-logs` API 정상 작동
- [ ] 필터링 기능 (날짜, 작업, 리소스, 결과) 정상 작동
- [ ] 페이지네이션 정상 작동
- [ ] CSV 내보내기 정상 작동
- [ ] 권한 검증 (관리자만 접근 가능)

### 프론트엔드
- [ ] 사용자 감사 로그 페이지 정상 작동
- [ ] 관리자 감사 로그 페이지 정상 작동
- [ ] 각 페이지에서 올바른 데이터 표시
- [ ] 필터 및 검색 기능 정상 작동
- [ ] PDF 다운로드 정상 작동

### 데이터 일관성
- [ ] 슈퍼관리자 활동이 `admin_audit_logs`에만 기록
- [ ] 일반 사용자 활동이 `audit_logs`에만 기록
- [ ] 두 테이블 간 데이터 중복 없음

## 📝 추가 고려사항

### 1. 통합 검색 기능
향후 필요 시 두 테이블을 통합 검색할 수 있는 기능 추가:
```javascript
// 옵션: 통합 검색 API
router.get('/audit-logs/all', authenticate, reportController.getAllAuditLogs);
```

### 2. 권한 관리
- 일반 관리자는 사용자 감사 로그만 조회
- 슈퍼관리자는 모든 감사 로그 조회 가능

### 3. 데이터 보관 정책
- 두 테이블 모두 동일한 보관 정책 적용
- 자동 아카이빙 및 삭제 로직 구현

## 🚀 실행 방법

### 1. 백엔드 실행
```bash
cd abc-custody-backend
npm run dev
```

### 2. 프론트엔드 실행
```bash
cd abc-custody-admin
npm run dev
```

### 3. 확인
- 사용자 감사 로그: http://localhost:3010/admin/audit-reports/audit-logs
- 관리자 감사 로그: http://localhost:3010/admin/audit-reports/admin-audit-logs

## 📚 참고 자료

- 기존 AuditLog 모델: `src/models/AuditLog.js`
- AdminAuditLog 모델: `src/models/AdminAuditLog.js`
- 마이그레이션 파일: `src/migrations/20250109050000-create-admin-audit-logs-table.js`
