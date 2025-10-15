import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * DELETE /api/deposit-addresses/[id]
 * 입금 주소 삭제 (soft delete - isActive를 false로 변경)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // JWT 토큰 가져오기
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // 입금 주소 존재 확인
    const checkRes = await fetch(`${API_URL}/api/depositAddresses/${id}`);
    if (!checkRes.ok) {
      return NextResponse.json(
        { error: 'Deposit address not found' },
        { status: 404 }
      );
    }

    // Soft delete: isActive를 false로 업데이트
    const res = await fetch(`${API_URL}/api/depositAddresses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        isActive: false,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to delete deposit address');
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('입금 주소 삭제 실패:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
