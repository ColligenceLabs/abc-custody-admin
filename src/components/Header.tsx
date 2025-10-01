"use client";

import { useState, useEffect } from "react";
import {
  UserCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { toggleSidebar, isCollapsed } = useSidebar();
  const [sessionTime, setSessionTime] = useState(1800); // 30분 = 1800초
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // UI/UX용 세션 타이머 - 실제 서버 연동 없이 클라이언트에서만 동작
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime((prev) => {
        if (prev <= 1) {
          // 시간이 끝나면 로그아웃 (UI/UX용)
          logout();
          return 0;
        }

        // 5분 남았을 때 경고 모달 표시
        if (prev === 301) {
          // 5분 1초일 때 (다음 초에 5분이 됨)
          setShowExtensionModal(true);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [logout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const extendSession = () => {
    // UI/UX용 세션 연장 - 30분 추가
    setSessionTime(1800); // 30분으로 재설정
    setShowExtensionModal(false);
  };

  const getTimeColor = () => {
    if (sessionTime <= 300) return "text-red-600"; // 5분 이하
    if (sessionTime <= 600) return "text-yellow-600"; // 10분 이하
    return "text-gray-600";
  };

  return (
    <>
      <header className={`fixed top-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200 h-20 transition-all duration-300 ${
        isCollapsed ? 'left-16' : 'left-64'
      }`}>
        <div className="px-4 h-full flex items-center">
          <div className="w-full flex items-center justify-between">
            {/* 햄버거 메뉴 버튼 */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="메뉴 토글"
            >
              <Bars3Icon className="h-5 w-5 text-gray-600" />
            </button>

            <div className="flex items-center space-x-4">
              {/* 세션 타이머 */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <ClockIcon className={`h-5 w-5 ${getTimeColor()}`} />
                  <div>
                    <p className={`text-sm ${getTimeColor()}`}>
                      {formatTime(sessionTime)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={extendSession}
                  className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 transition-colors"
                >
                  시간 연장
                </button>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>

              {/* 사용자 프로필 */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || "관리자"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {user?.department || t("header.admin")}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {user?.name?.charAt(0) || "A"}
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        showProfileDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* 드롭다운 메뉴 */}
                {showProfileDropdown && (
                  <>
                    {/* 백드롭 */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileDropdown(false)}
                    />

                    {/* 드롭다운 */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      {/* 사용자 정보 */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-primary-600">
                              {user?.name?.charAt(0) || "A"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user?.name || "관리자"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user?.email || "admin@company.com"}
                            </p>
                          </div>
                        </div>
                        {user?.department && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {user.department}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 메뉴 항목 */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            logout();
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          로그아웃
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="w-px h-6 bg-gray-300"></div>
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      {/* 세션 만료 경고 모달 */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <ClockIcon className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  세션 만료 경고
                </h3>
                <p className="text-sm text-gray-600">
                  5분 후 자동으로 로그아웃됩니다
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                세션이 곧 만료됩니다. 작업을 계속하시려면 시간을 연장해주세요.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowExtensionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                나중에
              </button>
              <button
                onClick={extendSession}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                30분 연장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
