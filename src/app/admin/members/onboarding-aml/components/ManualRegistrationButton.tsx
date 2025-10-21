/**
 * ManualRegistrationButton Component
 * 수동 등록 버튼
 *
 * 대시보드 및 목록 페이지에서 수동 등록 다이얼로그를 여는 버튼
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ManualRegistrationDialog } from "./ManualRegistrationDialog";
import { PlusCircle } from "lucide-react";

interface ManualRegistrationButtonProps {
  memberType?: "individual" | "corporate";
  onSuccess?: (applicationId: string) => void;
  variant?: "default" | "sapphire" | "outline";
  className?: string;
}

export function ManualRegistrationButton({
  memberType = "individual",
  onSuccess,
  variant = "sapphire",
  className,
}: ManualRegistrationButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setDialogOpen(true)}
        className={className}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        수동 등록
      </Button>

      <ManualRegistrationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        memberType={memberType}
        onSuccess={onSuccess}
      />
    </>
  );
}
