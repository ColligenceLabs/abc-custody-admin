/**
 * 약관 관리 목록 페이지
 * /admin/system/terms
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PlusIcon, Search, FileText, Eye, Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTermsList, Terms } from '@/lib/termsApi';
import CreateTermsDialog from './components/CreateTermsDialog';
import EditTermsDialog from './components/EditTermsDialog';
import ViewTermsDialog from './components/ViewTermsDialog';

export default function TermsManagementPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [terms, setTerms] = useState<Terms[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTermsId, setSelectedTermsId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedViewTermsId, setSelectedViewTermsId] = useState<string | null>(null);

  // 약관 타입 옵션
  const termTypes = [
    { value: 'all', label: '전체' },
    { value: 'service_terms', label: '서비스 이용약관' },
    { value: 'personal_info', label: '개인정보 처리방침' },
    { value: 'corporate_info', label: '법인정보 처리방침' },
    { value: 'marketing', label: '마케팅 정보 수신 동의' },
    { value: 'unique_id', label: '고유식별정보 처리 동의' },
    { value: 'certification_service', label: '본인확인서비스 이용 동의' },
    { value: 'telecom_service', label: '통신사 이용약관 동의' }
  ];

  // 약관 목록 로드
  const loadTerms = async () => {
    try {
      setIsLoading(true);
      const response = await getTermsList({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        type: selectedType !== 'all' ? selectedType : undefined
      });

      if (response.success) {
        setTerms(response.data);
        setPagination(response.pagination);
      }
    } catch (error: any) {
      console.error('약관 목록 조회 실패:', error);
      toast({
        variant: 'destructive',
        description: '약관 목록을 불러오는데 실패했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, [pagination.page, selectedType]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadTerms();
  };

  const handleCreateNew = () => {
    setCreateDialogOpen(true);
  };

  const handleView = (termId: string) => {
    setSelectedViewTermsId(termId);
    setViewDialogOpen(true);
  };

  const handleEdit = (termId: string) => {
    setSelectedTermsId(termId);
    setEditDialogOpen(true);
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      service_terms: '서비스 이용약관',
      personal_info: '개인정보 처리방침',
      corporate_info: '법인정보 처리방침',
      marketing: '마케팅 정보 수신 동의',
      unique_id: '고유식별정보 처리 동의',
      certification_service: '본인확인서비스 이용 동의',
      telecom_service: '통신사 이용약관 동의'
    };
    return typeMap[type] || type;
  };

  // 시행일이 지났는지 확인
  const isEffectiveDatePassed = (effectiveDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const effective = new Date(effectiveDate);
    effective.setHours(0, 0, 0, 0);
    return effective < today;
  };

  // 수정 불가능 사유 반환
  const getEditDisabledReason = (term: Terms) => {
    if (term.status === 'inactive') {
      return '비활성 약관은 수정할 수 없습니다';
    }
    if (isEffectiveDatePassed(term.effectiveDate)) {
      return '시행일이 지나서 수정할 수 없습니다';
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">약관 관리</h1>
          <p className="text-gray-600 mt-1">서비스 약관 목록 및 버전 관리</p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <PlusIcon className="h-4 w-4" />
          새 약관 등록
        </Button>
      </div>

      {/* 검색 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="약관명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 타입 필터 버튼 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {termTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                className={selectedType === type.value ? 'bg-sky-600 hover:bg-sky-700' : ''}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sapphire-600" />
        </div>
      )}

      {/* 약관 목록 */}
      {!isLoading && (
        <TooltipProvider>
          <div className="grid gap-4">
            {terms.map((term) => {
              const editDisabledReason = getEditDisabledReason(term);
              const canEdit = !editDisabledReason;

              return (
                <Card key={term.id} className={term.status !== 'active' ? 'bg-gray-50 opacity-60' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className={`h-5 w-5 ${term.status === 'active' ? 'text-sapphire-600' : 'text-gray-400'}`} />
                          <h3 className={`text-lg font-semibold ${term.status === 'active' ? 'text-gray-900' : 'text-gray-500'}`}>
                            {term.title}
                          </h3>
                          {term.isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              필수
                            </Badge>
                          )}
                          {term.status === 'active' && (
                            <Badge className="text-xs bg-sky-100 text-sky-700 border border-sky-200">
                              시행 중
                            </Badge>
                          )}
                          {term.status === 'pending' && (
                            <Badge className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                              시행 대기
                            </Badge>
                          )}
                          {term.status === 'inactive' && (
                            <Badge className="text-xs bg-gray-100 text-gray-600 border border-gray-300">
                              비활성
                            </Badge>
                          )}
                        </div>
                        <div className={`flex items-center gap-4 text-sm ${term.status === 'active' ? 'text-gray-600' : 'text-gray-400'}`}>
                          <span>유형: {getTypeLabel(term.type)}</span>
                          <span>버전: {term.version}</span>
                          <span>시행일: {new Date(term.effectiveDate).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(term.id)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          보기
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                if (!canEdit) {
                                  e.preventDefault();
                                  return;
                                }
                                handleEdit(term.id);
                              }}
                              aria-disabled={!canEdit}
                              className={`gap-2 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <Edit className="h-4 w-4" />
                              수정
                            </Button>
                          </TooltipTrigger>
                          {editDisabledReason && (
                            <TooltipContent>
                              <p>{editDisabledReason}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TooltipProvider>
      )}

      {/* 빈 상태 */}
      {!isLoading && terms.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                등록된 약관이 없습니다
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                새 약관을 등록하여 관리를 시작하세요
              </p>
              <Button onClick={handleCreateNew} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                첫 약관 등록하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 약관 등록 Dialog */}
      <CreateTermsDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadTerms}
      />

      {/* 약관 수정 Dialog */}
      {selectedTermsId && (
        <EditTermsDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          termsId={selectedTermsId}
          onSuccess={loadTerms}
        />
      )}

      {/* 약관 보기 Dialog */}
      {selectedViewTermsId && (
        <ViewTermsDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          termsId={selectedViewTermsId}
        />
      )}
    </div>
  );
}
