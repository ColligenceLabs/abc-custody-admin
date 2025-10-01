'use client'

import { useState } from 'react'
import {
  GlobeAltIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { Modal } from '@/components/common/Modal'

interface IPWhitelistEntry {
  id: string
  ipRange: string
  description: string
  type: 'single' | 'range' | 'cidr'
  addedAt: string
  lastUsed?: string
  addedBy: string
  isActive: boolean
}

interface AdminIPWhitelistManagementProps {
  isVisible: boolean
  onClose: () => void
}

export default function AdminIPWhitelistManagement({ isVisible, onClose }: AdminIPWhitelistManagementProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newIP, setNewIP] = useState({
    ipRange: '',
    description: '',
    type: 'single' as 'single' | 'range' | 'cidr'
  })

  const [whitelistEntries, setWhitelistEntries] = useState<IPWhitelistEntry[]>([
    {
      id: '1',
      ipRange: '192.168.1.0/24',
      description: '본사 사무실 네트워크',
      type: 'cidr',
      addedAt: '2025-01-15T09:00:00Z',
      lastUsed: '2025-01-22T14:30:00Z',
      addedBy: 'admin@company.com',
      isActive: true
    },
    {
      id: '2',
      ipRange: '203.252.33.1-203.252.33.50',
      description: '지사 사무실 IP 대역',
      type: 'range',
      addedAt: '2025-01-10T11:20:00Z',
      lastUsed: '2025-01-20T16:45:00Z',
      addedBy: 'manager@company.com',
      isActive: true
    },
    {
      id: '3',
      ipRange: '175.223.45.120',
      description: 'VPN 게이트웨이',
      type: 'single',
      addedAt: '2025-01-08T08:15:00Z',
      lastUsed: '2025-01-21T10:30:00Z',
      addedBy: 'admin@company.com',
      isActive: true
    },
    {
      id: '4',
      ipRange: '10.0.0.0/8',
      description: '내부 사설망 (비활성)',
      type: 'cidr',
      addedAt: '2025-01-05T15:20:00Z',
      addedBy: 'admin@company.com',
      isActive: false
    }
  ])

  const validateIPRange = (ipRange: string, type: 'single' | 'range' | 'cidr') => {
    const singleIPRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/
    const rangeRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

    switch (type) {
      case 'single':
        return singleIPRegex.test(ipRange)
      case 'cidr':
        return cidrRegex.test(ipRange)
      case 'range':
        return rangeRegex.test(ipRange)
      default:
        return false
    }
  }

  const handleAddIP = () => {
    if (!newIP.ipRange || !newIP.description) return
    if (!validateIPRange(newIP.ipRange, newIP.type)) {
      alert('올바른 IP 형식이 아닙니다.')
      return
    }

    const existingIP = whitelistEntries.find(entry => entry.ipRange === newIP.ipRange)
    if (existingIP) {
      alert('이미 등록된 IP 대역입니다.')
      return
    }

    const entry: IPWhitelistEntry = {
      id: Date.now().toString(),
      ipRange: newIP.ipRange,
      description: newIP.description,
      type: newIP.type,
      addedAt: new Date().toISOString(),
      addedBy: 'current-admin@company.com', // 실제로는 현재 로그인한 관리자
      isActive: true
    }

    setWhitelistEntries([...whitelistEntries, entry])
    setNewIP({ ipRange: '', description: '', type: 'single' })
    setShowAddModal(false)
  }

  const handleToggleActive = (id: string) => {
    setWhitelistEntries(entries =>
      entries.map(entry =>
        entry.id === id ? { ...entry, isActive: !entry.isActive } : entry
      )
    )
  }

  const handleRemoveIP = (id: string) => {
    if (confirm('이 IP 대역을 완전히 삭제하시겠습니까?')) {
      setWhitelistEntries(whitelistEntries.filter(entry => entry.id !== id))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return '단일 IP'
      case 'range': return 'IP 범위'
      case 'cidr': return 'CIDR 블록'
      default: return type
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'single': return 'bg-sky-100 text-sky-800'
      case 'range': return 'bg-indigo-100 text-indigo-800'
      case 'cidr': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'single': return '192.168.1.100'
      case 'range': return '192.168.1.1-192.168.1.100'
      case 'cidr': return '192.168.1.0/24'
      default: return ''
    }
  }

  if (!isVisible) return null

  return (
    <div className="space-y-6">
      {/* 관리자 IP 화이트리스트 관리 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShieldCheckIcon className="h-6 w-6 mr-2 text-primary-600" />
              관리자 접근 IP 제어
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              관리자 페이지 접근을 허용할 IP 주소 및 대역을 관리합니다
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              IP 대역 추가
            </button>
          </div>
        </div>

        {/* 안내 정보 */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">단일 IP</h4>
            <p className="text-sm text-gray-600">특정 IP 주소 하나만 허용</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">192.168.1.100</code>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">IP 범위</h4>
            <p className="text-sm text-gray-600">시작 IP부터 끝 IP까지 허용</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">192.168.1.1-192.168.1.100</code>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">CIDR 블록</h4>
            <p className="text-sm text-gray-600">네트워크 전체 대역 허용</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">192.168.1.0/24</code>
          </div>
        </div>

        {/* IP 목록 */}
        {whitelistEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP 대역
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    유형
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {whitelistEntries.map((entry) => (
                  <tr key={entry.id} className={`hover:bg-gray-50 ${!entry.isActive ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(entry.id)}
                        className="flex items-center"
                      >
                        {entry.isActive ? (
                          <EyeIcon className="h-5 w-5 text-sky-600" title="활성화됨" />
                        ) : (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" title="비활성화됨" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">{entry.ipRange}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(entry.type)}`}>
                        {getTypeLabel(entry.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {entry.addedBy}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(entry.addedAt)}
                      {entry.lastUsed && (
                        <div className="text-xs text-gray-500">
                          최근: {formatDate(entry.lastUsed)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(entry.id)}
                          className={`text-sm px-2 py-1 rounded ${
                            entry.isActive
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                          }`}
                        >
                          {entry.isActive ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleRemoveIP(entry.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="삭제"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">등록된 IP 대역이 없습니다.</p>
            <p className="text-sm text-gray-400">
              관리자 접근을 허용할 IP 대역을 추가해 주세요.
            </p>
          </div>
        )}

        {/* 경고 메시지 */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-800 mb-1">관리자 접근 제어 주의사항</p>
              <ul className="text-gray-700 space-y-1 list-disc list-inside">
                <li>모든 IP 대역을 삭제하면 관리자 접근이 불가능할 수 있습니다.</li>
                <li>CIDR 표기법을 사용하여 네트워크 대역을 효율적으로 관리하세요.</li>
                <li>VPN이나 프록시 서버 IP도 고려하여 설정하세요.</li>
                <li>정기적으로 사용하지 않는 IP 대역을 정리하세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* IP 추가 모달 */}
      <Modal isOpen={showAddModal}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">IP 대역 추가</h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewIP({ ipRange: '', description: '', type: 'single' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddIP()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP 유형 *
                </label>
                <select
                  value={newIP.type}
                  onChange={(e) => setNewIP({ ...newIP, type: e.target.value as any, ipRange: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="single">단일 IP</option>
                  <option value="range">IP 범위</option>
                  <option value="cidr">CIDR 블록</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP 주소/대역 *
                </label>
                <input
                  type="text"
                  required
                  value={newIP.ipRange}
                  onChange={(e) => setNewIP({ ...newIP, ipRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={getPlaceholder(newIP.type)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 *
                </label>
                <input
                  type="text"
                  required
                  value={newIP.description}
                  onChange={(e) => setNewIP({ ...newIP, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="예: 본사 사무실 네트워크"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewIP({ ipRange: '', description: '', type: 'single' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  추가
                </button>
              </div>
            </form>
        </div>
      </Modal>
    </div>
  )
}