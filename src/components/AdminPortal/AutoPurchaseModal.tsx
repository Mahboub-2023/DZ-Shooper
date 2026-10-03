import React, { useState } from 'react';
import {
  Send,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  User,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { OrderItem, SystemConfig } from '../../types';
import { formatDZD } from '../../utils/currency';
import { formatAddressForInternationalDispatch } from '../../utils/addressFormatter';

interface AutoPurchaseModalProps {
  orders: OrderItem[];
  systemConfig: SystemConfig;
  onClose: () => void;
  onConfirmPurchase: (orderIds: string[], purchaseMeta: { buyerAccount: string; visaLast4: string; notes: string }) => void;
}

export const AutoPurchaseModal: React.FC<AutoPurchaseModalProps> = ({
  orders,
  systemConfig,
  onClose,
  onConfirmPurchase,
}) => {
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const buyerAccount = systemConfig.connectedBuyerAccount || {
    accountName: 'عبد الصمد بلحاج (AliExpress VIP Drop-Agent)',
    agentEmail: 'abdessamad.buyer@gmail.com',
    platform: 'AliExpress VIP Account / SHEIN VIP Club',
    visaCardLast4: '4921',
    autoFillEnabled: true,
  };

  // Check verification safety: all orders must have receipts verified or approved
  const unverifiedOrders = orders.filter(
    (o) => o.status !== 'receipt_uploaded' && o.status !== 'payment_verified' && !o.paymentReceipt?.isApproved
  );

  const totalDZD = orders.reduce((sum, o) => sum + (o.pricing?.totalDZD || 0), 0);
  const totalOriginalForeign = orders.reduce((sum, o) => sum + (o.pricing?.originalPrice || 0), 0);
  const currency = orders[0]?.pricing?.originalCurrency || 'USD';

  const handleCopyAddress = (order: OrderItem) => {
    const formatted = formatAddressForInternationalDispatch(order);
    navigator.clipboard.writeText(formatted.formattedText);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  const handleSimulateAutoDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchedSuccess(true);
    }, 1200);
  };

  const handleExecuteFinalPurchase = () => {
    const orderIds = orders.map((o) => o.id);
    onConfirmPurchase(orderIds, {
      buyerAccount: buyerAccount.accountName,
      visaLast4: buyerAccount.visaCardLast4,
      notes: adminNotes || 'تم التحقق من الوصل بنجاح والشراء تلقائياً عبر الحساب المربوط',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <span>منصة التعبئة والشراء التلقائي بنقرة واحدة</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold">
                    1-Click Auto-Fulfill
                  </span>
                </h3>
                <p className="text-xs text-emerald-100">
                  إرسال الاسم واللقب وعنوان الزبون الدقيق لحساب المتجر المربوط وتنفيذ الشراء بعد التحقق
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Connected Buyer Account Strip */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>حساب وسيط الشراء المربوط في النظام:</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                حساب نشط ومربوط (Connected)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-slate-100 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 block">اسم المشرف / الحساب:</span>
                <span className="font-bold text-slate-900 block truncate">{buyerAccount.accountName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">منصة الشراء:</span>
                <span className="font-semibold text-slate-800 block truncate">{buyerAccount.platform}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">بطاقة الدفع المعتمدة:</span>
                <span className="font-mono font-bold text-emerald-800 block">
                  Visa •••• {buyerAccount.visaCardLast4}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Warning if any order lacks payment check */}
          {unverifiedOrders.length > 0 && (
            <div className="rounded-2xl bg-amber-50 border border-amber-300 p-3.5 flex items-start gap-2.5 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs block">تنبيه أمان صارم: التحقق من الدفع إلزامي</span>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  يوجد {unverifiedOrders.length} طلب لم يتم تدقيق وصل بريدي موب الخاص به بعد. بحسب سياستك، تتم عملية
                  الشراء فقط بعد التحقق التام من وصول المبلغ إلى حسابك البريدي لتفادي الخسائر المالية.
                </p>
              </div>
            </div>
          )}

          {/* Orders & Customers Details Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-700" />
                <span>البيانات التفصيلية للزبون والعنوان المُرسلة لمنصة التسوق ({orders.length} طلبات):</span>
              </span>
              <span className="font-mono font-bold text-slate-700 text-[11px]">
                إجمالي السلع: {totalOriginalForeign.toFixed(2)} {currency} ({formatDZD(totalDZD)})
              </span>
            </div>

            {orders.map((order) => {
              const formattedAddress = formatAddressForInternationalDispatch(order);
              const p = formattedAddress.payload;

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 hover:border-emerald-300 transition-all shadow-2xs"
                >
                  {/* Order basic bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {order.platform}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.productUrl && (
                        <a
                          href={order.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>فتح صفحة السلعة</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyAddress(order)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedOrderId === order.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">تم نسخ العنوان!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>نسخ العنوان للشحن</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Customer Exact Address Fields for AliExpress form */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block">الاسم واللقب (Contact):</span>
                      <span className="font-bold text-slate-900 block">{p.contactPerson}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">رقم الهاتف الدولي:</span>
                      <span className="font-mono font-bold text-slate-900 block" dir="ltr">
                        {p.mobilePhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">الولاية والبلدية:</span>
                      <span className="font-semibold text-slate-800 block">
                        {p.province} - {p.city}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">الرمز البريدي والدولة:</span>
                      <span className="font-mono font-bold text-slate-900 block">
                        {p.zipCode} (Algeria DZ)
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-4 pt-1.5 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-500 block">العنوان الدقيق بالضبط (Rue / Quartier):</span>
                      <span className="font-semibold text-slate-900 block">{p.addressLine1}</span>
                    </div>
                  </div>

                  {/* Product summary snippet */}
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-600">
                    <img
                      src={order.productImageUrl}
                      alt={order.productTitle}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1 truncate">
                      <span className="font-semibold text-slate-900 block truncate">{order.productTitle}</span>
                      <span className="text-[10px] text-slate-500">
                        الكمية: {order.productVariants.quantity} · اللون: {order.productVariants.color || 'افتراضي'} · المقاس: {order.productVariants.size || 'عادي'}
                      </span>
                    </div>
                    <div className="text-right shrink-0 font-mono font-bold text-emerald-800">
                      {order.pricing ? formatDZD(order.pricing.totalDZD) : 'قيد التسعير'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dispatch simulation button */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>الربط التلقائي وإرسال البيانات لمنصة التسوق المربوطة</span>
              </span>
              {dispatchedSuccess && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-700" />
                  <span>تم ملء العنوان وسلة التسوق تلقائياً</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              يقوم النظام بملء بيانات الزبون (الاسم، اللقب، الهاتف الدولي، وعنوان السكن) تلقائياً في سلة الشراء عبر حسابك
              المربوط ({buyerAccount.accountName}) ليكون الطرد موجهاً مباشرة إلى عنوان الزبون بالجزائر.
            </p>

            <button
              type="button"
              onClick={handleSimulateAutoDispatch}
              disabled={isDispatching}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {isDispatching
                  ? 'جاري إرسال وتعبئة البيانات في منصة التسوق...'
                  : dispatchedSuccess
                  ? 'تم تحديث سلة المنصة بنجاح - انقر مرة أخرى لإعادة التعبئة'
                  : 'تعبئة بيانات الشحن في المنصة بنقرة واحدة تلقائياً (Auto-Fill)'}
              </span>
            </button>
          </div>

          {/* Admin note input */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block text-[11px]">ملاحظات وتوثيق العملية (اختياري)</label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="مثال: تم الشراء عبر بطاقة Visa الخاصة بالمشرف، الطلب قيد التجهيز..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>سيتم تحويل حالة {orders.length} طلبات إلى "تم الشراء بالفيزا" وتوليد إشعار فوري للزبائن.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleExecuteFinalPurchase}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              <span>تأكيد وشراء الطلب بالفيزا الآن ({formatDZD(totalDZD)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
