import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationSystem, NotificationLog, NotificationTemplate, DEFAULT_CONFIG } from "@/utils/notificationSystem";
import { APPROVAL_POLICIES, TRANSACTION_TYPE_POLICIES } from "@/utils/approverAssignment";
import { MOCK_NOTIFICATION_LOGS, MOCK_NOTIFICATION_TEMPLATES } from "@/data/notificationMockData";
import { MOCK_USERS, getActiveUsers } from '@/data/userMockData';
import { formatUserDisplay } from '@/utils/userHelpers';
import { Modal } from "@/components/common/Modal";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface NotificationCenterProps {
  initialSubtab?: 'logs' | 'templates' | 'settings';
}

export function NotificationCenter({ initialSubtab }: NotificationCenterProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'logs' | 'templates' | 'settings'>(initialSubtab || 'templates');
  const [notificationSystem] = useState(() => new NotificationSystem(DEFAULT_CONFIG));
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({
    subject: '',
    message: ''
  });

  // Refs for form inputs
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement>(null);

  // 설정 편집 상태
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editedConfig, setEditedConfig] = useState(DEFAULT_CONFIG);
  const [editedEmails, setEditedEmails] = useState(DEFAULT_CONFIG.approverEmail);
  const [newApproverName, setNewApproverName] = useState('');
  const [newApproverEmail, setNewApproverEmail] = useState('');
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // 활성 사용자 목록 가져오기
  const availableUsers = getActiveUsers();

  // 이미 추가된 승인자는 제외
  const availableUsersForSelection = availableUsers.filter(
    user => !Object.keys(editedEmails).includes(user.name)
  );

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');

  // 로그 검색 상태
  const [logSearchTerm, setLogSearchTerm] = useState("");

  // 템플릿 필터링 상태
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const [templateTypeFilter, setTemplateTypeFilter] = useState<"all" | "approval_pending" | "approval_overdue" | "approval_completed" | "approval_rejected" | "emergency">("all");
  const [templateStatusFilter, setTemplateStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // 템플릿 페이징 상태
  const [templateCurrentPage, setTemplateCurrentPage] = useState(1);
  const templateItemsPerPage = 3; // 페이징 테스트를 위해 3개로 설정

  // initialSubtab이 변경되면 activeTab 업데이트
  useEffect(() => {
    if (initialSubtab) {
      setActiveTab(initialSubtab);
    }
  }, [initialSubtab]);

  // 탭 변경 함수 (URL도 함께 변경)
  const handleTabChange = (newTab: 'logs' | 'templates' | 'settings') => {
    setActiveTab(newTab);
    router.push(`/security/notifications/${newTab}`);
  };

  useEffect(() => {
    // Mock 데이터 사용 (실제 시스템 데이터 대신)
    setLogs(MOCK_NOTIFICATION_LOGS);
    setTemplates(MOCK_NOTIFICATION_TEMPLATES);
  }, []);

  const handleTestNotification = async (templateId: string) => {
    // 테스트용 더미 데이터
    const dummyRequest = {
      id: "test-001",
      title: "테스트 출금 신청",
      fromAddress: "0x1234...",
      toAddress: "0x5678...",
      amount: 1000000,
      currency: "BTC" as const,
      groupId: "group-1",
      initiator: "테스트사용자",
      initiatedAt: new Date().toISOString(),
      status: "submitted" as const,
      priority: "medium" as const,
      description: "테스트용 출금 신청입니다.",
      requiredApprovals: ["박CFO", "이CISO"],
      approvals: [],
      rejections: [],
      auditTrail: []
    };

    switch (templateId) {
      case "approval_pending":
        await notificationSystem.sendApprovalPendingNotification(dummyRequest, "박CFO");
        break;
      case "approval_overdue":
        await notificationSystem.sendOverdueNotification(dummyRequest, "박CFO", 5);
        break;
      case "approval_completed":
        await notificationSystem.sendApprovalCompletedNotification({
          ...dummyRequest,
          approvals: [{ userId: "1", userName: "박CFO", role: "approver", approvedAt: new Date().toISOString() }]
        });
        break;
      case "approval_rejected":
        await notificationSystem.sendApprovalRejectedNotification(dummyRequest, {
          userName: "박CFO",
          rejectedAt: new Date().toISOString(),
          reason: "테스트 반려 사유"
        });
        break;
      case "emergency_approval":
        await notificationSystem.sendEmergencyApprovalNotification(dummyRequest, "박CFO", "긴급 테스트");
        break;
    }

    setLogs(notificationSystem.getNotificationLogs());
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "sent": return {
        label: "발송 완료",
        badgeClass: "px-2 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-600 border border-sky-200"
      };
      case "failed": return {
        label: "발송 실패",
        badgeClass: "px-2 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600 border border-red-200"
      };
      case "retry": return {
        label: "재발송 중",
        badgeClass: "px-2 py-1 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200"
      };
      default: return {
        label: "알 수 없음",
        badgeClass: "px-2 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-600 border border-gray-200"
      };
    }
  };


  const getTemplateDisplay = (templateId: string) => {
    switch (templateId) {
      case "approval_pending": return "승인 대기 알림";
      case "approval_overdue": return "승인 지연 알림";
      case "approval_completed": return "승인 완료 알림";
      case "approval_rejected": return "승인 반려 알림";
      case "emergency_approval": return "긴급 승인 알림";
      default: return templateId;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('ko-KR');
  };

  // 필터링된 로그 계산
  const filteredLogs = logs.filter(log => {
    const statusMatch = statusFilter === 'all' || log.status === statusFilter;
    const templateMatch = templateFilter === 'all' || log.template === templateFilter;

    // 검색어 매칭 (수신자, 템플릿명, 실패사유에서 검색)
    const searchMatch = logSearchTerm === "" ||
      log.recipient.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      getTemplateDisplay(log.template).toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      (log.failureReason && log.failureReason.toLowerCase().includes(logSearchTerm.toLowerCase()));

    return statusMatch && templateMatch && searchMatch;
  });

  // 페이징 계산
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // 템플릿 필터링
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = templateSearchTerm === "" ||
      template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      (template.subject && template.subject.toLowerCase().includes(templateSearchTerm.toLowerCase()));

    const matchesType = templateTypeFilter === "all" || template.trigger === templateTypeFilter;

    const matchesStatus = templateStatusFilter === "all" ||
      (templateStatusFilter === "active" && template.enabled) ||
      (templateStatusFilter === "inactive" && !template.enabled);

    return matchesSearch && matchesType && matchesStatus;
  });

  // 템플릿 페이징
  const templateTotalPages = Math.ceil(filteredTemplates.length / templateItemsPerPage);
  const templateStartIndex = (templateCurrentPage - 1) * templateItemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(templateStartIndex, templateStartIndex + templateItemsPerPage);

  const handleTemplatePageChange = (page: number) => {
    if (page >= 1 && page <= templateTotalPages) {
      setTemplateCurrentPage(page);
    }
  };

  // 검색어나 필터 변경시 페이지를 1로 리셋
  useEffect(() => {
    setTemplateCurrentPage(1);
  }, [templateSearchTerm, templateTypeFilter, templateStatusFilter]);

  // 로그 검색어 변경시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [logSearchTerm]);

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 필터 변경 시 페이지 리셋
  const handleFilterChange = (filterType: 'status' | 'template', value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else {
      setTemplateFilter(value);
    }
    setCurrentPage(1);
  };

  // 설정 관리 핸들러
  const handleSaveSettings = () => {
    // 입력 검증
    const emailValidation = Object.entries(editedEmails).every(([name, email]) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return email && emailRegex.test(email);
    });

    if (!emailValidation) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    if (editedConfig.overdueThresholdHours < 1 || editedConfig.overdueThresholdHours > 72) {
      alert('지연 알림 기준은 1시간에서 72시간 사이여야 합니다.');
      return;
    }

    if (editedConfig.retryAttempts < 0 || editedConfig.retryAttempts > 10) {
      alert('재발송 시도는 0회에서 10회 사이여야 합니다.');
      return;
    }

    if (editedConfig.retryDelayMinutes < 1 || editedConfig.retryDelayMinutes > 60) {
      alert('재발송 간격은 1분에서 60분 사이여야 합니다.');
      return;
    }

    // 실제 구현에서는 API 호출로 설정을 저장
    console.log('설정 저장:', { config: editedConfig, emails: editedEmails });
    setIsEditingSettings(false);
    // 성공 메시지 표시 (실제 구현에서는 toast 등 사용)
    alert('설정이 저장되었습니다.');
  };

  const handleCancelSettings = () => {
    setEditedConfig(DEFAULT_CONFIG);
    setEditedEmails(DEFAULT_CONFIG.approverEmail);
    setIsEditingSettings(false);
  };

  const handleEmailChange = (name: string, email: string) => {
    setEditedEmails(prev => ({
      ...prev,
      [name]: email
    }));
  };

  // 사용자 선택 핸들러
  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setNewApproverName(user.name);
    setNewApproverEmail(user.email);
    setShowUserSelector(false);
  };

  // 승인자 추가
  const handleAddApprover = () => {
    if (newApproverName.trim() && newApproverEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newApproverEmail)) {
        alert('올바른 이메일 주소를 입력해주세요.');
        return;
      }
      if (editedEmails[newApproverName]) {
        alert('이미 존재하는 승인자 이름입니다.');
        return;
      }

      setEditedEmails(prev => ({
        ...prev,
        [newApproverName]: newApproverEmail
      }));
      setNewApproverName('');
      setNewApproverEmail('');
      setSelectedUser(null);
    }
  };

  // 사용자 선택 초기화
  const handleResetUserSelection = () => {
    setNewApproverName('');
    setNewApproverEmail('');
    setSelectedUser(null);
    setShowUserSelector(false);
  };

  // 승인자 삭제
  const handleDeleteApprover = (name: string) => {
    if (confirm(`${name} 승인자를 삭제하시겠습니까?`)) {
      setEditedEmails(prev => {
        const newEmails = { ...prev };
        delete newEmails[name];
        return newEmails;
      });
    }
  };

  const handleConfigChange = (field: keyof typeof DEFAULT_CONFIG, value: number) => {
    setEditedConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 미리보기 생성 함수
  const generatePreview = (subject: string, message: string) => {
    // 샘플 데이터
    const sampleData = {
      approverName: '박CFO',
      initiator: '김대리',
      amount: '1,000,000',
      currency: 'KRW',
      toAddress: '0x1234...abcd',
      initiatedAt: new Date().toLocaleString('ko-KR'),
      priority: '높음',
      overdueHours: '5',
      rejectedBy: '이CISO',
      rejectionReason: '승인 권한 부족',
      emergencyReason: '긴급 보안 업데이트',
      completedAt: new Date().toLocaleString('ko-KR')
    };

    // 변수 치환
    let previewSubject = subject;
    let previewMessage = message;

    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      previewSubject = previewSubject.replace(regex, value);
      previewMessage = previewMessage.replace(regex, value);
    });

    return { subject: previewSubject, message: previewMessage };
  };

  // 미리보기 핸들러
  const handlePreview = () => {
    if (subjectInputRef.current && messageTextareaRef.current) {
      const preview = generatePreview(
        subjectInputRef.current.value,
        messageTextareaRef.current.value
      );
      setPreviewData(preview);
      setShowPreview(true);
    }
  };

  // CSV 다운로드 함수
  const downloadCSV = () => {
    // CSV 헤더
    const headers = ['상태', '수신자', '템플릿', '발송시간', '재시도', '실패사유'];

    // 데이터 변환
    const csvData = filteredLogs.map(log => [
      getStatusDisplay(log.status).label,
      log.recipient,
      getTemplateDisplay(log.template),
      formatDate(log.sentAt),
      log.retryCount > 0 ? `${log.retryCount}회` : '-',
      log.failureReason || '-'
    ]);

    // CSV 문자열 생성 (각 필드를 따옴표로 감싸서 쉼표가 포함된 데이터 처리)
    const csvContent = [
      headers,
      ...csvData
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    // UTF-8 BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // 파일명 생성 (현재 시간 포함)
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '').slice(0, 15);

    // 다운로드 실행
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `notification_logs_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 메모리 정리
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">이메일 알림 센터</h2>
        <p className="text-gray-600 mt-1">이메일 알림 설정 및 발송 이력을 관리합니다</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'templates', label: '템플릿 관리' },
            { key: 'settings', label: '설정' },
            { key: 'logs', label: '알림 로그' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
          {/* 알림 로그 탭 */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
                이메일 발송 로그
              </h3>
              {/* 필터 */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 검색 입력 */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="수신자, 템플릿, 실패사유로 검색..."
                    value={logSearchTerm}
                    onChange={(e) => setLogSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* 상태 필터 */}
                <div className="sm:w-40">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">전체 상태</option>
                  <option value="sent">발송 완료</option>
                  <option value="failed">발송 실패</option>
                  <option value="retry">재발송 중</option>
                </select>
                </div>

                {/* 템플릿 필터 */}
                <div className="sm:w-48">
                  <select
                    value={templateFilter}
                    onChange={(e) => handleFilterChange('template', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                  <option value="all">전체 템플릿</option>
                  <option value="approval_pending">승인 대기 알림</option>
                  <option value="approval_overdue">승인 지연 알림</option>
                  <option value="approval_completed">승인 완료 알림</option>
                  <option value="approval_rejected">승인 반려 알림</option>
                  <option value="emergency_approval">긴급 승인 알림</option>
                  </select>
                </div>

                {/* CSV 다운로드 버튼 */}
                <button
                  onClick={downloadCSV}
                  className="inline-flex items-center px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  CSV 다운로드
                </button>
              </div>
            </div>
          </div>

          {/* 데이터 표시 영역 */}
          <div className="p-6">

            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {logs.length === 0 ? "발송된 알림이 없습니다" : "필터 조건에 맞는 알림이 없습니다"}
                  </h4>
                  <p className="text-gray-500 text-center max-w-sm">
                    {logs.length === 0
                      ? "아직 발송된 이메일 알림이 없습니다. 출금 신청이나 승인이 발생하면 알림이 표시됩니다."
                      : "선택한 조건에 해당하는 알림이 없습니다. 필터를 조정해 보세요."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수신자</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">템플릿</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">발송시간</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">재시도</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusDisplay(log.status).badgeClass}>
                              {getStatusDisplay(log.status).label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.recipient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getTemplateDisplay(log.template)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.sentAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.retryCount > 0 ? `${log.retryCount}회` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                        총 {filteredLogs.length}개 중{" "}
                        {Math.min(startIndex + 1, filteredLogs.length)}
                        -{Math.min(startIndex + itemsPerPage, filteredLogs.length)}개 표시
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          이전
                        </button>

                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          const isCurrentPage = pageNumber === currentPage;

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-3 py-1 text-sm border rounded-md ${
                                isCurrentPage
                                  ? "bg-primary-600 text-white border-primary-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          다음
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
            </div>
          )}

          {/* 템플릿 관리 탭 */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {!isEditing ? (
                <>
                  {/* 헤더 및 필터 */}
                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">알림 템플릿</h3>
                          <p className="text-sm text-gray-600 mt-1">이메일 알림 템플릿을 관리합니다</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTemplate(null);
                            setIsEditing(true);
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          새 템플릿
                        </button>
                      </div>

                      {/* 검색 및 필터 */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* 템플릿 검색 */}
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="템플릿명으로 검색..."
                            value={templateSearchTerm}
                            onChange={(e) => setTemplateSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        {/* 트리거 타입 필터 */}
                        <div className="sm:w-48">
                          <select
                            value={templateTypeFilter}
                            onChange={(e) => setTemplateTypeFilter(e.target.value as any)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="all">모든 타입</option>
                            <option value="approval_pending">승인 대기</option>
                            <option value="approval_overdue">승인 지연</option>
                            <option value="approval_completed">승인 완료</option>
                            <option value="approval_rejected">승인 반려</option>
                            <option value="emergency">긴급 승인</option>
                          </select>
                        </div>

                        {/* 활성화 상태 필터 */}
                        <div className="sm:w-36">
                          <select
                            value={templateStatusFilter}
                            onChange={(e) => setTemplateStatusFilter(e.target.value as any)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="all">전체</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 템플릿 테이블 */}
                    <div className="overflow-x-auto">
                      {filteredTemplates.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              {templates.length === 0 ? "등록된 템플릿이 없습니다" : "필터 조건에 맞는 템플릿이 없습니다"}
                            </h4>
                            <p className="text-gray-500 text-center max-w-sm">
                              {templates.length === 0
                                ? "새 템플릿을 생성해보세요."
                                : "선택한 조건에 해당하는 템플릿이 없습니다. 필터를 조정해 보세요."
                              }
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">템플릿명</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">트리거</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일 제목</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수정일</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {paginatedTemplates.map((template) => (
                                <tr key={template.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                      template.enabled
                                        ? "bg-sky-50 text-sky-600 border border-sky-200"
                                        : "bg-gray-50 text-gray-600 border border-gray-200"
                                    }`}>
                                      {template.enabled ? "활성" : "비활성"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {template.name}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-600">
                                      {getTemplateDisplay(template.id)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 max-w-xs truncate" title={template.subject}>
                                      {template.subject || "제목 없음"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {template.updatedAt ? formatDate(template.updatedAt) : "-"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex items-center justify-end space-x-2">
                                      <button
                                        onClick={() => handleTestNotification(template.id)}
                                        className="px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded hover:bg-sky-200 transition-colors"
                                      >
                                        테스트
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedTemplate(template);
                                          setIsEditing(true);
                                        }}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                      >
                                        편집
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* 페이지네이션 */}
                          {templateTotalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                              <div className="flex flex-col sm:flex-row justify-between items-center">
                                <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                  총 {filteredTemplates.length}개 중{" "}
                                  {Math.min(templateStartIndex + 1, filteredTemplates.length)}
                                  -{Math.min(templateStartIndex + templateItemsPerPage, filteredTemplates.length)}개 표시
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleTemplatePageChange(templateCurrentPage - 1)}
                                    disabled={templateCurrentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    이전
                                  </button>

                                  {[...Array(templateTotalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    const isCurrentPage = pageNumber === templateCurrentPage;

                                    return (
                                      <button
                                        key={pageNumber}
                                        onClick={() => handleTemplatePageChange(pageNumber)}
                                        className={`px-3 py-1 text-sm border rounded-md ${
                                          isCurrentPage
                                            ? "bg-primary-600 text-white border-primary-600"
                                            : "border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        {pageNumber}
                                      </button>
                                    );
                                  })}

                                  <button
                                    onClick={() => handleTemplatePageChange(templateCurrentPage + 1)}
                                    disabled={templateCurrentPage === templateTotalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    다음
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* 템플릿 편집 UI */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedTemplate ? '템플릿 편집' : '새 템플릿 생성'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedTemplate ? `${selectedTemplate.name} 템플릿을 편집합니다` : '새로운 알림 템플릿을 생성합니다'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedTemplate(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* 기본 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          템플릿 이름 *
                        </label>
                        <input
                          type="text"
                          defaultValue={selectedTemplate?.name || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="템플릿 이름을 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          트리거 타입 *
                        </label>
                        <select
                          defaultValue={selectedTemplate?.trigger || 'approval_pending'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="approval_pending">승인 대기</option>
                          <option value="approval_overdue">승인 지연</option>
                          <option value="approval_completed">승인 완료</option>
                          <option value="approval_rejected">승인 반려</option>
                          <option value="emergency">긴급 승인</option>
                        </select>
                      </div>
                    </div>

                    {/* 활성화 상태 */}
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={selectedTemplate?.enabled !== false}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                      <div>
                        <span className="text-sm font-medium text-gray-900">템플릿 활성화</span>
                        <p className="text-xs text-gray-500">비활성화시 해당 이벤트에 대한 알림이 발송되지 않습니다</p>
                      </div>
                    </div>

                    {/* 이메일 제목 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 제목 *
                      </label>
                      <input
                        ref={subjectInputRef}
                        type="text"
                        defaultValue={selectedTemplate?.subject || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="이메일 제목을 입력하세요 (변수 사용 가능: {amount}, {currency} 등)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        변수를 사용하여 동적 제목을 만들 수 있습니다. 예: {`{{amount}} {{currency}}`} 출금 승인 요청
                      </p>
                    </div>

                    {/* 이메일 본문 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 본문 *
                      </label>
                      <textarea
                        ref={messageTextareaRef}
                        defaultValue={selectedTemplate?.message || ''}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="이메일 본문을 입력하세요..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        마크다운 문법과 변수를 사용할 수 있습니다. 사용 가능한 변수는 아래를 참고하세요.
                      </p>
                    </div>

                    {/* 사용 가능한 변수 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">사용 가능한 변수</h4>
                      <p className="text-xs text-gray-600 mb-4">
                        템플릿에서 아래 변수들을 사용하여 동적 내용을 만들 수 있습니다. 변수는 반드시 <code className="bg-white px-1 rounded text-primary-600">{`{{변수명}}`}</code> 형태로 사용해야 합니다.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {[
                          { var: 'approverName', desc: '승인자 이름' },
                          { var: 'initiator', desc: '출금 신청자' },
                          { var: 'amount', desc: '출금 금액' },
                          { var: 'currency', desc: '통화 (KRW, USD 등)' },
                          { var: 'toAddress', desc: '출금 받을 주소' },
                          { var: 'initiatedAt', desc: '신청 일시' },
                          { var: 'priority', desc: '우선순위 (낮음/보통/높음)' },
                          { var: 'overdueHours', desc: '지연된 시간 (시간 단위)' },
                          { var: 'rejectedBy', desc: '반려한 승인자' },
                          { var: 'rejectionReason', desc: '반려 사유' },
                          { var: 'emergencyReason', desc: '긴급 승인 사유' },
                          { var: 'completedAt', desc: '승인 완료 일시' }
                        ].map(({ var: variable, desc }) => (
                          <div key={variable} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                            <code className="text-primary-600 font-mono text-xs">
                              {`{{${variable}}}`}
                            </code>
                            <span className="text-gray-600 text-xs ml-2 flex-1 text-right">
                              {desc}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <p className="text-blue-800">
                          <strong>사용 예시:</strong> <code className="bg-white px-1 rounded">{`{{amount}} {{currency}}`}</code> 출금 신청이
                          <code className="bg-white px-1 rounded">{`{{initiator}}`}</code>님에 의해 제출되었습니다.
                        </p>
                      </div>
                    </div>

                    {/* 미리보기 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">미리보기</h4>
                          <p className="mt-1 text-sm text-blue-700">
                            실제 이메일이 어떻게 표시될지 미리보기를 확인하려면 '미리보기' 버튼을 클릭하세요.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handlePreview}
                          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          미리보기
                        </button>
                        <button
                          onClick={() => {
                            // 테스트 발송 로직
                            alert('테스트 이메일이 발송되었습니다.');
                          }}
                          className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          테스트 발송
                        </button>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setSelectedTemplate(null);
                          }}
                          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => {
                            // 저장 로직
                            alert('템플릿이 저장되었습니다.');
                            setIsEditing(false);
                            setSelectedTemplate(null);
                          }}
                          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          {selectedTemplate ? '수정 완료' : '템플릿 생성'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 설정 탭 */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">이메일 알림 설정</h3>
                  <p className="text-sm text-gray-600 mt-1">승인자 이메일 주소와 발송 정책을 관리합니다</p>
                </div>
                <div className="flex items-center space-x-3">
                  {isEditingSettings ? (
                    <>
                      <button
                        onClick={handleCancelSettings}
                        className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveSettings}
                        className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        저장
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingSettings(true)}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      설정 편집
                    </button>
                  )}
                </div>
              </div>

              {/* 승인자 이메일 관리 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">승인자 이메일 주소</h4>
                      <p className="text-sm text-gray-600 mt-1">알림을 받을 승인자들의 이메일 주소를 관리합니다</p>
                    </div>
                    {isEditingSettings && (
                      <div className="relative">
                        {!showUserSelector ? (
                          <button
                            onClick={() => setShowUserSelector(true)}
                            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>승인자 추가</span>
                          </button>
                        ) : (
                          <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 absolute right-0 top-0 z-10 w-80">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900">승인자 선택</h5>
                              <button
                                onClick={() => setShowUserSelector(false)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {availableUsersForSelection.length === 0 ? (
                              <div className="text-center py-4">
                                <p className="text-sm text-gray-500">추가 가능한 사용자가 없습니다</p>
                                <p className="text-xs text-gray-400 mt-1">모든 사용자가 이미 승인자로 등록되었습니다</p>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {availableUsersForSelection.map((user) => (
                                  <div
                                    key={user.id}
                                    onClick={() => handleSelectUser(user)}
                                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                                        {user.name.charAt(0)}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                          <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                                            {user.position || formatUserDisplay(user, 'name')}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-600">{user.email}</p>
                                        <p className="text-xs text-gray-500">{user.department}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        )}

                        {/* 선택된 사용자 정보 표시 및 수정 폼 */}
                        {selectedUser && (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            {/* 선택된 사용자 정보 */}
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {selectedUser.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="text-sm font-semibold text-gray-900">{selectedUser.name}</p>
                                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                    {selectedUser.role}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{selectedUser.email}</p>
                                <p className="text-xs text-gray-500">{selectedUser.department}</p>
                              </div>
                            </div>


                            {/* 액션 버튼 */}
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={handleResetUserSelection}
                                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>취소</span>
                              </button>
                              <button
                                onClick={handleAddApprover}
                                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>승인자로 추가</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {Object.keys(isEditingSettings ? editedEmails : DEFAULT_CONFIG.approverEmail).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">등록된 승인자 이메일이 없습니다</p>
                      <p className="text-gray-400 text-xs mt-1">승인자를 추가하여 알림을 받을 수 있습니다</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(isEditingSettings ? editedEmails : DEFAULT_CONFIG.approverEmail).map(([name, email]) => (
                        <div key={name} className="flex items-center p-4 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">{name}</span>
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                                    활성
                                  </span>
                                </div>
                                {isEditingSettings ? (
                                  <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => handleEmailChange(name, e.target.value)}
                                    className="mt-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full max-w-sm"
                                  />
                                ) : (
                                  <p className="text-sm text-gray-600 mt-1">{email}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          {isEditingSettings && (
                            <button
                              onClick={() => handleDeleteApprover(name)}
                              className="ml-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                              title="승인자 삭제"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 발송 정책 설정 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900">이메일 발송 정책</h4>
                  <p className="text-sm text-gray-600 mt-1">알림 발송 시점과 재발송 정책을 설정합니다</p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 지연 알림 기준 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h5 className="font-medium text-gray-900">지연 알림</h5>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">승인이 지연될 때 알림을 보내는 기준 시간</p>
                      {isEditingSettings ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editedConfig.overdueThresholdHours}
                            onChange={(e) => handleConfigChange('overdueThresholdHours', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            min="1"
                            max="72"
                          />
                          <span className="text-sm text-gray-600">시간 후</span>
                        </div>
                      ) : (
                        <div className="text-lg font-semibold text-gray-900">{DEFAULT_CONFIG.overdueThresholdHours}시간 후</div>
                      )}
                    </div>

                    {/* 재발송 시도 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <h5 className="font-medium text-gray-900">재발송 시도</h5>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">발송 실패 시 최대 재시도 횟수</p>
                      {isEditingSettings ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">최대</span>
                          <input
                            type="number"
                            value={editedConfig.retryAttempts}
                            onChange={(e) => handleConfigChange('retryAttempts', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            min="0"
                            max="10"
                          />
                          <span className="text-sm text-gray-600">회</span>
                        </div>
                      ) : (
                        <div className="text-lg font-semibold text-gray-900">최대 {DEFAULT_CONFIG.retryAttempts}회</div>
                      )}
                    </div>

                    {/* 재발송 간격 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h5 className="font-medium text-gray-900">재발송 간격</h5>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">재발송 시도 사이의 대기 시간</p>
                      {isEditingSettings ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editedConfig.retryDelayMinutes}
                            onChange={(e) => handleConfigChange('retryDelayMinutes', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            min="1"
                            max="60"
                          />
                          <span className="text-sm text-gray-600">분</span>
                        </div>
                      ) : (
                        <div className="text-lg font-semibold text-gray-900">{DEFAULT_CONFIG.retryDelayMinutes}분</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 이메일 발송 통계 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900">발송 통계</h4>
                  <p className="text-sm text-gray-600 mt-1">최근 이메일 발송 현황을 확인합니다</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {logs.filter(l => l.status === 'sent').length}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">발송 완료</div>
                      <div className="text-xs text-gray-600 mt-1">성공률 높음</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {logs.filter(l => l.status === 'failed').length}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">발송 실패</div>
                      <div className="text-xs text-gray-600 mt-1">점검 필요</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {logs.filter(l => l.retryCount > 0).length}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">재발송</div>
                      <div className="text-xs text-gray-600 mt-1">재시도됨</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {templates.filter(t => t.enabled).length}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">활성 템플릿</div>
                      <div className="text-xs text-gray-600 mt-1">사용 중</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* 미리보기 모달 */}
      <Modal isOpen={showPreview}>
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">이메일 미리보기</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    샘플 데이터를 사용하여 실제 이메일 모습을 확인합니다
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* 이메일 미리보기 */}
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                {/* 이메일 헤더 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-16">보낸사람:</span>
                      <span className="text-sm text-gray-900">noreply@custody-system.com</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-16">받는사람:</span>
                      <span className="text-sm text-gray-900">박CFO &lt;cfo@company.com&gt;</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-16">제목:</span>
                      <span className="text-sm font-semibold text-gray-900">{previewData.subject}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-16">시간:</span>
                      <span className="text-sm text-gray-600">{new Date().toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                </div>

                {/* 이메일 본문 */}
                <div className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                      {previewData.message}
                    </pre>
                  </div>
                </div>

                {/* 이메일 푸터 */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <p>이 이메일은 Custody 시스템에서 자동으로 발송되었습니다.</p>
                    <p>문의사항이 있으시면 시스템 관리자에게 연락해 주세요.</p>
                  </div>
                </div>
              </div>

              {/* 샘플 데이터 정보 */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">샘플 데이터 사용됨</h4>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>이 미리보기는 다음 샘플 데이터를 사용합니다:</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div><span className="font-medium">승인자명</span>: 박CFO</div>
                        <div><span className="font-medium">신청자</span>: 김대리</div>
                        <div><span className="font-medium">금액</span>: 1,000,000</div>
                        <div><span className="font-medium">통화</span>: KRW</div>
                        <div><span className="font-medium">출금주소</span>: 0x1234...abcd</div>
                        <div><span className="font-medium">우선순위</span>: 높음</div>
                        <div><span className="font-medium">지연시간</span>: 5시간</div>
                        <div><span className="font-medium">반려자</span>: 이CISO</div>
                        <div><span className="font-medium">반려사유</span>: 승인 권한 부족</div>
                        <div><span className="font-medium">긴급사유</span>: 긴급 보안 업데이트</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    alert('테스트 이메일이 발송되었습니다.');
                    setShowPreview(false);
                  }}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  테스트 발송
                </button>
              </div>
            </div>
        </div>
      </Modal>
    </div>
  );
}