/**
 * 최근 활동 피드 컴포넌트
 * 대출 관련 최근 활동 목록을 시간순으로 표시
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { LoanActivity } from "@/types/admin-lending";
import { getLoanDashboardStats } from "@/services/admin-lending";

export default function RecentActivities() {
  const [activities, setActivities] = useState<LoanActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const stats = await getLoanDashboardStats();
        setActivities(stats.recentActivities);
      } catch (error) {
        console.error("최근 활동 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  // 상대 시간 계산
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  // 금액 포맷팅
  const formatAmount = (amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    시간
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    고객명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    활동 내용
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    금액
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-48" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-20 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            최근 활동이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    시간
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    고객명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    활동 내용
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    금액
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500">
                        {getRelativeTime(activity.timestamp)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.customerName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {activity.description}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {activity.amount !== undefined && (
                        <div className="flex items-center justify-end space-x-2">
                          {activity.asset && (
                            <CryptoIcon
                              symbol={activity.asset}
                              size={16}
                              className="flex-shrink-0"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {typeof activity.amount === "number"
                              ? activity.amount < 100
                                ? `${activity.amount} ${activity.asset}`
                                : formatAmount(activity.amount)
                              : activity.amount}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
