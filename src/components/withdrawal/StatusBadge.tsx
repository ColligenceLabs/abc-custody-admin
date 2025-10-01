import { WithdrawalStatus } from "@/types/withdrawal";
import { getStatusInfo } from "@/utils/withdrawalHelpers";

interface StatusBadgeProps {
  status: WithdrawalStatus;
  text?: string; // 커스텀 텍스트 (진행률 등)
}

export function StatusBadge({ status, text }: StatusBadgeProps) {
  const statusInfo = getStatusInfo(status);
  const StatusIcon = statusInfo.icon;
  
  return (
    <div className="flex items-center space-x-2">
      <StatusIcon className="h-4 w-4" />
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {text || statusInfo.name}
      </span>
    </div>
  );
}