'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { X, ZoomIn, ZoomOut, Loader2, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  originalImageUrl?: string;
}

export function ImageViewerModal({ isOpen, onClose, imageUrl, title, originalImageUrl }: ImageViewerModalProps) {
  const [zoom, setZoom] = useState(100);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  // 드래그 이동 상태
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 0, y: 0 });

  // 줌 변경 시 위치 초기화
  useEffect(() => {
    if (zoom <= 100) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setZoom(100);
      setPosition({ x: 0, y: 0 });
      setShowOriginal(false);
    }
  }, [isOpen]);

  // 이미지 fetch 및 blob URL 생성
  useEffect(() => {
    if (!isOpen) return;

    const currentImageUrl = showOriginal && originalImageUrl ? originalImageUrl : imageUrl;
    if (!currentImageUrl) return;

    const loadImage = async () => {
      setLoading(true);
      setError(null);

      try {
        if (currentImageUrl.startsWith('data:')) {
          setImageBlobUrl(currentImageUrl);
          setLoading(false);
          return;
        }

        const response = await fetch(currentImageUrl);
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

    loadImage();

    return () => {
      if (imageBlobUrl && !imageBlobUrl.startsWith('data:')) {
        URL.revokeObjectURL(imageBlobUrl);
      }
    };
  }, [isOpen, imageUrl, originalImageUrl, showOriginal]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleReset = () => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  };

  // 드래그 시작
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 100) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = { x: position.x, y: position.y };
  }, [zoom, position]);

  // 드래그 중
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({
      x: positionStart.current.x + dx,
      y: positionStart.current.y + dy,
    });
  }, [isDragging]);

  // 드래그 종료
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const isZoomed = zoom > 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        {/* 헤더 (고정) */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* 본문 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* 컨트롤 버튼 */}
            <div className="flex items-center justify-between gap-4 p-3 bg-muted rounded-lg">
              {/* 왼쪽: 줌 컨트롤 */}
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
                  disabled={zoom >= 300}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                {(zoom !== 100 || position.x !== 0 || position.y !== 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    title="원래 크기로"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* 오른쪽: 원본/마스킹 스위치 */}
              {originalImageUrl && (
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-md border">
                  <div className="flex items-center gap-2 text-sm">
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    <span className={!showOriginal ? 'font-medium' : 'text-muted-foreground'}>
                      마스킹
                    </span>
                  </div>
                  <Switch
                    checked={showOriginal}
                    onCheckedChange={setShowOriginal}
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4 text-sky-600" />
                    <span className={showOriginal ? 'font-medium text-sky-600' : 'text-muted-foreground'}>
                      원본
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 이미지 표시 영역 */}
            <div
              className="relative overflow-hidden bg-muted/30 rounded-lg min-h-[400px] max-h-[600px]"
              style={{ cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="flex items-center justify-center min-h-[400px]">
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
                    draggable={false}
                    style={{
                      transform: `scale(${zoom / 100}) translate(${position.x / (zoom / 100)}px, ${position.y / (zoom / 100)}px)`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.2s ease-in-out',
                    }}
                    className="rounded-lg shadow-lg max-w-full max-h-[560px] object-contain select-none"
                  />
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 하단 버튼 (고정) */}
        <div className="px-6 py-4 border-t bg-background">
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
