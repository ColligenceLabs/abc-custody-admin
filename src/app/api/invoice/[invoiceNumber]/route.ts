import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getPaymentByInvoiceNumber } from '@/utils/invoiceUtils';
import { generateInvoiceHtml } from '@/utils/invoiceTemplate';

export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceNumber: string } }
) {
  try {
    // 1. 서버에서 데이터 조회 (위변조 방지)
    const payment = getPaymentByInvoiceNumber(params.invoiceNumber);

    if (!payment) {
      return NextResponse.json(
        { error: '청구서를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 2. HTML 템플릿 생성
    const html = generateInvoiceHtml(payment);

    // 3. Puppeteer로 PDF 생성
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    // 4. PDF 응답
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${params.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    return NextResponse.json(
      { error: 'PDF 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
