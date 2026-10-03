import React, { useState } from 'react';
import {
  Truck,
  Globe,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  MapPin,
  Bell,
  Mail,
  Zap,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { OrderItem, OrderStatus, TrackingEvent } from '../../types';
import { fetchSmartTrackingMock, parseTrackingInput, SmartTrackingResult, TrackingScenario } from '../../utils/smartTracker';

interface SmartTrackingModalProps {
  order: OrderItem;
  onClose: () => void;
  onApplyTracking: (
    orderId: string,
    trackingData: {
      trackingNumber: string;
      carrier: string;
      estimatedDelivery: string;
      trackingUrl?: string;
      events: TrackingEvent[];
    },
    newStatus: OrderStatus,
    pushNotification?: {
      title: string;
      message: string;
      type: 'shipped' | 'info';
    }
  ) => void;
}

const PRESET_SAMPLE_LINKS = [
  {
    label: 'رابط 17TRACK (Cainiao)',
    url: 'https://t.17track.net/en#nums=LP00982348210CN',
    carrier: 'Cainiao Super Economy Global',
  },
  {
    label: 'رابط ParcelsApp (AliExpress)',
    url: 'https://parcelsapp.com/en/tracking/DZ-LP983421098CN',
    carrier: 'AliExpress Direct / Algérie Poste',
  },
  {
    label: 'رابط Yanwen Global',
    url: 'https://track.yw56.com.cn/en-US/result.html?code=YW88391028DZ',
    carrier: 'Yanwen Economic Air Mail',
  },
  {
    label: 'رابط EMS بريد الجزائر السريع',
    url: 'https://poste.dz/tracking/EE928192812DZ',
    carrier: 'EMS Algérie Poste (سريع)',
  },
];

export const SmartTrackingModal: React.FC<SmartTrackingModalProps> = ({
  order,
  onClose,
  onApplyTracking,
}) => {
  const initialInput = order.tracking?.trackingUrl || order.tracking?.trackingNumber || 'https://t.17track.net/en#nums=LP00982348210CN';
  const [trackingInput, setTrackingInput] = useState(initialInput);
  const [scenario, setScenario] = useState<TrackingScenario>('customs_algeria');
  const [carrierOverride, setCarrierOverride] = useState<string>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchResult, setFetchResult] = useState<SmartTrackingResult | null>(null);

  // Notification Options
  const [sendPushNotification, setSendPushNotification] = useState(true);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleFetchSmartTracking = async () => {
    if (!trackingInput.trim()) return;
    setIsLoading(true);
    try {
      const result = await fetchSmartTrackingMock(
        trackingInput,
        scenario,
        order.customerWilaya || 'الجزائر العاصمة',
        carrierOverride
      );
      setFetchResult(result);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndApply = () => {
    if (!fetchResult) return;

    onApplyTracking(
      order.id,
      {
        trackingNumber: fetchResult.trackingNumber,
        carrier: fetchResult.carrier,
        estimatedDelivery: fetchResult.estimatedDelivery,
        trackingUrl: fetchResult.trackingUrl,
        events: fetchResult.events,
      },
      fetchResult.suggestedStatus,
      sendPushNotification
        ? {
            title: fetchResult.pushNotificationTitle,
            message: fetchResult.pushNotificationMessage,
            type: 'shipped',
          }
        : undefined
    );

    onClose();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200 text-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Globe className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">تحديث حالة التتبع الذكي (Smart Tracking)</h3>
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-white/20 text-white text-xs">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-[11px] text-indigo-200 mt-0.5">
                جلب حالة الشحنة آلياً عبر محاكاة مزامنة مواقع التتبع العالمية مع إرسال إشعار دفع فوري للعميل
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Order Customer Brief */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">الزبون:</span>
              <strong className="text-slate-900">{order.customerName}</strong>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">ولاية التوصيل:</span>
              <strong className="text-indigo-900">{order.customerWilaya}</strong>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-500">الحالة الحالية للطلب:</span>
              <span className="px-2 py-0.5 rounded-full bg-white border border-slate-300 font-bold text-slate-800">
                {order.status}
              </span>
            </div>
          </div>

          {/* Input Box: Tracking URL or Code */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 block flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>رابط تتبع من موقع عالمي أو رقم الشحنة الدولي (Tracking URL / Number):</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                يدعم 17TRACK, ParcelsApp, Cainiao, Yanwen, EMS
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="https://t.17track.net/en#nums=LP00982348210CN أو أدخل كود التتبع مباشرة..."
                className="w-full px-4 py-2.5 pr-4 pl-28 border-2 border-indigo-200 focus:border-indigo-600 rounded-2xl text-xs font-mono font-bold text-slate-900 outline-none bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleFetchSmartTracking}
                disabled={isLoading || !trackingInput.trim()}
                className="absolute left-1.5 top-1.5 bottom-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الجلب...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>جلب آلي</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 font-bold ml-1">أمثلة سريعة للتجربة:</span>
              {PRESET_SAMPLE_LINKS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    setTrackingInput(preset.url);
                    setCarrierOverride(preset.carrier);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-semibold transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Selector (Realistic Mock Conditions) */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
            <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-indigo-600" />
              <span>حدد مرحلة الشحنة المراد محاكاتها وجلبها من الموقع العالمي:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label
                className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  scenario === 'in_transit'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">✈️ غادرت المصدر (In Transit)</span>
                  <input
                    type="radio"
                    name="scenario"
                    checked={scenario === 'in_transit'}
                    onChange={() => setScenario('in_transit')}
                    className="accent-indigo-600"
                  />
                </div>
                <p className="text-[10px] font-normal text-slate-500">
                  على متن رحلة الشحن الجوي الدولي باتجاه الجزائر
                </p>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  scenario === 'customs_algeria'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">🛬 وصلت الجزائر (Customs)</span>
                  <input
                    type="radio"
                    name="scenario"
                    checked={scenario === 'customs_algeria'}
                    onChange={() => setScenario('customs_algeria')}
                    className="accent-emerald-600"
                  />
                </div>
                <p className="text-[10px] font-normal text-slate-500">
                  بمطار هواري بومدين / قيد التخليص الجمركي
                </p>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  scenario === 'local_post_delivery'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-950 font-bold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">📬 بمكتب البريد المحلي (Post Office)</span>
                  <input
                    type="radio"
                    name="scenario"
                    checked={scenario === 'local_post_delivery'}
                    onChange={() => setScenario('local_post_delivery')}
                    className="accent-purple-600"
                  />
                </div>
                <p className="text-[10px] font-normal text-slate-500">
                  وصلت لمركز بريد ولاية {order.customerWilaya} وجاهزة للاستلام
                </p>
              </label>
            </div>
          </div>

          {/* Results Box */}
          {fetchResult && (
            <div className="rounded-2xl border-2 border-emerald-400 bg-white p-4.5 space-y-4 shadow-sm animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    تم جلب وتحديث حالة الشحنة بنجاح من الخادم العالمي!
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                  شركة الشحن: {fetchResult.carrier}
                </span>
              </div>

              {/* Status Headline Card */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-black text-emerald-950 flex items-center justify-between">
                  <span>{fetchResult.statusHeadline}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-800 text-white rounded-md font-mono">
                    الحالة المقترحة: {fetchResult.suggestedStatus}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 pt-1 border-t border-emerald-200/50">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <strong>الموقع الحالي:</strong> {fetchResult.currentLocation}
                  </span>
                  <span>
                    <strong>تاريخ الوصول المتوقع:</strong>{' '}
                    <span className="font-mono font-bold text-slate-900">{fetchResult.estimatedDelivery}</span>
                  </span>
                </div>
              </div>

              {/* Tracking Code and External Link */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">رقم التتبع المستخرج:</span>
                  <span className="font-mono font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300" dir="ltr">
                    {fetchResult.trackingNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(fetchResult.trackingNumber)}
                    className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 transition-colors"
                    title="نسخ رقم التتبع"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <a
                  href={fetchResult.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 text-[11px]"
                >
                  <span>فتح في موقع التتبع الخارجي</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Checkpoint Timeline Preview */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  سجل المحطات المستوردة ({fetchResult.events.length} مراحل):
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {fetchResult.events.map((ev, idx) => (
                    <div
                      key={ev.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-start gap-2.5 text-[11px]"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900">{ev.status}</strong>
                          <span className="text-[10px] text-slate-500 font-mono" dir="ltr">
                            {ev.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[10px] mt-0.5">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Notification Preview Mockup */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                  <span className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                    <span>معاينة إشعار الدفع الفوري (Push Notification) الذي سيصل لهاتف العميل:</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-900">
                    هاتف الزبون 📱
                  </span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{fetchResult.pushNotificationTitle}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">الآن</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {fetchResult.pushNotificationMessage}
                  </p>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={sendPushNotification}
                    onChange={(e) => setSendPushNotification(e.target.checked)}
                    className="rounded text-indigo-600 accent-indigo-600"
                  />
                  <span>إرسال إشعار دفع (Push Notification) فوري للعميل في التطبيق</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={sendEmailNotification}
                    onChange={(e) => setSendEmailNotification(e.target.checked)}
                    className="rounded text-emerald-600 accent-emerald-600"
                  />
                  <span>إرسال وتوثيق إشعار بريدي للعميل</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            إلغاء
          </button>

          <div className="flex items-center gap-2">
            {!fetchResult && (
              <button
                type="button"
                onClick={handleFetchSmartTracking}
                disabled={isLoading || !trackingInput.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-white" />}
                <span>جلب حالة التتبع آلياً</span>
              </button>
            )}

            {fetchResult && (
              <button
                type="button"
                onClick={handleConfirmAndApply}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 transition-all animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد التحديث وإشعار العميل فوراً</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
