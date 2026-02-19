'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Inquiry {
  id: string
  companyName: string
  estimatedAssetSize: string
  contactName: string
  contactPosition: string
  contactPhone: string
  companyEmail: string
  inquiryContent: string
  status: string
  priority: string | null
  assignedTo: string | null
  assignedToName: string | null
  assignedAt: string | null
  processedAt: string | null
  processedBy: string | null
  processedByName: string | null
  isAdult: boolean
  agreedToTerms: boolean
  terms: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  updatedAt: string
}

interface History {
  id: string
  actionType: string
  adminUserId: string | null
  adminUserName: string | null
  fromStatus: string | null
  toStatus: string | null
  assignedToId: string | null
  assignedToName: string | null
  fromPriority: string | null
  toPriority: string | null
  note: string | null
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: '대기',
  assigned: '배정됨',
  in_progress: '진행중',
  contacted: '연락완료',
  completed: '완료',
  rejected: '거절',
  on_hold: '보류'
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-gray-600 bg-gray-50 border-gray-200',
  assigned: 'text-blue-600 bg-blue-50 border-blue-200',
  in_progress: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  contacted: 'text-purple-600 bg-purple-50 border-purple-200',
  completed: 'text-sky-600 bg-sky-50 border-sky-200',
  rejected: 'text-red-600 bg-red-50 border-red-200',
  on_hold: 'text-yellow-600 bg-yellow-50 border-yellow-200'
}

const PRIORITY_LABELS: Record<string, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
  urgent: '긴급'
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-600 bg-gray-50',
  medium: 'text-blue-600 bg-blue-50',
  high: 'text-purple-600 bg-purple-50',
  urgent: 'text-red-600 bg-red-50'
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  created: '문의 생성',
  status_change: '상태 변경',
  assigned: '담당자 배정',
  priority_change: '우선순위 변경',
  note_added: '메모 추가',
  contacted: '고객 연락',
  completed: '처리 완료',
  rejected: '거절'
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'completed':
      return 'default'
    case 'rejected':
      return 'destructive'
    case 'pending':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getPriorityVariant = (priority: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (priority) {
    case 'urgent':
      return 'destructive'
    case 'high':
      return 'default'
    case 'medium':
      return 'outline'
    case 'low':
      return 'secondary'
    default:
      return 'secondary'
  }
}

export default function CorporateInquiryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  // 상태
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [history, setHistory] = useState<History[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 액션 모달
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showPriorityModal, setShowPriorityModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)

  // 폼 데이터
  const [newStatus, setNewStatus] = useState('')
  const [newPriority, setNewPriority] = useState('')
  const [assignToId, setAssignToId] = useState('')
  const [assignToName, setAssignToName] = useState('')
  const [note, setNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // 데이터 로드
  useEffect(() => {
    loadInquiry()
  }, [id])

  const loadInquiry = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get(`/corporate-inquiry/admin/${id}`)

      if (response.data.success) {
        setInquiry(response.data.data.inquiry)
        setHistory(response.data.data.history)
      }

    } catch (err: any) {
      console.error('[CorporateInquiry] 상세 로드 오류:', err)
      setError(err.response?.data?.message || err.message || '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!newStatus) return

    try {
      setActionLoading(true)

      await apiClient.put(`/corporate-inquiry/admin/${id}/status`, {
        status: newStatus
      })

      setShowStatusModal(false)
      setNewStatus('')
      loadInquiry()

    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '상태 변경 실패')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!assignToId || !assignToName) return

    try {
      setActionLoading(true)

      await apiClient.put(`/corporate-inquiry/admin/${id}/assign`, {
        assignedTo: assignToId,
        assignedToName: assignToName
      })

      setShowAssignModal(false)
      setAssignToId('')
      setAssignToName('')
      loadInquiry()

    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '담당자 배정 실패')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePriorityChange = async () => {
    if (!newPriority) return

    try {
      setActionLoading(true)

      await apiClient.put(`/corporate-inquiry/admin/${id}/priority`, {
        priority: newPriority
      })

      setShowPriorityModal(false)
      setNewPriority('')
      loadInquiry()

    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '우선순위 변경 실패')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!note.trim()) return

    try {
      setActionLoading(true)

      await apiClient.post(`/corporate-inquiry/admin/${id}/notes`, {
        note: note.trim()
      })

      setShowNoteModal(false)
      setNote('')
      loadInquiry()

    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '메모 추가 실패')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="text-center text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (error || !inquiry) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-2" />
            <p className="text-destructive mb-4">{error || '문의를 찾을 수 없습니다'}</p>
            <Button onClick={() => router.back()}>
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">법인 문의 상세</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getStatusVariant(inquiry.status)}>
              {STATUS_LABELS[inquiry.status]}
            </Badge>
            {inquiry.priority && (
              <Badge variant={getPriorityVariant(inquiry.priority)}>
                우선순위: {PRIORITY_LABELS[inquiry.priority]}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAssignModal(true)}
          >
            담당자 배정
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPriorityModal(true)}
          >
            우선순위 변경
          </Button>
          <Button
            variant="default"
            onClick={() => setShowStatusModal(true)}
          >
            상태 변경
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowNoteModal(true)}
          >
            메모 추가
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 좌측: 문의 정보 */}
        <div className="col-span-2 space-y-4">
          {/* 회사 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                회사 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">회사명</dt>
                  <dd className="mt-1 text-sm font-medium">{inquiry.companyName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">예상 자산 규모</dt>
                  <dd className="mt-1 text-sm font-medium">{inquiry.estimatedAssetSize}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">회사 이메일</dt>
                  <dd className="mt-1 text-sm font-medium">{inquiry.companyEmail}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* 담당자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                담당자 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">이름</dt>
                  <dd className="mt-1 text-sm font-medium">{inquiry.contactName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">직책</dt>
                  <dd className="mt-1 text-sm font-medium">{inquiry.contactPosition}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">전화번호</dt>
                  <dd className="mt-1 text-sm font-medium">{inquiry.contactPhone}</dd>
                </div>
                {inquiry.ipAddress && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">접속 IP</dt>
                    <dd className="mt-1 text-sm font-mono">{inquiry.ipAddress}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* 문의 내용 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                문의 내용
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{inquiry.inquiryContent}</p>
            </CardContent>
          </Card>

          {/* 히스토리 타임라인 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                처리 히스토리
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">히스토리가 없습니다</p>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {ACTION_TYPE_LABELS[item.actionType]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                        {item.adminUserName && (
                          <p className="text-xs text-muted-foreground mb-1">
                            처리자: {item.adminUserName}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-sm bg-muted p-2 rounded-md">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 우측: 처리 정보 */}
        <div className="col-span-1 space-y-4">
          {/* 처리 현황 */}
          <Card>
            <CardHeader>
              <CardTitle>처리 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">담당자</dt>
                  <dd className="mt-1 text-sm font-medium">
                    {inquiry.assignedToName || '미배정'}
                  </dd>
                </div>
                {inquiry.assignedAt && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">배정일시</dt>
                    <dd className="mt-1 text-sm font-medium">{formatDate(inquiry.assignedAt)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">문의일시</dt>
                  <dd className="mt-1 text-sm font-medium">{formatDate(inquiry.createdAt)}</dd>
                </div>
                {inquiry.processedAt && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">처리 완료일시</dt>
                      <dd className="mt-1 text-sm font-medium">{formatDate(inquiry.processedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">처리자</dt>
                      <dd className="mt-1 text-sm font-medium">{inquiry.processedByName}</dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 상태 변경 모달 */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>상태 변경</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
              >
                <option value="">상태 선택</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleStatusChange}
                  disabled={actionLoading || !newStatus}
                  className="flex-1"
                >
                  {actionLoading ? '처리 중...' : '변경'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 담당자 배정 모달 */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>담당자 배정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                value={assignToId}
                onChange={(e) => setAssignToId(e.target.value)}
                placeholder="담당자 ID"
              />
              <Input
                type="text"
                value={assignToName}
                onChange={(e) => setAssignToName(e.target.value)}
                placeholder="담당자 이름"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={actionLoading || !assignToId || !assignToName}
                  className="flex-1"
                >
                  {actionLoading ? '처리 중...' : '배정'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 우선순위 변경 모달 */}
      {showPriorityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>우선순위 변경</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
              >
                <option value="">우선순위 선택</option>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPriorityModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handlePriorityChange}
                  disabled={actionLoading || !newPriority}
                  className="flex-1"
                >
                  {actionLoading ? '처리 중...' : '변경'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 메모 추가 모달 */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>메모 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="처리 내용을 입력하세요"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleAddNote}
                  disabled={actionLoading || !note.trim()}
                  className="flex-1"
                >
                  {actionLoading ? '처리 중...' : '추가'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
