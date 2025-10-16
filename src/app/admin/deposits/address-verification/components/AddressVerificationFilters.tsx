'use client';

/**
 * 주소 검증 필터 컴포넌트
 *
 * 검증 상태, 회원사, 자산 등으로 필터링합니다.
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { AddressVerificationFilter, Currency } from '@/types/deposit';
import { cn } from '@/lib/utils';

interface AddressVerificationFiltersProps {
  filter: AddressVerificationFilter;
  onFilterChange: (filter: AddressVerificationFilter) => void;
  onReset: () => void;
}

export function AddressVerificationFilters({
  filter,
  onFilterChange,
  onReset,
}: AddressVerificationFiltersProps) {
  const verificationStatuses: Array<'passed' | 'failed' | 'pending' | 'flagged'> = [
    'passed',
    'failed',
    'pending',
    'flagged',
  ];

  // CLAUDE.md에 명시된 지원 자산만 포함 (XRP, ADA 제외)
  const assets: Currency[] = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL'];

  const addressTypes: Array<'personal' | 'vasp'> = ['personal', 'vasp'];

  // 검증 상태 토글
  const toggleVerificationStatus = (status: 'passed' | 'failed' | 'pending' | 'flagged') => {
    const current = filter.verificationStatus || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFilterChange({ ...filter, verificationStatus: updated.length > 0 ? updated : undefined });
  };

  // 자산 토글
  const toggleAsset = (asset: Currency) => {
    const current = filter.asset || [];
    const updated = current.includes(asset)
      ? current.filter((a) => a !== asset)
      : [...current, asset];
    onFilterChange({ ...filter, asset: updated.length > 0 ? updated : undefined });
  };

  // 주소 타입 토글
  const toggleAddressType = (type: 'personal' | 'vasp') => {
    const current = filter.addressType || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFilterChange({ ...filter, addressType: updated.length > 0 ? updated : undefined });
  };

  const getVerificationStatusLabel = (status: string) => {
    const labels = {
      passed: '통과',
      failed: '실패',
      pending: '대기',
      flagged: '플래그',
    };
    return labels[status as keyof typeof labels];
  };

  const getVerificationStatusVariant = (status: string, isSelected: boolean) => {
    if (!isSelected) return 'outline' as const;
    const variants = {
      passed: 'secondary' as const,
      failed: 'destructive' as const,
      pending: 'outline' as const,
      flagged: 'default' as const,
    };
    return variants[status as keyof typeof variants];
  };

  const getAddressTypeLabel = (type: string) => {
    const labels = {
      personal: '개인',
      vasp: 'VASP',
    };
    return labels[type as keyof typeof labels];
  };

  const hasActiveFilters =
    filter.verificationStatus?.length ||
    filter.asset?.length ||
    filter.addressType?.length ||
    filter.searchQuery ||
    filter.isRegistered !== undefined ||
    filter.hasPermission !== undefined ||
    filter.isFlagged !== undefined;

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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

        {/* 검증 상태 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            검증 상태
          </label>
          <div className="flex flex-wrap gap-1">
            {verificationStatuses.map((status) => {
              const isSelected = filter.verificationStatus?.includes(status) ?? false;
              return (
                <Badge
                  key={status}
                  variant={getVerificationStatusVariant(status, isSelected)}
                  className={cn(
                    'cursor-pointer text-xs',
                    !isSelected && 'opacity-50 hover:opacity-100'
                  )}
                  onClick={() => toggleVerificationStatus(status)}
                >
                  {getVerificationStatusLabel(status)}
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

        {/* 주소 타입 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            주소 타입
          </label>
          <div className="flex flex-wrap gap-1">
            {addressTypes.map((type) => {
              const isSelected = filter.addressType?.includes(type);
              return (
                <Badge
                  key={type}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer text-xs',
                    !isSelected && 'opacity-50 hover:opacity-100'
                  )}
                  onClick={() => toggleAddressType(type)}
                >
                  {getAddressTypeLabel(type)}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* 등록 여부 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            등록 여부
          </label>
          <div className="flex flex-wrap gap-1">
            <Badge
              variant={filter.isRegistered === true ? 'secondary' : 'outline'}
              className={cn(
                'cursor-pointer text-xs',
                filter.isRegistered !== true && 'opacity-50 hover:opacity-100'
              )}
              onClick={() =>
                onFilterChange({
                  ...filter,
                  isRegistered: filter.isRegistered === true ? undefined : true,
                })
              }
            >
              등록됨
            </Badge>
            <Badge
              variant={filter.isRegistered === false ? 'destructive' : 'outline'}
              className={cn(
                'cursor-pointer text-xs',
                filter.isRegistered !== false && 'opacity-50 hover:opacity-100'
              )}
              onClick={() =>
                onFilterChange({
                  ...filter,
                  isRegistered: filter.isRegistered === false ? undefined : false,
                })
              }
            >
              미등록
            </Badge>
          </div>
        </div>

        {/* 플래그 여부 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            기타
          </label>
          <div className="flex flex-wrap gap-1">
            <Badge
              variant={filter.isFlagged === true ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer text-xs',
                filter.isFlagged !== true && 'opacity-50 hover:opacity-100'
              )}
              onClick={() =>
                onFilterChange({
                  ...filter,
                  isFlagged: filter.isFlagged === true ? undefined : true,
                })
              }
            >
              플래그됨
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
