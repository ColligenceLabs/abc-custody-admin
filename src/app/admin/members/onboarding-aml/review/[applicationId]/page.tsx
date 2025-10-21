/**
 * Individual Onboarding Review Page
 * 개인회원 온보딩 상세 검토 페이지
 *
 * Phase 4: 관리자 검토 및 결정 UI
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { IndividualOnboarding } from "@/types/onboardingAml";
import {
  fetchIndividualOnboardingById,
  approveIndividualOnboarding,
  rejectIndividualOnboarding,
  holdIndividualOnboarding,
} from "@/services/onboardingAmlApi";
import { RiskLevelBadge } from "../../components/RiskLevelBadge";
import { OnboardingStatusBadge } from "../../components/OnboardingStatusBadge";
import { RegistrationSourceBadge } from "../../components/RegistrationSourceBadge";
import { ProcessStepIndicator } from "../../components/ProcessStepIndicator";
import { ApprovalDialog } from "../../components/ApprovalDialog";
import { RejectionDialog } from "../../components/RejectionDialog";
import { OnHoldDialog } from "../../components/OnHoldDialog";
import { KYCSection } from "./components/KYCSection";
import { AMLSection } from "./components/AMLSection";
import { RiskAssessmentSection } from "./components/RiskAssessmentSection";
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

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  async function loadApplication() {
    try {
      setLoading(true);
      const data = await fetchIndividualOnboardingById(applicationId);
      setApplication(data);
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
            <p className="text-muted-foreground">{application.userName} | {application.userEmail}</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadApplication}>
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      {/* Status Overview */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">상태</div>
            <OnboardingStatusBadge status={application.adminReview.status} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">등록 경로</div>
            <RegistrationSourceBadge source={application.registrationSource} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">위험도</div>
            {application.riskAssessment ? (
              <RiskLevelBadge level={application.riskAssessment.riskLevel} source="SYSTEM" />
            ) : (
              <span className="text-sm text-muted-foreground">평가 대기</span>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">진행 단계</div>
            <ProcessStepIndicator
              currentStep={application.adminReview.currentStep}
              totalSteps={5}
              type="individual"
              amlCompleted={!!application.aml}
            />
          </div>
        </div>
      </Card>

      {/* KYC Section */}
      <KYCSection kyc={application.kyc} />

      {/* AML Section (외부 결과 읽기 전용) */}
      {application.aml && <AMLSection aml={application.aml} />}

      {/* Risk Assessment Section (외부 결과 읽기 전용) */}
      {application.riskAssessment && (
        <RiskAssessmentSection riskAssessment={application.riskAssessment} />
      )}

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
