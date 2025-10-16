/**
 * New Application Dialog Component
 * 신규 온보딩 신청 다이얼로그 컨테이너
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { IndividualApplicationForm } from './IndividualApplicationForm';
import { CorporateApplicationForm } from './CorporateApplicationForm';

interface NewApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberType: 'individual' | 'corporate';
  onSuccess: () => void;
}

export function NewApplicationDialog({
  open,
  onOpenChange,
  memberType,
  onSuccess
}: NewApplicationDialogProps) {
  const title = memberType === 'individual' ? '개인 회원 신규 신청' : '기업 회원 신규 신청';
  const description = memberType === 'individual'
    ? '개인 회원의 온보딩 신청 정보를 입력합니다.'
    : '기업 회원의 온보딩 신청 정보를 입력합니다.';

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {memberType === 'individual' ? (
          <IndividualApplicationForm
            onSubmit={onSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <CorporateApplicationForm
            onSubmit={onSuccess}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
