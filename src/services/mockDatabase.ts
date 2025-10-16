/**
 * Mock Database Service
 *
 * localStorage-based JSON database for development
 * Simulates real database operations with persistence
 */

import {
  Member,
  OnboardingApplication as MemberOnboarding,
  MemberAsset as MemberAssetInfo,
  RegisteredAddress,
  OnboardingStatus,
  ReviewNote,
  MemberStatus,
  ContractPlan,
  ContactRole,
  ContactStatus,
  RiskLevel
} from '@/types/member';
import {
  VaultStatus,
  VaultValue,
  AssetValue,
  WalletInfo,
  WalletType,
  WalletStatus,
  SecurityLevel,
  BalanceStatus,
  DeviationStatus,
  VaultPerformance,
  VaultAlert,
  RebalancingRecord
} from '@/types/vault';
import {
  AMLCheck,
  TravelRuleCheck,
  ComplianceReport,
  SuspiciousTransaction
} from '@/types/compliance';
import {
  AdminNotification,
  AdminNotificationType,
  AdminNotificationPriority,
  NotificationCategory
} from '@/types/adminNotification';

// Database keys
const DB_KEYS = {
  MEMBERS: 'custody_admin_members',
  MEMBER_ONBOARDING: 'custody_admin_onboarding',
  VAULT_STATUS: 'custody_admin_vault_status',
  VAULT_HISTORY: 'custody_admin_vault_history',
  COMPLIANCE_REPORTS: 'custody_admin_compliance',
  NOTIFICATIONS: 'custody_admin_notifications',
  SUSPICIOUS_TRANSACTIONS: 'custody_admin_suspicious_tx',
  REGISTERED_ADDRESSES: 'custody_admin_addresses'
} as const;

class MockDatabase {
  private static instance: MockDatabase;

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  private initializeDatabase(): void {
    // Initialize with sample data if not exists
    if (this.isClient() && !localStorage.getItem(DB_KEYS.MEMBERS)) {
      this.seedDatabase();
    }
  }

  // Client-side check
  private isClient(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Generic CRUD operations
  private get<T>(key: string): T[] {
    if (!this.isClient()) {
      return []; // Return empty array on server-side
    }
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private set<T>(key: string, data: T[]): void {
    if (!this.isClient()) {
      return; // Do nothing on server-side
    }
    localStorage.setItem(key, JSON.stringify(data));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Member operations
  public getMembers(): Member[] {
    return this.get<Member>(DB_KEYS.MEMBERS);
  }

  public getMemberById(id: string): Member | null {
    const members = this.getMembers();
    return members.find(member => member.id === id) || null;
  }

  public createMember(memberData: Omit<Member, 'id'>): Member {
    const members = this.getMembers();
    const newMember: Member = {
      ...memberData,
      id: this.generateId()
    };
    members.push(newMember);
    this.set(DB_KEYS.MEMBERS, members);
    return newMember;
  }

  public updateMember(id: string, updates: Partial<Member>): Member | null {
    const members = this.getMembers();
    const index = members.findIndex(member => member.id === id);

    if (index === -1) return null;

    members[index] = { ...members[index], ...updates };
    this.set(DB_KEYS.MEMBERS, members);
    return members[index];
  }

  // Member Onboarding operations
  public getOnboardingApplications(): MemberOnboarding[] {
    return this.get<MemberOnboarding>(DB_KEYS.MEMBER_ONBOARDING);
  }

  public getPendingOnboarding(): MemberOnboarding[] {
    return this.getOnboardingApplications().filter(
      app => app.status === OnboardingStatus.SUBMITTED ||
             app.status === OnboardingStatus.DOCUMENT_REVIEW ||
             app.status === OnboardingStatus.COMPLIANCE_REVIEW
    );
  }

  public updateOnboardingStatus(
    id: string,
    status: MemberOnboarding['status'],
    notes?: string
  ): MemberOnboarding | null {
    const applications = this.getOnboardingApplications();
    const index = applications.findIndex(app => app.id === id);

    if (index === -1) return null;

    applications[index] = {
      ...applications[index],
      status,
      reviewNotes: notes ? [...(applications[index].reviewNotes || []), {
        id: this.generateId(),
        reviewerId: 'admin-001',
        reviewerName: '관리자',
        note: notes,
        createdAt: new Date(),
        isInternal: false
      }] : applications[index].reviewNotes
    };

    this.set(DB_KEYS.MEMBER_ONBOARDING, applications);
    return applications[index];
  }

  // Vault operations
  public getVaultStatus(): VaultStatus {
    const vaultData = this.get<VaultStatus>(DB_KEYS.VAULT_STATUS);
    return vaultData[0] || this.getDefaultVaultStatus();
  }

  public updateVaultStatus(updates: Partial<VaultStatus>): VaultStatus {
    let vaultStatus = this.getVaultStatus();
    vaultStatus = { ...vaultStatus, ...updates };
    this.set(DB_KEYS.VAULT_STATUS, [vaultStatus]);
    return vaultStatus;
  }

  public getRebalancingHistory(): RebalancingRecord[] {
    return this.get<RebalancingRecord>(DB_KEYS.VAULT_HISTORY);
  }

  public addRebalancingRecord(record: Omit<RebalancingRecord, 'id'>): RebalancingRecord {
    const history = this.getRebalancingHistory();
    const newRecord: RebalancingRecord = {
      ...record,
      id: this.generateId()
    };
    history.unshift(newRecord); // Add to beginning
    this.set(DB_KEYS.VAULT_HISTORY, history);
    return newRecord;
  }

  // Compliance operations
  public getComplianceReports(): ComplianceReport[] {
    return this.get<ComplianceReport>(DB_KEYS.COMPLIANCE_REPORTS);
  }

  public getSuspiciousTransactions(): SuspiciousTransaction[] {
    return this.get<SuspiciousTransaction>(DB_KEYS.SUSPICIOUS_TRANSACTIONS);
  }

  // Notification operations
  public getNotifications(): AdminNotification[] {
    return this.get<AdminNotification>(DB_KEYS.NOTIFICATIONS);
  }

  public addNotification(notification: Omit<AdminNotification, 'id'>): AdminNotification {
    const notifications = this.getNotifications();
    const newNotification: AdminNotification = {
      ...notification,
      id: this.generateId()
    };
    notifications.unshift(newNotification);

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100);
    }

    this.set(DB_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  }

  public markNotificationAsRead(id: string): boolean {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(notif => notif.id === id);

    if (index === -1) return false;

    notifications[index].isRead = true;
    this.set(DB_KEYS.NOTIFICATIONS, notifications);
    return true;
  }

  // Registered Addresses operations
  public getRegisteredAddresses(): RegisteredAddress[] {
    return this.get<RegisteredAddress>(DB_KEYS.REGISTERED_ADDRESSES);
  }

  public getAddressesByMember(memberId: string): RegisteredAddress[] {
    return this.getRegisteredAddresses().filter(addr => addr.memberId === memberId);
  }

  // Utility methods
  private getDefaultVaultStatus(): VaultStatus {
    const mockAssetBreakdown: AssetValue[] = [
      {
        symbol: "BTC",
        name: "Bitcoin",
        balance: "706",
        valueInKRW: "35275000000",
        valueInUSD: "25000000",
        percentage: 77.1,
        priceInKRW: "50000000",
        priceInUSD: "35400",
        change24h: 2.5
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        balance: "4300",
        valueInKRW: "8445000000",
        valueInUSD: "6000000",
        percentage: 18.5,
        priceInKRW: "2500000",
        priceInUSD: "1800",
        change24h: -1.2
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        balance: "2000000",
        valueInKRW: "2000000000",
        valueInUSD: "2000000",
        percentage: 4.4,
        priceInKRW: "1300",
        priceInUSD: "1.0",
        change24h: 0.1
      }
    ];

    return {
      totalValue: {
        totalInKRW: "45720000000",
        totalInUSD: "33000000",
        assetBreakdown: mockAssetBreakdown
      },
      hotWallet: {
        type: WalletType.HOT,
        totalValue: {
          totalInKRW: "10515600000",
          totalInUSD: "7500000",
          assetBreakdown: [
            {
              symbol: "BTC",
              name: "Bitcoin",
              balance: "125.5",
              valueInKRW: "6250000000",
              valueInUSD: "4425000",
              percentage: 59.4,
              priceInKRW: "50000000",
              priceInUSD: "35400",
              change24h: 2.5
            },
            {
              symbol: "ETH",
              name: "Ethereum",
              balance: "2450",
              valueInKRW: "3265600000",
              valueInUSD: "2340000",
              percentage: 31.1,
              priceInKRW: "2500000",
              priceInUSD: "1800",
              change24h: -1.2
            },
            {
              symbol: "USDT",
              name: "Tether USD",
              balance: "1000000",
              valueInKRW: "1000000000",
              valueInUSD: "735000",
              percentage: 9.5,
              priceInKRW: "1300",
              priceInUSD: "1.0",
              change24h: 0.1
            }
          ]
        },
        assets: [
          {
            symbol: "BTC",
            name: "Bitcoin",
            balance: "125.5",
            valueInKRW: "6250000000",
            valueInUSD: "4425000",
            percentage: 59.4,
            priceInKRW: "50000000",
            priceInUSD: "35400",
            change24h: 2.5
          },
          {
            symbol: "ETH",
            name: "Ethereum",
            balance: "2450",
            valueInKRW: "3265600000",
            valueInUSD: "2340000",
            percentage: 31.1,
            priceInKRW: "2500000",
            priceInUSD: "1800",
            change24h: -1.2
          },
          {
            symbol: "USDT",
            name: "Tether USD",
            balance: "1000000",
            valueInKRW: "1000000000",
            valueInUSD: "735000",
            percentage: 9.5,
            priceInKRW: "1300",
            priceInUSD: "1.0",
            change24h: 0.1
          }
        ],
        utilizationRate: 76,
        status: WalletStatus.NORMAL,
        securityLevel: SecurityLevel.STANDARD,
        healthScore: 85
      },
      coldWallet: {
        type: WalletType.COLD,
        totalValue: {
          totalInKRW: "35204400000",
          totalInUSD: "25500000",
          assetBreakdown: [
            {
              symbol: "BTC",
              name: "Bitcoin",
              balance: "580.5",
              valueInKRW: "29025000000",
              valueInUSD: "20575000",
              percentage: 82.5,
              priceInKRW: "50000000",
              priceInUSD: "35400",
              change24h: 2.5
            },
            {
              symbol: "ETH",
              name: "Ethereum",
              balance: "1850",
              valueInKRW: "5179400000",
              valueInUSD: "3660000",
              percentage: 14.7,
              priceInKRW: "2500000",
              priceInUSD: "1800",
              change24h: -1.2
            },
            {
              symbol: "USDT",
              name: "Tether USD",
              balance: "1000000",
              valueInKRW: "1000000000",
              valueInUSD: "735000",
              percentage: 2.8,
              priceInKRW: "1300",
              priceInUSD: "1.0",
              change24h: 0.1
            }
          ]
        },
        assets: [
          {
            symbol: "BTC",
            name: "Bitcoin",
            balance: "580.5",
            valueInKRW: "29025000000",
            valueInUSD: "20575000",
            percentage: 82.5,
            priceInKRW: "50000000",
            priceInUSD: "35400",
            change24h: 2.5
          },
          {
            symbol: "ETH",
            name: "Ethereum",
            balance: "1850",
            valueInKRW: "5179400000",
            valueInUSD: "3660000",
            percentage: 14.7,
            priceInKRW: "2500000",
            priceInUSD: "1800",
            change24h: -1.2
          },
          {
            symbol: "USDT",
            name: "Tether USD",
            balance: "1000000",
            valueInKRW: "1000000000",
            valueInUSD: "735000",
            percentage: 2.8,
            priceInKRW: "1300",
            priceInUSD: "1.0",
            change24h: 0.1
          }
        ],
        utilizationRate: 45,
        status: WalletStatus.NORMAL,
        securityLevel: SecurityLevel.MAXIMUM,
        healthScore: 95
      },
      balanceStatus: {
        hotRatio: 23,
        coldRatio: 77,
        targetHotRatio: 20,
        targetColdRatio: 80,
        deviation: 3,
        deviationStatus: DeviationStatus.ACCEPTABLE,
        needsRebalancing: true,
        lastRebalance: new Date(Date.now() - 86400000 * 3),
        nextSuggestedRebalance: new Date(Date.now() + 86400000 * 1)
      },
      alerts: [],
      performance: {
        uptime: 99.9,
        averageTransactionTime: 3.2,
        totalTransactions24h: 1247,
        totalVolume24h: "8500000000",
        successRate: 99.8,
        errorRate: 0.2,
        securityIncidents: 0
      },
      updatedAt: new Date()
    };
  }

  // Database seeding
  private seedDatabase(): void {
    // Seed Members with Korean company names
    const members: Member[] = [
      {
        id: 'member-001',
        type: 'corporate',
        companyName: '테크놀로지 코퍼레이션',
        businessNumber: '123-45-67890',
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
      },
      {
        id: 'member-002',
        type: 'corporate',
        companyName: '글로벌 트레이딩',
        businessNumber: '234-56-78901',
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
            depositAddress: '0x5A8b92B4C7d3E8F9A1B2C3D4E5F6A7B8C9D0E1F2',
            balance: '150000',
            balanceInKRW: '195000000',
            isActive: true,
            createdAt: new Date('2024-02-01'),
            totalDeposited: '200000',
            totalWithdrawn: '50000',
            transactionCount: 12
          }
        ],
        contacts: [
          {
            id: 'contact-002',
            name: '박영희',
            email: 'park@globaltrading.com',
            phone: '010-2345-6789',
            role: ContactRole.ADMIN,
            status: ContactStatus.ACTIVE,
            isPrimary: true,
            twoFactorEnabled: true,
            lastLogin: new Date(Date.now() - 7200000)
          }
        ],
        approvalSettings: {
          requiredApprovers: 1,
          approvalThreshold: '50000000',
          emergencyContacts: ['emergency@globaltrading.com'],
          weekendApprovalAllowed: true,
          nightTimeApprovalAllowed: true
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
          riskLevel: RiskLevel.MEDIUM,
          amlScore: 75,
          sanctionsScreening: true,
          pepStatus: false,
          lastKycUpdate: new Date('2024-02-01'),
          nextKycReview: new Date('2025-02-01'),
          complianceNotes: []
        },
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      },
      {
        id: 'member-003',
        type: 'corporate',
        companyName: '스마트 솔루션',
        businessNumber: '345-67-89012',
        status: MemberStatus.ACTIVE,
        contractInfo: {
          plan: ContractPlan.BASIC,
          feeRate: 0.25,
          monthlyLimit: 1000000000,
          dailyLimit: 50000000,
          startDate: new Date('2024-03-01'),
          autoRenewal: true
        },
        generatedDepositAddresses: [
          {
            id: 'asset-003-eth',
            memberId: 'member-003',
            assetSymbol: 'ETH',
            assetName: 'Ethereum',
            depositAddress: '0x1234567890abcdef1234567890abcdef12345678',
            balance: '25.5',
            balanceInKRW: '63750000',
            isActive: true,
            createdAt: new Date('2024-03-01'),
            totalDeposited: '30.0',
            totalWithdrawn: '4.5',
            transactionCount: 6
          }
        ],
        contacts: [
          {
            id: 'contact-003',
            name: '이민수',
            email: 'lee@smartsolution.com',
            phone: '010-3456-7890',
            role: ContactRole.ADMIN,
            status: ContactStatus.ACTIVE,
            isPrimary: true,
            twoFactorEnabled: false,
            lastLogin: new Date(Date.now() - 86400000)
          }
        ],
        approvalSettings: {
          requiredApprovers: 1,
          approvalThreshold: '30000000',
          emergencyContacts: ['emergency@smartsolution.com'],
          weekendApprovalAllowed: false,
          nightTimeApprovalAllowed: false
        },
        notificationSettings: {
          email: true,
          sms: false,
          slack: undefined,
          notifyOnDeposit: true,
          notifyOnWithdrawal: true,
          notifyOnSuspension: true
        },
        registeredAddresses: [],
        onboardingStatus: OnboardingStatus.APPROVED,
        complianceProfile: {
          riskLevel: RiskLevel.LOW,
          amlScore: 82,
          sanctionsScreening: true,
          pepStatus: false,
          lastKycUpdate: new Date('2024-03-01'),
          nextKycReview: new Date('2025-03-01'),
          complianceNotes: []
        },
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date()
      },
      {
        id: 'member-004',
        type: 'individual',
        companyName: '김영희',
        businessNumber: '456-78-90123',
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
      },
      {
        id: 'member-005',
        type: 'individual',
        companyName: '박준호',
        businessNumber: '567-89-01234',
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
          amlScore: 85,
          sanctionsScreening: true,
          pepStatus: false,
          lastKycUpdate: new Date('2024-05-01'),
          nextKycReview: new Date('2025-05-01'),
          complianceNotes: []
        },
        createdAt: new Date('2024-05-01'),
        updatedAt: new Date()
      }
    ];

    // Seed Onboarding Applications (임시로 any 타입 사용)
    const onboardingApps: any[] = [
      {
        id: 'onboard-001',
        companyName: 'Future Finance Corp',
        businessNumber: '987-65-43210',
        status: OnboardingStatus.SUBMITTED,
        submittedAt: new Date(Date.now() - 86400000 * 2),
        contactInfo: {
          name: '박영희',
          email: 'park@futurefinance.com',
          phone: '010-9876-5432',
          position: 'CTO'
        },
        businessInfo: {
          establishedDate: '2020-03-15',
          businessType: 'fintech',
          employeeCount: 25,
          annualRevenue: 5000000000
        },
        requiredDocuments: {
          businessRegistration: {
            uploaded: true,
            filename: 'business_reg_future_finance.pdf',
            uploadedAt: new Date(Date.now() - 86400000 * 2),
            status: 'pending_review'
          },
          corporateRegistry: {
            uploaded: true,
            filename: 'corp_registry_future_finance.pdf',
            uploadedAt: new Date(Date.now() - 86400000 * 2),
            status: 'pending_review'
          },
          representativeId: {
            uploaded: true,
            filename: 'id_card_park.pdf',
            uploadedAt: new Date(Date.now() - 86400000 * 2),
            status: 'pending_review'
          },
          amlCompliance: {
            uploaded: false,
            filename: '',
            status: 'missing'
          }
        },
        riskAssessment: {
          score: 25,
          level: 'low',
          factors: [
            { factor: 'business_history', score: 8, weight: 0.3 },
            { factor: 'financial_stability', score: 7, weight: 0.4 },
            { factor: 'compliance_record', score: 9, weight: 0.3 }
          ],
          assessedAt: new Date(Date.now() - 86400000 * 1),
          assessedBy: 'compliance@custody.com'
        }
      },
      {
        id: 'onboard-002',
        companyName: 'Global Trading Solutions',
        businessNumber: '456-78-90123',
        status: OnboardingStatus.COMPLIANCE_REVIEW,
        submittedAt: new Date(Date.now() - 86400000 * 5),
        contactInfo: {
          name: '이민수',
          email: 'lee@globaltrading.com',
          phone: '010-5555-1234',
          position: 'CEO'
        },
        businessInfo: {
          establishedDate: '2018-07-22',
          businessType: 'trading',
          employeeCount: 45,
          annualRevenue: 12000000000
        },
        requiredDocuments: {
          businessRegistration: {
            uploaded: true,
            filename: 'business_reg_global_trading.pdf',
            uploadedAt: new Date(Date.now() - 86400000 * 5),
            status: 'approved'
          },
          corporateRegistry: {
            uploaded: true,
            filename: 'corp_registry_global_trading.pdf',
            uploadedAt: new Date(Date.now() - 86400000 * 5),
            status: 'approved'
          },
          representativeId: {
            uploaded: true,
            filename: 'id_card_lee.pdf',
            uploadedAt: new Date(Date.now() - 86400000 * 5),
            status: 'approved'
          },
          amlCompliance: {
            uploaded: true,
            filename: 'aml_compliance_global_trading.pdf',
            uploadedAt: new Date(Date.now() - 86400000 * 4),
            status: 'under_review'
          }
        },
        riskAssessment: {
          score: 40,
          level: 'medium',
          factors: [
            { factor: 'business_history', score: 6, weight: 0.3 },
            { factor: 'financial_stability', score: 8, weight: 0.4 },
            { factor: 'compliance_record', score: 5, weight: 0.3 }
          ],
          assessedAt: new Date(Date.now() - 86400000 * 3),
          assessedBy: 'compliance@custody.com'
        },
        reviewNotes: [
          {
            timestamp: new Date(Date.now() - 86400000 * 3),
            reviewer: 'compliance@custody.com',
            note: 'AML 문서 추가 검토 필요. 해외 거래소 연동 이력 확인 중.'
          }
        ]
      },
      {
        id: 'onboard-003',
        companyName: 'Blockchain Ventures Ltd',
        businessNumber: '789-01-23456',
        status: OnboardingStatus.SUBMITTED,
        submittedAt: new Date(Date.now() - 86400000),
        contactInfo: {
          name: '최현우',
          email: 'choi@blockchainventures.com',
          phone: '010-7777-8888',
          position: 'CFO'
        },
        businessInfo: {
          establishedDate: '2021-01-10',
          businessType: 'investment',
          employeeCount: 15,
          annualRevenue: 3000000000
        },
        requiredDocuments: {
          businessRegistration: {
            uploaded: true,
            filename: 'business_reg_blockchain_ventures.pdf',
            uploadedAt: new Date(Date.now() - 86400000),
            status: 'pending_review'
          },
          corporateRegistry: {
            uploaded: true,
            filename: 'corp_registry_blockchain_ventures.pdf',
            uploadedAt: new Date(Date.now() - 86400000),
            status: 'pending_review'
          },
          representativeId: {
            uploaded: false,
            filename: '',
            status: 'missing'
          },
          amlCompliance: {
            uploaded: false,
            filename: '',
            status: 'missing'
          }
        },
        riskAssessment: {
          score: 35,
          level: 'medium',
          factors: [
            { factor: 'business_history', score: 5, weight: 0.3 },
            { factor: 'financial_stability', score: 6, weight: 0.4 },
            { factor: 'compliance_record', score: 7, weight: 0.3 }
          ],
          assessedAt: new Date(Date.now() - 86400000),
          assessedBy: 'compliance@custody.com'
        }
      }
    ];

    // Seed notifications
    const notifications: AdminNotification[] = [
      {
        id: 'notif-001',
        type: AdminNotificationType.MEMBER_ONBOARDING_PENDING,
        priority: AdminNotificationPriority.NORMAL,
        category: NotificationCategory.OPERATIONS,
        title: '신규 회원사 승인 요청',
        message: 'Future Finance Corp 온보딩 검토가 필요합니다.',
        actionUrl: '/admin/onboarding/onboard-001',
        actionLabel: '검토하기',
        metadata: {
          memberId: 'onboard-001',
          isAutoGenerated: true
        },
        isRead: false,
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'notif-002',
        type: AdminNotificationType.VAULT_REBALANCING_NEEDED,
        priority: AdminNotificationPriority.HIGH,
        category: NotificationCategory.OPERATIONS,
        title: 'Hot Wallet 리밸런싱 필요',
        message: 'Hot 지갑 비율이 목표치를 3% 초과했습니다. (23% vs 20%)',
        actionUrl: '/admin/vault/rebalancing',
        actionLabel: '리밸런싱하기',
        metadata: {
          vaultId: 'vault-main',
          previousStatus: '20%',
          currentStatus: '23%',
          alertLevel: 'HIGH',
          isAutoGenerated: true
        },
        isRead: false,
        createdAt: new Date(Date.now() - 7200000)
      }
    ];

    // Set initial data
    this.set(DB_KEYS.MEMBERS, members);
    this.set(DB_KEYS.MEMBER_ONBOARDING, onboardingApps);
    this.set(DB_KEYS.VAULT_STATUS, [this.getDefaultVaultStatus()]);
    this.set(DB_KEYS.NOTIFICATIONS, notifications);
    this.set(DB_KEYS.VAULT_HISTORY, []);
    this.set(DB_KEYS.COMPLIANCE_REPORTS, []);
    this.set(DB_KEYS.SUSPICIOUS_TRANSACTIONS, []);
    this.set(DB_KEYS.REGISTERED_ADDRESSES, []);
  }

  // Development utilities
  public clearDatabase(): void {
    if (!this.isClient()) {
      return; // Do nothing on server-side
    }
    Object.values(DB_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  public resetToSeedData(): void {
    this.clearDatabase();
    this.seedDatabase();
  }
}

export const mockDb = MockDatabase.getInstance();