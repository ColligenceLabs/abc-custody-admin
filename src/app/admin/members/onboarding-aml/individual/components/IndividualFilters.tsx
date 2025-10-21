/**
 * IndividualFilters Component
 * 개인회원 온보딩 필터
 *
 * 상태, 위험도, 등록 경로 기준으로 필터링
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { OnboardingListQuery, OnboardingStatus, RiskLevel, RegistrationSource } from "@/types/onboardingAml";

interface IndividualFiltersProps {
  filters: OnboardingListQuery;
  onFilterChange: (filters: Partial<OnboardingListQuery>) => void;
}

export function IndividualFilters({ filters, onFilterChange }: IndividualFiltersProps) {
  const handleReset = () => {
    onFilterChange({
      status: undefined,
      riskLevel: undefined,
      registrationSource: undefined,
      search: undefined,
    });
  };

  const hasActiveFilters = !!(
    filters.status ||
    filters.riskLevel ||
    filters.registrationSource ||
    filters.search
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-5">
          {/* 검색 */}
          <div className="space-y-2">
            <Label htmlFor="search">검색</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="이름, 이메일 검색"
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          {/* 상태 필터 */}
          <div className="space-y-2">
            <Label htmlFor="status">상태</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                onFilterChange({ status: value === 'all' ? undefined : value as OnboardingStatus })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="PENDING">신청 접수</SelectItem>
                <SelectItem value="UNDER_REVIEW">검토 중</SelectItem>
                <SelectItem value="APPROVED">승인 완료</SelectItem>
                <SelectItem value="REJECTED">거부</SelectItem>
                <SelectItem value="ON_HOLD">보류</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 위험도 필터 */}
          <div className="space-y-2">
            <Label htmlFor="riskLevel">위험도</Label>
            <Select
              value={filters.riskLevel || 'all'}
              onValueChange={(value) =>
                onFilterChange({ riskLevel: value === 'all' ? undefined : value as RiskLevel })
              }
            >
              <SelectTrigger id="riskLevel">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="LOW">낮음 (LOW)</SelectItem>
                <SelectItem value="MEDIUM">중간 (MEDIUM)</SelectItem>
                <SelectItem value="HIGH">높음 (HIGH)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 등록 경로 필터 */}
          <div className="space-y-2">
            <Label htmlFor="registrationSource">등록 경로</Label>
            <Select
              value={filters.registrationSource || 'all'}
              onValueChange={(value) =>
                onFilterChange({
                  registrationSource: value === 'all' ? undefined : value as RegistrationSource
                })
              }
            >
              <SelectTrigger id="registrationSource">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="ONLINE">온라인 신청</SelectItem>
                <SelectItem value="OFFLINE_BRANCH">지점 방문</SelectItem>
                <SelectItem value="PHONE_INQUIRY">전화 문의</SelectItem>
                <SelectItem value="EMAIL_REQUEST">이메일 요청</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 초기화 버튼 */}
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasActiveFilters}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
