/**
 * Corporate Members Onboarding Table
 * 기업 회원 온보딩 테이블 컴포넌트
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Eye, Building } from "lucide-react";
import { CorporateOnboardingApplication } from "@/data/types/corporateOnboarding";
import { getApplicantId } from "@/data/types/onboardingUnified";
import { CorporateReviewDialog } from "./CorporateReviewDialog";

interface CorporateApplicationsTableProps {
  applications: CorporateOnboardingApplication[];
}

const getStatusBadge = (status: string) => {
  const variants = {
    submitted: { variant: "secondary" as const, label: "접수완료", color: "bg-blue-500" },
    document_review: { variant: "default" as const, label: "문서검토", color: "bg-yellow-500" },
    compliance_review: { variant: "sapphire" as const, label: "컴플라이언스검토", color: "bg-purple-500" },
    approved: { variant: "default" as const, label: "승인", color: "bg-green-500" },
    rejected: { variant: "destructive" as const, label: "반려", color: "bg-red-500" }
  };

  return variants[status as keyof typeof variants] || variants.submitted;
};

const getPriorityBadge = (priority: string) => {
  const variants = {
    high: { variant: "destructive" as const, label: "높음" },
    medium: { variant: "sapphire" as const, label: "보통" },
    low: { variant: "secondary" as const, label: "낮음" }
  };

  return variants[priority as keyof typeof variants] || variants.medium;
};

export function CorporateApplicationsTable({ applications }: CorporateApplicationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<CorporateOnboardingApplication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.companyInfo.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyInfo.businessNumber.includes(searchQuery) ||
      app.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contact.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Search and Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="회사명, 사업자번호, 담당자명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">모든 상태</option>
          <option value="submitted">접수완료</option>
          <option value="document_review">문서검토</option>
          <option value="compliance_review">컴플라이언스검토</option>
          <option value="approved">승인</option>
          <option value="rejected">반려</option>
        </select>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            기업 회원 신청 목록
          </CardTitle>
          <CardDescription>
            {filteredApplications.length}건의 기업 회원 신청이 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>회사명</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>신청일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>우선순위</TableHead>
                <TableHead>진행률</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((application) => {
                  const statusBadge = getStatusBadge(application.status);
                  const priorityBadge = getPriorityBadge(application.priority);

                  return (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.companyInfo.companyName}
                      </TableCell>
                      <TableCell>
                        {application.companyInfo.businessNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.contact.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {application.contact.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(application.submittedAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={priorityBadge.variant}>
                          {priorityBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            application.workflow.isOverdue ? 'bg-red-500' :
                            application.workflow.status === 'in_progress' ? 'bg-yellow-500' :
                            'bg-gray-300'
                          }`} />
                          <span className="text-sm">{application.workflow.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          검토
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <CorporateReviewDialog
        application={selectedApplication}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          // 성공 시 목록 새로고침 (향후 React Query로 구현 가능)
          console.log("Review completed successfully");
        }}
      />
    </>
  );
}
