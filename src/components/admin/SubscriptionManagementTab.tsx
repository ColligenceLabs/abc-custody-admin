"use client";

import React, { useState } from "react";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  CreditCardIcon,
  DocumentTextIcon,
  FunnelIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import {
  mockSubscriptionInfo,
  mockPaymentHistory,
  planInfo,
} from "@/data/subscriptionMockData";
import { PaymentHistory, PaymentStatus } from "@/types/subscription";

interface SubscriptionManagementTabProps {
  plan: ServicePlan;
}

// 상태별 배지 스타일
const getStatusBadge = (status: PaymentStatus) => {
  const badges = {
    completed: "text-sky-600 bg-sky-50 border-sky-200",
    pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
    failed: "text-red-600 bg-red-50 border-red-200",
    refunded: "text-purple-600 bg-purple-50 border-purple-200",
  };

  const icons = {
    completed: CheckCircleIcon,
    pending: ClockIcon,
    failed: XCircleIcon,
    refunded: DocumentTextIcon,
  };

  const labels = {
    completed: "결제완료",
    pending: "결제대기",
    failed: "결제실패",
    refunded: "부분환불",
  };

  const Icon = icons[status];

  return {
    className: `inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${badges[status]}`,
    icon: <Icon className="w-3 h-3 mr-1" />,
    label: labels[status],
  };
};

// 결제수단 아이콘 및 라벨
const getPaymentMethodInfo = (method: string, details: string) => {
  if (method === 'card') {
    return {
      icon: <CreditCardIcon className="w-4 h-4" />,
      label: `카드 ${details}`,
    };
  } else if (method === 'bank') {
    return {
      icon: <DocumentTextIcon className="w-4 h-4" />,
      label: details,
    };
  }
  return {
    icon: <CreditCardIcon className="w-4 h-4" />,
    label: details || '기타',
  };
};

// 날짜 포맷팅
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 금액 포맷팅
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

export default function SubscriptionManagementTab({
  plan,
}: SubscriptionManagementTabProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 현재 구독 정보
  const currentSubscription = mockSubscriptionInfo;
  const currentPlanInfo = planInfo[plan as keyof typeof planInfo] || planInfo.free;

  // 필터링된 결제 내역
  const filteredPayments = mockPaymentHistory.filter((payment) => {
    const paymentYear = new Date(payment.paymentDate).getFullYear();
    const yearMatch = paymentYear === selectedYear;
    const statusMatch = selectedStatus === 'all' || payment.status === selectedStatus;
    return yearMatch && statusMatch;
  });

  // 페이지네이션 계산
  const getPaginatedPayments = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filteredPayments.slice(startIndex, endIndex),
      totalItems: filteredPayments.length,
      totalPages: Math.ceil(filteredPayments.length / itemsPerPage),
      currentPage: currentPage,
      itemsPerPage: itemsPerPage,
    };
  };

  const paginatedData = getPaginatedPayments();

  // 청구서 다운로드
  const handleDownloadInvoice = (invoiceNumber: string) => {
    // 실제 구현에서는 API 호출
    console.log(`Downloading invoice: ${invoiceNumber}`);
    alert(`청구서 ${invoiceNumber}를 다운로드합니다.`);
  };


  // 연도 목록 생성
  const availableYears = Array.from(
    new Set(mockPaymentHistory.map(p => new Date(p.paymentDate).getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* 현재 구독 정보 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">현재 구독 정보</h2>
          <p className="text-sm text-gray-600">활성화된 구독 서비스 상태</p>
        </div>

        <div className="space-y-6">
          {/* 플랜 상태 */}
          <div className="flex items-center space-x-3">
            <div className={
              currentPlanInfo.color === 'primary'
                ? 'px-3 py-1 text-sm font-semibold rounded-full text-primary-600 bg-primary-50'
                : currentPlanInfo.color === 'purple'
                ? 'px-3 py-1 text-sm font-semibold rounded-full text-purple-600 bg-purple-50'
                : 'px-3 py-1 text-sm font-semibold rounded-full text-sky-600 bg-sky-50'
            }>
              {currentPlanInfo.name} 플랜
            </div>
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full text-sky-600 bg-sky-50 border border-sky-200">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              활성
            </span>
          </div>

          {/* 구독 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">구독 시작일</div>
              <div className="text-sm font-semibold text-gray-900">{formatDate(currentSubscription.startDate)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">다음 결제일</div>
              <div className="text-sm font-semibold text-gray-900">{formatDate(currentSubscription.nextBillingDate || '')}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">연간 요금</div>
              <div className="text-sm font-semibold text-gray-900">₩{formatAmount(currentPlanInfo.yearlyPrice)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">자동 갱신</div>
              <div className="text-sm font-semibold text-gray-900">{currentSubscription.autoRenewal ? '활성' : '비활성'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 내역 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">결제 내역</h2>
            <p className="text-sm text-gray-600">구독 서비스 결제 기록</p>
          </div>
        </div>

        {/* 필터 */}
        <div className="mb-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as PaymentStatus | 'all');
              setCurrentPage(1);
            }}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">전체 상태</option>
            <option value="completed">결제 완료</option>
            <option value="refunded">결제 취소</option>
          </select>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  플랜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제수단
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  청구서
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.items.map((payment) => {
                const statusBadge = getStatusBadge(payment.status);
                const paymentMethod = getPaymentMethodInfo(payment.paymentMethod, payment.paymentMethodDetails);

                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className={
                          planInfo[payment.plan as keyof typeof planInfo]?.color === 'primary'
                            ? 'px-2 py-1 text-xs rounded-full font-medium text-primary-600 bg-primary-50'
                            : planInfo[payment.plan as keyof typeof planInfo]?.color === 'purple'
                            ? 'px-2 py-1 text-xs rounded-full font-medium text-purple-600 bg-purple-50'
                            : 'px-2 py-1 text-xs rounded-full font-medium text-sky-600 bg-sky-50'
                        }>
                          {planInfo[payment.plan as keyof typeof planInfo]?.name || payment.plan}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        ₩{formatAmount(payment.amount)}
                        {payment.refundAmount && (
                          <div className="text-xs text-purple-600">
                            환불: ₩{formatAmount(payment.refundAmount)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {paymentMethod.icon}
                        <span className="ml-2">{paymentMethod.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={statusBadge.className}>
                        {statusBadge.icon}
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDownloadInvoice(payment.invoiceNumber)}
                        className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                        {payment.invoiceNumber}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginatedData.totalItems === 0 && (
            <div className="text-center py-8">
              <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">결제 내역이 없습니다</h3>
              <p className="text-gray-500">선택한 조건에 해당하는 결제 내역이 없습니다.</p>
            </div>
          )}

          {/* 페이지네이션 */}
          {paginatedData.totalPages > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                  총 {paginatedData.totalItems}개 중{" "}
                  {Math.min(
                    (paginatedData.currentPage - 1) * paginatedData.itemsPerPage + 1,
                    paginatedData.totalItems
                  )}
                  -
                  {Math.min(
                    paginatedData.currentPage * paginatedData.itemsPerPage,
                    paginatedData.totalItems
                  )}
                  개 표시
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage(Math.max(1, paginatedData.currentPage - 1))
                    }
                    disabled={paginatedData.currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>

                  {[...Array(paginatedData.totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    const isCurrentPage = pageNumber === paginatedData.currentPage;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          isCurrentPage
                            ? "bg-primary-600 text-white border-primary-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage(
                        Math.min(
                          paginatedData.totalPages,
                          paginatedData.currentPage + 1
                        )
                      )
                    }
                    disabled={
                      paginatedData.currentPage === paginatedData.totalPages
                    }
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}