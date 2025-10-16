/**
 * Asset Ratio Display Comparison Component
 *
 * 3가지 디자인 옵션을 비교할 수 있는 컴포넌트
 * - Option A: 통합 테이블 뷰
 * - Option B: 세로 누적 바 차트
 * - Option C: 콤팩트 카드 그리드 (원형 게이지)
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AssetRatioOptionA } from "./AssetRatioOptionA";
import { AssetRatioOptionB } from "./AssetRatioOptionB";
import { AssetRatioOptionC } from "./AssetRatioOptionC";
import { AssetWalletInfo, DEFAULT_ASSETS_DATA } from "./AssetWalletRatioSection";

type OptionType = "A" | "B" | "C" | "all";

export function AssetRatioComparison() {
  const [selectedOption, setSelectedOption] = useState<OptionType>("all");

  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Hot/Cold 지갑 비율 디스플레이 옵션 비교</span>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedOption === "all" ? "sapphire" : "outline"}
                size="sm"
                onClick={() => setSelectedOption("all")}
              >
                전체 보기
              </Button>
              <Button
                variant={selectedOption === "A" ? "sapphire" : "outline"}
                size="sm"
                onClick={() => setSelectedOption("A")}
              >
                옵션 A
              </Button>
              <Button
                variant={selectedOption === "B" ? "sapphire" : "outline"}
                size="sm"
                onClick={() => setSelectedOption("B")}
              >
                옵션 B
              </Button>
              <Button
                variant={selectedOption === "C" ? "sapphire" : "outline"}
                size="sm"
                onClick={() => setSelectedOption("C")}
              >
                옵션 C
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <OptionDescription
              title="옵션 A: 통합 테이블 뷰"
              pros={["빠른 비교", "정보 밀도 최적화", "깔끔한 레이아웃"]}
              cons={["개별 상세 정보 축약"]}
              recommended
            />
            <OptionDescription
              title="옵션 B: 세로 누적 바 차트"
              pros={["시각적 임팩트 강함", "차이가 명확", "직관적"]}
              cons={["구체적 수치 확인 어려움"]}
            />
            <OptionDescription
              title="옵션 C: 원형 게이지"
              pros={["세련된 디자인", "핵심 정보 강조", "현대적"]}
              cons={["상세 정보는 별도 확인 필요"]}
            />
          </div>
        </CardContent>
      </Card>

      {/* 옵션 표시 */}
      <div className="space-y-6">
        {(selectedOption === "all" || selectedOption === "A") && (
          <AssetRatioOptionA assetsData={DEFAULT_ASSETS_DATA} />
        )}
        {(selectedOption === "all" || selectedOption === "B") && (
          <AssetRatioOptionB assetsData={DEFAULT_ASSETS_DATA} />
        )}
        {(selectedOption === "all" || selectedOption === "C") && (
          <AssetRatioOptionC assetsData={DEFAULT_ASSETS_DATA} />
        )}
      </div>

      {/* 최종 선택 가이드 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-3">선택 가이드</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong className="text-blue-600">옵션 A (추천)</strong>: 운영자가 5개 자산을
              한눈에 비교하고 상태를 빠르게 파악해야 하는 경우
            </p>
            <p>
              <strong className="text-purple-600">옵션 B</strong>: 경영진이나 보고서용으로
              시각적 임팩트가 필요한 경우
            </p>
            <p>
              <strong className="text-green-600">옵션 C</strong>: 대시보드의 메인 위젯으로
              사용하거나 현대적인 디자인을 선호하는 경우
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 옵션 설명 카드
 */
function OptionDescription({
  title,
  pros,
  cons,
  recommended = false,
}: {
  title: string;
  pros: string[];
  cons: string[];
  recommended?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h4 className="font-semibold text-sm">{title}</h4>
        {recommended && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            추천
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-xs">
          <div className="text-green-600 font-medium mb-1">장점:</div>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
            {pros.map((pro, i) => (
              <li key={i}>{pro}</li>
            ))}
          </ul>
        </div>
        <div className="text-xs">
          <div className="text-orange-600 font-medium mb-1">단점:</div>
          <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
            {cons.map((con, i) => (
              <li key={i}>{con}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
