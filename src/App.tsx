import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileFrame } from './components/MobileSimulator/MobileFrame';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';
import { ArchitectureBlueprint } from './components/ArchitectureDocs/ArchitectureBlueprint';
import { INITIAL_SYSTEM_CONFIG, INITIAL_NOTIFICATIONS, INITIAL_USER_PROFILE } from './data/mockData';
import { OrderItem, OrderStatus, SystemConfig, AppNotification, UserProfile, SentEmailLog } from './types';
import { formatDZD } from './utils/currency';

// --- استدعاء دوال Firebase ---
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
// -----------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'admin' | 'architecture' | 'rates'>('simulator');
  const [orders, setOrders] = useState<OrderItem[]>([]); 
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_SYSTEM_CONFIG);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // --- دالة جلب الطلبات المباشرة (Real-time Listener) ---
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveOrders: OrderItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        liveOrders.push({
          ...data,
          id: doc.id,
          orderNumber: data.orderNumber || `DZ-${doc.id.substring(0, 6).toUpperCase()}`,
          customerName: data.customerName || 'زبون جديد',
          customerPhone: data.customerPhone || '',
          customerWilaya: data.customerWilaya || '',
          productTitle: data.productTitle || '',
          status: data.status === 'pending' ? 'submitted' : (data.status || 'submitted'),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as OrderItem);
      });
      setOrders(liveOrders);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAdminLogin = () => {
    if (pinInput === '2026') {
      setIsAdminAuthenticated(true);
      showToast('✅ تم تسجيل الدخول كمدير بنجاح');
      setPinInput('');
    } else {
      showToast('❌ الرمز السري غير صحيح');
      setPinInput('');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setActiveTab('simulator');
    showToast('تم تسجيل الخروج من لوحة الإدارة');
  };

  const handleCreateOrder = (newOrderData: Partial<OrderItem>) => {
    showToast('جاري إرسال الطلب...');
  };

  // --- دوال الإدارة المرتبطة بـ Firebase ---

  const handleQuoteOrder = async (orderId: string, pricingData: any) => {
    try {
      showToast('جاري حفظ التسعير السحابي...');
      const orderRef = doc(db, 'orders', orderId);
      const subtotal = pricingData.subtotalDZD ?? Math.round(pricingData.originalPrice * pricingData.exchangeRateSquare);
      
      await updateDoc(orderRef, {
        status: 'waiting_payment', 
        pricing: { 
          ...pricingData, 
          subtotalDZD: subtotal, 
          quotedAt: new Date().toISOString() 
        },
        updatedAt: new Date().toISOString()
      });
      showToast('✅ تم تسعير الطلب وحفظه بنجاح!');
    } catch (error) {
      console.error(error);
      showToast('❌ حدث خطأ أثناء حفظ التسعير.');
    }
  };

  const handleSubmitReceipt = async (orderId: string, receiptData: any) => {
    try {
      showToast('جاري رفع الوصل...');
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'receipt_uploaded',
        paymentReceipt: { ...receiptData, submittedAt: new Date().toISOString() },
        updatedAt: new Date().toISOString()
      });
      showToast('🧾 تم رفع وصل بريدي موب بنجاح!');
    } catch (error) {
      console.error(error);
      showToast('❌ حدث خطأ أثناء رفع الوصل.');
    }
  };

  const handleVerifyReceipt = async (orderId: string, approved: boolean, adminNotes?: string) => {
    try {
      showToast('جاري تحديث حالة الدفع...');
      const orderRef = doc(db, 'orders', orderId);
      const newStatus = approved ? 'payment_verified' : 'waiting_payment';
      
      await updateDoc(orderRef, {
        status: newStatus,
        'paymentReceipt.isApproved': approved,
        'paymentReceipt.verifiedAt': new Date().toISOString(),
        'paymentReceipt.adminNotes': adminNotes || '',
        updatedAt: new Date().toISOString()
      });
      showToast(approved ? '✅ تم تأكيد استلام الأموال' : '❌ تم رفض الوصل وإعادته للزبون');
    } catch (error) {
      console.error(error);
      showToast('❌ حدث خطأ أثناء التحقق.');
    }
  };

  const handleAddTracking = async (orderId: string, trackingData: any) => {
    try {
      showToast('جاري إضافة التتبع...');
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'shipped',
        tracking: {
          ...trackingData,
          lastUpdate: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString()
      });
      showToast('✈️ تم تعيين كود التتبع بنجاح!');
    } catch (error) {
      console.error(error);
      showToast('❌ حدث خطأ أثناء إضافة التتبع.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date().toISOString()
      });
      showToast(`تم تحديث حالة الطلب إلى ${status}`);
    } catch (error) {
      showToast('❌ حدث خطأ أثناء تحديث الحالة.');
    }
  };

  // --- دوال أخرى ---

  const handleBatchAutoPurchase = () => {
    showToast('جاري الشراء التلقائي...');
  };

  const handleSendManualEmail = () => {
    showToast('تم إرسال الإشعار!');
  };

  const handleApplySmartTracking = () => {
    showToast('تم تحديث التتبع الذكي');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-['Cairo',sans-serif] md:bg-slate-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        eurRate={systemConfig.eurToDzdRate}
        usdRate={systemConfig.usdToDzdRate}
      />

      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 md:top-20 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[100] bg-slate-900/95 backdrop-blur-sm text-white px-5 py-4 md:py-3 rounded-2xl md:rounded-xl shadow-2xl text-sm md:text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300 border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
          <span className="leading-tight">{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto md:p-4">
        {activeTab === 'simulator' && (
          <MobileFrame
            orders={orders}
            systemConfig={systemConfig}
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            notifications={notifications}
            onCreateOrder={handleCreateOrder}
            onSubmitReceipt={handleSubmitReceipt}
            onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          />
        )}

        {activeTab === 'admin' && (
          isAdminAuthenticated ? (
            <div className="relative">
              <div className="absolute top-4 left-4 z-50">
                <button onClick={handleAdminLogout} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                  تسجيل الخروج 🔒
                </button>
              </div>
              <AdminDashboard
                orders={orders}
                systemConfig={systemConfig}
                onUpdateSystemConfig={setSystemConfig}
                onQuoteOrder={handleQuoteOrder}
                onVerifyReceipt={handleVerifyReceipt}
                onAddTracking={handleAddTracking}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onBatchAutoPurchase={handleBatchAutoPurchase}
                onSendManualEmail={handleSendManualEmail}
                onApplySmartTracking={handleApplySmartTracking}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 mt-10 md:mt-32">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-3xl">
                  🔒
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">لوحة تحكم الإدارة</h2>
                <p className="text-sm text-slate-500 mb-6 text-center">التطبيق محمي، يرجى إدخال الرمز السري للوصول إلى صلاحيات المدير.</p>

                <input
                  type="password"
                  maxLength={4}
                  placeholder="****"
                  className="w-full text-center tracking-[1em] text-2xl font-bold border-2 border-slate-200 rounded-xl py-3 mb-4 focus:border-emerald-500 focus:outline-none transition-colors"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdminLogin();
                  }}
                />

                <button
                  onClick={handleAdminLogin}
                  className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  دخول
                </button>
              </div>
            </div>
          )
        )}

        {(activeTab === 'architecture' || activeTab === 'rates') && (
          <ArchitectureBlueprint />
        )}
      </main>

      <footer className="hidden md:block border-t border-slate-200 bg-white py-5 px-6 text-center text-sm text-slate-500 shadow-sm mt-auto">
        <p className="font-medium">
          منصة DZ Shopper الهندسية · وسيط التسوق الجزائري والدفع بالدينار عبر بريدي موب
        </p>
      </footer>
    </div>
  );
}