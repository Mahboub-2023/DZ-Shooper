import React from 'react';
import { Bell, CheckCircle2, Clock, Truck, CreditCard, Tag, ArrowRight } from 'lucide-react';
import { AppNotification, OrderItem } from '../../types';

interface NotificationsViewProps {
  notifications: AppNotification[];
  orders: OrderItem[];
  onSelectOrderById: (orderId: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  orders,
  onSelectOrderById,
  onMarkAllAsRead,
}) => {
  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'pricing':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'payment_accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'payment_rejected':
        return <Clock className="w-4 h-4 text-red-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-4 pb-20 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">مركز الإشعارات</h2>
          <p className="text-[11px] text-slate-600">تحديثات فورية لحالة طلباتك وعمليات الدفع</p>
        </div>
        <button
          onClick={onMarkAllAsRead}
          className="text-xs text-emerald-800 hover:text-emerald-950 font-bold"
        >
          تحديد الكل كمقروء
        </button>
      </div>

      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-white space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-slate-500">لا توجد إشعارات جديدة حالياً</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => notif.orderId && onSelectOrderById(notif.orderId)}
              className={`p-3.5 rounded-xl border transition-all ${
                notif.read
                  ? 'bg-white border-slate-200 opacity-80'
                  : 'bg-emerald-50/40 border-emerald-300 shadow-xs'
              } ${notif.orderId ? 'cursor-pointer hover:border-emerald-500' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{notif.title}</h4>
                    <span className="text-[10px] text-slate-600">{notif.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{notif.message}</p>
                  {notif.orderId && (
                    <span className="text-[10px] text-emerald-800 font-bold inline-flex items-center gap-0.5 pt-1">
                      <span>عرض تفاصيل الطلب</span>
                      <ArrowRight className="w-3 h-3 rotate-180" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
