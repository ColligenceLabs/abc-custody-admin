"use client";

import { useState } from "react";
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  KeyIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  User,
  UserRole,
  UserStatus,
  ROLE_NAMES,
} from "@/types/user";
import { MOCK_USERS } from "@/data/userMockData";
import { Modal } from "@/components/common/Modal";
import {
  formatUserDisplay,
  getRoleName,
  getStatusName,
  searchUsers,
  getUserStatsByRole,
} from "@/utils/userHelpers";
import {
  getRoleColor
} from "@/utils/permissionUtils";
import PermissionPreview from "@/components/user/PermissionPreview";
import PermissionHistory from "@/components/user/PermissionHistory";
import { PermissionChangeLog } from "@/types/permission";
import { useCompany } from "@/contexts/CompanyContext";
import { EmailValidationResult } from "@/types/company";
import { validateEmailDomain } from "@/utils/emailValidation";

interface UserManagementProps {
  plan: ServicePlan;
}

export default function UserManagement({ plan }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<UserRole | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessageData, setSuccessMessageData] = useState<{
    name: string;
    email: string;
    type: "add" | "edit" | "deactivate";
  } | null>(null);

  // 이메일 검증 상태
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>({ valid: true });

  // 새 사용자 생성 폼 데이터
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "viewer" as UserRole,
    department: "",
    position: "",
  });


  // Mock 권한 변경 이력
  const [permissionLogs] = useState<PermissionChangeLog[]>([
    {
      id: "log1",
      userId: "2",
      changedBy: "관리자",
      changeType: "role_change",
      oldValue: "operator",
      newValue: "manager",
      reason: "팀장 승진",
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "log2",
      userId: "2",
      changedBy: "관리자",
      changeType: "permission_add",
      newValue: "사용자 관리 권한",
      reason: "업무 범위 확대",
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ]);

  const { t, language } = useLanguage();
  const { companySettings } = useCompany();

  const getStatusColor = (status: UserStatus) => {
    const colors = {
      active: "text-sky-600 bg-sky-50",
      inactive: "text-gray-600 bg-gray-50",
      pending: "text-yellow-600 bg-yellow-50",
    };
    return colors[status];
  };

  const formatDate = (timestamp: string) => {
    return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesSearch =
      searchUsers(searchTerm, [user]).length > 0 || searchTerm === "";
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (role: UserRole) => {
    setNewUser(prev => ({
      ...prev,
      role
    }));
  };

  // 이메일 변경 시 실시간 검증
  const handleEmailChange = (email: string) => {
    setNewUser(prev => ({ ...prev, email }));

    if (email.trim()) {
      const validation = validateEmailDomain(
        email,
        companySettings?.allowedEmailDomains || [],
        companySettings?.isEmailDomainRequired || false
      );
      setEmailValidation(validation);
    } else {
      setEmailValidation({ valid: true });
    }
  };

  const handleAddUser = async () => {
    // 이메일 검증 확인
    if (!emailValidation.valid) {
      alert(emailValidation.message || "이메일 주소를 확인해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 실제로는 API 호출
      console.log("Adding user:", newUser);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccessMessageData({
        name: newUser.name,
        email: newUser.email,
        type: "add",
      });
      setShowAddModal(false);
      setShowSuccessMessage(true);

      // 폼 리셋
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "viewer",
        department: "",
        position: "",
      });
      setEmailValidation({ valid: true });

      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessageData(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to add user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser({
      ...user,
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      // 실제로는 API 호출 - 기본 정보와 권한 모두 저장
      console.log('Updating user with permissions:', editingUser);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock: 사용자 목록 업데이트
      const updatedUser = {
        ...editingUser,
        updatedAt: new Date().toISOString()
      };

      setSuccessMessageData({
        name: editingUser.name,
        email: editingUser.email,
        type: 'edit',
      });
      setShowEditModal(false);
      setEditingUser(null);
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessageData(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleShowHistory = (user: User) => {
    setEditingUser(user);
    setShowHistoryModal(true);
  };

  const handleDeactivateUser = (user: User) => {
    // 이미 비활성 상태인 사용자는 처리하지 않음
    if (user.status === 'inactive') {
      return;
    }
    setDeactivatingUser(user);
    setShowDeactivateModal(true);
  };

  const confirmDeactivate = async () => {
    if (!deactivatingUser) return;

    setIsSubmitting(true);
    try {
      console.log("Deactivating user:", deactivatingUser.id);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock: 사용자 상태를 비활성으로 변경
      const updatedUser = {
        ...deactivatingUser,
        status: 'inactive' as UserStatus,
        updatedAt: new Date().toISOString()
      };

      setSuccessMessageData({
        name: deactivatingUser.name,
        email: deactivatingUser.email,
        type: "deactivate",
      });
      setShowDeactivateModal(false);
      setDeactivatingUser(null);
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
        setSuccessMessageData(null);
      }, 5000);
    } catch (error) {
      console.error("Failed to deactivate user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userStats = getUserStatsByRole();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UsersIcon className="w-8 h-8 text-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
            <p className="text-sm text-gray-600">사용자 계정 및 권한 관리</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          사용자 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(userStats).map(([role, count]) => (
          <div key={role} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${getRoleColor(role as UserRole)}`}>
                <UsersIcon className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {ROLE_NAMES[role as UserRole]}
                </p>
                <p className="text-lg font-semibold text-gray-900">{count}명</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | "all")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="all">모든 역할</option>
              {Object.entries(ROLE_NAMES).map(([role, name]) => (
                <option key={role} value={role}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  역할
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  최근 로그인
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 ${
                    user.status === 'inactive' ? 'opacity-60 bg-gray-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {ROLE_NAMES[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusName(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? formatDate(user.lastLogin) : "로그인 기록 없음"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="사용자 정보 및 권한 수정"
                        disabled={user.status === 'inactive'}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShowHistory(user)}
                        className="text-gray-600 hover:text-gray-900"
                        title="권한 변경 이력"
                      >
                        <ClockIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivateUser(user)}
                        className={`${
                          user.status === 'inactive'
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-900'
                        }`}
                        title={user.status === 'inactive' ? '비활성화된 사용자' : '사용자 비활성화'}
                        disabled={user.status === 'inactive'}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 사용자 추가 모달 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      >
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">새 사용자 추가</h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 *
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                placeholder="홍길동"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 *
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-sky-500 ${
                  !emailValidation.valid
                    ? "border-red-300 focus:border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-sky-500"
                }`}
                placeholder="hong@company.com"
              />
              {!emailValidation.valid && emailValidation.message && (
                <p className="mt-1 text-sm text-red-600">
                  {emailValidation.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호 *
              </label>
              <input
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                placeholder="010-1234-5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                부서
              </label>
              <input
                type="text"
                value={newUser.department}
                onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                placeholder="재무팀"
              />
            </div>
          </div>

          {/* 역할 선택 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">역할 선택</h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(ROLE_NAMES) as UserRole[]).map((role) => (
                <label
                  key={role}
                  className={`
                    relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
                    ${newUser.role === role
                      ? `${getRoleColor(role)} border-current`
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={newUser.role === role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{ROLE_NAMES[role]}</div>
                    <div className="text-sm opacity-75 mt-1">
                      {role === 'admin' && '시스템 전체 관리'}
                      {role === 'manager' && '정책 설정, 사용자 관리, 승인'}
                      {role === 'operator' && '일반 거래 처리'}
                      {role === 'viewer' && '데이터 조회, 리포트 확인'}
                    </div>
                  </div>
                  {newUser.role === role && (
                    <CheckIcon className="w-5 h-5 text-current flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* 권한 미리보기 */}
          <PermissionPreview role={newUser.role} />

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAddUser}
                disabled={
                  isSubmitting ||
                  !newUser.name ||
                  !newUser.email ||
                  !newUser.phone ||
                  !emailValidation.valid
                }
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
              >
                {isSubmitting ? "생성 중..." : "사용자 생성"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 사용자 수정 모달 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      >
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">사용자 정보 및 권한 수정</h3>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {editingUser && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 기본 정보 섹션 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">기본 정보</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이름 *
                    </label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                      placeholder="홍길동"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                      placeholder="hong@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호 *
                    </label>
                    <input
                      type="tel"
                      value={editingUser.phone || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                      placeholder="010-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      부서
                    </label>
                    <input
                      type="text"
                      value={editingUser.department || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, department: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                      placeholder="재무팀"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      직책
                    </label>
                    <input
                      type="text"
                      value={editingUser.position || ''}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, position: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                      placeholder="대리"
                    />
                  </div>
                </div>
              </div>

              {/* 역할 선택 섹션 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">역할 선택</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(ROLE_NAMES) as UserRole[]).map((role) => (
                    <label
                      key={role}
                      className={`
                        relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${editingUser.role === role
                          ? `${getRoleColor(role)} border-current`
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="editRole"
                        value={role}
                        checked={editingUser.role === role}
                        onChange={(e) => setEditingUser(prev => prev ? { ...prev, role: e.target.value as UserRole } : null)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{ROLE_NAMES[role]}</div>
                        <div className="text-sm opacity-75 mt-1">
                          {role === 'admin' && '시스템 전체 관리'}
                          {role === 'manager' && '정책 설정, 사용자 관리, 승인'}
                          {role === 'operator' && '일반 거래 처리'}
                          {role === 'viewer' && '데이터 조회, 리포트 확인'}
                        </div>
                      </div>
                      {editingUser.role === role && (
                        <CheckIcon className="w-5 h-5 text-current flex-shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* 권한 미리보기 */}
              <PermissionPreview role={editingUser.role} />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={isSubmitting || !editingUser.name || !editingUser.email}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
                >
                  {isSubmitting ? "저장 중..." : "사용자 수정"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>


      {/* 권한 변경 이력 모달 */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      >
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {editingUser?.name} 권한 변경 이력
            </h3>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <PermissionHistory
              logs={permissionLogs.filter(log => log.userId === editingUser?.id)}
            />
          </div>
        </div>
      </Modal>

      {/* 사용자 비활성화 확인 모달 */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
      >
        <div className="bg-white rounded-lg max-w-md w-full mx-4">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">사용자 비활성화</h3>
            <button
              onClick={() => setShowDeactivateModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {deactivatingUser && (
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrashIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    정말로 이 사용자를 비활성화하시겠습니까?
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {deactivatingUser.name} ({deactivatingUser.email})
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">
                      주의사항
                    </h3>
                    <div className="text-sm text-gray-700 mt-1">
                      <ul className="list-disc list-inside space-y-1">
                        <li>비활성화된 사용자는 시스템에 로그인할 수 없습니다</li>
                        <li>모든 권한이 제거되며 진행 중인 작업이 중단됩니다</li>
                        <li>비활성화 후에는 다시 활성화할 수 없습니다</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={confirmDeactivate}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  {isSubmitting ? "비활성화 중..." : "비활성화"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 성공 메시지 */}
      {showSuccessMessage && successMessageData && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end">
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg pointer-events-auto">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 text-sky-600">✓</div>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {successMessageData.type === "add" && "사용자가 추가되었습니다"}
                    {successMessageData.type === "edit" && "사용자 정보 및 권한이 수정되었습니다"}
                    {successMessageData.type === "deactivate" && "사용자가 비활성화되었습니다"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {successMessageData.name} ({successMessageData.email})
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}