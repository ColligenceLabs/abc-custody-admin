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
  ArrowUpDown
} from "lucide-react";
import {
  Member,
  MemberStatus,
  OnboardingStatus,
  ContractPlan,
  ContactRole,
  ContactStatus,
  RiskLevel,
  getMemberName,
  getMemberIdNumber,
  getMemberTypeLabel,
  isIndividualMember,
  isCorporateMember
} from '@/types/member';
import { MemberType } from '@/data/types/individualOnboarding';
import { allMockMembers } from '@/services/mockMemberData';
import Link from "next/link";

// Mock data for member list
const mockMembers: Member[] = allMockMembers;

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

const MemberTypeBadge = ({ member }: { member: Member }) => {
  const isIndividual = isIndividualMember(member);

  return (
    <Badge
      variant="outline"
      className={isIndividual
        ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300"
        : "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
      }
    >
      {getMemberTypeLabel(member)}
    </Badge>
  );
};

export default function MemberListPage() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("companyName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filter and search logic
  const filteredMembers = members.filter(member => {
    const memberName = getMemberName(member);
    const memberIdNumber = getMemberIdNumber(member);
    const matchesSearch =
      memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberIdNumber.includes(searchTerm) ||
      member.contacts[0]?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.contacts[0]?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMemberType = memberTypeFilter === "all" || member.memberType === memberTypeFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesPlan = planFilter === "all" || member.contractInfo.plan === planFilter;

    return matchesSearch && matchesMemberType && matchesStatus && matchesPlan;
  });

  // Sort logic
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case "companyName":
        aValue = getMemberName(a);
        bValue = getMemberName(b);
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
        aValue = getMemberName(a);
        bValue = getMemberName(b);
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
    individual: members.filter(m => isIndividualMember(m)).length,
    corporate: members.filter(m => isCorporateMember(m)).length,
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
              개인 {stats.individual}개 · 기업 {stats.corporate}개
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
              <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="회원 타입" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 타입</SelectItem>
                  <SelectItem value={MemberType.INDIVIDUAL}>개인 회원</SelectItem>
                  <SelectItem value={MemberType.CORPORATE}>기업 회원</SelectItem>
                </SelectContent>
              </Select>

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
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('companyName')} className="h-auto p-0">
                      회원 정보
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
                              {getMemberName(member).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{getMemberName(member)}</span>
                              <MemberTypeBadge member={member} />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getMemberIdNumber(member)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {member.contacts[0]?.name} ({member.contacts[0]?.email})
                            </div>
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
                        <Link href={`/admin/members/${member.id}/overview`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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