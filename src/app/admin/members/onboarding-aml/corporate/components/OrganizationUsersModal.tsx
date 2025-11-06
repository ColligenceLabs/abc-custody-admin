/**
 * OrganizationUsersModal Component
 * 법인 소속 사용자 관리 모달
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrganizationUsersList } from "./OrganizationUsersList";

interface OrganizationUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  companyName: string;
}

export function OrganizationUsersModal({
  open,
  onOpenChange,
  organizationId,
  companyName,
}: OrganizationUsersModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {companyName} - 조직 사용자 관리
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <OrganizationUsersList organizationId={organizationId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
