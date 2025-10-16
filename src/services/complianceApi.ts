/**
 * Compliance API Service
 *
 * Handles AML screening, Travel Rule compliance, suspicious transaction reporting,
 * and regulatory compliance monitoring
 */

import {
  AMLCheck,
  TravelRuleCheckAPI as TravelRuleCheck,
  ComplianceReport,
  ReportStatus,
  SuspiciousTransaction,
  STRReport,
  BlacklistAddress,
  RiskAssessment
} from '@/types/compliance';
import { mockDb } from './mockDatabase';

// Simulated API delays
const API_DELAY = {
  FAST: 200,
  MEDIUM: 500,
  SLOW: 1000,
  VERY_SLOW: 2000 // For complex AML operations
} as const;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ComplianceApiService {
  private static instance: ComplianceApiService;

  private constructor() {}

  public static getInstance(): ComplianceApiService {
    if (!ComplianceApiService.instance) {
      ComplianceApiService.instance = new ComplianceApiService();
    }
    return ComplianceApiService.instance;
  }

  // AML Screening Operations
  async performAMLScreening(transactionData: {
    fromAddress: string;
    toAddress: string;
    amount: string;
    currency: string;
    transactionHash?: string;
  }): Promise<AMLCheck> {
    await delay(API_DELAY.VERY_SLOW);

    // Simulate AML checks
    const riskScore = this.calculateRiskScore(transactionData.fromAddress, transactionData.amount);
    const isBlacklisted = this.checkBlacklist(transactionData.fromAddress);
    const isSanctioned = this.checkSanctionsList(transactionData.fromAddress);

    const amlCheck: AMLCheck = {
      id: `aml-${Date.now()}`,
      transactionHash: transactionData.transactionHash || '',
      fromAddress: transactionData.fromAddress,
      toAddress: transactionData.toAddress,
      amount: transactionData.amount,
      currency: transactionData.currency,
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      checks: {
        blacklistCheck: !isBlacklisted,
        sanctionsListCheck: !isSanctioned,
        addressType: this.getAddressType(transactionData.fromAddress),
        geographicRisk: this.getGeographicRisk(),
        velocityCheck: this.performVelocityCheck(transactionData.fromAddress, transactionData.amount),
        patternAnalysis: this.performPatternAnalysis(transactionData.fromAddress)
      },
      status: this.getAMLStatus(riskScore, isBlacklisted, isSanctioned),
      manualReview: riskScore >= 70 || isBlacklisted || isSanctioned,
      reviewNotes: riskScore >= 70 ? 'High risk score requires manual review' : undefined,
      screenedAt: new Date().toISOString(),
      screenedBy: 'system'
    };

    return amlCheck;
  }

  async getAMLChecks(filters?: {
    status?: AMLCheck['status'];
    riskLevel?: AMLCheck['riskLevel'];
    manualReview?: boolean;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    checks: AMLCheck[];
    totalCount: number;
    hasMore: boolean;
  }> {
    await delay(API_DELAY.MEDIUM);

    // Mock AML checks data
    const mockChecks: AMLCheck[] = [
      {
        id: 'aml-001',
        transactionHash: '0xabc123...',
        fromAddress: '0x742d35Cc8B927b8C7d4B5F22d0a3B9E6D4c8A2f1',
        toAddress: '0x456def...',
        amount: '50000',
        currency: 'USDT',
        riskScore: 85,
        riskLevel: 'high',
        checks: {
          blacklistCheck: true,
          sanctionsListCheck: true,
          addressType: 'exchange',
          geographicRisk: 'medium',
          velocityCheck: false,
          patternAnalysis: 'suspicious'
        },
        status: 'flagged',
        manualReview: true,
        reviewNotes: 'High frequency transactions from same address',
        screenedAt: new Date(Date.now() - 3600000).toISOString(),
        screenedBy: 'system'
      },
      {
        id: 'aml-002',
        transactionHash: '0xdef456...',
        fromAddress: '0x123abc...',
        toAddress: '0x789ghi...',
        amount: '10000',
        currency: 'BTC',
        riskScore: 25,
        riskLevel: 'low',
        checks: {
          blacklistCheck: true,
          sanctionsListCheck: true,
          addressType: 'personal',
          geographicRisk: 'low',
          velocityCheck: true,
          patternAnalysis: 'normal'
        },
        status: 'approved',
        manualReview: false,
        screenedAt: new Date(Date.now() - 7200000).toISOString(),
        screenedBy: 'system'
      }
    ];

    // Apply filters
    let filteredChecks = mockChecks;

    if (filters?.status) {
      filteredChecks = filteredChecks.filter(check => check.status === filters.status);
    }

    if (filters?.riskLevel) {
      filteredChecks = filteredChecks.filter(check => check.riskLevel === filters.riskLevel);
    }

    if (filters?.manualReview !== undefined) {
      filteredChecks = filteredChecks.filter(check => check.manualReview === filters.manualReview);
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return {
      checks: filteredChecks.slice(offset, offset + limit),
      totalCount: filteredChecks.length,
      hasMore: offset + limit < filteredChecks.length
    };
  }

  async updateAMLCheckStatus(
    checkId: string,
    status: AMLCheck['status'],
    reviewNotes?: string,
    reviewedBy?: string
  ): Promise<{ success: boolean }> {
    await delay(API_DELAY.MEDIUM);

    // In real implementation, would update the AML check in database
    console.log(`Updating AML check ${checkId} to ${status}`, { reviewNotes, reviewedBy });

    return { success: true };
  }

  // Travel Rule Operations
  async checkTravelRule(transactionData: {
    amount: string;
    amountInKRW: string;
    fromAddress: string;
    toAddress: string;
    originatorInfo?: any;
  }): Promise<TravelRuleCheck> {
    await delay(API_DELAY.SLOW);

    const amountKRW = parseFloat(transactionData.amountInKRW);
    const threshold = 1000000; // ₩1M
    const isExceeding = amountKRW >= threshold;

    const travelRuleCheck: TravelRuleCheck = {
      id: `travel-${Date.now()}`,
      transactionId: `tx-${Date.now()}`,
      amount: transactionData.amount,
      amountInKRW: transactionData.amountInKRW,
      threshold: threshold.toString(),
      isExceeding,
      fromAddress: transactionData.fromAddress,
      toAddress: transactionData.toAddress,
      requiresVASPInfo: isExceeding,
      originatorInfo: transactionData.originatorInfo || undefined,
      beneficiaryInfo: undefined,
      complianceStatus: this.getTravelRuleStatus(isExceeding, transactionData.originatorInfo),
      requiresReturn: this.shouldReturnFunds(isExceeding, transactionData.originatorInfo),
      returnReason: this.getReturnReason(isExceeding, transactionData.originatorInfo),
      checkedAt: new Date().toISOString(),
      checkedBy: 'system'
    };

    return travelRuleCheck;
  }

  async getTravelRuleChecks(filters?: {
    complianceStatus?: string;
    requiresReturn?: boolean;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    checks: TravelRuleCheck[];
    totalCount: number;
    hasMore: boolean;
  }> {
    await delay(API_DELAY.MEDIUM);

    // Mock Travel Rule checks
    const mockChecks: TravelRuleCheck[] = [
      {
        id: 'travel-001',
        transactionId: 'tx-001',
        amount: '1500000',
        amountInKRW: '1950000000',
        threshold: '1000000',
        isExceeding: true,
        fromAddress: '0xabc123...',
        toAddress: '0xdef456...',
        requiresVASPInfo: true,
        originatorInfo: null,
        beneficiaryInfo: undefined,
        complianceStatus: 'violation',
        requiresReturn: true,
        returnReason: 'travel_rule_violation',
        checkedAt: new Date(Date.now() - 3600000).toISOString(),
        checkedBy: 'system'
      }
    ];

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return {
      checks: mockChecks.slice(offset, offset + limit),
      totalCount: mockChecks.length,
      hasMore: offset + limit < mockChecks.length
    };
  }

  // Suspicious Transaction Reporting
  async getSuspiciousTransactions(filters?: {
    status?: SuspiciousTransaction['status'];
    reportStatus?: SuspiciousTransaction['reportStatus'];
    limit?: number;
    offset?: number;
  }): Promise<{
    transactions: SuspiciousTransaction[];
    totalCount: number;
    hasMore: boolean;
  }> {
    await delay(API_DELAY.MEDIUM);

    const suspicious = mockDb.getSuspiciousTransactions();
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return {
      transactions: suspicious.slice(offset, offset + limit),
      totalCount: suspicious.length,
      hasMore: offset + limit < suspicious.length
    };
  }

  async createSTRReport(
    transactionId: string,
    reason: string,
    description: string
  ): Promise<STRReport> {
    await delay(API_DELAY.SLOW);

    const strReport: STRReport = {
      id: `str-${Date.now()}`,
      transactionId,
      reportType: 'suspicious_transaction',
      reason,
      description,
      reportedAmount: '1000000',
      reportedCurrency: 'KRW',
      involvedAddresses: ['0xabc123...', '0xdef456...'],
      regulatoryBody: 'KoFIU', // Korea Financial Intelligence Unit
      reportStatus: 'draft',
      submittedAt: undefined,
      submittedBy: undefined,
      createdAt: new Date().toISOString(),
      createdBy: 'compliance@custody.com',
      attachments: []
    };

    return strReport;
  }

  async submitSTRReport(reportId: string): Promise<{ success: boolean; submissionId: string }> {
    await delay(API_DELAY.VERY_SLOW);

    const submissionId = `sub-${Date.now()}`;

    // In real implementation, would submit to regulatory authority
    console.log(`Submitting STR report ${reportId} to KoFIU`);

    return {
      success: true,
      submissionId
    };
  }

  // Blacklist and Address Management
  async getBlacklistedAddresses(filters?: {
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    source?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    addresses: BlacklistAddress[];
    totalCount: number;
    hasMore: boolean;
  }> {
    await delay(API_DELAY.FAST);

    const mockAddresses: BlacklistAddress[] = [
      {
        id: 'blacklist-001',
        address: '0x1234567890abcdef...',
        riskLevel: 'high',
        reason: 'Linked to ransomware attacks',
        source: 'Chainalysis',
        addedAt: new Date(Date.now() - 86400000).toISOString(),
        addedBy: 'compliance@custody.com',
        isActive: true
      },
      {
        id: 'blacklist-002',
        address: 'bc1qsuspicious123...',
        riskLevel: 'critical',
        reason: 'Sanctions list - OFAC',
        source: 'OFAC',
        addedAt: new Date(Date.now() - 172800000).toISOString(),
        addedBy: 'system',
        isActive: true
      }
    ];

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return {
      addresses: mockAddresses.slice(offset, offset + limit),
      totalCount: mockAddresses.length,
      hasMore: offset + limit < mockAddresses.length
    };
  }

  async addBlacklistAddress(addressData: {
    address: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    source: string;
  }): Promise<BlacklistAddress> {
    await delay(API_DELAY.MEDIUM);

    const blacklistAddress: BlacklistAddress = {
      id: `blacklist-${Date.now()}`,
      ...addressData,
      addedAt: new Date().toISOString(),
      addedBy: 'admin@custody.com',
      isActive: true
    };

    return blacklistAddress;
  }

  // Compliance Reports
  async getComplianceReports(type?: ComplianceReport['type']): Promise<ComplianceReport[]> {
    await delay(API_DELAY.MEDIUM);

    let reports = mockDb.getComplianceReports();

    if (type) {
      reports = reports.filter(report => report.type === type);
    }

    return reports;
  }

  async generateComplianceReport(
    reportType: ComplianceReport['type'],
    period: { startDate: string; endDate: string }
  ): Promise<ComplianceReport> {
    await delay(API_DELAY.VERY_SLOW);

    const reportPeriod = {
      start: new Date(period.startDate),
      end: new Date(period.endDate),
      timezone: 'Asia/Seoul'
    };

    const report: ComplianceReport = {
      id: `report-${Date.now()}`,
      type: reportType,
      period: reportPeriod,
      generatedAt: new Date(),
      generatedBy: 'compliance@custody.com',
      status: ReportStatus.COMPLETED,
      data: {
        summary: {
          totalTransactions: Math.floor(Math.random() * 10000) + 1000,
          totalVolume: `${(Math.random() * 1000000 + 100000).toFixed(0)}`,
          amlChecks: {
            total: Math.floor(Math.random() * 1000) + 500,
            approved: Math.floor(Math.random() * 800) + 400,
            flagged: Math.floor(Math.random() * 100) + 50,
            rejected: Math.floor(Math.random() * 50) + 10,
            autoProcessed: Math.floor(Math.random() * 700) + 300
          },
          travelRuleChecks: {
            total: Math.floor(Math.random() * 200) + 100,
            compliant: Math.floor(Math.random() * 180) + 80,
            violations: Math.floor(Math.random() * 20) + 5,
            exempted: Math.floor(Math.random() * 10) + 2
          },
          riskDistribution: {
            low: Math.floor(Math.random() * 500) + 200,
            medium: Math.floor(Math.random() * 200) + 50,
            high: Math.floor(Math.random() * 50) + 10,
            critical: Math.floor(Math.random() * 10) + 2
          }
        },
        transactions: [],
        alerts: [],
        returns: {
          totalReturns: Math.floor(Math.random() * 20) + 5,
          totalReturnAmount: `${(Math.random() * 10000 + 1000).toFixed(0)}`,
          returnReasons: {
            member_unregistered_address: Math.floor(Math.random() * 5) + 1,
            no_permission: Math.floor(Math.random() * 3) + 1,
            daily_limit_exceeded: Math.floor(Math.random() * 4) + 1,
            travel_rule_violation: Math.floor(Math.random() * 2) + 1,
            aml_flag: Math.floor(Math.random() * 3) + 1,
            sanctions_match: Math.floor(Math.random() * 2) + 0,
            high_risk_transaction: Math.floor(Math.random() * 2) + 1,
            technical_error: Math.floor(Math.random() * 1) + 0
          },
          averageProcessingTime: Math.floor(Math.random() * 30) + 10, // minutes
          successRate: 85 + Math.random() * 10 // 85-95%
        },
        recommendations: ['정기적인 모니터링 유지', '리스크 평가 개선']
      },
      fileUrl: undefined
    };

    return report;
  }

  // Risk Assessment
  async performRiskAssessment(entityData: {
    type: 'member' | 'transaction' | 'address';
    entityId: string;
    data: any;
  }): Promise<RiskAssessment> {
    await delay(API_DELAY.SLOW);

    const riskScore = Math.floor(Math.random() * 100);
    const riskLevel = this.getRiskLevel(riskScore);

    const assessment: RiskAssessment = {
      id: `risk-${Date.now()}`,
      entityType: entityData.type,
      entityId: entityData.entityId,
      riskScore,
      riskLevel,
      factors: [
        {
          factor: 'transaction_volume',
          score: Math.floor(Math.random() * 10),
          weight: 0.3,
          description: '거래량 기반 위험도'
        },
        {
          factor: 'geographic_location',
          score: Math.floor(Math.random() * 10),
          weight: 0.2,
          description: '지리적 위험도'
        },
        {
          factor: 'business_type',
          score: Math.floor(Math.random() * 10),
          weight: 0.3,
          description: '사업 유형 위험도'
        },
        {
          factor: 'compliance_history',
          score: Math.floor(Math.random() * 10),
          weight: 0.2,
          description: '컴플라이언스 이력'
        }
      ],
      recommendations: this.getRecommendations(riskLevel),
      assessedAt: new Date().toISOString(),
      assessedBy: 'compliance_engine',
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days
      notes: `Risk assessment for ${entityData.type} ${entityData.entityId}`
    };

    return assessment;
  }

  // Utility Methods
  private calculateRiskScore(address: string, amount: string): number {
    // Mock risk calculation
    const amountNum = parseFloat(amount);
    let riskScore = 20; // Base score

    // Amount-based risk
    if (amountNum > 1000000) riskScore += 30;
    else if (amountNum > 100000) riskScore += 20;
    else if (amountNum > 10000) riskScore += 10;

    // Address-based risk (mock)
    if (address.includes('suspicious')) riskScore += 40;
    if (address.includes('exchange')) riskScore += 15;

    return Math.min(100, riskScore);
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private checkBlacklist(address: string): boolean {
    // Mock blacklist check
    return address.includes('blacklist') || address.includes('suspicious');
  }

  private checkSanctionsList(address: string): boolean {
    // Mock sanctions check
    return address.includes('sanction') || address.includes('ofac');
  }

  private getAddressType(address: string): 'personal' | 'exchange' | 'mixer' | 'unknown' {
    if (address.includes('exchange')) return 'exchange';
    if (address.includes('mixer')) return 'mixer';
    if (address.length > 30) return 'personal';
    return 'unknown';
  }

  private getGeographicRisk(): 'low' | 'medium' | 'high' {
    const risks = ['low', 'medium', 'high'] as const;
    return risks[Math.floor(Math.random() * risks.length)];
  }

  private performVelocityCheck(address: string, amount: string): boolean {
    // Mock velocity check - returns true if velocity is normal
    return Math.random() > 0.3;
  }

  private performPatternAnalysis(address: string): 'normal' | 'suspicious' | 'high_risk' {
    const patterns = ['normal', 'normal', 'normal', 'suspicious', 'high_risk'] as const;
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private getAMLStatus(riskScore: number, isBlacklisted: boolean, isSanctioned: boolean): AMLCheck['status'] {
    if (isBlacklisted || isSanctioned) return 'rejected';
    if (riskScore >= 70) return 'flagged';
    if (riskScore >= 40) return 'under_review';
    return 'approved';
  }

  private getTravelRuleStatus(isExceeding: boolean, originatorInfo: any): string {
    if (!isExceeding) return 'compliant';
    if (isExceeding && !originatorInfo) return 'violation';
    return 'compliant';
  }

  private shouldReturnFunds(isExceeding: boolean, originatorInfo: any): boolean {
    return isExceeding && !originatorInfo;
  }

  private getReturnReason(isExceeding: boolean, originatorInfo: any): string | undefined {
    if (isExceeding && !originatorInfo) {
      return 'travel_rule_violation';
    }
    return undefined;
  }

  private getRecommendations(riskLevel: RiskAssessment['riskLevel']): string[] {
    const recommendations = {
      low: ['정기적인 모니터링 유지'],
      medium: ['거래 패턴 모니터링 강화', '월 1회 검토'],
      high: ['일일 모니터링', '거래 한도 검토', '추가 문서 요청'],
      critical: ['거래 중단', '즉시 조사', '규제 당국 보고 검토']
    };

    return recommendations[riskLevel];
  }
}

export const complianceApi = ComplianceApiService.getInstance();