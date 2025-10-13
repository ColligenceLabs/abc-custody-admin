import { getPriorityInfo } from "@/utils/withdrawalHelpers";

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | "critical";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityInfo = getPriorityInfo(priority);

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${priorityInfo.color}`}>
      {priorityInfo.name}
    </span>
  );
}