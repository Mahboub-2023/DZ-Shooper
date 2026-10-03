import React, { useState } from 'react';
import { X, Copy, Check, UploadCloud, AlertCircle, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { OrderItem, SystemConfig } from '../../types';
import { formatDZD } from '../../utils/currency';

interface BaridiMobPaymentModalProps {
  order: OrderItem;
  systemConfig: SystemConfig;
  onClose: () => void;
  onSubmitReceipt: (orderId: string, receiptData: { transactionNumber: string; receiptUrl: string; amountDZD: number }) => void;
}

export const BaridiMobPaymentModal: React.FC<BaridiMobPaymentModalProps> = ({
  order,
  systemConfig,
  onClose,
  onSubmitReceipt,
}) => {
  const [copied, setCopied] = useState(false);
  const [txnNumber, setTxnNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string>('');

  const requiredAmount = order.pricing?.totalDZD || 0;

  const handleCopyRip = () => {
    navigator.clipboard.writeText(systemConfig.baridiMobDetails.rip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate SVG mock receipt if user clicks "استخدام وصل تجريبي فوري"
  const handleUseDemoReceipt = () => {
    const mockTxn = `BM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;
    setTxnNumber(mockTxn);

    const svgReceipt = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="340" viewBox="0 0 400 340"><rect width="400" height="340" fill="%23006233"/><rect x="15" y="15" width="370" height="310" rx="14" fill="%23ffffff"/><text x="200" y="50" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="%23006233">ALGERIE POSTE - BARIDIMOB</text><text x="200" y="70" font-family="sans-serif" font-size="11" text-anchor="middle" fill="%2364748b">REÇU DE VIREMENT DE COMPTE A COMPTE</text><line x1="30" y1="85" x2="370" y2="85" stroke="%23e2e8f0" stroke-width="2"/><text x="35" y="115" font-size="12" fill="%2364748b">Montant débité:</text><text x="365" y="115" font-size="16" font-weight="bold" font-family="monospace" text-anchor="end" fill="%230f172a">${requiredAmount.toLocaleString()} DZD</text><text x="35" y="150" font-size="12" fill="%2364748b">Vers le compte RIP:</text><text x="365" y="150" font-size="12" font-family="monospace" text-anchor="end" fill="%230f172a">${systemConfig.baridiMobDetails.rip}</text><text x="35" y="185" font-size="12" fill="%2364748b">Bénéficiaire:</text><text x="365" y="185" font-size="12" font-weight="bold" text-anchor="end" fill="%230f172a">${systemConfig.baridiMobDetails.accountName}</text><text x="35" y="220" font-size="12" fill="%2364748b">N° de transaction:</text><text x="365" y="220" font-size="13" font-family="monospace" font-weight="bold" text-anchor="end" fill="%23006233">${mockTxn}</text><text x="35" y="250" font-size="12" fill="%2364748b">Date et heure:</text><text x="365" y="250" font-size="12" font-family="monospace" text-anchor="end" fill="%2364748b">${new Date().toLocaleString('fr-FR')}</text><rect x="110" y="275" width="180" height="32" rx="6" fill="%23ecfdf5"/><text x="200" y="296" font-size="12" font-weight="bold" text-anchor="middle" fill="%23059669">VIREMENT RÉUSSI</text></svg>`;
    setReceiptImage(svgReceipt);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ضع هنا مفتاح الـ API الخاص بك الذي نسخته من موقع ImgBB
      const imgbbApiKey = '0db04f2559e2066386cecf76211aed23'; 

      const formData = new FormData();
      formData.append('image', file);

      try {
        setIsSubmitting(true);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (data.success) {
          // الحصول على رابط الصورة المرفوع سحابياً
          setReceiptImage(data.data.url);
          if (!txnNumber) {
            setTxnNumber(`BM-IMG-${Date.now().toString().slice(-6)}`);
          }
        } else {
          alert('فشل رفع الصورة، يرجى المحاولة مرة أخرى.');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('حدث خطأ في الاتصال أثناء رفع الصورة.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnNumber.trim() || !receiptImage) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitReceipt(order.id, {
        transactionNumber: txnNumber.trim(),
        receiptUrl: receiptImage,
        amountDZD: requiredAmount,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-800 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs">
              BM
            </div>
            <div>
              <h3 className="font-bold text-sm">الدفع عبر بريدي موب (BaridiMob)</h3>
              <p className="text-[11px] text-emerald-100">للطلب رقم: {order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs">
          {/* Amount Callout */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-700 font-bold">المبلغ الإجمالي المطلوب تحويله:</span>
            <span className="text-lg font-extrabold text-emerald-800 font-mono tabular-nums">
              {formatDZD(requiredAmount)}
            </span>
          </div>

          {/* Postal Account & RIP Details Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">بيانات الحساب البريدي الجاري (RIP)</span>
              <span className="text-[10px] text-slate-700 font-semibold">بريد الجزائر / Algérie Poste</span>
            </div>

            {/* RIP Display with Instant Copy Button */}
            <div className="bg-white border-2 border-dashed border-emerald-400 rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-600 block">رقم الـ RIP المكون من 20 رقماً:</span>
                <span className="font-mono text-xs sm:text-sm font-extrabold tracking-wider text-slate-900 block truncate" dir="ltr">
                  {systemConfig.baridiMobDetails.rip}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyRip}
                className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الـ RIP</span>
                  </>
                )}
              </button>
            </div>

            {/* Account Info Meta */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-600 block">صاحب الحساب:</span>
                <span className="font-bold text-slate-800">{systemConfig.baridiMobDetails.accountName}</span>
              </div>
              <div>
                <span className="text-slate-600 block">رقم الـ CCP والمفتاح:</span>
                <span className="font-mono font-bold text-slate-800" dir="ltr">
                  {systemConfig.baridiMobDetails.ccp} Clé {systemConfig.baridiMobDetails.cle}
                </span>
              </div>
            </div>
          </div>

          {/* BaridiMob Steps */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-1.5">
            <span className="font-bold text-amber-900 block">خطوات التحويل البسيطة:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
              <li>افتح تطبيق <strong>BaridiMob</strong> على هاتفك واختر <strong>Virement (تحويل)</strong>.</li>
              <li>اختر تحويل نحو حساب آخر وألصق رقم الـ <strong>RIP</strong> المنسوخ أعلاه.</li>
              <li>أدخل المبلغ بدقة: <strong>{formatDZD(requiredAmount)}</strong> ثم أكّد العملية برمز الـ OTP.</li>
              <li>قم بحفظ صورة الوصل (Reçu de virement) أو أخذ لقطة شاشة وارفعها أدناه.</li>
            </ol>
          </div>

          {/* Upload Receipt Section */}
          <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 block">رفع وصل التحويل (Capture d'écran)</label>
              <button
                type="button"
                onClick={handleUseDemoReceipt}
                className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold underline"
              >
                توليد وصل تجريبي جاهز
              </button>
            </div>

            {/* Image Preview or Upload Box */}
            {receiptImage ? (
              <div className="relative border-2 border-emerald-500 rounded-xl p-2 bg-slate-50 text-center space-y-2">
                <img
                  src={receiptImage}
                  alt="وصل بريدي موب"
                  className="max-h-48 mx-auto rounded-lg shadow-sm border border-slate-200"
                />
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم تجهيز صورة الوصل بنجاح</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setReceiptImage('')}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    تغيير الصورة
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 block text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/20 transition-all">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                <span className="font-bold text-slate-700 block text-xs">اضغط هنا لرفع صورة الوصل من جهازك</span>
                <span className="text-[10px] text-slate-600 block mt-0.5">JPG, PNG أو لقطة شاشة لهاتف المحمول</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Transaction Number Input */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">رقم المعاملة (N° de Transaction من الوصل)</label>
              <input
                type="text"
                required
                value={txnNumber}
                onChange={(e) => setTxnNumber(e.target.value)}
                placeholder="مثال: BM-20261001-948201 أو 001928472"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-600 outline-none font-mono text-xs font-bold"
                dir="ltr"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!txnNumber.trim() || !receiptImage || isSubmitting}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري إرسال الوصل...' : 'تأكيد إرسال الوصل ومراجعة الإدارة'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
