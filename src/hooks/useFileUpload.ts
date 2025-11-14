/**
 * S3 파일 업로드 커스텀 훅
 */

import { useState } from 'react';
import { uploadToS3 } from '@/lib/uploadToS3';
import { useToast } from '@/hooks/use-toast';

interface UploadState {
  file: File | null;
  s3Key: string | null;
  isUploading: boolean;
  error: string | null;
}

export function useFileUpload(documentType: string) {
  const { toast } = useToast();
  const [state, setState] = useState<UploadState>({
    file: null,
    s3Key: null,
    isUploading: false,
    error: null,
  });

  /**
   * 파일 선택 및 S3 업로드
   */
  const handleFileChange = async (file: File | null) => {
    if (!file) {
      // 파일 제거
      setState({
        file: null,
        s3Key: null,
        isUploading: false,
        error: null,
      });
      return;
    }

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = '파일 크기는 10MB 이하여야 합니다.';
      setState(prev => ({ ...prev, error: errorMsg }));
      toast({
        variant: 'destructive',
        description: errorMsg
      });
      return;
    }

    // S3 업로드 시작
    setState({
      file,
      s3Key: null,
      isUploading: true,
      error: null,
    });

    try {
      // S3에 업로드
      const s3Key = await uploadToS3(file, documentType);

      setState({
        file,
        s3Key,
        isUploading: false,
        error: null,
      });

      toast({
        description: '파일이 업로드되었습니다.'
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '파일 업로드 실패';

      setState({
        file,
        s3Key: null,
        isUploading: false,
        error: errorMsg,
      });

      toast({
        variant: 'destructive',
        description: errorMsg
      });
    }
  };

  /**
   * 업로드 초기화
   */
  const reset = () => {
    setState({
      file: null,
      s3Key: null,
      isUploading: false,
      error: null,
    });
  };

  return {
    file: state.file,
    s3Key: state.s3Key,
    isUploading: state.isUploading,
    error: state.error,
    handleFileChange,
    reset,
  };
}
