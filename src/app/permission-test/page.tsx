'use client';

import { PermissionExample } from '@/components/common/PermissionExample';

/**
 * 권한 체크 모달 테스트 페이지
 * /permission-test 경로에서 확인 가능
 */
export default function PermissionTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <PermissionExample />
    </div>
  );
}