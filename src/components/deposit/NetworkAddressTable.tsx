"use client";

import { useState, useRef, useEffect } from 'react';
import {
  ClipboardDocumentIcon,
  QrCodeIcon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import CryptoIcon from '@/components/ui/CryptoIcon';
import { NetworkGroup } from '@/types/networkGroup';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/components/common/Modal';

interface NetworkAddressTableProps {
  networks: NetworkGroup[];
  onManageAssets?: (network: NetworkGroup) => void;
  onRemoveAsset?: (networkGroup: string, assetId: string) => void;
  onAddAsset?: () => void;
}

export default function NetworkAddressTable({
  networks,
  onManageAssets,
  onRemoveAsset,
  onAddAsset,
}: NetworkAddressTableProps) {
  const [copiedAddress, setCopiedAddress] = useState<string>('');
  const [selectedQR, setSelectedQR] = useState<NetworkGroup | null>(null);
  const [addressMaxChars, setAddressMaxChars] = useState<{ [key: string]: number }>({});
  const addressRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 동적 truncate 함수
  const truncateDynamic = (text: string, maxChars: number) => {
    if (!text || text.length <= maxChars) return text;

    const dotsLength = 3;
    const availableChars = maxChars - dotsLength;
    const frontChars = Math.ceil(availableChars * 0.65);
    const backChars = availableChars - frontChars;

    return `${text.slice(0, frontChars)}...${text.slice(-backChars)}`;
  };

  // 주소 복사 함수
  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(''), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // ResizeObserver로 주소 표시 영역 크기 감지
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      Object.keys(addressRefs.current).forEach((key) => {
        const ref = addressRefs.current[key];
        if (ref) {
          const width = ref.offsetWidth;
          const avgCharWidth = 8;
          const maxChars = Math.floor(width / avgCharWidth);
          setAddressMaxChars((prev) => ({ ...prev, [key]: maxChars }));
        }
      });
    });

    Object.values(addressRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [networks]);

  return (
    <div className="space-y-4">
      {/* 흰색 배경 카드로 감싸진 테이블 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            입금 주소 관리
          </h3>
        </div>

        {/* 데이터 표시 영역 */}
        <div className="p-6">
          {networks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <PlusIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                자산이 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                첫 번째 자산을 추가하여 입금을 시작하세요
              </p>
              {onAddAsset && (
                <button
                  onClick={onAddAsset}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  자산 추가
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      네트워크
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      입금 주소
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      활성화된 자산
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {networks.map((network) => (
                    <tr key={network.network} className="hover:bg-gray-50 transition-colors">
                      {/* 네트워크 정보 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            <CryptoIcon
                              symbol={network.assets.find((a) => a.isPrimary)?.coin || 'ETH'}
                              size={32}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {network.networkName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {network.assets.length}개 자산 활성화
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 입금 주소 */}
                      <td className="px-6 py-4">
                        <div
                          ref={(el) => { addressRefs.current[network.network] = el; }}
                          className="flex items-center space-x-2"
                        >
                          <code className="text-sm font-mono text-gray-700 flex-1 overflow-hidden">
                            {truncateDynamic(
                              network.address,
                              addressMaxChars[network.network] || 40
                            )}
                          </code>
                          <button
                            onClick={() => copyToClipboard(network.address)}
                            className="flex-shrink-0 p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                            title="주소 복사"
                          >
                            {copiedAddress === network.address ? (
                              <CheckIcon className="h-4 w-4 text-sky-600" />
                            ) : (
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 활성화된 자산 목록 */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {network.assets.map((asset) => (
                            <div
                              key={asset.id}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs"
                            >
                              <CryptoIcon symbol={asset.coin} size={16} />
                              <span className="font-semibold text-gray-700">{asset.coin}</span>
                              {!asset.isPrimary && onRemoveAsset && (
                                <button
                                  onClick={() => onRemoveAsset(network.network, asset.id)}
                                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="자산 제거"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* 작업 버튼 */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedQR(network)}
                            className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors"
                          >
                            <QrCodeIcon className="h-4 w-4 inline mr-1" />
                            QR 코드
                          </button>
                          {onManageAssets && (
                            <button
                              onClick={() => onManageAssets(network)}
                              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <PlusIcon className="h-4 w-4 inline mr-1" />
                              자산 관리
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* QR 코드 모달 */}
      {selectedQR && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQR(null)}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedQR.networkName} 입금 주소 QR 코드
              </h3>
              <button
                onClick={() => setSelectedQR(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
            <div className="flex justify-center p-6 bg-white border border-gray-200 rounded-lg">
              <QRCodeSVG value={selectedQR.address} size={256} level="H" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">입금 주소</p>
              <code className="block text-xs font-mono text-gray-700 break-all bg-gray-50 p-3 rounded border border-gray-200">
                {selectedQR.address}
              </code>
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={() => copyToClipboard(selectedQR.address)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
              >
                {copiedAddress === selectedQR.address ? (
                  <>
                    <CheckIcon className="h-4 w-4 inline mr-1" />
                    복사 완료
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4 inline mr-1" />
                    주소 복사
                  </>
                )}
              </button>
            </div>
          </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
