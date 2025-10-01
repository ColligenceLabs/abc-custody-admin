"use client";

import { useState, useEffect } from "react";
import { getRemainingTime } from "@/utils/addressHelpers";

interface RemainingTimeProps {
  nextResetAt: string;
}

export default function RemainingTime({ nextResetAt }: RemainingTimeProps) {
  const [mounted, setMounted] = useState(false);
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      setRemainingTime(getRemainingTime(nextResetAt));
    };

    // 초기 시간 설정
    updateTime();

    // 1분마다 업데이트
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [nextResetAt]);

  // 서버 사이드 렌더링 시에는 고정 텍스트 표시
  if (!mounted) {
    return (
      <div className="text-sm text-gray-900">
        자동 리셋 예정
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-900">
      {remainingTime}
    </div>
  );
}