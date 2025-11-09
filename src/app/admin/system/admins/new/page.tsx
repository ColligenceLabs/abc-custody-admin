/**
 * 관리자 생성 페이지
 * /admin/system/admins/new
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRole } from '@/types/admin';
import { createAdminUser } from '@/services/adminUserApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeftIcon, PlusIcon, XIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NewAdminUserPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '' as AdminRole | '',
    twoFactorRequired: false,
    sessionTimeout: 30,
    notes: ''
  });

  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);
  const [newIp, setNewIp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // IP 추가
  const handleAddIp = () => {
    if (!newIp.trim()) return;

    // 간단한 IP 유효성 검증
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipPattern.test(newIp.trim())) {
      toast({
        variant: 'destructive',
        description: '올바른 IP 주소 형식을 입력하세요. (예: 192.168.1.1 또는 10.0.0.0/24)'
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

    setIpWhitelist([...ipWhitelist, newIp.trim()]);
    setNewIp('');
  };

  // IP 제거
  const handleRemoveIp = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter(i => i !== ip));
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name || !formData.role) {
      toast({
        variant: 'destructive',
        title: '유효성 검증 실패',
        description: '이메일, 이름, 역할은 필수 항목입니다.'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createAdminUser({
        email: formData.email,
        name: formData.name,
        role: formData.role as AdminRole,
        twoFactorRequired: formData.twoFactorRequired,
        ipWhitelist: ipWhitelist.length > 0 ? ipWhitelist : undefined,
        sessionTimeout: formData.sessionTimeout,
        notes: formData.notes || undefined
      });

      if (response.success) {
        // 임시 비밀번호 표시
        setTempPassword(response.data.tempPassword);

        toast({
          title: '관리자 생성 완료',
          description: `${formData.name} 관리자가 생성되었습니다.`
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error instanceof Error ? error.message : '관리자 생성에 실패했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 임시 비밀번호가 표시된 경우
  if (tempPassword) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>관리자 생성 완료</CardTitle>
            <CardDescription>
              임시 비밀번호를 안전하게 관리자에게 전달해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <div className="text-sm text-gray-600 mb-2">임시 비밀번호</div>
              <code className="text-2xl font-mono font-bold text-indigo-600 break-all block">
                {tempPassword}
              </code>
              <p className="text-sm text-gray-600 mt-4">
                관리자가 최초 로그인 시 비밀번호 변경이 필요합니다.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(tempPassword);
                    toast({ description: '비밀번호가 복사되었습니다.' });
                  } catch {
                    toast({ variant: 'destructive', description: '복사에 실패했습니다.' });
                  }
                }}
                variant="outline"
                className="flex-1"
              >
                비밀번호 복사
              </Button>
              <Button
                onClick={() => router.push('/admin/system/admins')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                목록으로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">새 관리자 추가</h1>
        <p className="text-gray-600 mt-1">새로운 관리자 계정을 생성합니다.</p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email">
                이메일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@custody.com"
                required
              />
            </div>

            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="관리자 이름"
                required
              />
            </div>

            {/* 역할 */}
            <div className="space-y-2">
              <Label htmlFor="role">
                역할 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as AdminRole })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="역할을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">슈퍼 관리자</SelectItem>
                  <SelectItem value="operations">운영팀</SelectItem>
                  <SelectItem value="compliance">컴플라이언스</SelectItem>
                  <SelectItem value="support">고객지원</SelectItem>
                  <SelectItem value="viewer">조회자</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                선택한 역할에 따라 기본 권한이 부여됩니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>보안 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 2FA */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="twoFactor"
                checked={formData.twoFactorRequired}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, twoFactorRequired: checked as boolean })
                }
              />
              <Label htmlFor="twoFactor" className="font-normal cursor-pointer">
                2단계 인증 활성화 (최초 로그인 시 QR 코드 제공)
              </Label>
            </div>

            {/* 세션 타임아웃 */}
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="120"
                value={formData.sessionTimeout}
                onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })}
              />
              <p className="text-sm text-gray-500">5-120분 사이 설정 가능</p>
            </div>

            {/* IP 화이트리스트 */}
            <div className="space-y-2">
              <Label>IP 화이트리스트 (선택)</Label>
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

              {ipWhitelist.length > 0 && (
                <div className="mt-3 space-y-2">
                  {ipWhitelist.map((ip) => (
                    <div
                      key={ip}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                    >
                      <code className="text-sm font-mono">{ip}</code>
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
              )}
            </div>

            {/* 비고 */}
            <div className="space-y-2">
              <Label htmlFor="notes">비고</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="관리자에 대한 추가 정보를 입력하세요."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? '생성 중...' : '관리자 생성'}
          </Button>
        </div>
      </form>
    </div>
  );
}
