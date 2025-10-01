import { DepositHistory, DepositStatistics as StatsType } from "@/types/deposit";
import { ChartBarIcon, ClockIcon, ArrowTrendingUpIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

interface DepositStatisticsProps {
  deposits: DepositHistory[];
}

export default function DepositStatistics({ deposits }: DepositStatisticsProps) {
  const calculateStatistics = (): StatsType => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const creditedDeposits = deposits.filter(d => d.status === "credited");

    // 오늘 통계
    const todayDeposits = creditedDeposits.filter(
      d => new Date(d.creditedAt!) >= todayStart
    );
    const todayAmount = todayDeposits.reduce((sum, d) => sum + (d.valueInKRW || 0), 0);

    // 이번 주 통계
    const weekDeposits = creditedDeposits.filter(
      d => new Date(d.creditedAt!) >= weekStart
    );
    const weekAmount = weekDeposits.reduce((sum, d) => sum + (d.valueInKRW || 0), 0);

    // 이번 달 통계
    const monthDeposits = creditedDeposits.filter(
      d => new Date(d.creditedAt!) >= monthStart
    );
    const monthAmount = monthDeposits.reduce((sum, d) => sum + (d.valueInKRW || 0), 0);

    // 평균 처리 시간 계산
    const completedDeposits = creditedDeposits.filter(d => d.detectedAt && d.creditedAt);
    const avgProcessingTime = completedDeposits.length > 0
      ? completedDeposits.reduce((sum, d) => {
          const detected = new Date(d.detectedAt).getTime();
          const credited = new Date(d.creditedAt!).getTime();
          return sum + (credited - detected) / (1000 * 60); // 분 단위
        }, 0) / completedDeposits.length
      : 0;

    // 자산별 통계
    const assetStats: { [key: string]: { count: number; amount: number } } = {};
    creditedDeposits.forEach(deposit => {
      if (!assetStats[deposit.asset]) {
        assetStats[deposit.asset] = { count: 0, amount: 0 };
      }
      assetStats[deposit.asset].count += 1;
      assetStats[deposit.asset].amount += (deposit.valueInKRW || 0);
    });

    const totalAmount = Object.values(assetStats).reduce((sum, stat) => sum + stat.amount, 0);
    const assetBreakdown = Object.entries(assetStats).map(([asset, stats]) => ({
      asset,
      count: stats.count,
      amount: (stats.amount / 1000000).toFixed(2), // 백만원 단위
      percentage: totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
    })).sort((a, b) => b.percentage - a.percentage);

    return {
      todayTotal: {
        count: todayDeposits.length,
        amount: todayAmount / 1000000, // 백만원 단위
        amountKRW: todayAmount
      },
      weekTotal: {
        count: weekDeposits.length,
        amount: weekAmount / 1000000,
        amountKRW: weekAmount
      },
      monthTotal: {
        count: monthDeposits.length,
        amount: monthAmount / 1000000,
        amountKRW: monthAmount
      },
      averageProcessingTime: avgProcessingTime,
      assetBreakdown
    };
  };

  const stats = calculateStatistics();

  const StatCard = ({ 
    title, 
    value, 
    unit, 
    subValue, 
    icon, 
    trend, 
    color = "primary" 
  }: {
    title: string;
    value: string | number;
    unit: string;
    subValue?: string;
    icon: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    color?: "primary" | "positive" | "blue" | "yellow";
  }) => {
    const colorClasses = {
      primary: "bg-primary-50 text-primary-600",
      positive: "bg-sky-50 text-sky-600",
      blue: "bg-blue-50 text-blue-600",
      yellow: "bg-yellow-50 text-yellow-600"
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-600">{title}</h4>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toFixed(1) : value}
            </span>
            <span className="text-sm text-gray-500 mb-1">{unit}</span>
            {trend && (
              <div className={`flex items-center ${
                trend === 'up' ? 'text-sky-500' : 
                trend === 'down' ? 'text-red-500' : 'text-gray-500'
              }`}>
                <ArrowTrendingUpIcon className={`h-4 w-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
              </div>
            )}
          </div>
          {subValue && (
            <div className="text-xs text-gray-500">{subValue}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="오늘 입금"
          value={stats.todayTotal.count}
          unit="건"
          subValue={`₩${stats.todayTotal.amountKRW.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="h-5 w-5" />}
          color="positive"
        />
        
        <StatCard
          title="이번 주 입금"
          value={stats.weekTotal.count}
          unit="건"
          subValue={`₩${stats.weekTotal.amountKRW.toLocaleString()}`}
          icon={<ChartBarIcon className="h-5 w-5" />}
          color="blue"
        />
        
        <StatCard
          title="이번 달 입금"
          value={stats.monthTotal.count}
          unit="건"
          subValue={`₩${stats.monthTotal.amountKRW.toLocaleString()}`}
          icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
          color="primary"
        />
        
        <StatCard
          title="평균 처리시간"
          value={stats.averageProcessingTime}
          unit="분"
          subValue="감지부터 입금완료까지"
          icon={<ClockIcon className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      {/* 자산별 분석 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">자산별 입금 분석</h3>
          <span className="text-sm text-gray-500">최근 완료된 입금 기준</span>
        </div>
        
        {stats.assetBreakdown.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 완료된 입금이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {stats.assetBreakdown.map((asset, index) => (
              <div key={asset.asset} className="flex items-center space-x-4">
                {/* 순위 */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    {index + 1}
                  </span>
                </div>
                
                {/* 자산 정보 */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">
                      {asset.asset}
                    </span>
                  </div>
                </div>
                
                {/* 프로그레스 바 및 정보 */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">
                        {asset.asset}
                      </span>
                      <span className="text-xs text-gray-500">
                        {asset.count}건
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {asset.percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        ₩{(parseFloat(asset.amount) * 1000000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* 프로그레스 바 */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${asset.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 추가 인사이트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">처리 시간 분석</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">평균 처리 시간</span>
              <span className="font-medium text-gray-900">
                {stats.averageProcessingTime.toFixed(1)}분
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">예상 범위</span>
              <span className="text-gray-700">
                {Math.max(1, stats.averageProcessingTime - 5).toFixed(0)} - {(stats.averageProcessingTime + 5).toFixed(0)}분
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">월간 성장률</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">이번 달 총 입금</span>
              <span className="font-medium text-gray-900">
                {stats.monthTotal.count}건
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">총 금액</span>
              <span className="text-gray-700">
                ₩{stats.monthTotal.amountKRW.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}