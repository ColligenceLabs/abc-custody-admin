import { useState, useEffect } from "react";
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { CollateralAddition, CollateralImpact, HealthFactorLevel } from "./types";

interface BankLoan {
  id: string;
  product: {
    productName: string;
    bankName: string;
    additionalCollateralAllowed: boolean;
    collateralAsset: string;
  };
  collateralAsset: {
    asset: string;
    amount: number;
    value: number;
  };
  loanAmount: number;
  interestRate: number;
  healthFactor: number;
  liquidationThreshold: number;
  accruedInterest: number;
  status: string;
}

interface CollateralAsset {
  asset: string;
  amount: number;
  currentPrice: number;
  value: number;
  volatility: number;
  supportedLTV: number;
}

interface AddCollateralModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: BankLoan | null;
  availableAssets: CollateralAsset[];
  onSubmit: (addition: CollateralAddition) => void;
}

interface AssetInput {
  asset: string;
  amount: number;
  maxAmount: number;
  currentPrice: number;
  value: number;
}

export function AddCollateralModal({
  isOpen,
  onClose,
  loan,
  availableAssets,
  onSubmit
}: AddCollateralModalProps) {
  const [assetInputs, setAssetInputs] = useState<AssetInput[]>([]);
  const [note, setNote] = useState("");
  const [impact, setImpact] = useState<CollateralImpact | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // 헬스팩터 레벨 계산
  const getHealthFactorLevel = (healthFactor: number): HealthFactorLevel => {
    if (healthFactor >= 2.0) {
      return {
        level: "safe",
        label: "안전",
        color: "text-sky-600",
        bgColor: "bg-sky-50"
      };
    } else if (healthFactor >= 1.5) {
      return {
        level: "moderate",
        label: "보통",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      };
    } else if (healthFactor >= 1.2) {
      return {
        level: "warning",
        label: "주의",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      };
    } else {
      return {
        level: "danger",
        label: "위험",
        color: "text-red-600",
        bgColor: "bg-red-50"
      };
    }
  };

  // 담보 추가 영향 계산
  const calculateImpact = (): CollateralImpact | null => {
    if (!loan) return null;

    const currentCollateralValue = loan.collateralAsset.value;
    const addedValue = assetInputs.reduce((total, asset) => total + asset.value, 0);
    const totalCollateralValue = currentCollateralValue + addedValue;

    const currentLTV = (loan.loanAmount / currentCollateralValue) * 100;
    const newLTV = totalCollateralValue > 0 ? (loan.loanAmount / totalCollateralValue) * 100 : 0;

    const currentHealthFactor = loan.healthFactor;
    const newHealthFactor = totalCollateralValue > 0 ?
      (totalCollateralValue * loan.liquidationThreshold) / loan.loanAmount : 0;

    return {
      currentHealthFactor,
      newHealthFactor,
      currentLTV,
      newLTV,
      addedCollateralValue: addedValue,
      totalCollateralValue
    };
  };

  // 대출 상품의 담보 자산 유형과 일치하는 자산만 필터링
  const getCompatibleAssets = () => {
    if (!loan) return [];

    // 대출 상품의 지원 담보 자산 유형 확인
    const productCollateralAssets = loan.product.collateralAsset.split(', ');

    return availableAssets.filter(asset =>
      asset.amount > 0 &&
      productCollateralAssets.includes(asset.asset)
    );
  };

  // 입력값 변경 시 영향 재계산
  useEffect(() => {
    setImpact(calculateImpact());
  }, [assetInputs, loan]);

  // 추가 가능한 자산 목록이 변경되면 입력 배열 초기화
  useEffect(() => {
    if (!loan) return;

    const compatibleAssets = getCompatibleAssets();
    setAssetInputs(
      compatibleAssets.map(asset => ({
        asset: asset.asset,
        amount: 0,
        maxAmount: asset.amount,
        currentPrice: asset.currentPrice,
        value: 0
      }))
    );
  }, [loan, availableAssets]);

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 자산 수량 변경
  const updateAssetAmount = (asset: string, amount: number) => {
    setAssetInputs(prev => prev.map(a =>
      a.asset === asset ? {
        ...a,
        amount,
        value: amount * a.currentPrice
      } : a
    ));
  };

  // 입력 금액 포맷팅
  const formatAssetAmount = (value: string): string => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loan || assetInputs.length === 0) return;

    const addition: CollateralAddition = {
      loanId: loan.id,
      assets: assetInputs
        .filter(asset => asset.amount > 0)
        .map(asset => ({
          asset: asset.asset,
          amount: asset.amount
        })),
      note: note.trim() || undefined
    };

    onSubmit(addition);
    onClose();
  };

  const handleConfirm = () => {
    setIsConfirming(true);
  };

  const handleBack = () => {
    setIsConfirming(false);
  };

  if (!isOpen || !loan) return null;

  // 담보 추가가 허용되지 않는 상품인 경우
  if (!loan.product.additionalCollateralAllowed) {
    return (
      <Modal isOpen={true} onClose={onClose}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">담보 추가 불가</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              해당 대출 상품은 담보 추가가 허용되지 않습니다.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const validAssets = getCompatibleAssets();
  const hasValidSelections = assetInputs.some(asset => asset.amount > 0);

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {!isConfirming ? (
          <>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">담보 추가</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* 현재 대출 상태 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">현재 대출 상태</h4>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">대출 잔액</span>
                  <p className="font-semibold text-gray-900">{formatCurrency(loan.loanAmount)}</p>
                </div>
                <div>
                  <span className="text-gray-600">현재 담보 가치</span>
                  <p className="font-semibold text-gray-900">{formatCurrency(loan.collateralAsset.value)}</p>
                </div>
                <div>
                  <span className="text-gray-600">현재 LTV</span>
                  <p className="font-semibold text-gray-900">
                    {((loan.loanAmount / loan.collateralAsset.value) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">헬스팩터</span>
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthFactorLevel(loan.healthFactor).color} ${getHealthFactorLevel(loan.healthFactor).bgColor}`}>
                      {loan.healthFactor.toFixed(2)} - {getHealthFactorLevel(loan.healthFactor).label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 추가 가능한 담보 자산 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추가할 담보 자산
                </label>
                <p className="text-xs text-gray-600 mb-4">
                  {loan?.product.collateralAsset} 자산만 이 대출의 담보로 추가할 수 있습니다.
                </p>

                {validAssets.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">
                      추가 가능한 담보 자산이 없습니다.
                    </div>
                    <div className="text-xs text-gray-400">
                      {loan?.product.collateralAsset} 자산을 보유하고 있지 않거나 이미 모두 담보로 사용 중입니다.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {validAssets.map((asset) => {
                      const assetInput = assetInputs.find(a => a.asset === asset.asset);

                      return (
                        <div
                          key={asset.asset}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <CryptoIcon symbol={asset.asset} size={32} className="mr-3" />
                              <div>
                                <div className="font-semibold text-gray-900">{asset.asset}</div>
                                <div className="text-sm text-gray-600">
                                  보유량: {asset.amount} {asset.asset}
                                </div>
                                <div className="text-sm text-gray-600">
                                  현재 가격: {formatCurrency(asset.currentPrice)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(asset.value)}
                              </div>
                              <div className="text-sm text-gray-600">
                                총 가치
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              추가할 수량
                            </label>
                            <div className="flex items-center space-x-3">
                              <input
                                type="text"
                                value={assetInput?.amount || ''}
                                onChange={(e) => {
                                  const value = formatAssetAmount(e.target.value);
                                  const numValue = parseFloat(value) || 0;
                                  if (numValue <= asset.amount) {
                                    updateAssetAmount(asset.asset, numValue);
                                  }
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="0"
                              />
                              <span className="text-gray-500 min-w-[60px]">{asset.asset}</span>
                              <button
                                type="button"
                                onClick={() => updateAssetAmount(asset.asset, asset.amount)}
                                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                최대
                              </button>
                            </div>
                            {assetInput && assetInput.amount > 0 && (
                              <p className="text-sm text-sky-600 mt-2">
                                추가 담보 가치: {formatCurrency(assetInput.value)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 담보 추가 후 예상 효과 */}
              {impact && hasValidSelections && (
                <div className="bg-sky-50 rounded-lg p-4">
                  <h4 className="font-medium text-sky-900 mb-4">담보 추가 후 예상 효과</h4>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Before/After 비교 */}
                    <div>
                      <h5 className="text-sm font-medium text-sky-800 mb-3">헬스팩터 변화</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-sky-700">변경 전</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthFactorLevel(impact.currentHealthFactor).color} ${getHealthFactorLevel(impact.currentHealthFactor).bgColor}`}>
                            {impact.currentHealthFactor.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-sky-700">변경 후</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthFactorLevel(impact.newHealthFactor).color} ${getHealthFactorLevel(impact.newHealthFactor).bgColor}`}>
                            {impact.newHealthFactor.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-sky-800">개선 정도</span>
                          <span className="flex items-center text-sky-600">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            +{(impact.newHealthFactor - impact.currentHealthFactor).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* LTV 변화 */}
                    <div>
                      <h5 className="text-sm font-medium text-sky-800 mb-3">LTV 변화</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-sky-700">변경 전</span>
                          <span className="font-medium">{impact.currentLTV.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-sky-700">변경 후</span>
                          <span className="font-medium">{impact.newLTV.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-sky-800">감소 정도</span>
                          <span className="text-sky-600">
                            -{(impact.currentLTV - impact.newLTV).toFixed(1)}%p
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 담보 가치 정보 */}
                  <div className="mt-4 pt-4 border-t border-sky-200">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-sky-700">추가 담보 가치</span>
                        <p className="font-semibold text-sky-900">{formatCurrency(impact.addedCollateralValue)}</p>
                      </div>
                      <div>
                        <span className="text-sky-700">총 담보 가치</span>
                        <p className="font-semibold text-sky-900">{formatCurrency(impact.totalCollateralValue)}</p>
                      </div>
                      <div>
                        <span className="text-sky-700">안전 여유도</span>
                        <p className="font-semibold text-sky-900">
                          {formatCurrency(impact.totalCollateralValue * loan.liquidationThreshold - loan.loanAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 메모 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 (선택사항)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="담보 추가 사유나 메모를 입력하세요"
                />
              </div>

              {/* 액션 버튼 */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!hasValidSelections}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  담보 추가
                </button>
              </div>
            </form>
          </>
        ) : (
          // 확인 단계
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">담보 추가 확인</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 추가할 담보 내역 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">추가할 담보 내역</h4>
                <div className="space-y-3">
                  {assetInputs.filter(asset => asset.amount > 0).map((asset) => (
                    <div key={asset.asset} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CryptoIcon symbol={asset.asset} size={24} className="mr-3" />
                        <div>
                          <span className="font-medium">{asset.amount} {asset.asset}</span>
                          <div className="text-sm text-gray-600">
                            {formatCurrency(asset.currentPrice)} × {asset.amount}
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold">{formatCurrency(asset.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between font-semibold">
                    <span>총 추가 담보 가치</span>
                    <span>{formatCurrency(impact?.addedCollateralValue || 0)}</span>
                  </div>
                </div>
              </div>

              {/* 예상 효과 요약 */}
              {impact && (
                <div className="bg-sky-50 rounded-lg p-4">
                  <h4 className="font-medium text-sky-900 mb-4">예상 효과</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-sky-700">헬스팩터</span>
                      <p className="font-semibold text-sky-900">
                        {impact.currentHealthFactor.toFixed(2)} → {impact.newHealthFactor.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sky-700">LTV</span>
                      <p className="font-semibold text-sky-900">
                        {impact.currentLTV.toFixed(1)}% → {impact.newLTV.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">담보 추가 전 확인사항</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• 담보 추가 후에는 취소가 불가능합니다.</li>
                      <li>• 추가된 담보는 대출 상환 시까지 출금이 제한됩니다.</li>
                      <li>• 담보 자산의 수량과 가치를 다시 한번 확인해주세요.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  이전으로
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  담보 추가 확정
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}