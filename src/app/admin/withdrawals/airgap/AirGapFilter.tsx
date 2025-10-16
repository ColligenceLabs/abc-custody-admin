"use client";

import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AirGapFilter as AirGapFilterType } from "@/services/airgapApi";

interface AirGapFilterProps {
  filters: AirGapFilterType;
  onFilterChange: (filters: AirGapFilterType) => void;
}

/**
 * Air-gap 서명 대기열 필터 및 검색 컴포넌트
 */
export function AirGapFilter({ filters, onFilterChange }: AirGapFilterProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status as any)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status as any];

    onFilterChange({
      ...filters,
      status: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handleTypeToggle = (type: string) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type as any)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type as any];

    onFilterChange({
      ...filters,
      type: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleProgressToggle = (progress: string) => {
    const currentProgress = filters.signatureProgress || [];
    const newProgress = currentProgress.includes(progress)
      ? currentProgress.filter((p) => p !== progress)
      : [...currentProgress, progress];

    onFilterChange({
      ...filters,
      signatureProgress: newProgress.length > 0 ? newProgress : undefined,
    });
  };

  const handleSearch = () => {
    onFilterChange({
      ...filters,
      searchTerm: searchTerm.trim() || undefined,
    });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onFilterChange({
      ...filters,
      searchTerm: undefined,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    onFilterChange({});
  };

  const activeFilterCount =
    (filters.status?.length || 0) +
    (filters.type?.length || 0) +
    (filters.signatureProgress?.length || 0) +
    (filters.searchTerm ? 1 : 0);

  const statusOptions = [
    { value: "pending", label: "대기", color: "bg-yellow-500/10 text-yellow-500" },
    { value: "partial", label: "부분 서명", color: "bg-blue-500/10 text-blue-500" },
    { value: "completed", label: "완료", color: "bg-green-500/10 text-green-500" },
    { value: "expired", label: "만료", color: "bg-red-500/10 text-red-500" },
    { value: "cancelled", label: "취소", color: "bg-gray-500/10 text-gray-500" },
  ];

  const typeOptions = [
    { value: "rebalancing", label: "리밸런싱", color: "bg-blue-500/10 text-blue-500" },
    {
      value: "emergency_withdrawal",
      label: "긴급 출금",
      color: "bg-red-500/10 text-red-500",
    },
    {
      value: "maintenance",
      label: "유지보수",
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  const progressOptions = [
    { value: "no_signatures", label: "서명 없음" },
    { value: "partial", label: "부분 서명" },
    { value: "complete", label: "서명 완료" },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* 검색 바 */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="요청 ID, 자산, 서명자 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-9 pr-9"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              검색
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              필터
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* 확장 필터 */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t">
              {/* 상태 필터 */}
              <div>
                <p className="text-sm font-medium mb-2">상태</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <Badge
                      key={option.value}
                      className={`cursor-pointer ${
                        filters.status?.includes(option.value as any)
                          ? option.color
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      onClick={() => handleStatusToggle(option.value)}
                    >
                      {option.label}
                      {filters.status?.includes(option.value as any) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 유형 필터 */}
              <div>
                <p className="text-sm font-medium mb-2">유형</p>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((option) => (
                    <Badge
                      key={option.value}
                      className={`cursor-pointer ${
                        filters.type?.includes(option.value as any)
                          ? option.color
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      onClick={() => handleTypeToggle(option.value)}
                    >
                      {option.label}
                      {filters.type?.includes(option.value as any) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 서명 진행률 필터 */}
              <div>
                <p className="text-sm font-medium mb-2">서명 진행률</p>
                <div className="flex flex-wrap gap-2">
                  {progressOptions.map((option) => (
                    <Badge
                      key={option.value}
                      className={`cursor-pointer ${
                        filters.signatureProgress?.includes(option.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      onClick={() => handleProgressToggle(option.value)}
                    >
                      {option.label}
                      {filters.signatureProgress?.includes(option.value) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 필터 초기화 */}
              {activeFilterCount > 0 && (
                <div className="flex justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                    <X className="h-4 w-4 mr-2" />
                    필터 초기화 ({activeFilterCount})
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 활성 필터 표시 */}
          {!isExpanded && activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground mr-2 self-center">
                활성 필터:
              </p>
              {filters.status?.map((status) => {
                const option = statusOptions.find((o) => o.value === status);
                return option ? (
                  <Badge
                    key={status}
                    className={`${option.color} cursor-pointer`}
                    onClick={() => handleStatusToggle(status)}
                  >
                    {option.label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ) : null;
              })}
              {filters.type?.map((type) => {
                const option = typeOptions.find((o) => o.value === type);
                return option ? (
                  <Badge
                    key={type}
                    className={`${option.color} cursor-pointer`}
                    onClick={() => handleTypeToggle(type)}
                  >
                    {option.label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ) : null;
              })}
              {filters.signatureProgress?.map((progress) => {
                const option = progressOptions.find((o) => o.value === progress);
                return option ? (
                  <Badge
                    key={progress}
                    className="bg-primary text-primary-foreground cursor-pointer"
                    onClick={() => handleProgressToggle(progress)}
                  >
                    {option.label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ) : null;
              })}
              {filters.searchTerm && (
                <Badge
                  className="bg-primary text-primary-foreground cursor-pointer"
                  onClick={handleClearSearch}
                >
                  검색: {filters.searchTerm}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
