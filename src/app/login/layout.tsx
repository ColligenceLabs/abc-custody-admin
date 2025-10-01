import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ABC Custody - 로그인',
  description: '커스터디 서비스 관리자 로그인',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}