interface ApproverRoleBadgeProps {
  approverName: string;
  size?: "sm" | "md" | "lg";
  showFullName?: boolean;
}

export function ApproverRoleBadge({ 
  approverName, 
  size = "md",
  showFullName = false 
}: ApproverRoleBadgeProps) {
  
  const getRoleInfo = (name: string) => {
    // 역할별 정보 매핑
    const roleMap: Record<string, {
      role: string;
      shortName: string;
      color: string;
      bgColor: string;
      icon?: string;
    }> = {
      "박CFO": {
        role: "CFO",
        shortName: "CFO",
        color: "text-blue-800",
        bgColor: "bg-blue-100",
        icon: "💼"
      },
      "이CISO": {
        role: "CISO",
        shortName: "CISO",
        color: "text-red-800",
        bgColor: "bg-red-100",
        icon: "🔒"
      },
      "김CTO": {
        role: "CTO",
        shortName: "CTO",
        color: "text-sky-800",
        bgColor: "bg-sky-100",
        icon: "⚙️"
      },
      "정법무이사": {
        role: "법무이사",
        shortName: "법무",
        color: "text-purple-800",
        bgColor: "bg-purple-100",
        icon: "⚖️"
      },
      "최CEO": {
        role: "CEO",
        shortName: "CEO",
        color: "text-indigo-800",
        bgColor: "bg-indigo-100",
        icon: "👑"
      },
      "최마케팅이사": {
        role: "마케팅이사",
        shortName: "마케팅",
        color: "text-pink-800",
        bgColor: "bg-pink-100",
        icon: "📢"
      },
      "이법무팀장": {
        role: "법무팀장",
        shortName: "법무",
        color: "text-purple-800",
        bgColor: "bg-purple-100",
        icon: "⚖️"
      },
      "정CTO": {
        role: "CTO",
        shortName: "CTO", 
        color: "text-sky-800",
        bgColor: "bg-sky-100",
        icon: "⚙️"
      },
      "한비즈데브이사": {
        role: "비즈데브이사",
        shortName: "비즈",
        color: "text-orange-800",
        bgColor: "bg-orange-100",
        icon: "🤝"
      }
    };
    
    return roleMap[name] || {
      role: "일반",
      shortName: "일반",
      color: "text-gray-800",
      bgColor: "bg-gray-100",
      icon: "👤"
    };
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-xs px-1.5 py-0.5";
      case "lg":
        return "text-sm px-3 py-1.5";
      default: // md
        return "text-xs px-2 py-1";
    }
  };
  
  const roleInfo = getRoleInfo(approverName);
  const sizeClasses = getSizeClasses();
  
  return (
    <div className="flex items-center space-x-2">
      <span className="font-medium text-gray-900">
        {approverName}
      </span>
      <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${roleInfo.bgColor} ${roleInfo.color}`}>
        {size !== "sm" && roleInfo.icon && (
          <span className="mr-1">{roleInfo.icon}</span>
        )}
        {showFullName ? roleInfo.role : roleInfo.shortName}
      </span>
    </div>
  );
}