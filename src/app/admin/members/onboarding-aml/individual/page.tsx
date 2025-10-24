/**
 * Individual Onboarding List Page
 * 개인회원 온보딩 목록 페이지
 *
 * Phase 4: 개인회원 관리 시스템
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { IndividualOnboarding, OnboardingListQuery } from "@/types/onboardingAml";
import { fetchIndividualOnboardings } from "@/services/onboardingAmlApi";
import { ManualRegistrationButton } from "../components/ManualRegistrationButton";
import { IndividualFilters } from "./components/IndividualFilters";
import { IndividualTable } from "./components/IndividualTable";

export default function IndividualOnboardingListPage() {
  const [applications, setApplications] = useState<IndividualOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<OnboardingListQuery>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadApplications();
  }, [filters]);

  async function loadApplications() {
    try {
      setLoading(true);
      const response = await fetchIndividualOnboardings(filters);
      setApplications(response.applications);
      setTotalCount(response.total);
    } catch (error) {
      console.error('Failed to load individual onboarding applications:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (newFilters: Partial<OnboardingListQuery>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    loadApplications();
  };

  const handleRegistrationSuccess = () => {
    loadApplications();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">개인회원 온보딩</h2>
          <p className="text-muted-foreground">
            개인회원 신청 목록 및 검토 관리
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <ManualRegistrationButton
            memberType="individual"
            onSuccess={handleRegistrationSuccess}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 신청</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">검토 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => ['PENDING', 'UNDER_REVIEW'].includes(a.adminReview.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인 완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">
              {applications.filter(a => a.adminReview.status === 'APPROVED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">보류/거부</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(a => ['ON_HOLD', 'REJECTED'].includes(a.adminReview.status)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <IndividualFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      <IndividualTable
        applications={applications}
        loading={loading}
        currentPage={filters.page || 1}
        totalCount={totalCount}
        pageSize={filters.limit || 20}
        onPageChange={handlePageChange}
        onRefresh={loadApplications}
      />
    </div>
  );
}
