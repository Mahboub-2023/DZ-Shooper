import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Percent,
  Sliders,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { OrderItem, SystemConfig } from '../../types';
import { formatDZD } from '../../utils/currency';

interface ProfitAnalyticsCalculatorProps {
  orders: OrderItem[];
  systemConfig: SystemConfig;
  isDarkMode?: boolean;
}

export const ProfitAnalyticsCalculator: React.FC<ProfitAnalyticsCalculatorProps> = ({
  orders,
  systemConfig,
  isDarkMode = false,
}) => {
  // Simulator State
  const [simulatedPriceUSD, setSimulatedPriceUSD] = useState<number>(35);
  const [simulatedExchangeRate, setSimulatedExchangeRate] = useState<number>(systemConfig.usdToDzdRate);
  const [simulatedBaseFeeDZD, setSimulatedBaseFeeDZD] = useState<number>(1000);
  const [simulatedPercentageFee, setSimulatedPercentageFee] = useState<number>(8); // 8%
  const [cardTransactionFeePercent, setCardTransactionFeePercent] = useState<number>(1.5); // 1.5% international card fee
  const [simulatedShippingDZD, setSimulatedShippingDZD] = useState<number>(800);
  const [operationalCostDZD, setOperationalCostDZD] = useState<number>(150); // packaging, SMS, calls

  // Monthly Filter
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Compute Per-Order Profit Breakdown
  const enrichedOrders = useMemo(() => {
    return orders.map((order) => {
      const pricing = order.pricing;
      if (!pricing) {
        return {
          order,
          isCompleted: false,
          grossMarginDZD: 0,
          cardFeeDZD: 0,
          operationalCostDZD: 0,
          netProfitDZD: 0,
          netProfitMarginPercent: 0,
          monthKey: new Date(order.createdAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long' }),
        };
      }

      // Check if order is completed / paid
      const isCompleted =
        order.status === 'payment_verified' ||
        order.status === 'shipped' ||
        order.status === 'arrived_algeria' ||
        order.status === 'delivered';

      const grossMarginDZD = pricing.serviceFeeDZD || 0;
      // Est. card payment processing fee: ~1.2% - 1.5% of original purchase price converted
      const cardFeeDZD = Math.round((pricing.subtotalDZD * cardTransactionFeePercent) / 100);
      const estOperationalCost = 150; // Packaging + telecom
      const netProfitDZD = Math.max(0, grossMarginDZD - cardFeeDZD - estOperationalCost);
      const netProfitMarginPercent = pricing.totalDZD > 0 ? (netProfitDZD / pricing.totalDZD) * 100 : 0;

      const orderDate = new Date(order.createdAt);
      const monthKey = orderDate.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long' });

      return {
        order,
        isCompleted,
        grossMarginDZD,
        cardFeeDZD,
        operationalCostDZD: estOperationalCost,
        netProfitDZD,
        netProfitMarginPercent,
        monthKey,
      };
    });
  }, [orders, cardTransactionFeePercent]);

  // Aggregate Key Figures
  const metrics = useMemo(() => {
    const completedOrders = enrichedOrders.filter((item) => item.isCompleted);
    const pendingOrders = enrichedOrders.filter((item) => !item.isCompleted && item.order.pricing);

    const totalRealizedProfitDZD = completedOrders.reduce((sum, item) => sum + item.netProfitDZD, 0);
    const totalPendingProfitDZD = pendingOrders.reduce((sum, item) => sum + item.netProfitDZD, 0);

    const totalCompletedRevenueDZD = completedOrders.reduce((sum, item) => sum + (item.order.pricing?.totalDZD || 0), 0);
    const avgProfitPerCompletedOrder = completedOrders.length > 0 ? totalRealizedProfitDZD / completedOrders.length : 0;
    const overallProfitMargin = totalCompletedRevenueDZD > 0 ? (totalRealizedProfitDZD / totalCompletedRevenueDZD) * 100 : 0;

    return {
      completedCount: completedOrders.length,
      pendingCount: pendingOrders.length,
      totalRealizedProfitDZD,
      totalPendingProfitDZD,
      totalCompletedRevenueDZD,
      avgProfitPerCompletedOrder,
      overallProfitMargin,
    };
  }, [enrichedOrders]);

  // Monthly Aggregated Grouping
  const monthlyStats = useMemo(() => {
    const map: Record<
      string,
      {
        monthKey: string;
        orderCount: number;
        completedCount: number;
        totalGMVDZD: number;
        totalGrossMarginDZD: number;
        totalNetProfitDZD: number;
        avgNetMarginPercent: number;
      }
    > = {};

    enrichedOrders.forEach((item) => {
      const month = item.monthKey;
      if (!map[month]) {
        map[month] = {
          monthKey: month,
          orderCount: 0,
          completedCount: 0,
          totalGMVDZD: 0,
          totalGrossMarginDZD: 0,
          totalNetProfitDZD: 0,
          avgNetMarginPercent: 0,
        };
      }

      map[month].orderCount += 1;
      if (item.isCompleted) {
        map[month].completedCount += 1;
        map[month].totalGMVDZD += item.order.pricing?.totalDZD || 0;
        map[month].totalGrossMarginDZD += item.grossMarginDZD;
        map[month].totalNetProfitDZD += item.netProfitDZD;
      }
    });

    return Object.values(map).map((stat) => ({
      ...stat,
      avgNetMarginPercent: stat.totalGMVDZD > 0 ? (stat.totalNetProfitDZD / stat.totalGMVDZD) * 100 : 0,
    }));
  }, [enrichedOrders]);

  // Dynamic Simulation Calculation
  const simResult = useMemo(() => {
    const subtotalDZD = Math.round(simulatedPriceUSD * simulatedExchangeRate);
    const variableFeeDZD = Math.round((subtotalDZD * simulatedPercentageFee) / 100);
    const totalServiceFeeDZD = simulatedBaseFeeDZD + variableFeeDZD;
    const totalDZD = subtotalDZD + simulatedShippingDZD + totalServiceFeeDZD;

    const cardFeeDZD = Math.round((subtotalDZD * cardTransactionFeePercent) / 100);
    const totalCostsDZD = cardFeeDZD + operationalCostDZD;
    const netProfitDZD = Math.max(0, totalServiceFeeDZD - totalCostsDZD);
    const netProfitMarginPercent = totalDZD > 0 ? (netProfitDZD / totalDZD) * 100 : 0;

    return {
      subtotalDZD,
      totalServiceFeeDZD,
      totalDZD,
      cardFeeDZD,
      totalCostsDZD,
      netProfitDZD,
      netProfitMarginPercent,
    };
  }, [
    simulatedPriceUSD,
    simulatedExchangeRate,
    simulatedBaseFeeDZD,
    simulatedPercentageFee,
    simulatedShippingDZD,
    cardTransactionFeePercent,
    operationalCostDZD,
  ]);

  // Filtered orders list for the table
  const filteredOrders = useMemo(() => {
    return enrichedOrders.filter((item) => {
      if (selectedMonth !== 'all' && item.monthKey !== selectedMonth) {
        return false;
      }
      if (orderStatusFilter === 'completed' && !item.isCompleted) {
        return false;
      }
      if (orderStatusFilter === 'pending' && item.isCompleted) {
        return false;
      }
      return true;
    });
  }, [enrichedOrders, selectedMonth, orderStatusFilter]);

  return (
    <div className={`space-y-6 text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} animate-in fade-in duration-200`}>
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <Calculator className="w-5 h-5 text-emerald-300" />
            </span>
            <h2 className="text-lg font-black text-white">حاسبة وتقديرات الأرباح الصافية (Profit & Margin Engine)</h2>
          </div>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            مراقبة صافي أرباح المنصة بالدينار الجزائري بعد اقتطاع تكاليف الشراء بالعملة الصعبة ورسوم البطاقة الدولية، مع تقارير شهرية مجمعة للطلبات المكتملة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/15 text-center">
            <span className="text-[10px] text-emerald-200 block font-bold">صرف السكوار المعتمد</span>
            <span className="text-base font-extrabold font-mono text-white">
              {systemConfig.usdToDzdRate} دج / $
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/15 text-center">
            <span className="text-[10px] text-emerald-200 block font-bold">رسوم البطاقة المقدرة</span>
            <span className="text-base font-extrabold font-mono text-amber-300">
              {cardTransactionFeePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Realized Net Profit */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-2xs'} rounded-2xl p-4 border space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-xs">الأرباح الصافية المحققة</span>
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {formatDZD(metrics.totalRealizedProfitDZD)}
          </div>
          <div className={`flex items-center justify-between text-[11px] ${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'} pt-1 border-t`}>
            <span>من {metrics.completedCount} طلبات مكتملة</span>
            <span className="text-emerald-400 font-bold">جاهزة للسحب ✓</span>
          </div>
        </div>

        {/* Card 2: Pending Estimated Profit */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-2xs'} rounded-2xl p-4 border space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-xs">الأرباح المتوقعة (قيد المعالجة)</span>
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {formatDZD(metrics.totalPendingProfitDZD)}
          </div>
          <div className={`flex items-center justify-between text-[11px] ${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'} pt-1 border-t`}>
            <span>من {metrics.pendingCount} طلبات قيد الدفع</span>
            <span className="text-amber-400 font-bold">بانتظار التحويل</span>
          </div>
        </div>

        {/* Card 3: Avg Profit per Order */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-2xs'} rounded-2xl p-4 border space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-xs">متوسط الربح الصافي للطلب</span>
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl font-black ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} font-mono`}>
            {formatDZD(Math.round(metrics.avgProfitPerCompletedOrder))}
          </div>
          <div className={`flex items-center justify-between text-[11px] ${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'} pt-1 border-t`}>
            <span>متوسط كل عملية تسوق</span>
            <span className="text-blue-400 font-bold font-mono">
              {metrics.overallProfitMargin.toFixed(1)}% هامش
            </span>
          </div>
        </div>

        {/* Card 4: Total Completed GMV */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 shadow-2xs'} rounded-2xl p-4 border space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-xs">إجمالي حجم المبيعات (GMV)</span>
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl font-black ${isDarkMode ? 'text-purple-300' : 'text-purple-900'} font-mono`}>
            {formatDZD(metrics.totalCompletedRevenueDZD)}
          </div>
          <div className={`flex items-center justify-between text-[11px] ${isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'} pt-1 border-t`}>
            <span>إجمالي تحويلات بريدي موب</span>
            <span className="text-purple-400 font-bold">شامل التكاليف</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Margin Simulator + Monthly Aggregates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 1: Interactive Margin Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <h3 className="font-extrabold text-sm text-slate-900">حاسبة محاكاة هامش الربح لطلب جديد</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              محاكاة حية
            </span>
          </div>

          <div className="space-y-3.5">
            {/* Input 1: Item Price in USD */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>سعر السلعة بالدولار ($):</span>
                <span className="font-mono text-emerald-800 font-black">{simulatedPriceUSD} USD</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={simulatedPriceUSD}
                onChange={(e) => setSimulatedPriceUSD(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5$</span>
                <span>125$</span>
                <span>250$</span>
              </div>
            </div>

            {/* Input 2: Exchange Rate */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>سعر صرف السكوار الموازي (دج / $):</span>
                <span className="font-mono text-slate-900 font-bold">{simulatedExchangeRate} دج</span>
              </div>
              <input
                type="range"
                min="200"
                max="280"
                step="1"
                value={simulatedExchangeRate}
                onChange={(e) => setSimulatedExchangeRate(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* Input 3: Base Service Fee DZD */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">عمولة المنصة الثابتة (دج):</label>
                <input
                  type="number"
                  min="300"
                  max="5000"
                  step="100"
                  value={simulatedBaseFeeDZD}
                  onChange={(e) => setSimulatedBaseFeeDZD(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900 focus:border-emerald-700 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">نسبة عمولة إضافية (%):</label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="1"
                  value={simulatedPercentageFee}
                  onChange={(e) => setSimulatedPercentageFee(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900 focus:border-emerald-700 outline-none"
                />
              </div>
            </div>

            {/* Input 4: Surcharges & Shipping */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">رسوم الشحن الدولي (دج):</label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="100"
                  value={simulatedShippingDZD}
                  onChange={(e) => setSimulatedShippingDZD(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900 focus:border-emerald-700 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">اقتطاع بطاقة الفيزا (%):</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={cardTransactionFeePercent}
                  onChange={(e) => setCardTransactionFeePercent(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900 focus:border-emerald-700 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 p-4 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
              <span>النتيجة المالية التقديرية</span>
              <span className="font-mono text-emerald-800">
                {simResult.netProfitMarginPercent.toFixed(1)}% نسبة الربح
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>سعر السلعة الصافي (المحول بالسكوار):</span>
                <span className="font-mono font-bold text-slate-900">{formatDZD(simResult.subtotalDZD)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>إجمالي هامش الخدمة المحدد:</span>
                <span className="font-mono font-bold text-emerald-800">+{formatDZD(simResult.totalServiceFeeDZD)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>اقتطاع رسوم الفيزا والتشغيل:</span>
                <span className="font-mono font-bold text-red-600">-{formatDZD(simResult.totalCostsDZD)}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-semibold pt-1 border-t border-emerald-200/60">
                <span>المبلغ الإجمالي على الزبون بـ بريدي موب:</span>
                <span className="font-mono font-black text-slate-950">{formatDZD(simResult.totalDZD)}</span>
              </div>
            </div>

            {/* Final Net Profit Pill */}
            <div className="rounded-xl bg-emerald-800 text-white p-3 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-emerald-200 block">صافي ربح المشرف الصافي:</span>
                <span className="text-lg font-black font-mono">{formatDZD(simResult.netProfitDZD)}</span>
              </div>
              <div className="text-left font-mono text-[11px] text-emerald-200">
                <span className="block font-bold">ربح مضمون</span>
                <span className="text-[10px] opacity-80">بعد كل الاقتطاعات</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Monthly Aggregated Statistics (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-slate-900">إحصائيات شهرية مجمعة للطلبات المكتملة</h3>
              </div>
              <span className="text-[11px] text-slate-500">
                الأشهر المسجلة: <strong className="text-slate-800 font-mono">{monthlyStats.length}</strong>
              </span>
            </div>

            {/* Monthly Cards List */}
            <div className="mt-4 space-y-3">
              {monthlyStats.length === 0 ? (
                <div className="p-8 text-center text-slate-400">لا توجد بيانات شهرية كافية بعد</div>
              ) : (
                monthlyStats.map((stat) => (
                  <div
                    key={stat.monthKey}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <h4 className="font-extrabold text-sm text-slate-900">{stat.monthKey}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 text-[10px] font-bold border border-slate-200">
                          {stat.completedCount} طلبات مكتملة
                        </span>
                      </div>

                      <div className="text-left font-mono">
                        <span className="text-[10px] text-slate-500 block">صافي أرباح الشهر:</span>
                        <span className="text-base font-black text-emerald-800">
                          {formatDZD(stat.totalNetProfitDZD)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of GMV vs Profit */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>حجم المبيعات: {formatDZD(stat.totalGMVDZD)}</span>
                        <span className="font-mono font-bold text-emerald-700">
                          نسبة الربحية: {stat.avgNetMarginPercent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(10, stat.avgNetMarginPercent * 3))}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-[10px] text-slate-600 font-mono">
                      <div>
                        <span className="text-slate-400 block">الطلبات الكلية:</span>
                        <span className="font-bold text-slate-800">{stat.orderCount} طلبات</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">رسوم الخدمة:</span>
                        <span className="font-bold text-slate-800">{formatDZD(stat.totalGrossMarginDZD)}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-slate-400 block font-sans">متوسط الربح:</span>
                        <span className="font-bold text-emerald-800">
                          {formatDZD(stat.completedCount > 0 ? Math.round(stat.totalNetProfitDZD / stat.completedCount) : 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              يتم تحديث الإحصائيات الشهرية تلقائياً بمجرد تأكيد استلام وصل بريدي موب أو اكتمال تسليم الشحنة.
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: Per-Order Detailed Profit Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-700" />
              <span>جدول تفصيلي لتقديرات الأرباح الصافية لكل طلب ({filteredOrders.length})</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              مقارنة هامش الخدمة المسعر مقابل التكاليف البنكية وتقدير الربح النهائي لكل طلبية
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Month */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">كافة الأشهر</option>
              {monthlyStats.map((s) => (
                <option key={s.monthKey} value={s.monthKey}>
                  {s.monthKey}
                </option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="all">كافة الحالات</option>
              <option value="completed">الطلبات المكتملة والمحققة فقط</option>
              <option value="pending">الطلبات قيد المعالجة والتسعير</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">رقم الطلب والمنصة</th>
                <th className="py-3 px-4">الزبون والولاية</th>
                <th className="py-3 px-4">المبلغ الكلي (دج)</th>
                <th className="py-3 px-4">هامش الخدمة</th>
                <th className="py-3 px-4">رسوم الفيزا والتشغيل</th>
                <th className="py-3 px-4">صافي الربح التقديري</th>
                <th className="py-3 px-4">نسبة الربحية</th>
                <th className="py-3 px-4">حالة الأرباح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    لا توجد طلبات تطابق الفلتر المختار
                  </td>
                </tr>
              ) : (
                filteredOrders.map((item) => {
                  const ord = item.order;
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order Number & Platform */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-extrabold text-slate-900 block">{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase block">{ord.platform}</span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{ord.customerName}</span>
                        <span className="text-[10px] text-slate-500 block">{ord.customerWilaya}</span>
                      </td>

                      {/* Total Price DZD */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {ord.pricing ? formatDZD(ord.pricing.totalDZD) : 'قيد التسعير'}
                      </td>

                      {/* Gross Service Fee */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {ord.pricing ? formatDZD(ord.pricing.serviceFeeDZD) : '-'}
                      </td>

                      {/* Deductions */}
                      <td className="py-3.5 px-4 font-mono text-red-600">
                        {ord.pricing ? `-${formatDZD(item.cardFeeDZD + item.operationalCostDZD)}` : '-'}
                      </td>

                      {/* Net Profit */}
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-800 text-sm">
                        {ord.pricing ? formatDZD(item.netProfitDZD) : '-'}
                      </td>

                      {/* Margin % */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {ord.pricing ? `${item.netProfitMarginPercent.toFixed(1)}%` : '-'}
                      </td>

                      {/* Realized Status */}
                      <td className="py-3.5 px-4">
                        {item.isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ربح محقق</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>متوقع (قيد الدفع)</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
