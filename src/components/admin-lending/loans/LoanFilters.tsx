/**
 * 대출 목록 필터 컴포넌트
 * 상태, 자산, 위험도, Health Factor 범위, 검색 필터 제공
 */

"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoanFilters as LoanFiltersType, Currency } from "@/types/admin-lending";

interface LoanFiltersProps {
  filters: LoanFiltersType;
  onFiltersChange: (filters: LoanFiltersType) => void;
  onReset: () => void;
}

export default function LoanFilters({
  filters,
  onFiltersChange,
  onReset,
}: LoanFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  // 상태 옵션
  const statusOptions = [
    { value: "active", label: "활성" },
    { value: "warning", label: "주의" },
    { value: "danger", label: "위험" },
    { value: "liquidation", label: "청산 중" },
    { value: "liquidated", label: "청산 완료" },
  ] as const;

  // 자산 옵션
  const assetOptions: Array<{ value: Currency; label: string }> = [
    { value: "BTC", label: "Bitcoin" },
    { value: "ETH", label: "Ethereum" },
    { value: "USDT", label: "Tether" },
    { value: "USDC", label: "USD Coin" },
    { value: "SOL", label: "Solana" },
  ];

  // 위험도 옵션
  const riskOptions = [
    { value: "safe", label: "안전" },
    { value: "caution", label: "주의" },
    { value: "danger", label: "위험" },
    { value: "liquidation", label: "청산" },
  ] as const;

  // 필터 토글 핸들러
  const toggleArrayFilter = <T extends string>(
    key: "status" | "asset" | "riskLevel",
    value: T
  ) => {
    const currentArray = (filters[key] || []) as T[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    onFiltersChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined,
    });
  };

  // 검색 핸들러
  const handleSearch = () => {
    onFiltersChange({
      ...filters,
      search: searchInput.trim() || undefined,
    });
  };

  // Health Factor 범위 핸들러
  const handleHealthFactorChange = (
    type: "min" | "max",
    value: string
  ) => {
    const numValue = value ? parseFloat(value) : undefined;
    onFiltersChange({
      ...filters,
      [type === "min" ? "healthFactorMin" : "healthFactorMax"]: numValue,
    });
  };

  // 활성 필터 카운트
  const activeFilterCount =
    (filters.status?.length || 0) +
    (filters.asset?.length || 0) +
    (filters.riskLevel?.length || 0) +
    (filters.healthFactorMin !== undefined ? 1 : 0) +
    (filters.healthFactorMax !== undefined ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* 검색 */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="고객명, 대출ID로 검색..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>검색</Button>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={onReset}>
                <X className="h-4 w-4 mr-1" />
                초기화 ({activeFilterCount})
              </Button>
            )}
          </div>

          {/* 상태 필터 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              상태
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Badge
                  key={option.value}
                  onClick={() => toggleArrayFilter("status", option.value)}
                  className={`cursor-pointer transition-colors ${
                    filters.status?.includes(option.value)
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 자산 필터 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              담보 자산
            </label>
            <div className="flex flex-wrap gap-2">
              {assetOptions.map((option) => (
                <Badge
                  key={option.value}
                  onClick={() => toggleArrayFilter("asset", option.value)}
                  className={`cursor-pointer transition-colors ${
                    filters.asset?.includes(option.value)
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.value}
                </Badge>
              ))}
            </div>
          </div>

          {/* 위험도 필터 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              위험도
            </label>
            <div className="flex flex-wrap gap-2">
              {riskOptions.map((option) => (
                <Badge
                  key={option.value}
                  onClick={() => toggleArrayFilter("riskLevel", option.value)}
                  className={`cursor-pointer transition-colors ${
                    filters.riskLevel?.includes(option.value)
                      ? "bg-sky-600 text-white hover:bg-sky-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Health Factor 범위 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Health Factor 범위
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                step="0.1"
                placeholder="최소"
                value={filters.healthFactorMin ?? ""}
                onChange={(e) => handleHealthFactorChange("min", e.target.value)}
                className="w-24"
              />
              <span className="text-gray-500">~</span>
              <Input
                type="number"
                step="0.1"
                placeholder="최대"
                value={filters.healthFactorMax ?? ""}
                onChange={(e) => handleHealthFactorChange("max", e.target.value)}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
