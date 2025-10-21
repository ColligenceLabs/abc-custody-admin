/**
 * ManualRegistrationDialog Component
 * 수동 등록 다이얼로그
 *
 * 관리자가 오프라인 신청을 수동으로 등록할 수 있는 다이얼로그
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndividualRegistrationForm } from "./IndividualRegistrationForm";
import { CorporateRegistrationForm } from "./CorporateRegistrationForm";
import { ManualRegisterIndividualRequest, ManualRegisterCorporateRequest } from "@/types/onboardingAml";
import { manualRegisterIndividual, manualRegisterCorporate } from "@/services/onboardingAmlApi";
import { useToast } from "@/hooks/use-toast";
import { User, Building } from "lucide-react";

interface ManualRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberType?: "individual" | "corporate";
  onSuccess?: (applicationId: string) => void;
}

export function ManualRegistrationDialog({
  open,
  onOpenChange,
  memberType = "individual",
  onSuccess,
}: ManualRegistrationDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"individual" | "corporate">(memberType);

  const handleIndividualSubmit = async (data: ManualRegisterIndividualRequest) => {
    try {
      const result = await manualRegisterIndividual(data);

      toast({
        description: result.message,
      });

      onOpenChange(false);

      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (error) {
      throw error; // Form에서 처리
    }
  };

  const handleCorporateSubmit = async (data: ManualRegisterCorporateRequest) => {
    try {
      const result = await manualRegisterCorporate(data);

      toast({
        description: result.message,
      });

      onOpenChange(false);

      if (onSuccess) {
        onSuccess(result.id);
      }
    } catch (error) {
      throw error; // Form에서 처리
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>수동 등록</DialogTitle>
          <DialogDescription>
            오프라인에서 받은 서류를 기반으로 신청을 등록합니다.
            등록 후 외부 AML 스크리닝이 자동으로 진행됩니다.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "individual" | "corporate")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              개인회원
            </TabsTrigger>
            <TabsTrigger value="corporate" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              법인회원
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="mt-6">
            <IndividualRegistrationForm
              onSubmit={handleIndividualSubmit}
              onCancel={handleCancel}
            />
          </TabsContent>

          <TabsContent value="corporate" className="mt-6">
            <CorporateRegistrationForm
              onSubmit={handleCorporateSubmit}
              onCancel={handleCancel}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
