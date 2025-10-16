/**
 * Member Addresses Management Page
 * 회원사 주소 관리 모니터링 페이지 - 회원사가 등록한 입출금 주소 모니터링
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Eye,
  Copy,
  Flag,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
  CreditCard,
  Building,
  User,
  ExternalLink,
  Edit,
  Ban,
  Check,
  X,
  Plus
} from "lucide-react";
import { RegisteredAddress, AddressType, AddressStatus } from '@/types/member';
import Link from "next/link";

// Mock audit log data
interface AddressAuditLog {
  id: string;
  addressId: string;
  action: 'created' | 'updated' | 'flagged' | 'unflagged' | 'suspended' | 'activated';
  oldValue?: any;
  newValue?: any;
  reason?: string;
  actor: string; // Who performed the action
  actorType: 'member' | 'admin' | 'system';
  timestamp: Date;
  ipAddress?: string;
  details?: any;
}

// Mock data for registered addresses
const mockAddresses: RegisteredAddress[] = [
  {
    id: "REG-001",
    memberId: "MEM-001",
    label: "CEO 개인 지갑",
    address: "bc1q742d35cc6639c7532c5b3c34fe3e2a3d6c9personal123",
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
    addedAt: new Date('2024-01-20T10:30:00'),
    addedBy: "CEO-001",
    lastUsedAt: new Date('2024-09-25T14:20:00'),
    notes: "회사 대표의 개인 지갑 주소입니다."
  },
  {
    id: "REG-002",
    memberId: "MEM-001",
    label: "업비트 출금 전용",
    address: "0x742d35Cc6639C7532c5B3C34FE3e2a3Dupbit456",
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
    addedAt: new Date('2024-02-10T15:45:00'),
    addedBy: "CFO-001",
    lastUsedAt: new Date('2024-09-26T09:15:00'),
    notes: "업비트 거래소 출금 전용 주소. Travel Rule 연동 완료."
  },
  {
    id: "REG-003",
    memberId: "MEM-001",
    label: "바이낸스 입출금",
    address: "0x8d12A197cB00D4747a1fe03395095ce2binance789",
    coin: "USDT",
    type: AddressType.VASP,
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    vaspInfo: {
      businessName: "바이낸스",
      travelRuleConnected: true,
      complianceScore: 88,
      jurisdiction: "MT"
    },
    dailyUsage: {
      date: "2024-09-26",
      depositAmount: 5000000,
      withdrawalAmount: 3000000
    },
    status: AddressStatus.ACTIVE,
    addedAt: new Date('2024-03-15T11:20:00'),
    addedBy: "TRADER-001",
    lastUsedAt: new Date('2024-09-26T11:30:00'),
    notes: "바이낸스 거래소 메인 거래용 주소입니다."
  },
  {
    id: "REG-004",
    memberId: "MEM-001",
    label: "의심스러운 개인 지갑",
    address: "bc1q123456suspicious789abcdef0123456789suspicious",
    coin: "BTC",
    type: AddressType.PERSONAL,
    permissions: {
      canDeposit: false,
      canWithdraw: false
    },
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2024-09-26",
      depositAmount: 0,
      withdrawalAmount: 0
    },
    status: AddressStatus.SUSPENDED,
    addedAt: new Date('2024-08-10T16:30:00'),
    addedBy: "TRADER-002",
    lastUsedAt: new Date('2024-08-15T13:45:00'),
    flaggedAt: new Date('2024-08-16T10:00:00'),
    flaggedBy: "ADMIN-001",
    flagReason: "AML 알고리즘에서 높은 리스크 점수 감지. 제재 목록과의 유사성 발견.",
    notes: "관리자에 의해 플래그됨. 추가 조사 필요."
  },
  {
    id: "REG-005",
    memberId: "MEM-001",
    label: "임시 테스트 지갑",
    address: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRHtest123",
    coin: "XRP",
    type: AddressType.PERSONAL,
    permissions: {
      canDeposit: true,
      canWithdraw: false
    },
    dailyLimits: {
      deposit: 500000,
      withdrawal: 0
    },
    dailyUsage: {
      date: "2024-09-26",
      depositAmount: 0,
      withdrawalAmount: 0
    },
    status: AddressStatus.BLOCKED,
    addedAt: new Date('2024-09-01T09:15:00'),
    addedBy: "DEV-001",
    lastUsedAt: new Date('2024-09-01T09:20:00'),
    notes: "테스트용 임시 주소. 사용 완료 후 차단됨."
  }
];

// Mock audit log data
const mockAuditLog: AddressAuditLog[] = [
  {
    id: "AUDIT-001",
    addressId: "REG-004",
    action: 'flagged',
    reason: "AML 알고리즘에서 높은 리스크 점수 감지",
    actor: "ADMIN-001",
    actorType: 'admin',
    timestamp: new Date('2024-08-16T10:00:00'),
    ipAddress: "192.168.1.100",
    details: {
      riskScore: 85,
      flagType: "aml_risk",
      autoFlag: false
    }
  },
  {
    id: "AUDIT-002",
    addressId: "REG-004",
    action: 'suspended',
    reason: "관리자 플래그 후 자동 권한 정지",
    actor: "시스템",
    actorType: 'system',
    timestamp: new Date('2024-08-16T10:01:00'),
    details: {
      oldPermissions: { canDeposit: true, canWithdraw: true },
      newPermissions: { canDeposit: false, canWithdraw: false }
    }
  },
  {
    id: "AUDIT-003",
    addressId: "REG-005",
    action: 'created',
    actor: "DEV-001",
    actorType: 'member',
    timestamp: new Date('2024-09-01T09:15:00'),
    ipAddress: "10.0.0.50",
    details: {
      label: "임시 테스트 지갑",
      permissions: { canDeposit: true, canWithdraw: false }
    }
  },
  {
    id: "AUDIT-004",
    addressId: "REG-005",
    action: 'updated',
    oldValue: { status: "active" },
    newValue: { status: "blocked" },
    reason: "테스트 완료 후 차단",
    actor: "ADMIN-002",
    actorType: 'admin',
    timestamp: new Date('2024-09-01T17:30:00'),
    ipAddress: "192.168.1.101"
  }
];

export default function MemberAddressesPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [addresses, setAddresses] = useState<RegisteredAddress[]>(mockAddresses);
  const [auditLog, setAuditLog] = useState<AddressAuditLog[]>(mockAuditLog);
  const [selectedAddress, setSelectedAddress] = useState<RegisteredAddress | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");

  // Filter addresses
  const filteredAddresses = addresses.filter(address => {
    const matchesSearch =
      address.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.coin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || address.type === typeFilter;
    const matchesStatus = statusFilter === "all" || address.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: addresses.length,
    active: addresses.filter(a => a.status === AddressStatus.ACTIVE).length,
    flagged: addresses.filter(a => a.flaggedAt).length,
    blocked: addresses.filter(a => a.status === AddressStatus.BLOCKED).length,
    personalWallets: addresses.filter(a => a.type === AddressType.PERSONAL).length,
    vaspWallets: addresses.filter(a => a.type === AddressType.VASP).length,
    totalDailyUsage: addresses.reduce((sum, addr) =>
      sum + (addr.dailyUsage?.depositAmount || 0) + (addr.dailyUsage?.withdrawalAmount || 0), 0
    ),
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
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success toast
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStatusBadge = (status: AddressStatus, flagged?: boolean) => {
    if (flagged) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Flag className="h-3 w-3" />
          플래그됨
        </Badge>
      );
    }

    const statusConfig = {
      [AddressStatus.ACTIVE]: {
        label: "활성",
        variant: "default" as const,
        icon: CheckCircle
      },
      [AddressStatus.SUSPENDED]: {
        label: "정지",
        variant: "destructive" as const,
        icon: AlertTriangle
      },
      [AddressStatus.BLOCKED]: {
        label: "차단",
        variant: "outline" as const,
        icon: XCircle
      },
      [AddressStatus.FLAGGED]: {
        label: "신고됨",
        variant: "destructive" as const,
        icon: AlertTriangle
      },
      [AddressStatus.PENDING_REVIEW]: {
        label: "검토대기",
        variant: "secondary" as const,
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

  const getTypeBadge = (type: AddressType) => {
    return type === AddressType.PERSONAL ? (
      <Badge variant="default" className="flex items-center gap-1">
        <User className="h-3 w-3" />
        개인
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Building className="h-3 w-3" />
        VASP
      </Badge>
    );
  };

  const getPermissionBadges = (permissions: { canDeposit: boolean; canWithdraw: boolean }) => {
    const badges = [];
    if (permissions.canDeposit) {
      badges.push(
        <Badge key="deposit" variant="outline" className="text-xs">
          <ArrowDownLeft className="h-3 w-3 mr-1" />
          입금
        </Badge>
      );
    }
    if (permissions.canWithdraw) {
      badges.push(
        <Badge key="withdraw" variant="outline" className="text-xs">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          출금
        </Badge>
      );
    }
    return badges;
  };

  const handleFlagAddress = (address: RegisteredAddress) => {
    setSelectedAddress(address);
    setIsDetailModalOpen(true);
  };

  const calculateLimitUsage = (usage: number, limit: number) => {
    return limit > 0 ? (usage / limit) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">주소 관리</h1>
          <p className="text-muted-foreground">
            회원사가 등록한 입출금 주소를 모니터링하고 관리합니다
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/members/${memberId}/overview`}>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              회원사 개요
            </Button>
          </Link>
          <Button>
            <Activity className="mr-2 h-4 w-4" />
            실시간 모니터링
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">등록된 주소</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}개</div>
            <p className="text-xs text-muted-foreground">
              활성 {stats.active}개 · 플래그 {stats.flagged}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">일일 사용량</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalDailyUsage)}</div>
            <p className="text-xs text-muted-foreground">
              오늘 입출금 총합
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">개인 지갑</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.personalWallets}개</div>
            <p className="text-xs text-muted-foreground">
              일일 한도 적용
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VASP 지갑</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vaspWallets}개</div>
            <p className="text-xs text-muted-foreground">
              Travel Rule 연동
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="addresses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="addresses">주소 목록</TabsTrigger>
          <TabsTrigger value="limits">한도 관리</TabsTrigger>
          <TabsTrigger value="audit">감사 로그</TabsTrigger>
        </TabsList>

        <TabsContent value="addresses" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="라벨, 주소, 코인으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="유형" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 유형</SelectItem>
                      <SelectItem value={AddressType.PERSONAL}>개인</SelectItem>
                      <SelectItem value={AddressType.VASP}>VASP</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 상태</SelectItem>
                      <SelectItem value={AddressStatus.ACTIVE}>활성</SelectItem>
                      <SelectItem value={AddressStatus.SUSPENDED}>정지</SelectItem>
                      <SelectItem value={AddressStatus.BLOCKED}>차단</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Addresses Table */}
          <Card>
            <CardHeader>
              <CardTitle>등록 주소 목록 ({filteredAddresses.length}개)</CardTitle>
              <CardDescription>
                회원사가 직접 등록하고 관리하는 입출금 주소들입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주소 정보</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>권한</TableHead>
                      <TableHead>일일 사용량</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>등록/사용</TableHead>
                      <TableHead className="w-[100px]">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAddresses.map((address) => {
                      const depositUsage = address.dailyLimits
                        ? calculateLimitUsage(address.dailyUsage?.depositAmount || 0, address.dailyLimits.deposit)
                        : 0;
                      const withdrawalUsage = address.dailyLimits
                        ? calculateLimitUsage(address.dailyUsage?.withdrawalAmount || 0, address.dailyLimits.withdrawal)
                        : 0;

                      return (
                        <TableRow key={address.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{address.label}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="bg-muted px-2 py-1 rounded text-xs">
                                  {address.address.slice(0, 12)}...{address.address.slice(-8)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(address.address)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {address.coin}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getTypeBadge(address.type)}
                              {address.vaspInfo && (
                                <div className="text-xs text-muted-foreground">
                                  {address.vaspInfo.businessName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {getPermissionBadges(address.permissions)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {address.dailyLimits ? (
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-sm">
                                    <span>입금</span>
                                    <span>{depositUsage.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={depositUsage} className="h-1" />
                                  <div className="text-xs text-muted-foreground">
                                    {formatCurrency(address.dailyUsage?.depositAmount || 0)} / {formatCurrency(address.dailyLimits.deposit)}
                                  </div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm">
                                    <span>출금</span>
                                    <span>{withdrawalUsage.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={withdrawalUsage} className="h-1" />
                                  <div className="text-xs text-muted-foreground">
                                    {formatCurrency(address.dailyUsage?.withdrawalAmount || 0)} / {formatCurrency(address.dailyLimits.withdrawal)}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">한도 없음</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(address.status, !!address.flaggedAt)}
                            {address.flaggedAt && (
                              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                {formatDate(address.flaggedAt)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>등록: {formatDate(address.addedAt)}</div>
                              <div className="text-muted-foreground">
                                {address.lastUsedAt ? `사용: ${formatDate(address.lastUsedAt)}` : '미사용'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFlagAddress(address)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {address.status === AddressStatus.ACTIVE && !address.flaggedAt && (
                                <Button variant="ghost" size="sm">
                                  <Flag className="h-4 w-4" />
                                </Button>
                              )}
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
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <div className="grid gap-4">
            {addresses
              .filter(addr => addr.type === AddressType.PERSONAL && addr.dailyLimits)
              .map((address) => {
                const depositUsage = calculateLimitUsage(
                  address.dailyUsage?.depositAmount || 0,
                  address.dailyLimits!.deposit
                );
                const withdrawalUsage = calculateLimitUsage(
                  address.dailyUsage?.withdrawalAmount || 0,
                  address.dailyLimits!.withdrawal
                );

                return (
                  <Card key={address.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{address.label}</CardTitle>
                          <CardDescription>
                            {address.coin} · 개인 지갑 · 일일 한도 적용
                          </CardDescription>
                        </div>
                        {getStatusBadge(address.status, !!address.flaggedAt)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            입금 한도
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>사용량</span>
                              <span className="font-medium">{depositUsage.toFixed(1)}%</span>
                            </div>
                            <Progress value={depositUsage} />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{formatCurrency(address.dailyUsage?.depositAmount || 0)}</span>
                              <span>{formatCurrency(address.dailyLimits!.deposit)}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4 text-blue-600" />
                            출금 한도
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>사용량</span>
                              <span className="font-medium">{withdrawalUsage.toFixed(1)}%</span>
                            </div>
                            <Progress value={withdrawalUsage} />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{formatCurrency(address.dailyUsage?.withdrawalAmount || 0)}</span>
                              <span>{formatCurrency(address.dailyLimits!.withdrawal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                주소 변경 감사 로그
              </CardTitle>
              <CardDescription>
                주소 등록, 수정, 플래그 등의 모든 변경 이력을 확인할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLog.map((log) => {
                  const address = addresses.find(a => a.id === log.addressId);
                  const actionIcons = {
                    'created': Plus,
                    'updated': Edit,
                    'flagged': Flag,
                    'unflagged': Check,
                    'suspended': Ban,
                    'activated': CheckCircle
                  };
                  const ActionIcon = actionIcons[log.action] || Activity;

                  return (
                    <div key={log.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        log.action === 'flagged' || log.action === 'suspended'
                          ? 'bg-red-100 dark:bg-red-900'
                          : log.action === 'created' || log.action === 'activated'
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-blue-100 dark:bg-blue-900'
                      }`}>
                        <ActionIcon className={`h-4 w-4 ${
                          log.action === 'flagged' || log.action === 'suspended'
                            ? 'text-red-600 dark:text-red-400'
                            : log.action === 'created' || log.action === 'activated'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium capitalize">{log.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {address?.label || log.addressId}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            by {log.actor} ({log.actorType})
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDate(log.timestamp)}
                          {log.ipAddress && ` · ${log.ipAddress}`}
                        </p>
                        {log.reason && (
                          <p className="text-sm">{log.reason}</p>
                        )}
                        {log.details && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <pre className="bg-muted p-2 rounded">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Address Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              주소 상세 정보
            </DialogTitle>
          </DialogHeader>
          {selectedAddress && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">라벨</label>
                  <p className="font-medium">{selectedAddress.label}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">코인</label>
                  <p className="font-medium">{selectedAddress.coin}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">주소</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted px-3 py-2 rounded text-sm flex-1">
                    {selectedAddress.address}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedAddress.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">유형</label>
                  <div className="mt-1">{getTypeBadge(selectedAddress.type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">상태</label>
                  <div className="mt-1">{getStatusBadge(selectedAddress.status, !!selectedAddress.flaggedAt)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">권한</label>
                  <div className="mt-1 space-y-1">
                    {getPermissionBadges(selectedAddress.permissions)}
                  </div>
                </div>
              </div>
              {selectedAddress.vaspInfo && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">VASP 정보</label>
                  <div className="mt-1 p-3 border rounded-lg">
                    <p className="font-medium">{selectedAddress.vaspInfo.businessName}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Travel Rule: {selectedAddress.vaspInfo.travelRuleConnected ? '연동됨' : '미연동'}
                      </div>
                      <div>
                        컴플라이언스 점수: {selectedAddress.vaspInfo.complianceScore}점
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedAddress.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">메모</label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedAddress.notes}</p>
                </div>
              )}
              {selectedAddress.flaggedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">플래그 사유</label>
                  <p className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm">
                    {selectedAddress.flagReason}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    플래그됨: {formatDate(selectedAddress.flaggedAt)} by {selectedAddress.flaggedBy}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedAddress.status === AddressStatus.ACTIVE && !selectedAddress.flaggedAt && (
                  <Button variant="destructive" size="sm">
                    <Flag className="mr-2 h-4 w-4" />
                    플래그 처리
                  </Button>
                )}
                {selectedAddress.flaggedAt && selectedAddress.status === AddressStatus.SUSPENDED && (
                  <Button variant="default" size="sm">
                    <Check className="mr-2 h-4 w-4" />
                    플래그 해제
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  블록체인 탐색기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}