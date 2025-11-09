/**
 * BasicInfoTab 컴포넌트
 * 관리자 기본 정보 탭
 */

'use client';

import { AdminUser, AdminRole, AdminUserStatus } from '@/types/admin';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import RoleBadge from './RoleBadge';
import AdminStatusBadge from './AdminStatusBadge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface BasicInfoTabProps {
  user: AdminUser;
  formData: Partial<AdminUser>;
  onChange: (data: Partial<AdminUser>) => void;
}

export default function BasicInfoTab({ user, formData, onChange }: BasicInfoTabProps) {
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'yyyy-MM-dd HH:mm:ss', { locale: ko });
    } catch {
      return '-';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
        <CardDescription>관리자의 기본 정보를 수정합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 이메일 (읽기 전용) */}
        <div className="space-y-2">
          <Label>이메일</Label>
          <Input
            type="email"
            value={user.email}
            disabled
            className="bg-gray-50"
          />
          <p className="text-sm text-gray-500">이메일은 변경할 수 없습니다.</p>
        </div>

        {/* 이름 */}
        <div className="space-y-2">
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            type="text"
            value={formData.name || ''}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            placeholder="관리자 이름"
          />
        </div>

        {/* 역할 */}
        <div className="space-y-2">
          <Label htmlFor="role">역할</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => onChange({ ...formData, role: value as AdminRole })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="super_admin">슈퍼 관리자</SelectItem>
              <SelectItem value="operations">운영팀</SelectItem>
              <SelectItem value="compliance">컴플라이언스</SelectItem>
              <SelectItem value="support">고객지원</SelectItem>
              <SelectItem value="viewer">조회자</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-gray-600">현재 역할:</span>
            <RoleBadge role={user.role} size="sm" />
          </div>
        </div>

        {/* 상태 */}
        <div className="space-y-2">
          <Label htmlFor="status">상태</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => onChange({ ...formData, status: value as AdminUserStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="pending">대기</SelectItem>
              <SelectItem value="suspended">정지</SelectItem>
              <SelectItem value="inactive">비활성</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-gray-600">현재 상태:</span>
            <AdminStatusBadge status={user.status} size="sm" />
          </div>
        </div>

        {/* 계정 정보 (읽기 전용) */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <Label className="text-gray-600">마지막 로그인</Label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {formatDate(user.lastLogin)}
            </p>
          </div>
          <div>
            <Label className="text-gray-600">계정 생성일</Label>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* 비고 */}
        <div className="space-y-2">
          <Label htmlFor="notes">비고</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => onChange({ ...formData, notes: e.target.value })}
            placeholder="관리자에 대한 추가 정보"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
