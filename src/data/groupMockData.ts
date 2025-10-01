import { WalletGroup, ExpenseRequest, GroupCreationRequest } from '@/types/groups';
import { MOCK_USERS } from '@/data/userMockData';

export const mockGroups: WalletGroup[] = [
  {
    id: "1",
    name: "마케팅팀",
    type: "department",
    description: "월간 예산만 활용하는 기본 운영팀 (BTC 기준 예산 관리)",
    balance: { amount: 0.035, currency: 'BTC' },
    monthlyBudget: { amount: 0.05, currency: 'BTC' },
    quarterlyBudget: { amount: 0, currency: 'BTC' },
    yearlyBudget: { amount: 0, currency: 'BTC' },
    budgetUsed: { amount: 0.015, currency: 'BTC' },
    quarterlyBudgetUsed: { amount: 0, currency: 'BTC' },
    yearlyBudgetUsed: { amount: 0, currency: 'BTC' },
    budgetSetup: {
      year: 2025,
      baseType: 'monthly',
      baseAmount: 0.05,
      currency: 'BTC',
      selectedMonth: 9,
      quarterlyBudgets: [],
      monthlyBudgets: [{ month: 9, amount: 0.05 }],
      remainingMonths: [9, 10, 11, 12],
      remainingQuarters: [3, 4],
      startDate: '2025-09-01',
      endDate: '2025-09-30'
    },
    members: ["조운영", "박조회자", "신신청자"],
    manager: "9",
    createdAt: "2025-08-31",
    requiredApprovals: ["9", "2"],
    approvals: [
      { userId: "9", userName: "조운영", approvedAt: "2025-09-01T09:30:00Z" },
      { userId: "2", userName: "한리스크", approvedAt: "2025-09-01T14:15:00Z" }
    ],
  },
  {
    id: "2",
    name: "NFT 마켓플레이스 프로젝트",
    type: "project",
    description: "월간 + 분기 예산을 활용하는 중기 프로젝트 (ETH 기준 예산 관리)",
    balance: { amount: 8.5, currency: 'ETH' },
    monthlyBudget: { amount: 5.0, currency: 'ETH' },
    quarterlyBudget: { amount: 15.0, currency: 'ETH' },
    yearlyBudget: { amount: 0, currency: 'ETH' },
    budgetUsed: { amount: 3.2, currency: 'ETH' },
    quarterlyBudgetUsed: { amount: 6.5, currency: 'ETH' },
    yearlyBudgetUsed: { amount: 0, currency: 'ETH' },
    budgetSetup: {
      year: 2025,
      baseType: 'quarterly',
      baseAmount: 15.0,
      currency: 'ETH',
      selectedQuarter: 4,
      quarterlyBudgets: [{ quarter: 4, amount: 15.0 }],
      monthlyBudgets: [
        { month: 10, amount: 5.0 },
        { month: 11, amount: 5.0 },
        { month: 12, amount: 5.0 }
      ],
      remainingMonths: [10, 11, 12],
      remainingQuarters: [4],
      startDate: '2025-10-01',
      endDate: '2025-12-31'
    },
    members: ["이기술", "조운영", "정부관", "오승인자"],
    manager: "4",
    createdAt: "2025-08-31",
    requiredApprovals: ["3", "9", "2"],
    approvals: [
      { userId: "3", userName: "최관리", approvedAt: "2025-08-31T16:45:00Z" },
      { userId: "9", userName: "조운영", approvedAt: "2025-09-01T08:20:00Z" },
      { userId: "2", userName: "한리스크", approvedAt: "2025-09-01T10:30:00Z" }
    ],
  },
  {
    id: "3",
    name: "IT 인프라팀",
    type: "department",
    description: "월간 + 분기 + 연간 모든 예산을 활용하는 핵심 부서 (USDT 기준 예산 관리)",
    balance: { amount: 78500, currency: 'USDT' },
    monthlyBudget: { amount: 10000, currency: 'USDT' },
    quarterlyBudget: { amount: 30000, currency: 'USDT' },
    yearlyBudget: { amount: 120000, currency: 'USDT' },
    budgetUsed: { amount: 6500, currency: 'USDT' },
    quarterlyBudgetUsed: { amount: 18500, currency: 'USDT' },
    yearlyBudgetUsed: { amount: 41500, currency: 'USDT' },
    budgetSetup: {
      year: 2025,
      baseType: 'yearly',
      baseAmount: 120000,
      currency: 'USDT',
      yearlyBudget: 120000,
      quarterlyBudgets: [
        { quarter: 3, amount: 30000 },
        { quarter: 4, amount: 30000 }
      ],
      monthlyBudgets: [
        { month: 9, amount: 10000 },
        { month: 10, amount: 10000 },
        { month: 11, amount: 10000 },
        { month: 12, amount: 10000 },
      ],
      remainingMonths: [9, 10, 11, 12],
      remainingQuarters: [3, 4],
      startDate: '2025-09-01',
      endDate: '2025-12-31'
    },
    members: ["이기술", "최관리", "정부관", "윤보안", "조운영"],
    manager: "3",
    createdAt: "2025-08-15",
    requiredApprovals: ["4", "2"],
    approvals: [
      { userId: "4", userName: "이기술", approvedAt: "2025-08-16T11:20:00Z" },
      { userId: "2", userName: "한리스크", approvedAt: "2025-08-16T15:45:00Z" }
    ],
  },
  {
    id: "4",
    name: "DeFi 연구팀",
    type: "team",
    description: "연간 집중 투자가 필요한 연구개발팀 (USDC 기준 예산 관리)",
    balance: { amount: 42500, currency: 'USDC' },
    monthlyBudget: { amount: 5000, currency: 'USDC' },
    quarterlyBudget: { amount: 15000, currency: 'USDC' },
    yearlyBudget: { amount: 60000, currency: 'USDC' },
    budgetUsed: { amount: 3200, currency: 'USDC' },
    quarterlyBudgetUsed: { amount: 9800, currency: 'USDC' },
    yearlyBudgetUsed: { amount: 17500, currency: 'USDC' },
    budgetSetup: {
      year: 2025,
      baseType: 'yearly',
      baseAmount: 60000,
      currency: 'USDC',
      yearlyBudget: 60000,
      quarterlyBudgets: [
        { quarter: 3, amount: 15000 },
        { quarter: 4, amount: 15000 }
      ],
      monthlyBudgets: [
        { month: 9, amount: 5000 },
        { month: 10, amount: 5000 },
        { month: 11, amount: 5000 },
        { month: 12, amount: 5000 },
      ],
      remainingMonths: [9, 10, 11, 12],
      remainingQuarters: [3, 4],
      startDate: '2025-09-01',
      endDate: '2025-12-31'
    },
    members: ["한리스크", "송컴플"],
    manager: "2",
    createdAt: "2025-08-20",
    requiredApprovals: ["2", "3"],
    approvals: [
      { userId: "2", userName: "한리스크", approvedAt: "2025-08-21T09:15:00Z" },
      { userId: "3", userName: "최관리", approvedAt: "2025-08-21T13:40:00Z" }
    ],
  },
  {
    id: "5",
    name: "솔라나 게임 프로젝트",
    type: "project",
    description: "일시 중지된 게임 개발 프로젝트 (SOL 기준 예산 관리)",
    balance: { amount: 125.5, currency: 'SOL' },
    monthlyBudget: { amount: 50, currency: 'SOL' },
    quarterlyBudget: { amount: 150, currency: 'SOL' },
    yearlyBudget: { amount: 600, currency: 'SOL' },
    budgetUsed: { amount: 25.5, currency: 'SOL' },
    quarterlyBudgetUsed: { amount: 75.5, currency: 'SOL' },
    yearlyBudgetUsed: { amount: 225.5, currency: 'SOL' },
    budgetSetup: {
      year: 2025,
      baseType: 'quarterly',
      baseAmount: 150,
      currency: 'SOL',
      selectedQuarter: 3,
      quarterlyBudgets: [{ quarter: 3, amount: 150 }],
      monthlyBudgets: [
        { month: 7, amount: 50 },
        { month: 8, amount: 50 },
        { month: 9, amount: 50 }
      ],
      remainingMonths: [7, 8, 9],
      remainingQuarters: [3],
      startDate: '2025-07-01',
      endDate: '2025-09-30'
    },
    members: ["이기술", "조운영"],
    manager: "4",
    createdAt: "2025-07-01",
    requiredApprovals: ["3", "9"],
    approvals: [
      { userId: "3", userName: "최관리", approvedAt: "2025-07-02T10:00:00Z" },
      { userId: "9", userName: "조운영", approvedAt: "2025-07-02T14:25:00Z" }
    ],
    status: 'suspended'
  },
];

export const mockExpenses: ExpenseRequest[] = [
  // === 2025년 1월 (이번 달) ===
  {
    id: "1",
    groupId: "1", // 마케팅팀 (BTC)
    title: "1월 소셜미디어 광고비",
    amount: { amount: 0.003, currency: 'BTC' },
    description: "신규 년도 마케팅 캠페인",
    category: "marketing",
    requestedBy: "조운영",
    requestedAt: "2025-01-05",
    status: "approved",
    approvedBy: "김매니저",
    approvedAt: "2025-01-06",
  },
  {
    id: "2",
    groupId: "2", // NFT 프로젝트 (ETH)
    title: "1월 스마트 컨트랙트 업그레이드",
    amount: { amount: 1.2, currency: 'ETH' },
    description: "보안 패치 및 최적화",
    category: "software",
    requestedBy: "이기술",
    requestedAt: "2025-01-08",
    status: "pending",
    requiredApprovals: ["김매니저", "최관리", "박재무"],
    approvals: [
      {
        userId: "manager001",
        userName: "김매니저",
        approvedAt: "2025-01-09T10:30:00Z"
      }
    ]
  },
  {
    id: "3",
    groupId: "3", // IT 인프라팀 (USDT)
    title: "1월 AWS 인프라 비용",
    amount: { amount: 2500, currency: 'USDT' },
    description: "신규 서비스 확장을 위한 인프라",
    category: "infrastructure",
    requestedBy: "이기술",
    requestedAt: "2025-01-10",
    status: "rejected",
    rejectedReason: "예산 재검토 필요",
    rejectedBy: "최관리",
    rejectedAt: "2025-01-11T14:20:00Z",
    requiredApprovals: ["이기술", "최관리"],
    approvals: [
      {
        userId: "tech001",
        userName: "이기술",
        approvedAt: "2025-01-11T09:15:00Z"
      }
    ],
    rejections: [
      {
        userId: "manager002",
        userName: "최관리",
        rejectedAt: "2025-01-11T14:20:00Z",
        reason: "예산 재검토 필요"
      }
    ]
  },

  // === 2024년 12월 (작년) ===
  {
    id: "4",
    groupId: "1", // 마케팅팀 (BTC)
    title: "연말 브랜드 캠페인",
    amount: { amount: 0.005, currency: 'BTC' },
    description: "연말 프로모션 광고 비용",
    category: "marketing",
    requestedBy: "조운영",
    requestedAt: "2024-12-15",
    status: "approved",
    approvedBy: "김매니저",
    approvedAt: "2024-12-16",
  },
  {
    id: "5",
    groupId: "2", // NFT 프로젝트 (ETH)
    title: "연말 UI/UX 개선",
    amount: { amount: 2.1, currency: 'ETH' },
    description: "사용자 경험 최적화",
    category: "software",
    requestedBy: "이기술",
    requestedAt: "2024-12-20",
    status: "approved",
    approvedBy: "최관리",
    approvedAt: "2024-12-21",
  },
  {
    id: "6",
    groupId: "4", // DeFi 연구팀 (USDC)
    title: "연말 DeFi 연구 자료",
    amount: { amount: 1800, currency: 'USDC' },
    description: "시장 분석 및 연구 도구",
    category: "software",
    requestedBy: "한리스크",
    requestedAt: "2024-12-10",
    status: "pending",
    requiredApprovals: ["박재무", "김매니저"],
    approvals: []
  },

  // === 2024년 11월 ===
  {
    id: "7",
    groupId: "3", // IT 인프라팀 (USDT)
    title: "보안 시스템 강화",
    amount: { amount: 4500, currency: 'USDT' },
    description: "방화벽 및 모니터링 시스템",
    category: "infrastructure",
    requestedBy: "윤보안",
    requestedAt: "2024-11-25",
    status: "approved",
    approvedBy: "이기술",
    approvedAt: "2024-11-26",
  },
  {
    id: "8",
    groupId: "1", // 마케팅팀 (BTC)
    title: "11월 콘텐츠 제작비",
    amount: { amount: 0.0035, currency: 'BTC' },
    description: "영상 제작 및 편집",
    category: "marketing",
    requestedBy: "조운영",
    requestedAt: "2024-11-18",
    status: "rejected",
    rejectedReason: "다른 대안 검토 요청",
  },

  // === 2024년 10월 ===
  {
    id: "9",
    groupId: "4", // DeFi 연구팀 (USDC)
    title: "DeFi 프로토콜 분석 툴",
    amount: { amount: 1200, currency: 'USDC' },
    description: "트레이딩 데이터 분석 소프트웨어",
    category: "software",
    requestedBy: "송컴플",
    requestedAt: "2024-10-22",
    status: "approved",
    approvedBy: "박재무",
    approvedAt: "2024-10-23",
  },
  {
    id: "10",
    groupId: "2", // NFT 프로젝트 (ETH)
    title: "10월 개발 환경 구축",
    amount: { amount: 1.7, currency: 'ETH' },
    description: "테스트넷 및 개발도구",
    category: "infrastructure",
    requestedBy: "정부관",
    requestedAt: "2024-10-15",
    status: "pending",
  },

  // === 2024년 9월 ===
  {
    id: "11",
    groupId: "3", // IT 인프라팀 (USDT)
    title: "9월 클라우드 확장",
    amount: { amount: 3200, currency: 'USDT' },
    description: "서버 용량 증설",
    category: "infrastructure",
    requestedBy: "이기술",
    requestedAt: "2024-09-12",
    status: "approved",
    approvedBy: "최관리",
    approvedAt: "2024-09-13",
  },
  {
    id: "12",
    groupId: "1", // 마케팅팀 (BTC)
    title: "9월 광고 캠페인",
    amount: { amount: 0.0047, currency: 'BTC' },
    description: "추석 시즌 마케팅",
    category: "marketing",
    requestedBy: "김매니저",
    requestedAt: "2024-09-05",
    status: "rejected",
    rejectedReason: "효과 분석 후 재신청 요청",
  },
];

export const mockGroupRequests: GroupCreationRequest[] = [
  {
    id: "req-1",
    name: "신규 마케팅팀",
    type: "department",
    description: "신제품 출시를 위한 마케팅 전담팀 (SOL 기준 예산 관리)",
    monthlyBudget: { amount: 120, currency: 'SOL' },
    quarterlyBudget: { amount: 360, currency: 'SOL' },
    yearlyBudget: { amount: 1440, currency: 'SOL' },
    budgetSetup: {
      year: 2025,
      baseType: 'yearly',
      baseAmount: 1440,
      currency: 'SOL',
      yearlyBudget: 1440,
      quarterlyBudgets: [
        { quarter: 3, amount: 360 },
        { quarter: 4, amount: 360 }
      ],
      monthlyBudgets: [
        { month: 9, amount: 120 },
        { month: 10, amount: 120 },
        { month: 11, amount: 120 },
        { month: 12, amount: 120 }
      ],
      remainingMonths: [9, 10, 11, 12],
      remainingQuarters: [3, 4],
      startDate: '2025-09-01',
      endDate: '2025-12-31'
    },
    manager: "김매니저",
    status: "pending",
    requestedBy: "박신규",
    requestedAt: "2025-01-15T09:30:00Z",
    requiredApprovals: ["김매니저", "최관리", "박재무"],
    approvals: [
      {
        userId: "manager001",
        userName: "김매니저",
        approvedAt: "2025-01-15T14:30:00Z"
      }
    ],
    rejections: []
  },
  {
    id: "req-2",
    name: "AI 연구 프로젝트팀",
    type: "project",
    description: "차세대 AI 기술 연구개발 프로젝트 (ETH 기준 예산 관리)",
    monthlyBudget: { amount: 8, currency: 'ETH' },
    quarterlyBudget: { amount: 24, currency: 'ETH' },
    yearlyBudget: { amount: 96, currency: 'ETH' },
    budgetSetup: {
      year: 2025,
      baseType: 'quarterly',
      baseAmount: 24,
      currency: 'ETH',
      selectedQuarter: 4,
      quarterlyBudgets: [{ quarter: 4, amount: 24 }],
      monthlyBudgets: [
        { month: 10, amount: 8 },
        { month: 11, amount: 8 },
        { month: 12, amount: 8 }
      ],
      remainingMonths: [10, 11, 12],
      remainingQuarters: [4],
      startDate: '2025-10-01',
      endDate: '2025-12-31'
    },
    manager: "이연구",
    status: "pending",
    requestedBy: "이연구",
    requestedAt: "2025-01-14T16:20:00Z",
    requiredApprovals: ["이기술", "최관리", "박재무"],
    approvals: [],
    rejections: []
  },
  {
    id: "req-3",
    name: "보안 강화팀",
    type: "team",
    description: "시스템 보안 및 컴플라이언스 전담팀 (USDT 기준 예산 관리)",
    monthlyBudget: { amount: 3500, currency: 'USDT' },
    quarterlyBudget: { amount: 10500, currency: 'USDT' },
    yearlyBudget: { amount: 42000, currency: 'USDT' },
    manager: "윤보안",
    status: "rejected",
    requestedBy: "윤보안",
    requestedAt: "2025-01-13T11:45:00Z",
    requiredApprovals: ["이기술", "김매니저", "박재무"],
    approvals: [
      {
        userId: "tech001",
        userName: "이기술",
        approvedAt: "2025-01-13T15:20:00Z"
      }
    ],
    rejections: [
      {
        userId: "manager001",
        userName: "김매니저",
        rejectedAt: "2025-01-14T10:15:00Z",
        reason: "현재 예산 상황상 추가 팀 신설은 어려움. 기존 IT 인프라팀과 통합 고려 필요"
      }
    ],
    rejectedAt: "2025-01-14T10:15:00Z",
    rejectedReason: "현재 예산 상황상 추가 팀 신설은 어려움. 기존 IT 인프라팀과 통합 고려 필요"
  },
  {
    id: "req-4",
    name: "글로벌 사업팀",
    type: "department",
    description: "해외 시장 진출을 위한 사업 개발팀 (BTC 기준 예산 관리)",
    monthlyBudget: { amount: 0.015, currency: 'BTC' },
    quarterlyBudget: { amount: 0.045, currency: 'BTC' },
    yearlyBudget: { amount: 0.18, currency: 'BTC' },
    budgetSetup: {
      year: 2025,
      baseType: 'monthly',
      baseAmount: 0.015,
      currency: 'BTC',
      selectedMonth: 11,
      quarterlyBudgets: [],
      monthlyBudgets: [{ month: 11, amount: 0.015 }],
      remainingMonths: [11],
      remainingQuarters: [4],
      startDate: '2025-11-01',
      endDate: '2025-11-30'
    },
    manager: "정글로벌",
    status: "approved",
    requestedBy: "정글로벌",
    requestedAt: "2025-01-10T08:00:00Z",
    requiredApprovals: ["최관리", "박재무"],
    approvals: [
      {
        userId: "manager002",
        userName: "최관리",
        approvedAt: "2025-01-10T16:30:00Z"
      },
      {
        userId: "finance001",
        userName: "박재무",
        approvedAt: "2025-01-11T09:45:00Z"
      }
    ],
    rejections: [],
    approvedAt: "2025-01-11T09:45:00Z"
  },
  {
    id: "req-5",
    name: "블록체인 연구팀",
    type: "team",
    description: "차세대 블록체인 기술 연구 및 개발팀 (USDC 기준 예산 관리)",
    monthlyBudget: { amount: 2500, currency: 'USDC' },
    quarterlyBudget: { amount: 7500, currency: 'USDC' },
    yearlyBudget: { amount: 30000, currency: 'USDC' },
    manager: "임블록",
    status: "archived",
    requestedBy: "임블록",
    requestedAt: "2025-01-08T10:00:00Z",
    requiredApprovals: ["이기술", "최관리", "박재무"],
    approvals: [
      {
        userId: "tech001",
        userName: "이기술",
        approvedAt: "2025-01-08T14:30:00Z"
      }
    ],
    rejections: [
      {
        userId: "manager002",
        userName: "최관리",
        rejectedAt: "2025-01-09T11:20:00Z",
        reason: "현재 연구팀이 너무 많아서 리소스 분산 우려. 기존 DeFi 연구팀과 통합을 고려해주세요."
      }
    ],
    rejectedAt: "2025-01-09T11:20:00Z",
    rejectedReason: "현재 연구팀이 너무 많아서 리소스 분산 우려. 기존 DeFi 연구팀과 통합을 고려해주세요."
  }
];