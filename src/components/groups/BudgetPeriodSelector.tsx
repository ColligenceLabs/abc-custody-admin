import {
  BudgetPeriod,
  BudgetType,
  CryptoCurrency
} from "@/types/groups";

interface BudgetPeriodSelectorProps {
  budgetPeriod: BudgetPeriod;
  onChange: (budgetPeriod: BudgetPeriod) => void;
  className?: string;
  readOnlyCurrency?: boolean;
}

export default function BudgetPeriodSelector({
  budgetPeriod,
  onChange,
  className = "",
  readOnlyCurrency = false
}: BudgetPeriodSelectorProps) {

  const handleAmountChange = (amount: number) => {
    onChange({
      ...budgetPeriod,
      amount: { ...budgetPeriod.amount, amount }
    });
  };

  const handleCurrencyChange = (currency: CryptoCurrency) => {
    onChange({
      ...budgetPeriod,
      amount: { ...budgetPeriod.amount, currency }
    });
  };

  const getBudgetTypeLabel = (type: BudgetType) => {
    switch (type) {
      case 'monthly':
        return '월간';
      case 'quarterly':
        return '분기';
      case 'yearly':
        return '연간';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 예산 금액 설정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getBudgetTypeLabel(budgetPeriod.type)} 예산 *
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            required
            value={budgetPeriod.amount.amount}
            onChange={(e) => handleAmountChange(Number(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="0"
          />
          {readOnlyCurrency ? (
            <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 font-medium">
              {budgetPeriod.amount.currency}
            </div>
          ) : (
            <select
              value={budgetPeriod.amount.currency}
              onChange={(e) => handleCurrencyChange(e.target.value as CryptoCurrency)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="SOL">SOL</option>
              <option value="USDC">USDC</option>
              <option value="KRW">KRW</option>
            </select>
          )}
        </div>
        {readOnlyCurrency && (
          <p className="text-xs text-gray-500 mt-1">
            자산은 그룹 설정에서 변경할 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
}