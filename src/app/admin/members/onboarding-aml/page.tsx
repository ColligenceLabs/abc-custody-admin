/**
 * Onboarding AML Dashboard Page
 * 온보딩 AML 관리 시스템 대시보드
 *
 * Phase 1: 기본 레이아웃 및 통계 표시
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  Calendar
} from "lucide-react";
import { OnboardingStats, ActivityFeedItem } from "@/types/onboardingAml";
import { fetchOnboardingStats, fetchActivityFeed } from "@/services/onboardingAmlApi";
import { ManualRegistrationButton } from "./components/ManualRegistrationButton";
import { RiskLevelBadge } from "./components/RiskLevelBadge";

export default function OnboardingAmlDashboardPage() {
  const [stats, setStats] = useState<OnboardingStats | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [statsData, feedData] = await Promise.all([
        fetchOnboardingStats(),
        fetchActivityFeed(5),
      ]);
      setStats(statsData);
      setActivityFeed(feedData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">온보딩 AML 관리</h2>
            <p className="text-muted-foreground">
              외부 AML 솔루션 연동 기반 온보딩 관리 시스템
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted/50" />
              <CardContent className="h-16 bg-muted/30" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">온보딩 AML 관리</h2>
          <p className="text-muted-foreground">
            외부 AML 솔루션 연동 기반 온보딩 관리 시스템
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/members/onboarding-aml/monitoring">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              모니터링
            </Button>
          </Link>
          <Button variant="outline" onClick={loadDashboardData}>
            새로고침
          </Button>
          <ManualRegistrationButton
            memberType="individual"
            onSuccess={loadDashboardData}
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 전체 신청 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 신청</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              개인 {stats.byType.individual} | 법인 {stats.byType.corporate}
            </p>
          </CardContent>
        </Card>

        {/* 검토 대기 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">검토 대기</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending + stats.underReview}
            </div>
            <p className="text-xs text-muted-foreground">
              신규 {stats.pending} | 검토중 {stats.underReview}
            </p>
          </CardContent>
        </Card>

        {/* 승인 완료 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인 완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              전체 {stats.total}건 중 {((stats.approved / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {/* 보류/거부 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">보류/거부</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.onHold + stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground">
              보류 {stats.onHold} | 거부 {stats.rejected}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution & Activity Feed */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Risk Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle>위험도 분포</CardTitle>
            <CardDescription>외부 AML 시스템 평가 기준</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* LOW */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiskLevelBadge level="LOW" />
                <span className="text-sm text-muted-foreground">낮은 위험도</span>
              </div>
              <span className="text-sm font-medium">{stats.byRiskLevel.low}건</span>
            </div>

            {/* MEDIUM */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiskLevelBadge level="MEDIUM" />
                <span className="text-sm text-muted-foreground">중간 위험도</span>
              </div>
              <span className="text-sm font-medium">{stats.byRiskLevel.medium}건</span>
            </div>

            {/* HIGH */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiskLevelBadge level="HIGH" />
                <span className="text-sm text-muted-foreground">높은 위험도</span>
              </div>
              <span className="text-sm font-medium">{stats.byRiskLevel.high}건</span>
            </div>

            {/* External AML Pending */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">외부 AML 결과 대기</span>
                </div>
                <span className="text-sm font-medium text-yellow-600">
                  {stats.externalAmlPending}건
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed Card */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>최근 5개 활동 내역</CardDescription>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                최근 활동이 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {activityFeed.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.applicantName}</p>
                      <p className="text-xs text-muted-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString('ko-KR')}
                        {item.performedBy && ` | ${item.performedBy}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/members/onboarding-aml/individual">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>개인회원 온보딩</CardTitle>
                  <CardDescription>
                    개인회원 신청 {stats.byType.individual}건 관리
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/members/onboarding-aml/corporate">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>법인회원 온보딩</CardTitle>
                  <CardDescription>
                    법인회원 신청 {stats.byType.corporate}건 관리
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
