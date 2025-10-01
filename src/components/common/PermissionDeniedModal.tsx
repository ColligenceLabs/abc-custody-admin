'use client';

import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { Modal } from './Modal';
import { UserRole } from '@/types/user';

interface PermissionDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPermissions?: string[];
  requiredRole?: UserRole;
  message?: string;
}

const roleNames: Record<UserRole, string> = {
  admin: '관리자',
  manager: '매니저',
  operator: '운영자',
  viewer: '뷰어'
};

export function PermissionDeniedModal({
  isOpen,
  onClose,
  requiredPermissions,
  requiredRole,
  message
}: PermissionDeniedModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg max-w-md mx-auto p-6 shadow-xl">
        {/* 아이콘 */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
          <ShieldExclamationIcon className="w-6 h-6 text-red-600" />
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-4">
          권한이 없습니다
        </h2>

        {/* 메시지 */}
        <div className="text-center text-gray-600 mb-6">
          {message ? (
            <p>{message}</p>
          ) : (
            <>
              <p>이 기능을 사용할 수 있는 권한이 없습니다.</p>

              {requiredRole && (
                <p className="mt-2">
                  <span className="font-medium text-gray-900">필요 역할:</span> {roleNames[requiredRole]} 이상
                </p>
              )}

              {requiredPermissions && requiredPermissions.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-gray-900 mb-2">필요한 권한:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {requiredPermissions.map((permission, index) => (
                      <li key={index} className="text-left">
                        • {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-3 text-sm text-gray-500">
                관리자에게 문의하여 필요한 권한을 요청하세요.
              </p>
            </>
          )}
        </div>

        {/* 확인 버튼 */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </Modal>
  );
}