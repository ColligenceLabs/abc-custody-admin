import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// API Route를 동적으로 렌더링하도록 설정
export const dynamic = 'force-dynamic';

/**
 * 입금 히스토리 조회 API
 * status가 confirmed 또는 credited인 입금 반환 (페이지네이션 지원)
 * senderVerified 값으로 자산 반환 여부 판단
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // 백엔드 API 호출
    const res = await fetch(
      `${API_URL}/api/deposits?userId=${userId}&page=${page}&limit=${limit}`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch deposit history');
    }

    const data = await res.json();

    // 백엔드에서 페이지네이션 정보를 포함한 응답 반환
    // confirmed 또는 credited 상태만 필터링
    const filteredDeposits = Array.isArray(data)
      ? data.filter((d: any) => d.status === 'confirmed' || d.status === 'credited')
      : data.deposits?.filter((d: any) => d.status === 'confirmed' || d.status === 'credited') || [];

    return NextResponse.json({
      deposits: filteredDeposits,
      pagination: data.pagination || {
        page,
        limit,
        totalCount: filteredDeposits.length,
        totalPages: Math.ceil(filteredDeposits.length / limit),
      },
    });
  } catch (error) {
    console.error('입금 히스토리 조회 오류:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
