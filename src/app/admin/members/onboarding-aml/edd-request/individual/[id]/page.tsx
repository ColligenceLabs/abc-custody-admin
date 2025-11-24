/**
 * Individual EDD Request Page
 * 개인회원 EDD 요청 페이지
 *
 * HIGH 리스크로 판정된 개인회원에게 추가 정보를 요청하는 페이지
 */

"use client";

import { useEffect, useState } from "react";
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndividualEDDForm } from "@/app/admin/members/onboarding-aml/components/IndividualEDDForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchIndividualOnboardingById, submitIndividualEDD } from "@/services/onboardingAmlApi";
import { IndividualOnboarding, IndividualEDDSubmission } from "@/types/onboardingAml";
import { RiskLevelBadge } from "@/app/admin/members/onboarding-aml/components/RiskLevelBadge";
import { OnboardingStatusBadge } from "@/app/admin/members/onboarding-aml/components/OnboardingStatusBadge";

export default function IndividualEDDRequestPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<IndividualOnboarding | null>(null);

  const applicationId = params.id as string;

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const data = await fetchIndividualOnboardingById(applicationId);
      setApplication(data);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "온보딩 신청 정보를 불러오는데 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: IndividualEDDSubmission) => {
    try {
      await submitIndividualEDD(data);
      toast({
        description: "EDD 정보가 성공적으로 제출되었습니다. 검토 후 승인 여부를 결정합니다.",
      });
      router.push("/admin/members/onboarding-aml/individual");
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/admin/members/onboarding-aml/individual");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">온보딩 신청을 찾을 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push("/admin/members/onboarding-aml/individual")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/members/onboarding-aml/individual")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">개인회원 EDD 요청</h1>
            <p className="text-muted-foreground mt-2">
              HIGH 리스크로 판정된 고객의 추가 정보를 수집합니다
            </p>
          </div>
        </div>
      </div>

      {/* 신청자 정보 요약 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>신청자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">신청자명</p>
              <p className="font-medium">{application.userName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">이메일</p>
              <p className="font-medium">{application.userEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">위험도</p>
              <div className="mt-1">
                {application.riskAssessment && (
                  <RiskLevelBadge level={application.riskAssessment.riskLevel} />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">상태</p>
              <div className="mt-1">
                <OnboardingStatusBadge status={application.adminReview.status} />
              </div>
            </div>
          </div>

          {application.riskAssessment && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">위험 요소</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {application.riskAssessment.factors.map((factor, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EDD 폼 */}
      <IndividualEDDForm
        applicationId={applicationId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
