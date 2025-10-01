import { useState } from "react";
import { WithdrawalRequest } from "@/types/withdrawal";
import { getStatusInfo, getPriorityInfo, formatAmount, formatDateTime } from "@/utils/withdrawalHelpers";
import { convertToKRW } from "@/utils/approverAssignment";
import { BlockchainInfo } from "./BlockchainInfo";

interface RequestsTabProps {
  withdrawalRequests: WithdrawalRequest[];
}

export default function RequestsTab({ withdrawalRequests }: RequestsTabProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const submittedRequests = withdrawalRequests.filter(
    (r) => r.status === "submitted"
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          출금 신청 관리
        </h3>
        <p className="text-sm text-gray-600">
          사용자가 신청한 출금 요청을 관리하고 검토할 수 있습니다
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  신청 ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  출금 내용
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  자산
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  기안자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  승인진행률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submittedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-primary-600">
                        {request.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {request.title}
                      </div>
                      <div className="text-gray-500">
                        {request.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">
                        {formatAmount(request.amount, request.currency)}
                      </div>
                      <div className="text-gray-500">{request.currency}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.initiator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getPriorityInfo(request.priority).color
                      }`}
                    >
                      {getPriorityInfo(request.priority).name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (request.approvals.length /
                              request.requiredApprovals.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {request.approvals.length}/{request.requiredApprovals.length}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() =>
                        setSelectedRequest(
                          selectedRequest === request.id
                            ? null
                            : request.id
                        )
                      }
                      className="text-primary-600 hover:text-primary-900"
                    >
                      {selectedRequest === request.id
                        ? "닫기"
                        : "상세보기"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 정보 패널 */}
      {selectedRequest && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {(() => {
            const request = withdrawalRequests.find(
              (r) => r.id === selectedRequest
            );
            if (!request) return null;

            return (
              <div>
                {/* 헤더 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              getStatusInfo(request.status).color
                            }`}
                          >
                            {getStatusInfo(request.status).name}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {request.title} 상세 정보
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 출금 요약 */}
                    <div className="lg:col-span-1">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        출금 요약
                      </h5>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {formatAmount(
                                request.amount,
                                request.currency
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {request.currency}
                            </div>
                            <div className="text-lg font-semibold text-primary-600">
                              ₩
                              {convertToKRW(request.amount, request.currency).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">신청 시간</span>
                            <span className="font-medium">
                              {formatDateTime(request.initiatedAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">기안자</span>
                            <span className="font-medium">
                              {request.initiator}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">우선순위</span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                getPriorityInfo(request.priority).color
                              }`}
                            >
                              {getPriorityInfo(request.priority).name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 블록체인 정보 */}
                    <div className="lg:col-span-2">
                      <BlockchainInfo request={request} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}