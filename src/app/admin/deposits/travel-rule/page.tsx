'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle2, XCircle, Eye, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getTravelRuleQueue,
  getTravelRuleStats,
  getTravelRuleDetail,
  approveTravelRuleCompliance,
  triggerTravelRuleReturn,
} from '@/services/depositApi';
import type {
  TravelRuleQueueItem,
  TravelRuleStats,
  TravelRuleDetail,
  TravelRuleComplianceStatus,
} from '@/types/deposit';

/**
 * Task 3.4: Travel Rule 검증 페이지
 *
 * 기능:
 * - 100만원 초과 거래 자동 감지
 * - VASP 정보 확인 UI
 * - 환불 처리 트리거
 * - 준수 상태별 필터링
 */
export default function TravelRuleVerificationPage() {
  const [stats, setStats] = useState<TravelRuleStats | null>(null);
  const [items, setItems] = useState<TravelRuleQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TravelRuleComplianceStatus | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<TravelRuleDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, [selectedStatus, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, queueData] = await Promise.all([
        getTravelRuleStats(),
        getTravelRuleQueue({
          filter: {
            complianceStatus: selectedStatus === 'all' ? undefined : [selectedStatus],
            searchQuery: searchQuery || undefined,
          },
          pageSize: 100,
        }),
      ]);

      setStats(statsData);
      setItems(queueData.items);
    } catch (error) {
      console.error('Failed to load Travel Rule data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 상세 정보 보기
  const handleViewDetail = async (depositId: string) => {
    try {
      const detail = await getTravelRuleDetail(depositId);
      if (detail) {
        setSelectedItem(detail);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Failed to load detail:', error);
    }
  };

  // 준수 승인
  const handleApprove = async (depositId: string) => {
    if (!window.confirm('이 거래의 Travel Rule 준수를 승인하시겠습니까?')) return;

    try {
      setActionLoading(true);
      await approveTravelRuleCompliance({
        depositId,
        notes: 'VASP 정보 확인 완료 - Travel Rule 준수',
        performedBy: 'admin@custody.com',
      });
      alert('✅ Travel Rule 준수 승인 완료');
      await loadData();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('❌ 승인 처리 실패');
    } finally {
      setActionLoading(false);
    }
  };

  // 환불 처리
  const handleReturn = async (depositId: string, reason: string) => {
    if (!window.confirm('이 거래를 환불 처리하시겠습니까?')) return;

    try {
      setActionLoading(true);
      await triggerTravelRuleReturn({
        depositId,
        reason: reason as any,
        notes: `Travel Rule 위반 - ${reason}`,
        performedBy: 'admin@custody.com',
      });
      alert('✅ 환불 처리 트리거 완료');
      await loadData();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to trigger return:', error);
      alert('❌ 환불 처리 실패');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold">Travel Rule 검증</h1>
        <p className="text-muted-foreground mt-2">
          100만원 초과 거래에 대한 Travel Rule 준수 검증 및 관리
        </p>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">한도 초과 거래</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.exceeding.count}건</div>
              <p className="text-xs text-muted-foreground">
                ₩{parseInt(stats.exceeding.volumeKRW).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">준수 필요</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.requiresCompliance.count}건</div>
              <p className="text-xs text-muted-foreground">
                {stats.requiresCompliance.percentage.toFixed(1)}% (₩
                {parseInt(stats.requiresCompliance.volumeKRW).toLocaleString()})
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">위반 건수</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.violations.count}건</div>
              <p className="text-xs text-muted-foreground">
                {stats.violations.percentage.toFixed(1)}% (₩
                {parseInt(stats.violations.volumeKRW).toLocaleString()})
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">준수 완료</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.compliant.count}건</div>
              <p className="text-xs text-muted-foreground">
                ₩{parseInt(stats.compliant.volumeKRW).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 주소 타입 분포 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>주소 타입 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Personal Wallet</div>
                  <div className="text-2xl font-bold">{stats.addressTypeDistribution.personal}건</div>
                </div>
                <Badge variant="outline">개인 지갑</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">VASP Wallet</div>
                  <div className="text-2xl font-bold">{stats.addressTypeDistribution.vasp}건</div>
                </div>
                <Badge variant="outline" className="bg-blue-50">
                  VASP
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="회원사명, 주소, TxHash 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
              >
                전체
              </Button>
              <Button
                variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('pending')}
              >
                검토 대기
              </Button>
              <Button
                variant={selectedStatus === 'non_compliant' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('non_compliant')}
              >
                위반
              </Button>
              <Button
                variant={selectedStatus === 'compliant' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('compliant')}
              >
                준수
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 검증 대기열 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>Travel Rule 검증 대기열</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">검증 대기 중인 거래가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-medium">시간</th>
                    <th className="pb-3 font-medium">회원사</th>
                    <th className="pb-3 font-medium">자산 / 금액</th>
                    <th className="pb-3 font-medium">주소 타입</th>
                    <th className="pb-3 font-medium">준수 상태</th>
                    <th className="pb-3 font-medium">검토 상태</th>
                    <th className="pb-3 font-medium text-right">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">
                        <div className="text-sm">{new Date(item.timestamp).toLocaleString('ko-KR')}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.txHash.slice(0, 10)}...
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{item.memberName}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium">
                          {item.amount} {item.asset}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ₩{parseInt(item.amountKRW).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant={item.addressType === 'vasp' ? 'default' : 'outline'}>
                          {item.addressType === 'vasp' ? 'VASP' : 'Personal'}
                        </Badge>
                        {item.vaspInfo && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.vaspInfo.name}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        {getComplianceStatusBadge(item.complianceStatus)}
                        {item.requiresReturn && (
                          <div className="text-xs text-red-600 mt-1">환불 필요</div>
                        )}
                      </td>
                      <td className="py-3">{getReviewStatusBadge(item.reviewStatus)}</td>
                      <td className="py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(item.depositId)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          상세
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 정보 모달 */}
      {showDetailModal && selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedItem(null);
          }}
          onApprove={handleApprove}
          onReturn={handleReturn}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}

// 준수 상태 배지
function getComplianceStatusBadge(status: TravelRuleComplianceStatus) {
  const variants: Record<TravelRuleComplianceStatus, { label: string; className: string }> = {
    compliant: { label: '준수', className: 'bg-green-100 text-green-800 border-green-300' },
    non_compliant: { label: '위반', className: 'bg-red-100 text-red-800 border-red-300' },
    pending: { label: '검토 대기', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    exempted: { label: '면제', className: 'bg-gray-100 text-gray-800 border-gray-300' },
  };

  const variant = variants[status];
  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

// 검토 상태 배지
function getReviewStatusBadge(status: 'pending' | 'approved' | 'rejected') {
  const variants = {
    pending: { label: '대기', className: 'bg-blue-100 text-blue-800 border-blue-300' },
    approved: { label: '승인', className: 'bg-green-100 text-green-800 border-green-300' },
    rejected: { label: '거부', className: 'bg-red-100 text-red-800 border-red-300' },
  };

  const variant = variants[status];
  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

// 상세 정보 모달 컴포넌트
function DetailModal({
  item,
  onClose,
  onApprove,
  onReturn,
  actionLoading,
}: {
  item: TravelRuleDetail;
  onClose: () => void;
  onApprove: (depositId: string) => void;
  onReturn: (depositId: string, reason: string) => void;
  actionLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Travel Rule 검증 상세</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            닫기
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>거래 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">회원사</div>
                  <div className="font-medium">{item.memberName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">거래 금액</div>
                  <div className="font-medium">
                    {item.amount} {item.asset} (₩{parseInt(item.amountKRW).toLocaleString()})
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">한도 초과 여부</div>
                  <div className="font-medium text-red-600">
                    {item.isExceeding ? `초과 (기준: ₩${parseInt(item.thresholdKRW).toLocaleString()})` : '미초과'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">주소 타입</div>
                  <Badge variant={item.addressType === 'vasp' ? 'default' : 'outline'}>
                    {item.addressType === 'vasp' ? 'VASP' : 'Personal Wallet'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VASP 정보 (VASP 주소인 경우) */}
          {item.vaspDetailInfo && (
            <Card>
              <CardHeader>
                <CardTitle>VASP 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">VASP 이름</div>
                    <div className="font-medium">{item.vaspDetailInfo.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">관할 지역</div>
                    <div className="font-medium">{item.vaspDetailInfo.jurisdiction}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">라이선스 번호</div>
                    <div className="font-medium">{item.vaspDetailInfo.licenseNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Travel Rule 준수</div>
                    <Badge
                      variant={item.vaspDetailInfo.travelRuleCompliant ? 'default' : 'destructive'}
                    >
                      {item.vaspDetailInfo.travelRuleCompliant ? '준수' : '미준수'}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">연락처</div>
                    <div className="font-medium">
                      {item.vaspDetailInfo.contactEmail}
                      {item.vaspDetailInfo.contactPhone && ` / ${item.vaspDetailInfo.contactPhone}`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 준수 상태 */}
          <Card>
            <CardHeader>
              <CardTitle>Travel Rule 준수 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">준수 상태</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.complianceStatus === 'compliant' && '모든 요구사항 충족'}
                      {item.complianceStatus === 'non_compliant' && 'Travel Rule 위반'}
                      {item.complianceStatus === 'pending' && '검토 대기 중'}
                      {item.complianceStatus === 'exempted' && '100만원 이하 면제'}
                    </div>
                  </div>
                  {getComplianceStatusBadge(item.complianceStatus)}
                </div>

                {item.requiresReturn && (
                  <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-red-900">환불 필요</div>
                        <div className="text-sm text-red-700 mt-1">
                          위반 사유: {item.violationReason || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 검증 타임라인 */}
          <Card>
            <CardHeader>
              <CardTitle>검증 타임라인</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {item.verificationHistory.map((event, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        event.status === 'success'
                          ? 'bg-green-500'
                          : event.status === 'error'
                          ? 'bg-red-500'
                          : event.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{event.action}</div>
                      <div className="text-sm text-muted-foreground">{event.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleString('ko-KR')}
                        {event.performedBy && ` - ${event.performedBy}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 관련 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>관련 거래 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">이전 입금</div>
                  <div className="text-2xl font-bold">{item.relatedInfo.previousDepositsFromAddress}건</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">총 거래량</div>
                  <div className="text-lg font-bold">
                    ₩{parseInt(item.relatedInfo.totalVolumeFromAddress).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">위반 이력</div>
                  <div className="text-2xl font-bold text-red-600">
                    {item.relatedInfo.previousComplianceIssues}건
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            {item.reviewStatus === 'pending' && (
              <>
                {item.complianceStatus === 'non_compliant' || item.requiresReturn ? (
                  <Button
                    variant="destructive"
                    onClick={() => onReturn(item.depositId, item.violationReason || 'exceeds_threshold_no_info')}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    환불 처리
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => onApprove(item.depositId)}
                    disabled={actionLoading}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    준수 승인
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
