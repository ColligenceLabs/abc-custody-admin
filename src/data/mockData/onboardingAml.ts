/**
 * Onboarding AML Mock Data
 * 온보딩 AML 관리 시스템 Mock 데이터
 *
 * 외부 AML 솔루션 연동 결과를 포함한 샘플 데이터
 */

import {
  IndividualOnboarding,
  CorporateOnboarding,
  OnboardingStats,
  ActivityFeedItem,
} from '@/types/onboardingAml';

// ===========================
// 개인회원 온보딩 Mock 데이터
// ===========================

export const mockIndividualOnboardings: IndividualOnboarding[] = [
  // 1. 온라인 신청 - LOW 위험도, 승인 완료
  {
    id: 'ind-001',
    userId: 'user-001',
    userName: '김철수',
    userEmail: 'chulsoo.kim@example.com',
    createdAt: '2025-01-15T09:30:00Z',
    updatedAt: '2025-01-17T14:20:00Z',
    registrationSource: 'ONLINE',
    kyc: {
      idType: 'RESIDENT_CARD',
      idNumber: '******-*******',
      idImageUrl: '/uploads/kyc/ind-001-id.jpg',
      addressProofType: 'UTILITY_BILL',
      addressProofUrl: '/uploads/kyc/ind-001-address.pdf',
      phoneVerified: true,
      emailVerified: true,
      completedAt: '2025-01-15T10:00:00Z',
    },
    aml: {
      pepStatus: 'CLEAR',
      sanctionListStatus: 'CLEAR',
      blacklistStatus: 'CLEAR',
      countryRiskLevel: 'LOW',
      screeningDate: '2025-01-15T10:30:00Z',
      screeningProvider: 'Chainalysis KYT',
      externalReferenceId: 'CHA-IND-001-20250115',
    },
    riskAssessment: {
      riskLevel: 'LOW',
      riskScore: 23,
      factors: ['거주지 위험도 낮음', '소득 수준 양호', 'PEP 매칭 없음'],
      assessedAt: '2025-01-15T11:00:00Z',
      assessedBy: 'SYSTEM',
      externalReferenceId: 'CHA-RISK-001',
    },
    additionalProcedures: {
      residenceProofRequired: false,
      incomeProofRequired: false,
      videoInterviewRequired: false,
      eddRequired: false,
      supervisorApprovalRequired: false,
      recommendedActions: ['표준 프로세스로 진행 가능'],
    },
    edd: null,
    eddRequired: false,
    adminReview: {
      status: 'APPROVED',
      currentStep: 5,
      reviewedBy: 'admin-001',
      reviewedAt: '2025-01-17T14:20:00Z',
      decision: 'APPROVE',
      decisionReason: '모든 검증 통과, 위험도 낮음',
      notes: [
        {
          id: 'note-001',
          createdBy: 'admin-001',
          createdAt: '2025-01-16T10:00:00Z',
          content: 'KYC 문서 확인 완료. 신분증 및 주소 증명 적법함.',
          type: 'INFO',
        },
        {
          id: 'note-002',
          createdBy: 'admin-001',
          createdAt: '2025-01-17T14:20:00Z',
          content: '외부 AML 결과 확인. 모든 항목 CLEAR.',
          type: 'DECISION',
        },
      ],
    },
  },

  // 2. 오프라인 신청 (지점 방문) - MEDIUM 위험도, 검토 중
  {
    id: 'ind-002',
    userId: 'user-002',
    userName: '박영희',
    userEmail: 'younghee.park@example.com',
    createdAt: '2025-01-18T14:15:00Z',
    updatedAt: '2025-01-19T10:30:00Z',
    registrationSource: 'OFFLINE_BRANCH',
    registrationNote: '강남 지점 방문 신청. 김지점장 접수.',
    kyc: {
      idType: 'DRIVER_LICENSE',
      idNumber: '******-*******',
      idImageUrl: '/uploads/kyc/ind-002-id.jpg',
      addressProofType: 'REGISTRY',
      addressProofUrl: '/uploads/kyc/ind-002-address.pdf',
      phoneVerified: true,
      emailVerified: true,
      completedAt: '2025-01-18T14:30:00Z',
    },
    aml: {
      pepStatus: 'POSSIBLE_MATCH',
      pepDetails: '동명이인 PEP 존재, 추가 확인 필요',
      sanctionListStatus: 'CLEAR',
      blacklistStatus: 'CLEAR',
      countryRiskLevel: 'LOW',
      screeningDate: '2025-01-18T15:00:00Z',
      screeningProvider: 'Chainalysis KYT',
      externalReferenceId: 'CHA-IND-002-20250118',
    },
    riskAssessment: {
      riskLevel: 'MEDIUM',
      riskScore: 52,
      factors: ['PEP 유사 매칭', '고액 거래 예상', '추가 확인 필요'],
      assessedAt: '2025-01-18T15:30:00Z',
      assessedBy: 'MANUAL',
      externalReferenceId: 'CHA-RISK-002',
    },
    additionalProcedures: {
      residenceProofRequired: true,
      incomeProofRequired: true,
      videoInterviewRequired: false,
      eddRequired: false,
      supervisorApprovalRequired: true,
      recommendedActions: [
        '소득 증명서 추가 요청',
        '주소 증명서 재확인',
        '상급자 승인 필요',
      ],
    },
    edd: null,
    eddRequired: false,
    adminReview: {
      status: 'UNDER_REVIEW',
      currentStep: 3,
      reviewedBy: 'admin-002',
      reviewedAt: '2025-01-19T10:30:00Z',
      notes: [
        {
          id: 'note-003',
          createdBy: 'admin-002',
          createdAt: '2025-01-19T09:00:00Z',
          content: 'PEP 매칭 의심 건. 동명이인 확인 중.',
          type: 'WARNING',
        },
        {
          id: 'note-004',
          createdBy: 'admin-002',
          createdAt: '2025-01-19T10:30:00Z',
          content: '추가 서류 요청 완료. 소득 증명서 대기 중.',
          type: 'INFO',
        },
      ],
    },
  },

  // 3. 온라인 신청 - HIGH 위험도, 보류
  {
    id: 'ind-003',
    userId: 'user-003',
    userName: '이민수',
    userEmail: 'minsoo.lee@example.com',
    createdAt: '2025-01-20T11:00:00Z',
    updatedAt: '2025-01-21T16:45:00Z',
    registrationSource: 'ONLINE',
    kyc: {
      idType: 'PASSPORT',
      idNumber: 'M12345678',
      idImageUrl: '/uploads/kyc/ind-003-id.jpg',
      addressProofType: 'UTILITY_BILL',
      addressProofUrl: '/uploads/kyc/ind-003-address.pdf',
      phoneVerified: true,
      emailVerified: true,
      completedAt: '2025-01-20T11:30:00Z',
    },
    aml: {
      pepStatus: 'CLEAR',
      sanctionListStatus: 'CLEAR',
      blacklistStatus: 'CLEAR',
      countryRiskLevel: 'HIGH',
      screeningDate: '2025-01-20T12:00:00Z',
      screeningProvider: 'Chainalysis KYT',
      externalReferenceId: 'CHA-IND-003-20250120',
    },
    riskAssessment: {
      riskLevel: 'HIGH',
      riskScore: 78,
      factors: ['고위험 국가 거주', '대량 거래 예상', 'EDD 필요'],
      assessedAt: '2025-01-20T12:30:00Z',
      assessedBy: 'SYSTEM',
      externalReferenceId: 'CHA-RISK-003',
    },
    additionalProcedures: {
      residenceProofRequired: true,
      incomeProofRequired: true,
      videoInterviewRequired: true,
      eddRequired: true,
      supervisorApprovalRequired: true,
      recommendedActions: [
        'Enhanced Due Diligence 수행',
        '화상 인터뷰 진행',
        '소득 출처 상세 확인',
        '상급자 최종 승인 필요',
      ],
    },
    edd: null,
    eddRequired: true,
    adminReview: {
      status: 'ON_HOLD',
      currentStep: 4,
      reviewedBy: 'admin-003',
      reviewedAt: '2025-01-21T16:45:00Z',
      decision: 'HOLD',
      decisionReason: '고위험 국가 거주자. EDD 진행 후 재검토 필요.',
      notes: [
        {
          id: 'note-005',
          createdBy: 'admin-003',
          createdAt: '2025-01-21T15:00:00Z',
          content: '고위험 국가 거주. 추가 서류 및 화상 인터뷰 요청.',
          type: 'WARNING',
        },
        {
          id: 'note-006',
          createdBy: 'admin-003',
          createdAt: '2025-01-21T16:45:00Z',
          content: 'EDD 진행 중. 소득 출처 확인 필요.',
          type: 'DECISION',
        },
      ],
    },
  },

  // 4. 전화 문의 (오프라인) - PENDING
  {
    id: 'ind-004',
    userId: 'user-004',
    userName: '최지연',
    userEmail: 'jiyeon.choi@example.com',
    createdAt: '2025-01-21T13:20:00Z',
    updatedAt: '2025-01-21T13:20:00Z',
    registrationSource: 'PHONE_INQUIRY',
    registrationNote: '고객센터 전화 문의 후 등록. 상담원: 이영수',
    kyc: {
      idType: 'RESIDENT_CARD',
      idNumber: '******-*******',
      idImageUrl: '/uploads/kyc/ind-004-id.jpg',
      addressProofType: 'UTILITY_BILL',
      addressProofUrl: '/uploads/kyc/ind-004-address.pdf',
      phoneVerified: true,
      emailVerified: false,
      completedAt: '2025-01-21T13:20:00Z',
    },
    aml: null, // 아직 AML 스크리닝 전
    riskAssessment: null,
    additionalProcedures: null,
    edd: null,
    eddRequired: false,
    adminReview: {
      status: 'PENDING',
      currentStep: 1,
      notes: [],
    },
  },

  // 5. 온라인 신청 - 거부됨
  {
    id: 'ind-005',
    userId: 'user-005',
    userName: '정우성',
    userEmail: 'woosung.jung@example.com',
    createdAt: '2025-01-19T08:45:00Z',
    updatedAt: '2025-01-20T11:30:00Z',
    registrationSource: 'ONLINE',
    kyc: {
      idType: 'RESIDENT_CARD',
      idNumber: '******-*******',
      idImageUrl: '/uploads/kyc/ind-005-id.jpg',
      addressProofType: 'REGISTRY',
      addressProofUrl: '/uploads/kyc/ind-005-address.pdf',
      phoneVerified: true,
      emailVerified: true,
      completedAt: '2025-01-19T09:00:00Z',
    },
    aml: {
      pepStatus: 'MATCHED',
      pepDetails: 'PEP 리스트 매칭: 정치적 노출인물로 확인됨',
      sanctionListStatus: 'CLEAR',
      blacklistStatus: 'MATCHED',
      blacklistReason: '내부 블랙리스트 등록: 과거 부정거래 이력',
      countryRiskLevel: 'MEDIUM',
      screeningDate: '2025-01-19T09:30:00Z',
      screeningProvider: 'Chainalysis KYT',
      externalReferenceId: 'CHA-IND-005-20250119',
    },
    riskAssessment: {
      riskLevel: 'HIGH',
      riskScore: 92,
      factors: ['PEP 매칭', '블랙리스트 등록', '부정거래 이력'],
      assessedAt: '2025-01-19T10:00:00Z',
      assessedBy: 'SYSTEM',
      externalReferenceId: 'CHA-RISK-005',
    },
    additionalProcedures: null,
    edd: null,
    eddRequired: false,
    adminReview: {
      status: 'REJECTED',
      currentStep: 2,
      reviewedBy: 'admin-001',
      reviewedAt: '2025-01-20T11:30:00Z',
      decision: 'REJECT',
      decisionReason: 'PEP 매칭 및 블랙리스트 등록. 서비스 제공 불가.',
      notes: [
        {
          id: 'note-007',
          createdBy: 'admin-001',
          createdAt: '2025-01-20T10:00:00Z',
          content: 'PEP 매칭 확인. 정치적 노출인물로 등록됨.',
          type: 'WARNING',
        },
        {
          id: 'note-008',
          createdBy: 'admin-001',
          createdAt: '2025-01-20T11:30:00Z',
          content: '블랙리스트 확인. 과거 부정거래 이력 존재. 서비스 제공 불가 결정.',
          type: 'DECISION',
        },
      ],
    },
  },
];

// ===========================
// 법인회원 온보딩 Mock 데이터
// ===========================

export const mockCorporateOnboardings: CorporateOnboarding[] = [
  // 1. 온라인 신청 - LOW 위험도, 승인 완료
  {
    id: 'corp-001',
    companyId: 'company-001',
    companyName: '(주)테크이노베이션',
    businessNumber: '123-45-67890',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T17:00:00Z',
    registrationSource: 'ONLINE',
    corporateInfo: {
      businessLicenseUrl: '/uploads/corp/corp-001-license.pdf',
      corporateRegistryUrl: '/uploads/corp/corp-001-registry.pdf',
      articlesOfIncorporationUrl: '/uploads/corp/corp-001-articles.pdf',
      shareholderListUrl: '/uploads/corp/corp-001-shareholders.pdf',
      representativeIdUrl: '/uploads/corp/corp-001-rep-id.jpg',
      representativeSealCertUrl: '/uploads/corp/corp-001-seal.pdf',
      completedAt: '2025-01-10T11:00:00Z',
    },
    ubo: {
      structure: [
        {
          name: '김대표',
          sharePercentage: 60,
          isUBO: true,
          pepStatus: 'CLEAR',
          idVerified: true,
          documentUrl: '/uploads/corp/corp-001-ubo-1.pdf',
        },
        {
          name: '이부사장',
          sharePercentage: 30,
          isUBO: true,
          pepStatus: 'CLEAR',
          idVerified: true,
          documentUrl: '/uploads/corp/corp-001-ubo-2.pdf',
        },
        {
          name: '박이사',
          sharePercentage: 10,
          isUBO: false,
          pepStatus: 'CLEAR',
          idVerified: true,
        },
      ],
      complexStructure: false,
      trustStructure: false,
      verifiedAt: '2025-01-10T12:00:00Z',
      verifiedBy: 'Chainalysis KYT',
      externalReferenceId: 'CHA-UBO-001',
    },
    riskAssessment: {
      industryType: 'IT 소프트웨어',
      industryRiskLevel: 'LOW',
      businessLocation: '대한민국 서울',
      locationRiskLevel: 'LOW',
      uboRiskLevel: 'LOW',
      overallRiskLevel: 'LOW',
      riskScore: 18,
      assessedAt: '2025-01-10T13:00:00Z',
      assessedBy: 'SYSTEM',
      externalReferenceId: 'CHA-CORP-RISK-001',
    },
    procedures: {
      recommendedDocuments: ['사업 계획서', '재무제표'],
      backgroundCheckRequired: false,
      onSiteInspectionRequired: false,
      executiveInterviewRequired: false,
      businessPlanUrl: '/uploads/corp/corp-001-plan.pdf',
      financialStatementsUrl: '/uploads/corp/corp-001-financial.pdf',
      backgroundCheckCompleted: false,
      onSiteInspectionCompleted: false,
      executiveInterviewCompleted: false,
    },
    edd: null,
    eddRequired: false,
    adminReview: {
      status: 'APPROVED',
      currentStep: 5,
      reviewedBy: 'admin-004',
      reviewedAt: '2025-01-15T17:00:00Z',
      decision: 'APPROVE',
      decisionReason: 'UBO 검증 완료. 모든 리스크 LOW. 승인 처리.',
      notes: [
        {
          id: 'corp-note-001',
          createdBy: 'admin-004',
          createdAt: '2025-01-12T14:00:00Z',
          content: 'UBO 구조 단순. 검증 완료.',
          type: 'INFO',
        },
        {
          id: 'corp-note-002',
          createdBy: 'admin-004',
          createdAt: '2025-01-15T17:00:00Z',
          content: '사업 계획서 및 재무제표 확인 완료. 승인 처리.',
          type: 'DECISION',
        },
      ],
    },
  },

  // 2. 오프라인 신청 (지점 방문) - MEDIUM 위험도, 검토 중
  {
    id: 'corp-002',
    companyId: 'company-002',
    companyName: '글로벌트레이딩(주)',
    businessNumber: '234-56-78901',
    createdAt: '2025-01-18T09:00:00Z',
    updatedAt: '2025-01-21T11:00:00Z',
    registrationSource: 'OFFLINE_BRANCH',
    registrationNote: '강남 지점 방문. 대표이사 직접 신청.',
    corporateInfo: {
      businessLicenseUrl: '/uploads/corp/corp-002-license.pdf',
      corporateRegistryUrl: '/uploads/corp/corp-002-registry.pdf',
      articlesOfIncorporationUrl: '/uploads/corp/corp-002-articles.pdf',
      shareholderListUrl: '/uploads/corp/corp-002-shareholders.pdf',
      representativeIdUrl: '/uploads/corp/corp-002-rep-id.jpg',
      representativeSealCertUrl: '/uploads/corp/corp-002-seal.pdf',
      completedAt: '2025-01-18T10:00:00Z',
    },
    ubo: {
      structure: [
        {
          name: '최대표',
          sharePercentage: 40,
          isUBO: true,
          pepStatus: 'CLEAR',
          idVerified: true,
          documentUrl: '/uploads/corp/corp-002-ubo-1.pdf',
        },
        {
          name: '해외법인 A',
          sharePercentage: 35,
          isUBO: true,
          pepStatus: 'CLEAR',
          pepDetails: '해외법인 UBO 확인 필요',
          idVerified: false,
        },
        {
          name: '정부대표',
          sharePercentage: 25,
          isUBO: true,
          pepStatus: 'CLEAR',
          idVerified: true,
          documentUrl: '/uploads/corp/corp-002-ubo-3.pdf',
        },
      ],
      complexStructure: true,
      trustStructure: false,
      verifiedAt: '2025-01-18T11:00:00Z',
      verifiedBy: 'Chainalysis KYT',
      externalReferenceId: 'CHA-UBO-002',
    },
    riskAssessment: {
      industryType: '무역업',
      industryRiskLevel: 'MEDIUM',
      businessLocation: '대한민국 서울',
      locationRiskLevel: 'LOW',
      uboRiskLevel: 'MEDIUM',
      overallRiskLevel: 'MEDIUM',
      riskScore: 54,
      assessedAt: '2025-01-18T12:00:00Z',
      assessedBy: 'MANUAL',
      externalReferenceId: 'CHA-CORP-RISK-002',
    },
    procedures: {
      recommendedDocuments: [
        '사업 계획서',
        '재무제표',
        '거래처 목록',
        '거래 목적 설명서',
      ],
      backgroundCheckRequired: true,
      onSiteInspectionRequired: false,
      executiveInterviewRequired: true,
      businessPlanUrl: '/uploads/corp/corp-002-plan.pdf',
      financialStatementsUrl: '/uploads/corp/corp-002-financial.pdf',
      clientListUrl: '/uploads/corp/corp-002-clients.pdf',
      transactionPurposeUrl: '/uploads/corp/corp-002-purpose.pdf',
      backgroundCheckCompleted: true,
      onSiteInspectionCompleted: false,
      executiveInterviewCompleted: false,
    },
    edd: null,
    eddRequired: false,
    adminReview: {
      status: 'UNDER_REVIEW',
      currentStep: 4,
      reviewedBy: 'admin-005',
      reviewedAt: '2025-01-21T11:00:00Z',
      notes: [
        {
          id: 'corp-note-003',
          createdBy: 'admin-005',
          createdAt: '2025-01-20T10:00:00Z',
          content: 'UBO 구조 복잡. 해외법인 A의 UBO 확인 필요.',
          type: 'WARNING',
        },
        {
          id: 'corp-note-004',
          createdBy: 'admin-005',
          createdAt: '2025-01-21T11:00:00Z',
          content: '배경조사 완료. 임원 인터뷰 진행 예정.',
          type: 'INFO',
        },
      ],
    },
  },

  // 3. 온라인 신청 - HIGH 위험도, 보류
  {
    id: 'corp-003',
    companyId: 'company-003',
    companyName: '인터내셔널캐피탈(주)',
    businessNumber: '345-67-89012',
    createdAt: '2025-01-19T14:30:00Z',
    updatedAt: '2025-01-21T15:00:00Z',
    registrationSource: 'ONLINE',
    corporateInfo: {
      businessLicenseUrl: '/uploads/corp/corp-003-license.pdf',
      corporateRegistryUrl: '/uploads/corp/corp-003-registry.pdf',
      articlesOfIncorporationUrl: '/uploads/corp/corp-003-articles.pdf',
      shareholderListUrl: '/uploads/corp/corp-003-shareholders.pdf',
      representativeIdUrl: '/uploads/corp/corp-003-rep-id.jpg',
      representativeSealCertUrl: '/uploads/corp/corp-003-seal.pdf',
      completedAt: '2025-01-19T15:00:00Z',
    },
    ubo: {
      structure: [
        {
          name: '신대표',
          sharePercentage: 30,
          isUBO: true,
          pepStatus: 'CLEAR',
          idVerified: true,
          documentUrl: '/uploads/corp/corp-003-ubo-1.pdf',
        },
        {
          name: '해외 신탁 B',
          sharePercentage: 45,
          isUBO: true,
          pepStatus: 'CLEAR',
          pepDetails: '신탁 구조 복잡. 실소유자 확인 필요',
          idVerified: false,
        },
        {
          name: '해외법인 C',
          sharePercentage: 25,
          isUBO: true,
          pepStatus: 'CLEAR',
          pepDetails: '고위험 국가 등록 법인',
          idVerified: false,
        },
      ],
      complexStructure: true,
      trustStructure: true,
      verifiedAt: '2025-01-19T16:00:00Z',
      verifiedBy: 'Chainalysis KYT',
      externalReferenceId: 'CHA-UBO-003',
    },
    riskAssessment: {
      industryType: '금융투자업',
      industryRiskLevel: 'HIGH',
      businessLocation: '대한민국 서울',
      locationRiskLevel: 'LOW',
      uboRiskLevel: 'HIGH',
      overallRiskLevel: 'HIGH',
      riskScore: 82,
      assessedAt: '2025-01-19T17:00:00Z',
      assessedBy: 'SYSTEM',
      externalReferenceId: 'CHA-CORP-RISK-003',
    },
    procedures: {
      recommendedDocuments: [
        '사업 계획서',
        '재무제표',
        '거래처 목록',
        '거래 목적 설명서',
        'UBO 상세 정보',
      ],
      backgroundCheckRequired: true,
      onSiteInspectionRequired: true,
      executiveInterviewRequired: true,
      businessPlanUrl: '/uploads/corp/corp-003-plan.pdf',
      financialStatementsUrl: '/uploads/corp/corp-003-financial.pdf',
      backgroundCheckCompleted: false,
      onSiteInspectionCompleted: false,
      executiveInterviewCompleted: false,
    },
    edd: null,
    eddRequired: true,
    adminReview: {
      status: 'ON_HOLD',
      currentStep: 3,
      reviewedBy: 'admin-006',
      reviewedAt: '2025-01-21T15:00:00Z',
      decision: 'HOLD',
      decisionReason: 'UBO 구조 복잡 및 고위험 업종. 추가 서류 및 현장 실사 필요.',
      notes: [
        {
          id: 'corp-note-005',
          createdBy: 'admin-006',
          createdAt: '2025-01-20T14:00:00Z',
          content: 'UBO 구조 매우 복잡. 신탁 및 해외법인 포함.',
          type: 'WARNING',
        },
        {
          id: 'corp-note-006',
          createdBy: 'admin-006',
          createdAt: '2025-01-21T15:00:00Z',
          content: '고위험 업종. 현장 실사 및 임원 인터뷰 진행 예정. 추가 서류 요청.',
          type: 'DECISION',
        },
      ],
    },
  },
];

// ===========================
// 통계 데이터
// ===========================

export const mockOnboardingStats: OnboardingStats = {
  total: 8,
  pending: 1,
  underReview: 2,
  approved: 2,
  rejected: 1,
  onHold: 2,
  byRiskLevel: {
    low: 2,
    medium: 3,
    high: 3,
  },
  byType: {
    individual: 5,
    corporate: 3,
  },
  externalAmlPending: 1, // ind-004는 아직 AML 결과 대기 중
};

// ===========================
// 활동 피드
// ===========================

export const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: 'activity-001',
    applicationId: 'ind-003',
    applicantName: '이민수',
    action: '보류 처리: 고위험 국가 거주자',
    timestamp: '2025-01-21T16:45:00Z',
    performedBy: 'admin-003',
  },
  {
    id: 'activity-002',
    applicationId: 'corp-003',
    applicantName: '인터내셔널캐피탈(주)',
    action: '보류 처리: UBO 구조 복잡',
    timestamp: '2025-01-21T15:00:00Z',
    performedBy: 'admin-006',
  },
  {
    id: 'activity-003',
    applicationId: 'corp-002',
    applicantName: '글로벌트레이딩(주)',
    action: '검토 중: 임원 인터뷰 진행',
    timestamp: '2025-01-21T11:00:00Z',
    performedBy: 'admin-005',
  },
  {
    id: 'activity-004',
    applicationId: 'ind-004',
    applicantName: '최지연',
    action: '신규 신청: 전화 문의 등록',
    timestamp: '2025-01-21T13:20:00Z',
  },
  {
    id: 'activity-005',
    applicationId: 'ind-005',
    applicantName: '정우성',
    action: '거부 처리: PEP 매칭 및 블랙리스트',
    timestamp: '2025-01-20T11:30:00Z',
    performedBy: 'admin-001',
  },
];

// ===========================
// Helper 함수
// ===========================

/**
 * 개인회원 목록 조회
 */
export function getIndividualOnboardings(): IndividualOnboarding[] {
  return mockIndividualOnboardings;
}

/**
 * 법인회원 목록 조회
 */
export function getCorporateOnboardings(): CorporateOnboarding[] {
  return mockCorporateOnboardings;
}

/**
 * 개인회원 상세 조회
 */
export function getIndividualOnboardingById(id: string): IndividualOnboarding | undefined {
  return mockIndividualOnboardings.find((app) => app.id === id);
}

/**
 * 법인회원 상세 조회
 */
export function getCorporateOnboardingById(id: string): CorporateOnboarding | undefined {
  return mockCorporateOnboardings.find((app) => app.id === id);
}

/**
 * 통계 조회
 */
export function getOnboardingStats(): OnboardingStats {
  return mockOnboardingStats;
}

/**
 * 활동 피드 조회
 */
export function getActivityFeed(limit: number = 10): ActivityFeedItem[] {
  return mockActivityFeed.slice(0, limit);
}
