/**
 * Corporate Onboarding Review Page
 * 법인회원 온보딩 상세 검토 페이지
 *
 * Phase 5: 법인 관리자 검토 및 결정 UI
 */

"use client";

import { useEffect, useState } from "react";
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { CorporateOnboarding } from "@/types/onboardingAml";
import {
  fetchCorporateOnboardingById,
  approveCorporateOnboarding,
  rejectCorporateOnboarding,
  holdCorporateOnboarding,
} from "@/services/onboardingAmlApi";
import { RiskLevelBadge } from "../../../components/RiskLevelBadge";
import { OnboardingStatusBadge } from "../../../components/OnboardingStatusBadge";
import { CompactProcessIndicator } from "../../../components/CompactProcessIndicator";
import { ApprovalDialog } from "../../../components/ApprovalDialog";
import { RejectionDialog } from "../../../components/RejectionDialog";
import { OnHoldDialog } from "../../../components/OnHoldDialog";
import { UBOStructureViewer } from "./components/UBOStructureViewer";
import { OrganizationInfoSection } from "./components/review-sections/OrganizationInfoSection";
import { RepresentativeKYCSection } from "./components/review-sections/RepresentativeKYCSection";
import { OwnersDetailSection } from "./components/review-sections/OwnersDetailSection";
import { BusinessFinanceSection } from "./components/review-sections/BusinessFinanceSection";
import { CorporateRiskSection } from "./components/CorporateRiskSection";
import { CorporateEDDSection } from "./components/CorporateEDDSection";
import { CorporateAdminDecisionPanel } from "./components/CorporateAdminDecisionPanel";

export default function CorporateOnboardingReviewPage() {
  const params = useParams();
  const { toast } = useToast();
  const applicationId = params.applicationId as string;

  const [application, setApplication] = useState<CorporateOnboarding | null>(null);
  const [reviewData, setReviewData] = useState<any>(null); // Organization 상세 데이터
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
      const data = await fetchCorporateOnboardingById(applicationId);
      setApplication(data);

      // Organization 상세 데이터 조회 (신규)
      if (data?.companyId) {
        console.log('[Review Page] Fetching organization data for:', data.companyId);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${data.companyId}/onboarding-review`, {
          credentials: 'include'
        });
        console.log('[Review Page] API response status:', response.status);
        if (response.ok) {
          const reviewResult = await response.json();
          console.log('[Review Page] API response data:', reviewResult);
          console.log('[Review Page] Files object:', reviewResult.data?.files);
          setReviewData(reviewResult.data);
        } else {
          const errorText = await response.text();
          console.error('[Review Page] API error:', response.status, errorText);
        }
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

  const handleApprove = async (reason: string) => {
    try {
      await approveCorporateOnboarding(applicationId, { decisionReason: reason });
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
      await rejectCorporateOnboarding(applicationId, { decisionReason: reason });
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
      await holdCorporateOnboarding(applicationId, { reason, requiredDocuments });
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
            <Link href="/admin/members/onboarding-aml/corporate">
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
            <Link href="/admin/members/onboarding-aml/corporate">
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
            <Link href="/admin/members/onboarding-aml/corporate">
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
          <Link href="/admin/members/onboarding-aml/corporate">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">법인회원 온보딩 검토</h2>
          </div>
        </div>
        <Button variant="outline" onClick={loadApplication}>
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      {/* Status Overview */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">상태</div>
            <OnboardingStatusBadge status={application.adminReview.status} />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">위험도</div>
            {application.riskAssessment ? (
              <RiskLevelBadge level={application.riskAssessment.overallRiskLevel} source="SYSTEM" />
            ) : (
              <span className="text-sm text-muted-foreground">평가 대기</span>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">진행 단계</div>
            <CompactProcessIndicator
              currentStep={application.adminReview.currentStep}
              totalSteps={5}
              type="corporate"
              amlCompleted={!!application.ubo}
            />
          </div>
        </div>
      </Card>

      {/* Corporate Info Section - 제거됨: OrganizationInfoSection으로 대체 */}

      {/* 신규: 법인 상세 정보 */}
      {reviewData?.organization && (
        <OrganizationInfoSection
          organization={reviewData.organization}
          files={reviewData.files}
        />
      )}

      {/* 신규: 대표자 KYC */}
      {reviewData?.representative && (
        <RepresentativeKYCSection
          representative={reviewData.representative}
          files={reviewData.files}
        />
      )}

      {/* 신규: 소유자 상세 */}
      {reviewData?.owners && reviewData.owners.length > 0 && (
        <OwnersDetailSection owners={reviewData.owners} />
      )}

      {/* UBO Structure (외부 검증 결과 읽기 전용) */}
      {application.ubo && <UBOStructureViewer ubo={application.ubo} />}

      {/* 신규: 사업/재무 정보 */}
      {reviewData?.businessInfo && (
        <BusinessFinanceSection
          businessInfo={reviewData.businessInfo}
          files={reviewData.files}
        />
      )}

      {/* Corporate Risk Assessment Section (외부 결과 읽기 전용) */}
      {application.riskAssessment && (
        <CorporateRiskSection riskAssessment={application.riskAssessment} />
      )}

      {/* EDD Section */}
      <CorporateEDDSection
        edd={application.edd}
        eddRequired={application.eddRequired}
      />

      {/* Admin Decision Panel */}
      <CorporateAdminDecisionPanel
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
        applicantName={application.companyName}
        amlSummary={null}
        riskLevel={application.riskAssessment?.overallRiskLevel}
        onConfirm={handleApprove}
      />

      <RejectionDialog
        open={rejectionDialogOpen}
        onOpenChange={setRejectionDialogOpen}
        applicationId={application.id}
        applicantName={application.companyName}
        amlIssues={[]}
        onConfirm={handleReject}
      />

      <OnHoldDialog
        open={onHoldDialogOpen}
        onOpenChange={setOnHoldDialogOpen}
        applicationId={application.id}
        applicantName={application.companyName}
        onConfirm={handleHold}
      />
    </div>
  );
}
