import { GroupAuditTrail, GroupAuditEntry, GroupAuditAction } from "@/types/groups";

// 그룹 감사 추적 Mock 데이터
export const mockGroupAuditTrails: GroupAuditTrail[] = [
  {
    groupId: "GRP-001",
    groupName: "마케팅팀",
    groupType: "department",
    status: "active",
    createdAt: "2024-01-15T09:00:00Z",
    entries: [
      {
        id: "AUD-001",
        groupId: "GRP-001",
        groupName: "마케팅팀",
        timestamp: "2024-01-15T09:00:00Z",
        action: "CREATE",
        userId: "user-001",
        userName: "김마케팅",
        details: "마케팅팀 그룹 생성 신청",
        changes: [
          {
            field: "groupName",
            oldValue: null,
            newValue: "마케팅팀"
          },
          {
            field: "groupType",
            oldValue: null,
            newValue: "department"
          },
          {
            field: "monthlyBudget",
            oldValue: null,
            newValue: { amount: 50000, currency: "USDT" }
          },
          {
            field: "manager",
            oldValue: null,
            newValue: "김마케팅"
          }
        ],
        metadata: {
          ipAddress: "192.168.1.100"
        }
      },
      {
        id: "AUD-002",
        groupId: "GRP-001",
        groupName: "마케팅팀",
        timestamp: "2024-01-15T14:30:00Z",
        action: "APPROVE",
        userId: "user-admin",
        userName: "박관리자",
        details: "그룹 생성 승인",
        metadata: {
          reason: "적절한 예산 계획과 명확한 목적",
          approvers: ["박관리자", "윤보안"]
        }
      },
      {
        id: "AUD-003",
        groupId: "GRP-001",
        groupName: "마케팅팀",
        timestamp: "2024-02-01T10:15:00Z",
        action: "BUDGET_MODIFY",
        userId: "user-001",
        userName: "김마케팅",
        details: "월 예산 증액 신청",
        changes: [
          {
            field: "monthlyBudget",
            oldValue: { amount: 50000, currency: "USDT" },
            newValue: { amount: 75000, currency: "USDT" }
          }
        ],
        metadata: {
          reason: "Q1 마케팅 캠페인 강화를 위한 예산 증액",
          ipAddress: "192.168.1.101"
        }
      },
      {
        id: "AUD-004",
        groupId: "GRP-001",
        groupName: "마케팅팀",
        timestamp: "2024-02-01T16:45:00Z",
        action: "APPROVE",
        userId: "user-admin",
        userName: "박관리자",
        details: "예산 증액 승인",
        metadata: {
          reason: "마케팅 성과 향상을 위한 합리적 요청",
          approvers: ["박관리자"]
        }
      }
    ]
  },
  {
    groupId: "GRP-002",
    groupName: "개발팀",
    groupType: "department",
    status: "active",
    createdAt: "2024-01-10T08:30:00Z",
    entries: [
      {
        id: "AUD-005",
        groupId: "GRP-002",
        groupName: "개발팀",
        timestamp: "2024-01-10T08:30:00Z",
        action: "CREATE",
        userId: "user-002",
        userName: "이개발",
        details: "개발팀 그룹 생성 신청",
        changes: [
          {
            field: "groupName",
            oldValue: null,
            newValue: "개발팀"
          },
          {
            field: "groupType",
            oldValue: null,
            newValue: "department"
          },
          {
            field: "monthlyBudget",
            oldValue: null,
            newValue: { amount: 100000, currency: "USDT" }
          },
          {
            field: "manager",
            oldValue: null,
            newValue: "이개발"
          }
        ]
      },
      {
        id: "AUD-006",
        groupId: "GRP-002",
        groupName: "개발팀",
        timestamp: "2024-01-10T15:20:00Z",
        action: "REJECT",
        userId: "user-admin",
        userName: "박관리자",
        details: "그룹 생성 반려",
        metadata: {
          reason: "예산 규모가 과도하며, 구체적인 사용 계획 필요"
        }
      },
      {
        id: "AUD-007",
        groupId: "GRP-002",
        groupName: "개발팀",
        timestamp: "2024-01-12T09:00:00Z",
        action: "REAPPLY",
        userId: "user-002",
        userName: "이개발",
        details: "수정된 그룹 생성 재신청",
        changes: [
          {
            field: "monthlyBudget",
            oldValue: { amount: 100000, currency: "USDT" },
            newValue: { amount: 70000, currency: "USDT" }
          },
          {
            field: "description",
            oldValue: "개발팀 운영을 위한 그룹",
            newValue: "개발팀 운영을 위한 그룹 - 서버 운영비, 개발 도구 구매, 교육비 포함"
          }
        ],
        metadata: {
          reason: "예산 조정 및 구체적 사용계획 추가"
        }
      },
      {
        id: "AUD-008",
        groupId: "GRP-002",
        groupName: "개발팀",
        timestamp: "2024-01-12T14:10:00Z",
        action: "APPROVE",
        userId: "user-admin",
        userName: "박관리자",
        details: "재신청 승인",
        metadata: {
          reason: "적절한 예산 조정 및 명확한 사용계획 확인",
          approvers: ["박관리자", "윤보안"]
        }
      }
    ]
  },
  {
    groupId: "GRP-003",
    groupName: "AI 프로젝트팀",
    groupType: "project",
    status: "suspended",
    createdAt: "2024-01-05T13:15:00Z",
    entries: [
      {
        id: "AUD-009",
        groupId: "GRP-003",
        groupName: "AI 프로젝트팀",
        timestamp: "2024-01-05T13:15:00Z",
        action: "CREATE",
        userId: "user-003",
        userName: "최AI",
        details: "AI 프로젝트팀 그룹 생성 신청",
        changes: [
          {
            field: "groupName",
            oldValue: null,
            newValue: "AI 프로젝트팀"
          },
          {
            field: "groupType",
            oldValue: null,
            newValue: "project"
          },
          {
            field: "monthlyBudget",
            oldValue: null,
            newValue: { amount: 120000, currency: "USDT" }
          }
        ]
      },
      {
        id: "AUD-010",
        groupId: "GRP-003",
        groupName: "AI 프로젝트팀",
        timestamp: "2024-01-05T17:30:00Z",
        action: "APPROVE",
        userId: "user-admin",
        userName: "박관리자",
        details: "그룹 생성 승인",
        metadata: {
          reason: "혁신 프로젝트로 승인",
          approvers: ["박관리자", "김대표"]
        }
      },
      {
        id: "AUD-011",
        groupId: "GRP-003",
        groupName: "AI 프로젝트팀",
        timestamp: "2024-03-01T11:00:00Z",
        action: "SUSPEND",
        userId: "user-admin",
        userName: "박관리자",
        details: "그룹 활동 정지",
        metadata: {
          reason: "프로젝트 일시 중단으로 인한 그룹 정지"
        }
      }
    ]
  },
  {
    groupId: "GRP-004",
    groupName: "디자인팀",
    groupType: "department",
    status: "rejected",
    createdAt: "2024-02-01T10:30:00Z",
    entries: [
      {
        id: "AUD-012",
        groupId: "GRP-004",
        groupName: "디자인팀",
        timestamp: "2024-02-01T10:30:00Z",
        action: "CREATE",
        userId: "user-004",
        userName: "박디자인",
        details: "디자인팀 그룹 생성 신청",
        changes: [
          {
            field: "groupName",
            oldValue: null,
            newValue: "디자인팀"
          },
          {
            field: "monthlyBudget",
            oldValue: null,
            newValue: { amount: 30000, currency: "USDT" }
          }
        ]
      },
      {
        id: "AUD-013",
        groupId: "GRP-004",
        groupName: "디자인팀",
        timestamp: "2024-02-02T09:15:00Z",
        action: "REJECT",
        userId: "user-admin",
        userName: "박관리자",
        details: "그룹 생성 반려",
        metadata: {
          reason: "현재 마케팅팀에서 디자인 업무를 처리 중이므로 별도 그룹 불필요"
        }
      },
      {
        id: "AUD-014",
        groupId: "GRP-004",
        groupName: "디자인팀",
        timestamp: "2024-02-10T14:20:00Z",
        action: "ARCHIVE",
        userId: "user-admin",
        userName: "박관리자",
        details: "반려 그룹 아카이브 처리",
        metadata: {
          reason: "재신청 없이 아카이브 처리"
        }
      }
    ]
  }
];

// 감사 액션별 설정 정보
export const auditActionConfig = {
  CREATE: {
    name: "생성",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "plus"
  },
  APPROVE: {
    name: "승인",
    color: "bg-sky-100 text-sky-800 border-sky-200",
    icon: "check"
  },
  REJECT: {
    name: "반려",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: "x"
  },
  MODIFY: {
    name: "수정",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: "edit"
  },
  BUDGET_MODIFY: {
    name: "예산수정",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "currency"
  },
  SUSPEND: {
    name: "정지",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "pause"
  },
  ARCHIVE: {
    name: "아카이브",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "archive"
  },
  REAPPLY: {
    name: "재신청",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "refresh"
  }
} as const;

// 전체 감사 엔트리를 시간순으로 정렬하여 반환
export const getAllGroupAuditEntries = (): GroupAuditEntry[] => {
  const allEntries = mockGroupAuditTrails.flatMap(trail => trail.entries);
  return allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// 특정 그룹의 감사 추적 반환
export const getGroupAuditTrail = (groupId: string): GroupAuditTrail | null => {
  return mockGroupAuditTrails.find(trail => trail.groupId === groupId) || null;
};

// 필터링된 감사 엔트리 반환
interface AuditFilter {
  groupId?: string;
  action?: GroupAuditAction | "ALL";
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export const getFilteredAuditEntries = (filter: AuditFilter): GroupAuditEntry[] => {
  let entries = getAllGroupAuditEntries();

  if (filter.groupId) {
    entries = entries.filter(entry => entry.groupId === filter.groupId);
  }

  if (filter.action && filter.action !== "ALL") {
    entries = entries.filter(entry => entry.action === filter.action);
  }

  if (filter.startDate) {
    entries = entries.filter(entry => entry.timestamp >= filter.startDate!);
  }

  if (filter.endDate) {
    entries = entries.filter(entry => entry.timestamp <= filter.endDate!);
  }

  if (filter.searchTerm) {
    const term = filter.searchTerm.toLowerCase();
    entries = entries.filter(entry =>
      entry.groupName.toLowerCase().includes(term) ||
      entry.userName.toLowerCase().includes(term) ||
      entry.details?.toLowerCase().includes(term) ||
      entry.groupId.toLowerCase().includes(term)
    );
  }

  return entries;
};