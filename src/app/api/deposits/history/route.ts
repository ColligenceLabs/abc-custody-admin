import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * 입금 히스토리 조회 API
 * status가 confirmed 또는 credited인 입금 반환 (페이지네이션 지원)
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

    // json-server 페이지네이션: _page, _limit
    // 정렬: _sort, _order
    const res = await fetch(
      `${API_URL}/deposits?userId=${userId}&status=confirmed&status=credited&_sort=confirmedAt&_order=desc&_page=${page}&_limit=${limit}`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch deposit history');
    }

    const deposits = await res.json();

    // json-server는 Link 헤더로 페이지네이션 정보 제공
    const totalCount = res.headers.get('X-Total-Count');

    return NextResponse.json({
      deposits,
      pagination: {
        page,
        limit,
        totalCount: totalCount ? parseInt(totalCount) : deposits.length,
        totalPages: totalCount ? Math.ceil(parseInt(totalCount) / limit) : 1,
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
