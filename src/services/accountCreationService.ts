/**
 * 자동 계정 생성 서비스
 * Task 2.2: 승인 후 회원사 계정 자동 생성
 */

import { Member, MemberAsset, getMemberName } from '@/types/member';

// localStorage 헬퍼 함수들
const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
};

const setObjectToStorage = (key: string, data: any): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
};

// 계정 생성 프로세스 상태
export enum AccountCreationStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed"
}

// 계정 생성 단계
export enum AccountCreationStep {
  GENERATE_API_KEYS = "generate_api_keys",
  CREATE_INITIAL_ASSETS = "create_initial_assets",
  GENERATE_DEPOSIT_ADDRESSES = "generate_deposit_addresses",
  SETUP_NOTIFICATION_WEBHOOKS = "setup_notification_webhooks",
  INITIALIZE_LIMITS = "initialize_limits",
  SEND_WELCOME_EMAIL = "send_welcome_email"
}

// 계정 생성 프로세스 인터페이스
export interface AccountCreationProcess {
  id: string;
  memberId: string;
  triggerEvent: string;
  status: AccountCreationStatus;
  steps: AccountCreationStepDetail[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: AccountCreationResult;
}

// 계정 생성 단계 상세
export interface AccountCreationStepDetail {
  step: AccountCreationStep;
  name: string;
  status: AccountCreationStatus;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

// 계정 생성 결과
export interface AccountCreationResult {
  apiKeys: {
    publicKey: string;
    secretKey: string;
    testnetPublicKey?: string;
    testnetSecretKey?: string;
  };
  initialAssets: MemberAsset[];
  webhookEndpoints: {
    deposit: string;
    withdrawal: string;
    notification: string;
  };
  limits: {
    dailyDepositLimit: string;
    dailyWithdrawLimit: string;
    monthlyLimit: string;
  };
  welcomeEmailSent: boolean;
}

// 기본 자산 설정
const DEFAULT_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether USD' },
  { symbol: 'USDC', name: 'USD Coin' }
];

class AccountCreationService {
  // 계정 생성 프로세스 시작
  async createMemberAccount(memberId: string): Promise<AccountCreationProcess> {
    console.log(`계정 생성 프로세스 시작 - 회원사 ID: ${memberId}`);

    const process: AccountCreationProcess = {
      id: this.generateProcessId(),
      memberId,
      triggerEvent: "approval_completed",
      status: AccountCreationStatus.PENDING,
      createdAt: new Date(),
      steps: this.initializeSteps()
    };

    await this.saveProcess(process);

    // 비동기적으로 계정 생성 실행
    this.executeAccountCreation(process.id).catch(error => {
      console.error('계정 생성 실행 중 오류:', error);
    });

    return process;
  }

  // 계정 생성 실행
  private async executeAccountCreation(processId: string): Promise<void> {
    const process = await this.getProcess(processId);
    if (!process) {
      throw new Error('계정 생성 프로세스를 찾을 수 없습니다.');
    }

    try {
      process.status = AccountCreationStatus.IN_PROGRESS;
      process.startedAt = new Date();
      await this.saveProcess(process);

      // 각 단계 순차적으로 실행
      for (const step of process.steps) {
        await this.executeStep(process, step);

        if (step.status === AccountCreationStatus.FAILED) {
          throw new Error(`계정 생성 단계 실패: ${step.name} - ${step.error}`);
        }
      }

      // 모든 단계 완료
      process.status = AccountCreationStatus.COMPLETED;
      process.completedAt = new Date();
      process.result = await this.buildResult(process);

      console.log(`계정 생성 완료 - 회원사 ID: ${process.memberId}`);

    } catch (error) {
      process.status = AccountCreationStatus.FAILED;
      process.error = error instanceof Error ? error.message : '알 수 없는 오류';
      console.error('계정 생성 실패:', error);
    } finally {
      await this.saveProcess(process);
    }
  }

  // 개별 단계 실행
  private async executeStep(process: AccountCreationProcess, step: AccountCreationStepDetail): Promise<void> {
    step.status = AccountCreationStatus.IN_PROGRESS;
    step.startedAt = new Date();

    try {
      switch (step.step) {
        case AccountCreationStep.GENERATE_API_KEYS:
          step.result = await this.generateApiKeys(process.memberId);
          break;
        case AccountCreationStep.CREATE_INITIAL_ASSETS:
          step.result = await this.createInitialAssets(process.memberId);
          break;
        case AccountCreationStep.GENERATE_DEPOSIT_ADDRESSES:
          step.result = await this.generateDepositAddresses(process.memberId);
          break;
        case AccountCreationStep.SETUP_NOTIFICATION_WEBHOOKS:
          step.result = await this.setupNotificationWebhooks(process.memberId);
          break;
        case AccountCreationStep.INITIALIZE_LIMITS:
          step.result = await this.initializeLimits(process.memberId);
          break;
        case AccountCreationStep.SEND_WELCOME_EMAIL:
          step.result = await this.sendWelcomeEmail(process.memberId);
          break;
      }

      step.status = AccountCreationStatus.COMPLETED;
      step.completedAt = new Date();

      console.log(`단계 완료: ${step.name} - 회원사 ID: ${process.memberId}`);

    } catch (error) {
      step.status = AccountCreationStatus.FAILED;
      step.error = error instanceof Error ? error.message : '알 수 없는 오류';
      step.retryCount++;

      console.error(`단계 실패: ${step.name}`, error);

      // 재시도 로직
      if (step.retryCount < step.maxRetries) {
        console.log(`단계 재시도: ${step.name} (${step.retryCount}/${step.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * step.retryCount)); // 지수 백오프
        await this.executeStep(process, step);
      }
    }
  }

  // API 키 생성
  private async generateApiKeys(memberId: string): Promise<any> {
    // Mock API 키 생성
    const publicKey = `pk_${memberId}_${this.generateRandomString(32)}`;
    const secretKey = `sk_${memberId}_${this.generateRandomString(64)}`;
    const testnetPublicKey = `pk_test_${memberId}_${this.generateRandomString(32)}`;
    const testnetSecretKey = `sk_test_${memberId}_${this.generateRandomString(64)}`;

    const apiKeys = {
      publicKey,
      secretKey,
      testnetPublicKey,
      testnetSecretKey,
      createdAt: new Date(),
      environment: 'production'
    };

    // API 키 저장
    const memberApiKeys = getFromStorage(`member_api_keys_${memberId}`) || [];
    memberApiKeys.push(apiKeys);
    setToStorage(`member_api_keys_${memberId}`, memberApiKeys);

    return apiKeys;
  }

  // 초기 자산 생성
  private async createInitialAssets(memberId: string): Promise<MemberAsset[]> {
    const member = await this.getMember(memberId);
    if (!member) throw new Error('회원사 정보를 찾을 수 없습니다.');

    const initialAssets: MemberAsset[] = [];

    for (const asset of DEFAULT_ASSETS) {
      const memberAsset: MemberAsset = {
        id: this.generateAssetId(),
        memberId,
        assetSymbol: asset.symbol,
        assetName: asset.name,
        depositAddress: '', // 다음 단계에서 생성
        balance: '0',
        balanceInKRW: '0',
        isActive: true,
        createdAt: new Date(),
        totalDeposited: '0',
        totalWithdrawn: '0',
        transactionCount: 0
      };

      initialAssets.push(memberAsset);
    }

    // 회원사 자산 저장
    const memberAssets = getFromStorage(`member_assets_${memberId}`) || [];
    memberAssets.push(...initialAssets);
    setToStorage(`member_assets_${memberId}`, memberAssets);

    return initialAssets;
  }

  // 입금 주소 생성
  private async generateDepositAddresses(memberId: string): Promise<any> {
    const memberAssets = getFromStorage(`member_assets_${memberId}`) || [];
    const addressResults: any[] = [];

    for (const asset of memberAssets) {
      // Mock 입금 주소 생성
      const typedAsset = asset as any; // 타입 안전성을 위한 캐스팅
      const depositAddress = this.generateDepositAddress(typedAsset.assetSymbol);

      // 자산에 입금 주소 업데이트
      typedAsset.depositAddress = depositAddress;

      addressResults.push({
        assetSymbol: typedAsset.assetSymbol,
        depositAddress,
        createdAt: new Date()
      });
    }

    // 업데이트된 자산 정보 저장
    setToStorage(`member_assets_${memberId}`, memberAssets);

    // 회원사 정보에도 입금 주소 업데이트
    const members = getFromStorage<any>('members') || [];
    const memberIndex = members.findIndex((m: any) => m.id === memberId);
    if (memberIndex !== -1) {
      (members[memberIndex] as any).generatedDepositAddresses = memberAssets;
      setToStorage('members', members);
    }

    return addressResults;
  }

  // 알림 웹훅 설정
  private async setupNotificationWebhooks(memberId: string): Promise<any> {
    const webhookEndpoints = {
      deposit: `https://api.member.com/webhooks/deposits`,
      withdrawal: `https://api.member.com/webhooks/withdrawals`,
      notification: `https://api.member.com/webhooks/notifications`
    };

    // 웹훅 설정 저장
    setObjectToStorage(`member_webhooks_${memberId}`, {
      endpoints: webhookEndpoints,
      createdAt: new Date(),
      isActive: true
    });

    return webhookEndpoints;
  }

  // 한도 초기화
  private async initializeLimits(memberId: string): Promise<any> {
    const member = await this.getMember(memberId);
    if (!member) throw new Error('회원사 정보를 찾을 수 없습니다.');

    const limits = {
      dailyDepositLimit: member.contractInfo.dailyLimit?.toString() || '100000000', // 1억원
      dailyWithdrawLimit: member.contractInfo.dailyLimit?.toString() || '100000000',
      monthlyLimit: member.contractInfo.monthlyLimit?.toString() || '3000000000', // 30억원
      createdAt: new Date()
    };

    // 한도 설정 저장
    setObjectToStorage(`member_limits_${memberId}`, limits);

    return limits;
  }

  // 환영 이메일 발송
  private async sendWelcomeEmail(memberId: string): Promise<any> {
    const member = await this.getMember(memberId);
    if (!member) throw new Error('회원사 정보를 찾을 수 없습니다.');

    // Mock 이메일 발송
    const emailResult = {
      to: member.contacts[0]?.email,
      subject: `[커스터디] ${getMemberName(member)} 계정 생성 완료`,
      template: 'welcome_email',
      sentAt: new Date(),
      success: true
    };

    console.log(`환영 이메일 발송: ${emailResult.to}`);

    // 이메일 발송 이력 저장
    const emailHistory = getFromStorage(`member_emails_${memberId}`) || [];
    emailHistory.push(emailResult);
    setToStorage(`member_emails_${memberId}`, emailHistory);

    return emailResult;
  }

  // 프로세스 조회
  async getProcess(processId: string): Promise<AccountCreationProcess | null> {
    const processes = getFromStorage<AccountCreationProcess>('account_creation_processes') || [];
    return processes.find(p => p.id === processId) || null;
  }

  // 회원사별 프로세스 조회
  async getProcessByMemberId(memberId: string): Promise<AccountCreationProcess | null> {
    const processes = getFromStorage<AccountCreationProcess>('account_creation_processes') || [];
    return processes.find(p => p.memberId === memberId) || null;
  }

  // 진행 중인 프로세스 목록 조회
  async getActiveProcesses(): Promise<AccountCreationProcess[]> {
    const processes = getFromStorage<AccountCreationProcess>('account_creation_processes') || [];
    return processes.filter(p =>
      p.status === AccountCreationStatus.PENDING ||
      p.status === AccountCreationStatus.IN_PROGRESS
    );
  }

  // 초기 단계 설정
  private initializeSteps(): AccountCreationStepDetail[] {
    return [
      {
        step: AccountCreationStep.GENERATE_API_KEYS,
        name: "API 키 생성",
        status: AccountCreationStatus.PENDING,
        retryCount: 0,
        maxRetries: 3
      },
      {
        step: AccountCreationStep.CREATE_INITIAL_ASSETS,
        name: "초기 자산 생성",
        status: AccountCreationStatus.PENDING,
        retryCount: 0,
        maxRetries: 3
      },
      {
        step: AccountCreationStep.GENERATE_DEPOSIT_ADDRESSES,
        name: "입금 주소 생성",
        status: AccountCreationStatus.PENDING,
        retryCount: 0,
        maxRetries: 5
      },
      {
        step: AccountCreationStep.SETUP_NOTIFICATION_WEBHOOKS,
        name: "웹훅 설정",
        status: AccountCreationStatus.PENDING,
        retryCount: 0,
        maxRetries: 3
      },
      {
        step: AccountCreationStep.INITIALIZE_LIMITS,
        name: "한도 초기화",
        status: AccountCreationStatus.PENDING,
        retryCount: 0,
        maxRetries: 2
      },
      {
        step: AccountCreationStep.SEND_WELCOME_EMAIL,
        name: "환영 이메일 발송",
        status: AccountCreationStatus.PENDING,
        retryCount: 0,
        maxRetries: 3
      }
    ];
  }

  // 결과 생성
  private async buildResult(process: AccountCreationProcess): Promise<AccountCreationResult> {
    const apiKeysStep = process.steps.find(s => s.step === AccountCreationStep.GENERATE_API_KEYS);
    const webhooksStep = process.steps.find(s => s.step === AccountCreationStep.SETUP_NOTIFICATION_WEBHOOKS);
    const limitsStep = process.steps.find(s => s.step === AccountCreationStep.INITIALIZE_LIMITS);
    const assetsStep = process.steps.find(s => s.step === AccountCreationStep.CREATE_INITIAL_ASSETS);
    const emailStep = process.steps.find(s => s.step === AccountCreationStep.SEND_WELCOME_EMAIL);

    return {
      apiKeys: apiKeysStep?.result || {},
      initialAssets: assetsStep?.result || [],
      webhookEndpoints: webhooksStep?.result || {},
      limits: limitsStep?.result || {},
      welcomeEmailSent: emailStep?.result?.success || false
    };
  }

  // 프로세스 저장
  private async saveProcess(process: AccountCreationProcess): Promise<void> {
    const processes = getFromStorage<AccountCreationProcess>('account_creation_processes') || [];
    const index = processes.findIndex(p => p.id === process.id);

    if (index !== -1) {
      processes[index] = process;
    } else {
      processes.push(process);
    }

    setToStorage('account_creation_processes', processes);
  }

  // 회원사 정보 조회
  private async getMember(memberId: string): Promise<Member | null> {
    const members = getFromStorage<any>('members') || [];
    return members.find((m: any) => m.id === memberId) as Member || null;
  }

  // 입금 주소 생성 (Mock)
  private generateDepositAddress(assetSymbol: string): string {
    const prefixes: Record<string, string> = {
      'BTC': '1',
      'ETH': '0x',
      'USDT': '0x',
      'USDC': '0x'
    };

    const prefix = prefixes[assetSymbol] || '0x';
    const randomPart = this.generateRandomString(assetSymbol === 'BTC' ? 33 : 40);

    return assetSymbol === 'BTC'
      ? `${prefix}${randomPart}`
      : `${prefix}${randomPart}`;
  }

  // 랜덤 문자열 생성
  private generateRandomString(length: number): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 프로세스 ID 생성
  private generateProcessId(): string {
    return 'ACP-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 자산 ID 생성
  private generateAssetId(): string {
    return 'MA-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const accountCreationService = new AccountCreationService();
export default accountCreationService;