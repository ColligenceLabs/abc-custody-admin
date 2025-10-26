'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, Coins } from 'lucide-react';

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

        {/* 보안 설정 */}
        <Link href="/admin/settings/security">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">보안 설정</CardTitle>
                  <CardDescription>보안 정책 및 권한</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                접근 제어, 세션 관리, 블록체인 컨펌 수 설정
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
              다크 모드, 색상 테마, 레이아웃 설정
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
                지원 토큰 관리, 출금 한도, 수수료, 블록체인 설정
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* 데이터 설정 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                <Database className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg">데이터 설정</CardTitle>
                <CardDescription>백업 및 내보내기</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              데이터 백업, 내보내기, 보관 정책 설정
            </p>
          </CardContent>
        </Card>

        {/* 시스템 정보 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <SettingsIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-lg">시스템 정보</CardTitle>
                <CardDescription>버전 및 시스템 상태</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              버전 정보, 시스템 상태, 업데이트 확인
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 상태 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 상태</CardTitle>
          <CardDescription>현재 시스템 운영 정보</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">시스템 버전</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">v1.0.0</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">마지막 업데이트</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">2025-01-20</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">시스템 상태</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">정상</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
