/**
 * 약관 상세보기 페이지
 * /admin/system/terms/[id]
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeftIcon, Edit, Loader2, FileText, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTermsById, toggleTermsActive, Terms } from '@/lib/termsApi';

const TERM_TYPE_LABELS: Record<string, string> = {
  service_terms: '서비스 이용약관',
  personal_info: '개인정보 처리방침',
  corporate_info: '법인정보 처리방침',
  marketing: '마케팅 정보 수신 동의',
  unique_id: '고유식별정보 처리 동의',
  certification_service: '본인확인서비스 이용 동의',
  telecom_service: '통신사 이용약관 동의'
};

const CONTENT_FORMAT_LABELS: Record<string, string> = {
  markdown: 'Markdown',
  html: 'HTML',
  plain: 'Plain Text'
};

export default function TermsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [terms, setTerms] = useState<Terms | null>(null);
  const [stats, setStats] = useState<{ totalAgreements: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // 약관 정보 로드
  const loadTerms = async () => {
    try {
      setIsLoading(true);
      const response = await getTermsById(id);

      if (response.success) {
        setTerms(response.data.terms);
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('약관 상세 조회 실패:', error);
      toast({
        variant: 'destructive',
        description: '약관 정보를 불러오는데 실패했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, [id]);

  // 시행일이 지났는지 확인
  const isEffectiveDatePassed = (effectiveDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const effective = new Date(effectiveDate);
    effective.setHours(0, 0, 0, 0);
    return effective <= today;
  };

  // 수정 불가능 사유 반환
  const getEditDisabledReason = (term: Terms) => {
    if (!term.isActive) {
      return '비활성 약관은 수정할 수 없습니다';
    }
    if (isEffectiveDatePassed(term.effectiveDate)) {
      return '시행일이 지나서 수정할 수 없습니다';
    }
    return null;
  };

  // 활성화 토글
  const handleToggleActive = async () => {
    try {
      setIsToggling(true);
      const response = await toggleTermsActive(id);

      if (response.success) {
        setTerms(response.data);
        toast({
          description: response.data.isActive ? '약관이 활성화되었습니다.' : '약관이 비활성화되었습니다.'
        });
      }
    } catch (error: any) {
      console.error('활성화 토글 실패:', error);
      toast({
        variant: 'destructive',
        description: '활성화 상태 변경에 실패했습니다.'
      });
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-sapphire-600" />
      </div>
    );
  }

  if (!terms) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">약관을 찾을 수 없습니다.</p>
          <Button onClick={() => router.push('/admin/system/terms')} className="mt-4">
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const editDisabledReason = terms ? getEditDisabledReason(terms) : null;
  const canEdit = !editDisabledReason;

  return (
    <TooltipProvider>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">약관 상세 정보</h1>
              <p className="text-gray-600 mt-1">약관의 상세 정보를 확인합니다</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleToggleActive}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : terms.isActive ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  비활성화
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  활성화
                </>
              )}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/system/terms/${id}/edit`)}
                    disabled={!canEdit}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    수정
                  </Button>
                </span>
              </TooltipTrigger>
              {editDisabledReason && (
                <TooltipContent>
                  <p>{editDisabledReason}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-sapphire-600" />
                <CardTitle className="text-2xl">{terms.title}</CardTitle>
              </div>
              <CardDescription>
                {TERM_TYPE_LABELS[terms.type] || terms.type} v{terms.version}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {terms.isRequired && (
                <Badge variant="destructive">필수</Badge>
              )}
              {terms.isActive ? (
                <Badge className="bg-sapphire-100 text-sapphire-700">활성</Badge>
              ) : (
                <Badge variant="outline">비활성</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 메타 정보 */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">약관 ID</p>
              <p className="font-mono text-sm">{terms.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">내용 형식</p>
              <p>{CONTENT_FORMAT_LABELS[terms.contentFormat]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">시행일</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p>{new Date(terms.effectiveDate).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">적용 대상</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <p>
                  {terms.applicableMemberTypes.includes('individual') && '개인회원'}
                  {terms.applicableMemberTypes.includes('individual') &&
                   terms.applicableMemberTypes.includes('corporate') && ', '}
                  {terms.applicableMemberTypes.includes('corporate') && '법인회원'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">생성일</p>
              <p className="text-sm">{new Date(terms.createdAt).toLocaleString('ko-KR')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">수정일</p>
              <p className="text-sm">{new Date(terms.updatedAt).toLocaleString('ko-KR')}</p>
            </div>
          </div>

          {/* 통계 */}
          {stats && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">동의 통계</p>
              <p className="text-2xl font-bold text-sapphire-600">
                {stats.totalAgreements.toLocaleString()}명
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 약관 내용 */}
      <Card>
        <CardHeader>
          <CardTitle>약관 내용</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6">
            <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">
              {terms.content}
            </pre>
          </div>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
}
