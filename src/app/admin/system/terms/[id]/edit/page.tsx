/**
 * 약관 수정 페이지
 * /admin/system/terms/[id]/edit
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeftIcon, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getTermsById, updateTerms, Terms, type TermsSummaryItem } from '@/lib/termsApi';

const CONTENT_FORMATS = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'plain', label: 'Plain Text' }
];

const TERM_TYPE_LABELS: Record<string, string> = {
  service_terms: '서비스 이용약관',
  personal_info: '개인정보 처리방침',
  corporate_info: '법인정보 처리방침',
  marketing: '마케팅 정보 수신 동의',
  unique_id: '고유식별정보 처리 동의',
  certification_service: '본인확인서비스 이용 동의',
  telecom_service: '통신사 이용약관 동의'
};

export default function EditTermsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalTerms, setOriginalTerms] = useState<Terms | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    content: '',
    contentEn: '',
    contentFormat: 'markdown' as 'markdown' | 'html' | 'plain',
    isRequired: true,
    isActive: true,
    effectiveDate: ''
  });

  const [applicableMemberTypes, setApplicableMemberTypes] = useState({
    individual: true,
    corporate: true
  });

  const [showSummary, setShowSummary] = useState(false);
  const [summaryItems, setSummaryItems] = useState<TermsSummaryItem[]>([]);

  // 요약 항목 추가
  const addSummaryItem = () => {
    setSummaryItems([...summaryItems, { label: '', value: '' }]);
  };

  // 요약 항목 수정
  const updateSummaryItem = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...summaryItems];
    updated[index][field] = value;
    setSummaryItems(updated);
  };

  // 요약 항목 삭제
  const removeSummaryItem = (index: number) => {
    setSummaryItems(summaryItems.filter((_, i) => i !== index));
  };

  // 약관 정보 로드
  useEffect(() => {
    const loadTerms = async () => {
      try {
        setIsLoading(true);
        const response = await getTermsById(id);

        if (response.success) {
          const terms = response.data.terms;
          setOriginalTerms(terms);

          setFormData({
            title: terms.title,
            titleEn: terms.titleEn || '',
            content: terms.content,
            contentEn: terms.contentEn || '',
            contentFormat: terms.contentFormat,
            isRequired: terms.isRequired,
            isActive: terms.isActive,
            effectiveDate: terms.effectiveDate.split('T')[0]
          });

          setApplicableMemberTypes({
            individual: terms.applicableMemberTypes.includes('individual'),
            corporate: terms.applicableMemberTypes.includes('corporate')
          });

          setShowSummary(terms.showSummary || false);
          setSummaryItems(terms.summaryItems || []);
        }
      } catch (error: any) {
        console.error('약관 조회 실패:', error);
        toast({
          variant: 'destructive',
          description: '약관 정보를 불러오는데 실패했습니다.'
        });
        router.push('/admin/system/terms');
      } finally {
        setIsLoading(false);
      }
    };

    loadTerms();
  }, [id]);

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.effectiveDate) {
      toast({
        variant: 'destructive',
        title: '유효성 검증 실패',
        description: '모든 필수 항목을 입력해주세요.'
      });
      return;
    }

    const selectedMemberTypes: ('individual' | 'corporate')[] = [];
    if (applicableMemberTypes.individual) selectedMemberTypes.push('individual');
    if (applicableMemberTypes.corporate) selectedMemberTypes.push('corporate');

    if (selectedMemberTypes.length === 0) {
      toast({
        variant: 'destructive',
        title: '유효성 검증 실패',
        description: '최소 하나 이상의 적용 대상을 선택해야 합니다.'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await updateTerms(id, {
        title: formData.title,
        titleEn: formData.titleEn || undefined,
        content: formData.content,
        contentEn: formData.contentEn || undefined,
        contentFormat: formData.contentFormat,
        applicableMemberTypes: selectedMemberTypes,
        isRequired: formData.isRequired,
        isActive: formData.isActive,
        effectiveDate: formData.effectiveDate,
        showSummary: showSummary,
        summaryItems: showSummary && summaryItems.length > 0 ? summaryItems : null
      });

      if (response.success) {
        toast({
          description: '약관이 수정되었습니다.'
        });
        router.push(`/admin/system/terms/${id}`);
      }
    } catch (error: any) {
      console.error('약관 수정 실패:', error);
      toast({
        variant: 'destructive',
        title: '수정 실패',
        description: error.response?.data?.error || '약관 수정에 실패했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-sapphire-600" />
      </div>
    );
  }

  if (!originalTerms) {
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">약관 수정</h1>
          <p className="text-gray-600 mt-1">
            {TERM_TYPE_LABELS[originalTerms.type]} v{originalTerms.version}
          </p>
        </div>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>약관 정보 수정</CardTitle>
            <CardDescription>
              약관 타입과 버전은 수정할 수 없습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 약관 타입 (읽기 전용) */}
            <div className="space-y-2">
              <Label>약관 타입</Label>
              <Input
                value={TERM_TYPE_LABELS[originalTerms.type]}
                disabled
                className="bg-gray-100"
              />
            </div>

            {/* 버전 (읽기 전용) */}
            <div className="space-y-2">
              <Label>버전</Label>
              <Input
                value={originalTerms.version}
                disabled
                className="bg-gray-100"
              />
            </div>

            {/* 제목 (한글) */}
            <div className="space-y-2">
              <Label htmlFor="title">제목 (한글) *</Label>
              <Input
                id="title"
                placeholder="약관 제목"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* 제목 (영문) */}
            <div className="space-y-2">
              <Label htmlFor="titleEn">제목 (영문)</Label>
              <Input
                id="titleEn"
                placeholder="Terms Title (English)"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              />
              <p className="text-sm text-gray-500">영문 사이트에 표시될 제목을 입력하세요</p>
            </div>

            {/* 내용 형식 */}
            <div className="space-y-2">
              <Label htmlFor="contentFormat">내용 형식</Label>
              <Select
                value={formData.contentFormat}
                onValueChange={(value: 'markdown' | 'html' | 'plain') =>
                  setFormData({ ...formData, contentFormat: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_FORMATS.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 내용 (한글) */}
            <div className="space-y-2">
              <Label htmlFor="content">약관 내용 (한글) *</Label>
              <Textarea
                id="content"
                placeholder="약관 내용을 입력하세요"
                rows={15}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            {/* 내용 (영문) */}
            <div className="space-y-2">
              <Label htmlFor="contentEn">약관 내용 (영문)</Label>
              <Textarea
                id="contentEn"
                placeholder="Enter terms content in English"
                rows={15}
                value={formData.contentEn}
                onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                className="font-mono text-sm"
              />
              <p className="text-sm text-gray-500">영문 사이트에 표시될 약관 내용을 입력하세요</p>
            </div>

            {/* 시행일 */}
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">시행일 *</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              />
            </div>

            {/* 적용 대상 */}
            <div className="space-y-2">
              <Label>적용 대상</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="individual"
                    checked={applicableMemberTypes.individual}
                    onCheckedChange={(checked) =>
                      setApplicableMemberTypes({
                        ...applicableMemberTypes,
                        individual: checked as boolean
                      })
                    }
                  />
                  <Label htmlFor="individual" className="font-normal cursor-pointer">
                    개인회원
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="corporate"
                    checked={applicableMemberTypes.corporate}
                    onCheckedChange={(checked) =>
                      setApplicableMemberTypes({
                        ...applicableMemberTypes,
                        corporate: checked as boolean
                      })
                    }
                  />
                  <Label htmlFor="corporate" className="font-normal cursor-pointer">
                    법인회원
                  </Label>
                </div>
              </div>
            </div>

            {/* 필수 여부 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRequired"
                checked={formData.isRequired}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isRequired: checked as boolean })
                }
              />
              <Label htmlFor="isRequired" className="font-normal cursor-pointer">
                필수 약관
              </Label>
            </div>

            {/* 활성 여부 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive" className="font-normal cursor-pointer">
                활성 상태
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* 핵심 정보 요약 */}
        <Card>
          <CardHeader>
            <CardTitle>핵심 정보 요약</CardTitle>
            <CardDescription>
              회원가입 약관 동의 화면에 표시할 핵심 정보를 입력하세요 (법적 요건 충족용)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 요약 표시 여부 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showSummary"
                checked={showSummary}
                onCheckedChange={(checked) => setShowSummary(checked as boolean)}
              />
              <Label htmlFor="showSummary" className="font-normal cursor-pointer">
                핵심 정보 요약 표시
              </Label>
            </div>

            {/* 요약 항목 입력 */}
            {showSummary && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>요약 항목</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSummaryItem}
                  >
                    항목 추가
                  </Button>
                </div>

                {summaryItems.length === 0 && (
                  <p className="text-sm text-gray-500">
                    항목 추가 버튼을 클릭하여 핵심 정보를 입력하세요
                  </p>
                )}

                {summaryItems.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        항목 {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSummaryItem(index)}
                      >
                        삭제
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`label-${index}`}>라벨</Label>
                      <Input
                        id={`label-${index}`}
                        placeholder="예: 수집 항목, 이용 목적, 보유 기간"
                        value={item.label}
                        onChange={(e) =>
                          updateSummaryItem(index, 'label', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`value-${index}`}>내용</Label>
                      <Textarea
                        id={`value-${index}`}
                        placeholder="예: 이메일, 이름, 휴대전화번호, 주민등록번호"
                        rows={2}
                        value={item.value}
                        onChange={(e) =>
                          updateSummaryItem(index, 'value', e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}

                {summaryItems.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>미리보기:</strong> 회원가입 약관 동의 화면에 다음과 같이 표시됩니다
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      {summaryItems.map((item, idx) => (
                        <div key={idx}>
                          <span className="font-medium">· {item.label || '(라벨)'}:</span>{' '}
                          <span>{item.value || '(내용)'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                수정 중...
              </>
            ) : (
              '변경사항 저장'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
