'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 즉시 관리자 로그인 페이지로 리다이렉트
    router.push('/admin/auth/login');
  }, [router]);

  return null; // 리다이렉트 중에는 아무것도 렌더링하지 않음
}