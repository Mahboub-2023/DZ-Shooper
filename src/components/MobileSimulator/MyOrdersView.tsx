import React, { useState } from 'react';
import { ShoppingBag, ChevronLeft, CreditCard, Truck, CheckCircle2, Clock, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { OrderItem, OrderStatus } from '../../types';
import { formatDZD } from '../../utils/currency';

interface MyOrdersViewProps {
  orders: OrderItem[];
  selectedOrder: OrderItem | null;
  onSelectOrder: (order: OrderItem | null) => void;
  onOpenPaymentModal: (order: OrderItem) => void;
  onOpenTrackingModal: (order: OrderItem) => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  orders,
  selectedOrder,
  onSelectOrder,
  onOpenPaymentModal,
  onOpenTrackingModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'shipped'>('all');

  const filteredOrders = orders.filter((order) => {
    if (filter === 'pending') {
      return order.status === 'submitted' || order.status === 'waiting_payment';
    }
    if (filter === 'paid') {
      return order.status === 'receipt_uploaded' || order.status === 'payment_verified';
    }
    if (filter === 'shipped') {
      return order.status === 'shipped' || order.status === 'arrived_algeria' || order.status === 'delivered';
    }
    return true;
  });

  const statusLabels: Record<OrderStatus, string> = {
    submitted: 'قيد مراجعة السعر',
    waiting_payment: 'بانتظار تحويل بريدي موب',
    receipt_uploaded: 'قيد التحقق من الوصل',
    payment_verified: 'تم الدفع والشراء بالفيزا',
    shipped: 'تم الشحن دولياً',
    arrived_algeria: 'وصلت الجزائر (في الجمارك)',
    delivered: 'تم الاستلام بنجاح',
    rejected: 'ملغى أو مرفوض',
  };

  const statusColors: Record<OrderStatus, string> = {
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    waiting_payment: 'bg-amber-50 text-amber-800 border-amber-300 font-bold animate-pulse',
    receipt_uploaded: 'bg-purple-50 text-purple-700 border-purple-200',
    payment_verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    arrived_algeria: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    delivered: 'bg-slate-100 text-slate-700 border-slate-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  // If viewing detailed single order
  if (selectedOrder) {
    const steps: { key: OrderStatus; label: string; desc: string }[] = [
      { key: 'submitted', label: 'إرسال الطلب', desc: 'تم إرسال رابط أو صورة السلعة للمراجعة' },
      { key: 'waiting_payment', label: 'التسعير بالدينار', desc: 'تم احتساب السعر بالدينار الجزائري' },
      { key: 'receipt_uploaded', label: 'وصل بريدي موب', desc: 'تم رفع وصل التحويل للتحقق من الحساب' },
      { key: 'payment_verified', label: 'تأكيد الشراء', desc: 'تم الدفع بالبطاقة الدولية Visa للمتجر' },
      { key: 'shipped', label: 'الشحن الدولي', desc: 'السلعة في طريقها للجزائر مع كود التتبع' },
      { key: 'arrived_algeria', label: 'الوصول للجزائر', desc: 'التخليص الجمركي والتسليم للبريد المحلي' },
    ];

    const getStepStatus = (stepKey: OrderStatus) => {
      const orderStatuses: OrderStatus[] = [
        'submitted',
        'waiting_payment',
        'receipt_uploaded',
        'payment_verified',
        'shipped',
        'arrived_algeria',
        'delivered',
      ];
      const currentIndex = orderStatuses.indexOf(selectedOrder.status);
      const stepIndex = orderStatuses.indexOf(stepKey);

      if (selectedOrder.status === 'rejected') return 'failed';
      if (currentIndex > stepIndex) return 'completed';
      if (currentIndex === stepIndex) return 'current';
      return 'upcoming';
    };

    return (
      <div className="p-4 pb-24 space-y-4 text-xs">
        {/* Header back */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <button
            onClick={() => onSelectOrder(null)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لقائمة الطلبات</span>
          </button>
          <span className="font-mono text-slate-700 font-bold">{selectedOrder.orderNumber}</span>
        </div>

        {/* Product card summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
          <div className="flex gap-3">
            <img
              src={selectedOrder.productImageUrl}
              alt={selectedOrder.productTitle}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {selectedOrder.platform}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 line-clamp-2">{selectedOrder.productTitle}</h3>
              {selectedOrder.productUrl && (
                <a
                  href={selectedOrder.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-sans"
                >
                  <span>فتح الرابط الأصلي</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            {selectedOrder.productVariants.color && (
              <div>
                <span className="text-slate-500 block">اللون:</span>
                <span className="font-bold text-slate-800">{selectedOrder.productVariants.color}</span>
              </div>
            )}
            {selectedOrder.productVariants.size && (
              <div>
                <span className="text-slate-500 block">المقاس / النوع:</span>
                <span className="font-bold text-slate-800">{selectedOrder.productVariants.size}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 block">الكمية:</span>
              <span className="font-bold text-slate-800 font-mono">{selectedOrder.productVariants.quantity}</span>
            </div>
            <div>
              <span className="text-slate-500 block">ولاية التوصيل:</span>
              <span className="font-bold text-slate-800">{selectedOrder.customerWilaya}</span>
            </div>
          </div>
        </div>

        {/* Action Callouts */}
        {selectedOrder.status === 'waiting_payment' && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <CreditCard className="w-4 h-4 text-amber-700" />
              <span>مطلوب الدفع عبر بريدي موب (BaridiMob)</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              تمت دراسة طلبك وتحديد السعر النهائي بالدينار الجزائري. يرجى إرسال المبلغ عبر بريدي موب إلى حسابنا البريدي ورفع صورة الوصل للبدء في الشراء فوراً.
            </p>
            <button
              onClick={() => onOpenPaymentModal(selectedOrder)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>عرض تفاصيل الـ RIP ورفع وصل الدفع</span>
            </button>
          </div>
        )}

        {selectedOrder.status === 'receipt_uploaded' && selectedOrder.paymentReceipt && (
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-purple-900 font-bold">
              <Clock className="w-4 h-4 text-purple-700" />
              <span>وصل بريدي موب قيد مراجعة الإدارة</span>
            </div>
            <p className="text-[11px] text-purple-800">
              تم استلام وصل التحويل رقم{' '}
              <span className="font-mono font-bold">{selectedOrder.paymentReceipt.transactionNumber}</span> بمبلغ{' '}
              <span className="font-mono font-bold">{formatDZD(selectedOrder.paymentReceipt.amountDZD)}</span>. يتحقق
              فريقنا من الحساب البريدي وسنقوم بتأكيد الشراء بالفيزا خلال دقائق.
            </p>
          </div>
        )}

        {(selectedOrder.status === 'shipped' || selectedOrder.status === 'arrived_algeria') && selectedOrder.tracking && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <Truck className="w-4 h-4 text-indigo-700" />
                <span>السلعة مشحونة برقم تتبع دولي</span>
              </div>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 font-bold text-indigo-800">
                {selectedOrder.tracking.trackingNumber}
              </span>
            </div>
            <p className="text-[11px] text-indigo-800">
              الناقل: {selectedOrder.tracking.carrier} | آخر تحديث: {selectedOrder.tracking.events[selectedOrder.tracking.events.length - 1]?.status}
            </p>
            <button
              onClick={() => onOpenTrackingModal(selectedOrder)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>تتبع مسار الشحنة بالكامل لحظة بلحظة</span>
            </button>
          </div>
        )}

        {/* Financial Breakdown */}
        {selectedOrder.pricing ? (
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5">
            <h4 className="font-bold text-slate-900 flex items-center justify-between">
              <span>تفاصيل الحسبة المالية</span>
              <span className="text-[10px] text-slate-500 font-normal">سعر الصرف: {selectedOrder.pricing.exchangeRateSquare} د.ج</span>
            </h4>

            <div className="space-y-1.5 text-[11px] border-b border-slate-100 pb-2.5 font-mono">
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">سعر السلعة الأصلي بالموقع:</span>
                <span>
                  {selectedOrder.pricing.originalPrice} {selectedOrder.pricing.originalCurrency} ≈{' '}
                  {formatDZD(selectedOrder.pricing.subtotalDZD)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">الشحن الدولي المقدر:</span>
                <span>{formatDZD(selectedOrder.pricing.internationalShippingDZD)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">عمولة الوساطة والشراء:</span>
                <span>{formatDZD(selectedOrder.pricing.serviceFeeDZD)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-slate-900">المبلغ الإجمالي المطلوب بالدينار:</span>
              <span className="text-base font-extrabold text-emerald-800 font-mono tabular-nums">
                {formatDZD(selectedOrder.pricing.totalDZD)}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center space-y-1">
            <Clock className="w-6 h-6 text-slate-400 mx-auto" />
            <span className="font-bold text-slate-800 block">قيد الدراسة والتسعير</span>
            <p className="text-[11px] text-slate-500">يقوم فريقنا الآن بفحص الرابط وتحديد تكلفة الشحن والصرف وسنرسل لك إشعاراً بالمبلغ الإجمالي بالدينار.</p>
          </div>
        )}

        {/* Visual Progress Stepper */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
          <h4 className="font-bold text-slate-900">مراحل تنفيذ الطلب</h4>
          <div className="space-y-3 relative pr-2">
            <div className="absolute top-3 bottom-3 right-5 w-0.5 bg-slate-200 -z-0"></div>

            {steps.map((st, idx) => {
              const state = getStepStatus(st.key);
              return (
                <div key={idx} className="flex items-start gap-3 relative z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      state === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : state === 'current'
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-100'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {state === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <span
                      className={`font-bold block text-xs ${
                        state === 'current'
                          ? 'text-amber-900'
                          : state === 'completed'
                          ? 'text-slate-900'
                          : 'text-slate-600'
                      }`}
                    >
                      {st.label}
                    </span>
                    <span className="text-[11px] text-slate-600 leading-tight block">{st.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Orders list view
  return (
    <div className="p-4 pb-20 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">سجل طلباتي</h2>
          <p className="text-[11px] text-slate-600">تتبع مشترياتك الدولية وادفع ببريدي موب</p>
        </div>
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-md border border-emerald-200 font-mono">
          {orders.length} طلبات
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 font-bold rounded-md transition-all text-center ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          الكل ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-1.5 font-bold rounded-md transition-all text-center ${
            filter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          قيد المعالجة
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`flex-1 py-1.5 font-bold rounded-md transition-all text-center ${
            filter === 'paid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          تم الدفع
        </button>
        <button
          onClick={() => setFilter('shipped')}
          className={`flex-1 py-1.5 font-bold rounded-md transition-all text-center ${
            filter === 'shipped' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          مشحونة
        </button>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-white space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-700">لا توجد طلبات تطابق الفلتر المحدد</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder(order)}
              className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-800">{order.orderNumber}</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {order.platform}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={order.productImageUrl}
                  alt={order.productTitle}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{order.productTitle}</h4>
                  <div className="mt-1 flex items-center justify-between">
                    {order.pricing ? (
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 font-mono tabular-nums">
                          {formatDZD(order.pricing.totalDZD)}
                        </span>
                        <span className="text-[10px] text-slate-600 block">شامل العمولة والشحن</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-600">بانتظار التسعير...</span>
                    )}

                    <span className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-0.5">
                      <span>التفاصيل</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick contextual CTA */}
              {order.status === 'waiting_payment' && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPaymentModal(order);
                  }}
                  className="bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 rounded-lg p-2 flex items-center justify-between text-xs font-bold transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-800" />
                    <span>ادفع الآن عبر بريدي موب</span>
                  </span>
                  <span>اضغط هنا ⬅️</span>
                </div>
              )}

              {order.status === 'shipped' && order.tracking && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTrackingModal(order);
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-lg p-2 flex items-center justify-between text-xs font-bold transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-indigo-700" />
                    <span>كود التتبع: {order.tracking.trackingNumber}</span>
                  </span>
                  <span>تتبع الشحنة ⬅️</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
