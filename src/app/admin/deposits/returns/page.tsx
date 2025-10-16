/**
 * 환불 처리 페이지 (Task 3.5)
 *
 * 검증 실패로 환불이 필요한 입금을 관리하는 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ReturnStats, ReturnStatsData } from './components/ReturnStats';
import { ReturnFilters, ReturnFilterState } from './components/ReturnFilters';
import { ReturnQueueTable } from './components/ReturnQueueTable';
import { ReturnTransaction } from '@/types/deposit';
import {
  getReturns,
  getReturnStats,
  generateMockReturns,
  initializeMockReturns,
} from '@/services/depositApi';

export default function ReturnsPage() {
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState<ReturnTransaction[]>([]);
  const [stats, setStats] = useState<ReturnStatsData>({
    pending: { count: 0, volumeKRW: '0' },
    processing: { count: 0, volumeKRW: '0' },
    completed: { count: 0, volumeKRW: '0' },
    failed: { count: 0, volumeKRW: '0' },
  });
  const [filters, setFilters] = useState<ReturnFilterState>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock 데이터 생성 핸들러
  const handleGenerateMockData = () => {
    if (confirm('새로운 Mock 환불 데이터를 생성하시겠습니까?\n\n기존 데이터는 유지되고, 20개의 환불 데이터가 추가됩니다.')) {
      const newReturns = generateMockReturns(20);
      const existingReturns = returns;
      const allReturns = [...existingReturns, ...newReturns];

      // localStorage에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('deposit_returns', JSON.stringify(allReturns));
      }

      // 데이터 새로고침
      loadData();
      alert(`✅ ${newReturns.length}개의 환불 데이터가 생성되었습니다!`);
    }
  };

  // 데이터 초기화 핸들러
  const handleResetData = () => {
    if (confirm('⚠️ 모든 환불 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('deposit_returns');
      }
      setReturns([]);
      setStats({
        pending: { count: 0, volumeKRW: '0' },
        processing: { count: 0, volumeKRW: '0' },
        completed: { count: 0, volumeKRW: '0' },
        failed: { count: 0, volumeKRW: '0' },
      });
      alert('✅ 모든 환불 데이터가 삭제되었습니다.');
    }
  };

  // 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);

      const [returnsData, statsData] = await Promise.all([
        getReturns(),
        getReturnStats(),
      ]);

      setReturns(returnsData);
      setStats(statsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load return data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 초기 Mock 데이터 로드
    initializeMockReturns();
    loadData();

    // 자동 새로고침 (30초마다)
    const intervalId = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // 필터링된 환불 목록
  const filteredReturns = returns.filter((returnTx) => {
    // 상태 필터
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(returnTx.status as any)) {
        return false;
      }
    }

    // 환불 사유 필터
    if (filters.reason && filters.reason.length > 0) {
      if (!filters.reason.includes(returnTx.reason)) {
        return false;
      }
    }

    // 검색 쿼리
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTxHash = returnTx.originalTxHash.toLowerCase().includes(query);
      const matchesReturnTxHash = returnTx.returnTxHash?.toLowerCase().includes(query);
      const matchesAddress = returnTx.returnAddress.toLowerCase().includes(query);

      if (!matchesTxHash && !matchesReturnTxHash && !matchesAddress) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">환불 처리</h1>
          <p className="text-muted-foreground mt-2">
            검증 실패로 환불이 필요한 입금을 추적하고 관리합니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateMockData}
            disabled={loading}
          >
            Mock 데이터 생성
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            disabled={loading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
          >
            데이터 초기화
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <ReturnStats stats={stats} />

      {/* 환불 대기열 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>환불 대기열</CardTitle>
          <CardDescription>
            총 {filteredReturns.length}개의 환불 건 (전체 {returns.length}건 중)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 필터 */}
          <ReturnFilters filters={filters} onFilterChange={setFilters} />

          {/* 테이블 */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ReturnQueueTable returns={filteredReturns} />
          )}
        </CardContent>
      </Card>

      {/* 안내 메시지 */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-400">
            환불 처리 프로세스
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <p>
            • <strong>미등록 주소</strong>: 회원사에 등록되지 않은 주소에서 입금된 경우 자동 환불
          </p>
          <p>
            • <strong>권한 없음</strong>: 입금 권한이 없는 주소에서 입금된 경우 자동 환불
          </p>
          <p>
            • <strong>한도 초과</strong>: 개인 지갑 일일 한도(100만원)를 초과한 경우 자동 환불
          </p>
          <p>
            • <strong>Travel Rule 위반</strong>: 100만원 초과 + Personal 주소 또는 VASP 정보 불완전 시 자동 환불
          </p>
          <p>
            • <strong>AML 플래그/제재 목록</strong>: 높은 리스크 점수 또는 제재 목록 일치 시 수동 검토 후 환불
          </p>
          <p className="pt-2 border-t border-blue-200 dark:border-blue-800 font-semibold">
            환불 시 네트워크 수수료를 제외한 금액이 원래 송신 주소로 반환됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
