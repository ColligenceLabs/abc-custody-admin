import { WithdrawalStatus } from "@/types/withdrawal";
import { getStatusInfo } from "@/utils/withdrawalHelpers";

interface StatusBadgeProps {
  status: WithdrawalStatus;
  text?: string; // 커스텀 텍스트 (진행률 등)
  hideIcon?: boolean; // 아이콘 숨김 여부
}

export function StatusBadge({ status, text, hideIcon = false }: StatusBadgeProps) {
  const statusInfo = getStatusInfo(status);
  const displayText = text || statusInfo.name;

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${statusInfo.color}`}>
        {displayText}
      </span>
    </div>
  );
}