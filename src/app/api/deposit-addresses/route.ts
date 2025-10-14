import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
      `${API_URL}/depositAddresses?userId=${userId}&isActive=true&_sort=addedAt&_order=desc`
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
 * 새로운 입금 주소 등록
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      label,
      coin,
      network,
      address,
      privateKey,
      type = 'personal',
      contractAddress = null,
      priceKRW,
      priceUSD,
    } = body;

    // 필수 필드 검증
    if (!userId || !label || !coin || !network || !address) {
      return NextResponse.json(
        { error: 'Required fields: userId, label, coin, network, address' },
        { status: 400 }
      );
    }

    // 중복 주소 확인
    const existingRes = await fetch(
      `${API_URL}/depositAddresses?userId=${userId}&address=${address}`
    );
    const existing = await existingRes.json();

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Address already exists' },
        { status: 409 }
      );
    }

    // 새 입금 주소 생성
    const newDepositAddress: DepositAddress = {
      id: `dep_addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      label,
      coin,
      network,
      address,
      privateKey,
      type,
      isActive: true,
      addedAt: new Date().toISOString(),
      contractAddress,
      priceKRW,
      priceUSD,
    };

    // DB에 저장
    const res = await fetch(`${API_URL}/depositAddresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDepositAddress),
    });

    if (!res.ok) {
      throw new Error('Failed to create deposit address');
    }

    const depositAddress = await res.json();

    return NextResponse.json({
      success: true,
      depositAddress,
    });
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
