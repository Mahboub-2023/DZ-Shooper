import React, { useState } from 'react';
import { PlusCircle, ShoppingBag, ArrowUpRight, ShieldCheck, CheckCircle2, ChevronLeft, Sparkles, Calculator, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { OrderItem, SystemConfig, UserProfile } from '../../types';
import { formatDZD } from '../../utils/currency';
import { FinalCostCalculator } from './FinalCostCalculator';
import { FAQSection } from './FAQSection';

interface UserHomeViewProps {
  orders: OrderItem[];
  systemConfig: SystemConfig;
  userProfile?: UserProfile;
  onNavigateToNewOrder: () => void;
  onNavigateToOrders: () => void;
  onNavigateToProfile?: () => void;
  onSelectOrder: (order: OrderItem) => void;
  onProceedToOrderWithPrefill?: (prefill: {
    price: number;
    currency: 'EUR' | 'USD';
    shippingDZD: number;
    quantity: number;
    wilaya: string;
  }) => void;
}

export const UserHomeView: React.FC<UserHomeViewProps> = ({
  orders,
  systemConfig,
  userProfile,
  onNavigateToNewOrder,
  onNavigateToOrders,
  onNavigateToProfile,
  onSelectOrder,
  onProceedToOrderWithPrefill,
}) => {
  const [showCalculator, setShowCalculator] = useState(true);
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'rejected');
  const pendingPaymentOrders = orders.filter((o) => o.status === 'waiting_payment');

  return (
    <div className="space-y-4 p-4 pb-20">
      {/* Hero Banner / Quick CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white p-5 shadow-sm">
        <div className="relative z-10 space-y-3">
          {/* User profile quick greeting */}
          {userProfile && (
            <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs text-white">
                  {userProfile.avatarInitials || userProfile.fullName.slice(0, 2)}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">مرحباً، {userProfile.fullName}</span>
                  <span className="text-[10px] text-emerald-200 block font-sans">
                    {userProfile.wilaya} {userProfile.commune ? `· ${userProfile.commune}` : ''}
                  </span>
                </div>
              </div>

              {onNavigateToProfile && (
                <button
                  type="button"
                  onClick={onNavigateToProfile}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-semibold text-emerald-100 transition-colors"
                >
                  تعديل العنوان
                </button>
              )}
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 text-emerald-100 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>تسوق من المواقع العالمية بالدينار الجزائري</span>
          </div>
          <h2 className="text-xl font-bold leading-snug">
            اختر أي سلعة من AliExpress أو Shein أو Temu وادفع بـ BaridiMob
          </h2>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            لا تحتاج لبطاقة Visa أو Mastercard دولية. ضع رابط السلعة أو صورتها، وسنتولى الشراء والدفع والتوصيل لباب منزلك أو بريدك المحلي.
          </p>

          <div className="pt-2 flex gap-2">
            <button
              onClick={onNavigateToNewOrder}
              className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-slate-900" />
              <span>طلب سلعة جديدة الآن</span>
            </button>
          </div>
        </div>
      </div>

      {/* BaridiMob Action Alert if user has orders waiting payment */}
      {pendingPaymentOrders.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse shrink-0"></span>
              <span>لديك {pendingPaymentOrders.length} طلب بانتظار التحويل عبر بريدي موب</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              تم تسعير طلبك بالدينار. حوّل المبلغ وارفع صورة الوصل لتأكيد الشراء فوراً.
            </p>
          </div>
          <button
            onClick={() => onSelectOrder(pendingPaymentOrders[0])}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 text-center"
          >
            دفع الآن ببريدي موب
          </button>
        </div>
      )}

      {/* Exchange Rates Live Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-900">سعر الصرف المعتمد (سوق السكوار)</span>
          <span className="text-[10px] text-slate-600">تحديث يومي مباشر</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center w-full">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 w-full flex items-center justify-between sm:flex-col sm:justify-center">
            <span className="text-[11px] text-slate-600">1 يورو (EUR)</span>
            <span className="text-sm font-bold font-mono text-emerald-800 tabular-nums">
              {systemConfig.eurToDzdRate} د.ج
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 w-full flex items-center justify-between sm:flex-col sm:justify-center">
            <span className="text-[11px] text-slate-600">1 دولار (USD)</span>
            <span className="text-sm font-bold font-mono text-blue-800 tabular-nums">
              {systemConfig.usdToDzdRate} د.ج
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Final Cost Calculator Widget */}
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-900">حاسبة التكلفة النهائية (بالدينار DZD)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-[11px] text-emerald-800 font-bold hover:underline flex items-center gap-0.5"
          >
            <span>{showCalculator ? 'إخفاء الحاسبة' : 'فتح وتجربة الحاسبة'}</span>
            {showCalculator ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showCalculator && (
          <FinalCostCalculator
            systemConfig={systemConfig}
            isEmbedded={true}
            onProceedToOrder={onProceedToOrderWithPrefill}
          />
        )}
      </div>

      {/* Supported Platforms Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 w-full">
        <span className="text-xs font-bold text-slate-900 block">المواقع العالمية المدعومة</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center w-full">
          <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 w-full">
            <span className="text-xs font-extrabold text-orange-600 block">AliExpress</span>
            <span className="text-[10px] text-orange-600/80">إلكترونيات وعتاد</span>
          </div>
          <div className="p-2.5 rounded-xl bg-pink-50 border border-pink-100 w-full">
            <span className="text-xs font-extrabold text-pink-600 block">SHEIN</span>
            <span className="text-[10px] text-pink-600/80">ملابس وأزياء</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 w-full">
            <span className="text-xs font-extrabold text-amber-600 block">TEMU</span>
            <span className="text-[10px] text-amber-600/80">تخفيضات شاملة</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 w-full">
            <span className="text-xs font-extrabold text-slate-700 block">متاجر أخرى</span>
            <span className="text-[10px] text-slate-700">أي موقع عالمي</span>
          </div>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-900">طلباتي النشطة ({activeOrders.length})</span>
          </div>
          <button
            onClick={onNavigateToOrders}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-0.5"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-700">ليس لديك طلبات نشطة حالياً</p>
            <button
              onClick={onNavigateToNewOrder}
              className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-medium hover:bg-emerald-800"
            >
              أرسل رابط أول سلعة تريد شراءها
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {activeOrders.slice(0, 3).map((order) => {
              const statusColors = {
                submitted: 'bg-blue-50 text-blue-700 border-blue-200',
                waiting_payment: 'bg-amber-50 text-amber-800 border-amber-300',
                receipt_uploaded: 'bg-purple-50 text-purple-700 border-purple-200',
                payment_verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                arrived_algeria: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                delivered: 'bg-slate-100 text-slate-700 border-slate-200',
                rejected: 'bg-red-50 text-red-700 border-red-200',
              };

              const statusLabels = {
                submitted: 'قيد التسعير',
                waiting_payment: 'بانتظار الدفع',
                receipt_uploaded: 'قيد مراجعة الوصل',
                payment_verified: 'تم الشراء بنجاح',
                shipped: 'تم الشحن دولياً',
                arrived_algeria: 'وصلت الجزائر',
                delivered: 'تم الاستلام',
                rejected: 'ملغى',
              };

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="rounded-xl border border-slate-200 bg-white p-3 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={order.productImageUrl}
                      alt={order.productTitle}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-mono text-slate-600">{order.orderNumber}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-600">{order.platform}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {order.productTitle}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        {order.pricing ? (
                          <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                            {formatDZD(order.pricing.totalDZD)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-600">جاري احتساب السعر</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 mt-2 mr-auto" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step by step simple guide */}
      <div className="rounded-xl bg-slate-100/80 border border-slate-200/80 p-3.5 space-y-2">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>كيف يعمل تطبيق DZ Shopper؟</span>
        </span>
        <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
          <div className="space-y-1">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mx-auto text-xs">
              1
            </div>
            <span className="font-semibold text-slate-800 block">أرسل الرابط</span>
            <span className="text-[10px] text-slate-700">نحسب السعر بالدينار ونرسل إشعاراً</span>
          </div>
          <div className="space-y-1">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mx-auto text-xs">
              2
            </div>
            <span className="font-semibold text-slate-800 block">ادفع بـ BaridiMob</span>
            <span className="text-[10px] text-slate-700">حوّل المبلغ وارفع صورة الوصل</span>
          </div>
          <div className="space-y-1">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center mx-auto text-xs">
              3
            </div>
            <span className="font-semibold text-slate-800 block">نشتري ونشحن</span>
            <span className="text-[10px] text-slate-700">نشتري بالفيزا ونعطيك كود التتبع</span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) Component for New Users */}
      <div className="pt-1">
        <FAQSection
          systemConfig={systemConfig}
          onNavigateToNewOrder={onNavigateToNewOrder}
          isEmbedded={true}
        />
      </div>
    </div>
  );
};
