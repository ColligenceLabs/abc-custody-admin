/**
 * 관리자 감사 로그 PDF 다운로드 (백엔드 API 사용)
 *
 * 회원 프론트와 달리 관리자용은 더 상세한 정보를 포함:
 * - 모든 사용자의 활동 로그
 * - IP 주소, User Agent 상세 정보
 * - 완전한 details 정보
 * - 관리자 전용 메타데이터
 */

export interface AdminAuditLog {
  id: string;
  createdAt: string;
  userId: string;
  userName?: string;
  userRole?: string;
  memberType?: string;
  organizationName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: string;
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
  details?: any;
}

/**
 * 관리자 감사 로그 PDF 생성 및 다운로드
 *
 * @param log - 감사 로그 데이터 (관리자 페이지에서 조회한 전체 정보)
 */
export const generateAdminAuditLogPDF = async (log: AdminAuditLog): Promise<void> => {
  try {
    // 관리자 전용 API를 통해 PDF 생성 및 다운로드
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(
      `${API_URL}/api/reports/audit-logs/${log.id}/admin-pdf`,
      {
        credentials: 'include', // 쿠키 기반 인증
      }
    );

    if (!response.ok) {
      throw new Error(`PDF 생성 실패: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    // Blob을 다운로드
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // 파일명 생성 (관리자용은 더 자세한 정보 포함)
    const timestamp = new Date(log.createdAt).toISOString().split('T')[0];
    const userInfo = log.userName || log.userId.substring(0, 8);
    const filename = `admin-audit-log-${log.id.substring(0, 8)}-${userInfo}-${timestamp}.pdf`;
    link.download = filename;

    // 다운로드 실행
    document.body.appendChild(link);
    link.click();

    // 정리
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('관리자 감사 로그 PDF 생성 오류:', error);
    throw error;
  }
};
