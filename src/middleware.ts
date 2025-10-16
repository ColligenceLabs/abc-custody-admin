import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 공개 경로 (인증 불필요)
  const publicPaths = ['/login', '/signup', '/login/blocked']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  if (isPublicPath) {
    return NextResponse.next()
  }

  // 세션 확인 (cookie 또는 localStorage에서 확인되지만, middleware는 서버 사이드이므로 cookie만 확인)
  const authSession = request.cookies.get('auth_session')

  if (!authSession) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 세션 유효성 검증 (활동 기반 타임아웃)
  try {
    const sessionData = JSON.parse(decodeURIComponent(authSession.value))
    // 기본 타임아웃: 20분 (SecurityPolicyContext와 동기화)
    // AuthContext에서 사용자 활동 시 timestamp가 자동 갱신됨
    const sessionTimeout = 20 * 60 * 1000 // 20분 (활동 기반)

    if (Date.now() - sessionData.timestamp > sessionTimeout) {
      // 세션 만료 (마지막 활동으로부터 20분 경과)
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth_session')
      return response
    }
  } catch (error) {
    // 세션 파싱 실패
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_session')
    return response
  }

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