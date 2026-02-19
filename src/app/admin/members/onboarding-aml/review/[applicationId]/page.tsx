/**
 * Individual Onboarding Review Page
 * 개인회원 온보딩 상세 검토 페이지
 *
 * Phase 4: 관리자 검토 및 결정 UI
 */

"use client";

import { useEffect, useState } from "react";
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { IndividualOnboarding, OnboardingStep } from "@/types/onboardingAml";
import {
  fetchIndividualOnboardingById,
  fetchIndividualKycDetail,
  approveIndividualOnboarding,
  rejectIndividualOnboarding,
  holdIndividualOnboarding,
} from "@/services/onboardingAmlApi";
import type { CddDetail } from "@/types/onboardingAml";
import { ApprovalDialog } from "../../components/ApprovalDialog";
import { RejectionDialog } from "../../components/RejectionDialog";
import { OnHoldDialog } from "../../components/OnHoldDialog";
import { KYCSection } from "./components/KYCSection";
import { AMLSection } from "./components/AMLSection";
import { RiskAssessmentSection } from "./components/RiskAssessmentSection";
import { EDDSection } from "./components/EDDSection";
import { AdminDecisionPanel } from "./components/AdminDecisionPanel";

export default function OnboardingReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const applicationId = params.applicationId as string;

  const [application, setApplication] = useState<IndividualOnboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [onHoldDialogOpen, setOnHoldDialogOpen] = useState(false);
  const [selectedCddId, setSelectedCddId] = useState<string | undefined>(undefined);
  const [selectedCdd, setSelectedCdd] = useState<CddDetail | null>(null);

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  async function loadApplication() {
    try {
      setLoading(true);
      const data = await fetchIndividualOnboardingById(applicationId);
      setApplication(data);
      // 초기 CDD 설정 (최신 CDD)
      if (data.cdd) {
        setSelectedCdd(data.cdd);
        setSelectedCddId(data.cdd.id);
      }
    } catch (error) {
      console.error('Failed to load application:', error);
      toast({
        variant: "destructive",
        description: "신청 정보를 불러오는데 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCddSelect(cddId: string) {
    if (!application) return;
    setSelectedCddId(cddId);
    try {
      const detail = await fetchIndividualKycDetail(application.userId, cddId);
      setSelectedCdd(detail.cdd);
      // EDD도 해당 시행일 기준으로 업데이트
      if (detail.edd !== undefined) {
        setApplication(prev => prev ? { ...prev, edd: detail.edd } : prev);
      }
    } catch (error) {
      console.error('CDD 상세 조회 실패:', error);
      toast({
        variant: "destructive",
        description: "KYC 이력 상세 조회에 실패했습니다.",
      });
    }
  }

  const handleApprove = async (reason: string) => {
    try {
      await approveIndividualOnboarding(applicationId, { decisionReason: reason });
      toast({ description: "신청이 승인되었습니다." });
      await loadApplication();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "승인 처리에 실패했습니다.",
      });
      throw error;
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectIndividualOnboarding(applicationId, { decisionReason: reason });
      toast({ description: "신청이 거부되었습니다." });
      await loadApplication();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "거부 처리에 실패했습니다.",
      });
      throw error;
    }
  };

  const handleHold = async (reason: string, requiredDocuments: string[]) => {
    try {
      await holdIndividualOnboarding(applicationId, { reason, requiredDocuments });
      toast({ description: "신청이 보류되었습니다." });
      await loadApplication();
    } catch (error) {
      toast({
        variant: "destructive",
        description: "보류 처리에 실패했습니다.",
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/members/onboarding-aml/individual">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">온보딩 검토</h2>
              <p className="text-muted-foreground">신청 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 h-40 bg-muted/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/members/onboarding-aml/individual">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">온보딩 검토</h2>
              <p className="text-muted-foreground">신청 정보를 찾을 수 없습니다.</p>
            </div>
          </div>
        </div>
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <p>해당 신청 정보를 찾을 수 없습니다.</p>
            <Link href="/admin/members/onboarding-aml/individual">
              <Button variant="outline" className="mt-4">
                목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/members/onboarding-aml/individual">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">개인회원 온보딩 검토</h2>
          </div>
        </div>
        <Button variant="outline" onClick={loadApplication}>
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      {/* KYC Section (상태/위험도/진행단계 포함) */}
      <KYCSection
        kyc={application.kyc}
        userId={application.userId}
        userName={application.userName}
        userEmail={application.userEmail}
        userPhone={application.userPhone || '-'}
        userGender={application.userGender}
        userNationality={application.userNationality}
        kofiuJobCode={application.kofiuJobCode}
        kofiuJobName={application.kofiuJobName}
        jobDetailCode={application.jobDetailCode}
        jobDetailName={application.jobDetailName}
        kycDates={application.kycDates}
        selectedCddId={selectedCddId}
        onCddSelect={handleCddSelect}
        cdd={selectedCdd}
        reviewStatus={selectedCdd?.reviewStatus || application.adminReview.status}
        riskLevel={selectedCdd?.riskLevel || application.riskAssessment?.riskLevel}
        currentStep={(selectedCdd?.currentStep || application.adminReview.currentStep) as OnboardingStep}
        amlCompleted={!!application.aml}
      />

      {/* AML Section (외부 결과 읽기 전용) */}
      {application.aml && <AMLSection aml={application.aml} />}

      {/* Risk Assessment Section (외부 결과 읽기 전용) */}
      {application.riskAssessment && (
        <RiskAssessmentSection riskAssessment={application.riskAssessment} />
      )}

      {/* EDD Section */}
      <EDDSection
        edd={application.edd}
        eddRequired={application.eddRequired}
      />

      {/* Admin Decision Panel */}
      <AdminDecisionPanel
        application={application}
        onApprove={() => setApprovalDialogOpen(true)}
        onReject={() => setRejectionDialogOpen(true)}
        onHold={() => setOnHoldDialogOpen(true)}
      />

      {/* Dialogs */}
      <ApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        applicationId={application.id}
        applicantName={application.userName}
        amlSummary={application.aml}
        riskLevel={application.riskAssessment?.riskLevel}
        onConfirm={handleApprove}
      />

      <RejectionDialog
        open={rejectionDialogOpen}
        onOpenChange={setRejectionDialogOpen}
        applicationId={application.id}
        applicantName={application.userName}
        amlIssues={application.aml ? [
          application.aml.pepStatus === 'MATCHED' ? 'PEP 매칭 발견' : '',
          application.aml.sanctionListStatus === 'MATCHED' ? '제재리스트 매칭 발견' : '',
          application.aml.blacklistStatus === 'MATCHED' ? '블랙리스트 매칭 발견' : '',
        ].filter(Boolean) : []}
        onConfirm={handleReject}
      />

      <OnHoldDialog
        open={onHoldDialogOpen}
        onOpenChange={setOnHoldDialogOpen}
        applicationId={application.id}
        applicantName={application.userName}
        onConfirm={handleHold}
      />
    </div>
  );
}
