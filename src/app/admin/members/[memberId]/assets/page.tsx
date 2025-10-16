/**
 * Member Asset Management Page
 * 회원사 자산 관리 모니터링 페이지 - 자동 생성된 입금 주소 및 거래 내역 관리
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  Copy,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Minus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { MemberAsset } from '@/types/member';
import Link from "next/link";

// Mock transaction data
interface Transaction {
  id: string;
  txHash: string;
  type: 'deposit' | 'withdrawal';
  amount: string;
  amountInKRW: string;
  fromAddress: string;
  toAddress: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  confirmations: number;
  note?: string;
}

// Mock asset timeline data
interface AssetTimelineEvent {
  id: string;
  type: 'asset_added' | 'asset_removed' | 'address_generated' | 'status_changed';
  assetSymbol: string;
  description: string;
  timestamp: Date;
  actor: string; // Who performed the action
  details?: any;
}

// Mock data
const mockAssets: MemberAsset[] = [
  {
    id: "ADDR-001",
    memberId: "MEM-001",
    assetSymbol: "BTC",
    assetName: "Bitcoin",
    depositAddress: "bc1q742d35cc6639c7532c5b3c34fe3e2a3d6c9abc123",
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
    depositAddress: "0x742d35Cc6639C7532c5B3C34FE3e2a3D6c9abc123",
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
  },
  {
    id: "ADDR-004",
    memberId: "MEM-001",
    assetSymbol: "XRP",
    assetName: "XRP",
    depositAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    balance: "0",
    balanceInKRW: "0",
    isActive: false,
    createdAt: new Date('2024-08-15'),
    lastActivityAt: new Date('2024-08-20'),
    totalDeposited: "50000",
    totalWithdrawn: "50000",
    transactionCount: 4
  }
];

const mockTransactions: { [assetId: string]: Transaction[] } = {
  "ADDR-001": [
    {
      id: "TX-001",
      txHash: "a1b2c3d4e5f6789012345678901234567890abcdef",
      type: 'deposit',
      amount: "0.25",
      amountInKRW: "16500000",
      fromAddress: "bc1q...personal123",
      toAddress: "bc1q742d35cc6639c7532c5b3c34fe3e2a3d6c9abc123",
      status: 'completed',
      timestamp: new Date('2024-09-26T10:30:00'),
      blockNumber: 860123,
      confirmations: 6,
      gasUsed: "21000",
      gasPrice: "15"
    },
    {
      id: "TX-002",
      txHash: "f6e5d4c3b2a1987654321098765432109876543210fedcba",
      type: 'withdrawal',
      amount: "1.0",
      amountInKRW: "66000000",
      fromAddress: "bc1q742d35cc6639c7532c5b3c34fe3e2a3d6c9abc123",
      toAddress: "bc1q...external456",
      status: 'completed',
      timestamp: new Date('2024-09-25T14:15:00'),
      blockNumber: 860098,
      confirmations: 42,
      gasUsed: "21000",
      gasPrice: "12"
    },
    {
      id: "TX-003",
      txHash: "123456789abcdef0123456789abcdef0123456789abcdef",
      type: 'deposit',
      amount: "2.1",
      amountInKRW: "138600000",
      fromAddress: "bc1q...company789",
      toAddress: "bc1q742d35cc6639c7532c5b3c34fe3e2a3d6c9abc123",
      status: 'completed',
      timestamp: new Date('2024-09-24T09:20:00'),
      blockNumber: 860045,
      confirmations: 156,
      gasUsed: "21000",
      gasPrice: "10"
    }
  ]
};

const mockTimeline: AssetTimelineEvent[] = [
  {
    id: "TL-001",
    type: 'asset_added',
    assetSymbol: "BTC",
    description: "Bitcoin 자산이 추가되고 입금 주소가 생성되었습니다",
    timestamp: new Date('2024-01-15T10:00:00'),
    actor: "시스템",
    details: { depositAddress: "bc1q742d35cc6639c7532c5b3c34fe3e2a3d6c9abc123" }
  },
  {
    id: "TL-002",
    type: 'asset_added',
    assetSymbol: "ETH",
    description: "Ethereum 자산이 추가되고 입금 주소가 생성되었습니다",
    timestamp: new Date('2024-01-15T10:05:00'),
    actor: "시스템",
    details: { depositAddress: "0x742d35Cc6639C7532c5B3C34FE3e2a3D6c9abc123" }
  },
  {
    id: "TL-003",
    type: 'asset_added',
    assetSymbol: "USDT",
    description: "Tether USD 자산이 추가되고 입금 주소가 생성되었습니다",
    timestamp: new Date('2024-02-01T14:30:00'),
    actor: "관리자",
    details: { depositAddress: "0x8d12A197cB00D4747a1fe03395095ce2A5CC6819" }
  },
  {
    id: "TL-004",
    type: 'asset_added',
    assetSymbol: "XRP",
    description: "XRP 자산이 추가되고 입금 주소가 생성되었습니다",
    timestamp: new Date('2024-08-15T11:20:00'),
    actor: "관리자",
    details: { depositAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH" }
  },
  {
    id: "TL-005",
    type: 'status_changed',
    assetSymbol: "XRP",
    description: "XRP 자산이 비활성화되었습니다 (잔액 0원)",
    timestamp: new Date('2024-08-20T16:45:00'),
    actor: "시스템",
    details: { reason: "zero_balance", oldStatus: "active", newStatus: "inactive" }
  }
];

export default function MemberAssetsPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [assets, setAssets] = useState<MemberAsset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<MemberAsset | null>(null);
  const [selectedAssetTransactions, setSelectedAssetTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timelineEvents, setTimelineEvents] = useState<AssetTimelineEvent[]>(mockTimeline);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Filter assets based on search and status
  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.assetSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.depositAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && asset.isActive) ||
      (statusFilter === "inactive" && !asset.isActive);

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalAssets: assets.length,
    activeAssets: assets.filter(a => a.isActive).length,
    totalValue: assets.reduce((sum, asset) => sum + parseFloat(asset.balanceInKRW), 0),
    totalTransactions: assets.reduce((sum, asset) => sum + asset.transactionCount, 0),
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

  const handleViewTransactions = (asset: MemberAsset) => {
    setSelectedAsset(asset);
    setSelectedAssetTransactions(mockTransactions[asset.id] || []);
    setIsTransactionModalOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        활성
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        비활성
      </Badge>
    );
  };

  const getTransactionStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { label: '완료', variant: 'default' as const, icon: CheckCircle },
      'pending': { label: '대기', variant: 'secondary' as const, icon: Clock },
      'failed': { label: '실패', variant: 'destructive' as const, icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">자산 관리</h1>
          <p className="text-muted-foreground">
            회원사의 자산 및 자동 생성된 입금 주소를 모니터링합니다
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
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 자산 수</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}개</div>
            <p className="text-xs text-muted-foreground">
              활성 {stats.activeAssets}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 자산 가치</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              전체 보유 자산
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 거래 건수</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}건</div>
            <p className="text-xs text-muted-foreground">
              누적 입출금 거래
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최근 활동</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2시간 전</div>
            <p className="text-xs text-muted-foreground">
              마지막 거래 시간
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assets">자산 목록</TabsTrigger>
          <TabsTrigger value="timeline">자산 이력</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="자산명, 심볼, 입금 주소로 검색..."
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
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Assets Table */}
          <Card>
            <CardHeader>
              <CardTitle>자산 목록 ({filteredAssets.length}개)</CardTitle>
              <CardDescription>
                자동 생성된 입금 주소 및 자산 정보를 확인할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>자산</TableHead>
                      <TableHead>입금 주소</TableHead>
                      <TableHead className="text-right">보유량</TableHead>
                      <TableHead className="text-right">가치 (KRW)</TableHead>
                      <TableHead>거래 건수</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>마지막 활동</TableHead>
                      <TableHead className="w-[100px]">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {asset.assetSymbol}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{asset.assetName}</div>
                              <div className="text-sm text-muted-foreground">
                                {asset.assetSymbol}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {asset.depositAddress.slice(0, 12)}...{asset.depositAddress.slice(-8)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(asset.depositAddress)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">{asset.balance} {asset.assetSymbol}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">{formatCurrency(parseFloat(asset.balanceInKRW))}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{asset.transactionCount}건</div>
                          <div className="text-xs text-muted-foreground">
                            입금 {parseFloat(asset.totalDeposited).toFixed(2)} /
                            출금 {parseFloat(asset.totalWithdrawn).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(asset.isActive)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {asset.lastActivityAt ? formatDate(asset.lastActivityAt) : '없음'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTransactions(asset)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                자산 추가/제거 이력
              </CardTitle>
              <CardDescription>
                자산의 추가, 제거 및 상태 변경 이력을 시간순으로 확인할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        event.type === 'asset_added' ? 'bg-green-500 border-green-500' :
                        event.type === 'asset_removed' ? 'bg-red-500 border-red-500' :
                        event.type === 'status_changed' ? 'bg-yellow-500 border-yellow-500' :
                        'bg-blue-500 border-blue-500'
                      }`} />
                      {index < timelineEvents.length - 1 && (
                        <div className="w-px h-8 bg-muted mx-auto mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {event.assetSymbol}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(event.timestamp)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          by {event.actor}
                        </span>
                      </div>
                      <p className="text-sm">{event.description}</p>
                      {event.details && event.type === 'asset_added' && (
                        <div className="mt-2">
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {event.details.depositAddress}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  자산별 분포
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets.map((asset) => {
                    const percentage = (parseFloat(asset.balanceInKRW) / stats.totalValue) * 100;
                    return (
                      <div key={asset.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {asset.assetSymbol}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{asset.assetSymbol}</span>
                          </div>
                          <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  거래 활동 요약
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {asset.assetSymbol}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{asset.assetSymbol}</div>
                          <div className="text-sm text-muted-foreground">
                            {asset.transactionCount}건 거래
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1 text-green-600">
                            <ArrowDownLeft className="h-3 w-3" />
                            {parseFloat(asset.totalDeposited).toFixed(2)}
                          </div>
                          <div className="flex items-center gap-1 text-blue-600">
                            <ArrowUpRight className="h-3 w-3" />
                            {parseFloat(asset.totalWithdrawn).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Modal */}
      <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {selectedAsset?.assetName} ({selectedAsset?.assetSymbol}) 거래 내역
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              {selectedAssetTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>유형</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>송신 주소</TableHead>
                      <TableHead>수신 주소</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>시간</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedAssetTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.type === 'deposit' ? (
                              <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="capitalize">{tx.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tx.amount} {selectedAsset?.assetSymbol}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(parseFloat(tx.amountInKRW))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {tx.fromAddress.slice(0, 10)}...{tx.fromAddress.slice(-8)}
                          </code>
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {tx.toAddress.slice(0, 10)}...{tx.toAddress.slice(-8)}
                          </code>
                        </TableCell>
                        <TableCell>
                          {getTransactionStatusBadge(tx.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(tx.timestamp)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.confirmations} confirmations
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  거래 내역이 없습니다.
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}