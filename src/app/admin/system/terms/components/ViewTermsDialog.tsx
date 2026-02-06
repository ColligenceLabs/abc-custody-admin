'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, FileText, Calendar, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTermsById, Terms } from '@/lib/termsApi';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

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

interface ViewTermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  termsId: string | null;
}

export default function ViewTermsDialog({ open, onOpenChange, termsId }: ViewTermsDialogProps) {
  const { toast } = useToast();
  const [terms, setTerms] = useState<Terms | null>(null);
  const [stats, setStats] = useState<{ totalAgreements: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'ko' | 'en'>('ko');

  // Load terms data
  useEffect(() => {
    if (open && termsId) {
      loadTerms();
    }
  }, [open, termsId]);

  const loadTerms = async () => {
    if (!termsId) return;

    try {
      setIsLoading(true);
      const response = await getTermsById(termsId);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>약관 상세 정보</DialogTitle>
          <DialogDescription>
            약관의 상세 정보를 확인합니다
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sapphire-600" />
          </div>
        ) : terms ? (
          <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="preview">미리보기</TabsTrigger>
              <TabsTrigger value="details">상세 정보</TabsTrigger>
            </TabsList>

            {/* 고객 미리보기 탭 */}
            <TabsContent value="preview" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
              {/* 약관 제목 및 버전 */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {currentLanguage === 'ko' ? terms.title : (terms.titleEn || terms.title)}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  버전 {terms.version} | {new Date(terms.effectiveDate).toLocaleDateString('ko-KR')}
                </p>
              </div>

              {/* 언어 선택 */}
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  size="sm"
                  variant={currentLanguage === 'ko' ? 'default' : 'outline'}
                  onClick={() => setCurrentLanguage('ko')}
                  className={currentLanguage === 'ko' ? 'bg-sky-600 hover:bg-sky-700' : ''}
                >
                  한글
                </Button>
                <Button
                  size="sm"
                  variant={currentLanguage === 'en' ? 'default' : 'outline'}
                  onClick={() => setCurrentLanguage('en')}
                  disabled={!terms.titleEn && !terms.contentEn && !terms.summaryItemsEn}
                  className={currentLanguage === 'en' ? 'bg-sky-600 hover:bg-sky-700' : ''}
                >
                  English
                </Button>
              </div>

              {/* 약관 내용 - 고객 화면과 완전히 동일 */}
              <div className="overflow-y-auto overflow-x-hidden">
                {terms.contentFormat === 'markdown' ? (
                  <div className="prose prose-sm max-w-none break-words prose-headings:text-gray-900 prose-h1:text-xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-lg prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-6 prose-h3:text-base prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4 prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm prose-strong:font-semibold prose-strong:text-gray-900 prose-pre:bg-gray-100 prose-pre:text-gray-800 prose-code:bg-gray-100 prose-code:text-gray-800 prose-blockquote:bg-gray-100 prose-blockquote:border-gray-300">
                    <ReactMarkdown>
                      {currentLanguage === 'ko' ? terms.content : (terms.contentEn || terms.content)}
                    </ReactMarkdown>
                  </div>
                ) : terms.contentFormat === 'html' ? (
                  <div
                    className="text-sm text-gray-600 leading-relaxed break-words"
                    dangerouslySetInnerHTML={{
                      __html: currentLanguage === 'ko' ? terms.content : (terms.contentEn || terms.content)
                    }}
                  />
                ) : (
                  <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed break-words">
                    {currentLanguage === 'ko' ? terms.content : (terms.contentEn || terms.content)}
                  </div>
                )}
              </div>

              {/* 영문 버전이 없을 때 안내 */}
              {currentLanguage === 'en' && !terms.contentEn && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    영문 버전이 등록되지 않았습니다. 한글 내용이 표시됩니다.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* 상세 정보 탭 */}
            <TabsContent value="details" className="flex-1 overflow-y-auto px-6 py-4 mt-0 space-y-6">
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
                      {terms.status === 'active' && (
                        <Badge className="bg-sky-100 text-sky-700 border border-sky-200">시행 중</Badge>
                      )}
                      {terms.status === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200">시행 대기</Badge>
                      )}
                      {terms.status === 'inactive' && (
                        <Badge className="bg-gray-100 text-gray-600 border border-gray-300">비활성</Badge>
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

              {/* 핵심 정보 요약 */}
              {terms.showSummary && (
                (currentLanguage === 'ko' && terms.summaryItems && terms.summaryItems.length > 0) ||
                (currentLanguage === 'en' && terms.summaryItemsEn && terms.summaryItemsEn.length > 0)
              ) && (
                <Card>
                  <CardHeader>
                    <CardTitle>핵심 정보 요약</CardTitle>
                    <CardDescription>약관의 핵심 정보를 요약한 내용입니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(currentLanguage === 'ko'
                        ? terms.summaryItems
                        : (terms.summaryItemsEn || terms.summaryItems)
                      )?.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              {item.label}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 원본 약관 내용 (개발자용) */}
              <Card>
                <CardHeader>
                  <CardTitle>원본 내용</CardTitle>
                  <CardDescription>등록된 약관의 원본 텍스트입니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 한글 버전 */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900">한글 버전</h4>

                    {/* 한글 제목 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">제목</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-900 font-medium">{terms.title}</p>
                      </div>
                    </div>

                    {/* 한글 내용 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">내용</p>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-xs font-mono text-gray-600">
                          {terms.content}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* 영문 버전 */}
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900">영문 버전</h4>

                    {/* 영문 제목 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">제목 (English)</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        {terms.titleEn ? (
                          <p className="text-sm text-gray-900 font-medium">{terms.titleEn}</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">등록되지 않음</p>
                        )}
                      </div>
                    </div>

                    {/* 영문 내용 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">내용 (Content)</p>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                        {terms.contentEn ? (
                          <pre className="whitespace-pre-wrap text-xs font-mono text-gray-600">
                            {terms.contentEn}
                          </pre>
                        ) : (
                          <p className="text-sm text-gray-400 italic">등록되지 않음</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">약관을 찾을 수 없습니다.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
