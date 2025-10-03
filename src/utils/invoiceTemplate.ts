interface InvoiceData {
  invoiceNumber: string;
  paymentDate: string;
  plan: string | null;
  amount: number;
  paymentMethod: string;
  paymentMethodDetails: string;
  status: string;
  memberType: 'individual' | 'corporate';
  refundAmount?: number;
  description?: string;
  billingPeriod?: string;
}

export function generateInvoiceHtml(payment: InvoiceData): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const statusText = payment.status === 'completed' ? '결제 완료' :
                     payment.status === 'refunded' ? '환불 완료' : '기타';

  const memberTypeText = payment.memberType === 'corporate' ? '기업 회원' : '개인 회원';

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>청구서 - ${payment.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
      padding: 40px;
      color: #1f2937;
      background: white;
    }

    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0ea5e9;
    }

    .company-info h1 {
      font-size: 28px;
      color: #0ea5e9;
      margin-bottom: 8px;
    }

    .company-info p {
      color: #6b7280;
      font-size: 14px;
    }

    .invoice-info {
      text-align: right;
    }

    .invoice-info h2 {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .invoice-info p {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .details-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }

    .detail-box {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }

    .detail-box h3 {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 12px;
      letter-spacing: 0.05em;
    }

    .detail-box p {
      font-size: 16px;
      margin-bottom: 8px;
    }

    .detail-box strong {
      color: #111827;
    }

    .payment-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    .payment-table thead {
      background: #f9fafb;
    }

    .payment-table th {
      text-align: left;
      padding: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .payment-table td {
      padding: 16px 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .payment-table tbody tr:last-child td {
      border-bottom: none;
    }

    .plan-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }

    .plan-badge.corporate {
      color: #0ea5e9;
      background: #e0f2fe;
    }

    .plan-badge.individual {
      color: #a855f7;
      background: #f3e8ff;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge.completed {
      color: #0284c7;
      background: #e0f2fe;
      border: 1px solid #bae6fd;
    }

    .status-badge.refunded {
      color: #a855f7;
      background: #f3e8ff;
      border: 1px solid #e9d5ff;
    }

    .total-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 30px;
    }

    .total-box {
      width: 300px;
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .total-row.final {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 2px solid #d1d5db;
      font-size: 18px;
      font-weight: 700;
    }

    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>커스터디 서비스</h1>
        <p>가상자산 커스터디 관리 시스템</p>
      </div>
      <div class="invoice-info">
        <h2>청구서</h2>
        <p><strong>청구서 번호:</strong> ${payment.invoiceNumber}</p>
        <p><strong>발행일:</strong> ${formatDate(payment.paymentDate)}</p>
      </div>
    </div>

    <!-- Customer Details -->
    <div class="details-section">
      <div class="detail-box">
        <h3>청구 대상</h3>
        <p><strong>회원 유형:</strong> ${memberTypeText}</p>
        <p><strong>플랜:</strong> ${payment.plan}</p>
        ${payment.billingPeriod ? `<p><strong>청구 기간:</strong> ${payment.billingPeriod}</p>` : ''}
      </div>
      <div class="detail-box">
        <h3>결제 정보</h3>
        <p><strong>결제일:</strong> ${formatDate(payment.paymentDate)}</p>
        <p><strong>결제 수단:</strong> ${payment.paymentMethod === 'card' ? '카드' : '계좌이체'}</p>
        <p><strong>상세:</strong> ${payment.paymentMethodDetails}</p>
      </div>
    </div>

    <!-- Payment Table -->
    <table class="payment-table">
      <thead>
        <tr>
          <th>항목</th>
          <th>플랜</th>
          <th style="text-align: center;">상태</th>
          <th style="text-align: right;">금액</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${payment.description || '구독 서비스'}</td>
          <td>
            <span class="plan-badge ${payment.memberType}">${payment.plan}</span>
          </td>
          <td style="text-align: center;">
            <span class="status-badge ${payment.status}">${statusText}</span>
          </td>
          <td style="text-align: right;">₩${formatAmount(payment.amount)}</td>
        </tr>
        ${payment.refundAmount ? `
        <tr>
          <td>환불 금액</td>
          <td></td>
          <td style="text-align: center;">
            <span class="status-badge refunded">환불</span>
          </td>
          <td style="text-align: right; color: #a855f7;">-₩${formatAmount(payment.refundAmount)}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <!-- Total Section -->
    <div class="total-section">
      <div class="total-box">
        <div class="total-row">
          <span>소계</span>
          <span>₩${formatAmount(payment.amount)}</span>
        </div>
        ${payment.refundAmount ? `
        <div class="total-row">
          <span>환불</span>
          <span style="color: #a855f7;">-₩${formatAmount(payment.refundAmount)}</span>
        </div>
        ` : ''}
        <div class="total-row">
          <span>부가세 (10%)</span>
          <span>₩${formatAmount(Math.floor((payment.amount - (payment.refundAmount || 0)) * 0.1))}</span>
        </div>
        <div class="total-row final">
          <span>총 결제 금액</span>
          <span>₩${formatAmount(Math.floor((payment.amount - (payment.refundAmount || 0)) * 1.1))}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>본 청구서는 전자 문서로 발행되었습니다.</p>
      <p>문의사항이 있으시면 support@custody.com으로 연락 주시기 바랍니다.</p>
    </div>
  </div>
</body>
</html>
  `;
}
