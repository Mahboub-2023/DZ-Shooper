import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  Filter,
  DollarSign,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Settings,
  Eye,
  Send,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  FileCheck,
  Layers,
  MapPin,
  CheckCircle2,
  PackageCheck,
  ListFilter,
  AlertCircle,
  Zap,
  Mail,
  Globe,
  BookOpen,
  Moon,
  Sun,
} from 'lucide-react';
import { OrderItem, OrderStatus, SystemConfig, SentEmailLog, TrackingEvent } from '../../types';
import { calculateOrderPricing, formatDZD } from '../../utils/currency';
import { AutoPurchaseModal } from './AutoPurchaseModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { ProfitAnalyticsCalculator } from './ProfitAnalyticsCalculator';
import { SmartTrackingModal } from './SmartTrackingModal';
import { AdminHandbook } from './AdminHandbook';

interface AdminDashboardProps {
  orders: OrderItem[];
  systemConfig: SystemConfig;
  onUpdateSystemConfig: (newConfig: SystemConfig) => void;
  onQuoteOrder: (
    orderId: string,
    pricingData: {
      originalPrice: number;
      originalCurrency: 'EUR' | 'USD';
      exchangeRateSquare: number;
      subtotalDZD?: number;
      internationalShippingDZD: number;
      serviceFeeDZD: number;
      totalDZD: number;
    }
  ) => void;
  onVerifyReceipt: (orderId: string, approved: boolean, adminNotes?: string) => void;
  onAddTracking: (
    orderId: string,
    trackingData: {
      trackingNumber: string;
      carrier: string;
      estimatedDelivery: string;
    }
  ) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onBatchAutoPurchase?: (
    orderIds: string[],
    purchaseMeta: { buyerAccount: string; visaLast4: string; notes: string }
  ) => void;
  onSendManualEmail?: (orderId: string, emailLog: SentEmailLog) => void;
  onApplySmartTracking?: (
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  systemConfig,
  onUpdateSystemConfig,
  onQuoteOrder,
  onVerifyReceipt,
  onAddTracking,
  onUpdateOrderStatus,
  onBatchAutoPurchase,
  onSendManualEmail,
  onApplySmartTracking,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'receipts' | 'profits' | 'settings' | 'handbook'>('orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [autoPurchaseOrders, setAutoPurchaseOrders] = useState<OrderItem[]>([]);
  const [viewingOrderDetails, setViewingOrderDetails] = useState<OrderItem | null>(null);
  const [smartTrackingOrder, setSmartTrackingOrder] = useState<OrderItem | null>(null);

  // Dark mode state with persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dz_admin_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('dz_admin_dark_mode', String(next));
      } catch {}
      return next;
    });
  };

  // Modals
  const [quotingOrder, setQuotingOrder] = useState<OrderItem | null>(null);
  const [verifyingOrder, setVerifyingOrder] = useState<OrderItem | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<OrderItem | null>(null);

  // Quoting state
  const [quoteOriginalPrice, setQuoteOriginalPrice] = useState<number>(30);
  const [quoteCurrency, setQuoteCurrency] = useState<'EUR' | 'USD'>('USD');
  const [quoteExchangeRate, setQuoteExchangeRate] = useState<number>(systemConfig.usdToDzdRate);
  const [quoteMarginPercent, setQuoteMarginPercent] = useState<number>(systemConfig.profitMarginPercent);
  const [quoteShippingDZD, setQuoteShippingDZD] = useState<number>(900);

  // Tracking state
  const [carrier, setCarrier] = useState('AliExpress Direct / Algérie Poste');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('2026-10-15');

  // Receipt rejection state
  const [rejectReason, setRejectReason] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SystemConfig>(systemConfig);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Calculations for Admin KPIs
  const totalOrders = orders.length;
  const pendingQuotes = orders.filter((o) => o.status === 'submitted').length;
  const pendingReceipts = orders.filter((o) => o.status === 'receipt_uploaded').length;
  const totalRevenueDZD = orders
    .filter((o) => o.status !== 'rejected' && o.pricing)
    .reduce((sum, o) => sum + (o.pricing?.totalDZD || 0), 0);
  const totalProfitDZD = orders
    .filter((o) => o.status !== 'rejected' && o.pricing)
    .reduce((sum, o) => sum + (o.pricing?.serviceFeeDZD || 0), 0);

  // Status Tabs Definition with live counts and actionable descriptions
  const statusTabs = [
    {
      id: 'all',
      label: 'كافة الطلبات',
      count: orders.length,
      icon: Layers,
      desc: 'عرض ومتابعة كافة الطلبات المسجلة في النظام بمختلف مراحلها.',
    },
    {
      id: 'submitted',
      label: 'بانتظار التسعير',
      count: orders.filter((o) => o.status === 'submitted').length,
      icon: Clock,
      urgent: true,
      desc: 'طلبات جديدة أرسلها الزبائن وتحتاج لمراجعة الرابط وتحديد التكلفة بالدينار لإرسال الإشعار.',
    },
    {
      id: 'waiting_payment',
      label: 'بانتظار الدفع',
      count: orders.filter((o) => o.status === 'waiting_payment').length,
      icon: CreditCard,
      desc: 'طلبات تم تسعيرها وتنتظر تحويل الزبون للمبلغ عبر بريدي موب (BaridiMob).',
    },
    {
      id: 'receipt_uploaded',
      label: 'إيصالات مرفوعة',
      count: orders.filter((o) => o.status === 'receipt_uploaded').length,
      icon: FileCheck,
      urgent: true,
      desc: 'إيصالات تحويل بريدي موب مرفوعة من الزبائن تحتاج لمطابقتها مع كشف الحساب وتأكيد الشراء.',
    },
    {
      id: 'payment_verified',
      label: 'تم الشراء بالفيزا',
      count: orders.filter((o) => o.status === 'payment_verified').length,
      icon: CheckCircle,
      desc: 'طلبات تم تأكيد استلام أموالها وشراؤها بالبطاقة الدولية، بانتظار استخراج رقم التتبع من المتجر.',
    },
    {
      id: 'shipped',
      label: 'تم الشحن دولياً',
      count: orders.filter((o) => o.status === 'shipped').length,
      icon: Truck,
      desc: 'شحنات غادرت المستودع الخارجي برقم تتبع نشط في طريقها إلى الجزائر.',
    },
    {
      id: 'arrived_algeria',
      label: 'وصلت الجزائر',
      count: orders.filter((o) => o.status === 'arrived_algeria').length,
      icon: MapPin,
      desc: 'طرود وصلت إلى مطار هواري بومدين وهي قيد التخليص الجمركي والتسليم للبريد المحلي.',
    },
    {
      id: 'delivered',
      label: 'تم الاستلام بنجاح',
      count: orders.filter((o) => o.status === 'delivered').length,
      icon: CheckCircle2,
      desc: 'طلبات مكتملة تم تسليمها بنجاح للزبائن في ولاياتهم.',
    },
    {
      id: 'rejected',
      label: 'ملغاة أو مرفوضة',
      count: orders.filter((o) => o.status === 'rejected').length,
      icon: XCircle,
      desc: 'طلبات تم إلغاؤها أو إيصالات تحويل مرفوضة لعدم مطابقتها.',
    },
  ];

  // Active status tab metadata
  const currentTabMeta = statusTabs.find((t) => t.id === statusFilter) || statusTabs[0];

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerWilaya.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleSelectOrder = (orderId: string) => {
    if (selectedOrderIds.includes(orderId)) {
      setSelectedOrderIds(selectedOrderIds.filter((id) => id !== orderId));
    } else {
      setSelectedOrderIds([...selectedOrderIds, orderId]);
    }
  };

  const handleOpenQuoteModal = (order: OrderItem) => {
    setQuotingOrder(order);
    const curr = order.platform === 'shein' ? 'EUR' : 'USD';
    setQuoteCurrency(curr);
    const rate = curr === 'EUR' ? systemConfig.eurToDzdRate : systemConfig.usdToDzdRate;
    setQuoteExchangeRate(rate);
    setQuoteOriginalPrice(order.pricing?.originalPrice || 25);
    setQuoteShippingDZD(order.pricing?.internationalShippingDZD || 800);
    setQuoteMarginPercent(systemConfig.profitMarginPercent);
  };

  const handleCurrencyChange = (curr: 'EUR' | 'USD') => {
    setQuoteCurrency(curr);
    setQuoteExchangeRate(curr === 'EUR' ? systemConfig.eurToDzdRate : systemConfig.usdToDzdRate);
  };

  const quoteCalc = calculateOrderPricing(
    quoteOriginalPrice,
    quoteCurrency,
    quoteExchangeRate,
    quoteMarginPercent,
    systemConfig.minimumServiceFeeDZD,
    quoteShippingDZD
  );

  const handleSaveQuote = () => {
    if (!quotingOrder) return;
    onQuoteOrder(quotingOrder.id, {
      originalPrice: quoteOriginalPrice,
      originalCurrency: quoteCurrency,
      exchangeRateSquare: quoteExchangeRate,
      subtotalDZD: quoteCalc.subtotalDZD,
      internationalShippingDZD: quoteShippingDZD,
      serviceFeeDZD: quoteCalc.serviceFeeDZD,
      totalDZD: quoteCalc.totalDZD,
    });
    setQuotingOrder(null);
  };

  const handleSaveTracking = () => {
    if (!trackingOrder || !trackingNumber.trim()) return;
    onAddTracking(trackingOrder.id, {
      carrier,
      trackingNumber: trackingNumber.trim(),
      estimatedDelivery,
    });
    setTrackingOrder(null);
    setTrackingNumber('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSystemConfig(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  return (
    <div
      className={`transition-colors duration-200 min-h-screen ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Banner & KPI Stat Grid */}
        <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b ${
          isDarkMode ? 'border-slate-800' : 'border-slate-200'
        } pb-4`}>
          <div>
            <h1 className={`text-xl sm:text-2xl font-black ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            } flex items-center gap-2`}>
              <LayoutDashboard className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`} />
              <span>لوحة تحكم وسيط التسوق (Admin Portal)</span>
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              إدارة طلبات المتسوقين، تسعير المنتجات، مراجعة إيصالات بريدي موب، وتتبع الشحنات الدولية
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border shadow-2xs ${
                isDarkMode
                  ? 'bg-slate-900 text-amber-300 border-slate-750 hover:bg-slate-800 hover:border-slate-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isDarkMode ? 'التبديل إلى الوضع المضيء' : 'التبديل إلى الوضع الليلي لحماية العين'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>الوضع المضيء</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>الوضع الليلي</span>
                </>
              )}
            </button>

            {/* Tab switcher */}
            <div className={`flex flex-wrap items-center gap-1 p-1 rounded-xl text-xs font-bold border transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/80'
            }`}>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === 'orders'
                    ? isDarkMode ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                إدارة الطلبات ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('receipts')}
                className={`px-3 py-2 rounded-lg transition-all relative ${
                  activeTab === 'receipts'
                    ? isDarkMode ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>مراجعة الإيصالات</span>
                {pendingReceipts > 0 && (
                  <span className="mr-1.5 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-mono">
                    {pendingReceipts}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === 'settings'
                    ? isDarkMode ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                إعدادات السكوار و بريدي موب
              </button>
              <button
                onClick={() => setActiveTab('profits')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'profits'
                    ? isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-xs font-black' : 'bg-white text-emerald-800 shadow-xs font-black'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>حاسبة الأرباح والإحصائيات</span>
              </button>
              <button
                onClick={() => setActiveTab('handbook')}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'handbook'
                    ? 'bg-indigo-900 text-white shadow-xs font-black'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>دليل تشغيل النظام</span>
              </button>
            </div>
          </div>
        </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl p-4 shadow-2xs space-y-1`}>
          <div className={`flex items-center justify-between ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs font-semibold`}>
            <span>بانتظار التسعير</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-blue-500">{pendingQuotes}</div>
          <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>تحتاج لتحديد السعر وإرسال الإشعار للزبون</p>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl p-4 shadow-2xs space-y-1`}>
          <div className={`flex items-center justify-between ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs font-semibold`}>
            <span>إيصالات بريدي موب للمراجعة</span>
            <FileCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-purple-500">{pendingReceipts}</div>
          <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>وصولات تحويل بانتظار مطابقتها مع الحساب</p>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl p-4 shadow-2xs space-y-1`}>
          <div className={`flex items-center justify-between ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs font-semibold`}>
            <span>إجمالي المبيعات بالدينار</span>
            <DollarSign className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`} />
          </div>
          <div className={`text-xl font-black font-mono tabular-nums ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {formatDZD(totalRevenueDZD)}
          </div>
          <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>شاملة سعر السلع والشحن والعمولات</p>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl p-4 shadow-2xs space-y-1`}>
          <div className={`flex items-center justify-between ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-xs font-semibold`}>
            <span>صافي عمولات الوساطة</span>
            <TrendingUp className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`} />
          </div>
          <div className={`text-xl font-black font-mono tabular-nums ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
            {formatDZD(totalProfitDZD)}
          </div>
          <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>أرباحك المباشرة بعد خصم تكلفة السلع</p>
        </div>
      </div>

      {/* Main Tab 1: Orders Management */}
      {activeTab === 'orders' && (
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl shadow-2xs overflow-hidden space-y-0`}>
          {/* Status Tabs Bar */}
          <div className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/60'} p-2 sm:p-3`}>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              {statusTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : isDarkMode
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-amber-300' : 'text-slate-500'
                      }`}
                    />
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono tabular-nums font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.urgent && tab.count > 0
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : isDarkMode
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                    {tab.urgent && tab.count > 0 && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contextual Status Info & Search Controls Row */}
          <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'} flex flex-col md:flex-row md:items-center justify-between gap-3`}>
            {/* Status explanation helper */}
            <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} min-w-0`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <p className="truncate">
                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} ml-1`}>{currentTabMeta.label}:</span>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{currentTabMeta.desc}</span>
              </p>
            </div>

            {/* Search Input & Reset Action */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث بالرقم، الزبون، الولاية، أو السلعة..."
                  className={`w-full pr-9 pl-3 py-1.5 text-xs rounded-xl border ${
                    isDarkMode ? 'bg-slate-950 border-slate-750 text-white placeholder-slate-500 focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-600'
                  } outline-none`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {(statusFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                    isDarkMode ? 'text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  إلغاء الفلتر
                </button>
              )}
            </div>
          </div>

          {/* Multi-Order Batch Selection Action Bar */}
          {selectedOrderIds.length > 0 && (
            <div className="bg-emerald-950 text-white p-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-y border-emerald-800 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="font-bold text-xs">
                  تم تحديد {selectedOrderIds.length} طلبات
                </span>
                <span className="text-[11px] text-emerald-200 hidden sm:inline">
                  (يمكنك تعبئة بيانات العنوان وشراء كافة هذه الطلبات بالفيزا دفعة واحدة)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const selected = orders.filter((o) => selectedOrderIds.includes(o.id));
                    setAutoPurchaseOrders(selected);
                  }}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-[0.98]"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>الشراء والتعبئة التلقائية للطلبات المحددة ({selectedOrderIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrderIds([])}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  إلغاء التحديد
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className={`${isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'} border-b font-bold`}>
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                      onChange={handleToggleSelectAll}
                      className="rounded text-emerald-700 focus:ring-emerald-600"
                    />
                  </th>
                  <th className="py-3 px-4">رقم الطلب</th>
                  <th className="py-3 px-4">الزبون والعنوان الدقيق</th>
                  <th className="py-3 px-4">السلعة والمتجر</th>
                  <th className="py-3 px-4">السعر بالدينار</th>
                  <th className="py-3 px-4">حالة الطلب</th>
                  <th className="py-3 px-4">إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/80 text-slate-200' : 'divide-slate-100 text-slate-900'}`}>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`py-12 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                      لا توجد طلبات مطابقة للبحث أو الفلتر
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSelected = selectedOrderIds.includes(order.id);
                    return (
                      <tr
                        key={order.id}
                        className={`transition-colors ${
                          isSelected
                            ? isDarkMode ? 'bg-emerald-950/40' : 'bg-emerald-50/50'
                            : isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOrder(order.id)}
                            className="rounded text-emerald-700 focus:ring-emerald-600"
                          />
                        </td>

                        {/* Order ID */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setViewingOrderDetails(order)}
                            className={`font-mono font-bold ${
                              isDarkMode ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-800'
                            } transition-colors block text-right`}
                            title="عرض تفاصيل الطلب وسجل المراسلات"
                          >
                            {order.orderNumber}
                          </button>
                          <span className="text-[10px] text-slate-600 font-mono block" dir="ltr">
                            {new Date(order.createdAt).toLocaleDateString('ar-DZ')}
                          </span>

                          {/* Sent Emails Indicator */}
                          <button
                            type="button"
                            onClick={() => setViewingOrderDetails(order)}
                            className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                            title="عرض تفاصيل الطلب وسجل رسائل البريد الإلكتروني"
                          >
                            <Mail className="w-3 h-3 text-emerald-700" />
                            <span>سجل البريد ({order.emailLogs?.length || 0})</span>
                          </button>
                        </td>

                        {/* Customer & Exact Address */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{order.customerName}</span>
                          <span className="text-[11px] text-slate-600 block">{order.customerWilaya}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[180px]" title={order.customerAddress}>
                            {order.customerAddress}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600 block" dir="ltr">
                            {order.customerPhone}
                          </span>
                        </td>

                        {/* Product */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={order.productImageUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800 line-clamp-1 block">
                                {order.productTitle}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-1 rounded">
                                  {order.platform}
                                </span>
                                {order.productUrl && (
                                  <a
                                    href={order.productUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5"
                                  >
                                    <span>الرابط الأصلي</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Pricing */}
                        <td className="py-3 px-4">
                          {order.pricing ? (
                            <div className="space-y-0.5">
                              <span className="font-bold font-mono text-slate-900 block tabular-nums">
                                {formatDZD(order.pricing.totalDZD)}
                              </span>
                              <span className="text-[10px] text-emerald-800 font-medium block">
                                الربح: {formatDZD(order.pricing.serviceFeeDZD)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              غير مسعر بعد
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold border inline-block ${
                              order.status === 'submitted'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : order.status === 'waiting_payment'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                                : order.status === 'receipt_uploaded'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : order.status === 'payment_verified'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : order.status === 'shipped'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : order.status === 'arrived_algeria'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {order.status === 'submitted' && 'قيد التسعير'}
                            {order.status === 'waiting_payment' && 'بانتظار الدفع'}
                            {order.status === 'receipt_uploaded' && 'وصل بريدي موب مرفوع'}
                            {order.status === 'payment_verified' && 'تم الشراء بالفيزا'}
                            {order.status === 'shipped' && 'تم الشحن دولياً'}
                            {order.status === 'arrived_algeria' && 'وصلت الجزائر'}
                            {order.status === 'delivered' && 'تم الاستلام'}
                            {order.status === 'rejected' && 'ملغى'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {/* Action 1: Quote */}
                            {order.status === 'submitted' && (
                              <button
                                onClick={() => handleOpenQuoteModal(order)}
                                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>تسعير الآن</span>
                              </button>
                            )}

                            {/* Action 2: Review Receipt */}
                            {order.status === 'receipt_uploaded' && (
                              <button
                                onClick={() => setVerifyingOrder(order)}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                              >
                                <FileCheck className="w-3 h-3" />
                                <span>مراجعة الوصل</span>
                              </button>
                            )}

                            {/* Action 3: Add Tracking */}
                            {(order.status === 'payment_verified' || order.status === 'shipped') && (
                              <button
                                onClick={() => {
                                  setTrackingOrder(order);
                                  setTrackingNumber(order.tracking?.trackingNumber || '');
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                              >
                                <Truck className="w-3 h-3" />
                                <span>{order.tracking ? 'تحديث التتبع' : 'إضافة كود التتبع'}</span>
                              </button>
                            )}

                            {/* Action 3.5: Smart Tracking Auto-Update */}
                            {(order.status === 'payment_verified' || order.status === 'shipped' || order.status === 'arrived_algeria' || !!order.tracking) && (
                              <button
                                type="button"
                                onClick={() => setSmartTrackingOrder(order)}
                                className="px-2.5 py-1 bg-gradient-to-r from-indigo-800 to-slate-900 hover:from-indigo-900 hover:to-black text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all shrink-0"
                                title="تحديث حالة التتبع الذكي بجلب بيانات المواقع العالمية وإشعار العميل بدفع فوري"
                              >
                                <Globe className="w-3 h-3 text-indigo-300" />
                                <span>تتبع ذكي</span>
                              </button>
                            )}

                            {/* Action 4: 1-Click Auto-Purchase & Address Dispatch */}
                            <button
                              type="button"
                              onClick={() => setAutoPurchaseOrders([order])}
                              className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                              title="إرسال بيانات العنوان للمتجر المربوط والشراء بالفيزا بعد التحقق"
                            >
                              <Zap className="w-3 h-3 fill-slate-950" />
                              <span>شراء تلقائي</span>
                            </button>

                            {/* Action 5: View Details & Email History */}
                            <button
                              type="button"
                              onClick={() => setViewingOrderDetails(order)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold flex items-center gap-1 border border-slate-200 transition-colors shrink-0"
                              title="عرض تفاصيل الطلب وسجل رسائل البريد الإلكتروني"
                            >
                              <Mail className="w-3 h-3 text-emerald-700" />
                              <span>البريد ({order.emailLogs?.length || 0})</span>
                            </button>

                            {/* Status change dropdown */}
                            <select
                              value={order.status}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700 outline-none"
                            >
                              <option value="submitted">قيد التسعير</option>
                              <option value="waiting_payment">بانتظار الدفع</option>
                              <option value="receipt_uploaded">وصل مرفوع</option>
                              <option value="payment_verified">تم الشراء</option>
                              <option value="shipped">مشحونة</option>
                              <option value="arrived_algeria">وصلت الجزائر</option>
                              <option value="delivered">تم الاستلام</option>
                              <option value="rejected">إلغاء الطلب</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Tab 2: Receipts Verification Desk */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-purple-950">مكتب مراجعة إيصالات بريدي موب (BaridiMob Desk)</h2>
              <p className="text-xs text-purple-800">
                هنا تظهر الإيصالات المرفوعة من الزبائن لمطابقتها مع وصول الأموال في حسابك الجاري قبل إجراء الشراء الدولي.
              </p>
            </div>
            <span className="px-3 py-1 bg-purple-200 text-purple-900 rounded-lg font-bold text-xs font-mono">
              {pendingReceipts} إيصالات معلقة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders
              .filter((o) => o.paymentReceipt)
              .map((order) => {
                const receipt = order.paymentReceipt!;
                const isVerified = order.status === 'payment_verified' || order.status === 'shipped' || order.status === 'arrived_algeria';

                return (
                  <div
                    key={order.id}
                    className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl p-4 shadow-2xs space-y-3`}
                  >
                    <div className={`flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} pb-2`}>
                      <div>
                        <span className={`font-mono font-bold text-xs ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{order.orderNumber}</span>
                        <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} block`}>{order.customerName} - {order.customerWilaya}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isVerified ? 'تم التحقق' : 'بانتظار التأكيد'}
                      </span>
                    </div>

                    {/* Receipt Image Preview */}
                    <div className={`${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-xl p-2 border text-center`}>
                      <img
                        src={receipt.receiptUrl}
                        alt="وصل بريدي موب"
                        className="max-h-52 mx-auto rounded-lg shadow-2xs"
                      />
                    </div>

                    {/* Details */}
                    <div className={`grid grid-cols-2 gap-2 text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-800'} p-2.5 rounded-xl border`}>
                      <div>
                        <span className="text-slate-400 block text-[10px]">رقم المعاملة (TXN):</span>
                        <span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} text-xs`} dir="ltr">
                          {receipt.transactionNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">المبلغ المحول:</span>
                        <span className="font-mono font-bold text-emerald-500 text-xs tabular-nums">
                          {formatDZD(receipt.amountDZD)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">تاريخ الإرسال:</span>
                        <span className="font-mono text-slate-400 text-[10px]" dir="ltr">
                          {new Date(receipt.submittedAt).toLocaleString('ar-DZ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">السلعة:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} truncate block text-[11px]`}>
                          {order.productTitle}
                        </span>
                      </div>
                    </div>

                    {/* Verification Actions */}
                    {!isVerified && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onVerifyReceipt(order.id, true)}
                          className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تأكيد استلام الأموال بالـ CCP</span>
                        </button>

                        <button
                          onClick={() => {
                            const reason = prompt('أدخل سبب رفض الوصل (مثال: الوصل غير واضح أو المبلغ غير مطابق):');
                            if (reason) {
                              onVerifyReceipt(order.id, false, reason);
                            }
                          }}
                          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1 border border-red-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>رفض الوصل</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Main Tab 3: System Settings & Square Rates */}
      {activeTab === 'settings' && (
        <div className={`max-w-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl p-6 shadow-2xs space-y-6`}>
          <div>
            <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
              <Settings className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`} />
              <span>إعدادات أسعار صرف السكوار وحساب بريدي موب</span>
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
              تتحكم هذه القيم مباشرة في الحسابات التلقائية لتسعير السلع للزبائن
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>تم حفظ الإعدادات الجديدة وتحديث أسعار الصرف بنجاح!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            {/* Exchange Rates Grid */}
            <div className={`space-y-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-4`}>
              <h3 className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} text-xs`}>أسعار صرف السوق الموازي (السكوار الجزائري)</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} block`}>سعر صرف اليورو (EUR to DZD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={settingsForm.eurToDzdRate}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, eurToDzdRate: parseFloat(e.target.value) || 0 })
                      }
                      className={`w-full px-3 py-2 border ${isDarkMode ? 'bg-slate-950 border-slate-750 text-white' : 'border-slate-300 text-slate-900'} rounded-xl font-mono text-sm font-bold outline-none`}
                    />
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-xs`}>د.ج</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} block`}>سعر صرف الدولار (USD to DZD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={settingsForm.usdToDzdRate}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, usdToDzdRate: parseFloat(e.target.value) || 0 })
                      }
                      className={`w-full px-3 py-2 border ${isDarkMode ? 'bg-slate-950 border-slate-750 text-white' : 'border-slate-300 text-slate-900'} rounded-xl font-mono text-sm font-bold outline-none`}
                    />
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-xs`}>د.ج</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Margin */}
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-800 text-xs">سياسة الأرباح وهوامش الوساطة</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 block">نسبة العمولة الافتراضية (%)</label>
                  <input
                    type="number"
                    value={settingsForm.profitMarginPercent}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, profitMarginPercent: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 block">الحد الأدنى للعمولة (للطلبات الصغيرة)</label>
                  <input
                    type="number"
                    value={settingsForm.minimumServiceFeeDZD}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, minimumServiceFeeDZD: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* BaridiMob Postal info */}
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-800 text-xs">بيانات حساب بريدي موب المعروضة للزبائن</h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-slate-600 block">رقم الـ RIP (المكون من 20 رقماً)</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.baridiMobDetails.rip}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        baridiMobDetails: { ...settingsForm.baridiMobDetails, rip: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 outline-none"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600 block">رقم الـ CCP والمفتاح</label>
                    <input
                      type="text"
                      value={settingsForm.baridiMobDetails.ccp}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          baridiMobDetails: { ...settingsForm.baridiMobDetails, ccp: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 block">اسم صاحب الحساب</label>
                    <input
                      type="text"
                      value={settingsForm.baridiMobDetails.accountName}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          baridiMobDetails: { ...settingsForm.baridiMobDetails, accountName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition-all text-xs"
            >
              حفظ وتطبيق الإعدادات الفورية
            </button>
          </form>
        </div>
      )}

      {/* Main Tab 4: Profit Calculator & Monthly Aggregated Analytics */}
      {activeTab === 'profits' && (
        <ProfitAnalyticsCalculator orders={orders} systemConfig={systemConfig} isDarkMode={isDarkMode} />
      )}

      {/* Main Tab 5: Admin Handbook & Operator Guide */}
      {activeTab === 'handbook' && (
        <AdminHandbook
          systemConfig={systemConfig}
          pendingQuotesCount={orders.filter((o) => o.status === 'submitted').length}
          pendingReceiptsCount={pendingReceipts}
          totalOrdersCount={orders.length}
          onNavigateTab={(tab) => setActiveTab(tab)}
          isDarkMode={isDarkMode}
        />
      )}
      </div>

      {/* Modal 1: Price Quoting Engine */}
      {quotingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-750 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in duration-200 text-xs`}>
            <div className={`flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-3`}>
              <div>
                <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>تسعير الطلب: {quotingOrder.orderNumber}</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>حساب السعر بالدينار الجزائري وإرسال الإشعار للزبون</p>
              </div>
              <button onClick={() => setQuotingOrder(null)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Product summary */}
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <img src={quotingOrder.productImageUrl} alt="" className="w-12 h-12 rounded object-cover" />
              <div className="min-w-0">
                <span className="font-bold text-slate-900 block truncate">{quotingOrder.productTitle}</span>
                <span className="text-[10px] text-slate-500">
                  المنصة: {quotingOrder.platform.toUpperCase()} | الولاية: {quotingOrder.customerWilaya}
                </span>
              </div>
            </div>

            {/* Quoting Inputs */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">سعر السلعة الأصلي في الموقع</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={quoteOriginalPrice}
                      onChange={(e) => setQuoteOriginalPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs outline-none"
                    />
                    <select
                      value={quoteCurrency}
                      onChange={(e) => handleCurrencyChange(e.target.value as 'EUR' | 'USD')}
                      className="px-2 py-1.5 border border-slate-300 rounded-lg font-bold text-xs bg-white"
                    >
                      <option value="USD">USD $</option>
                      <option value="EUR">EUR €</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">سعر الصرف المعتمد (السكوار)</label>
                  <input
                    type="number"
                    value={quoteExchangeRate}
                    onChange={(e) => setQuoteExchangeRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">تكلفة الشحن الدولي (DZD)</label>
                  <input
                    type="number"
                    value={quoteShippingDZD}
                    onChange={(e) => setQuoteShippingDZD(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">نسبة هامش الربح والعمولة (%)</label>
                  <input
                    type="number"
                    value={quoteMarginPercent}
                    onChange={(e) => setQuoteMarginPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Breakdown Card */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 space-y-1 font-mono text-slate-700">
              <div className="flex justify-between text-[11px]">
                <span className="font-sans">سعر السلعة بالدينار:</span>
                <span>{formatDZD(quoteCalc.subtotalDZD)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="font-sans">الشحن الدولي:</span>
                <span>{formatDZD(quoteCalc.internationalShippingDZD)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-800 font-bold">
                <span className="font-sans">عمولة الوساطة (صافي الربح):</span>
                <span>{formatDZD(quoteCalc.serviceFeeDZD)}</span>
              </div>
              <div className="border-t border-emerald-200 pt-1.5 flex justify-between items-center text-sm font-black text-slate-900">
                <span className="font-sans">المبلغ النهائي المطلوب من الزبون:</span>
                <span className="text-emerald-800">{formatDZD(quoteCalc.totalDZD)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveQuote}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال التسعيرة للزبون وإصدار إشعار فوري</span>
              </button>
              <button
                type="button"
                onClick={() => setQuotingOrder(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Verify Receipt */}
      {verifyingOrder && verifyingOrder.paymentReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900">مراجعة وصل بريدي موب للطلب: {verifyingOrder.orderNumber}</h3>
              <button onClick={() => setVerifyingOrder(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
              <img
                src={verifyingOrder.paymentReceipt.receiptUrl}
                alt="وصل التحويل"
                className="max-h-64 mx-auto rounded-lg shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
              <div>
                <span className="text-slate-500 font-sans block text-[10px]">رقم المعاملة:</span>
                <span className="font-bold text-slate-900">{verifyingOrder.paymentReceipt.transactionNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[10px]">المبلغ المطلوب:</span>
                <span className="font-bold text-emerald-800">{formatDZD(verifyingOrder.paymentReceipt.amountDZD)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onVerifyReceipt(verifyingOrder.id, true);
                  setVerifyingOrder(null);
                }}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>تأكيد استلام المبلغ وشراء السلعة بالفيزا</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const reason = prompt('سبب رفض الوصل:');
                  if (reason) {
                    onVerifyReceipt(verifyingOrder.id, false, reason);
                    setVerifyingOrder(null);
                  }
                }}
                className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl border border-red-200"
              >
                رفض الوصل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Add/Update Tracking */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-750 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in duration-200 text-xs`}>
            <div className={`flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} pb-3`}>
              <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>إضافة أو تحديث كود التتبع الدولي</h3>
              <button onClick={() => setTrackingOrder(null)} className="text-slate-400 hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Smart Tracking Banner Option */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-700 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block text-[11px]">ميزة التتبع الذكي التلقائي:</span>
                  <span className="text-[10px] text-slate-600">ألصق رابط 17TRACK لجلب الحالة والمحطات آلياً</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const target = trackingOrder;
                  setTrackingOrder(null);
                  setSmartTrackingOrder(target);
                }}
                className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 shadow-2xs"
              >
                <Zap className="w-3 h-3 fill-white" />
                <span>فتح التتبع الذكي</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">شركة الشحن أو طريقة الشحن</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white outline-none"
                >
                  <option value="AliExpress Direct / Algérie Poste">AliExpress Direct / Algérie Poste</option>
                  <option value="Cainiao Super Economy Global">Cainiao Super Economy Global</option>
                  <option value="Yanwen Economic Air Mail">Yanwen Economic Air Mail</option>
                  <option value="EMS Algérie Poste (سريع)">EMS Algérie Poste (سريع)</option>
                  <option value="DHL Express Algeria">DHL Express Algeria</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">رقم التتبع (Tracking Number)</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="مثال: DZ-LP983421098CN أو LP00192841"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs font-bold outline-none"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">تاريخ الوصول التقريبي</label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveTracking}
                disabled={!trackingNumber.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>حفظ وإرسال إشعار الشحن للزبون</span>
              </button>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: 1-Click Auto-Purchase & Address Dispatch */}
      {autoPurchaseOrders.length > 0 && (
        <AutoPurchaseModal
          orders={autoPurchaseOrders}
          systemConfig={systemConfig}
          onClose={() => setAutoPurchaseOrders([])}
          onConfirmPurchase={(orderIds, purchaseMeta) => {
            if (onBatchAutoPurchase) {
              onBatchAutoPurchase(orderIds, purchaseMeta);
            } else {
              orderIds.forEach((id) => {
                onUpdateOrderStatus(
                  id,
                  'payment_verified',
                  `تم الشراء التلقائي بنقرة واحدة (${purchaseMeta.buyerAccount}) عبر فيزا تنتهي بـ ${purchaseMeta.visaLast4}: ${purchaseMeta.notes}`
                );
              });
            }
            setSelectedOrderIds([]);
            setAutoPurchaseOrders([]);
          }}
        />
      )}

      {/* Modal 5: Order Details & Email Notifications History */}
      {viewingOrderDetails && (
        <OrderDetailsModal
          order={orders.find((o) => o.id === viewingOrderDetails.id) || viewingOrderDetails}
          systemConfig={systemConfig}
          onClose={() => setViewingOrderDetails(null)}
          onSendManualEmail={(orderId, emailLog) => {
            if (onSendManualEmail) {
              onSendManualEmail(orderId, emailLog);
            }
          }}
        />
      )}

      {/* Modal 6: Smart Tracking Status Auto-Update */}
      {smartTrackingOrder && (
        <SmartTrackingModal
          order={orders.find((o) => o.id === smartTrackingOrder.id) || smartTrackingOrder}
          onClose={() => setSmartTrackingOrder(null)}
          onApplyTracking={(orderId, trackingData, newStatus, pushNotification) => {
            if (onApplySmartTracking) {
              onApplySmartTracking(orderId, trackingData, newStatus, pushNotification);
            } else {
              onAddTracking(orderId, {
                trackingNumber: trackingData.trackingNumber,
                carrier: trackingData.carrier,
                estimatedDelivery: trackingData.estimatedDelivery,
              });
              onUpdateOrderStatus(orderId, newStatus);
            }
            setSmartTrackingOrder(null);
          }}
        />
      )}
    </div>
  );
};
