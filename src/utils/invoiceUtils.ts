import { individualPaymentHistory } from '@/data/individualSubscriptionMockData';
import { corporatePaymentHistory } from '@/data/corporateSubscriptionMockData';

// 청구서 번호로 결제 내역 조회
export function getPaymentByInvoiceNumber(invoiceNumber: string) {
  // 개인 회원 결제 내역에서 검색
  const individualPayment = individualPaymentHistory.find(
    (payment) => payment.invoiceNumber === invoiceNumber
  );

  if (individualPayment) {
    return {
      ...individualPayment,
      memberType: 'individual' as const,
    };
  }

  // 기업 회원 결제 내역에서 검색
  const corporatePayment = corporatePaymentHistory.find(
    (payment) => payment.invoiceNumber === invoiceNumber
  );

  if (corporatePayment) {
    return {
      ...corporatePayment,
      memberType: 'corporate' as const,
    };
  }

  return null;
}
