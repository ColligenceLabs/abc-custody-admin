import { getMemberName, getMemberIdNumber } from '@/types/member';
import { MemberType } from '@/data/types/individualOnboarding';
/**
 * Member API Service
 *
 * Handles member company management, onboarding, assets, and address monitoring
 */

import {
  Member,
  OnboardingApplication as MemberOnboarding,
  MemberAsset,
  RegisteredAddress,
  CreateMemberRequest,
  UpdateMemberRequest,
  OnboardingApprovalRequest,
  OnboardingStatus,
  RiskLevel,
  MemberStatus,
  ContactRole,
  ContactStatus
} from '@/types/member';
import { mockDb } from './mockDatabase';

// Extended interface for API responses
interface MemberAssetInfo extends Omit<MemberAsset, 'balanceInKRW' | 'assetName' | 'totalDeposited' | 'totalWithdrawn' | 'lastActivityAt' | 'createdAt' | 'transactionCount'> {
  valueInKRW: string;
  transactionCount24h: number;
  volume24h: string;
  lastActivityAt: string | null;
  createdAt: string;
}

// Simulated API delays
const API_DELAY = {
  FAST: 200,
  MEDIUM: 500,
  SLOW: 1000
} as const;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MemberApiService {
  private static instance: MemberApiService;

  private constructor() {}

  public static getInstance(): MemberApiService {
    if (!MemberApiService.instance) {
      MemberApiService.instance = new MemberApiService();
    }
    return MemberApiService.instance;
  }

  // Member Management
  async getMembers(filters?: {
    status?: Member['status'];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    members: Member[];
    totalCount: number;
    hasMore: boolean;
  }> {
    await delay(API_DELAY.MEDIUM);

    let members = mockDb.getMembers();

    // Apply filters
    if (filters?.status) {
      members = members.filter(member => member.status === filters.status);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      members = members.filter(member =>
        getMemberName(member).toLowerCase().includes(searchLower) ||
        getMemberIdNumber(member).includes(filters.search!) ||
        member.contacts.some(contact =>
          contact.name.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower)
        )
      );
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return {
      members: members.slice(offset, offset + limit),
      totalCount: members.length,
      hasMore: offset + limit < members.length
    };
  }

  async getMemberById(memberId: string): Promise<Member> {
    await delay(API_DELAY.FAST);

    const member = mockDb.getMemberById(memberId);
    if (!member) {
      throw new Error(`Member not found: ${memberId}`);
    }

    return member;
  }

  async createMember(memberData: CreateMemberRequest): Promise<Member> {
    await delay(API_DELAY.SLOW);

    // Generate deposit addresses for initial assets
    const generatedDepositAddresses: MemberAsset[] = memberData.initialAssets?.map(asset => ({
      id: `${Date.now()}-${asset.symbol}`,
      memberId: '', // Will be set after member creation
      assetSymbol: asset.symbol,
      assetName: this.getAssetName(asset.symbol),
      depositAddress: this.generateDepositAddress(asset.symbol),
      balance: '0',
      balanceInKRW: '0',
      isActive: true,
      createdAt: new Date(),
      totalDeposited: '0',
      totalWithdrawn: '0',
      transactionCount: 0
    })) || [];

    // Create member with proper MemberAsset format
    const memberToCreate = {
      ...memberData,
      generatedDepositAddresses,
      onboardingStatus: OnboardingStatus.APPROVED,
      registeredAddresses: [],
      complianceProfile: {
        riskLevel: RiskLevel.LOW,
        amlScore: 85,
        sanctionsScreening: true,
        pepStatus: false,
        lastKycUpdate: new Date(),
        nextKycReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        complianceNotes: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newMember = mockDb.createMember(memberToCreate);

    // Update member IDs in generated addresses
    if (newMember.generatedDepositAddresses) {
      newMember.generatedDepositAddresses.forEach(asset => {
        if ('memberId' in asset) {
          (asset as MemberAsset).memberId = newMember.id;
        }
      });
    }

    return newMember;
  }

  async updateMember(memberId: string, updates: UpdateMemberRequest): Promise<Member> {
    await delay(API_DELAY.MEDIUM);

    // Get the current member to merge updates properly
    const currentMember = mockDb.getMemberById(memberId);
    if (!currentMember) {
      throw new Error(`Member not found: ${memberId}`);
    }

    // Merge updates carefully, especially for nested objects
    const memberUpdates: Partial<Member> = {
      updatedAt: new Date()
    };

    // Copy primitive fields
    if (updates.status !== undefined) memberUpdates.status = updates.status;

    // Handle contractInfo updates by merging with existing
    if (updates.contractInfo && currentMember.contractInfo) {
      memberUpdates.contractInfo = {
        ...currentMember.contractInfo,
        ...updates.contractInfo
      };
    }

    // Handle approvalSettings updates by merging with existing
    if (updates.approvalSettings && currentMember.approvalSettings) {
      memberUpdates.approvalSettings = {
        ...currentMember.approvalSettings,
        ...updates.approvalSettings
      };
    }

    // Handle notificationSettings updates by merging with existing
    if (updates.notificationSettings && currentMember.notificationSettings) {
      memberUpdates.notificationSettings = {
        ...currentMember.notificationSettings,
        ...updates.notificationSettings
      };
    }

    const updatedMember = mockDb.updateMember(memberId, memberUpdates);
    if (!updatedMember) {
      throw new Error(`Failed to update member: ${memberId}`);
    }

    return updatedMember;
  }

  async suspendMember(memberId: string, reason: string): Promise<{ success: boolean }> {
    await delay(API_DELAY.MEDIUM);

    const updatedMember = mockDb.updateMember(memberId, {
      status: MemberStatus.SUSPENDED,
      updatedAt: new Date()
    });
    if (!updatedMember) {
      throw new Error(`Member not found: ${memberId}`);
    }

    return { success: true };
  }

  async reactivateMember(memberId: string): Promise<{ success: boolean }> {
    await delay(API_DELAY.MEDIUM);

    const updatedMember = mockDb.updateMember(memberId, {
      status: MemberStatus.ACTIVE,
      updatedAt: new Date()
    });
    if (!updatedMember) {
      throw new Error(`Member not found: ${memberId}`);
    }

    return { success: true };
  }

  // Member Asset Management
  async getMemberAssets(memberId: string): Promise<MemberAssetInfo[]> {
    await delay(API_DELAY.FAST);

    const member = mockDb.getMemberById(memberId);
    if (!member) {
      throw new Error(`Member not found: ${memberId}`);
    }

    // Convert generated deposit addresses to MemberAssetInfo format
    return member.generatedDepositAddresses.map(addr => {
      // Handle both old simplified format and new MemberAsset format
      const assetSymbol = 'assetSymbol' in addr ? addr.assetSymbol : (addr as any).asset;

      return {
        id: `${memberId}-${assetSymbol}`,
        memberId,
        assetSymbol,
        depositAddress: addr.depositAddress,
        balance: addr.balance,
        valueInKRW: this.calculateValueInKRW(addr.balance, assetSymbol),
        isActive: addr.isActive,
        transactionCount24h: this.getMockTransactionCount(),
        volume24h: this.getMockVolume24h(),
        lastActivityAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
      };
    });
  }

  async addMemberAsset(memberId: string, assetSymbol: string): Promise<MemberAssetInfo> {
    await delay(API_DELAY.MEDIUM);

    const member = mockDb.getMemberById(memberId);
    if (!member) {
      throw new Error(`Member not found: ${memberId}`);
    }

    // Check if asset already exists
    const existingAsset = member.generatedDepositAddresses.find(
      addr => {
        const addrSymbol = 'assetSymbol' in addr ? addr.assetSymbol : (addr as any).asset;
        return addrSymbol === assetSymbol;
      }
    );

    if (existingAsset) {
      throw new Error(`Asset ${assetSymbol} already exists for this member`);
    }

    // Generate new deposit address
    const newDepositAddress = {
      asset: assetSymbol,
      depositAddress: this.generateDepositAddress(assetSymbol),
      balance: '0',
      isActive: true
    };

    const updatedMember = mockDb.updateMember(memberId, {
      generatedDepositAddresses: [...member.generatedDepositAddresses, newDepositAddress as any]
    });

    if (!updatedMember) {
      throw new Error('Failed to update member');
    }

    return {
      id: `${memberId}-${assetSymbol}`,
      memberId,
      assetSymbol,
      depositAddress: newDepositAddress.depositAddress,
      balance: '0',
      valueInKRW: '0',
      isActive: true,
      transactionCount24h: 0,
      volume24h: '0',
      lastActivityAt: null,
      createdAt: new Date().toISOString()
    };
  }

  async removeMemberAsset(memberId: string, assetSymbol: string): Promise<{ success: boolean }> {
    await delay(API_DELAY.MEDIUM);

    const member = mockDb.getMemberById(memberId);
    if (!member) {
      throw new Error(`Member not found: ${memberId}`);
    }

    const filteredAssets = member.generatedDepositAddresses.filter(
      addr => {
        const addrSymbol = 'assetSymbol' in addr ? addr.assetSymbol : (addr as any).asset;
        return addrSymbol !== assetSymbol;
      }
    );

    const updatedMember = mockDb.updateMember(memberId, {
      generatedDepositAddresses: filteredAssets
    });

    return { success: !!updatedMember };
  }

  // Member Address Management (Monitoring)
  async getMemberAddresses(memberId: string): Promise<RegisteredAddress[]> {
    await delay(API_DELAY.FAST);
    return mockDb.getAddressesByMember(memberId);
  }

  async flagSuspiciousAddress(
    addressId: string,
    reason: string,
    severity: 'low' | 'medium' | 'high'
  ): Promise<{ success: boolean }> {
    await delay(API_DELAY.MEDIUM);

    // In real implementation, would update address status
    console.log(`Flagging address ${addressId}: ${reason} (${severity})`);

    return { success: true };
  }

  // Member Onboarding Management
  async getOnboardingApplications(filters?: {
    status?: MemberOnboarding['status'];
    limit?: number;
    offset?: number;
  }): Promise<{
    applications: MemberOnboarding[];
    totalCount: number;
    hasMore: boolean;
  }> {
    await delay(API_DELAY.MEDIUM);

    let applications = mockDb.getOnboardingApplications();

    // Apply filters
    if (filters?.status) {
      applications = applications.filter(app => app.status === filters.status);
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return {
      applications: applications.slice(offset, offset + limit),
      totalCount: applications.length,
      hasMore: offset + limit < applications.length
    };
  }

  async getPendingOnboarding(): Promise<MemberOnboarding[]> {
    await delay(API_DELAY.FAST);
    return mockDb.getPendingOnboarding();
  }

  async getOnboardingById(onboardingId: string): Promise<MemberOnboarding> {
    await delay(API_DELAY.FAST);

    const applications = mockDb.getOnboardingApplications();
    const application = applications.find(app => app.id === onboardingId);

    if (!application) {
      throw new Error(`Onboarding application not found: ${onboardingId}`);
    }

    return application;
  }

  async approveOnboarding(
    onboardingId: string,
    approvalData: OnboardingApprovalRequest
  ): Promise<{
    success: boolean;
    member?: Member;
  }> {
    await delay(API_DELAY.SLOW);

    // Get onboarding application
    const application = await this.getOnboardingById(onboardingId);

    // Update onboarding status
    const updatedApplication = mockDb.updateOnboardingStatus(
      onboardingId,
      OnboardingStatus.APPROVED,
      approvalData.notes
    );

    if (!updatedApplication) {
      throw new Error('Failed to update onboarding status');
    }

    // Create member account
    const newMember = await this.createMember({
      memberType: MemberType.CORPORATE, // 온보딩 신청은 기업회원만 가능
      status: MemberStatus.ACTIVE,
      companyInfo: {
        companyName: application.companyName,
        businessNumber: application.businessNumber,
        corporateNumber: '',
        industry: '',
        establishedDate: new Date().toISOString().split('T')[0]
      },
      representative: {
        name: application.applicantName,
        position: '대표이사',
        email: application.applicantEmail,
        phone: application.applicantPhone
      },
      companyAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '대한민국'
      },
      contractInfo: approvalData.contractInfo,
      contacts: [{
        id: `contact-${Date.now()}`,
        name: application.applicantName,
        email: application.applicantEmail,
        phone: application.applicantPhone,
        role: ContactRole.ADMIN,
        status: ContactStatus.ACTIVE,
        isPrimary: true,
        twoFactorEnabled: false
      }],
      approvalSettings: {
        requiredApprovers: 1,
        approvalThreshold: '100000000', // ₩1억
        emergencyContacts: [application.applicantEmail],
        weekendApprovalAllowed: true,
        nightTimeApprovalAllowed: false
      },
      notificationSettings: {
        email: true,
        sms: false,
        notifyOnDeposit: true,
        notifyOnWithdrawal: true,
        notifyOnSuspension: true
      },
      initialAssets: approvalData.initialAssets
    });

    return {
      success: true,
      member: newMember
    };
  }

  async rejectOnboarding(
    onboardingId: string,
    reason: string
  ): Promise<{ success: boolean }> {
    await delay(API_DELAY.MEDIUM);

    const updatedApplication = mockDb.updateOnboardingStatus(
      onboardingId,
      OnboardingStatus.REJECTED,
      reason
    );

    return { success: !!updatedApplication };
  }

  async requestAdditionalDocuments(
    onboardingId: string,
    requiredDocuments: string[],
    message: string
  ): Promise<{ success: boolean }> {
    await delay(API_DELAY.MEDIUM);

    const updatedApplication = mockDb.updateOnboardingStatus(
      onboardingId,
      OnboardingStatus.DOCUMENT_REVIEW,
      `Additional documents required: ${requiredDocuments.join(', ')}. ${message}`
    );

    return { success: !!updatedApplication };
  }

  // Statistics and Reporting
  async getMemberStatistics(): Promise<{
    totalMembers: number;
    activeMembers: number;
    suspendedMembers: number;
    pendingOnboarding: number;
    totalAssets: number;
    totalValueInKRW: string;
  }> {
    await delay(API_DELAY.FAST);

    const members = mockDb.getMembers();
    const pendingApps = mockDb.getPendingOnboarding();

    const totalAssets = members.reduce(
      (sum, member) => sum + member.generatedDepositAddresses.length,
      0
    );

    const totalValueInKRW = members.reduce((sum, member) => {
      const memberValue = member.generatedDepositAddresses.reduce(
        (memberSum, asset) => {
          const assetSymbol = 'assetSymbol' in asset ? asset.assetSymbol : (asset as any).asset;
          return memberSum + parseFloat(this.calculateValueInKRW(asset.balance, assetSymbol));
        },
        0
      );
      return sum + memberValue;
    }, 0);

    return {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === MemberStatus.ACTIVE).length,
      suspendedMembers: members.filter(m => m.status === MemberStatus.SUSPENDED).length,
      pendingOnboarding: pendingApps.length,
      totalAssets,
      totalValueInKRW: totalValueInKRW.toString()
    };
  }

  // Utility Methods
  private generateDepositAddress(assetSymbol: string): string {
    const prefixes = {
      BTC: 'bc1q',
      ETH: '0x',
      USDT: '0x', // Assuming ERC-20 USDT
      USDC: '0x',
      ADA: 'addr1',
      DOT: '1',
      MATIC: '0x'
    };

    const prefix = prefixes[assetSymbol as keyof typeof prefixes] || '0x';
    const randomPart = Math.random().toString(36).substr(2, 35);

    return `${prefix}${randomPart}`;
  }

  private calculateValueInKRW(balance: string, asset: string): string {
    // Mock exchange rates (KRW)
    const rates = {
      BTC: 50000000, // ₩50M
      ETH: 2500000,  // ₩2.5M
      USDT: 1300,    // ₩1,300
      USDC: 1300,    // ₩1,300
      ADA: 500,      // ₩500
      DOT: 8000,     // ₩8,000
      MATIC: 800     // ₩800
    };

    const rate = rates[asset as keyof typeof rates] || 1300;
    const value = parseFloat(balance) * rate;

    return Math.floor(value).toString();
  }

  private getMockTransactionCount(): number {
    return Math.floor(Math.random() * 50);
  }

  private getMockVolume24h(): string {
    const volume = Math.random() * 10000000000; // Up to ₩10B
    return Math.floor(volume).toString();
  }

  private getAssetName(symbol: string): string {
    const assetNames = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      USDT: 'Tether USD',
      USDC: 'USD Coin',
      ADA: 'Cardano',
      DOT: 'Polkadot',
      MATIC: 'Polygon'
    };

    return assetNames[symbol as keyof typeof assetNames] || symbol;
  }
}

export const memberApi = MemberApiService.getInstance();