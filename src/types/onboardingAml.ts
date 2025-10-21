/**
 * Onboarding AML Types
 * 온보딩 AML 관리 시스템 타입 정의
 *
 * 외부 AML 솔루션 연동 구조:
 * - 외부 시스템: PEP, 제재리스트, 위험도 평가 (읽기 전용)
 * - 관리자: 외부 결과를 참고하여 승인/거부 결정
 */

// ===========================
// 공통 타입
// ===========================

/**
 * 위험도 레벨
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * 온보딩 상태
 */
export type OnboardingStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ON_HOLD';

/**
 * 신청 경로
 */
export type RegistrationSource = 'ONLINE' | 'OFFLINE_BRANCH' | 'PHONE_INQUIRY' | 'EMAIL_REQUEST';

/**
 * 검토 노트
 */
export interface ReviewNote {
  id: string;
  createdBy: string;      // 관리자명
  createdAt: string;      // ISO 8601 형식
  content: string;
  type: 'INFO' | 'WARNING' | 'DECISION';
}

// ===========================
// 개인회원 온보딩
// ===========================

/**
 * 신분증 타입
 */
export type IdType = 'RESIDENT_CARD' | 'DRIVER_LICENSE' | 'PASSPORT';

/**
 * 주소 증명 타입
 */
export type AddressProofType = 'REGISTRY' | 'UTILITY_BILL';

/**
 * KYC 정보 (1단계: 신원확인)
 * 온라인 신청 또는 관리자 수동 입력
 */
export interface KYCInfo {
  idType: IdType;
  idNumber: string;
  idImageUrl: string;
  addressProofType: AddressProofType;
  addressProofUrl: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  completedAt?: string;   // ISO 8601 형식
}

/**
 * PEP 상태
 */
export type PEPStatus = 'CLEAR' | 'MATCHED' | 'POSSIBLE_MATCH';

/**
 * 제재리스트/블랙리스트 상태
 */
export type ListStatus = 'CLEAR' | 'MATCHED';

/**
 * AML 스크리닝 정보 (2단계: 외부 AML 솔루션 결과)
 * 읽기 전용
 */
export interface AMLScreening {
  pepStatus: PEPStatus;
  pepDetails?: string;              // 매칭된 PEP 정보
  sanctionListStatus: ListStatus;
  sanctionDetails?: string;         // 제재리스트 상세
  blacklistStatus: ListStatus;
  blacklistReason?: string;
  countryRiskLevel: RiskLevel;
  screeningDate: string;            // ISO 8601 형식
  screeningProvider: string;        // 외부 AML 솔루션명
  externalReferenceId?: string;     // 외부 시스템 참조 ID
}

/**
 * 평가 방식
 */
export type AssessmentType = 'SYSTEM' | 'MANUAL';

/**
 * 위험도 평가 (3단계: 외부 AML 솔루션 평가)
 * 읽기 전용
 */
export interface RiskAssessment {
  riskLevel: RiskLevel;
  riskScore?: number;               // 외부 시스템 점수
  factors: string[];                // 위험 요소 목록
  assessedAt: string;               // ISO 8601 형식
  assessedBy: AssessmentType;       // 자동 평가 vs 수동 조정
  externalReferenceId?: string;
}

/**
 * 추가 절차 (4단계: 외부 AML 솔루션 권장)
 * 읽기 전용
 */
export interface AdditionalProcedures {
  residenceProofRequired: boolean;
  incomeProofRequired: boolean;
  videoInterviewRequired: boolean;
  eddRequired: boolean;             // Enhanced Due Diligence
  supervisorApprovalRequired: boolean;
  recommendedActions: string[];     // 외부 시스템 권장 액션
}

/**
 * 관리자 결정
 */
export type AdminDecision = 'APPROVE' | 'REJECT' | 'HOLD';

/**
 * 온보딩 단계
 */
export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

/**
 * 관리자 검토 정보
 * 관리자가 직접 수정하는 영역
 */
export interface AdminReview {
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  reviewedBy?: string;              // 관리자 ID
  reviewedAt?: string;              // ISO 8601 형식
  decision?: AdminDecision;
  decisionReason?: string;          // 승인/거부 사유
  notes: ReviewNote[];              // 검토 노트
}

/**
 * 개인회원 온보딩 신청
 */
export interface IndividualOnboarding {
  // 기본 정보
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;                // ISO 8601 형식
  updatedAt: string;                // ISO 8601 형식

  // 신청 경로 정보
  registrationSource: RegistrationSource;
  registrationNote?: string;        // 오프라인 등록 시 사유

  // 1단계: KYC (신원확인)
  kyc: KYCInfo;

  // 2단계: AML 스크리닝 (외부 시스템 결과, 읽기 전용)
  aml: AMLScreening | null;         // null: 아직 스크리닝 전

  // 3단계: 위험도 등급 (외부 시스템 평가, 읽기 전용)
  riskAssessment: RiskAssessment | null;  // null: 아직 평가 전

  // 4단계: 등급별 추가 절차 (외부 시스템 권장, 읽기 전용)
  additionalProcedures: AdditionalProcedures | null;

  // EDD (Enhanced Due Diligence) 정보
  edd: Omit<IndividualEDDSubmission, 'applicationId'> | null;    // null: EDD 불필요 또는 미제출
  eddRequired: boolean;             // EDD 필요 여부 (HIGH 리스크인 경우 true)
  eddRequestedAt?: string;          // EDD 요청 시각 (ISO 8601)
  eddSubmittedAt?: string;          // EDD 제출 시각 (ISO 8601)

  // 관리자 작업 영역
  adminReview: AdminReview;
}

// ===========================
// 법인회원 온보딩
// ===========================

/**
 * 법인 기본정보 (1단계)
 * 온라인 신청 또는 관리자 수동 입력
 */
export interface CorporateInfo {
  businessLicenseUrl: string;
  corporateRegistryUrl: string;
  articlesOfIncorporationUrl: string;
  shareholderListUrl: string;
  representativeIdUrl: string;
  representativeSealCertUrl: string;
  completedAt?: string;             // ISO 8601 형식
}

/**
 * UBO (실질적 소유자) 구조
 */
export interface UBOStructure {
  name: string;
  sharePercentage: number;
  isUBO: boolean;                   // 25% 이상 지분
  pepStatus: ListStatus;            // 외부 시스템 결과
  pepDetails?: string;
  idVerified: boolean;              // 외부 시스템 검증 여부
  documentUrl?: string;
}

/**
 * UBO 확인 정보 (2단계: 외부 AML 솔루션 검증)
 * 읽기 전용
 */
export interface UBOVerification {
  structure: UBOStructure[];
  complexStructure: boolean;        // 외부 시스템 분석 결과
  trustStructure: boolean;
  verifiedAt?: string;              // ISO 8601 형식
  verifiedBy?: string;              // 외부 시스템 참조
  externalReferenceId?: string;
}

/**
 * 법인 위험도 평가 (3단계: 외부 AML 솔루션 평가)
 * 읽기 전용
 */
export interface CorporateRiskAssessment {
  industryType: string;
  industryRiskLevel: RiskLevel;
  businessLocation: string;
  locationRiskLevel: RiskLevel;
  uboRiskLevel: RiskLevel;
  overallRiskLevel: RiskLevel;
  riskScore?: number;
  assessedAt: string;               // ISO 8601 형식
  assessedBy: AssessmentType;
  externalReferenceId?: string;
}

/**
 * 법인 절차 (4단계)
 * 외부 시스템 권장 + 관리자 체크
 */
export interface CorporateProcedures {
  // 외부 시스템 권장 (읽기 전용)
  recommendedDocuments: string[];
  backgroundCheckRequired: boolean;
  onSiteInspectionRequired: boolean;
  executiveInterviewRequired: boolean;

  // 관리자 진행 상황 체크
  businessPlanUrl?: string;
  financialStatementsUrl?: string;
  clientListUrl?: string;
  transactionPurposeUrl?: string;
  backgroundCheckCompleted: boolean;
  onSiteInspectionCompleted: boolean;
  executiveInterviewCompleted: boolean;
}

/**
 * 법인회원 온보딩 신청
 */
export interface CorporateOnboarding {
  // 기본 정보
  id: string;
  companyId: string;
  companyName: string;
  businessNumber: string;
  createdAt: string;                // ISO 8601 형식
  updatedAt: string;                // ISO 8601 형식

  // 신청 경로 정보
  registrationSource: RegistrationSource;
  registrationNote?: string;

  // 1단계: 법인 기본정보 확인
  corporateInfo: CorporateInfo;

  // 2단계: UBO 확인 (외부 시스템 검증, 읽기 전용)
  ubo: UBOVerification | null;

  // 3단계: 법인 위험도 평가 (외부 시스템, 읽기 전용)
  riskAssessment: CorporateRiskAssessment | null;

  // 4단계: 등급별 절차 (외부 시스템 권장 + 관리자 체크)
  procedures: CorporateProcedures;

  // EDD (Enhanced Due Diligence) 정보
  edd: Omit<CorporateEDDSubmission, 'applicationId'> | null;     // null: EDD 불필요 또는 미제출
  eddRequired: boolean;             // EDD 필요 여부 (HIGH 리스크인 경우 true)
  eddRequestedAt?: string;          // EDD 요청 시각 (ISO 8601)
  eddSubmittedAt?: string;          // EDD 제출 시각 (ISO 8601)

  // 관리자 작업 영역
  adminReview: AdminReview;
}

// ===========================
// 통계 및 대시보드
// ===========================

/**
 * 온보딩 통계
 */
export interface OnboardingStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  onHold: number;
  byRiskLevel: {
    low: number;
    medium: number;
    high: number;
  };
  byType: {
    individual: number;
    corporate: number;
  };
  externalAmlPending: number;       // 외부 AML 결과 대기 중
  edd: {
    required: number;                // EDD가 필요한 전체 건수
    pending: number;                 // EDD 제출 대기 중인 건수
    submitted: number;               // EDD 제출 완료 건수
  };
}

/**
 * 활동 피드 아이템
 */
export interface ActivityFeedItem {
  id: string;
  applicationId: string;
  applicantName: string;
  action: string;
  timestamp: string;                // ISO 8601 형식
  performedBy?: string;
}

// ===========================
// EDD (Enhanced Due Diligence) 제출 타입
// ===========================

/**
 * 개인회원 EDD 제출 요청
 * HIGH 리스크 고객에 대한 추가 정보 수집
 */
export interface IndividualEDDSubmission {
  applicationId: string;          // 기존 온보딩 신청 ID
  incomeProofUrl?: string;        // 소득 증빙 (급여명세서, 사업소득 증빙 등)
  residenceProofUrl?: string;     // 거주 증빙 (등기부등본, 임대차계약서 등)
  fundSourceUrl?: string;         // 자금 출처 증빙
  videoInterviewUrl?: string;     // 화상 인터뷰 녹화 영상
  additionalDocumentUrls?: string[]; // 기타 추가 서류
  submittedAt: string;            // ISO 8601 형식
}

/**
 * 법인회원 EDD 제출 요청
 * HIGH 리스크 법인에 대한 추가 정보 수집
 */
export interface CorporateEDDSubmission {
  applicationId: string;          // 기존 온보딩 신청 ID
  businessPlanUrl?: string;       // 사업 계획서
  financialStatementsUrl?: string; // 재무제표 (최근 2-3년)
  clientListUrl?: string;         // 주요 거래처 목록

  // UBO 상세 정보 (신분증 정보 포함)
  detailedUboInfo?: {
    uboId: string;                // 기존 UBO 참조 ID (initialUboInfo의 name과 매칭)
    idNumber: string;             // EDD에서 추가: 신분증 번호
    idImageUrl: string;           // EDD에서 추가: 신분증 이미지
    fundSourceUrl?: string;       // 자금 출처 증빙
  }[];

  backgroundCheckUrl?: string;    // 배경 조사 결과
  onSiteInspectionUrl?: string;   // 현장 실사 보고서
  executiveInterviewUrl?: string; // 경영진 인터뷰 녹화
  additionalDocumentUrls?: string[]; // 기타 추가 서류
  submittedAt: string;            // ISO 8601 형식
}

// Type aliases for compatibility
export type IndividualEDD = IndividualEDDSubmission;
export type CorporateEDD = CorporateEDDSubmission;

// ===========================
// API 요청/응답 타입
// ===========================

/**
 * 개인회원 수동 등록 요청
 */
export interface ManualRegisterIndividualRequest {
  userName: string;
  userEmail: string;
  kyc: Omit<KYCInfo, 'completedAt'>;
  registrationSource: Exclude<RegistrationSource, 'ONLINE'>;
  registrationNote?: string;
}

/**
 * 법인회원 수동 등록 요청 (CDD 단계)
 * UBO 기본 정보만 수집 (이름, 지분율, 관계)
 * UBO 신분증 정보는 EDD 단계에서 수집
 */
export interface ManualRegisterCorporateRequest {
  companyName: string;
  businessNumber: string;
  corporateInfo: Omit<CorporateInfo, 'completedAt'>;

  // 대표자 KYC (Phase 6 수정: 추가됨)
  representativeKyc: Omit<KYCInfo, 'completedAt'>;

  // 초기 UBO 정보 (CDD: 기본 정보만, Phase 6 수정: 추가됨)
  initialUboInfo?: {
    name: string;
    sharePercentage: number;
    relationship: string;       // 대표이사, 주주 등
    // idNumber, idImageUrl 제거 - EDD 단계에서 수집
  }[];

  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  registrationSource: Exclude<RegistrationSource, 'ONLINE'>;
  registrationNote?: string;
}

/**
 * 승인 요청
 */
export interface ApprovalRequest {
  decisionReason: string;
  reviewNote?: string;
}

/**
 * 거부 요청
 */
export interface RejectionRequest {
  decisionReason: string;
  reviewNote?: string;
}

/**
 * 보류 요청
 */
export interface OnHoldRequest {
  reason: string;
  requiredDocuments?: string[];
}

/**
 * 검토 노트 추가 요청
 */
export interface AddNoteRequest {
  content: string;
  type: 'INFO' | 'WARNING' | 'DECISION';
}

/**
 * 목록 조회 쿼리
 */
export interface OnboardingListQuery {
  page?: number;
  limit?: number;
  status?: OnboardingStatus;
  riskLevel?: RiskLevel;
  registrationSource?: RegistrationSource;
  search?: string;
}

/**
 * 목록 조회 응답
 */
export interface OnboardingListResponse<T> {
  applications: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ===========================
// 모니터링 (Phase 6)
// ===========================

/**
 * 갱신 예정 항목
 */
export interface RenewalDueItem {
  id: string;
  applicantName: string;
  memberType: 'individual' | 'corporate';
  approvedAt: string;              // ISO 8601
  nextRenewalDue: string;           // ISO 8601
  daysUntilRenewal: number;
  currentRiskLevel: RiskLevel;
  lastAssessmentDate: string;       // ISO 8601
}

/**
 * 재평가 큐 항목
 */
export interface ReassessmentQueueItem {
  id: string;
  applicantName: string;
  memberType: 'individual' | 'corporate';
  currentRiskLevel: RiskLevel;
  reassessmentReason: string;
  requestedAt: string;              // ISO 8601
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  externalSystemStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
}

/**
 * 재검증 요청 응답
 */
export interface RescanRequest {
  requestId: string;
  message: string;
  estimatedCompletionTime?: string; // ISO 8601
}
