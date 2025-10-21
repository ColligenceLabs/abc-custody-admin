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
import {
  Member,
  MemberStatus,
  OnboardingStatus,
  ContractPlan,
  AddressType,
  AddressStatus,
  ContactRole,
  ContactStatus,
  RiskLevel,
  getMemberName,
  getMemberIdNumber,
  isIndividualMember,
  isCorporateMember
} from '@/types/member';
import { MemberType } from '@/data/types/individualOnboarding';
import { corporateMember001 } from '@/services/mockMemberData';
import Link from "next/link";

// Mock data - 실제로는 API에서 가져올 데이터
const mockMember: Member = corporateMember001;
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

  // Recent activities mock data
  const recentActivities = [
    {
      id: '1',
      type: 'deposit',
      asset: 'BTC',
      amount: '0.5',
      amountInKRW: '25000000',
      timestamp: new Date(),
      status: 'completed'
    },
    {
      id: '2',
      type: 'withdrawal',
      asset: 'ETH',
      amount: '10',
      amountInKRW: '30000000',
      timestamp: new Date(),
      status: 'completed'
    }
  ];

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
              {getMemberName(member).charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{getMemberName(member)}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{getMemberIdNumber(member)}</span>
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
                    <p className="font-medium">{getMemberName(member)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">사업자번호</label>
                    <p className="font-medium">{getMemberIdNumber(member)}</p>
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