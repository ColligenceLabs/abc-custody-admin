/**
 * File Upload Field Component
 * 파일 업로드를 위한 커스텀 입력 필드
 */

'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface FileUploadFieldProps {
  label: string;
  required?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  error?: string;
}

export function FileUploadField({
  label,
  required = false,
  value,
  onChange,
  accept = '.pdf,.jpg,.jpeg,.png',
  error
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // 파일 크기 체크 (10MB)
    if (file && file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        {value ? (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
            <span className="flex-1 text-sm truncate">{value.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            className="flex-1 justify-start"
          >
            <Upload className="h-4 w-4 mr-2" />
            파일 선택
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        지원 형식: PDF, JPG, PNG (최대 10MB)
      </p>
    </div>
  );
}
