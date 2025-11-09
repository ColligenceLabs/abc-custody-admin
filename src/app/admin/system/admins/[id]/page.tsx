/**
 * 관리자 상세/수정 페이지
 * /admin/system/admins/[id]
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUser } from '@/types/admin';
import { getAdminUserById, updateAdminUser } from '@/services/adminUserApi';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BasicInfoTab from '@/components/admin/system/BasicInfoTab';
import SecurityTab from '@/components/admin/system/SecurityTab';

interface AdminUserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [userId, setUserId] = useState<string>('');

  // 수정된 데이터
  const [formData, setFormData] = useState<Partial<AdminUser>>({});

  // params 언래핑
  useEffect(() => {
    params.then(p => setUserId(p.id));
  }, [params]);

  // 관리자 상세 정보 조회
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await getAdminUserById(userId);

        if (response.success) {
          setUser(response.data.user);
          setFormData(response.data.user);
        }
      } catch (error) {
        console.error('관리자 상세 조회 실패:', error);
        toast({
          variant: 'destructive',
          title: '오류',
          description: error instanceof Error ? error.message : '관리자 정보를 불러오는데 실패했습니다.'
        });
        router.push('/admin/system/admins');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // 저장 핸들러
  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      const updateData: any = {};

      // 변경된 필드만 전송
      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.role !== user.role) updateData.role = formData.role;
      if (formData.status !== user.status) updateData.status = formData.status;
      if (formData.twoFactorEnabled !== user.twoFactorEnabled) {
        updateData.twoFactorEnabled = formData.twoFactorEnabled;
      }
      if (JSON.stringify(formData.ipWhitelist) !== JSON.stringify(user.ipWhitelist)) {
        updateData.ipWhitelist = formData.ipWhitelist;
      }
      if (formData.sessionTimeout !== user.sessionTimeout) {
        updateData.sessionTimeout = formData.sessionTimeout;
      }
      if (formData.notes !== user.notes) updateData.notes = formData.notes;

      if (Object.keys(updateData).length === 0) {
        toast({
          description: '변경사항이 없습니다.'
        });
        return;
      }

      const response = await updateAdminUser(userId, updateData);

      if (response.success) {
        setUser(response.data);
        setFormData(response.data);

        toast({
          title: '저장 완료',
          description: '관리자 정보가 업데이트되었습니다.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error instanceof Error ? error.message : '저장에 실패했습니다.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">관리자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          {isSaving ? '저장 중...' : '변경사항 저장'}
        </Button>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">기본 정보</TabsTrigger>
          <TabsTrigger value="security">보안 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoTab
            user={user}
            formData={formData}
            onChange={setFormData}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityTab
            user={user}
            formData={formData}
            onChange={setFormData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
