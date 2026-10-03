import React, { useState } from 'react';
import {
  Mail,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  User,
  MapPin,
  Phone,
  Package,
  ExternalLink,
  Truck,
  CreditCard,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  XCircle,
  FileText,
} from 'lucide-react';
import { OrderItem, SentEmailLog, SystemConfig } from '../../types';
import { formatDZD } from '../../utils/currency';
import { generateOrderEmail } from '../../utils/emailSimulator';
import { EmailPreviewModal } from './EmailPreviewModal';

interface OrderDetailsModalProps {
  order: OrderItem;
  systemConfig: SystemConfig;
  onClose: () => void;
  onSendManualEmail: (orderId: string, emailLog: SentEmailLog) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  systemConfig,
  onClose,
  onSendManualEmail,
}) => {
  const [selectedEmailForPreview, setSelectedEmailForPreview] = useState<SentEmailLog | null>(null);
  const [showManualEmailForm, setShowManualEmailForm] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const emailLogs = order.emailLogs || [];

  const handleSendCustomEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      const generated = generateOrderEmail(order, 'manual', {
        customNote: customMessage,
        systemConfig,
      });

      if (customSubject.trim()) {
        generated.subject = customSubject.trim();
      }

      onSendManualEmail(order.id, generated);
      setIsSending(false);
      setShowManualEmailForm(false);
      setCustomMessage('');
      setCustomSubject('');
      setSuccessNotice('تم إرسال الإشعار البريدي إلى الزبون بنجاح!');
      setTimeout(() => setSuccessNotice(null), 3000);
    }, 600);
  };

  const handleResendExisting = (emailToResend: SentEmailLog) => {
    const freshLog: SentEmailLog = {
      ...emailToResend,
      id: `email-${Date.now()}`,
      sentAt: new Date().toLocaleString('ar-DZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'delivered',
    };
    onSendManualEmail(order.id, freshLog);
    setSelectedEmailForPreview(null);
    setSuccessNotice('تمت إعادة إرسال البريد الإلكتروني بنجاح!');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 text-xs">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner font-mono font-bold text-sm">
              DZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">تفاصيل الطلب وسجل المراسلات البريدية</h3>
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-white/20 text-white text-xs">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                تاريخ الإنشاء: {new Date(order.createdAt).toLocaleString('ar-DZ')} · المنصة:{' '}
                <span className="uppercase font-bold">{order.platform}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors font-bold text-sm"
          >
            ×
          </button>
        </div>

        {/* Success Alert Banner */}
        {successNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-emerald-900 font-bold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Grid: Customer Details & Order Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>بيانات الزبون وعنوان التوصيل</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ID: {order.userId}</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">الاسم واللقب:</span>
                  <span className="font-bold text-slate-900">
                    {order.customerFirstName && order.customerLastName
                      ? `${order.customerFirstName} ${order.customerLastName}`
                      : order.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">البريد الإلكتروني للزبون:</span>
                  <span className="font-mono font-bold text-emerald-800" dir="ltr">
                    {order.customerEmail || 'abdessamad.dz@gmail.com'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الهاتف:</span>
                  <span className="font-mono font-bold text-slate-900" dir="ltr">
                    {order.customerPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">الولاية والبلدية:</span>
                  <span className="font-semibold text-slate-900">
                    {order.customerWilaya} {order.customerCommune ? `(${order.customerCommune})` : ''}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 block text-[10px]">العنوان الدقيق بالضبط:</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{order.customerAddress}</span>
                </div>
              </div>
            </div>

            {/* Product & Financial Overview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-700" />
                  <span>السلعة والتسعير</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {order.status}
                </span>
              </div>

              <div className="flex items-start gap-3 text-[11px]">
                <img
                  src={order.productImageUrl}
                  alt={order.productTitle}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 line-clamp-2 leading-snug">{order.productTitle}</h4>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                    <span>الكمية: {order.productVariants.quantity}</span>
                    {order.productVariants.color && <span>اللون: {order.productVariants.color}</span>}
                    {order.productVariants.size && <span>المقاس: {order.productVariants.size}</span>}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">السعر الأصلي:</span>
                  <span className="font-bold text-slate-800">
                    {order.pricing ? `${order.pricing.originalPrice} ${order.pricing.originalCurrency}` : 'لم يحدد'}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-slate-500 text-[10px] block font-sans">المبلغ النهائي بالدينار:</span>
                  <span className="font-bold text-emerald-800 text-xs">
                    {order.pricing ? formatDZD(order.pricing.totalDZD) : 'قيد التسعير'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Notifications System Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span>سجل رسائل البريد الإلكتروني المرسلة للزبون ({emailLogs.length})</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  محاكاة الإشعارات البريدية التلقائية الصادرة عند كل تحديث في مسار الطلب
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowManualEmailForm(!showManualEmailForm)}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{showManualEmailForm ? 'إلغاء النموذج' : 'إرسال بريد يدوي مخصص'}</span>
              </button>
            </div>

            {/* Manual Email Composer Form */}
            {showManualEmailForm && (
              <form
                onSubmit={handleSendCustomEmail}
                className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 space-y-3 animate-in fade-in"
              >
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>إنشاء وإرسال إشعار بريدي مخصص للزبون</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono font-normal">
                    إلى: {order.customerEmail || 'abdessamad.dz@gmail.com'}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">موضوع الرسالة (اختياري - افتراضي تلقائي)</label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder={`[DZ Shopper] إشعار إداري بخصوص طلبك رقم ${order.orderNumber}`}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 outline-none bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">نص الإشعار / التوجيهات للزبون</label>
                  <textarea
                    required
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="مثال: يرجى العلم أنه تم استلام السلعة بمكتب بريد الجزائر في ولايتكم، يرجى التوجه للاستلام مصحوبين ببطاقة التعريف الوطنية..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 outline-none bg-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualEmailForm(false)}
                    className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? 'جاري الإرسال...' : 'إرسال الإشعار البريدي الآن'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Email Logs List */}
            {emailLogs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-2">
                <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-slate-600 font-semibold text-xs">لا توجد رسائل بريد إلكتروني مسجلة لهذا الطلب بعد</p>
                <p className="text-[11px] text-slate-400">
                  يتم إرسال الرسائل تلقائياً عند تسعير الطلب، تأكيد وصل الدفع، أو إدخال رقم التتبع الدولي.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {emailLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedEmailForPreview(log)}
                    className="rounded-2xl border border-slate-200 bg-white p-3.5 hover:border-emerald-400 hover:shadow-2xs transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <h5 className="font-bold text-slate-900 text-xs group-hover:text-emerald-800 transition-colors">
                          {log.subject}
                        </h5>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
                          {log.status === 'delivered' ? '✓ تم التسليم' : 'مرسل'}
                        </span>
                        <span>{log.sentAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-[11px] text-slate-600">
                      <p className="line-clamp-1 flex-1 text-slate-500">{log.previewSnippet}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmailForPreview(log);
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة البريد</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>نظام إشعارات البريد الإلكتروني المباشر (Automated Transactional Emails)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Render Email Visual Preview if selected */}
      {selectedEmailForPreview && (
        <EmailPreviewModal
          email={selectedEmailForPreview}
          onClose={() => setSelectedEmailForPreview(null)}
          onResend={handleResendExisting}
        />
      )}
    </div>
  );
};
