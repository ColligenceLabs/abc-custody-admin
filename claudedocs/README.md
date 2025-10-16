# 📚 프로젝트 문서 색인

## 핵심 문서 목록

### 🎯 주요 계획서
- **[admin-panel-implementation-plan.md](./admin-panel-implementation-plan.md)** - 전체 비즈니스 플로우 및 구현 계획
- **[admin-implementation-tasks.md](./admin-implementation-tasks.md)** - 12주 단계별 구현 Task 목록

### 📋 문서 요약

#### admin-panel-implementation-plan.md
- **내용**: 기업용 커스터디 관리자 페이지 전체 구현 계획서
- **핵심**: 회원사 셀프 관리 시스템, Hot/Cold 지갑 구조, AML/Travel Rule 컴플라이언스
- **비즈니스 플로우**: 자산 추가 → 입금 주소 자동 생성 → 회원사 직접 주소 관리
- **페이지**: 866줄, 상세한 기능 명세 및 데이터 구조 포함

#### admin-implementation-tasks.md
- **내용**: 12주간의 단계별 구현 Task 체크리스트
- **구조**: 6개 Phase, 우선순위별 분류 (P0~P3)
- **특징**: 체크박스 형식으로 진행 상황 추적 가능
- **예상 소요시간**: 총 12주, Phase별 1-3주

---

## 🚀 세션 시작 시 체크리스트

**Claude Code 진입 시 반드시 확인할 항목들:**

- [ ] **프로젝트 성격 파악**: 기업용 커스터디 관리자 페이지 (모니터링 중심)
- [ ] **비즈니스 구조 이해**: 회원사 셀프 관리 → 관리자 모니터링 구조
- [ ] **현재 구현 상태**: Hello World 페이지만 존재, 관리자 시스템 미구현
- [ ] **우선순위 Task**: Phase 1 기초 인프라부터 시작 (인증, 레이아웃, 타입 정의)
- [ ] **핵심 보안 요소**: Hot/Cold 지갑 (20%/80%), Air-gap 서명, AML 스크리닝

---

## 📁 추가 문서 (향후 확장 예정)

### 설계 문서
- design-system.md - UI/UX 디자인 가이드
- api-specifications.md - API 명세서
- database-schema.md - 데이터베이스 스키마

### 개발 문서
- security-requirements.md - 보안 요구사항
- testing-strategy.md - 테스트 전략
- deployment-guide.md - 배포 가이드

### 운영 문서
- monitoring-setup.md - 모니터링 설정
- compliance-checklist.md - 컴플라이언스 체크리스트
- troubleshooting-guide.md - 트러블슈팅 가이드

---

## 🔄 문서 업데이트 규칙

1. **계획 변경 시**: admin-panel-implementation-plan.md 수정
2. **Task 완료 시**: admin-implementation-tasks.md 체크박스 업데이트
3. **새 문서 추가 시**: 이 README.md 색인 업데이트
4. **변경 이력**: 각 문서 하단에 작성일/수정일 기록

---

## 📞 빠른 참조

| 질문 | 참조 문서 |
|-----|----------|
| 전체 프로젝트 구조가 궁금할 때 | admin-panel-implementation-plan.md |
| 다음에 뭘 구현해야 할지 궁금할 때 | admin-implementation-tasks.md |
| 비즈니스 플로우가 궁금할 때 | admin-panel-implementation-plan.md (29-38줄) |
| 우선순위가 궁금할 때 | admin-implementation-tasks.md (우선순위 Matrix) |

---

_최종 업데이트: 2025-09-26_
_총 문서 수: 2개 (핵심 계획서)_