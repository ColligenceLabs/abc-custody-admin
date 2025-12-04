'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import CryptoIcon from '@/components/ui/CryptoIcon';
import type { SupportedToken, UpdateTokenSettingsRequest } from '@/services/tokenService';

interface TokenSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: SupportedToken;
  onSave: (settings: UpdateTokenSettingsRequest) => Promise<void>;
}

// 권장 컨펌 수 범위 (문서의 RECOMMENDED_CONFIRMATIONS와 동일)
const RECOMMENDED_CONFIRMATIONS: Record<string, { min: number; max: number }> = {
  BTC: { min: 3, max: 10 },
  ETH: { min: 12, max: 30 },
  USDT: { min: 12, max: 30 },
  USDC: { min: 12, max: 30 },
  SOL: { min: 30, max: 50 },
};

// 권장 범위 조회
function getRecommendedRange(symbol: string): { min: number; max: number } | null {
  return RECOMMENDED_CONFIRMATIONS[symbol] || null;
}

// 권장 범위 내 여부 확인
function isInRecommendedRange(symbol: string, confirmations: number): boolean {
  const range = getRecommendedRange(symbol);
  if (!range) return true; // 권장 범위가 없으면 항상 true
  return confirmations >= range.min && confirmations <= range.max;
}

export default function TokenSettingsModal({
  isOpen,
  onClose,
  token,
  onSave,
}: TokenSettingsModalProps) {
  const [formData, setFormData] = useState<UpdateTokenSettingsRequest>({
    minWithdrawalAmount: parseFloat(token.minWithdrawalAmount),
    withdrawalFee: parseFloat(token.withdrawalFee),
    withdrawalFeeType: token.withdrawalFeeType,
    returnFeeType: token.returnFeeType,
    returnFeeValue: parseFloat(token.returnFeeValue),
    requiredConfirmations: token.requiredConfirmations,
    isActive: token.isActive,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        minWithdrawalAmount: parseFloat(token.minWithdrawalAmount),
        withdrawalFee: parseFloat(token.withdrawalFee),
        withdrawalFeeType: token.withdrawalFeeType,
        returnFeeType: token.returnFeeType,
        returnFeeValue: parseFloat(token.returnFeeValue),
        requiredConfirmations: token.requiredConfirmations,
        isActive: token.isActive,
      });
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* 헤더 - 고정 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <CryptoIcon symbol={token.symbol} size={32} />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {token.name} 설정
                </h2>
                <p className="text-sm text-gray-500">{token.symbol}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 본문 - 스크롤 영역 */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* 최소 출금 수량 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최소 출금 수량 ({token.symbol})
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={formData.minWithdrawalAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  // 숫자와 소수점만 허용 (입력 중 소수점 유지)
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setFormData({
                      ...formData,
                      minWithdrawalAmount: value as any,
                    });
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value === '' || value === '.') {
                    setFormData({
                      ...formData,
                      minWithdrawalAmount: 0,
                    });
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      setFormData({
                        ...formData,
                        minWithdrawalAmount: numValue,
                      });
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00000000"
              />
              <p className="mt-1 text-xs text-gray-500">
                사용자가 출금할 수 있는 최소 수량입니다.
              </p>
            </div>

            {/* 출금 수수료 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수수료 타입
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="fixed"
                    checked={formData.withdrawalFeeType === 'fixed'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        withdrawalFeeType: e.target.value as 'fixed' | 'percentage',
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">고정 수수료</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="percentage"
                    checked={formData.withdrawalFeeType === 'percentage'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        withdrawalFeeType: e.target.value as 'fixed' | 'percentage',
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">퍼센트 수수료</span>
                </label>
              </div>
            </div>

            {/* 출금 수수료 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출금 수수료{' '}
                {formData.withdrawalFeeType === 'fixed'
                  ? `(${token.symbol})`
                  : '(%)'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={formData.withdrawalFee}
                onChange={(e) => {
                  const value = e.target.value;
                  // 숫자와 소수점만 허용 (입력 중 소수점 유지)
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setFormData({
                      ...formData,
                      withdrawalFee: value as any,
                    });
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value === '' || value === '.') {
                    setFormData({
                      ...formData,
                      withdrawalFee: 0,
                    });
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      // 퍼센트 타입인 경우 최대값 80 제한
                      const maxValue = formData.withdrawalFeeType === 'percentage' ? 80 : Infinity;
                      setFormData({
                        ...formData,
                        withdrawalFee: Math.min(numValue, maxValue),
                      });
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={
                  formData.withdrawalFeeType === 'fixed' ? '0.00000000' : '0.00'
                }
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.withdrawalFeeType === 'fixed'
                  ? '출금 시 부과되는 고정 수수료입니다.'
                  : '출금 금액의 퍼센트로 부과되는 수수료입니다. (최대 80%)'}
              </p>
            </div>

            {/* 환불 수수료 설정 */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">환불 수수료 설정</h3>

              {/* 환불 수수료 타입 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  환불 수수료 타입
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="fixed"
                      checked={formData.returnFeeType === 'fixed'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          returnFeeType: e.target.value as 'fixed' | 'percent',
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">고정 수수료</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="percent"
                      checked={formData.returnFeeType === 'percent'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          returnFeeType: e.target.value as 'fixed' | 'percent',
                        })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">퍼센트 수수료</span>
                  </label>
                </div>
              </div>

              {/* 환불 수수료 값 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  환불 수수료{' '}
                  {formData.returnFeeType === 'fixed'
                    ? `(${token.symbol})`
                    : '(%)'}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={formData.returnFeeValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 숫자와 소수점만 허용 (입력 중 소수점 유지)
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setFormData({
                        ...formData,
                        returnFeeValue: value as any,
                      });
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value === '' || value === '.') {
                      setFormData({
                        ...formData,
                        returnFeeValue: 0,
                      });
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        // 퍼센트 타입인 경우 최대값 80 제한
                        const maxValue = formData.returnFeeType === 'percent' ? 80 : Infinity;
                        setFormData({
                          ...formData,
                          returnFeeValue: Math.min(numValue, maxValue),
                        });
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={
                    formData.returnFeeType === 'fixed' ? '0.00000000' : '0.00'
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.returnFeeType === 'fixed'
                    ? '미검증 입금 환불 시 부과되는 고정 수수료입니다.'
                    : '환불 금액의 퍼센트로 부과되는 수수료입니다. (최대 80%)'}
                </p>
              </div>
            </div>

            {/* 입금 컨펌 수 설정 */}
            <div className="pt-6 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  입금 필요 컨펌 수
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.requiredConfirmations ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiredConfirmations:
                        e.target.value === '' ? null : parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="미설정"
                />

                {/* 권장 범위 표시 */}
                {getRecommendedRange(token.symbol) && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      권장 범위: {getRecommendedRange(token.symbol)!.min}-{getRecommendedRange(token.symbol)!.max}
                    </p>
                    {formData.requiredConfirmations !== null && formData.requiredConfirmations !== undefined && !isInRecommendedRange(token.symbol, formData.requiredConfirmations) && (
                      <div className="mt-2 flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-xs text-yellow-800">
                          권장 범위를 벗어났습니다. 보안과 사용자 경험을 고려하여 권장 범위 내로 설정하는 것을 권장합니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  블록체인 네트워크에서 트랜잭션을 확정하기 위해 필요한 컨펌 수입니다.
                </p>
              </div>
            </div>

            {/* 활성화 상태 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">토큰 활성화 상태</div>
                <p className="text-sm text-gray-500 mt-1">
                  비활성화하면 사용자가 이 토큰으로 출금할 수 없습니다.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${formData.isActive ? 'text-sky-600' : 'text-gray-500'}`}>
                  {formData.isActive ? '활성' : '비활성'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-sky-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 하단 버튼 - 고정 */}
          <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-sky-600 border-2 border-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 hover:border-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </form>
      </Card>
    </div>,
    document.body
  );
}
