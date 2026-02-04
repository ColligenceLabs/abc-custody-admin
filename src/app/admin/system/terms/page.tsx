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
import { PlusIcon, Search, FileText, Eye, Edit, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTermsList, Terms } from '@/lib/termsApi';

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
    router.push('/admin/system/terms/new');
  };

  const handleView = (termId: string) => {
    router.push(`/admin/system/terms/${termId}`);
  };

  const handleEdit = (termId: string) => {
    router.push(`/admin/system/terms/${termId}/edit`);
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
        <div className="grid gap-4">
          {terms.map((term) => (
          <Card key={term.id} className={!term.isActive ? 'bg-gray-50 opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className={`h-5 w-5 ${term.isActive ? 'text-sapphire-600' : 'text-gray-400'}`} />
                    <h3 className={`text-lg font-semibold ${term.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {term.title}
                    </h3>
                    {term.isRequired && (
                      <Badge variant="destructive" className="text-xs">
                        필수
                      </Badge>
                    )}
                    {term.isActive ? (
                      <Badge className="text-xs bg-sky-100 text-sky-700 border border-sky-200">
                        활성
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-gray-100 text-gray-600 border border-gray-300">
                        비활성
                      </Badge>
                    )}
                  </div>
                  <div className={`flex items-center gap-4 text-sm ${term.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(term.id)}
                    disabled={!term.isActive}
                    className={`gap-2 ${!term.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Edit className="h-4 w-4" />
                    수정
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
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
    </div>
  );
}
