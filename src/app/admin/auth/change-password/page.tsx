/**
 * 비밀번호 변경 페이지
 * /admin/auth/change-password
 * 최초 로그인 시 임시 비밀번호를 실제 비밀번호로 변경
 */

'use client';

import { useState, useEffect } from 'react';
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
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
import { KeyIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 로그인된 사용자 이메일 자동 설정
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검증
    if (!formData.email || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: '유효성 검증 실패',
        description: '모든 필드를 입력해주세요.'
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        variant: 'destructive',
        title: '유효성 검증 실패',
        description: '새 비밀번호는 최소 8자 이상이어야 합니다.'
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: '유효성 검증 실패',
        description: '새 비밀번호가 일치하지 않습니다.'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/api/admin/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '비밀번호 변경에 실패했습니다.');
      }

      toast({
        title: '비밀번호 변경 완료',
        description: data.requires2FASetup
          ? '2단계 인증을 설정해주세요.'
          : '새 비밀번호로 다시 로그인해주세요.'
      });

      // 2FA 설정이 필요한 경우 (로그인 상태 유지)
      if (data.requires2FASetup) {
        setTimeout(() => {
          router.push('/admin/auth/setup-2fa');
        }, 1000);
        return;
      }

      // 2FA 설정이 필요없는 경우 (로그아웃)
      // 로컬 스토리지 및 쿠키 완전 정리
      localStorage.removeItem('admin-auth');
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-refresh-token');

      // 쿠키 제거
      document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

      // 로그인 페이지로 강제 이동
      setTimeout(() => {
        window.location.href = '/admin/auth/login';
      }, 1000);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <KeyIcon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">비밀번호 변경</CardTitle>
          <CardDescription>
            최초 로그인입니다. 임시 비밀번호를 새 비밀번호로 변경해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500">로그인된 계정입니다.</p>
            </div>

            {/* 현재 비밀번호 (임시 비밀번호) */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호 (임시 비밀번호)</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="temp-password-input"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="임시 비밀번호를 입력하세요"
                  autoComplete="new-password"
                  data-1p-ignore
                  data-lpignore="true"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="최소 8자 이상"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 새 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                비밀번호는 최소 8자 이상이어야 하며, 대문자, 소문자, 숫자를 포함하는 것을 권장합니다.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
