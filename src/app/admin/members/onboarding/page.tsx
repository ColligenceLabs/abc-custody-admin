/**
 * Member Onboarding Management Page - Individual & Corporate Split
 * 회원사 온보딩 관리 페이지 - 개인/기업 회원 분리
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Building } from "lucide-react";
import { MemberType } from "@/data/types/individualOnboarding";
import {
  getIndividualApplications,
  getCorporateApplications
} from "@/data/mockData/allOnboardingApplications";
import { IndividualApplicationsTable } from "./IndividualTable";
import { CorporateApplicationsTable } from "./CorporateTable";
import { NewApplicationButton } from "./components/NewApplicationButton";

export default function OnboardingManagementPage() {
  const [activeTab, setActiveTab] = useState<"individual" | "corporate">("individual");
  const [refreshKey, setRefreshKey] = useState(0);

  const individualApps = getIndividualApplications();
  const corporateApps = getCorporateApplications();

  const handleApplicationCreated = () => {
    // Force re-render to show new application
    setRefreshKey(prev => prev + 1);
  };

  // 개인 회원 통계
  const individualStats = {
    total: individualApps.length,
    pending: individualApps.filter(app =>
      app.status === 'submitted' || app.status === 'document_review'
    ).length,
    compliance: individualApps.filter(app =>
      app.status === 'compliance_review'
    ).length,
    overdue: individualApps.filter(app => app.workflow.isOverdue).length,
    approved: individualApps.filter(app => app.status === 'approved').length
  };

  // 기업 회원 통계
  const corporateStats = {
    total: corporateApps.length,
    pending: corporateApps.filter(app =>
      app.status === 'submitted' || app.status === 'document_review'
    ).length,
    compliance: corporateApps.filter(app =>
      app.status === 'compliance_review'
    ).length,
    overdue: corporateApps.filter(app => app.workflow.isOverdue).length,
    approved: corporateApps.filter(app => app.status === 'approved').length
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6" key={refreshKey}>
      {/* Page Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">회원사 온보딩 관리</h2>
          <p className="text-muted-foreground">
            개인 및 기업 회원 가입 신청을 처리합니다
          </p>
        </div>
        <NewApplicationButton
          memberType={activeTab}
          onSuccess={handleApplicationCreated}
        />
      </div>

      {/* Tabs for Member Types */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "individual" | "corporate")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            개인 회원
            <Badge variant="secondary" className="ml-1">
              {individualStats.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="corporate" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            기업 회원
            <Badge variant="sapphire" className="ml-1">
              {corporateStats.total}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Individual Members Tab */}
        <TabsContent value="individual" className="space-y-4">
          {/* Individual Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 개인 신청</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{individualStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  신규 개인 회원 신청
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">검토 대기</CardTitle>
                <User className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{individualStats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  검토 필요한 건수
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인 완료</CardTitle>
                <User className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{individualStats.approved}</div>
                <p className="text-xs text-muted-foreground">
                  승인된 개인 회원
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">기한 초과</CardTitle>
                <User className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{individualStats.overdue}</div>
                <p className="text-xs text-muted-foreground">
                  긴급 처리 필요
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Applications Table */}
          <IndividualApplicationsTable applications={individualApps} />
        </TabsContent>

        {/* Corporate Members Tab */}
        <TabsContent value="corporate" className="space-y-4">
          {/* Corporate Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 기업 신청</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{corporateStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  신규 기업 회원 신청
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">검토 대기</CardTitle>
                <Building className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{corporateStats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  검토 필요한 건수
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인 완료</CardTitle>
                <Building className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{corporateStats.approved}</div>
                <p className="text-xs text-muted-foreground">
                  승인된 기업 회원
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">기한 초과</CardTitle>
                <Building className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{corporateStats.overdue}</div>
                <p className="text-xs text-muted-foreground">
                  긴급 처리 필요
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Corporate Applications Table */}
          <CorporateApplicationsTable applications={corporateApps} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
