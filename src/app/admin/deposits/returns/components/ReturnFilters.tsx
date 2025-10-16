/**
 * 환불 필터 컴포넌트
 */

'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { DepositReturnReason } from '@/types/deposit';

export interface ReturnFilterState {
  status?: ('pending' | 'processing' | 'completed' | 'failed')[];
  reason?: DepositReturnReason[];
  searchQuery?: string;
}

interface ReturnFiltersProps {
  filters: ReturnFilterState;
  onFilterChange: (filters: ReturnFilterState) => void;
}

const STATUS_OPTIONS: { value: 'pending' | 'processing' | 'completed' | 'failed'; label: string; color: string }[] = [
  { value: 'pending', label: '대기', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  { value: 'processing', label: '처리 중', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'completed', label: '완료', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  { value: 'failed', label: '실패', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
];

const REASON_OPTIONS: { value: DepositReturnReason; label: string }[] = [
  { value: 'member_unregistered_address', label: '미등록 주소' },
  { value: 'no_permission', label: '권한 없음' },
  { value: 'daily_limit_exceeded', label: '한도 초과' },
  { value: 'travel_rule_violation', label: 'Travel Rule 위반' },
  { value: 'aml_flag', label: 'AML 플래그' },
  { value: 'sanctions_list', label: '제재 목록' },
  { value: 'manual_review_rejected', label: '수동 검토 거부' },
];

export function ReturnFilters({ filters, onFilterChange }: ReturnFiltersProps) {
  const toggleStatus = (status: 'pending' | 'processing' | 'completed' | 'failed') => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter((s) => s !== status)
      : [...currentStatus, status];

    onFilterChange({
      ...filters,
      status: newStatus.length > 0 ? newStatus : undefined,
    });
  };

  const toggleReason = (reason: DepositReturnReason) => {
    const currentReason = filters.reason || [];
    const newReason = currentReason.includes(reason)
      ? currentReason.filter((r) => r !== reason)
      : [...currentReason, reason];

    onFilterChange({
      ...filters,
      reason: newReason.length > 0 ? newReason : undefined,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value || undefined,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters =
    (filters.status && filters.status.length > 0) ||
    (filters.reason && filters.reason.length > 0) ||
    !!filters.searchQuery;

  return (
    <div className="space-y-4">
      {/* 검색바 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="TxHash, 회원사명, 주소 검색..."
            value={filters.searchQuery || ''}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            필터 초기화
          </Button>
        )}
      </div>

      {/* 상태 필터 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">상태</label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Badge
              key={option.value}
              variant={
                filters.status?.includes(option.value) ? 'default' : 'outline'
              }
              className={`cursor-pointer ${
                filters.status?.includes(option.value) ? option.color : ''
              }`}
              onClick={() => toggleStatus(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* 환불 사유 필터 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">환불 사유</label>
        <div className="flex flex-wrap gap-2">
          {REASON_OPTIONS.map((option) => (
            <Badge
              key={option.value}
              variant={
                filters.reason?.includes(option.value) ? 'default' : 'outline'
              }
              className="cursor-pointer"
              onClick={() => toggleReason(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
