/**
 * S3 파일 업로드 유틸리티
 * Presigned Upload URL을 사용하여 S3에 직접 업로드
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_URL = `${API_BASE}/api`; // /api 경로 추가

/**
 * S3에 파일 업로드
 * @param file - 업로드할 파일
 * @param documentType - 문서 타입 (예: 'business-registration', 'kyc-id-image')
 * @returns S3 키
 */
export async function uploadToS3(
  file: File,
  documentType: string
): Promise<string> {
  try {
    console.log('[uploadToS3] API URL:', API_URL);
    console.log('[uploadToS3] Document Type:', documentType);
    console.log('[uploadToS3] File:', file.name);

    // 1. Backend에서 Presigned Upload URL 요청 (쿠키로 자동 인증)
    const presignedResponse = await fetch(`${API_URL}/upload/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 자동 전송
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        documentType: documentType
      })
    });

    if (!presignedResponse.ok) {
      throw new Error('Presigned URL 생성 실패');
    }

    const { uploadUrl, key } = await presignedResponse.json();

    // 2. S3에 직접 업로드
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'x-amz-server-side-encryption': 'AES256', // Presigned URL 서명에 포함된 헤더
      },
      body: file
    });

    if (!uploadResponse.ok) {
      throw new Error('S3 업로드 실패');
    }

    console.log(`[S3 Upload] 성공: ${key}`);
    return key; // S3 키 반환

  } catch (error) {
    console.error('[S3 Upload] 실패:', error);
    throw error;
  }
}

/**
 * S3 다운로드 URL 생성
 * @param key - S3 객체 키
 * @returns Pre-signed Download URL
 */
export async function getDownloadUrl(key: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/upload/presigned-download-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 자동 전송
      body: JSON.stringify({ key })
    });

    if (!response.ok) {
      throw new Error('Presigned Download URL 생성 실패');
    }

    const { downloadUrl } = await response.json();
    return downloadUrl;

  } catch (error) {
    console.error('[S3 Download URL] 실패:', error);
    throw error;
  }
}
