'use client';

/**
 * AML 스크리닝 필터 컴포넌트
 *
 * AML 검토 대기열에 대한 다양한 필터 옵션을 제공합니다.
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';
import type { AMLScreeningFilter, Currency } from '@/types/deposit';
import { cn } from '@/lib/utils';

interface AMLScreeningFiltersProps {
  filter: AMLScreeningFilter;
  onFilterChange: (filter: AMLScreeningFilter) => void;
  onReset: () => void;
}

export function AMLScreeningFilters({
  filter,
  onFilterChange,
  onReset,
}: AMLScreeningFiltersProps) {
  const riskLevels: Array<'low' | 'medium' | 'high' | 'critical'> = [
    'low',
    'medium',
    'high',
    'critical',
  ];

  const reviewStatuses: Array<'pending' | 'approved' | 'flagged'> = [
    'pending',
    'approved',
    'flagged',
  ];

  // CLAUDE.md에 명시된 지원 자산만 포함 (XRP, ADA 제외)
  const assets: Currency[] = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL'];

  const toggleRiskLevel = (level: 'low' | 'medium' | 'high' | 'critical') => {
    const current = filter.riskLevel || [];
    const updated = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    onFilterChange({ ...filter, riskLevel: updated.length > 0 ? updated : undefined });
  };

  const toggleReviewStatus = (status: 'pending' | 'approved' | 'flagged') => {
    const current = filter.reviewStatus || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFilterChange({ ...filter, reviewStatus: updated.length > 0 ? updated : undefined });
  };

  const toggleAsset = (asset: Currency) => {
    const current = filter.asset || [];
    const updated = current.includes(asset)
      ? current.filter((a) => a !== asset)
      : [...current, asset];
    onFilterChange({ ...filter, asset: updated.length > 0 ? updated : undefined });
  };

  const getRiskLevelLabel = (level: string) => {
    const labels = {
      low: '낮음',
      medium: '보통',
      high: '높음',
      critical: '심각',
    };
    return labels[level as keyof typeof labels];
  };

  const getRiskLevelVariant = (level: string, isSelected: boolean) => {
    if (!isSelected) return 'outline' as const;
    const variants = {
      low: 'secondary' as const,
      medium: 'outline' as const,
      high: 'default' as const,
      critical: 'destructive' as const,
    };
    return variants[level as keyof typeof variants];
  };

  const getReviewStatusLabel = (status: string) => {
    const labels = {
      pending: '대기중',
      approved: '승인됨',
      flagged: '플래그됨',
    };
    return labels[status as keyof typeof labels];
  };

  const getReviewStatusVariant = (status: string, isSelected: boolean) => {
    if (!isSelected) return 'outline' as const;
    const variants = {
      pending: 'outline' as const,
      approved: 'secondary' as const,
      flagged: 'destructive' as const,
    };
    return variants[status as keyof typeof variants];
  };

  const hasActiveFilters =
    filter.riskLevel?.length ||
    filter.reviewStatus?.length ||
    filter.asset?.length ||
    filter.hasBlacklistMatch !== undefined ||
    filter.hasSanctionsMatch !== undefined ||
    filter.hasPEPMatch !== undefined ||
    filter.hasAdverseMedia !== undefined ||
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

        {/* 리스크 레벨 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            리스크 레벨
          </label>
          <div className="flex flex-wrap gap-1">
            {riskLevels.map((level) => {
              const isSelected = filter.riskLevel?.includes(level) ?? false;
              return (
                <Badge
                  key={level}
                  variant={getRiskLevelVariant(level, isSelected)}
                  className={cn(
                    'cursor-pointer text-xs',
                    !isSelected && 'opacity-50 hover:opacity-100'
                  )}
                  onClick={() => toggleRiskLevel(level)}
                >
                  {getRiskLevelLabel(level)}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* 검토 상태 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            검토 상태
          </label>
          <div className="flex flex-wrap gap-1">
            {reviewStatuses.map((status) => {
              const isSelected = filter.reviewStatus?.includes(status) ?? false;
              return (
                <Badge
                  key={status}
                  variant={getReviewStatusVariant(status, isSelected)}
                  className={cn(
                    'cursor-pointer text-xs',
                    !isSelected && 'opacity-50 hover:opacity-100'
                  )}
                  onClick={() => toggleReviewStatus(status)}
                >
                  {getReviewStatusLabel(status)}
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

        {/* AML 체크 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            AML 체크
          </label>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <div className="flex items-center space-x-1">
              <input
                type="checkbox"
                id="blacklist"
                checked={filter.hasBlacklistMatch === true}
                onChange={(e) =>
                  onFilterChange({
                    ...filter,
                    hasBlacklistMatch: e.target.checked ? true : undefined,
                  })
                }
                className="rounded border-gray-300 h-3 w-3"
              />
              <label
                htmlFor="blacklist"
                className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                블랙리스트
              </label>
            </div>

            <div className="flex items-center space-x-1">
              <input
                type="checkbox"
                id="sanctions"
                checked={filter.hasSanctionsMatch === true}
                onChange={(e) =>
                  onFilterChange({
                    ...filter,
                    hasSanctionsMatch: e.target.checked ? true : undefined,
                  })
                }
                className="rounded border-gray-300 h-3 w-3"
              />
              <label
                htmlFor="sanctions"
                className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                제재목록
              </label>
            </div>

            <div className="flex items-center space-x-1">
              <input
                type="checkbox"
                id="pep"
                checked={filter.hasPEPMatch === true}
                onChange={(e) =>
                  onFilterChange({
                    ...filter,
                    hasPEPMatch: e.target.checked ? true : undefined,
                  })
                }
                className="rounded border-gray-300 h-3 w-3"
              />
              <label
                htmlFor="pep"
                className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                PEP
              </label>
            </div>

            <div className="flex items-center space-x-1">
              <input
                type="checkbox"
                id="adverse-media"
                checked={filter.hasAdverseMedia === true}
                onChange={(e) =>
                  onFilterChange({
                    ...filter,
                    hasAdverseMedia: e.target.checked ? true : undefined,
                  })
                }
                className="rounded border-gray-300 h-3 w-3"
              />
              <label
                htmlFor="adverse-media"
                className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
              >
                미디어
              </label>
            </div>
          </div>
        </div>

        {/* 최소 리스크 점수 */}
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
            최소 리스크 점수
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="0-100"
            value={filter.minRiskScore || ''}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                minRiskScore: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
}
