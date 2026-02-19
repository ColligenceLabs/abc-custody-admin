'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  RefreshCw,
  Building2,
  Clock,
  User,
  AlertCircle
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface Inquiry {
  id: string
  companyName: string
  estimatedAssetSize: string
  contactName: string
  contactPosition: string
  contactPhone: string
  companyEmail: string
  status: string
  priority: string | null
  assignedTo: string | null
  assignedToName: string | null
  createdAt: string
  updatedAt: string
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

export default function CorporateInquiriesPage() {
  const router = useRouter()

  // 상태
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 필터링
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // 데이터 로드
  useEffect(() => {
    loadInquiries()
  }, [currentPage, statusFilter, priorityFilter, searchQuery, dateFilter, startDate, endDate])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page: currentPage.toString(),
        limit: '20'
      }

      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter
      if (searchQuery) params.search = searchQuery
      if (dateFilter) params.dateFilter = dateFilter
      if (startDate && endDate) {
        params.startDate = startDate
        params.endDate = endDate
      }

      const response = await apiClient.get('/corporate-inquiry/admin', { params })

      if (response.data.success) {
        setInquiries(response.data.data.inquiries)
        setTotal(response.data.data.pagination.total)
        setTotalPages(response.data.data.pagination.totalPages)
      }

    } catch (err: any) {
      console.error('[CorporateInquiries] 로드 오류:', err)
      setError(err.response?.data?.message || err.message || '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadInquiries()
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">법인 회원가입 문의</h2>
          <p className="text-muted-foreground">
            법인 회원가입 문의 목록 및 관리
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadInquiries} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 문의</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inquiries.filter(i => i.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">처리 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {inquiries.filter(i => ['assigned', 'in_progress', 'contacted'].includes(i.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">
              {inquiries.filter(i => i.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* 검색 */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="회사명, 담당자명, 이메일로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                className="pl-9 h-10"
              />
            </div>

            {/* 상태 필터 */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 px-3 py-2 text-sm rounded-md border border-input bg-background w-36"
            >
              <option value="">모든 상태</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* 우선순위 필터 */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="h-10 px-3 py-2 text-sm rounded-md border border-input bg-background w-36"
            >
              <option value="">모든 우선순위</option>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* 기간 필터 */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value)
                if (e.target.value !== 'custom') {
                  setStartDate('')
                  setEndDate('')
                }
                setCurrentPage(1)
              }}
              className="h-10 px-3 py-2 text-sm rounded-md border border-input bg-background w-36"
            >
              <option value="">전체 기간</option>
              <option value="today">오늘</option>
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
              <option value="custom">기간 지정</option>
            </select>

            {/* 커스텀 날짜 범위 */}
            {dateFilter === 'custom' && (
              <>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="시작일"
                  className="h-10 w-40"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="종료일"
                  className="h-10 w-40"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">로딩 중...</div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadInquiries}>
                다시 시도
              </Button>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">문의가 없습니다</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        회사명
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        담당자
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        자산 규모
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        상태
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        우선순위
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        배정자
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        문의일시
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inquiries.map((inquiry) => (
                      <tr
                        key={inquiry.id}
                        onClick={() => router.push(`/admin/members/corporate-inquiries/${inquiry.id}`)}
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium">{inquiry.companyName}</div>
                          <div className="text-sm text-muted-foreground">{inquiry.companyEmail}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{inquiry.contactName}</div>
                          <div className="text-sm text-muted-foreground">{inquiry.contactPosition}</div>
                        </td>
                        <td className="p-4 text-sm">
                          {inquiry.estimatedAssetSize}
                        </td>
                        <td className="p-4">
                          <Badge variant={getStatusVariant(inquiry.status)}>
                            {STATUS_LABELS[inquiry.status]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {inquiry.priority && (
                            <Badge variant={getPriorityVariant(inquiry.priority)}>
                              {PRIORITY_LABELS[inquiry.priority]}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-sm">
                          {inquiry.assignedToName || '-'}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(inquiry.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {total > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    전체 {total}건 중 {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, total)}건 표시
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          className={
                            currentPage === 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>

                      {Array.from(
                        { length: totalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                          }
                          className={
                            currentPage === totalPages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
