"use client";

import React from 'react';
import { User, UserRole, ROLE_NAMES } from '@/types/user';
import {
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { getRoleColor } from '@/utils/permissionUtils';
import { getUserApprovalStats } from '@/utils/policyPermissionMapper';

interface RoleBasedDashboardProps {
  user: User;
  className?: string;
}

// Mock 데이터 (실제로는 API에서 가져올 데이터)
const MOCK_DASHBOARD_DATA = {
  admin: {
    totalUsers: 24,
    activeUsers: 22,
    pendingApprovals: 8,
    systemAlerts: 3,
    recentActivities: [
      { id: 1, action: '사용자 권한 변경', user: '김철수', time: '10분 전' },
      { id: 2, action: '정책 수정', user: '박영희', time: '30분 전' },
      { id: 3, action: '시스템 설정 변경', user: '관리자', time: '1시간 전' }
    ],
    systemHealth: { cpu: 45, memory: 62, storage: 78 }
  },
  manager: {
    teamAssets: { total: 1250000000, change: 5.2 },
    pendingApprovals: 5,
    teamMembers: 8,
    policyViolations: 2,
    recentApprovals: [
      { id: 1, transaction: '비트코인 출금', amount: 5000000, status: 'approved', time: '2시간 전' },
      { id: 2, transaction: '이더리움 입금', amount: 12000000, status: 'pending', time: '4시간 전' }
    ],
    approvalStats: { approved: 12, pending: 5, rejected: 1 }
  },
  operator: {
    todayTransactions: { count: 15, volume: 450000000 },
    myRequests: 3,
    pendingApprovals: 2,
    completedToday: 12,
    recentTransactions: [
      { id: 1, type: '출금', asset: 'BTC', amount: 0.5, status: 'completed', time: '1시간 전' },
      { id: 2, type: '입금', asset: 'ETH', amount: 10, status: 'pending', time: '3시간 전' }
    ],
    quickActions: ['거래 신청', '잔액 조회', '승인 요청']
  },
  viewer: {
    assetsOverview: { total: 2500000000, assets: 5 },
    recentReports: [
      { id: 1, name: '월간 거래 보고서', date: '2024-01-15', type: 'PDF' },
      { id: 2, name: '자산 현황 요약', date: '2024-01-10', type: 'Excel' }
    ],
    marketData: { btc: 52000000, eth: 3200000, change: 2.1 },
    accessLimits: ['데이터 조회만 가능', '수정 권한 없음']
  }
};

function AdminDashboard({ user }: { user: User }) {
  const data = MOCK_DASHBOARD_DATA.admin;

  return (
    <div className="space-y-6">
      {/* 시스템 현황 위젯 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <UsersIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">전체 사용자</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-sky-50 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-sky-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">활성 사용자</p>
              <p className="text-2xl font-bold text-gray-900">{data.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">승인 대기</p>
              <p className="text-2xl font-bold text-gray-900">{data.pendingApprovals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">시스템 알림</p>
              <p className="text-2xl font-bold text-gray-900">{data.systemAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 활동 모니터링 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">최근 활동</h3>
        <div className="space-y-3">
          {data.recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-sky-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">사용자: {activity.user}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 설정 접근 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">관리 도구</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <UsersIcon className="w-8 h-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">사용자 관리</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <ShieldCheckIcon className="w-8 h-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">권한 설정</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <DocumentTextIcon className="w-8 h-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">정책 관리</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <BellIcon className="w-8 h-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">알림 설정</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ManagerDashboard({ user }: { user: User }) {
  const data = MOCK_DASHBOARD_DATA.manager;

  return (
    <div className="space-y-6">
      {/* 승인 대기 항목 위젯 */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-sky-900">승인 대기 항목</h3>
          <span className="bg-sky-600 text-white px-2 py-1 rounded-full text-sm font-medium">
            {data.pendingApprovals}건
          </span>
        </div>
        <div className="space-y-3">
          {data.recentApprovals.map((approval) => (
            <div key={approval.id} className="flex items-center justify-between bg-white rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{approval.transaction}</p>
                <p className="text-xs text-gray-500">
                  {approval.amount.toLocaleString()}원 • {approval.time}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                approval.status === 'approved' ? 'bg-sky-50 text-sky-700' :
                approval.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                'bg-red-50 text-red-700'
              }`}>
                {approval.status === 'approved' ? '승인됨' :
                 approval.status === 'pending' ? '대기중' : '거부됨'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 팀 자산 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">팀 자산</p>
              <p className="text-xl font-bold text-gray-900">
                {(data.teamAssets.total / 100000000).toFixed(1)}억원
              </p>
              <p className="text-xs text-sky-600">+{data.teamAssets.change}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">팀 구성원</p>
              <p className="text-xl font-bold text-gray-900">{data.teamMembers}명</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">정책 위반</p>
              <p className="text-xl font-bold text-gray-900">{data.policyViolations}건</p>
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 관리 바로가기 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">관리 기능</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center">
              <UsersIcon className="w-6 h-6 text-gray-600 mr-3" />
              <span className="font-medium text-gray-900">사용자 관리</span>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          </button>
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center">
              <DocumentTextIcon className="w-6 h-6 text-gray-600 mr-3" />
              <span className="font-medium text-gray-900">정책 설정</span>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

function OperatorDashboard({ user }: { user: User }) {
  const data = MOCK_DASHBOARD_DATA.operator;

  return (
    <div className="space-y-6">
      {/* 오늘의 거래 현황 */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-indigo-900 mb-4">오늘의 거래 현황</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">거래 건수</p>
            <p className="text-xl font-bold text-gray-900">{data.todayTransactions.count}건</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">거래 규모</p>
            <p className="text-xl font-bold text-gray-900">
              {(data.todayTransactions.volume / 100000000).toFixed(1)}억원
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">내 신청</p>
            <p className="text-xl font-bold text-gray-900">{data.myRequests}건</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">완료</p>
            <p className="text-xl font-bold text-gray-900">{data.completedToday}건</p>
          </div>
        </div>
      </div>

      {/* 승인 대기 중인 거래 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">최근 거래</h3>
        <div className="space-y-3">
          {data.recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.type} • {transaction.asset}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.amount} • {transaction.time}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                transaction.status === 'completed' ? 'bg-sky-50 text-sky-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {transaction.status === 'completed' ? '완료' : '대기중'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 거래 신청 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">빠른 작업</h3>
        <div className="grid grid-cols-3 gap-4">
          {data.quickActions.map((action, index) => (
            <button key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-900">
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ViewerDashboard({ user }: { user: User }) {
  const data = MOCK_DASHBOARD_DATA.viewer;

  return (
    <div className="space-y-6">
      {/* 자산 현황 요약 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">자산 현황 요약</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">총 자산</p>
            <p className="text-2xl font-bold text-gray-900">
              {(data.assetsOverview.total / 100000000).toFixed(1)}억원
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">보유 자산</p>
            <p className="text-2xl font-bold text-gray-900">{data.assetsOverview.assets}종</p>
          </div>
        </div>
      </div>

      {/* 최근 거래 내역 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">시장 현황</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">₿</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">비트코인</p>
                <p className="text-xs text-gray-500">BTC</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {data.marketData.btc.toLocaleString()}원
              </p>
              <p className="text-xs text-sky-600">+{data.marketData.change}%</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">Ξ</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">이더리움</p>
                <p className="text-xs text-gray-500">ETH</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {data.marketData.eth.toLocaleString()}원
              </p>
              <p className="text-xs text-sky-600">+{data.marketData.change}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 리포트 다운로드 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">최근 리포트</h3>
        <div className="space-y-3">
          {data.recentReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{report.name}</p>
                <p className="text-xs text-gray-500">{report.date} • {report.type}</p>
              </div>
              <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                다운로드
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 읽기 전용 표시 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-yellow-800">조회 전용 계정</p>
            <p className="text-xs text-yellow-600">데이터 조회만 가능하며 수정 권한이 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoleBasedDashboard({ user, className = '' }: RoleBasedDashboardProps) {
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'manager':
        return <ManagerDashboard user={user} />;
      case 'operator':
        return <OperatorDashboard user={user} />;
      case 'viewer':
        return <ViewerDashboard user={user} />;
      default:
        return <ViewerDashboard user={user} />;
    }
  };

  return (
    <div className={`${className}`}>
      {/* 대시보드 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getRoleColor(user.role)}`}>
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {ROLE_NAMES[user.role]} 대시보드
              </h2>
              <p className="text-sm text-gray-600">
                {user.name}님, 안녕하세요!
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
            {ROLE_NAMES[user.role]}
          </span>
        </div>
      </div>

      {/* 역할별 대시보드 내용 */}
      {renderDashboard()}
    </div>
  );
}