import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface DepositAddress {
  id: string;
  userId: string;
  label: string;
  coin: string;
  network: string;
  address: string;
  privateKey?: string;
  type: 'personal' | 'vasp';
  isActive: boolean;
  addedAt: string;
  contractAddress?: string | null;
  priceKRW?: number;
  priceUSD?: number;
}

/**
 * GET /api/deposit-addresses
 * 사용자의 입금 주소 목록 조회
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

    const res = await fetch(
      `${API_URL}/api/depositAddresses?userId=${userId}&isActive=true`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch deposit addresses');
    }

    const depositAddresses = await res.json();
    return NextResponse.json({ depositAddresses });
  } catch (error) {
    console.error('입금 주소 조회 실패:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deposit-addresses
 * 새로운 입금 주소 등록 (백엔드에서 지갑 생성)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      label,
      coin,
      network,
      type = 'personal',
      contractAddress = null,
      priceKRW,
      priceUSD,
    } = body;

    // 필수 필드 검증
    if (!userId || !coin || !network) {
      return NextResponse.json(
        { error: 'Required fields: userId, coin, network' },
        { status: 400 }
      );
    }

    // JWT 토큰 가져오기
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // 백엔드로 요청 (백엔드에서 지갑 생성 및 중복 검증)
    const res = await fetch(`${API_URL}/api/depositAddresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        userId,
        label,
        coin,
        network,
        type,
        contractAddress,
        priceKRW,
        priceUSD,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        {
          error: errorData.error || 'Failed to create deposit address',
          message: errorData.message,
        },
        { status: res.status }
      );
    }

    const depositAddress = await res.json();

    return NextResponse.json(depositAddress);
  } catch (error) {
    console.error('입금 주소 등록 실패:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
