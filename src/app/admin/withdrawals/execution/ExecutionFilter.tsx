"use client";

// ============================================================================
// 출금 실행 필터 및 검색 컴포넌트 (Task 4.4)
// ============================================================================

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExecutionFilter, WithdrawalExecutionStatus } from "@/types/withdrawal";
import { Search, X, Filter } from "lucide-react";

interface ExecutionFilterProps {
  onFilterChange: (filter: ExecutionFilter) => void;
}

const statusOptions: { value: WithdrawalExecutionStatus; label: string }[] = [
  { value: "preparing", label: "준비 중" },
  { value: "broadcasting", label: "브로드캐스트 중" },
  { value: "broadcast_failed", label: "브로드캐스트 실패" },
  { value: "confirming", label: "컨펌 대기 중" },
  { value: "confirmed", label: "완료" },
  { value: "failed", label: "실패" },
];

const assetOptions = [
  { value: "BTC", label: "Bitcoin" },
  { value: "ETH", label: "Ethereum" },
  { value: "USDT-ERC20", label: "USDT (ERC20)" },
  { value: "USDT-TRC20", label: "USDT (TRC20)" },
];

export function ExecutionFilterComponent({
  onFilterChange,
}: ExecutionFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<
    WithdrawalExecutionStatus[]
  >([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [failedOnly, setFailedOnly] = useState(false);
  const [retryNeededOnly, setRetryNeededOnly] = useState(false);

  const handleApplyFilter = () => {
    const filter: ExecutionFilter = {
      searchTerm: searchTerm || undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      asset: selectedAssets.length > 0 ? selectedAssets : undefined,
      failedOnly: failedOnly || undefined,
      retryNeededOnly: retryNeededOnly || undefined,
    };

    onFilterChange(filter);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedStatuses([]);
    setSelectedAssets([]);
    setFailedOnly(false);
    setRetryNeededOnly(false);
    onFilterChange({});
  };

  const toggleStatus = (status: WithdrawalExecutionStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleAsset = (asset: string) => {
    setSelectedAssets((prev) =>
      prev.includes(asset) ? prev.filter((a) => a !== asset) : [...prev, asset]
    );
  };

  const hasActiveFilters =
    searchTerm ||
    selectedStatuses.length > 0 ||
    selectedAssets.length > 0 ||
    failedOnly ||
    retryNeededOnly;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">필터 및 검색</h3>
      </div>

      {/* 검색어 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="TxHash, 주소, 회원사명 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
        />
      </div>

      {/* 상태 필터 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">상태</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Badge
              key={option.value}
              variant={
                selectedStatuses.includes(option.value) ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => toggleStatus(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* 자산 필터 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">자산</label>
        <div className="flex flex-wrap gap-2">
          {assetOptions.map((option) => (
            <Badge
              key={option.value}
              variant={
                selectedAssets.includes(option.value) ? "default" : "outline"
              }
              className="cursor-pointer"
              onClick={() => toggleAsset(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* 빠른 필터 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">빠른 필터</label>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={failedOnly ? "destructive" : "outline"}
            className="cursor-pointer"
            onClick={() => setFailedOnly(!failedOnly)}
          >
            실패만 보기
          </Badge>
          <Badge
            variant={retryNeededOnly ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setRetryNeededOnly(!retryNeededOnly)}
          >
            재시도 필요만 보기
          </Badge>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <Button onClick={handleApplyFilter} className="flex-1">
          <Search className="mr-2 h-4 w-4" />
          필터 적용
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            초기화
          </Button>
        )}
      </div>
    </div>
  );
}
