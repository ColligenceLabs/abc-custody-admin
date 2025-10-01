'use client'

import { useState } from 'react'
import {
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { AccessLogEntry, adminAccessLogs } from '@/data/adminAccessMockData'

interface AdminAccessMonitoringProps {
  isVisible: boolean
  onClose: () => void
}

export default function AdminAccessMonitoring({ isVisible, onClose }: AdminAccessMonitoringProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed' | 'blocked'>('all')
  const [filterTimeRange, setFilterTimeRange] = useState<'24h' | '7d' | '30d'>('24h')

  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>(adminAccessLogs)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-gray-700" />
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-600" />
      case 'blocked':
        return <XCircleIcon className="h-5 w-5 text-gray-800" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-gray-100 text-gray-800 border border-gray-200'
      case 'failed':
        return 'bg-gray-50 text-gray-700 border border-gray-200'
      case 'blocked':
        return 'bg-gray-200 text-gray-900 border border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return '성공'
      case 'failed':
        return '실패'
      case 'blocked':
        return '차단'
      default:
        return '알 수 없음'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const filteredLogs = accessLogs.filter(log => {
    if (filterStatus !== 'all' && log.status !== filterStatus) {
      return false
    }

    const logDate = new Date(log.timestamp)
    const now = new Date()
    const timeDiff = now.getTime() - logDate.getTime()

    switch (filterTimeRange) {
      case '24h':
        return timeDiff <= 24 * 60 * 60 * 1000
      case '7d':
        return timeDiff <= 7 * 24 * 60 * 60 * 1000
      case '30d':
        return timeDiff <= 30 * 24 * 60 * 60 * 1000
      default:
        return true
    }
  })

  const getLogCounts = () => {
    const total = filteredLogs.length
    const success = filteredLogs.filter(log => log.status === 'success').length
    const failed = filteredLogs.filter(log => log.status === 'failed').length
    const blocked = filteredLogs.filter(log => log.status === 'blocked').length

    return { total, success, failed, blocked }
  }

  const counts = getLogCounts()

  if (!isVisible) return null

  return (
    <div className="space-y-6">
      {/* 관리자 접근 모니터링 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <EyeIcon className="h-6 w-6 mr-2 text-primary-600" />
              관리자 접근 모니터링
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              관리자 페이지 접근 로그 및 보안 이벤트를 실시간으로 모니터링합니다
            </p>
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">{counts.total}</div>
            <div className="text-sm text-gray-600">전체 로그</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-800">{counts.success}</div>
            <div className="text-sm text-gray-600">성공</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{counts.failed}</div>
            <div className="text-sm text-gray-600">실패</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{counts.blocked}</div>
            <div className="text-sm text-gray-600">차단</div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">필터:</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">상태:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">전체</option>
              <option value="success">성공</option>
              <option value="failed">실패</option>
              <option value="blocked">차단</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">기간:</span>
            <select
              value={filterTimeRange}
              onChange={(e) => setFilterTimeRange(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="24h">최근 24시간</option>
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
            </select>
          </div>
        </div>

        {/* 접근 로그 테이블 */}
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP / 위치
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상세
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {formatDate(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {log.admin}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-mono text-sm">{log.ip}</div>
                        <div className="text-xs text-gray-500">{log.location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                          {getStatusText(log.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.reason && (
                        <div className="text-xs">{log.reason}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1 truncate max-w-xs" title={log.userAgent}>
                        {log.userAgent}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">선택한 조건에 해당하는 로그가 없습니다.</p>
            <p className="text-sm text-gray-400">
              필터 조건을 변경해 보세요.
            </p>
          </div>
        )}

        {/* 보안 알림 */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-800 mb-1">보안 알림</p>
              <div className="text-gray-700 space-y-1">
                <p>• 의심스러운 IP에서 {counts.blocked}회 접근 차단</p>
                <p>• 지난 24시간 동안 {counts.failed}회 로그인 실패</p>
                <p>• 정기적으로 접근 로그를 검토하고 이상 징후를 모니터링하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}