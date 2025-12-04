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
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <img
              src="/logo/ABCcw_logo_symbol.png"
              alt="ABC Logo"
              className="h-10 w-10 object-contain"
            />
            <img
              src="/logo/ABCcw_logo_text.png"
              alt="ABC Custody Wallet"
              className="h-6 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            커스터디 서비스 관리 시스템
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}