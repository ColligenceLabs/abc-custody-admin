import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 서버 환경 변수에서 직접 읽기 (NEXT_PUBLIC_ 접두사 없이)
    const customer_id = Number(process.env.EKYC_CUSTOMER_ID) || 0
    const id = process.env.EKYC_CLIENT_ID || ''
    const key = process.env.EKYC_CLIENT_SECRET || ''
    console.log('>>>>>>>>>', id, key)

    if (!customer_id || !id || !key) {
      console.error('eKYC 환경 변수가 설정되지 않았습니다.')
      return NextResponse.json(
        { error: 'eKYC 환경 변수가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    console.log('=== eKYC API 요청 ===')
    console.log('customer_id:', customer_id)
    console.log('id:', id)
    console.log('key:', key ? '***' + key.slice(-3) : 'empty')

    // useB eKYC API에 Access Token 요청 (Credential 방식)
    const response = await fetch('https://kyc-api.useb.co.kr/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id,
        id,
        key,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('=== eKYC API 실패 ===')
      console.error('Status:', response.status)
      console.error('Response:', errorText)
      return NextResponse.json(
        { error: 'Access Token 발급 실패', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('=== eKYC API 성공 ===')
    console.log('Token:', data.token ? '***' + data.token.slice(-10) : 'empty')
    console.log('Expire:', data.expire)
    console.log('Role:', data.role)

    // 성공 응답
    return NextResponse.json({
      token: data.token,
      expire: data.expire,
      role: data.role,
    })
  } catch (error) {
    console.error('Access Token 발급 오류:', error)
    return NextResponse.json(
      { error: 'Access Token 발급 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
