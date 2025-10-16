import { Metadata } from 'next';
import { LoginForm } from './components/LoginForm';

export const metadata: Metadata = {
  title: '관리자 로그인 | 커스터디 관리 시스템',
  description: '커스터디 서비스 관리자 로그인 페이지',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sapphire-50 to-sapphire-100 dark:from-sapphire-950 dark:to-sapphire-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-sapphire-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            관리자 로그인
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            커스터디 서비스 관리 시스템
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}