import React from "react";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { NetworkAsset } from "./WithdrawalModalBase";

interface NetworkOption {
  id: string;
  name: string;
  icon: string;
}

interface NetworkSelectorProps {
  networks: NetworkOption[];
  selected: string;
  onChange: (network: string) => void;
}

interface AssetSelectorProps {
  assets: NetworkAsset[];
  selected: string;
  onChange: (asset: string) => void;
  disabled: boolean;
}

export const NETWORK_OPTIONS: NetworkOption[] = [
  {
    id: "Bitcoin",
    name: "Bitcoin",
    icon: "BTC",
  },
  {
    id: "Ethereum",
    name: "Ethereum",
    icon: "ETH",
  },
  {
    id: "Solana",
    name: "Solana",
    icon: "SOL",
  },
];

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  networks,
  selected,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        출금 네트워크 *
      </label>
      <div className="grid grid-cols-3 gap-3">
        {networks.map((network) => (
          <button
            key={network.id}
            type="button"
            onClick={() => onChange(network.id)}
            className={`
              relative p-4 rounded-lg border-2
              ${
                selected === network.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200"
              }
            `}
          >
            {/* 네트워크 아이콘 */}
            <div className="flex justify-center mb-2">
              <CryptoIcon symbol={network.icon} size={40} />
            </div>

            {/* 네트워크 이름 */}
            <div className="text-sm font-semibold text-gray-900 text-center">
              {network.name}
            </div>

            {/* 선택 표시 */}
            {selected === network.id && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  assets,
  selected,
  onChange,
  disabled,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        출금 자산 *
      </label>

      {disabled ? (
        <div className="p-4 text-center text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          먼저 네트워크를 선택하세요
        </div>
      ) : !assets || assets.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          사용 가능한 자산이 없습니다
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {assets.map((asset) => (
            <button
              key={asset.value}
              type="button"
              onClick={() => asset.isActive && onChange(asset.value)}
              disabled={!asset.isActive}
              className={`
                w-full p-2 rounded-lg border-2 text-left
                ${
                  selected === asset.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200"
                }
                ${!asset.isActive && "opacity-60 cursor-not-allowed bg-gray-50"}
              `}
            >
              <div className="flex items-center justify-between">
                {/* 왼쪽: 아이콘 + 정보 */}
                <div className="flex items-center space-x-2">
                  <CryptoIcon symbol={asset.symbol} size={24} />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {asset.symbol} {!asset.isActive && "(출금 중단)"}
                    </div>
                    <div className="text-xs text-gray-600">{asset.name}</div>
                  </div>
                </div>

                {/* 오른쪽: 선택 표시 */}
                {selected === asset.value && (
                  <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
