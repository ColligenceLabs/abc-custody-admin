/**
 * 관리자 목록 페이지
 * /admin/system/admins
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUser, AdminRole, AdminUserStatus } from '@/types/admin';
import { getAdminUsers, deleteAdminUser, resetAdminPassword } from '@/services/adminUserApi';
import AdminUserTable from '@/components/admin/system/AdminUserTable';
import { Button } from '@/components/ui/button';
import { PlusIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // 필터 상태
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 삭제 확인 다이얼로그
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null
  });

  // 비밀번호 재설정 결과 다이얼로그
  const [passwordDialog, setPasswordDialog] = useState<{
    open: boolean;
    tempPassword: string | null;
  }>({
    open: false,
    tempPassword: null
  });

  // 관리자 목록 조회
  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true);

      const params: any = {
        page: currentPage,
        limit: 20,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await getAdminUsers(params);

      if (response.success) {
        setUsers(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);
      }
    } catch (error) {
      console.error('관리자 목록 조회 실패:', error);
      toast({
        variant: 'destructive',
        title: '오류',
        description: error instanceof Error ? error.message : '관리자 목록을 불러오는데 실패했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, [currentPage, roleFilter, statusFilter]);

  // 검색은 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchAdminUsers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 수정 핸들러
  const handleEdit = (userId: string) => {
    router.push(`/admin/system/admins/${userId}`);
  };

  // 삭제 핸들러
  const handleDeleteClick = (userId: string) => {
    setDeleteDialog({ open: true, userId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.userId) return;

    try {
      await deleteAdminUser(deleteDialog.userId);

      toast({
        description: '관리자가 삭제되었습니다.'
      });

      // 목록 새로고침
      fetchAdminUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error instanceof Error ? error.message : '관리자 삭제에 실패했습니다.'
      });
    } finally {
      setDeleteDialog({ open: false, userId: null });
    }
  };

  // 비밀번호 재설정 핸들러
  const handleResetPassword = async (userId: string) => {
    try {
      const response = await resetAdminPassword(userId);

      if (response.success) {
        setPasswordDialog({
          open: true,
          tempPassword: response.data.tempPassword
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error instanceof Error ? error.message : '비밀번호 재설정에 실패했습니다.'
      });
    }
  };

  // 임시 비밀번호 복사
  const handleCopyPassword = async () => {
    if (passwordDialog.tempPassword) {
      try {
        await navigator.clipboard.writeText(passwordDialog.tempPassword);
        toast({
          description: '임시 비밀번호가 복사되었습니다.'
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          description: '복사에 실패했습니다.'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 계정</h1>
          <p className="text-gray-600 mt-1">시스템 관리자 계정 목록 및 관리</p>
        </div>
        <Button
          onClick={() => router.push('/admin/system/admins/new')}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          새 관리자 추가
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="이름 또는 이메일 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="역할 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 역할</SelectItem>
              <SelectItem value="super_admin">슈퍼 관리자</SelectItem>
              <SelectItem value="operations">운영팀</SelectItem>
              <SelectItem value="compliance">컴플라이언스</SelectItem>
              <SelectItem value="support">고객지원</SelectItem>
              <SelectItem value="viewer">조회자</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="pending">대기</SelectItem>
              <SelectItem value="suspended">정지</SelectItem>
              <SelectItem value="inactive">비활성</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <AdminUserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onResetPassword={handleResetPassword}
          isLoading={isLoading}
        />

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                총 {totalItems}명 중 {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalItems)}명 표시
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <span className="text-sm text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, userId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>관리자 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 관리자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 임시 비밀번호 표시 다이얼로그 */}
      <AlertDialog open={passwordDialog.open} onOpenChange={(open) => setPasswordDialog({ open, tempPassword: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>비밀번호 재설정 완료</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                <p>임시 비밀번호가 생성되었습니다. 관리자에게 전달해주세요.</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">임시 비밀번호</div>
                  <code className="text-lg font-mono text-indigo-600 break-all">
                    {passwordDialog.tempPassword}
                  </code>
                </div>
                <p className="text-sm text-gray-600">
                  관리자는 최초 로그인 시 비밀번호 변경이 필요합니다.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={handleCopyPassword} variant="outline">
              복사
            </Button>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
