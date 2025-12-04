/**
 * 환불 필터 컴포넌트
 */

'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Calendar } from 'lucide-react';

export interface ReturnFilterState {
  status?: ('pending' | 'processing' | 'completed' | 'failed' | 'cancelled')[];
  reason?: string[]; // 실제 DB 값 (한글 문장)
  searchQuery?: string;
  datePreset?: 'today' | 'yesterday' | 'last7days' | 'last30days';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

interface ReturnFiltersProps {
  filters: ReturnFilterState;
  onFilterChange: (filters: ReturnFilterState) => void;
}

const STATUS_OPTIONS: { value: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'; label: string; color: string }[] = [
  { value: 'pending', label: '대기', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  { value: 'processing', label: '처리중', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'completed', label: '완료', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  { value: 'failed', label: '실패', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
  { value: 'cancelled', label: '취소', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
];

// 실제 DB에 저장되는 reason 값 (백엔드가 한글 문장으로 저장)
const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: '화이트리스트에 등록되지 않은 주소로부터의 입금', label: '미등록 주소' },
  // 향후 추가될 수 있는 사유들 (백엔드 구현 시 추가)
  // { value: '권한 없음', label: '권한 없음' },
  // { value: '일일 한도 초과', label: '한도 초과' },
  // { value: 'Travel Rule 위반', label: 'Travel Rule 위반' },
  // { value: 'AML 플래그', label: 'AML 플래그' },
  // { value: '제재 목록', label: '제재 목록' },
  // { value: '수동 검토 거부', label: '수동 검토 거부' },
];

// 날짜 프리셋
const DATE_PRESETS: { value: 'today' | 'yesterday' | 'last7days' | 'last30days'; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: 'yesterday', label: '어제' },
  { value: 'last7days', label: '최근 7일' },
  { value: 'last30days', label: '최근 30일' },
];

export function ReturnFilters({ filters, onFilterChange }: ReturnFiltersProps) {
  const toggleStatus = (status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled') => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter((s) => s !== status)
      : [...currentStatus, status];

    onFilterChange({
      ...filters,
      status: newStatus.length > 0 ? newStatus : undefined,
    });
  };

  const toggleReason = (reason: string) => {
    const currentReason = filters.reason || [];
    const newReason = currentReason.includes(reason as any)
      ? currentReason.filter((r) => r !== reason)
      : [...currentReason, reason as any];

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

  const handleDatePreset = (preset: 'today' | 'yesterday' | 'last7days' | 'last30days') => {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (preset) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'last7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        endDate = new Date(today);
        break;
      case 'last30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29);
        endDate = new Date(today);
        break;
      default:
        return;
    }

    onFilterChange({
      ...filters,
      datePreset: filters.datePreset === preset ? undefined : preset,
      startDate: filters.datePreset === preset ? undefined : formatDate(startDate),
      endDate: filters.datePreset === preset ? undefined : formatDate(endDate),
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      datePreset: undefined,
      startDate: e.target.value || undefined,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      datePreset: undefined,
      endDate: e.target.value || undefined,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters =
    (filters.status && filters.status.length > 0) ||
    (filters.reason && filters.reason.length > 0) ||
    !!filters.searchQuery ||
    !!filters.datePreset ||
    !!filters.startDate ||
    !!filters.endDate;

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

      {/* 날짜 필터 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          <Calendar className="inline h-4 w-4 mr-1" />
          기간
        </label>
        {/* 날짜 프리셋 */}
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((preset) => (
            <Badge
              key={preset.value}
              variant={
                filters.datePreset === preset.value ? 'default' : 'outline'
              }
              className="cursor-pointer"
              onClick={() => handleDatePreset(preset.value)}
            >
              {preset.label}
            </Badge>
          ))}
        </div>
        {/* 직접 입력 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">시작일</label>
            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={handleStartDateChange}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">종료일</label>
            <Input
              type="date"
              value={filters.endDate || ''}
              onChange={handleEndDateChange}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
