import React, { useState } from 'react';
import { Home, PlusCircle, ShoppingBag, Bell, Wifi, Battery, Signal, Maximize2, Minimize2, Smartphone, Calculator, HelpCircle, User } from 'lucide-react';
import { OrderItem, SystemConfig, AppNotification, UserProfile } from '../../types';
import { UserHomeView } from './UserHomeView';
import { NewOrderView } from './NewOrderView';
import { MyOrdersView } from './MyOrdersView';
import { NotificationsView } from './NotificationsView';
import { BaridiMobPaymentModal } from './BaridiMobPaymentModal';
import { TrackingView } from './TrackingView';
import { FinalCostCalculator } from './FinalCostCalculator';
import { FAQSection } from './FAQSection';
import { UserProfileView } from './UserProfileView';
import { AuthModal } from './AuthModal';

interface MobileFrameProps {
  orders: OrderItem[];
  systemConfig: SystemConfig;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  notifications: AppNotification[];
  onCreateOrder: (order: Partial<OrderItem>) => void;
  onSubmitReceipt: (orderId: string, receiptData: { transactionNumber: string; receiptUrl: string; amountDZD: number }) => void;
  onMarkAllNotificationsRead: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  orders,
  systemConfig,
  userProfile,
  onUpdateProfile,
  notifications,
  onCreateOrder,
  onSubmitReceipt,
  onMarkAllNotificationsRead,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'calculator' | 'new_order' | 'orders' | 'notifications' | 'faq' | 'profile'>('home');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<OrderItem | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<OrderItem | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [calculatorPrefill, setCalculatorPrefill] = useState<{
    price?: number;
    currency?: 'EUR' | 'USD';
    shippingDZD?: number;
    quantity?: number;
    wilaya?: string;
  } | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'waiting_payment').length;

  const handleOpenOrder = (order: OrderItem | null) => {
    setSelectedOrder(order);
    if (order) {
      setActiveTab('orders');
    }
  };

  const handleOpenOrderById = (orderId: string) => {
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      setSelectedOrder(found);
      setActiveTab('orders');
    }
  };

  const handleProceedFromCalculator = (prefill: {
    price: number;
    currency: 'EUR' | 'USD';
    shippingDZD: number;
    quantity: number;
    wilaya: string;
  }) => {
    setCalculatorPrefill(prefill);
    setActiveTab('new_order');
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-0 md:p-6 bg-slate-50 md:bg-slate-100 min-h-[100dvh] md:min-h-[calc(100vh-4rem)]">
      {/* Viewport Control Bar - only on desktop */}
      <div className="hidden md:flex mb-3 items-center justify-between w-full max-w-md px-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-700" />
          <span className="font-bold text-slate-800">محاكي تطبيق أندرويد</span>
        </div>
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm transition-colors"
        >
          {isPhoneFrame ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>عرض موسع</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>عرض هاتف</span>
            </>
          )}
        </button>
      </div>

      {/* Frame Container - Full screen on real mobile, restricted frame on desktop */}
      <div
        className={`w-full bg-slate-50 relative flex flex-col transition-all duration-300 mx-auto ${
          isPhoneFrame
            ? 'h-[100dvh] rounded-none border-none shadow-none md:max-w-[400px] md:h-[830px] md:rounded-[44px] md:border-[10px] md:border-slate-900 md:shadow-2xl md:overflow-hidden md:ring-1 md:ring-slate-800'
            : 'h-[100dvh] rounded-none border-none shadow-none md:max-w-2xl md:h-[750px] md:rounded-2xl md:border md:border-slate-300 md:shadow-md md:overflow-hidden'
        }`}
      >
        {/* Fake Android Status Bar - Hidden on real mobile devices */}
        <div className="hidden md:flex h-9 bg-slate-900 text-white px-6 items-center justify-between text-[11px] font-mono select-none shrink-0 z-40">
          <span className="font-bold tracking-tight">10:45</span>
          {isPhoneFrame && <div className="w-4 h-4 rounded-full bg-black mx-auto"></div>}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans font-medium text-slate-300">Mobilis 4G</span>
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <Battery className="w-3.5 h-3.5 text-slate-300" />
          </div>
        </div>

        {/* Dynamic App Header */}
        <div className="bg-white border-b border-slate-200 px-3 md:px-4 py-3 md:py-2.5 flex items-center justify-between shrink-0 shadow-sm z-30 pt-safe">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-7 md:h-7 rounded-lg bg-emerald-700 text-white font-black text-xs md:text-xs flex items-center justify-center shadow-sm">
              DZ
            </div>
            <div>
              <h1 className="font-extrabold text-sm md:text-xs text-slate-900 tracking-tight leading-none">DZ Shopper</h1>
              <span className="text-[10px] md:text-[9px] text-slate-500 font-medium">وسيط الشراء الجزائري</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('faq')}
              className={`p-2 md:p-1.5 rounded-xl md:rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                activeTab === 'faq'
                  ? 'bg-emerald-100 text-emerald-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-5 h-5 md:w-4 md:h-4 text-emerald-700" />
              <span className="hidden md:inline text-[11px]">مساعدة</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`p-2 md:p-1.5 rounded-xl md:rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                activeTab === 'calculator'
                  ? 'bg-emerald-100 text-emerald-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calculator className="w-5 h-5 md:w-4 md:h-4 text-emerald-700" />
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 md:p-1.5 rounded-xl md:rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5 md:w-4 md:h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 md:top-1 md:right-1 w-2.5 h-2.5 md:w-2 md:h-2 rounded-full bg-red-600 ring-2 ring-white"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`ml-1 w-8 h-8 md:w-7 md:h-7 rounded-full text-white font-extrabold text-[11px] md:text-[10px] flex items-center justify-center transition-all shadow-sm ${
                activeTab === 'profile'
                  ? 'bg-emerald-900 ring-2 ring-emerald-400'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {userProfile.avatarInitials || userProfile.fullName.slice(0, 2)}
            </button>
          </div>
        </div>

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 relative pb-4">
          {activeTab === 'home' && (
            <UserHomeView
              orders={orders}
              systemConfig={systemConfig}
              userProfile={userProfile}
              onNavigateToNewOrder={() => {
                setCalculatorPrefill(null);
                setActiveTab('new_order');
              }}
              onNavigateToOrders={() => {
                setSelectedOrder(null);
                setActiveTab('orders');
              }}
              onNavigateToProfile={() => setActiveTab('profile')}
              onSelectOrder={handleOpenOrder}
              onProceedToOrderWithPrefill={handleProceedFromCalculator}
            />
          )}

          {activeTab === 'profile' && (
            <UserProfileView
              userProfile={userProfile}
              orders={orders}
              onUpdateProfile={onUpdateProfile}
              onSelectOrder={handleOpenOrder}
              onNavigateToNewOrder={() => {
                setCalculatorPrefill(null);
                setActiveTab('new_order');
              }}
              onOpenAuthModal={() => setShowAuthModal(true)}
            />
          )}

          {activeTab === 'faq' && (
            <div className="p-3 md:p-4">
              <FAQSection
                systemConfig={systemConfig}
                onNavigateToNewOrder={() => {
                  setCalculatorPrefill(null);
                  setActiveTab('new_order');
                }}
              />
            </div>
          )}

          {activeTab === 'calculator' && (
            <FinalCostCalculator
              systemConfig={systemConfig}
              onProceedToOrder={handleProceedFromCalculator}
            />
          )}

          {activeTab === 'new_order' && (
            <NewOrderView
              systemConfig={systemConfig}
              userProfile={userProfile}
              initialPrefill={calculatorPrefill || undefined}
              onSubmitOrder={(data) => {
                onCreateOrder(data);
                setCalculatorPrefill(null);
                setActiveTab('orders');
              }}
              onCancel={() => {
                setCalculatorPrefill(null);
                setActiveTab('home');
              }}
            />
          )}

          {activeTab === 'orders' && (
            <MyOrdersView
              orders={orders}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              onOpenPaymentModal={(order) => setPaymentModalOrder(order)}
              onOpenTrackingModal={(order) => setTrackingModalOrder(order)}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              orders={orders}
              onSelectOrderById={handleOpenOrderById}
              onMarkAllAsRead={onMarkAllNotificationsRead}
            />
          )}
        </div>

        {/* Ergonomic Bottom Navigation Bar */}
        <nav className="h-16 md:h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center shrink-0 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => {
              setSelectedOrder(null);
              setActiveTab('home');
            }}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5 md:w-5 md:h-5 mb-1" />
            <span className="text-[10px]">الرئيسية</span>
          </button>

          <button
            onClick={() => {
              setSelectedOrder(null);
              setActiveTab('calculator');
            }}
            className={`flex flex-col items-center justify-center h-full transition-colors ${
              activeTab === 'calculator' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-5 h-5 md:w-5 md:h-5 mb-1" />
            <span className="text-[10px]">الحاسبة</span>
          </button>

          <button
            onClick={() => {
              setCalculatorPrefill(null);
              setActiveTab('new_order');
            }}
            className="flex flex-col items-center justify-center h-full relative -top-3"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform ${
              activeTab === 'new_order' ? 'bg-emerald-800 scale-110' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}>
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <span className={`text-[10px] mt-1 ${activeTab === 'new_order' ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
              طلب جديد
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedOrder(null);
              setActiveTab('orders');
            }}
            className={`flex flex-col items-center justify-center h-full relative transition-colors ${
              activeTab === 'orders' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative mb-1">
              <ShoppingBag className="w-5 h-5 md:w-5 md:h-5" />
              {pendingOrdersCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {pendingOrdersCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">طلباتي</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center justify-center h-full relative transition-colors ${
              activeTab === 'notifications' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative mb-1">
              <Bell className="w-5 h-5 md:w-5 md:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">الإشعارات</span>
          </button>
        </nav>
      </div>

      {/* Modals outside phone container for full visibility and usability */}
      {paymentModalOrder && (
        <BaridiMobPaymentModal
          order={paymentModalOrder}
          systemConfig={systemConfig}
          onClose={() => setPaymentModalOrder(null)}
          onSubmitReceipt={onSubmitReceipt}
        />
      )}

      {trackingModalOrder && (
        <TrackingView
          order={trackingModalOrder}
          onClose={() => setTrackingModalOrder(null)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          currentUser={userProfile}
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(updatedUser) => {
            onUpdateProfile(updatedUser);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
};