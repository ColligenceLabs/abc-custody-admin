"use client";

import { useState } from "react";
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import { SimpleCorporateAccountForm } from "./components/SimpleCorporateAccountForm";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateCorporateAccountRequest {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

interface CreatedAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  organizationName: string;
  role: string;
  status: string;
}

export default function CorporateAccountPage() {
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);

  const handleSubmit = async (data: CreateCorporateAccountRequest) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/corporate-accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || '계정 생성에 실패했습니다.');
    }

    const result = await response.json();
    setCreatedAccount(result.data.user);
  };

  const handleCancel = () => {
    window.history.back();
  };

  const handleCreateAnother = () => {
    setCreatedAccount(null);
  };

  if (createdAccount) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card className="border-2 border-sky-200 bg-sky-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle className="h-12 w-12 text-sky-600" />
              <div>
                <h2 className="text-2xl font-bold text-sky-900">계정 생성 완료</h2>
                <p className="text-sky-700">법인 관리자 계정이 성공적으로 생성되었습니다.</p>
              </div>
            </div>

            <div className="space-y-4 bg-white rounded-lg p-4 border border-sky-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">법인명</div>
                  <div className="font-medium">{createdAccount.organizationName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">담당자 이름</div>
                  <div className="font-medium">{createdAccount.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">이메일</div>
                  <div className="font-medium">{createdAccount.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">전화번호</div>
                  <div className="font-medium">{createdAccount.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">계정 ID</div>
                  <div className="font-medium font-mono text-sm">{createdAccount.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">권한</div>
                  <div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200">
                      {createdAccount.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>안내:</strong> 생성된 계정 정보를 법인 담당자에게 전달해주세요.
                담당자는 이메일 주소로 abc-custody에 로그인할 수 있습니다.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                목록으로
              </Button>
              <Button onClick={handleCreateAnother}>
                다른 계정 생성
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">법인 계정 생성</h1>
        <p className="text-gray-600 mt-2">최소 정보로 법인 관리자 계정을 생성합니다</p>
      </div>

      <SimpleCorporateAccountForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
