import React, { useState } from 'react';
import { Calculator, ArrowRight, HelpCircle, Sparkles, Check, RefreshCw, DollarSign, Truck, ShieldCheck, Tag } from 'lucide-react';
import { SystemConfig } from '../../types';
import { ALGERIA_WILAYAS } from '../../data/algeriaWilayas';
import { calculateOrderPricing, formatDZD, formatForeignCurrency } from '../../utils/currency';

interface FinalCostCalculatorProps {
  systemConfig: SystemConfig;
  onProceedToOrder?: (prefill: {
    price: number;
    currency: 'EUR' | 'USD';
    shippingDZD: number;
    quantity: number;
    wilaya: string;
  }) => void;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const FinalCostCalculator: React.FC<FinalCostCalculatorProps> = ({
  systemConfig,
  onProceedToOrder,
  onClose,
  isEmbedded = false,
}) => {
  // Inputs
  const [productPrice, setProductPrice] = useState<string>('35');
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('USD');
  const [quantity, setQuantity] = useState<number>(1);
  const [shippingOption, setShippingOption] = useState<'free' | 'standard' | 'express' | 'custom'>('standard');
  const [customShipping, setCustomShipping] = useState<string>('1200');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('الجزائر العاصمة');
  const [showFormulaExplanation, setShowFormulaExplanation] = useState(false);

  // Active exchange rate based on systemConfig
  const activeRate = currency === 'EUR' ? systemConfig.eurToDzdRate : systemConfig.usdToDzdRate;

  // Determine shipping cost in DZD
  const getShippingDZD = (): number => {
    switch (shippingOption) {
      case 'free':
        return 0;
      case 'standard':
        return 800; // الشحن البريدي العادي المعتاد للطرود الخفيفة
      case 'express':
        return 1600; // شحن مباشر وسريع (AliExpress Direct / EMS)
      case 'custom':
        return parseFloat(customShipping) || 0;
      default:
        return 800;
    }
  };

  const currentShippingDZD = getShippingDZD();
  const parsedPrice = parseFloat(productPrice) || 0;
  const totalOriginalPrice = parsedPrice * quantity;

  // Calculation using system formula
  const pricingResult = calculateOrderPricing(
    totalOriginalPrice,
    currency,
    activeRate,
    systemConfig.profitMarginPercent,
    systemConfig.minimumServiceFeeDZD,
    currentShippingDZD
  );

  const quickPriceButtons = [
    { label: '10$', val: '10', cur: 'USD' as const },
    { label: '25$', val: '25', cur: 'USD' as const },
    { label: '50$', val: '50', cur: 'USD' as const },
    { label: '100$', val: '100', cur: 'USD' as const },
    { label: '30€', val: '30', cur: 'EUR' as const },
    { label: '75€', val: '75', cur: 'EUR' as const },
  ];

  const handleApplyQuickPrice = (val: string, cur: 'EUR' | 'USD') => {
    setProductPrice(val);
    setCurrency(cur);
  };

  const handleProceed = () => {
    if (onProceedToOrder) {
      onProceedToOrder({
        price: parsedPrice,
        currency,
        shippingDZD: currentShippingDZD,
        quantity,
        wilaya: selectedWilaya,
      });
    }
  };

  return (
    <div
      className={`space-y-4 text-xs ${
        isEmbedded
          ? 'rounded-2xl border border-emerald-300 bg-white p-4 shadow-xs'
          : 'p-4 pb-20'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>حاسبة التكلفة النهائية</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                سعر السكوار المعتمد
              </span>
            </h2>
            <p className="text-[11px] text-slate-600">
              احسب التكلفة الدقيقة للسلعة بالدينار الجزائري قبل إرسال طلبك
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-1 rounded-md"
          >
            إغلاق
          </button>
        )}
      </div>

      {/* Exchange Rate Status Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-[11px]">سعر الصرف المستخدم في النظام:</span>
        </div>
        <div className="flex items-center gap-2 font-mono font-bold text-xs tabular-nums">
          <span className={currency === 'EUR' ? 'text-emerald-800 underline' : 'text-slate-500'}>
            1€ = {systemConfig.eurToDzdRate} د.ج
          </span>
          <span className="text-slate-300">|</span>
          <span className={currency === 'USD' ? 'text-blue-800 underline' : 'text-slate-500'}>
            1$ = {systemConfig.usdToDzdRate} د.ج
          </span>
        </div>
      </div>

      {/* Input 1: Product Price & Currency */}
      <div className="space-y-2">
        <label className="font-bold text-slate-800 flex items-center justify-between">
          <span>سعر السلعة في الموقع الأصلي (AliExpress / Shein / Temu)</span>
          <span className="text-[11px] text-emerald-800 font-normal">
            العملة المختارة: {currency}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.5"
              min="1"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl font-mono text-base font-bold text-slate-900 outline-none transition-all"
              dir="ltr"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              {currency === 'EUR' ? 'EUR €' : 'USD $'}
            </span>
          </div>

          {/* Currency Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                currency === 'USD'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              USD $
            </button>
            <button
              type="button"
              onClick={() => setCurrency('EUR')}
              className={`px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                currency === 'EUR'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EUR €
            </button>
          </div>
        </div>

        {/* Quick price chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] text-slate-500 whitespace-nowrap">أسعار شائعة:</span>
          {quickPriceButtons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyQuickPrice(btn.val, btn.cur)}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-[10px] font-mono font-semibold text-slate-700 transition-colors whitespace-nowrap"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input 2: Quantity & Wilaya */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <div className="space-y-1 w-full">
          <label className="font-bold text-slate-800 block">الكمية المطلوبة</label>
          <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white w-full">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="50"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-center font-bold font-mono py-2 text-xs outline-none"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-1 w-full">
          <label className="font-bold text-slate-800 block">ولاية التوصيل (58 ولاية)</label>
          <select
            value={selectedWilaya}
            onChange={(e) => setSelectedWilaya(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-xs outline-none focus:border-emerald-600"
          >
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w.code} value={w.nameAr}>
                {w.code} - {w.nameAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input 3: International Shipping Options */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-800 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-700" />
            <span>نوع الشحن الدولي المقدر</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            {formatDZD(currentShippingDZD)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          <button
            type="button"
            onClick={() => setShippingOption('free')}
            className={`p-2.5 rounded-xl border text-center transition-all w-full flex items-center justify-between sm:flex-col sm:justify-center ${
              shippingOption === 'free'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="block font-bold text-[11px]">شحن مجاني</span>
            <span className="text-[10px] text-emerald-700 font-mono">0 د.ج</span>
          </button>

          <button
            type="button"
            onClick={() => setShippingOption('standard')}
            className={`p-2.5 rounded-xl border text-center transition-all w-full flex items-center justify-between sm:flex-col sm:justify-center ${
              shippingOption === 'standard'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="block font-bold text-[11px]">بريد مسجل عادي</span>
            <span className="text-[10px] text-slate-500 font-mono">800 د.ج</span>
          </button>

          <button
            type="button"
            onClick={() => setShippingOption('express')}
            className={`p-2.5 rounded-xl border text-center transition-all w-full flex items-center justify-between sm:flex-col sm:justify-center ${
              shippingOption === 'express'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="block font-bold text-[11px]">سريع ومضمون (Direct)</span>
            <span className="text-[10px] text-slate-500 font-mono">1,600 د.ج</span>
          </button>
        </div>
      </div>

      {/* DETAILED COST BREAKDOWN CARD */}
      <div className="rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/40 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
          <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-700" />
            <span>تفصيل التكلفة النهائية بالدينار الجزائري (DZD)</span>
          </span>
          <button
            type="button"
            onClick={() => setShowFormulaExplanation(!showFormulaExplanation)}
            className="text-[10px] text-emerald-800 hover:underline flex items-center gap-0.5"
          >
            <HelpCircle className="w-3 h-3" />
            <span>كيف يتم الحساب؟</span>
          </button>
        </div>

        {/* Breakdown Rows */}
        <div className="space-y-2 font-mono text-slate-700 text-xs w-full">
          {/* Row 1: Item subtotal */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 w-full">
            <span className="font-sans text-slate-600">
              سعر السلعة ({formatForeignCurrency(totalOriginalPrice, currency)} × {activeRate} د.ج):
            </span>
            <span className="font-bold text-slate-900 tabular-nums">
              {formatDZD(pricingResult.subtotalDZD)}
            </span>
          </div>

          {/* Row 2: Service Fee */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 w-full">
            <span className="font-sans text-slate-600">
              رسوم الخدمة والوساطة ({systemConfig.profitMarginPercent}% - حد أدنى {systemConfig.minimumServiceFeeDZD} د.ج):
            </span>
            <span className="font-bold text-emerald-800 tabular-nums">
              +{formatDZD(pricingResult.serviceFeeDZD)}
            </span>
          </div>

          {/* Row 3: Shipping */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 w-full">
            <span className="font-sans text-slate-600">
              تكلفة الشحن والتوصيل إلى {selectedWilaya}:
            </span>
            <span className="font-bold text-slate-900 tabular-nums">
              {currentShippingDZD === 0 ? 'مجاناً (0 د.ج)' : `+${formatDZD(currentShippingDZD)}`}
            </span>
          </div>
        </div>

        {/* TOTAL FINAL AMOUNT */}
        <div className="border-t-2 border-emerald-300 pt-2.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 w-full">
          <div>
            <span className="text-xs font-bold text-slate-900 block">المبلغ الإجمالي التقريبي:</span>
            <span className="text-[10px] text-slate-500 font-sans block">تدفعه عبر بريدي موب (BaridiMob)</span>
          </div>
          <div className="text-left font-mono">
            <span className="text-2xl font-black text-emerald-800 tabular-nums block leading-none">
              {formatDZD(pricingResult.totalDZD)}
            </span>
          </div>
        </div>

        {/* Explanation drop if clicked */}
        {showFormulaExplanation && (
          <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[10px] text-slate-600 space-y-1 font-sans leading-relaxed animate-in fade-in">
            <p className="font-bold text-emerald-900">معادلة الحساب المعتمدة في النظام:</p>
            <p>1. تحويل سعر السلعة: السعر بالعملة الأجنبية × سعر صرف السكوار اليومي المخزن في لوحة التحكم ({activeRate} دج).</p>
            <p>2. عمولة الخدمة: نسبة {systemConfig.profitMarginPercent}% من سعر السلعة بالدينار، بحد أدنى {systemConfig.minimumServiceFeeDZD} دج لتغطية مصاريف المعاملة والبطاقة الدولية.</p>
            <p>3. يضاف الشحن الدولي المختار ليكون هذا هو المبلغ الذي ستحوله عند قبول الطلب.</p>
          </div>
        )}
      </div>

      {/* Action CTA: Proceed to order */}
      {onProceedToOrder && (
        <button
          type="button"
          onClick={handleProceed}
          className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs"
        >
          <span>طلب هذه السلعة بهذا السعر الآن</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
      )}
    </div>
  );
};
