"use client";

import { useState, useEffect } from "react";
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import { Activity } from "lucide-react";

interface HeatmapData {
  date: string;
  hour: number;
  count: number;
}

interface TooltipData {
  date: string;
  hour: number;
  count: number;
  x: number;
  y: number;
}

export default function ActivityHeatmap() {
  const [hourlyActivity, setHourlyActivity] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
        }/api/reports/audit-logs/statistics`,
        {
          credentials: "include",
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

  // 최근 7일 날짜 배열 생성 (최신순)
  const getLast7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 데이터 맵 생성 (date-hour 키로 count 저장)
  const dataMap = new Map<string, number>();
  hourlyActivity.forEach((item) => {
    const key = `${item.date}-${item.hour}`;
    dataMap.set(key, parseInt(String(item.count)));
  });

  // 최대값 계산 (색상 강도용)
  const maxCount = Math.max(...Array.from(dataMap.values()), 1);

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-100";
    const intensity = count / maxCount;

    if (intensity > 0.75) return "bg-sky-600";
    if (intensity > 0.5) return "bg-sky-500";
    if (intensity > 0.25) return "bg-sky-400";
    return "bg-sky-300";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
  };

  const handleMouseEnter = (
    e: React.MouseEvent,
    date: string,
    hour: number,
    count: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      date,
      hour,
      count,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-sky-600" />
        완료된 거래 (최근 7일)
      </h3>

      {/* 히트맵 */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* 시간 레이블 (상단) */}
          <div className="flex mb-1">
            <div className="w-32 flex-shrink-0"></div>
            <div className="flex-1 grid gap-[2px]" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="text-[10px] text-gray-500 text-center font-medium"
                >
                  {hour.toString().padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>

          {/* 날짜별 행 */}
          {last7Days.map((date) => (
            <div key={date} className="flex mb-[2px]">
              {/* 날짜 레이블 (좌측) */}
              <div className="w-32 flex-shrink-0 pr-3 flex items-center">
                <span className="text-xs text-gray-600">
                  {formatDate(date)}
                </span>
              </div>

              {/* 시간별 셀 */}
              <div className="flex-1 grid gap-[2px]" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                {hours.map((hour) => {
                  const key = `${date}-${hour}`;
                  const count = dataMap.get(key) || 0;
                  return (
                    <div
                      key={hour}
                      className={`aspect-square ${getColor(
                        count
                      )} rounded cursor-pointer transition-all hover:ring-2 hover:ring-sky-500 hover:scale-110`}
                      onMouseEnter={(e) => handleMouseEnter(e, date, hour, count)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 색상 범례 */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="text-xs text-gray-600">거래 없음</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <div className="w-4 h-4 bg-sky-300 rounded"></div>
          <div className="w-4 h-4 bg-sky-400 rounded"></div>
          <div className="w-4 h-4 bg-sky-500 rounded"></div>
          <div className="w-4 h-4 bg-sky-600 rounded"></div>
        </div>
        <span className="text-xs text-gray-600">거래 많음</span>
      </div>

      {/* 툴팁 */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 80}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="text-xs space-y-1">
            <div className="font-semibold text-gray-900">
              {formatDate(tooltip.date)}
            </div>
            <div className="text-gray-600">
              시간: {tooltip.hour.toString().padStart(2, "0")}시
            </div>
            <div className="text-gray-600">거래: {tooltip.count}건</div>
          </div>
        </div>
      )}

      {/* 통계 요약 */}
      {hourlyActivity.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">총 거래: </span>
              <span className="font-semibold text-gray-900">
                {hourlyActivity.reduce(
                  (sum, h) => sum + parseInt(String(h.count)),
                  0
                )}
                건
              </span>
            </div>
            <div>
              <span className="text-gray-600">최대 거래: </span>
              <span className="font-semibold text-gray-900">{maxCount}건</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
