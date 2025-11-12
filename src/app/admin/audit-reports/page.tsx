"use client";

import { useState, useEffect } from "react";
import { ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Clock, Shield, Users } from "lucide-react";
import AnomalyTransactionsTable from "./components/AnomalyTransactionsTable";
import ActivityHeatmap from "./components/ActivityHeatmap";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  alert?: boolean;
}

function StatCard({ title, value, icon: Icon, alert }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <Icon
          className={`w-5 h-5 ${alert ? "text-red-600" : "text-sky-600"}`}
        />
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

export default function AuditDashboardPage() {
  const [stats, setStats] = useState({
    todayDeposits: 0,
    todayWithdrawals: 0,
    anomalies: 0,
    pendingApprovals: 0,
    policyViolations: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const authData = localStorage.getItem("admin-auth");
      const token = authData ? JSON.parse(authData).accessToken : null;
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        }/api/reports/statistics/realtime`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error("통계 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">감사 대시보드</h1>
        <p className="mt-1 text-gray-600">
          실시간 시스템 모니터링 및 이상 거래 탐지
        </p>
      </div>

      {/* 주요 지표 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="금일 입금"
              value={stats.todayDeposits}
              icon={ArrowDownToLine}
            />
            <StatCard
              title="금일 출금"
              value={stats.todayWithdrawals}
              icon={ArrowUpFromLine}
            />
            <StatCard
              title="이상 거래"
              value={stats.anomalies}
              icon={AlertTriangle}
              alert={stats.anomalies > 0}
            />
            <StatCard
              title="대기 승인"
              value={stats.pendingApprovals}
              icon={Clock}
            />
            <StatCard
              title="정책 위반"
              value={stats.policyViolations}
              icon={Shield}
            />
            <StatCard
              title="활성 사용자"
              value={stats.activeUsers}
              icon={Users}
            />
          </div>

          {/* 빠른 접근 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">빠른 접근</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAccessCard
                title="거래 리포트"
                href="/admin/audit-reports/transactions"
              />
              <QuickAccessCard
                title="잔액 관리"
                href="/admin/audit-reports/balances"
              />
              <QuickAccessCard
                title="승인 분석"
                href="/admin/audit-reports/approvals"
              />
              <QuickAccessCard
                title="감사 로그"
                href="/admin/audit-reports/audit-logs"
              />
            </div>
          </div>

          {/* 이상 거래 테이블 */}
          <div className="mt-6">
            <AnomalyTransactionsTable />
          </div>

          {/* 활동 히트맵 */}
          <div className="mt-6">
            <ActivityHeatmap />
          </div>

          {/* 안내 */}
          <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              관리자 감사 대시보드
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• 전체 고객(개인+기업)의 거래 및 활동을 모니터링합니다.</li>
              <li>• 실시간 통계는 5분마다 자동 갱신됩니다.</li>
              <li>• 감사 로그는 모든 API 요청을 자동으로 기록합니다.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function QuickAccessCard({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:scale-105 transition-all text-center"
    >
      <span className="text-sm font-medium text-gray-900">{title}</span>
    </a>
  );
}
