import { NotificationLog, NotificationTemplate } from "@/utils/notificationSystem";

export const MOCK_NOTIFICATION_LOGS: NotificationLog[] = [
  {
    id: "log-001",
    template: "approval_pending",
    recipient: "cfo@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
    retryCount: 0,
    requestId: "WD-2024-001"
  },
  {
    id: "log-002",
    template: "approval_overdue",
    recipient: "ciso@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2시간 전
    retryCount: 1,
    requestId: "WD-2024-002"
  },
  {
    id: "log-003",
    template: "approval_completed",
    recipient: "requester@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4시간 전
    retryCount: 0,
    requestId: "WD-2024-003"
  },
  {
    id: "log-004",
    template: "approval_rejected",
    recipient: "requester@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6시간 전
    retryCount: 0,
    requestId: "WD-2024-004"
  },
  {
    id: "log-005",
    template: "emergency_approval",
    recipient: "cfo@company.com",
    channel: "email",
    status: "failed",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8시간 전
    retryCount: 2,
    requestId: "WD-2024-005",
    failureReason: "SMTP 서버 연결 실패"
  },
  {
    id: "log-006",
    template: "approval_pending",
    recipient: "cto@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12시간 전
    retryCount: 0,
    requestId: "WD-2024-006"
  },
  {
    id: "log-007",
    template: "approval_overdue",
    recipient: "ciso@company.com",
    channel: "email",
    status: "retry",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14시간 전
    retryCount: 1,
    requestId: "WD-2024-007"
  },
  {
    id: "log-008",
    template: "approval_completed",
    recipient: "finance@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18시간 전
    retryCount: 0,
    requestId: "WD-2024-008"
  },
  {
    id: "log-009",
    template: "emergency_approval",
    recipient: "ceo@company.com",
    channel: "email",
    status: "sent",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20시간 전
    retryCount: 0,
    requestId: "WD-2024-009"
  },
  {
    id: "log-010",
    template: "approval_pending",
    recipient: "manager@company.com",
    channel: "email",
    status: "failed",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24시간 전
    retryCount: 3,
    requestId: "WD-2024-010",
    failureReason: "수신자 메일 주소 오류"
  }
];

export const MOCK_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "approval_pending",
    name: "승인 대기 알림",
    trigger: "approval_pending",
    enabled: true,
    channels: ["email"],
    subject: "출금 승인 요청 - {{amount}} {{currency}}",
    message: `안녕하세요, {{approverName}}님

새로운 출금 승인 요청이 있습니다.

**출금 정보**
- 신청자: {{initiator}}
- 금액: {{amount}} {{currency}}
- 출금 주소: {{toAddress}}
- 신청 시간: {{initiatedAt}}
- 우선순위: {{priority}}

승인 또는 반려 처리를 위해 시스템에 접속해 주세요.

감사합니다.`,
    variables: ["approverName", "initiator", "amount", "currency", "toAddress", "initiatedAt", "priority"],
    updatedAt: "2025-01-24T09:30:00Z"
  },
  {
    id: "approval_overdue",
    name: "승인 지연 알림",
    trigger: "approval_overdue",
    enabled: true,
    channels: ["email"],
    subject: "출금 승인 지연 알림 - {{amount}} {{currency}}",
    message: `안녕하세요, {{approverName}}님

출금 승인이 {{overdueHours}}시간 지연되었습니다.

**지연된 출금 정보**
- 신청자: {{initiator}}
- 금액: {{amount}} {{currency}}
- 신청 시간: {{initiatedAt}}
- 지연 시간: {{overdueHours}}시간

신속한 승인 처리를 부탁드립니다.

감사합니다.`,
    variables: ["approverName", "initiator", "amount", "currency", "initiatedAt", "overdueHours"],
    updatedAt: "2025-01-23T14:20:00Z"
  },
  {
    id: "approval_completed",
    name: "승인 완료 알림",
    trigger: "approval_completed",
    enabled: true,
    channels: ["email"],
    subject: "출금 승인 완료 - {{amount}} {{currency}}",
    message: `안녕하세요, {{initiator}}님

출금 신청이 모든 승인자로부터 승인되었습니다.

**승인된 출금 정보**
- 금액: {{amount}} {{currency}}
- 출금 주소: {{toAddress}}
- 최종 승인 시간: {{completedAt}}

곧 출금 처리가 진행될 예정입니다.

감사합니다.`,
    variables: ["initiator", "amount", "currency", "toAddress", "completedAt"],
    updatedAt: "2025-01-22T11:45:00Z"
  },
  {
    id: "approval_rejected",
    name: "승인 반려 알림",
    trigger: "approval_rejected",
    enabled: true,
    channels: ["email"],
    subject: "출금 신청 반려 - {{amount}} {{currency}}",
    message: `안녕하세요, {{initiator}}님

출금 신청이 반려되었습니다.

**반려된 출금 정보**
- 금액: {{amount}} {{currency}}
- 반려자: {{rejectedBy}}
- 반려 시간: {{rejectedAt}}
- 반려 사유: {{rejectionReason}}

문의사항이 있으시면 관리자에게 연락해 주세요.

감사합니다.`,
    variables: ["initiator", "amount", "currency", "rejectedBy", "rejectedAt", "rejectionReason"],
    updatedAt: "2025-01-21T16:30:00Z"
  },
  {
    id: "emergency_approval",
    name: "긴급 승인 알림",
    trigger: "emergency",
    enabled: true,
    channels: ["email"],
    subject: "🚨 긴급 출금 승인 요청 - {{amount}} {{currency}}",
    message: `안녕하세요, {{approverName}}님

긴급 출금 승인 요청입니다.

**긴급 출금 정보**
- 신청자: {{initiator}}
- 금액: {{amount}} {{currency}}
- 긴급 사유: {{emergencyReason}}
- 신청 시간: {{initiatedAt}}

가능한 한 빠른 승인 처리를 부탁드립니다.

감사합니다.`,
    variables: ["approverName", "initiator", "amount", "currency", "emergencyReason", "initiatedAt"],
    updatedAt: "2025-01-20T08:15:00Z"
  },
  {
    id: "deposit_confirmed",
    name: "입금 확인 알림",
    trigger: "approval_completed",
    enabled: false,
    channels: ["email"],
    subject: "입금 확인 - {{amount}} {{currency}}",
    message: `안녕하세요, {{initiator}}님

입금이 확인되었습니다.

**입금 정보**
- 금액: {{amount}} {{currency}}
- 입금 주소: {{toAddress}}
- 확인 시간: {{completedAt}}

거래가 성공적으로 처리되었습니다.

감사합니다.`,
    variables: ["initiator", "amount", "currency", "toAddress", "completedAt"],
    updatedAt: "2025-01-19T13:25:00Z"
  },
  {
    id: "system_maintenance",
    name: "시스템 점검 안내",
    trigger: "approval_pending",
    enabled: false,
    channels: ["email"],
    subject: "시스템 점검 안내",
    message: `안녕하세요,

시스템 점검이 예정되어 있습니다.

**점검 정보**
- 점검 시간: {{initiatedAt}}
- 예상 소요시간: 2시간
- 점검 내용: 서버 업그레이드 및 보안 패치

점검 중에는 일시적으로 서비스 이용이 제한될 수 있습니다.

감사합니다.`,
    variables: ["initiatedAt"],
    updatedAt: "2025-01-18T10:00:00Z"
  },
  {
    id: "login_alert",
    name: "로그인 알림",
    trigger: "approval_pending",
    enabled: true,
    channels: ["email"],
    subject: "새로운 로그인 감지",
    message: `안녕하세요, {{approverName}}님

새로운 로그인이 감지되었습니다.

**로그인 정보**
- 시간: {{initiatedAt}}
- IP 주소: 192.168.1.100
- 디바이스: Chrome Browser

본인이 아닌 경우 즉시 비밀번호를 변경해 주세요.

감사합니다.`,
    variables: ["approverName", "initiatedAt"],
    updatedAt: "2025-01-17T15:40:00Z"
  },
  {
    id: "password_reset",
    name: "비밀번호 재설정",
    trigger: "approval_pending",
    enabled: true,
    channels: ["email"],
    subject: "비밀번호 재설정 요청",
    message: `안녕하세요, {{approverName}}님

비밀번호 재설정 요청이 있었습니다.

**요청 정보**
- 요청 시간: {{initiatedAt}}
- 요청 IP: 192.168.1.100

아래 링크를 클릭하여 비밀번호를 재설정하세요.

본인이 요청하지 않았다면 이 메일을 무시하세요.

감사합니다.`,
    variables: ["approverName", "initiatedAt"],
    updatedAt: "2025-01-16T12:20:00Z"
  },
  {
    id: "account_locked",
    name: "계정 잠김 알림",
    trigger: "approval_rejected",
    enabled: true,
    channels: ["email"],
    subject: "계정 보안 잠김",
    message: `안녕하세요, {{initiator}}님

보안상의 이유로 계정이 일시 잠김 처리되었습니다.

**잠김 정보**
- 잠김 시간: {{rejectedAt}}
- 잠김 사유: {{rejectionReason}}
- 해제 예정: 30분 후

관리자에게 문의하거나 잠시 후 다시 시도해 주세요.

감사합니다.`,
    variables: ["initiator", "rejectedAt", "rejectionReason"],
    updatedAt: "2025-01-15T17:55:00Z"
  },
  {
    id: "daily_report",
    name: "일일 거래 리포트",
    trigger: "approval_completed",
    enabled: false,
    channels: ["email"],
    subject: "일일 거래 요약 리포트",
    message: `안녕하세요,

오늘의 거래 요약 리포트입니다.

**거래 요약**
- 총 거래 건수: 15건
- 총 거래 금액: {{amount}} {{currency}}
- 완료된 출금: 8건
- 대기 중인 승인: 3건

자세한 내용은 대시보드를 확인해 주세요.

감사합니다.`,
    variables: ["amount", "currency"],
    updatedAt: "2025-01-14T18:30:00Z"
  },
  {
    id: "api_rate_limit",
    name: "API 사용량 경고",
    trigger: "approval_overdue",
    enabled: true,
    channels: ["email"],
    subject: "API 사용량 경고 알림",
    message: `안녕하세요, {{approverName}}님

API 사용량이 한도에 근접했습니다.

**사용량 정보**
- 현재 사용량: 85%
- 리셋 시간: {{initiatedAt}}
- 남은 요청 수: 150회

사용량 관리에 주의해 주세요.

감사합니다.`,
    variables: ["approverName", "initiatedAt"],
    updatedAt: "2025-01-13T09:15:00Z"
  }
];