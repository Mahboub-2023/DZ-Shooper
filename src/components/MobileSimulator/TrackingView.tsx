import React from 'react';
import { X, Truck, Package, MapPin, CheckCircle2, Clock, Copy, ExternalLink, Plane, Check } from 'lucide-react';
import { OrderItem } from '../../types';

interface TrackingViewProps {
  order: OrderItem;
  onClose: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ order, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const tracking = order.tracking;

  if (!tracking) {
    return null;
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(tracking.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">تتبع الشحنة الدولية (Live Tracking)</h3>
              <p className="text-[11px] text-indigo-200">للطلب: {order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs">
          {/* Tracking Number Card */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-bold">رقم التتبع (Tracking Number):</span>
              <span className="text-[10px] font-bold text-indigo-700 uppercase bg-white px-2 py-0.5 rounded border border-indigo-200">
                {tracking.carrier}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white border border-indigo-200 rounded-lg p-2.5">
              <span className="font-mono text-sm font-extrabold text-slate-900 tracking-wider" dir="ltr">
                {tracking.trackingNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-900 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
              </button>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1">
              <span>تاريخ التوصيل المقدر:</span>
              <span className="font-bold text-slate-800 font-mono">{tracking.estimatedDelivery}</span>
            </div>

            {tracking.trackingUrl && (
              <a
                href={tracking.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-950 font-bold rounded-lg text-center text-xs flex items-center justify-center gap-1.5 transition-colors border border-indigo-300"
              >
                <span>فتح على منصة التتبع العالمية (17TRACK / ParcelsApp)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Product Mini Header */}
          <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
            <img
              src={order.productImageUrl}
              alt={order.productTitle}
              className="w-10 h-10 rounded object-cover shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 truncate text-[11px]">{order.productTitle}</h4>
              <span className="text-[10px] text-slate-600">وجهة التسليم: {order.customerWilaya}</span>
            </div>
          </div>

          {/* Timeline of Logistics Events */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900">سجل محطات الطرد الجوي والبري</h4>

            <div className="space-y-4 relative pr-3 pt-2">
              <div className="absolute top-4 bottom-4 right-6 w-0.5 bg-slate-200 -z-0"></div>

              {tracking.events.map((evt, idx) => {
                const isLatest = idx === tracking.events.length - 1;
                return (
                  <div key={evt.id} className="flex items-start gap-3 relative z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isLatest
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {isLatest ? <Plane className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="space-y-0.5 bg-white border border-slate-200 rounded-xl p-3 flex-1 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-xs ${isLatest ? 'text-emerald-800' : 'text-slate-800'}`}>
                          {evt.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-600" dir="ltr">
                          {evt.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-600" />
                        <span>{evt.location}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">{evt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* External tracking link hint */}
          <div className="p-3 bg-slate-100 rounded-xl text-center space-y-1">
            <p className="text-[10px] text-slate-600">
              يمكنك أيضاً استخدام هذا الكود للتتبع المباشر على منصات الشحن العالمية مثل 17TRACK أو موقع بريد الجزائر (Algérie Poste).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
