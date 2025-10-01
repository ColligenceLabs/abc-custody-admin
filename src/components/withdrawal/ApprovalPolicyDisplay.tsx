import { Currency } from "@/types/withdrawal";
import { 
  getRequiredApprovers, 
  getApprovalPolicyInfo, 
  getPolicyDescription,
  convertToKRW,
  APPROVAL_POLICIES 
} from "@/utils/approverAssignment";
import { ApproverRoleBadge } from "./ApproverRoleBadge";

interface ApprovalPolicyDisplayProps {
  amount: number;
  currency: Currency;
  transactionType?: string;
  showAllPolicies?: boolean;
  compact?: boolean;
}

export function ApprovalPolicyDisplay({ 
  amount, 
  currency, 
  transactionType,
  showAllPolicies = false,
  compact = false 
}: ApprovalPolicyDisplayProps) {
  
  const requiredApprovers = getRequiredApprovers(amount, currency);
  const policyInfo = getApprovalPolicyInfo(amount, currency);
  const description = getPolicyDescription(amount, currency, transactionType);
  const krwAmount = convertToKRW(amount, currency);

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-gray-600">정책:</span>
        <span className="font-medium text-gray-800">{requiredApprovers.length}명 결재</span>
        <div className="flex items-center space-x-1">
          {requiredApprovers.slice(0, 2).map(approver => (
            <ApproverRoleBadge key={approver} approverName={approver} size="sm" />
          ))}
          {requiredApprovers.length > 2 && (
            <span className="text-gray-400">+{requiredApprovers.length - 2}</span>
          )}
        </div>
      </div>
    );
  }

  if (showAllPolicies) {
    const currencyPolicies = APPROVAL_POLICIES.filter(policy => policy.currency === currency);
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h6 className="text-sm font-medium text-gray-700 mb-3">
          {currency} 결재 정책
        </h6>
        
        <div className="space-y-3">
          {currencyPolicies.map((policy, index) => {
            const isActive = amount >= policy.minAmount && amount < policy.maxAmount;
            
            return (
              <div 
                key={index}
                className={`p-3 rounded border ${
                  isActive 
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {isActive && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {policy.description}
                    </span>
                  </div>
                  <span className={`text-xs ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {policy.requiredApprovers.length}명 결재
                  </span>
                </div>
                
                <div className="text-xs text-gray-500 mb-2">
                  {policy.minAmount === 0 ? '0' : policy.minAmount.toLocaleString()} ~ {' '}
                  {policy.maxAmount === Infinity ? '∞' : policy.maxAmount.toLocaleString()} {policy.currency}
                </div>
                
                <div className="flex items-center space-x-1">
                  {policy.requiredApprovers.map(approver => (
                    <ApproverRoleBadge key={approver} approverName={approver} size="sm" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <h6 className="text-sm font-medium text-blue-800">
          적용된 결재 정책
        </h6>
        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
          {requiredApprovers.length}명 결재 필요
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="text-sm text-blue-700">
          <div className="font-medium mb-1">{description}</div>
          <div className="text-xs text-blue-600">
            거래금액: {amount.toLocaleString()} {currency}
          </div>
        </div>
        
        <div className="border-t border-blue-200 pt-3">
          <div className="text-xs text-blue-600 mb-2">필수 결재자</div>
          <div className="flex flex-wrap gap-2">
            {requiredApprovers.map((approver, index) => (
              <div key={approver} className="flex items-center space-x-1">
                <span className="text-xs text-blue-700 font-medium">{index + 1}.</span>
                <ApproverRoleBadge approverName={approver} size="sm" />
              </div>
            ))}
          </div>
        </div>
        
        {transactionType && (
          <div className="border-t border-blue-200 pt-3">
            <div className="text-xs text-blue-600">
              거래 유형: <span className="font-medium">{transactionType}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}