"use client";

import { useState, useEffect } from "react";
import { Activity } from "lucide-react";

export default function ActivityHeatmap() {
  const [hourlyActivity, setHourlyActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const authData = localStorage.getItem("admin-auth");
      const token = authData ? JSON.parse(authData).accessToken : null;
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        }/api/reports/audit-logs/statistics`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setHourlyActivity(result.data.hourlyActivity || []);
      }
    } catch (error) {
      console.error("활동 통계 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // 시간대별 활동 맵 생성
  const activityMap = new Map();
  hourlyActivity.forEach((item: any) => {
    activityMap.set(parseInt(item.hour), parseInt(item.count));
  });

  // 최대값 계산 (색상 강도용)
  const maxCount = Math.max(...Array.from(activityMap.values()), 1);

  // 시간대 배열 (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-100";
    const intensity = count / maxCount;

    if (intensity > 0.8) return "bg-sky-600";
    if (intensity > 0.6) return "bg-sky-500";
    if (intensity > 0.4) return "bg-sky-400";
    if (intensity > 0.2) return "bg-sky-300";
    return "bg-sky-200";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-sky-600" />
        시간대별 활동 (최근 7일)
      </h3>

      {/* 히트맵 */}
      <div className="space-y-2">
        <div className="grid grid-cols-24 gap-1">
          {hours.map((hour) => {
            const count = activityMap.get(hour) || 0;
            return (
              <div
                key={hour}
                className={`h-12 ${getColor(
                  count
                )} rounded transition-colors hover:ring-2 hover:ring-sky-400 cursor-pointer`}
                title={`${hour}시: ${count}건`}
              />
            );
          })}
        </div>

        {/* 시간 레이블 */}
        <div className="grid grid-cols-24 gap-1 text-xs text-gray-500 text-center">
          {hours.map((hour) => (
            <div key={hour}>{hour % 3 === 0 ? `${hour}h` : ""}</div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
        <span>활동 없음</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <div className="w-4 h-4 bg-sky-200 rounded"></div>
            <div className="w-4 h-4 bg-sky-300 rounded"></div>
            <div className="w-4 h-4 bg-sky-400 rounded"></div>
            <div className="w-4 h-4 bg-sky-500 rounded"></div>
            <div className="w-4 h-4 bg-sky-600 rounded"></div>
          </div>
          <span>활동 많음</span>
        </div>
      </div>

      {/* 통계 요약 */}
      {hourlyActivity.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">총 활동: </span>
              <span className="font-semibold text-gray-900">
                {hourlyActivity.reduce(
                  (sum: number, h: any) => sum + parseInt(h.count),
                  0
                )}
                건
              </span>
            </div>
            <div>
              <span className="text-gray-600">피크 시간: </span>
              <span className="font-semibold text-gray-900">
                {
                  hourlyActivity.reduce(
                    (max: any, h: any) =>
                      parseInt(h.count) > parseInt(max.count) ? h : max,
                    { hour: 0, count: 0 }
                  ).hour
                }
                시
              </span>
            </div>
            <div>
              <span className="text-gray-600">평균: </span>
              <span className="font-semibold text-gray-900">
                {(
                  hourlyActivity.reduce(
                    (sum: number, h: any) => sum + parseInt(h.count),
                    0
                  ) / 24
                ).toFixed(0)}
                건/시간
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
