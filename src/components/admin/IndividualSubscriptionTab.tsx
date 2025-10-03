"use client";

import React from "react";
import {
  CheckCircleIcon,
  CreditCardIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import {
  individualSubscription,
  individualPaymentHistory,
} from "@/data/individualSubscriptionMockData";

interface IndividualSubscriptionTabProps {
  plan: ServicePlan;
}

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

export default function IndividualSubscriptionTab({
  plan,
}: IndividualSubscriptionTabProps) {
  // 청구서 다운로드
  const handleDownloadInvoice = async (invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/invoice/${invoiceNumber}`);

      if (!response.ok) {
        throw new Error('청구서 다운로드 실패');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('청구서 다운로드 오류:', error);
      alert('청구서 다운로드 중 오류가 발생했습니다.');
    }
  };

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
            <div className="px-3 py-1 text-sm font-semibold rounded-full text-purple-600 bg-purple-50">
              {individualSubscription.planName}
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
              <div className="text-sm font-semibold text-gray-900">{formatDate(individualSubscription.startDate)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">다음 결제일</div>
              <div className="text-sm font-semibold text-gray-900">{formatDate(individualSubscription.nextBillingDate)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">연간 요금</div>
              <div className="text-sm font-semibold text-gray-900">₩{formatAmount(individualSubscription.yearlyPrice)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">자동 갱신</div>
              <div className="text-sm font-semibold text-gray-900">{individualSubscription.autoRenewal ? '활성' : '비활성'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 내역 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">결제 내역</h2>
          <p className="text-sm text-gray-600">구독 서비스 결제 기록</p>
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
              {individualPaymentHistory.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={
                      payment.plan === '개인 플랜'
                        ? 'px-2 py-1 text-xs rounded-full font-medium text-purple-600 bg-purple-50'
                        : 'px-2 py-1 text-xs rounded-full font-medium text-gray-600 bg-gray-50'
                    }>
                      {payment.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₩{formatAmount(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <CreditCardIcon className="w-4 h-4 mr-2" />
                      <span>{payment.paymentMethodDetails}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border text-sky-600 bg-sky-50 border-sky-200">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      결제완료
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
