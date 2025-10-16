/**
 * New Application Button Component
 * 신규 온보딩 신청 생성 버튼
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { NewApplicationDialog } from './NewApplicationDialog';

interface NewApplicationButtonProps {
  memberType: 'individual' | 'corporate';
  onSuccess: () => void;
}

export function NewApplicationButton({ memberType, onSuccess }: NewApplicationButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <>
      <Button variant="sapphire" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        신규등록
      </Button>

      <NewApplicationDialog
        open={open}
        onOpenChange={setOpen}
        memberType={memberType}
        onSuccess={handleSuccess}
      />
    </>
  );
}
