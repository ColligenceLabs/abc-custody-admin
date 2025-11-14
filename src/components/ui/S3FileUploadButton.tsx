/**
 * S3 File Upload Button Component
 * 파일 선택 시 자동으로 S3에 업로드하는 버튼
 */

'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, Check, X } from 'lucide-react';
import { uploadToS3 } from '@/lib/uploadToS3';
import { useToast } from '@/hooks/use-toast';

interface S3FileUploadButtonProps {
  label: string;
  required?: boolean;
  documentType: string;
  s3Key: string | null;
  onUploadSuccess: (s3Key: string) => void;
  onRemove?: () => void;
  accept?: string;
  disabled?: boolean;
}

export function S3FileUploadButton({
  label,
  required = false,
  documentType,
  s3Key,
  onUploadSuccess,
  onRemove,
  accept = '.pdf,.jpg,.jpeg,.png',
  disabled = false
}: S3FileUploadButtonProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        description: '파일 크기는 10MB 이하여야 합니다.'
      });
      return;
    }

    setUploading(true);
    setFileName(file.name);

    try {
      const key = await uploadToS3(file, documentType);
      onUploadSuccess(key);
      toast({
        description: `${label} 업로드 완료`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        description: '파일 업로드에 실패했습니다.'
      });
      setFileName(null);
    } finally {
      setUploading(false);
      // input 초기화 (같은 파일 재선택 가능하도록)
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    setFileName(null);
    if (onRemove) {
      onRemove();
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      <div className="flex items-center gap-2">
        {s3Key || fileName ? (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-sky-200 dark:border-sky-800 rounded-md bg-sky-50 dark:bg-sky-950">
            <Check className="h-4 w-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span className="flex-1 text-sm truncate text-sky-900 dark:text-sky-100">
              {fileName || s3Key}
            </span>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="h-6 w-6"
                disabled={disabled || uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={disabled || uploading}
            className="flex-1 justify-start"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        지원 형식: PDF, JPG, PNG (최대 10MB)
      </p>
    </div>
  );
}
