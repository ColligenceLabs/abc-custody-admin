"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SimpleCorporateAccountFormProps {
  onSubmit: (data: CreateCorporateAccountRequest) => Promise<void>;
  onCancel: () => void;
}

interface CreateCorporateAccountRequest {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export function SimpleCorporateAccountForm({ onSubmit, onCancel }: SimpleCorporateAccountFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName || !contactName || !contactEmail || !contactPhone) {
      toast({
        variant: "destructive",
        description: "모든 필수 항목을 입력해주세요.",
      });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      toast({
        variant: "destructive",
        description: "올바른 이메일 형식을 입력해주세요.",
      });
      return;
    }

    // 전화번호 형식 검증 (간단한 검증)
    const phoneRegex = /^[0-9-]+$/;
    if (!phoneRegex.test(contactPhone)) {
      toast({
        variant: "destructive",
        description: "올바른 전화번호 형식을 입력해주세요.",
      });
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        companyName,
        contactName,
        contactEmail,
        contactPhone
      });

      toast({
        description: "법인 계정이 생성되었습니다.",
      });

      // 폼 초기화
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error?.message || "계정 생성에 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>법인 계정 생성</CardTitle>
          <CardDescription>최소 정보로 법인 관리자 계정을 생성합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">법인명 *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="테크이노베이션(주)"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">담당자 이름 *</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="김철수"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">담당자 이메일 *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="admin@techinno.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">담당자 전화번호 *</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="010-1234-5678"
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          취소
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          계정 생성
        </Button>
      </div>
    </form>
  );
}
