'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RebalancingRecord,
  RebalancingStatus,
  RebalancingType,
  RebalancingPriority,
  RebalancingFilter
} from '@/types/vault';
import { History, Search, Filter, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface RebalancingHistoryProps {
  records: RebalancingRecord[];
  isLoading: boolean;
  onFilterChange: (filter: RebalancingFilter) => void;
}

export function RebalancingHistoryTable({
  records,
  isLoading,
  onFilterChange
}: RebalancingHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const handleFilterChange = () => {
    const filter: RebalancingFilter = {};

    if (searchTerm) {
      filter.search = searchTerm;
    }

    if (statusFilter !== 'all') {
      filter.status = [statusFilter as RebalancingStatus];
    }

    if (typeFilter !== 'all') {
      filter.type = [typeFilter as RebalancingType];
    }

    onFilterChange(filter);
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    onFilterChange({});
  };

  const getStatusBadge = (status: RebalancingStatus) => {
    switch (status) {
      case RebalancingStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-500">완료</Badge>;
      case RebalancingStatus.PENDING:
        return <Badge variant="secondary">대기</Badge>;
      case RebalancingStatus.APPROVED:
        return <Badge variant="default" className="bg-blue-500">승인됨</Badge>;
      case RebalancingStatus.PROCESSING:
        return <Badge variant="default" className="bg-yellow-500">진행중</Badge>;
      case RebalancingStatus.FAILED:
        return <Badge variant="destructive">실패</Badge>;
      case RebalancingStatus.CANCELLED:
        return <Badge variant="outline">취소</Badge>;
      case RebalancingStatus.SIGNATURE_REQUIRED:
        return <Badge variant="default" className="bg-purple-500">서명필요</Badge>;
      case RebalancingStatus.PARTIALLY_COMPLETED:
        return <Badge variant="default" className="bg-orange-500">부분완료</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const getTypeBadge = (type: RebalancingType) => {
    switch (type) {
      case RebalancingType.HOT_TO_COLD:
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Hot → Cold</Badge>;
      case RebalancingType.COLD_TO_HOT:
        return <Badge variant="outline" className="border-purple-500 text-purple-700">Cold → Hot</Badge>;
      case RebalancingType.EMERGENCY_DRAIN:
        return <Badge variant="destructive">긴급 드레인</Badge>;
      case RebalancingType.MANUAL_ADJUST:
        return <Badge variant="outline">수동 조정</Badge>;
      default:
        return <Badge variant="outline">기타</Badge>;
    }
  };

  const getPriorityBadge = (priority: RebalancingPriority) => {
    switch (priority) {
      case RebalancingPriority.EMERGENCY:
        return <Badge variant="destructive" className="text-xs">긴급</Badge>;
      case RebalancingPriority.HIGH:
        return <Badge variant="default" className="bg-orange-500 text-xs">높음</Badge>;
      case RebalancingPriority.NORMAL:
        return <Badge variant="secondary" className="text-xs">일반</Badge>;
      case RebalancingPriority.LOW:
        return <Badge variant="outline" className="text-xs">낮음</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>리밸런싱 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            리밸런싱 이력
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            총 {records.length}건
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색 (ID, 사유, 관리자)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value={RebalancingStatus.PENDING}>대기</SelectItem>
              <SelectItem value={RebalancingStatus.APPROVED}>승인됨</SelectItem>
              <SelectItem value={RebalancingStatus.PROCESSING}>진행중</SelectItem>
              <SelectItem value={RebalancingStatus.COMPLETED}>완료</SelectItem>
              <SelectItem value={RebalancingStatus.FAILED}>실패</SelectItem>
              <SelectItem value={RebalancingStatus.CANCELLED}>취소</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="유형 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 유형</SelectItem>
              <SelectItem value={RebalancingType.HOT_TO_COLD}>Hot → Cold</SelectItem>
              <SelectItem value={RebalancingType.COLD_TO_HOT}>Cold → Hot</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleFilterChange} size="icon" variant="default">
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={handleResetFilter} size="icon" variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>사유</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>소요시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    리밸런싱 이력이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.id}</TableCell>
                    <TableCell>{getTypeBadge(record.type)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {parseFloat(record.amount).toFixed(4)} BTC
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ₩{parseInt(record.amountInKRW).toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.reason}
                    </TableCell>
                    <TableCell>{getPriorityBadge(record.priority)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDistanceToNow(record.createdAt, {
                        addSuffix: true,
                        locale: ko
                      })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {record.actualDuration
                        ? `${Math.floor(record.actualDuration)}분`
                        : record.status === RebalancingStatus.PROCESSING
                        ? '진행중...'
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
