'use client';

import { useState, useEffect } from 'react';
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function ImageViewerModal({ isOpen, onClose, imageUrl, title }: ImageViewerModalProps) {
  const [zoom, setZoom] = useState(100);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이미지 fetch 및 blob URL 생성
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const fetchImage = async () => {
      setLoading(true);
      setError(null);

      try {
        // 인증 없이 직접 fetch 시도
        const response = await fetch(imageUrl);

        if (!response.ok) {
          throw new Error(`이미지 로드 실패: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageBlobUrl(blobUrl);
      } catch (err: any) {
        console.error('이미지 로드 실패:', err);
        setError(err.message || '이미지를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // cleanup: blob URL 해제
    return () => {
      if (imageBlobUrl) {
        URL.revokeObjectURL(imageBlobUrl);
      }
    };
  }, [isOpen, imageUrl]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    // Blob URL을 사용하여 실제 다운로드
    if (imageBlobUrl) {
      const link = document.createElement('a');
      link.href = imageBlobUrl;
      link.download = `${title}_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 컨트롤 버튼 */}
          <div className="flex items-center justify-between gap-2 p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
          </div>

          {/* 이미지 표시 영역 */}
          <div className="relative flex items-center justify-center bg-muted/30 rounded-lg p-4 min-h-[400px]">
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>이미지 로딩 중...</span>
              </div>
            )}
            {error && (
              <div className="text-red-600 text-center">
                <p className="font-medium">{error}</p>
                <p className="text-sm mt-2">이미지를 불러올 수 없습니다.</p>
              </div>
            )}
            {!loading && !error && imageBlobUrl && (
              <img
                src={imageBlobUrl}
                alt={title}
                style={{
                  width: `${zoom}%`,
                  height: 'auto',
                  maxWidth: '100%',
                  transition: 'width 0.2s ease-in-out',
                }}
                className="rounded-lg shadow-lg"
              />
            )}
          </div>

          {/* 닫기 버튼 */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
