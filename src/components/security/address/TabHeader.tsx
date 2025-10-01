"use client";

import { ReactNode } from "react";

interface TabHeaderProps {
  // 탭 타이틀과 설명
  title?: string;
  description?: string;

  // 왼쪽 액션 영역
  leftSection?: ReactNode;

  // 오른쪽 검색 및 필터 영역
  rightSection?: ReactNode;

  // 추가 클래스명
  className?: string;
}

export default function TabHeader({ title, description, leftSection, rightSection, className = "" }: TabHeaderProps) {
  return (
    <div className={`p-6 border-b border-gray-200 ${className}`}>
      <div className="space-y-4">
        {/* 타이틀 및 설명 영역 */}
        {(title || description) && (
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
            {/* 오른쪽 검색 및 필터 영역 (타이틀 라인) */}
            <div className="flex items-center space-x-3">
              {rightSection}
            </div>
          </div>
        )}

        {/* 액션 영역 (타이틀이 없을 때는 기존 레이아웃 유지) */}
        {!title && !description && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* 왼쪽 액션 영역 */}
            <div className="flex-shrink-0">
              {leftSection || <div className="h-10"></div>} {/* 빈 공간 유지를 위한 높이 */}
            </div>

            {/* 오른쪽 검색 및 필터 영역 */}
            <div className="flex items-center space-x-3">
              {rightSection}
            </div>
          </div>
        )}

        {/* 왼쪽 액션 버튼 영역 (타이틀이 있을 때) */}
        {(title || description) && leftSection && (
          <div className="flex justify-start">
            {leftSection}
          </div>
        )}
      </div>
    </div>
  );
}