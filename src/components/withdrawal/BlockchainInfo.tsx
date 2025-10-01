import { useState, useRef, useEffect } from "react";
import { WithdrawalRequest } from "@/types/withdrawal";
import { formatDateTime } from "@/utils/withdrawalHelpers";

interface BlockchainInfoProps {
  request: WithdrawalRequest;
}

export function BlockchainInfo({ request }: BlockchainInfoProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 동적 truncate를 위한 ref와 상태
  const networkRef = useRef<HTMLDivElement>(null);
  const txHashRef = useRef<HTMLDivElement>(null);
  const fromAddressRef = useRef<HTMLDivElement>(null);
  const toAddressRef = useRef<HTMLDivElement>(null);

  const [maxChars, setMaxChars] = useState({
    network: 20,
    txHash: 45,
    fromAddress: 45,
    toAddress: 45,
  });

  // 컨테이너 너비를 기반으로 최대 문자 수 계산
  const calculateMaxChars = (element: HTMLElement | null) => {
    if (!element) return 45; // 기본값

    const containerWidth = element.offsetWidth;
    const fontSize = 0.65; // rem - text-[0.65rem]
    const basePixelSize = 16; // 1rem = 16px (기본)
    const charWidth = fontSize * basePixelSize * 0.6; // monospace 문자 너비 (대략)
    const padding = 16; // px-2 (8px * 2)
    const buttonWidth = 40; // 복사 버튼 너비

    const availableWidth = containerWidth - padding - buttonWidth;
    const maxChars = Math.floor(availableWidth / charWidth);

    // 최소 20자, 최대 100자로 제한
    return Math.max(20, Math.min(100, maxChars));
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // 동적 truncate 함수 - 컨테이너 너비에 맞춰 최대한 표시
  const truncateDynamic = (text: string, maxChars: number) => {
    if (!text || text.length <= maxChars) {
      return text;
    }

    const dotsLength = 3;
    const availableChars = maxChars - dotsLength;

    // 앞 65%, 뒤 35% 비율로 분배
    const frontChars = Math.ceil(availableChars * 0.65);
    const backChars = availableChars - frontChars;

    return `${text.slice(0, frontChars)}...${text.slice(-backChars)}`;
  };

  // 컨테이너 크기 변경 감지 및 문자 수 업데이트
  useEffect(() => {
    const updateMaxChars = () => {
      setMaxChars({
        network: calculateMaxChars(networkRef.current),
        txHash: calculateMaxChars(txHashRef.current),
        fromAddress: calculateMaxChars(fromAddressRef.current),
        toAddress: calculateMaxChars(toAddressRef.current),
      });
    };

    // 초기 계산
    updateMaxChars();

    // ResizeObserver로 크기 변경 감지
    const observer = new ResizeObserver(() => {
      updateMaxChars();
    });

    // 모든 ref 요소 관찰
    const refs = [networkRef, txHashRef, fromAddressRef, toAddressRef];
    refs.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    // 윈도우 리사이즈도 감지
    window.addEventListener('resize', updateMaxChars);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateMaxChars);
    };
  }, []);

  const getNetworkInfo = (currency: string) => {
    switch (currency) {
      case 'BTC':
        return { name: 'Bitcoin', color: 'text-orange-600' };
      case 'ETH':
        return { name: 'Ethereum', color: 'text-blue-600' };
      case 'USDC':
      case 'KRW':
        return { name: 'Ethereum (ERC-20)', color: 'text-blue-600' };
      default:
        return { name: 'Unknown Network', color: 'text-gray-600' };
    }
  };

  const networkInfo = getNetworkInfo(request.currency);

  return (
    <div className="mt-6">
      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        블록체인 정보
      </h5>
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 네트워크 */}
          <div className="space-y-2" ref={networkRef}>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-gray-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 2L2 7v10l10 5 10-5V7l-10-5zM12 2v20M2 7l10 5 10-5"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">네트워크</span>
            </div>
            <div className={`font-mono text-[0.65rem] leading-tight font-medium ${networkInfo.color} bg-white px-3 py-2 rounded border`}>
              {networkInfo.name}
            </div>
          </div>

          {/* 트랜잭션 해시 */}
          <div className="space-y-2" ref={txHashRef}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">트랜잭션 해시</span>
              </div>
              {request.txHash && (
                <button
                  onClick={() => copyToClipboard(request.txHash!, 'txHash')}
                  className="text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors"
                >
                  {copiedField === 'txHash' ? '복사됨' : '복사'}
                </button>
              )}
            </div>
            <div className="font-mono text-[0.65rem] leading-tight text-gray-900 bg-white px-3 py-2 rounded border break-all" title={request.txHash || '트랜잭션 실행 전'}>
              {request.txHash ? truncateDynamic(request.txHash, maxChars.txHash) : '트랜잭션 실행 전'}
            </div>
          </div>

          {/* 보낸 주소 */}
          <div className="space-y-2" ref={fromAddressRef}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 11l5-5m0 0l5 5m-5-5v12"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">보낸 주소</span>
              </div>
              {request.txHash && (
                <button
                  onClick={() => copyToClipboard(request.fromAddress, 'fromAddress')}
                  className="text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors"
                >
                  {copiedField === 'fromAddress' ? '복사됨' : '복사'}
                </button>
              )}
            </div>
            <div className="font-mono text-[0.65rem] leading-tight text-gray-900 bg-white px-3 py-2 rounded border break-all" title={request.txHash ? request.fromAddress : '트랜잭션 실행 전'}>
              {request.txHash ? truncateDynamic(request.fromAddress, maxChars.fromAddress) : '트랜잭션 실행 전'}
            </div>
          </div>
          {/* 받은 주소 */}
          <div className="space-y-2" ref={toAddressRef}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 13l-5 5m0 0l-5-5m5 5V6"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">받은 주소</span>
              </div>
              <button
                onClick={() => copyToClipboard(request.toAddress, 'toAddress')}
                className="text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors"
              >
                {copiedField === 'toAddress' ? '복사됨' : '복사'}
              </button>
            </div>
            <div className="font-mono text-[0.65rem] leading-tight text-gray-900 bg-white px-3 py-2 rounded border break-all" title={request.toAddress}>
              {truncateDynamic(request.toAddress, maxChars.toAddress)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}