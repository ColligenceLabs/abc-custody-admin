"use client";

import { StakingValidator } from "../types";
import { getUptimeBadgeColor } from "../utils/stakingConstants";

interface ValidatorTableProps {
  validators: StakingValidator[];
  selectedValidator: StakingValidator | null;
  onSelectValidator: (validator: StakingValidator) => void;
}

export default function ValidatorTable({
  validators,
  selectedValidator,
  onSelectValidator,
}: ValidatorTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              검증인명
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              APY
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              수수료
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              가동률
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {validators.map((validator) => {
            const isSelected = selectedValidator?.id === validator.id;
            const uptimeBadgeColor = getUptimeBadgeColor(validator.uptime);

            return (
              <tr
                key={validator.id}
                onClick={() => onSelectValidator(validator)}
                className={`cursor-pointer transition-colors ${
                  isSelected ? "bg-sky-50" : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => onSelectValidator(validator)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="font-medium text-gray-900">
                      {validator.name}
                    </span>
                    {validator.recommended && (
                      <span className="px-2 py-1 bg-sky-50 text-sky-600 text-xs rounded-full border border-sky-200">
                        추천
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sky-600 font-semibold">
                  {validator.apy.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {validator.commissionRate.toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${uptimeBadgeColor}`}
                  >
                    {validator.uptime.toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
