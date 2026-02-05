'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createTerms, type TermsSummaryItem } from '@/lib/termsApi';

const TERM_TYPES = [
  { value: 'service_terms', label: '서비스 이용약관' },
  { value: 'personal_info', label: '개인정보 처리방침' },
  { value: 'corporate_info', label: '법인정보 처리방침' },
  { value: 'marketing', label: '마케팅 정보 수신 동의' },
  { value: 'unique_id', label: '고유식별정보 처리 동의' },
  { value: 'certification_service', label: '본인확인서비스 이용 동의' },
  { value: 'telecom_service', label: '통신사 이용약관 동의' }
];

const CONTENT_FORMATS = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'plain', label: 'Plain Text' }
];

interface CreateTermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateTermsDialog({ open, onOpenChange, onSuccess }: CreateTermsDialogProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: '',
    version: '',
    title: '',
    titleEn: '',
    content: '',
    contentEn: '',
    contentFormat: 'markdown' as 'markdown' | 'html' | 'plain',
    isRequired: true,
    status: 'pending' as 'pending' | 'active' | 'inactive',
    effectiveDate: ''
  });

  const [applicableMemberTypes, setApplicableMemberTypes] = useState({
    individual: true,
    corporate: true
  });

  const [showSummary, setShowSummary] = useState(false);
  const [summaryItems, setSummaryItems] = useState<TermsSummaryItem[]>([]);
  const [summaryItemsEn, setSummaryItemsEn] = useState<TermsSummaryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form
  const resetForm = () => {
    setFormData({
      type: '',
      version: '',
      title: '',
      titleEn: '',
      content: '',
      contentEn: '',
      contentFormat: 'markdown',
      isRequired: true,
      status: 'pending',
      effectiveDate: ''
    });
    setApplicableMemberTypes({ individual: true, corporate: true });
    setShowSummary(false);
    setSummaryItems([]);
    setSummaryItemsEn([]);
  };

  // Summary item functions (Korean)
  const addSummaryItem = () => {
    setSummaryItems([...summaryItems, { label: '', value: '' }]);
  };

  const updateSummaryItem = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...summaryItems];
    updated[index][field] = value;
    setSummaryItems(updated);
  };

  const removeSummaryItem = (index: number) => {
    setSummaryItems(summaryItems.filter((_, i) => i !== index));
  };

  // Summary item functions (English)
  const addSummaryItemEn = () => {
    setSummaryItemsEn([...summaryItemsEn, { label: '', value: '' }]);
  };

  const updateSummaryItemEn = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...summaryItemsEn];
    updated[index][field] = value;
    setSummaryItemsEn(updated);
  };

  const removeSummaryItemEn = (index: number) => {
    setSummaryItemsEn(summaryItemsEn.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.version || !formData.title || !formData.content || !formData.effectiveDate) {
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

      const response = await createTerms({
        type: formData.type,
        version: formData.version,
        title: formData.title,
        titleEn: formData.titleEn.trim() || undefined,
        content: formData.content,
        contentEn: formData.contentEn.trim() || undefined,
        contentFormat: formData.contentFormat,
        applicableMemberTypes: selectedMemberTypes,
        isRequired: formData.isRequired,
        status: formData.status,
        effectiveDate: formData.effectiveDate,
        showSummary: showSummary,
        summaryItems: showSummary && summaryItems.length > 0 ? summaryItems : undefined,
        summaryItemsEn: showSummary && summaryItemsEn.length > 0 ? summaryItemsEn : undefined
      });

      if (response.success) {
        toast({
          description: '약관이 생성되었습니다.'
        });
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('약관 생성 실패:', error);
      toast({
        variant: 'destructive',
        title: '생성 실패',
        description: error.response?.data?.error || '약관 생성에 실패했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>새 약관 등록</DialogTitle>
          <DialogDescription>
            약관 정보를 입력하여 새 약관을 등록합니다
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">약관 기본 정보</h3>

            {/* 약관 타입 */}
            <div className="space-y-2">
              <Label htmlFor="type">약관 타입 *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="약관 타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {TERM_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 버전 */}
            <div className="space-y-2">
              <Label htmlFor="version">버전 *</Label>
              <Input
                id="version"
                placeholder="예: 1.0, 1.1, 2.0"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
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
                rows={8}
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
                rows={8}
                value={formData.contentEn}
                onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                className="font-mono text-sm"
              />
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

            {/* 약관 상태 */}
            <div className="space-y-2">
              <Label htmlFor="status">약관 상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'pending' | 'active' | 'inactive') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">시행 대기</SelectItem>
                  <SelectItem value="active">시행 중</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 핵심 정보 요약 */}
          <div className="space-y-4 pt-4 border-t">
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

            {showSummary && (
              <div className="space-y-6">
                {/* 한글 요약 */}
                <div className="space-y-4 p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">요약 항목 (한글)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSummaryItem}
                    >
                      항목 추가
                    </Button>
                  </div>

                  {summaryItems.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">항목 {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSummaryItem(index)}
                        >
                          삭제
                        </Button>
                      </div>
                      <Input
                        placeholder="라벨 (예: 수집 항목)"
                        value={item.label}
                        onChange={(e) => updateSummaryItem(index, 'label', e.target.value)}
                      />
                      <Textarea
                        placeholder="내용"
                        rows={2}
                        value={item.value}
                        onChange={(e) => updateSummaryItem(index, 'value', e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* 영문 요약 */}
                <div className="space-y-4 p-4 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">요약 항목 (영문)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSummaryItemEn}
                    >
                      항목 추가
                    </Button>
                  </div>

                  {summaryItemsEn.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Item {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSummaryItemEn(index)}
                        >
                          삭제
                        </Button>
                      </div>
                      <Input
                        placeholder="Label (e.g., Collection Items)"
                        value={item.label}
                        onChange={(e) => updateSummaryItemEn(index, 'label', e.target.value)}
                      />
                      <Textarea
                        placeholder="Content"
                        rows={2}
                        value={item.value}
                        onChange={(e) => updateSummaryItemEn(index, 'value', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  등록 중...
                </>
              ) : (
                '등록'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
