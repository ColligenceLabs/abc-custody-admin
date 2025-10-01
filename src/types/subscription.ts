import { ServicePlan } from "@/app/page";

// 구독 상태
export type SubscriptionStatus =
  | 'active'      // 활성
  | 'expired'     // 만료
  | 'cancelled'   // 취소됨
  | 'pending'     // 결제 대기

// 결제 상태
export type PaymentStatus =
  | 'completed'   // 완료
  | 'pending'     // 대기
  | 'failed'      // 실패
  | 'refunded'    // 환불

// 결제 수단
export type PaymentMethod =
  | 'card'        // 카드
  | 'bank'        // 계좌이체
  | 'virtual'     // 가상계좌

// 구독 정보
export interface SubscriptionInfo {
  id: string;
  plan: ServicePlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  nextBillingDate?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isYearly: boolean;
  autoRenewal: boolean;
  features: string[];
}

// 결제 내역
export interface PaymentHistory {
  id: string;
  subscriptionId: string;
  paymentDate: string;
  billingPeriod: string;
  plan: ServicePlan;
  amount: number;
  currency: 'KRW' | 'USD';
  paymentMethod: PaymentMethod;
  paymentMethodDetails: string; // 카드 끝자리, 은행명 등
  status: PaymentStatus;
  invoiceNumber: string;
  description?: string;
  refundAmount?: number;
  refundDate?: string;
}

// 청구서 정보
export interface Invoice {
  id: string;
  paymentHistoryId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: 'KRW' | 'USD';
  status: PaymentStatus;
  downloadUrl?: string;
}

// 구독 통계
export interface SubscriptionStats {
  totalPayments: number;
  totalAmount: number;
  averageMonthlyPayment: number;
  subscriptionDuration: number; // 개월 수
}