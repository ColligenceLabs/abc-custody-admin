/**
 * Member Overview Page
 * 회원사 개요 페이지 - 특정 회원사의 상세 정보 및 통계
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Phone,
  Mail,
  Settings,
  Edit,
  Eye,
  Wallet,
  CreditCard,
  BarChart3,
  Activity,
  Users,
  FileText,
  Bell
} from "lucide-react";
import { Member, MemberStatus, OnboardingStatus, ContractPlan, AddressType, AddressStatus, ContactRole, ContactStatus, RiskLevel } from '@/types/member';
import Link from "next/link";

// Mock data - 실제로는 API에서 가져올 데이터
const mockMember: Member = {
  id: "MEM-001",
  type: 'corporate',
  companyName: "테크놀로지 코퍼레이션",
  businessNumber: "123-45-67890",
  status: MemberStatus.ACTIVE,
  onboardingStatus: OnboardingStatus.APPROVED,
  contractInfo: {
    plan: ContractPlan.ENTERPRISE,
    feeRate: 0.15,
    monthlyLimit: 10000000000,
    dailyLimit: 1000000000,
    startDate: new Date('2024-01-15'),
    autoRenewal: true
  },
  generatedDepositAddresses: [
    {
      id: "ADDR-001",
      memberId: "MEM-001",
      assetSymbol: "BTC",
      assetName: "Bitcoin",
      depositAddress: "bc1q...xyz123",
      balance: "5.25",
      balanceInKRW: "350000000",
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastActivityAt: new Date('2024-09-25'),
      totalDeposited: "12.50",
      totalWithdrawn: "7.25",
      transactionCount: 28
    },
    {
      id: "ADDR-002",
      memberId: "MEM-001",
      assetSymbol: "ETH",
      assetName: "Ethereum",
      depositAddress: "0x742d35Cc6639C7532c5B3C34FE3e2a3D",
      balance: "120.8",
      balanceInKRW: "420000000",
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastActivityAt: new Date('2024-09-26'),
      totalDeposited: "200.0",
      totalWithdrawn: "79.2",
      transactionCount: 45
    },
    {
      id: "ADDR-003",
      memberId: "MEM-001",
      assetSymbol: "USDT",
      assetName: "Tether USD",
      depositAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
      balance: "500000",
      balanceInKRW: "650000000",
      isActive: true,
      createdAt: new Date('2024-02-01'),
      lastActivityAt: new Date('2024-09-26'),
      totalDeposited: "800000",
      totalWithdrawn: "300000",
      transactionCount: 62
    }
  ],
  registeredAddresses: [
    {
      id: "REG-001",
      memberId: "MEM-001",
      label: "CEO 개인 지갑",
      address: "bc1q...personal123",
      coin: "BTC",
      type: AddressType.PERSONAL,
      permissions: {
        canDeposit: true,
        canWithdraw: true
      },
      dailyLimits: {
        deposit: 1000000,
        withdrawal: 1000000
      },
      dailyUsage: {
        date: "2024-09-26",
        depositAmount: 250000,
        withdrawalAmount: 0
      },
      status: AddressStatus.ACTIVE,
      addedAt: new Date('2024-01-20'),
      addedBy: "CEO-001",
      lastUsedAt: new Date('2024-09-25')
    },
    {
      id: "REG-002",
      memberId: "MEM-001",
      label: "업비트 출금 전용",
      address: "0x742d35Cc6639C7532c5B3C34FE3e2a3D",
      coin: "ETH",
      type: AddressType.VASP,
      permissions: {
        canDeposit: false,
        canWithdraw: true
      },
      vaspInfo: {
        businessName: "두나무(업비트)",
        travelRuleConnected: true,
        complianceScore: 95,
        jurisdiction: "KR"
      },
      dailyUsage: {
        date: "2024-09-26",
        depositAmount: 0,
        withdrawalAmount: 15000000
      },
      status: AddressStatus.ACTIVE,
      addedAt: new Date('2024-02-10'),
      addedBy: "CFO-001",
      lastUsedAt: new Date('2024-09-26')
    }
  ],
  contacts: [
    {
      id: "CON-001",
      name: "김철수",
      email: "kim@techcorp.co.kr",
      phone: "010-1234-5678",
      role: ContactRole.ADMIN,
      status: ContactStatus.ACTIVE,
      isPrimary: true,
      twoFactorEnabled: true,
      lastLogin: new Date('2024-09-26T10:30:00')
    },
    {
      id: "CON-002",
      name: "이영희",
      email: "lee@techcorp.co.kr",
      phone: "010-2345-6789",
      role: ContactRole.APPROVER,
      status: ContactStatus.ACTIVE,
      isPrimary: false,
      twoFactorEnabled: true,
      lastLogin: new Date('2024-09-25T16:45:00')
    }
  ],
  approvalSettings: {
    requiredApprovers: 2,
    approvalThreshold: "100000000",
    emergencyContacts: ["010-1234-5678", "010-2345-6789"],
    weekendApprovalAllowed: false,
    nightTimeApprovalAllowed: false
  },
  notificationSettings: {
    email: true,
    sms: true,
    slack: "https://hooks.slack.com/...",
    notifyOnDeposit: true,
    notifyOnWithdrawal: true,
    notifyOnSuspension: true
  },
  complianceProfile: {
    riskLevel: RiskLevel.LOW,
    amlScore: 25,
    sanctionsScreening: true,
    pepStatus: false,
    lastKycUpdate: new Date('2024-09-01'),
    nextKycReview: new Date('2024-12-01'),
    complianceNotes: ["Initial compliance review completed", "Low risk profile confirmed"]
  },
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-09-26'),
  approvedAt: new Date('2024-01-15'),
  approvedBy: "ADMIN-001"
};

// Recent activity mock data
const recentActivities = [
  {
    id: "ACT-001",
    type: "deposit",
    asset: "BTC",
    amount: "0.25",
    amountInKRW: "16500000",
    fromAddress: "bc1q...personal123",
    toAddress: "bc1q...xyz123",
    timestamp: new Date('2024-09-26T10:30:00'),
    status: "completed"
  },
  {
    id: "ACT-002",
    type: "withdrawal",
    asset: "ETH",
    amount: "5.0",
    amountInKRW: "17500000",
    fromAddress: "0x742d35Cc6639C7532c5B3C34FE3e2a3D",
    toAddress: "0x742d35Cc6639C7532c5B3C34FE3e2a3D",
    timestamp: new Date('2024-09-26T09:15:00'),
    status: "completed"
  },
  {
    id: "ACT-003",
    type: "deposit",
    asset: "USDT",
    amount: "50000",
    amountInKRW: "65000000",
    fromAddress: "0x8d12...external",
    toAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
    timestamp: new Date('2024-09-25T16:45:00'),
    status: "completed"
  }
];

export default function MemberOverviewPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [member, setMember] = useState<Member>(mockMember);

  // Calculate statistics
  const totalAssets = member.generatedDepositAddresses.reduce(
    (sum, asset) => sum + parseFloat(asset.balanceInKRW), 0
  );

  const totalDeposited = member.generatedDepositAddresses.reduce(
    (sum, asset) => sum + parseFloat(asset.totalDeposited), 0
  );

  const totalWithdrawn = member.generatedDepositAddresses.reduce(
    (sum, asset) => sum + parseFloat(asset.totalWithdrawn), 0
  );

  const totalTransactions = member.generatedDepositAddresses.reduce(
    (sum, asset) => sum + asset.transactionCount, 0
  );

  const monthlyUsage = (totalAssets / member.contractInfo.monthlyLimit) * 100;
  const dailyUsage = member.registeredAddresses.reduce(
    (sum, addr) => sum + (addr.dailyUsage?.depositAmount || 0) + (addr.dailyUsage?.withdrawalAmount || 0), 0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRiskScoreColor = (score: number) => {
    if (score > 50) return "text-red-600 dark:text-red-400";
    if (score > 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const StatusBadge = ({ status }: { status: MemberStatus }) => {
    const statusConfig = {
      [MemberStatus.ACTIVE]: {
        label: "활성",
        variant: "default" as const,
        icon: CheckCircle
      },
      [MemberStatus.PENDING]: {
        label: "대기",
        variant: "secondary" as const,
        icon: Clock
      },
      [MemberStatus.SUSPENDED]: {
        label: "정지",
        variant: "destructive" as const,
        icon: AlertTriangle
      },
      [MemberStatus.TERMINATED]: {
        label: "해지",
        variant: "outline" as const,
        icon: AlertTriangle
      }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {member.companyName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{member.companyName}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{member.businessNumber}</span>
              <Separator orientation="vertical" className="h-4" />
              <StatusBadge status={member.status} />
              <Separator orientation="vertical" className="h-4" />
              <span>가입일: {formatDate(member.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/members/${member.id}/assets`}>
            <Button variant="outline">
              <Wallet className="mr-2 h-4 w-4" />
              자산 관리
            </Button>
          </Link>
          <Link href={`/admin/members/${member.id}/addresses`}>
            <Button variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              주소 관리
            </Button>
          </Link>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            설정
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 보유 자산</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
            <p className="text-xs text-muted-foreground">
              {member.generatedDepositAddresses.length}개 자산 유형
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 거래 건수</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}건</div>
            <p className="text-xs text-muted-foreground">
              누적 입출금 거래
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월간 한도 사용률</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyUsage.toFixed(1)}%</div>
            <Progress value={monthlyUsage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(member.contractInfo.monthlyLimit)} 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AML 리스크 점수</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskScoreColor(member.complianceProfile.amlScore)}`}>
              {member.complianceProfile.amlScore}점
            </div>
            <p className="text-xs text-muted-foreground">
              {member.complianceProfile.amlScore > 50 ? '높음' :
               member.complianceProfile.amlScore > 30 ? '보통' : '낮음'} 리스크
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="assets">자산 요약</TabsTrigger>
          <TabsTrigger value="addresses">주소 요약</TabsTrigger>
          <TabsTrigger value="compliance">컴플라이언스</TabsTrigger>
          <TabsTrigger value="activity">최근 활동</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  회사 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">회사명</label>
                    <p className="font-medium">{member.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">사업자번호</label>
                    <p className="font-medium">{member.businessNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">계약 플랜</label>
                    <Badge className="mt-1">
                      {member.contractInfo.plan.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">수수료율</label>
                    <p className="font-medium">{member.contractInfo.feeRate}%</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">월간 한도</label>
                    <p className="font-medium">{formatCurrency(member.contractInfo.monthlyLimit)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">일일 한도</label>
                    <p className="font-medium">{formatCurrency(member.contractInfo.dailyLimit)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  담당자 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {member.contacts.map((contact, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{contact.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {contact.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        <span>{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{contact.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="grid gap-4">
            {member.generatedDepositAddresses.map((asset) => (
              <Card key={asset.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {asset.assetSymbol}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{asset.assetName} ({asset.assetSymbol})</h3>
                        <p className="text-sm text-muted-foreground">
                          입금 주소: {asset.depositAddress.slice(0, 20)}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{asset.balance} {asset.assetSymbol}</p>
                      <p className="text-muted-foreground">{formatCurrency(parseFloat(asset.balanceInKRW))}</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">총 입금</p>
                      <p className="font-medium">{asset.totalDeposited} {asset.assetSymbol}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">총 출금</p>
                      <p className="font-medium">{asset.totalWithdrawn} {asset.assetSymbol}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">거래 건수</p>
                      <p className="font-medium">{asset.transactionCount}건</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <div className="grid gap-4">
            {member.registeredAddresses.map((address) => (
              <Card key={address.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{address.label}</h3>
                        <Badge variant={address.type === 'personal' ? 'default' : 'secondary'}>
                          {address.type === 'personal' ? '개인' : 'VASP'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {address.address}
                      </p>
                      <div className="flex gap-2">
                        {address.permissions.canDeposit && (
                          <Badge variant="outline" className="text-xs">
                            <ArrowDownLeft className="h-3 w-3 mr-1" />
                            입금 가능
                          </Badge>
                        )}
                        {address.permissions.canWithdraw && (
                          <Badge variant="outline" className="text-xs">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            출금 가능
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {address.dailyLimits && (
                        <>
                          <p className="text-sm text-muted-foreground">일일 한도</p>
                          <p className="font-medium">{formatCurrency(address.dailyLimits.deposit)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            사용: {formatCurrency((address.dailyUsage?.depositAmount || 0) + (address.dailyUsage?.withdrawalAmount || 0))}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                컴플라이언스 상태
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">KYC 상태</span>
                  </div>
                  <p className="text-sm capitalize">{member.complianceProfile.riskLevel === RiskLevel.LOW ? "승인됨" : "검토중"}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">KYB 상태</span>
                  </div>
                  <p className="text-sm capitalize">{member.complianceProfile.sanctionsScreening ? "승인됨" : "대기중"}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`h-4 w-4 ${getRiskScoreColor(member.complianceProfile.amlScore).replace('text-', '')}`} />
                    <span className="font-medium">AML 점수</span>
                  </div>
                  <p className={`text-sm font-medium ${getRiskScoreColor(member.complianceProfile.amlScore)}`}>
                    {member.complianceProfile.amlScore}점
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">다음 검토</span>
                  </div>
                  <p className="text-sm">{formatDate(member.complianceProfile.nextKycReview)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">컴플라이언스 노트</h4>
                <div className="space-y-2">
                  {member.complianceProfile.complianceNotes.map((note, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                최근 활동 내역
              </CardTitle>
              <CardDescription>
                최근 7일간의 입출금 활동을 확인할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'deposit' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {activity.type === 'deposit' ? (
                        <ArrowDownLeft className={`h-4 w-4 ${
                          activity.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      ) : (
                        <ArrowUpRight className={`h-4 w-4 ${
                          activity.type === 'deposit' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{activity.type}</span>
                        <Badge variant="outline">{activity.asset}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.amount} {activity.asset} ({formatCurrency(parseFloat(activity.amountInKRW))})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(activity.timestamp)}</p>
                      <Badge variant="default" className="text-xs">완료</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}