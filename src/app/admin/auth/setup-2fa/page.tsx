/**
 * 2FA 설정 페이지
 * /admin/auth/setup-2fa
 * Google Authenticator QR 코드 스캔 및 활성화
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShieldCheckIcon, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Setup2FAPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, logout } = useAdminAuth();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // QR 코드 생성
  useEffect(() => {
    const setupQRCode = async () => {
      let emailToUse = user?.email;

      // 로그인 중 2FA 설정인 경우 임시 정보 사용
      if (!emailToUse) {
        const tempData = localStorage.getItem('temp-2fa-setup');
        if (tempData) {
          const parsed = JSON.parse(tempData);
          emailToUse = parsed.user?.email;
        }
      }

      if (!emailToUse) {
        router.push('/admin/auth/login');
        return;
      }

      try {
        setIsLoading(true);

        const response = await fetch(`${API_URL}/api/admin/auth/setup-2fa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: emailToUse }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || '2FA 설정 초기화에 실패했습니다.');
        }

        setQrCodeDataUrl(data.data.qrCodeDataUrl);
        setSecret(data.data.secret);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '오류',
          description: error instanceof Error ? error.message : '2FA 설정 초기화에 실패했습니다.'
        });
        router.push('/admin/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    setupQRCode();
  }, [user]);

  // 6자리 코드 검증 및 활성화
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      toast({
        variant: 'destructive',
        description: '6자리 인증 코드를 입력하세요.'
      });
      return;
    }

    try {
      setIsVerifying(true);

      let emailToUse = user?.email;

      // 임시 정보 확인
      if (!emailToUse) {
        const tempData = localStorage.getItem('temp-2fa-setup');
        if (tempData) {
          const parsed = JSON.parse(tempData);
          emailToUse = parsed.user?.email;
        }
      }

      const response = await fetch(`${API_URL}/api/admin/auth/verify-2fa-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailToUse,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '코드 검증에 실패했습니다.');
      }

      toast({
        title: '2FA 활성화 완료',
        description: '2단계 인증이 활성화되었습니다. 다시 로그인해주세요.'
      });

      // 임시 정보 삭제
      localStorage.removeItem('temp-2fa-setup');

      // 로그아웃 후 재로그인
      setTimeout(async () => {
        if (user) {
          await logout();
        } else {
          // 로그인 페이지로 이동
          window.location.href = '/admin/auth/login';
        }
      }, 1500);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error instanceof Error ? error.message : '코드 검증에 실패했습니다.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // 나중에 설정
  const handleSkip = () => {
    router.push('/admin/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">2FA 설정을 준비하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">2단계 인증 설정</CardTitle>
          <CardDescription>
            Google Authenticator 앱으로 QR 코드를 스캔하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR 코드 */}
          <div className="flex flex-col items-center space-y-4">
            {qrCodeDataUrl && (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <img
                  src={qrCodeDataUrl}
                  alt="2FA QR Code"
                  className="w-64 h-64"
                />
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Secret Key (수동 입력용)</p>
              <code className="text-sm font-mono bg-gray-100 px-3 py-2 rounded border border-gray-200">
                {secret}
              </code>
            </div>
          </div>

          {/* 설정 방법 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start">
              <Smartphone className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">설정 방법:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Google Authenticator 앱을 다운로드하세요</li>
                  <li>앱에서 + 버튼을 눌러 QR 코드를 스캔하세요</li>
                  <li>앱에 표시된 6자리 코드를 아래에 입력하세요</li>
                </ol>
              </div>
            </div>
          </div>

          {/* 인증 코드 입력 */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">인증 코드 (6자리)</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                autoComplete="off"
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
                disabled={isVerifying}
              >
                나중에 설정
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={isVerifying || verificationCode.length !== 6}
              >
                {isVerifying ? '검증 중...' : '활성화'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
