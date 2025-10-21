/**
 * Mock Member Data Helpers
 * 개인/기업 회원 Mock 데이터 생성 헬퍼 함수
 */

import {
  Member,
  IndividualMember,
  CorporateMember,
  MemberStatus,
  OnboardingStatus,
  ContractPlan,
  ContactRole,
  ContactStatus,
  RiskLevel
} from '@/types/member';
import { MemberType } from '@/data/types/individualOnboarding';

/**
 * 기업 회원 1: 테크놀로지 코퍼레이션
 */
export const corporateMember001: CorporateMember = {
  id: 'member-001',
  memberType: MemberType.CORPORATE,
  companyInfo: {
    companyName: '테크놀로지 코퍼레이션',
    businessNumber: '123-45-67890',
    corporateNumber: '110111-1234567',
    industry: '정보통신업',
    establishedDate: '2020-01-15'
  },
  representative: {
    name: '김철수',
    position: '대표이사',
    email: 'kim@techinnovators.com',
    phone: '010-1234-5678'
  },
  companyAddress: {
    street: '테헤란로 123',
    city: '강남구',
    state: '서울특별시',
    postalCode: '06234',
    country: '대한민국'
  },
  status: MemberStatus.ACTIVE,
  contractInfo: {
    plan: ContractPlan.PREMIUM,
    feeRate: 0.15,
    monthlyLimit: 5000000000,
    dailyLimit: 200000000,
    startDate: new Date('2024-01-01'),
    autoRenewal: true
  },
  generatedDepositAddresses: [
    {
      id: 'asset-001-btc',
      memberId: 'member-001',
      assetSymbol: 'BTC',
      assetName: 'Bitcoin',
      depositAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      balance: '12.5',
      balanceInKRW: '625000000',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      totalDeposited: '12.5',
      totalWithdrawn: '0',
      transactionCount: 8
    },
    {
      id: 'asset-001-eth',
      memberId: 'member-001',
      assetSymbol: 'ETH',
      assetName: 'Ethereum',
      depositAddress: '0x742d35Cc8B927b8C7d4B5F22d0a3B9E6D4c8A2f1',
      balance: '245.7',
      balanceInKRW: '614250000',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      totalDeposited: '300.0',
      totalWithdrawn: '54.3',
      transactionCount: 15
    }
  ],
  contacts: [
    {
      id: 'contact-001',
      name: '김철수',
      email: 'kim@techinnovators.com',
      phone: '010-1234-5678',
      role: ContactRole.ADMIN,
      status: ContactStatus.ACTIVE,
      isPrimary: true,
      twoFactorEnabled: true,
      lastLogin: new Date(Date.now() - 3600000)
    }
  ],
  approvalSettings: {
    requiredApprovers: 2,
    approvalThreshold: '100000000',
    emergencyContacts: ['emergency@techinnovators.com'],
    weekendApprovalAllowed: true,
    nightTimeApprovalAllowed: false
  },
  notificationSettings: {
    email: true,
    sms: true,
    slack: 'https://hooks.slack.com/services/T123/B456/xyz',
    notifyOnDeposit: true,
    notifyOnWithdrawal: true,
    notifyOnSuspension: true
  },
  registeredAddresses: [],
  onboardingStatus: OnboardingStatus.APPROVED,
  complianceProfile: {
    riskLevel: RiskLevel.LOW,
    amlScore: 88,
    sanctionsScreening: true,
    pepStatus: false,
    lastKycUpdate: new Date('2024-01-01'),
    nextKycReview: new Date('2025-01-01'),
    complianceNotes: []
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};

/**
 * 기업 회원 2: 글로벌 트레이딩
 */
export const corporateMember002: CorporateMember = {
  id: 'member-002',
  memberType: MemberType.CORPORATE,
  companyInfo: {
    companyName: '글로벌 트레이딩',
    businessNumber: '234-56-78901',
    corporateNumber: '110111-2345678',
    industry: '도매 및 상품 중개업',
    establishedDate: '2019-03-20'
  },
  representative: {
    name: '이영수',
    position: '대표이사',
    email: 'lee@globaltrading.com',
    phone: '010-2345-6789'
  },
  companyAddress: {
    street: '을지로 45',
    city: '중구',
    state: '서울특별시',
    postalCode: '04512',
    country: '대한민국'
  },
  status: MemberStatus.ACTIVE,
  contractInfo: {
    plan: ContractPlan.PREMIUM,
    feeRate: 0.20,
    monthlyLimit: 3000000000,
    dailyLimit: 150000000,
    startDate: new Date('2024-02-01'),
    autoRenewal: true
  },
  generatedDepositAddresses: [
    {
      id: 'asset-002-usdt',
      memberId: 'member-002',
      assetSymbol: 'USDT',
      assetName: 'Tether',
      depositAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      balance: '1500000',
      balanceInKRW: '1950000000',
      isActive: true,
      createdAt: new Date('2024-02-01'),
      totalDeposited: '2000000',
      totalWithdrawn: '500000',
      transactionCount: 12
    }
  ],
  contacts: [
    {
      id: 'contact-002',
      name: '이영수',
      email: 'lee@globaltrading.com',
      phone: '010-2345-6789',
      role: ContactRole.ADMIN,
      status: ContactStatus.ACTIVE,
      isPrimary: true,
      twoFactorEnabled: true,
      lastLogin: new Date(Date.now() - 7200000)
    }
  ],
  approvalSettings: {
    requiredApprovers: 2,
    approvalThreshold: '80000000',
    emergencyContacts: ['emergency@globaltrading.com'],
    weekendApprovalAllowed: false,
    nightTimeApprovalAllowed: false
  },
  notificationSettings: {
    email: true,
    sms: true,
    slack: undefined,
    notifyOnDeposit: true,
    notifyOnWithdrawal: true,
    notifyOnSuspension: true
  },
  registeredAddresses: [],
  onboardingStatus: OnboardingStatus.APPROVED,
  complianceProfile: {
    riskLevel: RiskLevel.LOW,
    amlScore: 92,
    sanctionsScreening: true,
    pepStatus: false,
    lastKycUpdate: new Date('2024-02-01'),
    nextKycReview: new Date('2025-02-01'),
    complianceNotes: []
  },
  createdAt: new Date('2024-02-01'),
  updatedAt: new Date()
};

/**
 * 기업 회원 3: 스마트 솔루션
 */
export const corporateMember003: CorporateMember = {
  id: 'member-003',
  memberType: MemberType.CORPORATE,
  companyInfo: {
    companyName: '스마트 솔루션',
    businessNumber: '345-67-89012',
    corporateNumber: '110111-3456789',
    industry: '소프트웨어 개발 및 공급업',
    establishedDate: '2021-06-10'
  },
  representative: {
    name: '박민수',
    position: '대표이사',
    email: 'park@smartsolutions.com',
    phone: '010-3456-7890'
  },
  companyAddress: {
    street: '판교역로 235',
    city: '분당구',
    state: '경기도',
    postalCode: '13494',
    country: '대한민국'
  },
  status: MemberStatus.ACTIVE,
  contractInfo: {
    plan: ContractPlan.ENTERPRISE,
    feeRate: 0.10,
    monthlyLimit: 10000000000,
    dailyLimit: 500000000,
    startDate: new Date('2024-03-01'),
    autoRenewal: true
  },
  generatedDepositAddresses: [
    {
      id: 'asset-003-btc',
      memberId: 'member-003',
      assetSymbol: 'BTC',
      assetName: 'Bitcoin',
      depositAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      balance: '8.2',
      balanceInKRW: '410000000',
      isActive: true,
      createdAt: new Date('2024-03-01'),
      totalDeposited: '10.0',
      totalWithdrawn: '1.8',
      transactionCount: 6
    },
    {
      id: 'asset-003-usdc',
      memberId: 'member-003',
      assetSymbol: 'USDC',
      assetName: 'USD Coin',
      depositAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      balance: '800000',
      balanceInKRW: '1040000000',
      isActive: true,
      createdAt: new Date('2024-03-01'),
      totalDeposited: '1000000',
      totalWithdrawn: '200000',
      transactionCount: 10
    }
  ],
  contacts: [
    {
      id: 'contact-003',
      name: '박민수',
      email: 'park@smartsolutions.com',
      phone: '010-3456-7890',
      role: ContactRole.ADMIN,
      status: ContactStatus.ACTIVE,
      isPrimary: true,
      twoFactorEnabled: true,
      lastLogin: new Date(Date.now() - 10800000)
    }
  ],
  approvalSettings: {
    requiredApprovers: 3,
    approvalThreshold: '200000000',
    emergencyContacts: ['emergency@smartsolutions.com', 'cto@smartsolutions.com'],
    weekendApprovalAllowed: true,
    nightTimeApprovalAllowed: true
  },
  notificationSettings: {
    email: true,
    sms: true,
    slack: 'https://hooks.slack.com/services/T789/B012/abc',
    webhook: 'https://smartsolutions.com/webhook/custody',
    notifyOnDeposit: true,
    notifyOnWithdrawal: true,
    notifyOnSuspension: true
  },
  registeredAddresses: [],
  onboardingStatus: OnboardingStatus.APPROVED,
  complianceProfile: {
    riskLevel: RiskLevel.LOW,
    amlScore: 95,
    sanctionsScreening: true,
    pepStatus: false,
    lastKycUpdate: new Date('2024-03-01'),
    nextKycReview: new Date('2025-03-01'),
    complianceNotes: []
  },
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date()
};

/**
 * 개인 회원 1: 김영희
 */
export const individualMember004: IndividualMember = {
  id: 'member-004',
  memberType: MemberType.INDIVIDUAL,
  personalInfo: {
    fullName: '김영희',
    birthDate: '1990-05-15',
    nationality: '대한민국',
    idNumber: '900515-2******'
  },
  address: {
    street: '역삼로 456',
    city: '강남구',
    state: '서울특별시',
    postalCode: '06234',
    country: '대한민국'
  },
  status: MemberStatus.ACTIVE,
  contractInfo: {
    plan: ContractPlan.BASIC,
    feeRate: 0.30,
    monthlyLimit: 500000000,
    dailyLimit: 20000000,
    startDate: new Date('2024-04-01'),
    autoRenewal: true
  },
  generatedDepositAddresses: [
    {
      id: 'asset-004-btc',
      memberId: 'member-004',
      assetSymbol: 'BTC',
      assetName: 'Bitcoin',
      depositAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      balance: '0.85',
      balanceInKRW: '42500000',
      isActive: true,
      createdAt: new Date('2024-04-01'),
      totalDeposited: '1.2',
      totalWithdrawn: '0.35',
      transactionCount: 5
    }
  ],
  contacts: [
    {
      id: 'contact-004',
      name: '김영희',
      email: 'kim.younghee@gmail.com',
      phone: '010-4567-8901',
      role: ContactRole.ADMIN,
      status: ContactStatus.ACTIVE,
      isPrimary: true,
      twoFactorEnabled: true,
      lastLogin: new Date(Date.now() - 14400000)
    }
  ],
  approvalSettings: {
    requiredApprovers: 1,
    approvalThreshold: '20000000',
    emergencyContacts: ['kim.younghee@gmail.com'],
    weekendApprovalAllowed: false,
    nightTimeApprovalAllowed: false
  },
  notificationSettings: {
    email: true,
    sms: true,
    slack: undefined,
    notifyOnDeposit: true,
    notifyOnWithdrawal: true,
    notifyOnSuspension: true
  },
  registeredAddresses: [],
  onboardingStatus: OnboardingStatus.APPROVED,
  complianceProfile: {
    riskLevel: RiskLevel.LOW,
    amlScore: 90,
    sanctionsScreening: true,
    pepStatus: false,
    lastKycUpdate: new Date('2024-04-01'),
    nextKycReview: new Date('2025-04-01'),
    complianceNotes: []
  },
  createdAt: new Date('2024-04-01'),
  updatedAt: new Date()
};

/**
 * 개인 회원 2: 박준호
 */
export const individualMember005: IndividualMember = {
  id: 'member-005',
  memberType: MemberType.INDIVIDUAL,
  personalInfo: {
    fullName: '박준호',
    birthDate: '1985-11-22',
    nationality: '대한민국',
    idNumber: '851122-1******'
  },
  address: {
    street: '삼성로 789',
    city: '강남구',
    state: '서울특별시',
    postalCode: '06088',
    country: '대한민국'
  },
  status: MemberStatus.ACTIVE,
  contractInfo: {
    plan: ContractPlan.PREMIUM,
    feeRate: 0.20,
    monthlyLimit: 1500000000,
    dailyLimit: 100000000,
    startDate: new Date('2024-05-01'),
    autoRenewal: true
  },
  generatedDepositAddresses: [
    {
      id: 'asset-005-eth',
      memberId: 'member-005',
      assetSymbol: 'ETH',
      assetName: 'Ethereum',
      depositAddress: '0x9876543210fedcba9876543210fedcba98765432',
      balance: '18.5',
      balanceInKRW: '46250000',
      isActive: true,
      createdAt: new Date('2024-05-01'),
      totalDeposited: '20.0',
      totalWithdrawn: '1.5',
      transactionCount: 7
    },
    {
      id: 'asset-005-usdt',
      memberId: 'member-005',
      assetSymbol: 'USDT',
      assetName: 'Tether',
      depositAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      balance: '50000',
      balanceInKRW: '65000000',
      isActive: true,
      createdAt: new Date('2024-05-01'),
      totalDeposited: '60000',
      totalWithdrawn: '10000',
      transactionCount: 9
    }
  ],
  contacts: [
    {
      id: 'contact-005',
      name: '박준호',
      email: 'park.junho@naver.com',
      phone: '010-5678-9012',
      role: ContactRole.ADMIN,
      status: ContactStatus.ACTIVE,
      isPrimary: true,
      twoFactorEnabled: true,
      lastLogin: new Date(Date.now() - 1800000)
    }
  ],
  approvalSettings: {
    requiredApprovers: 1,
    approvalThreshold: '50000000',
    emergencyContacts: ['park.junho@naver.com'],
    weekendApprovalAllowed: true,
    nightTimeApprovalAllowed: false
  },
  notificationSettings: {
    email: true,
    sms: true,
    slack: undefined,
    notifyOnDeposit: true,
    notifyOnWithdrawal: true,
    notifyOnSuspension: true
  },
  registeredAddresses: [],
  onboardingStatus: OnboardingStatus.APPROVED,
  complianceProfile: {
    riskLevel: RiskLevel.LOW,
    amlScore: 87,
    sanctionsScreening: true,
    pepStatus: false,
    lastKycUpdate: new Date('2024-05-01'),
    nextKycReview: new Date('2025-05-01'),
    complianceNotes: []
  },
  createdAt: new Date('2024-05-01'),
  updatedAt: new Date()
};

/**
 * 모든 Mock 회원 데이터
 */
export const allMockMembers: Member[] = [
  corporateMember001,
  corporateMember002,
  corporateMember003,
  individualMember004,
  individualMember005
];
