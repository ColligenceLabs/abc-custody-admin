"use client";

import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { NetworkGroup, getNetworkGroup, isPrimaryAsset } from '@/types/networkGroup';
import CryptoIcon from '@/components/ui/CryptoIcon';
import { PlusIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getSupportedTokens, SupportedToken } from '@/utils/supportedTokenApi';

interface AssetManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  network: NetworkGroup;
  onAddAsset: (coin: string, contractAddress?: string) => Promise<void>;
}

export default function AssetManagementModal({
  isOpen,
  onClose,
  network,
  onAddAsset,
}: AssetManagementModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [supportedTokens, setSupportedTokens] = useState<SupportedToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // DB에서 지원 토큰 목록 조회
  useEffect(() => {
    if (!isOpen) return;

    const loadSupportedTokens = async () => {
      try {
        setIsLoading(true);
        const tokens = await getSupportedTokens({
          network: network.network,
          isActive: true,
        });
        console.log('[AssetManagementModal] 지원 토큰 로드:', tokens);
        setSupportedTokens(tokens);
      } catch (error) {
        console.error('[AssetManagementModal] 토큰 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSupportedTokens();
  }, [isOpen, network.network]);

  // 현재 활성화된 자산 심볼 목록
  const activeCoins = network.assets.map((a) => a.coin);

  // 추가 가능한 토큰 (현재 활성화되지 않은 토큰)
  const availableToAdd = supportedTokens.filter(
    (token) => !activeCoins.includes(token.symbol)
  );

  const handleAddAsset = async (coin: string, contractAddress?: string) => {
    setIsAdding(true);
    try {
      await onAddAsset(coin, contractAddress);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {network.networkName} 자산 관리
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-6">
        {/* 안내 메시지 */}
        <div className="flex items-start space-x-3 p-4 bg-sky-50 border border-sky-200 rounded-lg">
          <InformationCircleIcon className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-sky-800">
            <p className="font-semibold mb-1">주소 재사용 안내</p>
            <p>
              {network.networkName} 네트워크의 모든 토큰은 같은 주소({' '}
              <code className="font-mono text-xs bg-white px-1 rounded">
                {network.address.slice(0, 10)}...{network.address.slice(-6)}
              </code>
              )를 공유합니다.
            </p>
          </div>
        </div>

        {/* 현재 활성화된 자산 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">활성화된 자산</h3>
          <div className="space-y-2">
            {network.assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CryptoIcon symbol={asset.coin} size={24} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{asset.coin}</p>
                    <p className="text-xs text-gray-500">{asset.label}</p>
                  </div>
                </div>
                {asset.isPrimary && (
                  <span className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full">
                    기본 자산
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 추가 가능한 자산 */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">토큰 목록 로딩 중...</p>
          </div>
        ) : availableToAdd.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">추가 가능한 자산</h3>
            <div className="space-y-2">
              {availableToAdd.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <CryptoIcon symbol={token.symbol} size={24} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{token.symbol}</p>
                      <p className="text-xs text-gray-500">{token.name}</p>
                      {!token.isDefault && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded-full">
                          커스텀
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddAsset(token.symbol, token.contractAddress)}
                    disabled={isAdding}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 inline mr-1" />
                    추가
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-gray-500">
            추가 가능한 자산이 없습니다.
          </div>
        )}

        {/* 닫기 버튼 */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
        </div>
        </div>
      </div>
    </Modal>
  );
}
