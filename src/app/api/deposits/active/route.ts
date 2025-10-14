import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * 진행 중인 입금 조회 API
 * status가 detected 또는 confirming인 입금만 반환
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // json-server에서 여러 status 필터링은 OR 조건으로 동작
    // status=detected&status=confirming 형태로 조회
    const res = await fetch(
      `${API_URL}/deposits?userId=${userId}&status=detected&status=confirming&_sort=detectedAt&_order=desc`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch active deposits');
    }

    const deposits = await res.json();

    return NextResponse.json(deposits);
  } catch (error) {
    console.error('진행 중인 입금 조회 오류:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
