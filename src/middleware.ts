import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // UI/UX 기획을 위해 모든 인증 로직 비활성화
  // 모든 경로에 자유롭게 접근 가능
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에 매칭:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 정적 파일들 (png, jpg, jpeg, gif, svg, css, js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|css|js|ico|webp)$).*)'
  ]
}