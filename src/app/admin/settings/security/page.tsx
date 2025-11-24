'use client';

import { useState, useEffect } from 'react';
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, ChevronLeft, Save, RotateCcw, Info, History } from 'lucide-react';
import CryptoIcon from '@/components/ui/CryptoIcon';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`;

interface BlockchainConfig {
  id: string;
  blockchain: string;
  network: string;
  requiredConfirmations: number;
  recommendedMin: number;
  recommendedMax: number;
  description: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface HistoryRecord {
  id: string;
  setting_type: string;
  setting_id: string;
  blockchain: string;
  field_name: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: string;
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  createdAt: string;
}

// 권장 범위 설정 (프론트엔드 전용)
const RECOMMENDED_RANGES: Record<string, { min: number; max: number }> = {
  BTC: { min: 3, max: 10 },
  ETH: { min: 12, max: 30 },
  USDT: { min: 12, max: 30 },
  USDC: { min: 12, max: 30 },
  SOL: { min: 30, max: 50 },
};

export default function SecuritySettingsPage() {
  const { toast } = useToast();

  const [configs, setConfigs] = useState<BlockchainConfig[]>([]);
  const [originalConfigs, setOriginalConfigs] = useState<BlockchainConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  // 히스토리 관련 상태
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>('');
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // API에서 데이터 로드
  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/settings/confirmations`);
      const data = await response.json();

      if (data.success) {
        const configsWithRecommendations = data.data.map((config: any) => ({
          ...config,
          recommendedMin: RECOMMENDED_RANGES[config.blockchain]?.min || 1,
          recommendedMax: RECOMMENDED_RANGES[config.blockchain]?.max || 100,
        }));
        setConfigs(configsWithRecommendations);
        setOriginalConfigs(configsWithRecommendations);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      toast({
        variant: 'destructive',
        description: '데이터를 불러오는데 실패했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  // 히스토리 조회
  const fetchHistory = async (blockchain: string) => {
    try {
      setHistoryLoading(true);
      const response = await fetch(`${API_BASE_URL}/security-settings-history/blockchain/${blockchain}`);
      const data = await response.json();

      if (data.success) {
        setHistoryRecords(data.data);
      }
    } catch (error) {
      console.error('히스토리 조회 실패:', error);
      toast({
        variant: 'destructive',
        description: '히스토리를 불러오는데 실패했습니다.',
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  // 히스토리 보기
  const handleViewHistory = async (blockchain: string) => {
    setSelectedBlockchain(blockchain);
    setHistoryDialogOpen(true);
    await fetchHistory(blockchain);
  };

  const handleEdit = (config: BlockchainConfig) => {
    setEditingId(config.id);
    setEditValue(config.requiredConfirmations.toString());
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = (id: string) => {
    const value = parseInt(editValue);

    if (isNaN(value) || value < 1 || value > 100) {
      toast({
        variant: 'destructive',
        description: '컨펌 수는 1-100 사이의 숫자여야 합니다.',
      });
      return;
    }

    const config = configs.find((c) => c.id === id);
    let warningMessage = '';

    if (config && (value < config.recommendedMin || value > config.recommendedMax)) {
      warningMessage = `권장 범위(${config.recommendedMin}-${config.recommendedMax})를 벗어났습니다. `;
    }

    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, requiredConfirmations: value } : c))
    );

    setEditingId(null);
    setEditValue('');
    setHasChanges(true);

    toast({
      title: warningMessage ? '경고' : undefined,
      description: warningMessage + '컨펌 수가 임시 업데이트되었습니다. "모두 저장" 버튼을 눌러 저장하세요.',
    });
  };

  const handleSaveAll = async () => {
    try {
      // 변경된 항목만 추출
      const updates = configs
        .filter((config) => {
          const original = originalConfigs.find((o) => o.id === config.id);
          return original && original.requiredConfirmations !== config.requiredConfirmations;
        })
        .map((config) => ({
          blockchain: config.blockchain,
          requiredConfirmations: config.requiredConfirmations,
        }));

      if (updates.length === 0) {
        toast({
          description: '변경된 항목이 없습니다.',
        });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/settings/confirmations/batch/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates,
          updatedBy: 'admin',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOriginalConfigs(configs);
        setHasChanges(false);
        toast({
          description: `${updates.length}개의 블록체인 컨펌 수가 저장되었습니다.`,
        });
      } else {
        throw new Error(data.message || '저장 실패');
      }
    } catch (error) {
      console.error('저장 실패:', error);
      toast({
        variant: 'destructive',
        description: '변경사항 저장에 실패했습니다.',
      });
    }
  };

  const handleReset = () => {
    setConfigs(originalConfigs);
    setHasChanges(false);
    toast({
      description: '변경사항이 취소되었습니다.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="space-y-2">
        <Link
          href="/admin/settings"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          설정으로 돌아가기
        </Link>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">보안 설정</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              블록체인 보안 정책 및 컨펌 수 관리
            </p>
          </div>
        </div>
      </div>

      {/* 블록체인 컨펌 수 관리 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>블록체인 컨펌 수 관리</CardTitle>
          <CardDescription>
            입금 확정에 필요한 블록 확인 수를 블록체인별로 설정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapphire-600 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        블록체인
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        네트워크
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        현재 컨펌 수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        권장 범위
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {configs.map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <CryptoIcon symbol={config.blockchain} size={32} />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {config.blockchain}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {config.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {config.network}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === config.id ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24"
                          min={1}
                          max={100}
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-lg font-semibold ${
                              config.requiredConfirmations < config.recommendedMin ||
                              config.requiredConfirmations > config.recommendedMax
                                ? 'text-orange-600 dark:text-orange-400'
                                : hasChanges
                                ? 'text-sapphire-600 dark:text-sapphire-400'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {config.requiredConfirmations}
                          </span>
                          {(config.requiredConfirmations < config.recommendedMin ||
                            config.requiredConfirmations > config.recommendedMax) && (
                            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                              범위 초과
                            </Badge>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {config.recommendedMin}-{config.recommendedMax}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === config.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(config.id)}
                            className="h-8"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            저장
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="h-8"
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewHistory(config.blockchain)}
                            className="h-8"
                            title="변경 이력 보기"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(config)}
                            className="h-8"
                          >
                            수정
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 하단 버튼 */}
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  변경사항 취소
                </Button>

                {hasChanges && (
                  <Button onClick={handleSaveAll} className="bg-sapphire-600 hover:bg-sapphire-700">
                    <Save className="h-4 w-4 mr-2" />
                    모두 저장
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 정보 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">컨펌 수란?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            블록체인 컨펌 수는 트랜잭션이 블록체인에 기록된 후 추가로 생성되는 블록의 수를 의미합니다.
            컨펌 수가 많을수록 트랜잭션의 보안성이 높아지지만, 입금 완료까지 시간이 더 걸립니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                낮은 컨펌 수
              </div>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>- 빠른 입금 처리</li>
                <li>- 낮은 보안성</li>
                <li>- 소액 거래에 적합</li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="font-semibold text-red-900 dark:text-red-100 mb-2">
                높은 컨펌 수
              </div>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>- 느린 입금 처리</li>
                <li>- 높은 보안성</li>
                <li>- 고액 거래에 적합</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 히스토리 모달 */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>컨펌 수 변경 이력 - {selectedBlockchain}</DialogTitle>
            <DialogDescription>
              {selectedBlockchain} 블록체인의 컨펌 수 변경 이력입니다.
            </DialogDescription>
          </DialogHeader>

          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sapphire-600 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  히스토리를 불러오는 중...
                </p>
              </div>
            </div>
          ) : historyRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                변경 이력이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyRecords.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {record.changed_by}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(record.changed_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-sm">
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {record.old_value}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">→</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {record.new_value}
                    </span>
                  </div>

                  {record.ip_address && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      IP: {record.ip_address}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
