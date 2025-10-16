'use client';

/**
 * 입금 필터링 UI
 *
 * 상태, 회원사, 자산별 필터링 및 검색 기능을 제공합니다.
 */

import { DepositStatus, DepositFilter, Currency, MemberType } from '@/types/deposit';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DepositFiltersProps {
  filter: DepositFilter;
  onFilterChange: (filter: DepositFilter) => void;
  onReset: () => void;
}

export function DepositFilters({
  filter,
  onFilterChange,
  onReset,
}: DepositFiltersProps) {
  const statuses: DepositStatus[] = ['pending', 'verifying', 'completed', 'returned', 'flagged'];
  // CLAUDE.md에 명시된 지원 자산만 포함 (XRP, ADA 제외)
  const assets: Currency[] = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL'];
  const memberTypes: MemberType[] = ['Individual', 'Corporate'];

  const toggleStatus = (status: DepositStatus) => {
    const current = filter.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFilterChange({ ...filter, status: updated.length > 0 ? updated : undefined });
  };

  const toggleAsset = (asset: Currency) => {
    const current = filter.asset || [];
    const updated = current.includes(asset)
      ? current.filter((a) => a !== asset)
      : [...current, asset];
    onFilterChange({ ...filter, asset: updated.length > 0 ? updated : undefined });
  };

  const toggleMemberType = (type: MemberType) => {
    const current = filter.memberType || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFilterChange({ ...filter, memberType: updated.length > 0 ? updated : undefined });
  };

  const getStatusLabel = (status: DepositStatus) => {
    const labels = {
      pending: '대기중',
      verifying: '검증중',
      completed: '완료',
      returned: '환불',
      flagged: '플래그',
    };
    return labels[status];
  };

  const getStatusVariant = (status: DepositStatus, isSelected: boolean) => {
    if (!isSelected) return 'outline' as const;
    const variants = {
      pending: 'outline' as const,
      verifying: 'default' as const,
      completed: 'secondary' as const,
      returned: 'destructive' as const,
      flagged: 'destructive' as const,
    };
    return variants[status];
  };

  const getMemberTypeLabel = (type: MemberType) => {
    const labels = {
      Individual: '개인',
      Corporate: '기업',
    };
    return labels[type];
  };

  const hasActiveFilters =
    filter.status?.length ||
    filter.memberType?.length ||
    filter.asset?.length ||
    filter.searchQuery;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">필터</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2">
            <X className="h-4 w-4 mr-1" />
            초기화
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 검색 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            검색
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="주소, TxHash 검색..."
              value={filter.searchQuery || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  searchQuery: e.target.value || undefined,
                })
              }
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* 회원유형 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            회원유형
          </label>
          <div className="flex flex-wrap gap-1">
            {memberTypes.map((type) => {
              const isSelected = filter.memberType?.includes(type) ?? false;
              return (
                <Badge
                  key={type}
                  className={cn(
                    'cursor-pointer text-xs',
                    isSelected
                      ? type === 'Individual'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      : 'opacity-50 hover:opacity-100'
                  )}
                  variant={isSelected ? undefined : 'outline'}
                  onClick={() => toggleMemberType(type)}
                >
                  {getMemberTypeLabel(type)}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* 상태 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            상태
          </label>
          <div className="flex flex-wrap gap-1">
            {statuses.map((status) => {
              const isSelected = filter.status?.includes(status) ?? false;
              return (
                <Badge
                  key={status}
                  variant={getStatusVariant(status, isSelected)}
                  className={cn(
                    'cursor-pointer text-xs',
                    !isSelected && 'opacity-50 hover:opacity-100'
                  )}
                  onClick={() => toggleStatus(status)}
                >
                  {getStatusLabel(status)}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* 자산 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            자산
          </label>
          <div className="flex flex-wrap gap-1">
            {assets.map((asset) => {
              const isSelected = filter.asset?.includes(asset);
              return (
                <Badge
                  key={asset}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer text-xs',
                    !isSelected && 'opacity-50 hover:opacity-100'
                  )}
                  onClick={() => toggleAsset(asset)}
                >
                  {asset}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}