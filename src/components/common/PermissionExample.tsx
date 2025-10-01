'use client';

import { usePermission } from '@/hooks/usePermission';
import { PermissionDeniedModal } from './PermissionDeniedModal';
import { ShieldCheckIcon, UserPlusIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';

/**
 * 권한 체크 모달 사용 예시 컴포넌트
 * 이 컴포넌트는 권한 체크 기능의 사용법을 보여주는 예시입니다.
 */
export function PermissionExample() {
  const {
    handleWithPermission,
    isPermissionDeniedModalOpen,
    deniedPermissions,
    deniedRole,
    deniedMessage,
    closePermissionDeniedModal,
    showPermissionDeniedModal,
    user,
  } = usePermission();

  // 사용자 생성 기능 (매니저 이상 권한 필요)
  const handleCreateUser = handleWithPermission(
    () => {
      alert('사용자 생성 기능이 실행됩니다!');
    },
    {
      requiredPermissions: ['permission.users.create'],
      requiredRole: 'manager'
    }
  );

  // 시스템 설정 기능 (관리자 권한 필요)
  const handleSystemSettings = handleWithPermission(
    () => {
      alert('시스템 설정이 열립니다!');
    },
    {
      requiredPermissions: ['permission.system.admin'],
      requiredRole: 'admin'
    }
  );

  // 보안 감사 로그 보기 (특정 권한 필요)
  const handleViewAuditLog = handleWithPermission(
    () => {
      alert('보안 감사 로그를 조회합니다!');
    },
    {
      requiredPermissions: ['permission.system.view_audit'],
      customMessage: '보안 감사 로그를 조회하려면 특별한 권한이 필요합니다.'
    }
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          권한 체크 모달 사용 예시
        </h1>
        <p className="text-gray-600">
          버튼을 클릭하면 권한을 확인하고, 권한이 없는 경우 모달을 표시합니다.
        </p>

        {/* 현재 사용자 정보 */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">현재 사용자 정보</h3>
          <p className="text-sm text-blue-800">
            이름: {user?.name} | 역할: {user?.role} | 권한: {user?.permissions.join(', ')}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            현재 사용자는 'permission.all' 권한을 가지고 있어서 모든 기능에 접근 가능합니다.
          </p>
        </div>

        {/* 권한 없음 모달 테스트 버튼 */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-900 mb-2">권한 없음 모달 테스트</h3>
          <p className="text-sm text-yellow-800 mb-3">
            아래 버튼들을 클릭하면 권한과 관계없이 권한 없음 모달을 테스트할 수 있습니다.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                showPermissionDeniedModal({
                  requiredPermissions: ['permission.users.create'],
                  requiredRole: 'manager'
                });
              }}
              className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded border border-yellow-300 hover:bg-yellow-200"
            >
              권한 부족 모달 보기
            </button>
            <button
              onClick={() => {
                showPermissionDeniedModal({
                  customMessage: '이 기능은 현재 점검 중입니다.'
                });
              }}
              className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded border border-yellow-300 hover:bg-yellow-200"
            >
              커스텀 메시지 모달 보기
            </button>
            <button
              onClick={() => {
                showPermissionDeniedModal({
                  requiredRole: 'admin',
                  customMessage: '관리자 권한이 필요한 기능입니다.'
                });
              }}
              className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded border border-yellow-300 hover:bg-yellow-200"
            >
              관리자 권한 필요 모달
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 사용자 생성 - 매니저 이상 권한 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
              <UserPlusIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              사용자 생성
            </h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            새로운 사용자를 생성합니다. 매니저 이상의 권한이 필요합니다.
          </p>
          <button
            onClick={handleCreateUser}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            사용자 생성
          </button>
        </div>

        {/* 시스템 설정 - 관리자 권한 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
              <Cog8ToothIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              시스템 설정
            </h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            시스템 전반 설정을 관리합니다. 관리자 권한이 필요합니다.
          </p>
          <button
            onClick={handleSystemSettings}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            시스템 설정 열기
          </button>
        </div>

        {/* 보안 감사 로그 - 특정 권한 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
              <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">
              보안 감사 로그
            </h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            보안 감사 로그를 조회합니다. 특별한 권한이 필요합니다.
          </p>
          <button
            onClick={handleViewAuditLog}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            감사 로그 보기
          </button>
        </div>
      </div>

      {/* 사용법 안내 */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          사용법
        </h2>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">1. 훅 임포트</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`import { usePermission } from '@/hooks/usePermission';
import { PermissionDeniedModal } from '@/components/common/PermissionDeniedModal';`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">2. 훅 사용</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`const {
  handleWithPermission,
  isPermissionDeniedModalOpen,
  deniedPermissions,
  deniedRole,
  deniedMessage,
  closePermissionDeniedModal,
} = usePermission();`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">3. 버튼 핸들러 래핑</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`const handleAction = handleWithPermission(
  () => {
    // 권한이 있을 때 실행될 코드
    console.log('실행!');
  },
  {
    requiredPermissions: ['permission.users.create'],
    requiredRole: 'manager',
    customMessage: '사용자 정의 메시지'
  }
);`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">4. 모달 컴포넌트 추가</h3>
            <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`<PermissionDeniedModal
  isOpen={isPermissionDeniedModalOpen}
  onClose={closePermissionDeniedModal}
  requiredPermissions={deniedPermissions}
  requiredRole={deniedRole}
  message={deniedMessage}
/>`}
            </pre>
          </div>
        </div>
      </div>

      {/* 권한 없음 모달 */}
      <PermissionDeniedModal
        isOpen={isPermissionDeniedModalOpen}
        onClose={closePermissionDeniedModal}
        requiredPermissions={deniedPermissions}
        requiredRole={deniedRole}
        message={deniedMessage}
      />
    </div>
  );
}