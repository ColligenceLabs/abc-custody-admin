import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// API Route를 동적으로 렌더링하도록 설정
export const dynamic = 'force-dynamic';

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

    // 백엔드 API 호출
    const res = await fetch(
      `${API_URL}/api/deposits?userId=${userId}`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch active deposits');
    }

    const data = await res.json();

    // detected 또는 confirming 상태만 필터링
    const activeDeposits = Array.isArray(data)
      ? data.filter((d: any) => d.status === 'detected' || d.status === 'confirming')
      : data.deposits?.filter((d: any) => d.status === 'detected' || d.status === 'confirming') || [];

    return NextResponse.json(activeDeposits);
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
