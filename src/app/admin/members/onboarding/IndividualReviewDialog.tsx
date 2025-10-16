/**
 * Individual Member Review Dialog
 * 개인 회원 신청 검토 모달
 */

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Clock, Eye, Check, RefreshCw, User, MapPin, Phone, Mail, Calendar, AlertCircle } from "lucide-react";
import { IndividualOnboardingApplication, INDIVIDUAL_DOCUMENT_LABELS } from "@/data/types/individualOnboarding";
import {
  approveIndividualApplication,
  rejectIndividualApplication,
  holdIndividualApplication,
  REJECTION_REASONS,
  type RejectionReasonKey
} from "@/data/mockData/onboardingApi";
import { useToast } from "@/hooks/use-toast";

interface IndividualReviewDialogProps {
  application: IndividualOnboardingApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type DecisionType = 'approve' | 'reject' | 'hold' | null;

export function IndividualReviewDialog({
  application,
  open,
  onOpenChange,
  onSuccess
}: IndividualReviewDialogProps) {
  const [activeTab, setActiveTab] = useState<string>('info');
  const [reviewNotes, setReviewNotes] = useState('');
  const [decision, setDecision] = useState<DecisionType>(null);
  const [rejectionReason, setRejectionReason] = useState<RejectionReasonKey>('incomplete_documents');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!application) return null;

  // 문서 검증 진행률 계산
  const documents = [
    application.documents.personalId,
    application.documents.proofOfAddress,
    application.documents.incomeProof,
    application.documents.selfiePhoto
  ];
  const verifiedCount = documents.filter(doc => doc.verified).length;
  const uploadedCount = documents.filter(doc => doc.uploaded).length;
  const totalDocuments = documents.length;
  const verificationProgress = (verifiedCount / totalDocuments) * 100;

  // 상태 배지 설정
  const getStatusBadge = (status: string) => {
    const variants = {
      submitted: { variant: "secondary" as const, label: "접수완료" },
      document_review: { variant: "default" as const, label: "문서검토" },
      compliance_review: { variant: "sapphire" as const, label: "컴플라이언스검토" },
      approved: { variant: "default" as const, label: "승인", className: "bg-green-600" },
      rejected: { variant: "destructive" as const, label: "반려" }
    };
    return variants[status as keyof typeof variants] || variants.submitted;
  };

  const statusBadge = getStatusBadge(application.status);

  // 우선순위 배지
  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: { variant: "destructive" as const, label: "높음" },
      medium: { variant: "sapphire" as const, label: "보통" },
      low: { variant: "secondary" as const, label: "낮음" }
    };
    return variants[priority as keyof typeof variants] || variants.medium;
  };

  const priorityBadge = getPriorityBadge(application.priority);

  // 승인 처리
  const handleApprove = async () => {
    if (!reviewNotes.trim()) {
      toast({
        title: "검토 의견 필요",
        description: "검토 의견을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await approveIndividualApplication(application.id, reviewNotes);
      toast({
        title: "승인 완료",
        description: result.message,
        variant: "default"
      });
      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (error) {
      toast({
        title: "승인 실패",
        description: "승인 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 반려 처리
  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      toast({
        title: "검토 의견 필요",
        description: "반려 사유와 검토 의견을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await rejectIndividualApplication(application.id, rejectionReason, reviewNotes);
      toast({
        title: "반려 완료",
        description: result.message,
        variant: "default"
      });
      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (error) {
      toast({
        title: "반려 실패",
        description: "반려 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 보류 처리
  const handleHold = async () => {
    if (!reviewNotes.trim()) {
      toast({
        title: "검토 의견 필요",
        description: "보류 사유를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await holdIndividualApplication(application.id, reviewNotes);
      toast({
        title: "보류 완료",
        description: result.message,
        variant: "default"
      });
      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (error) {
      toast({
        title: "보류 실패",
        description: "보류 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setActiveTab('info');
    setReviewNotes('');
    setDecision(null);
    setRejectionReason('incomplete_documents');
  };

  // Dialog 닫기
  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6" />
            개인 회원 신청 검토 - {application.personalInfo.fullName}
          </DialogTitle>
          <DialogDescription>
            신청 ID: {application.id} | 신청일: {new Date(application.submittedAt).toLocaleDateString('ko-KR')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">신청 정보</TabsTrigger>
            <TabsTrigger value="documents">문서 검증</TabsTrigger>
            <TabsTrigger value="review">검토 처리</TabsTrigger>
          </TabsList>

          {/* Tab 1: 신청 정보 */}
          <TabsContent value="info" className="space-y-4 mt-4">
            {/* 개인 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  개인 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">성명</Label>
                    <p className="font-medium">{application.personalInfo.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">생년월일</Label>
                    <p className="font-medium">{application.personalInfo.birthDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">국적</Label>
                    <p className="font-medium">{application.personalInfo.nationality}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">주민등록번호</Label>
                    <p className="font-medium font-mono">
                      {application.personalInfo.idNumber.slice(0, 8)}******
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 연락처 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  연락처 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">이메일</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {application.contact.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">전화번호</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {application.contact.phone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 주소 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  주소 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div>
                  <Label className="text-sm text-muted-foreground">도로명 주소</Label>
                  <p className="font-medium">{application.address.street}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">시/군/구</Label>
                    <p className="font-medium">{application.address.city}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">시/도</Label>
                    <p className="font-medium">{application.address.state}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">우편번호</Label>
                    <p className="font-medium">{application.address.postalCode}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">국가</Label>
                  <p className="font-medium">{application.address.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* 신청 상태 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  신청 상태
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">신청 ID</Label>
                    <p className="font-medium font-mono">{application.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">신청일</Label>
                    <p className="font-medium">
                      {new Date(application.submittedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">현재 상태</Label>
                    <div className="mt-1">
                      <Badge variant={statusBadge.variant} className={'className' in statusBadge ? statusBadge.className : ''}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">우선순위</Label>
                    <div className="mt-1">
                      <Badge variant={priorityBadge.variant}>
                        {priorityBadge.label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">진행률</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={application.workflow.progress} className="flex-1" />
                      <span className="text-sm font-medium">{application.workflow.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">담당자</Label>
                    <p className="font-medium">{application.workflow.assignedTo || "미배정"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">마감일</Label>
                    <p className="font-medium">
                      {new Date(application.workflow.dueDate).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">기한 초과</Label>
                    <Badge variant={application.workflow.isOverdue ? "destructive" : "secondary"}>
                      {application.workflow.isOverdue ? "예" : "아니오"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: 문서 검증 */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            {/* 전체 진행률 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">문서 검증 진행률</CardTitle>
                <CardDescription>
                  {verifiedCount}/{totalDocuments} 문서 검증 완료 | {uploadedCount}/{totalDocuments} 문서 업로드 완료
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={verificationProgress} className="h-3" />
              </CardContent>
            </Card>

            {/* 신분증 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {application.documents.personalId.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  {INDIVIDUAL_DOCUMENT_LABELS.personalId}
                  {!application.documents.personalId.uploaded && (
                    <Badge variant="destructive" className="ml-2">미업로드</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">업로드 여부</span>
                  <Badge variant={application.documents.personalId.uploaded ? "default" : "secondary"}>
                    {application.documents.personalId.uploaded ? "업로드 완료" : "미업로드"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">검증 상태</span>
                  <Badge variant={application.documents.personalId.verified ? "default" : "secondary"}>
                    {application.documents.personalId.verified ? "검증 완료" : "검증 필요"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!application.documents.personalId.uploaded}
                    onClick={() => toast({ title: "문서 보기", description: "문서 미리보기 기능 (구현 예정)" })}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    문서 보기
                  </Button>
                  <Button
                    variant="sapphire"
                    size="sm"
                    disabled={!application.documents.personalId.uploaded || application.documents.personalId.verified}
                    onClick={() => toast({ title: "검증 완료", description: "신분증 검증이 완료되었습니다." })}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    검증 완료
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!application.documents.personalId.uploaded}
                    onClick={() => toast({ title: "재요청", description: "문서 재제출이 요청되었습니다." })}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    재요청
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 주소 증명서 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {application.documents.proofOfAddress.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  {INDIVIDUAL_DOCUMENT_LABELS.proofOfAddress}
                  {!application.documents.proofOfAddress.uploaded && (
                    <Badge variant="destructive" className="ml-2">미업로드</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">업로드 여부</span>
                  <Badge variant={application.documents.proofOfAddress.uploaded ? "default" : "secondary"}>
                    {application.documents.proofOfAddress.uploaded ? "업로드 완료" : "미업로드"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">검증 상태</span>
                  <Badge variant={application.documents.proofOfAddress.verified ? "default" : "secondary"}>
                    {application.documents.proofOfAddress.verified ? "검증 완료" : "검증 필요"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!application.documents.proofOfAddress.uploaded}
                    onClick={() => toast({ title: "문서 보기", description: "문서 미리보기 기능 (구현 예정)" })}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    문서 보기
                  </Button>
                  <Button
                    variant="sapphire"
                    size="sm"
                    disabled={!application.documents.proofOfAddress.uploaded || application.documents.proofOfAddress.verified}
                    onClick={() => toast({ title: "검증 완료", description: "주소 증명서 검증이 완료되었습니다." })}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    검증 완료
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!application.documents.proofOfAddress.uploaded}
                    onClick={() => toast({ title: "재요청", description: "문서 재제출이 요청되었습니다." })}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    재요청
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 소득 증명서 (선택) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {application.documents.incomeProof.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  {INDIVIDUAL_DOCUMENT_LABELS.incomeProof}
                  <Badge variant="outline" className="ml-2">선택</Badge>
                  {!application.documents.incomeProof.uploaded && (
                    <Badge variant="secondary" className="ml-2">미업로드</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">업로드 여부</span>
                  <Badge variant={application.documents.incomeProof.uploaded ? "default" : "secondary"}>
                    {application.documents.incomeProof.uploaded ? "업로드 완료" : "미업로드"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">검증 상태</span>
                  <Badge variant={application.documents.incomeProof.verified ? "default" : "secondary"}>
                    {application.documents.incomeProof.verified ? "검증 완료" : "검증 필요"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!application.documents.incomeProof.uploaded}
                    onClick={() => toast({ title: "문서 보기", description: "문서 미리보기 기능 (구현 예정)" })}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    문서 보기
                  </Button>
                  <Button
                    variant="sapphire"
                    size="sm"
                    disabled={!application.documents.incomeProof.uploaded || application.documents.incomeProof.verified}
                    onClick={() => toast({ title: "검증 완료", description: "소득 증명서 검증이 완료되었습니다." })}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    검증 완료
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!application.documents.incomeProof.uploaded}
                    onClick={() => toast({ title: "재요청", description: "문서 재제출이 요청되었습니다." })}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    재요청
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 본인 확인 사진 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {application.documents.selfiePhoto.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  {INDIVIDUAL_DOCUMENT_LABELS.selfiePhoto}
                  {!application.documents.selfiePhoto.uploaded && (
                    <Badge variant="destructive" className="ml-2">미업로드</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">업로드 여부</span>
                  <Badge variant={application.documents.selfiePhoto.uploaded ? "default" : "secondary"}>
                    {application.documents.selfiePhoto.uploaded ? "업로드 완료" : "미업로드"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">검증 상태</span>
                  <Badge variant={application.documents.selfiePhoto.verified ? "default" : "secondary"}>
                    {application.documents.selfiePhoto.verified ? "검증 완료" : "검증 필요"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!application.documents.selfiePhoto.uploaded}
                    onClick={() => toast({ title: "문서 보기", description: "문서 미리보기 기능 (구현 예정)" })}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    문서 보기
                  </Button>
                  <Button
                    variant="sapphire"
                    size="sm"
                    disabled={!application.documents.selfiePhoto.uploaded || application.documents.selfiePhoto.verified}
                    onClick={() => toast({ title: "검증 완료", description: "본인 확인 사진 검증이 완료되었습니다." })}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    검증 완료
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!application.documents.selfiePhoto.uploaded}
                    onClick={() => toast({ title: "재요청", description: "문서 재제출이 요청되었습니다." })}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    재요청
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: 검토 처리 */}
          <TabsContent value="review" className="space-y-4 mt-4">
            {/* 검토 의견 입력 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">검토 의견</CardTitle>
                <CardDescription>
                  승인, 반려, 또는 보류 처리 시 의견을 작성해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="검토 의견을 입력하세요..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* 처리 결정 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">처리 결정</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={decision || ''} onValueChange={(value) => setDecision(value as DecisionType)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="approve" id="approve" />
                    <Label htmlFor="approve" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="font-medium">승인</div>
                        <div className="text-sm text-muted-foreground">회원 가입을 승인합니다</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="reject" id="reject" />
                    <Label htmlFor="reject" className="flex items-center gap-2 cursor-pointer flex-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="font-medium">반려</div>
                        <div className="text-sm text-muted-foreground">신청을 거부합니다</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="hold" id="hold" />
                    <Label htmlFor="hold" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="font-medium">보류</div>
                        <div className="text-sm text-muted-foreground">추가 검토가 필요합니다</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 반려 사유 (반려 선택 시에만 표시) */}
            {decision === 'reject' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    반려 사유
                    <Badge variant="destructive">필수</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={rejectionReason} onValueChange={(value) => setRejectionReason(value as RejectionReasonKey)}>
                    <SelectTrigger>
                      <SelectValue placeholder="반려 사유를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REJECTION_REASONS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* 경고 메시지 */}
            {decision && !reviewNotes.trim() && (
              <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-200">
                        검토 의견이 필요합니다
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        처리를 완료하려면 검토 의견을 입력해주세요.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            닫기
          </Button>
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleApprove}
            disabled={decision !== 'approve' || !reviewNotes.trim() || isProcessing}
          >
            {isProcessing ? (
              "처리중..."
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                승인
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={decision !== 'reject' || !reviewNotes.trim() || isProcessing}
          >
            {isProcessing ? (
              "처리중..."
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                반려
              </>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={handleHold}
            disabled={decision !== 'hold' || !reviewNotes.trim() || isProcessing}
          >
            {isProcessing ? (
              "처리중..."
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                보류
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
