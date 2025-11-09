/**
 * SecurityTab 컴포넌트
 * 관리자 보안 설정 탭
 */

'use client';

import { useState } from 'react';
import { AdminUser } from '@/types/admin';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusIcon, XIcon, ShieldCheckIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityTabProps {
  user: AdminUser;
  formData: Partial<AdminUser>;
  onChange: (data: Partial<AdminUser>) => void;
}

export default function SecurityTab({ user, formData, onChange }: SecurityTabProps) {
  const { toast } = useToast();
  const [newIp, setNewIp] = useState('');

  const ipWhitelist = formData.ipWhitelist || [];

  // IP 추가
  const handleAddIp = () => {
    if (!newIp.trim()) return;

    // IP 유효성 검증
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipPattern.test(newIp.trim())) {
      toast({
        variant: 'destructive',
        description: '올바른 IP 주소 형식을 입력하세요.'
      });
      return;
    }

    if (ipWhitelist.includes(newIp.trim())) {
      toast({
        variant: 'destructive',
        description: '이미 추가된 IP 주소입니다.'
      });
      return;
    }

    onChange({
      ...formData,
      ipWhitelist: [...ipWhitelist, newIp.trim()]
    });
    setNewIp('');
  };

  // IP 제거
  const handleRemoveIp = (ip: string) => {
    onChange({
      ...formData,
      ipWhitelist: ipWhitelist.filter(i => i !== ip)
    });
  };

  return (
    <div className="space-y-6">
      {/* 2FA 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-indigo-600" />
            2단계 인증 (2FA)
          </CardTitle>
          <CardDescription>
            계정 보안을 강화하기 위한 2단계 인증 설정
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="twoFactor"
              checked={formData.twoFactorEnabled || false}
              onCheckedChange={(checked) =>
                onChange({ ...formData, twoFactorEnabled: checked as boolean })
              }
            />
            <Label htmlFor="twoFactor" className="font-normal cursor-pointer">
              2단계 인증 활성화
            </Label>
          </div>

          {formData.twoFactorEnabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                2FA 활성화 시 다음 로그인부터 QR 코드 스캔이 필요합니다.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between py-3 border-t border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">현재 상태</p>
              <p className="text-sm text-gray-600">
                {user.twoFactorEnabled ? '활성화됨' : '비활성화됨'}
              </p>
            </div>
            <div>
              {user.twoFactorEnabled ? (
                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-sky-50 text-sky-700 border-sky-200">
                  활성
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-gray-50 text-gray-700 border-gray-200">
                  비활성
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP 화이트리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>IP 화이트리스트</CardTitle>
          <CardDescription>
            특정 IP 주소에서만 접근을 허용합니다. (비어있으면 모든 IP 허용)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="192.168.1.1 또는 10.0.0.0/24"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddIp();
                }
              }}
            />
            <Button type="button" onClick={handleAddIp} variant="outline">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>

          {ipWhitelist.length > 0 ? (
            <div className="space-y-2">
              <Label>허용된 IP 주소</Label>
              {ipWhitelist.map((ip) => (
                <div
                  key={ip}
                  className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
                >
                  <code className="text-sm font-mono text-gray-900">{ip}</code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIp(ip)}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              IP 화이트리스트가 비어있습니다. 모든 IP에서 접근 가능합니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 세션 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>세션 설정</CardTitle>
          <CardDescription>
            로그인 세션 타임아웃 시간을 설정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              min="5"
              max="120"
              value={formData.sessionTimeout || 30}
              onChange={(e) =>
                onChange({ ...formData, sessionTimeout: parseInt(e.target.value) })
              }
            />
            <p className="text-sm text-gray-500">5-120분 사이 설정 가능</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">현재 설정:</span> {user.sessionTimeout}분
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
