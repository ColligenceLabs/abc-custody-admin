// 개인 회원용 구독 정보
export const individualSubscription = {
  plan: 'individual',
  planName: '개인 플랜',
  startDate: '2025-01-01',
  nextBillingDate: '2026-01-01',
  yearlyPrice: 300000,
  autoRenewal: true,
  status: 'active'
};

// 개인 회원용 결제 내역
export const individualPaymentHistory = [
  {
    id: 'PAY-2025-001',
    paymentDate: '2025-01-01',
    plan: '개인 플랜',
    amount: 300000,
    paymentMethod: 'card',
    paymentMethodDetails: '신한카드 ****-1234',
    status: 'completed' as const,
    invoiceNumber: 'INV-2025-001'
  },
  {
    id: 'PAY-2024-001',
    paymentDate: '2024-01-01',
    plan: '개인 플랜',
    amount: 300000,
    paymentMethod: 'card',
    paymentMethodDetails: '신한카드 ****-1234',
    status: 'completed' as const,
    invoiceNumber: 'INV-2024-001'
  }
];
