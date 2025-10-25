"use client";

import { useState, useMemo } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { NetworkGroup } from '@/types/networkGroup';
import { NetworkOption, WizardStep } from '@/types/assetAddition';
import { groupAssetsByNetwork } from '@/utils/networkHelpers';
import CryptoIcon from '@/components/ui/CryptoIcon';

interface AddAssetWizardProps {
  isOpen: boolean;
  onClose: () => void;
  existingNetworks: NetworkGroup[];
  onAddAssets: (networkGroup: string, assets: string[], customToken?: { symbol: string; name: string; contractAddress: string; logoUrl?: string }) => Promise<void>;
}

export default function AddAssetWizard({
  isOpen,
  onClose,
  existingNetworks,
  onAddAssets,
}: AddAssetWizardProps) {
  const [step, setStep] = useState<WizardStep>('network-select');
  const [selectedNetworkGroup, setSelectedNetworkGroup] = useState<string | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomToken, setShowCustomToken] = useState(false);
  const [customToken, setCustomToken] = useState({
    symbol: '',
    name: '',
    contractAddress: '',
    logoUrl: '',
  });
  const [logoPreview, setLogoPreview] = useState<string>('');

  // 네트워크 옵션 계산
  const networkOptions = useMemo(
    () => groupAssetsByNetwork(existingNetworks),
    [existingNetworks]
  );

  // 선택된 네트워크 옵션
  const selectedNetwork = useMemo(
    () => networkOptions.find((n) => n.networkGroup === selectedNetworkGroup),
    [networkOptions, selectedNetworkGroup]
  );

  // 네트워크 선택 핸들러
  const handleNetworkSelect = (networkGroup: string) => {
    setSelectedNetworkGroup(networkGroup);
    setSelectedAssets([]);
    setStep('asset-select');
  };

  // 자산 토글 핸들러
  const handleAssetToggle = (symbol: string) => {
    setSelectedAssets((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  // 로고 파일 핸들러
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (2MB 제한)
    if (file.size > 2 * 1024 * 1024) {
      alert('파일 크기는 2MB 이하로 제한됩니다.');
      return;
    }

    // 이미지 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일을 base64로 변환
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCustomToken({ ...customToken, logoUrl: base64String });
      setLogoPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // 로고 제거 핸들러
  const handleLogoRemove = () => {
    setCustomToken({ ...customToken, logoUrl: '' });
    setLogoPreview('');
  };

  // 완료 핸들러
  const handleComplete = async () => {
    console.log('[AddAssetWizard] handleComplete 호출됨');
    console.log('[AddAssetWizard] 상태:', {
      selectedNetworkGroup,
      selectedAssets,
      showCustomToken,
      customToken,
      isActive: selectedNetwork?.isActive,
    });

    if (!selectedNetworkGroup) {
      console.log('[AddAssetWizard] selectedNetworkGroup 없음, 종료');
      return;
    }

    // 일반 자산만 선택된 경우 검증
    if (!showCustomToken && selectedAssets.length === 0 && selectedNetwork?.isActive) {
      console.log('[AddAssetWizard] 검증 실패 - 활성 네트워크인데 선택된 자산 없음, 종료');
      return;
    }

    setIsSubmitting(true);
    try {
      // Custom 토큰 정보가 있으면 함께 전달
      const customTokenData = showCustomToken && customToken.symbol && customToken.contractAddress
        ? customToken
        : undefined;

      // 새 네트워크인 경우 primary asset을 자동으로 포함
      let assetsToAdd = [...selectedAssets];
      if (!selectedNetwork?.isActive && selectedNetwork?.primaryAsset) {
        assetsToAdd = [selectedNetwork.primaryAsset.symbol, ...selectedAssets];
        console.log('[AddAssetWizard] 새 네트워크, primary asset 추가:', selectedNetwork.primaryAsset.symbol);
      }

      console.log('[AddAssetWizard] onAddAssets 호출 시작:', {
        networkGroup: selectedNetworkGroup,
        assets: assetsToAdd,
        customTokenData,
      });

      await onAddAssets(selectedNetworkGroup, assetsToAdd, customTokenData);
      console.log('[AddAssetWizard] onAddAssets 완료, 모달 닫기');
      handleClose();
    } catch (error) {
      console.error('[AddAssetWizard] 자산 추가 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 닫기 핸들러
  const handleClose = () => {
    setStep('network-select');
    setSelectedNetworkGroup(null);
    setSelectedAssets([]);
    setShowCustomToken(false);
    setCustomToken({ symbol: '', name: '', contractAddress: '', logoUrl: '' });
    setLogoPreview('');
    onClose();
  };

  // 뒤로 가기 핸들러
  const handleBack = () => {
    if (step === 'asset-select') {
      setStep('network-select');
      setSelectedAssets([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 정보 */}
      {step === 'asset-select' && selectedNetwork && (
        <div className="pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {selectedNetwork.networkName} 네트워크
          </p>
        </div>
      )}

        {/* 진행 단계 표시 */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className={`flex items-center ${step === 'network-select' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'network-select' ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">네트워크 선택</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center ${step === 'asset-select' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'asset-select' ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">자산 선택</span>
            </div>
          </div>
        </div>

        {/* 네트워크 선택 단계 */}
        {step === 'network-select' && (
          <div className="space-y-3">
            {networkOptions.map((network) => (
              <button
                key={network.networkGroup}
                onClick={() => handleNetworkSelect(network.networkGroup)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CryptoIcon symbol={network.primaryAsset.symbol} size={32} />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {network.networkName}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {network.isActive
                          ? `활성화됨 - ${network.supportedTokens.length}개 토큰 지원`
                          : '새 네트워크 추가'}
                      </p>
                    </div>
                  </div>
                  {network.isActive && (
                    <span className="px-2 py-1 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded-full">
                      활성
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 자산 선택 단계 */}
        {step === 'asset-select' && selectedNetwork && (
          <div className="space-y-6">
            {/* 기본 자산 */}
            {!selectedNetwork.isActive && (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  기본 자산 (필수)
                </h4>
                <div className="flex items-center space-x-3 p-3 bg-white border border-sky-300 rounded-lg">
                  <CryptoIcon symbol={selectedNetwork.primaryAsset.symbol} size={24} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedNetwork.primaryAsset.symbol}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedNetwork.primaryAsset.name}
                    </p>
                  </div>
                  <div className="text-xs text-sky-600 font-medium">
                    자동 추가됨
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  새 주소가 생성됩니다
                </div>
              </div>
            )}

            {/* 토큰 목록 */}
            {selectedNetwork.supportedTokens.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  {selectedNetwork.isActive ? '추가할 토큰 선택' : '함께 추가할 토큰 (선택사항)'}
                </h4>
                <div className="space-y-2">
                  {selectedNetwork.supportedTokens.map((token) => (
                    <label
                      key={token.symbol}
                      className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        token.isAdded
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          : selectedAssets.includes(token.symbol)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(token.symbol)}
                        onChange={() => !token.isAdded && handleAssetToggle(token.symbol)}
                        disabled={token.isAdded}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <CryptoIcon symbol={token.symbol} size={24} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {token.symbol}
                        </p>
                        <p className="text-xs text-gray-600">{token.name}</p>
                      </div>
                      {token.isAdded && (
                        <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                          추가됨
                        </span>
                      )}
                    </label>
                  ))}

                  {/* Custom ERC-20 토큰 추가 버튼 (Ethereum만) */}
                  {selectedNetworkGroup === 'ethereum' && (
                    <button
                      type="button"
                      onClick={() => setShowCustomToken(!showCustomToken)}
                      className={`w-full flex items-center space-x-3 p-3 border-2 rounded-lg transition-all cursor-pointer ${
                        showCustomToken
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* checkbox와 동일한 너비 확보 */}
                      <div className="w-4 h-4 flex-shrink-0"></div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          Custom ERC-20
                        </p>
                        <p className="text-xs text-gray-600">컨트랙트 주소로 추가</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Custom ERC-20 입력 폼 */}
            {showCustomToken && selectedNetworkGroup === 'ethereum' && (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Custom ERC-20 토큰 정보
                </h4>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    토큰 심볼
                  </label>
                  <input
                    type="text"
                    value={customToken.symbol}
                    onChange={(e) => setCustomToken({ ...customToken, symbol: e.target.value })}
                    placeholder="예: LINK"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    토큰 이름
                  </label>
                  <input
                    type="text"
                    value={customToken.name}
                    onChange={(e) => setCustomToken({ ...customToken, name: e.target.value })}
                    placeholder="예: Chainlink"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    컨트랙트 주소
                  </label>
                  <input
                    type="text"
                    value={customToken.contractAddress}
                    onChange={(e) => setCustomToken({ ...customToken, contractAddress: e.target.value })}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    토큰 로고 (선택사항)
                  </label>
                  {logoPreview ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleLogoRemove}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                      >
                        제거
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                      >
                        <div className="text-center">
                          <svg
                            className="mx-auto h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mt-1 text-xs text-gray-600">
                            클릭하여 이미지 업로드
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG (최대 2MB)
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  기존 ETH 주소를 사용하여 Custom ERC-20 토큰을 받을 수 있습니다.
                </p>
              </div>
            )}

            {/* 주소 재사용 안내 */}
            {selectedNetwork.isActive && selectedNetwork.supportedTokens.length > 0 && (
              <div className="flex items-start space-x-3 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <InformationCircleIcon className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-sky-800">
                  <p className="font-semibold mb-1">주소 재사용 안내</p>
                  <p>
                    선택한 토큰은 기존 {selectedNetwork.primaryAsset.symbol} 주소(
                    <code className="font-mono text-xs bg-white px-1 rounded">
                      {selectedNetwork.existingAddress?.slice(0, 10)}...
                    </code>
                    )를 사용합니다.
                  </p>
                </div>
              </div>
            )}

            {/* 버튼 그룹 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                뒤로
              </button>
              <button
                onClick={handleComplete}
                disabled={
                  isSubmitting ||
                  (selectedNetwork.isActive && selectedAssets.length === 0 && !showCustomToken) ||
                  (showCustomToken && (!customToken.symbol || !customToken.contractAddress))
                }
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '추가 중...' :
                 selectedNetwork.isActive
                   ? showCustomToken && customToken.symbol
                     ? `${customToken.symbol}${selectedAssets.length > 0 ? ` + ${selectedAssets.length}개` : ''} 추가`
                     : `선택한 토큰 추가 (${selectedAssets.length})`
                   : `${selectedNetwork.primaryAsset.symbol}${selectedAssets.length > 0 ? ` + ${selectedAssets.length}개 토큰` : ''}${showCustomToken && customToken.symbol ? ` + ${customToken.symbol}` : ''} 추가`}
              </button>
            </div>
          </div>
        )}
    </div>
  );
}
