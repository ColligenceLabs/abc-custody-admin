/**
 * Member List Management Page
 * 회원사 목록 관리 페이지 - 전체 회원사 목록 및 상태 관리
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  Eye,
  Settings,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpDown,
  MoreHorizontal
} from "lucide-react";
import { Member, MemberStatus, OnboardingStatus, ContractPlan, ContactRole, ContactStatus, RiskLevel } from '@/types/member';
import Link from "next/link";

// Mock data for member list
const mockMembers: Member[] = [
  {
    id: "MEM-001",
    type: 'corporate',
    companyName: "테크놀로지 코퍼레이션",
    businessNumber: "123-45-67890",
    status: MemberStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.APPROVED,
    contractInfo: {
      plan: ContractPlan.ENTERPRISE,
      feeRate: 0.15,
      monthlyLimit: 10000000000, // 100억원
      dailyLimit: 1000000000,    // 10억원
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
      }
    ],
    registeredAddresses: [],
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
      }
    ],
    approvalSettings: {
      requiredApprovers: 2,
      approvalThreshold: "100000000",
      emergencyContacts: ["010-1234-5678"],
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
      complianceNotes: ["Initial compliance review completed"]
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-09-26'),
    approvedAt: new Date('2024-01-15'),
    approvedBy: "ADMIN-001"
  },
  {
    id: "MEM-002",
    type: 'corporate',
    companyName: "블록체인 솔루션스",
    businessNumber: "234-56-78901",
    status: MemberStatus.ACTIVE,
    onboardingStatus: OnboardingStatus.APPROVED,
    contractInfo: {
      plan: ContractPlan.PREMIUM,
      feeRate: 0.20,
      monthlyLimit: 5000000000,
      dailyLimit: 500000000,
      startDate: new Date('2024-03-01'),
      autoRenewal: true
    },
    generatedDepositAddresses: [
      {
        id: "ADDR-003",
        memberId: "MEM-002",
        assetSymbol: "USDT",
        assetName: "Tether USD",
        depositAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819",
        balance: "250000",
        balanceInKRW: "325000000",
        isActive: true,
        createdAt: new Date('2024-03-01'),
        lastActivityAt: new Date('2024-09-24'),
        totalDeposited: "500000",
        totalWithdrawn: "250000",
        transactionCount: 18
      }
    ],
    registeredAddresses: [],
    contacts: [
      {
        id: "CON-002",
        name: "이영희",
        email: "lee@blockchain.co.kr",
        phone: "010-2345-6789",
        role: ContactRole.ADMIN,
        status: ContactStatus.ACTIVE,
        isPrimary: true,
        twoFactorEnabled: true,
        lastLogin: new Date('2024-09-25T14:15:00')
      }
    ],
    approvalSettings: {
      requiredApprovers: 1,
      approvalThreshold: "50000000",
      emergencyContacts: ["010-2345-6789"],
      weekendApprovalAllowed: false,
      nightTimeApprovalAllowed: false
    },
    notificationSettings: {
      email: true,
      sms: false,
      notifyOnDeposit: true,
      notifyOnWithdrawal: true,
      notifyOnSuspension: true
    },
    complianceProfile: {
      riskLevel: RiskLevel.LOW,
      amlScore: 15,
      sanctionsScreening: true,
      pepStatus: false,
      lastKycUpdate: new Date('2024-08-15'),
      nextKycReview: new Date('2024-11-15'),
      complianceNotes: ["Approved after initial review"]
    },
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-09-24'),
    approvedAt: new Date('2024-03-01'),
    approvedBy: "ADMIN-002"
  },
  {
    id: "MEM-003",
    type: 'corporate',
    companyName: "글로벌 핀테크",
    businessNumber: "345-67-89012",
    status: MemberStatus.SUSPENDED,
    onboardingStatus: OnboardingStatus.APPROVED,
    contractInfo: {
      plan: ContractPlan.BASIC,
      feeRate: 0.25,
      monthlyLimit: 1000000000,
      dailyLimit: 100000000,
      startDate: new Date('2024-06-01'),
      autoRenewal: false
    },
    generatedDepositAddresses: [
      {
        id: "ADDR-004",
        memberId: "MEM-003",
        assetSymbol: "BTC",
        assetName: "Bitcoin",
        depositAddress: "bc1q...abc456",
        balance: "0.15",
        balanceInKRW: "10000000",
        isActive: false,
        createdAt: new Date('2024-06-01'),
        lastActivityAt: new Date('2024-08-30'),
        totalDeposited: "2.50",
        totalWithdrawn: "2.35",
        transactionCount: 8
      }
    ],
    registeredAddresses: [],
    contacts: [
      {
        id: "CON-003",
        name: "박민수",
        email: "park@global-fintech.com",
        phone: "010-3456-7890",
        role: ContactRole.ADMIN,
        status: ContactStatus.ACTIVE,
        isPrimary: true,
        twoFactorEnabled: true,
        lastLogin: new Date('2024-09-24T09:00:00')
      }
    ],
    approvalSettings: {
      requiredApprovers: 1,
      approvalThreshold: "10000000",
      emergencyContacts: ["010-3456-7890"],
      weekendApprovalAllowed: false,
      nightTimeApprovalAllowed: false
    },
    notificationSettings: {
      email: true,
      sms: true,
      notifyOnDeposit: true,
      notifyOnWithdrawal: true,
      notifyOnSuspension: true
    },
    complianceProfile: {
      riskLevel: RiskLevel.MEDIUM,
      amlScore: 65,
      sanctionsScreening: true,
      pepStatus: true,
      lastKycUpdate: new Date('2024-08-01'),
      nextKycReview: new Date('2024-10-01'),
      complianceNotes: ["Medium risk profile", "PEP status requires additional monitoring"]
    },
    createdAt: new Date('2024-05-20'),
    updatedAt: new Date('2024-09-15'),
    approvedAt: new Date('2024-06-01'),
    approvedBy: "ADMIN-001",
    suspendedAt: new Date('2024-09-15'),
    suspendedBy: "ADMIN-003",
    suspensionReason: "High AML risk score - requires manual review"
  }
];

// Status badge components
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
      icon: XCircle
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

const PlanBadge = ({ plan }: { plan: ContractPlan }) => {
  const planConfig = {
    [ContractPlan.BASIC]: {
      label: "Basic",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    },
    [ContractPlan.PREMIUM]: {
      label: "Premium",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    },
    [ContractPlan.ENTERPRISE]: {
      label: "Enterprise",
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    }
  };

  const config = planConfig[plan];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

export default function MemberListPage() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("companyName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter and search logic
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.businessNumber.includes(searchTerm) ||
      member.contacts[0]?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.contacts[0]?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesPlan = planFilter === "all" || member.contractInfo.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Sort logic
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case "companyName":
        aValue = a.companyName;
        bValue = b.companyName;
        break;
      case "createdAt":
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case "totalAssets":
        aValue = a.generatedDepositAddresses.reduce((sum, asset) => sum + parseFloat(asset.balanceInKRW), 0);
        bValue = b.generatedDepositAddresses.reduce((sum, asset) => sum + parseFloat(asset.balanceInKRW), 0);
        break;
      case "amlScore":
        aValue = a.complianceProfile.amlScore;
        bValue = b.complianceProfile.amlScore;
        break;
      default:
        aValue = a.companyName;
        bValue = b.companyName;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Calculate statistics
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === MemberStatus.ACTIVE).length,
    suspended: members.filter(m => m.status === MemberStatus.SUSPENDED).length,
    pending: members.filter(m => m.status === MemberStatus.PENDING).length,
    totalAssets: members.reduce((sum, member) =>
      sum + member.generatedDepositAddresses.reduce((memberSum, asset) =>
        memberSum + parseFloat(asset.balanceInKRW), 0), 0),
    highRisk: members.filter(m => m.complianceProfile.amlScore > 50).length
  };

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
      day: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">회원사 관리</h1>
          <p className="text-muted-foreground">
            전체 회원사 목록 및 상태를 관리합니다
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            설정
          </Button>
          <Link href="/admin/members/onboarding">
            <Button>
              <Building className="mr-2 h-4 w-4" />
              온보딩 관리
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 회원사</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}개</div>
            <p className="text-xs text-muted-foreground">
              활성 {stats.active}개 · 정지 {stats.suspended}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 관리 자산</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAssets)}</div>
            <p className="text-xs text-muted-foreground">
              전체 회원사 보유 자산
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 거래량</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156건</div>
            <p className="text-xs text-muted-foreground">
              일일 평균 거래 건수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">높은 리스크</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRisk}개</div>
            <p className="text-xs text-muted-foreground">
              AML 점수 50점 이상
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="회사명, 사업자번호, 담당자명, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value={MemberStatus.ACTIVE}>활성</SelectItem>
                  <SelectItem value={MemberStatus.SUSPENDED}>정지</SelectItem>
                  <SelectItem value={MemberStatus.PENDING}>대기</SelectItem>
                  <SelectItem value={MemberStatus.TERMINATED}>해지</SelectItem>
                </SelectContent>
              </Select>

              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="플랜" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 플랜</SelectItem>
                  <SelectItem value={ContractPlan.BASIC}>Basic</SelectItem>
                  <SelectItem value={ContractPlan.PREMIUM}>Premium</SelectItem>
                  <SelectItem value={ContractPlan.ENTERPRISE}>Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>회원사 목록 ({sortedMembers.length}개)</CardTitle>
          <CardDescription>
            등록된 회원사들의 상태 및 정보를 확인할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>회원사</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('companyName')} className="h-auto p-0">
                      회사명
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>플랜</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" onClick={() => handleSort('totalAssets')} className="h-auto p-0">
                      보유 자산
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('amlScore')} className="h-auto p-0">
                      리스크 점수
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('createdAt')} className="h-auto p-0">
                      가입일
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px]">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member) => {
                  const totalAssets = member.generatedDepositAddresses.reduce(
                    (sum, asset) => sum + parseFloat(asset.balanceInKRW), 0
                  );

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.companyName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.companyName}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.businessNumber}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.contacts[0]?.name} ({member.contacts[0]?.email})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={member.status} />
                      </TableCell>
                      <TableCell>
                        <PlanBadge plan={member.contractInfo.plan} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{formatCurrency(totalAssets)}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.generatedDepositAddresses.length}개 자산
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className={`text-sm font-medium ${
                            member.complianceProfile.amlScore > 50
                              ? 'text-red-600 dark:text-red-400'
                              : member.complianceProfile.amlScore > 30
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                          }`}>
                            {member.complianceProfile.amlScore}점
                          </div>
                          {member.complianceProfile.amlScore > 50 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(member.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link href={`/admin/members/${member.id}/overview`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}