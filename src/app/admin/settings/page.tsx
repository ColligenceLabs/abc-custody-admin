'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, User, Bell, Palette, Coins } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-sapphire-500 to-purple-600 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">설정</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            시스템 설정 및 환경 관리
          </p>
        </div>
      </div>

      {/* 설정 카테고리 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 계정 설정 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">계정 설정</CardTitle>
                <CardDescription>프로필 및 인증 정보</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              관리자 계정 정보, 비밀번호 변경, 이중 인증 설정
            </p>
          </CardContent>
        </Card>

        {/* 알림 설정 */}
        <Link href="/admin/settings/notifications">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">알림 설정</CardTitle>
                  <CardDescription>알림 및 이메일 설정</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                이메일, SMS 알림, 대출 리스크 알림 설정
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* 시스템 테마 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">시스템 테마</CardTitle>
                <CardDescription>UI 테마 및 디스플레이</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              다크 모드, 색상 테마 설정
            </p>
          </CardContent>
        </Card>

        {/* 자산 관리 */}
        <Link href="/admin/settings/assets">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Coins className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">자산 관리</CardTitle>
                  <CardDescription>토큰 및 출금 설정</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                지원 토큰 관리, 출금 한도, 수수료, 블록체인 컴펌수 설정
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
