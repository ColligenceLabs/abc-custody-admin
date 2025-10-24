/**
 * Monitoring Page
 * 온보딩 모니터링 페이지
 *
 * Phase 6: 고객확인 재이행 관리 및 위험 고객 재평가
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, AlertCircle } from "lucide-react";
import { RenewalDueItem, ReassessmentQueueItem } from "@/types/onboardingAml";
import { fetchRenewalDue, fetchReassessmentQueue } from "@/services/monitoringApi";
import { RenewalDueList } from "./components/RenewalDueList";
import { ReassessmentQueue } from "./components/ReassessmentQueue";

export default function MonitoringPage() {
  const [renewalItems, setRenewalItems] = useState<RenewalDueItem[]>([]);
  const [queueItems, setQueueItems] = useState<ReassessmentQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysThreshold, setDaysThreshold] = useState(30);

  useEffect(() => {
    loadData();
  }, [daysThreshold]);

  async function loadData() {
    try {
      setLoading(true);
      const [renewals, queue] = await Promise.all([
        fetchRenewalDue(daysThreshold),
        fetchReassessmentQueue(),
      ]);
      setRenewalItems(renewals);
      setQueueItems(queue);
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = () => {
    loadData();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">온보딩 모니터링</h2>
          <p className="text-muted-foreground">
            고객확인 재이행 및 위험 고객 재평가 관리
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">고객확인 재이행 (30일 이내)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renewalItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              고객확인 재이행이 필요한 회원
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">위험 고객 재평가 대기</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queueItems.filter(q => q.externalSystemStatus === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              외부 시스템 대기 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">고우선순위</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {queueItems.filter(q => q.priority === 'HIGH').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              즉시 처리 필요
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Renewal Due List */}
      <RenewalDueList
        items={renewalItems}
        loading={loading}
        daysThreshold={daysThreshold}
        onThresholdChange={setDaysThreshold}
        onRefresh={loadData}
      />

      {/* Reassessment Queue */}
      <ReassessmentQueue
        items={queueItems}
        loading={loading}
        onRefresh={loadData}
      />
    </div>
  );
}
