/**
 * PortOne PASS 본인인증 유틸리티
 *
 * PortOne 정보:
 * - 상점 ID: A010002002
 * - 채널 키: channel-key-e2705b03-4678-42d7-a501-381a031260d8
 * - PG사: 다날
 */

declare global {
  interface Window {
    PortOne: any;
  }
}

/**
 * HTTP 환경에서도 동작하는 fallback UUID 생성 함수
 * crypto.randomUUID()는 HTTPS에서만 동작하므로 대체 함수 제공
 */
function generateFallbackUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * PASS 본인인증 요청
 * @returns identityVerificationId 또는 에러
 */
export async function requestPassVerification(): Promise<{
  success: boolean;
  identityVerificationId?: string;
  message?: string;
}> {
  try {
    // PortOne SDK 로드 확인
    if (!window.PortOne) {
      throw new Error('PortOne SDK가 로드되지 않았습니다. 페이지를 새로고침 해주세요.');
    }

    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

    if (!storeId || !channelKey) {
      throw new Error('PortOne 설정이 누락되었습니다.');
    }

    // 고유한 identityVerificationId 생성
    // HTTP 환경에서도 동작하도록 fallback UUID 생성 함수 사용
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : generateFallbackUUID();
    const identityVerificationId = `identity-verification-${uuid}`;

    console.log('[PortOne] PASS 본인인증 시작:', {
      storeId,
      identityVerificationId
    });

    // PortOne SDK 호출
    const response = await window.PortOne.requestIdentityVerification({
      storeId: storeId,
      identityVerificationId: identityVerificationId,
      channelKey: channelKey,
      // 모바일 환경에서 redirect 방식
      redirectUrl: `${window.location.origin}/signup?step=passCallback&identityVerificationId=${identityVerificationId}`
    });

    console.log('[PortOne] SDK 응답:', response);

    // 에러 체크
    if (response.code !== undefined) {
      console.error('[PortOne] 인증 실패:', response);
      return {
        success: false,
        message: response.message || '본인인증에 실패했습니다.'
      };
    }

    // 성공
    return {
      success: true,
      identityVerificationId: response.identityVerificationId || identityVerificationId
    };

  } catch (error: any) {
    console.error('[PortOne] 본인인증 오류:', error);
    return {
      success: false,
      message: error.message || '본인인증 중 오류가 발생했습니다.'
    };
  }
}

/**
 * redirect 방식에서 쿼리 파라미터로 전달받은 인증 결과 처리
 * @param searchParams - URL 쿼리 파라미터
 * @returns 인증 성공 여부 및 identityVerificationId
 */
export function handlePassCallback(searchParams: URLSearchParams): {
  success: boolean;
  identityVerificationId?: string;
  code?: string;
  message?: string;
} {
  const identityVerificationId = searchParams.get('identityVerificationId');
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  if (code) {
    // 에러 발생
    console.error('[PortOne Callback] 인증 실패:', { code, message });
    return {
      success: false,
      code,
      message: message || '본인인증에 실패했습니다.'
    };
  }

  if (!identityVerificationId) {
    return {
      success: false,
      message: '인증 정보가 없습니다.'
    };
  }

  console.log('[PortOne Callback] 인증 성공:', identityVerificationId);

  return {
    success: true,
    identityVerificationId
  };
}
