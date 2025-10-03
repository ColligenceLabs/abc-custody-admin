import { SubscriptionInfo, PaymentHistory } from "@/types/subscription";

// 기업 회원용 구독 정보
export const corporateSubscription: SubscriptionInfo = {
  id: 'SUB-2025-001',
  plan: 'enterprise',
  status: 'active',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  nextBillingDate: '2026-01-01',
  monthlyPrice: 990000,
  yearlyPrice: 9900000,
  isYearly: true,
  autoRenewal: true,
  features: [
    '무제한 사용자',
    '고급 보안 기능',
    '24/7 기술 지원',
    'API 액세스',
    '커스텀 브랜딩',
    '감사 로그',
    '데이터 백업',
  ],
};

// 기업 회원용 결제 내역
export const corporatePaymentHistory: PaymentHistory[] = [
  {
    id: 'PAY-2025-001',
    subscriptionId: 'SUB-2025-001',
    paymentDate: '2025-01-01',
    billingPeriod: '2025-01-01 ~ 2025-12-31',
    plan: 'enterprise',
    amount: 9900000,
    currency: 'KRW',
    paymentMethod: 'card',
    paymentMethodDetails: '**** **** **** 1234',
    status: 'completed',
    invoiceNumber: 'INV-2025-0001',
    description: 'Enterprise 플랜 연간 구독',
  },
  {
    id: 'PAY-2024-001',
    subscriptionId: 'SUB-2024-001',
    paymentDate: '2024-01-01',
    billingPeriod: '2024-01-01 ~ 2024-12-31',
    plan: 'enterprise',
    amount: 9900000,
    currency: 'KRW',
    paymentMethod: 'card',
    paymentMethodDetails: '**** **** **** 1234',
    status: 'completed',
    invoiceNumber: 'INV-2024-0001',
    description: 'Enterprise 플랜 연간 구독',
  }
];

// 플랜별 정보
export const planInfo = {
  free: {
    name: '무료',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '기본 지갑 기능',
      '월 5회 거래',
      '이메일 지원',
    ],
    color: 'sky',
  },
  premium: {
    name: '프리미엄',
    monthlyPrice: 290000,
    yearlyPrice: 2900000,
    features: [
      '무제한 거래',
      '다중 지갑 지원',
      '실시간 알림',
      '우선 이메일 지원',
      '기본 API 액세스',
    ],
    color: 'purple',
  },
  enterprise: {
    name: '기업',
    monthlyPrice: 990000,
    yearlyPrice: 9900000,
    features: [
      '무제한 사용자',
      '고급 보안 기능',
      '24/7 기술 지원',
      '전체 API 액세스',
      '커스텀 브랜딩',
      '감사 로그',
      '데이터 백업',
      'SLA 보장',
    ],
    color: 'primary',
  },
} as const;
