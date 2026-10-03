import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  Save,
  CheckCircle,
  ShoppingBag,
  CreditCard,
  Clock,
  Truck,
  ChevronLeft,
  ShieldCheck,
  Edit3,
  Calendar,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { UserProfile, OrderItem, OrderStatus } from '../../types';
import { ALGERIA_WILAYAS } from '../../data/algeriaWilayas';
import { formatDZD } from '../../utils/currency';

interface UserProfileViewProps {
  userProfile: UserProfile;
  orders: OrderItem[];
  onUpdateProfile: (updated: UserProfile) => void;
  onSelectOrder: (order: OrderItem) => void;
  onNavigateToNewOrder: () => void;
  onOpenAuthModal?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userProfile,
  orders,
  onUpdateProfile,
  onSelectOrder,
  onNavigateToNewOrder,
  onOpenAuthModal,
}) => {
  // Form State
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [personalOrdersFilter, setPersonalOrdersFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  // Filter orders strictly belonging to this user
  const userOrders = orders.filter((o) => o.userId === userProfile.id);

  // Statistics
  const totalOrdersCount = userOrders.length;
  const activeOrders = userOrders.filter((o) => o.status !== 'delivered' && o.status !== 'rejected');
  const deliveredOrders = userOrders.filter((o) => o.status === 'delivered');
  const totalSpentDZD = userOrders
    .filter((o) => o.pricing && o.status !== 'rejected')
    .reduce((sum, o) => sum + (o.pricing?.totalDZD || 0), 0);

  // Filtered orders list
  const filteredPersonalOrders = userOrders.filter((order) => {
    if (personalOrdersFilter === 'active') {
      return order.status !== 'delivered' && order.status !== 'rejected';
    }
    if (personalOrdersFilter === 'completed') {
      return order.status === 'delivered';
    }
    return true;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditingAddress(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const statusColors: Record<OrderStatus, string> = {
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    waiting_payment: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
    receipt_uploaded: 'bg-purple-50 text-purple-700 border-purple-200',
    payment_verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    arrived_algeria: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    delivered: 'bg-slate-100 text-slate-700 border-slate-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  const statusLabels: Record<OrderStatus, string> = {
    submitted: 'قيد التسعير',
    waiting_payment: 'بانتظار الدفع',
    receipt_uploaded: 'قيد مراجعة الوصل',
    payment_verified: 'تم الشراء بالفيزا',
    shipped: 'تم الشحن دولياً',
    arrived_algeria: 'وصلت الجزائر',
    delivered: 'تم الاستلام',
    rejected: 'ملغى',
  };

  return (
    <div className="p-4 pb-24 space-y-4 text-xs">
      {/* User Header Profile Card */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3.5">
          {/* Avatar with Initials */}
          <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 backdrop-blur-sm flex items-center justify-center text-white font-extrabold text-xl shadow-inner shrink-0">
            {formData.avatarInitials || formData.fullName.slice(0, 2)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold truncate text-white">{formData.fullName}</h2>
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            </div>
            <p className="text-xs text-emerald-100 font-mono" dir="ltr">
              {formData.phoneNumber}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-100/80 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
              <span>{formData.wilaya}</span>
              {formData.commune && <span>- {formData.commune}</span>}
            </div>
          </div>

          {onOpenAuthModal && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-[10px] flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span>تبديل الحساب</span>
            </button>
          )}
        </div>

        {/* Member Badge Strip */}
        <div className="flex items-center justify-between border-t border-white/15 pt-3 text-[11px] text-emerald-100">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>متسوق جزائري معتمد لدى DZ Shopper</span>
          </div>
          <span className="text-[10px] text-emerald-200 font-mono">
            عضو منذ {new Date(formData.createdAt).toLocaleDateString('ar-DZ')}
          </span>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <span className="text-[10px] text-slate-500 block">إجمالي الطلبات</span>
          <span className="text-base font-black font-mono text-slate-900 tabular-nums">
            {totalOrdersCount}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <span className="text-[10px] text-slate-500 block">طلبات نشطة</span>
          <span className="text-base font-black font-mono text-emerald-800 tabular-nums">
            {activeOrders.length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <span className="text-[10px] text-slate-500 block">المشتريات المنفذة</span>
          <span className="text-xs font-black font-mono text-slate-900 tabular-nums block truncate mt-0.5">
            {formatDZD(totalSpentDZD)}
          </span>
        </div>
      </div>

      {/* Success Banner if saved */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>تم تحديث بيانات الاتصال وعنوان التوصيل بنجاح!</span>
        </div>
      )}

      {/* Contact & Address Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">بيانات الاتصال وعنوان التوصيل</h3>
              <p className="text-[10px] text-slate-500">العنوان المعتمد لاستلام الطرود البريدية والشحنات</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingAddress(!isEditingAddress)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isEditingAddress ? 'إلغاء التعديل' : 'تعديل البيانات'}</span>
          </button>
        </div>

        {isEditingAddress ? (
          <form onSubmit={handleSave} className="space-y-3 pt-1">
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block text-[11px]">الاسم الكامل</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pr-8 pl-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block text-[11px]">رقم هاتف الاتصال</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="06XXXXXXXX"
                    className="w-full pr-8 pl-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-mono"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block text-[11px]">البريد الإلكتروني للإشعارات</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pr-8 pl-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Wilaya & Commune */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block text-[11px]">الولاية (58 ولاية)</label>
                <select
                  value={formData.wilaya}
                  onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:border-emerald-600 outline-none"
                >
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.nameAr}>
                      {w.code} - {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block text-[11px]">البلدية (Commune)</label>
                <input
                  type="text"
                  required
                  value={formData.commune}
                  onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                  placeholder="مثال: باب الزوار"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* Detailed Address */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block text-[11px]">العنوان الدقيق وأقرب مركز بريد</label>
              <input
                type="text"
                required
                value={formData.detailedAddress}
                onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
                placeholder="مثال: حي 8 ماي 1945، عمارة 12، أو مركز بريد باب الزوار"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 outline-none"
              />
            </div>

            {/* Postal code */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block text-[11px]">الرمز البريدي (Code postal)</label>
              <input
                type="text"
                value={formData.postalCode || ''}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="16042"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 outline-none font-mono"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>حفظ البيانات وتحديث العنوان الافتراضي</span>
            </button>
          </form>
        ) : (
          /* Read-only Address Card */
          <div className="space-y-2 text-slate-700 pt-1">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-500 block">الولاية والبلدية:</span>
                <span className="font-bold text-slate-900 block text-xs">
                  {formData.wilaya} - {formData.commune}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">الرمز البريدي:</span>
                <span className="font-mono font-bold text-slate-900 block text-xs" dir="ltr">
                  {formData.postalCode || 'غير محدد'}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-500 block">العنوان الدقيق / مركز البريد:</span>
                <span className="font-semibold text-slate-800 block text-xs">
                  {formData.detailedAddress}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] px-1 text-slate-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-mono" dir="ltr">{formData.phoneNumber}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-700" />
                <span className="font-mono" dir="ltr">{formData.email}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filtered Personal Orders History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">سجل طلباتي الشخصية</h3>
              <p className="text-[10px] text-slate-500">طلبات الحساب الحالية وتاريخ المشتريات</p>
            </div>
          </div>

          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[11px] font-bold">
            {userOrders.length} طلبات
          </span>
        </div>

        {/* Filter subtabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPersonalOrdersFilter('all')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              personalOrdersFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({userOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setPersonalOrdersFilter('active')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              personalOrdersFilter === 'active'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            النشطة ({activeOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setPersonalOrdersFilter('completed')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              personalOrdersFilter === 'completed'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            المكتملة ({deliveredOrders.length})
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-2">
          {filteredPersonalOrders.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 bg-white space-y-2">
              <ShoppingBag className="w-7 h-7 text-slate-300 mx-auto" />
              <p className="text-slate-600 text-xs">لا توجد طلبات في هذا القسم</p>
              <button
                type="button"
                onClick={onNavigateToNewOrder}
                className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-900"
              >
                طلب سلعة جديدة الآن
              </button>
            </div>
          ) : (
            filteredPersonalOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="rounded-xl border border-slate-200 bg-white p-3 hover:border-emerald-400 hover:shadow-2xs transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-800 text-xs">{order.orderNumber}</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {order.platform}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <img
                    src={order.productImageUrl}
                    alt={order.productTitle}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{order.productTitle}</h4>
                    <div className="mt-1 flex items-center justify-between">
                      {order.pricing ? (
                        <span className="font-mono font-bold text-emerald-800 tabular-nums text-xs">
                          {formatDZD(order.pricing.totalDZD)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">قيد التسعير...</span>
                      )}

                      <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-0.5">
                        <span>عرض ومتابعة</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
