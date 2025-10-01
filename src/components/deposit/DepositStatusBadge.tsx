import { DepositStatus } from "@/types/deposit";
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, XCircleIcon } from "@heroicons/react/20/solid";

interface DepositStatusBadgeProps {
  status: DepositStatus;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function DepositStatusBadge({
  status,
  showIcon = true,
  size = "md",
  animated = true
}: DepositStatusBadgeProps) {
  const getModernStatusInfo = (status: DepositStatus) => {
    switch (status) {
      case "detected":
        return {
          name: "감지됨",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          dotColor: "bg-blue-400",
          icon: <ExclamationCircleIcon className="w-3 h-3" />
        };
      case "confirming":
        return {
          name: "감지됨",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          dotColor: "bg-blue-400",
          icon: <ClockIcon className="w-3 h-3" />
        };
      case "confirmed":
        return {
          name: "컨펌완료",
          bgColor: "bg-sky-50",
          textColor: "text-sky-700",
          borderColor: "border-sky-200",
          dotColor: "bg-sky-400",
          icon: <CheckCircleIcon className="w-3 h-3" />
        };
      case "credited":
        return {
          name: "입금완료",
          bgColor: "bg-sky-50",
          textColor: "text-sky-700",
          borderColor: "border-sky-200",
          dotColor: "bg-sky-400",
          icon: <CheckCircleIcon className="w-3 h-3" />
        };
      case "failed":
        return {
          name: "실패",
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          dotColor: "bg-red-400",
          icon: <XCircleIcon className="w-3 h-3" />
        };
      default:
        return {
          name: "알수없음",
          bgColor: "bg-gray-50", 
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          dotColor: "bg-gray-400",
          icon: <ExclamationCircleIcon className="w-3 h-3" />
        };
    }
  };
  
  const statusInfo = getModernStatusInfo(status);
  
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2.5"
  };

  const isAnimated = animated && (status === "confirming" || status === "detected");

  return (
    <span className={`
      inline-flex items-center rounded-lg font-medium border shadow-sm
      ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor}
      ${sizeClasses[size]}
    `}>
      {showIcon && (
        <div className="flex items-center">
          {isAnimated ? (
            <div className={`w-3 h-3 rounded-full border-2 border-t-transparent animate-spin ${statusInfo.borderColor}`} 
                 style={{borderTopColor: 'transparent', borderRightColor: 'currentColor', borderBottomColor: 'currentColor', borderLeftColor: 'currentColor'}} />
          ) : (
            <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
          )}
        </div>
      )}
      <span className="font-semibold">{statusInfo.name}</span>
    </span>
  );
}