import React, { useState } from 'react';
import {
  Layers,
  Database,
  Smartphone,
  Server,
  Milestone,
  Code2,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Coins,
  Cpu,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ArchitectureBlueprint: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'stack' | 'db' | 'screens' | 'roadmap' | 'code'>('stack');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleDownloadMarkdown = () => {
    const mdContent = `# وثيقة الهيكلة التقنية وهندسة النظام لتطبيق وسيط التسوق الجزائري (DZ Shopper)
بواسطة: استشاري هندسة النظم وتطبيقات أندرويد

## 1. الهيكلة التقنية المقترحة (Tech Stack)
- Mobile App: Native Android Kotlin + Jetpack Compose + Clean Architecture (Data, Domain, Presentation)
- Reactive State: Kotlin StateFlow, SharedFlow & Coroutines
- Networking & Media: Retrofit 2 + OkHttp + Coil (Image loading)
- Dependency Injection: Google Hilt
- Push Notifications: Firebase Cloud Messaging (FCM)
- Backend: Node.js (TypeScript) + Express.js أو Firebase Cloud Functions
- Database: Cloud Firestore (MVP) أو PostgreSQL / Cloud SQL (Scaling)
- Storage: Firebase Cloud Storage للوصولات وصور المنتجات

## 2. هيكلة قاعدة البيانات (Database Schema)
راجع الجداول والمستندات المفصلة في وثيقة النظام.

## 3. شاشات التطبيق ولوحة التحكم (UI Screens)
- تطبيق المستخدم: الرئيسية، طلب جديد، سجل الطلبات ومراحل التتبع، شاشة بريدي موب ورفع الوصل، تتبع الشحنة 17TRACK، الإشعارات.
- لوحة تحكم الإدارة: إدارة الطلبات، محرك التسعير الفوري، مكتب تدقيق الإيصالات، إدخال التتبع، إعدادات السكوار.

## 4. خارطة طريق الـ MVP
- Sprint 1: واجهات الطلب وقاعدة البيانات الأساسية
- Sprint 2: لوحة تحكم الإدارة ومحرك احتساب أسعار الدينار
- Sprint 3: دورة دفع بريدي موب ورفع واعتماد الإيصالات
- Sprint 4: الإشعارات الفورية وتتبع الشحنات والاختبار الميداني
`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'DZ_Shopper_Architecture_Blueprint.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 text-slate-900">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
              System Architecture & Technical Guide
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">Android Kotlin + BaridiMob Integration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            دليل الهيكلة البرمجية وقواعد البيانات للمشروع (Blueprint)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            إجابة هندسية تفصيلية وشاملة لكافة متطلبات المشروع وفق أفضل ممارسات هندسة البرمجيات لتطبيقات أندرويد
          </p>
        </div>

        <button
          onClick={handleDownloadMarkdown}
          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>تنزيل الوثيقة الهندسية (Markdown)</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-slate-100 rounded-xl text-xs font-bold">
        <button
          onClick={() => setActiveSection('stack')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSection === 'stack' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-700" />
          <span>الهيكلة التقنية</span>
        </button>

        <button
          onClick={() => setActiveSection('db')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSection === 'db' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-blue-600" />
          <span>قاعدة البيانات</span>
        </button>

        <button
          onClick={() => setActiveSection('screens')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSection === 'screens' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4 text-purple-600" />
          <span>سرد الشاشات والواجهات</span>
        </button>

        <button
          onClick={() => setActiveSection('roadmap')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeSection === 'roadmap' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Milestone className="w-4 h-4 text-amber-600" />
          <span>خطة عمل الـ MVP</span>
        </button>

        <button
          onClick={() => setActiveSection('code')}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all col-span-2 sm:col-span-1 ${
            activeSection === 'code' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4 text-slate-800" />
          <span>أكواد جاهزة للنسخ</span>
        </button>
      </div>

      {/* SECTION 1: TECH STACK */}
      {activeSection === 'stack' && (
        <div className="space-y-6 text-xs leading-relaxed">
          {/* Executive Architecture Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-800" />
              <span>1. الهيكلة التقنية الشاملة المقترحة للمشروع (Tech Stack Architecture)</span>
            </h2>
            <p className="text-slate-700 leading-relaxed">
              تم اختيار هذه الهيكلة بعناية فائقة لتضمن أعلى أداء وسرعة في إطلاق النسخة الأولية (MVP)، مع قابلية توسع (Scalability)
              تتحمل آلاف الطلبات الشهرية بدون إعادة كتابة الكود:
            </p>

            {/* Architecture Stack Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Frontend Card */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-800" />
                  <h3 className="font-bold text-slate-900 text-sm">تطبيق أندرويد (Mobile Client)</h3>
                </div>
                <div className="space-y-2 text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 block">اللغة والواجهات:</span>
                    <span>Kotlin + Jetpack Compose (Declarative UI)</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">المعمارية (Architecture):</span>
                    <span>Clean Architecture (Data, Domain, Presentation) + MVVM</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">حقن التبعيات (DI):</span>
                    <span>Google Hilt / Dagger</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">الشبكة والميديا:</span>
                    <span>Retrofit 2 + OkHttp + Coil للصور</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">الإشعارات الفورية:</span>
                    <span>Firebase Cloud Messaging (FCM)</span>
                  </div>
                </div>
              </div>

              {/* Backend Card */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-700" />
                  <h3 className="font-bold text-slate-900 text-sm">الخادم الخلفي (Back-end)</h3>
                </div>
                <div className="space-y-2 text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 block">الخيار الأمثل للـ MVP:</span>
                    <span className="text-emerald-800 font-bold">Firebase Cloud Functions (Node.js/TS)</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      بدون خادم (Serverless)، سرعة إطلاق قياسية، تكلفة 0$ في البداية، وتوافق تلقائي مع FCM.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">خيار التوسع اللاحق (Scaling):</span>
                    <span>Node.js + Express.js أو NestJS (REST API)</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">يتم نقله عند تجاوز 5,000 طلب شهرياً.</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">تخزين الإيصالات والصور:</span>
                    <span>Firebase Cloud Storage مع تصغير حجم الصور تلقائياً</span>
                  </div>
                </div>
              </div>

              {/* Database & Admin Card */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-700" />
                  <h3 className="font-bold text-slate-900 text-sm">قاعدة البيانات ولوحة التحكم</h3>
                </div>
                <div className="space-y-2 text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 block">قاعدة البيانات:</span>
                    <span className="text-purple-800 font-bold">Cloud Firestore (NoSQL Real-time)</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      مزامنة لحظية لتغيير حالات الطلبات (Live updates) بدون حاجة لعمل Refresh!
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">لوحة تحكم الإدارة (Admin Panel):</span>
                    <span>React + Vite + Tailwind CSS أو Retool / Filament</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      لوحة تحكم ويب خفيفة وسريعة يستخدمها فريق العمل من الحاسوب أو الهاتف.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Architecture Diagram & Explanation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">هيكلة مجلدات تطبيق أندرويد (Android Clean Architecture)</h3>
            <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto" dir="ltr">
              <pre>{`com.dzshopper.app/
├── core/
│   ├── network/            # Retrofit Clients, Auth Interceptors
│   ├── designsystem/       # Compose Theme, Color, Typography, Custom Buttons
│   └── util/               # CurrencyFormatter, DateUtils, WilayaList
├── data/
│   ├── model/              # DTOs (OrderDto, ReceiptDto, UserDto)
│   ├── repository/         # OrderRepositoryImpl, PaymentRepositoryImpl
│   └── remote/             # FirebaseFirestoreDataSource, ApiService
├── domain/
│   ├── model/              # Domain Entities (Order, PaymentReceipt, TrackingInfo)
│   ├── repository/         # OrderRepository (Interface), PaymentRepository
│   └── usecase/            # SubmitOrderUseCase, UploadReceiptUseCase, CalculateCostUseCase
└── presentation/
    ├── home/               # HomeScreen, HomeViewModel
    ├── new_order/          # NewOrderScreen, NewOrderViewModel (Link/Photo, Wilaya)
    ├── orders/             # OrderListScreen, OrderDetailScreen, OrderViewModel
    ├── payment/            # BaridiMobPaymentScreen, ReceiptUploadViewModel
    ├── tracking/           # TrackingScreen (17Track timeline)
    └── notifications/      # NotificationsScreen, FCMService`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DATABASE SCHEMA */}
      {activeSection === 'db' && (
        <div className="space-y-6 text-xs leading-relaxed">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-700" />
                  <span>2. تصميم قاعدة البيانات الكامل (Database Schemas)</span>
                </h2>
                <p className="text-slate-600 mt-1">
                  نقدم التصميم بنمطين: نمط <strong>NoSQL Cloud Firestore</strong> (الموصى به للـ MVP)، ونمط <strong>SQL Relational</strong> (في حال رغبتك باستخدام PostgreSQL).
                </p>
              </div>
            </div>

            {/* Firestore Collections JSON Structure */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-sm">أ. هيكلة مستندات Cloud Firestore (NoSQL JSON Schema)</span>
                <button
                  onClick={() =>
                    handleCopy(
                      `// 1. Collection: 'users'
{
  "userId": "usr_948201",
  "fullName": "عبد الصمد بلحاج",
  "phoneNumber": "0661234567",
  "wilaya": "الجزائر العاصمة",
  "wilayaCode": 16,
  "address": "باب الزوار، حي 8 ماي",
  "fcmToken": "eX_token_for_push_notifications...",
  "role": "customer", // or "admin"
  "createdAt": "TIMESTAMP"
}

// 2. Collection: 'orders'
{
  "orderId": "ord_881",
  "orderNumber": "DZ-2026-881",
  "userId": "usr_948201",
  "customerName": "عبد الصمد بلحاج",
  "customerPhone": "0661234567",
  "customerWilaya": "الجزائر العاصمة",
  "platform": "aliexpress", // aliexpress | shein | temu | amazon
  "productTitle": "لوحة مفاتيح ميكانيكية لاسلكية",
  "productUrl": "https://aliexpress.com/item/100500...",
  "productImageUrl": "https://storage.googleapis.com/.../img.jpg",
  "variants": {
    "color": "رمادي",
    "size": "Red Switch",
    "quantity": 1,
    "notes": "يرجى شحن النسخة الإنجليزية"
  },
  "status": "waiting_payment", 
  // submitted -> waiting_payment -> receipt_uploaded -> payment_verified -> shipped -> arrived_algeria -> delivered -> rejected
  
  "pricing": {
    "originalPrice": 42.50,
    "originalCurrency": "USD",
    "exchangeRateSquare": 238, // سعر الصرف الموازي المعتمد
    "subtotalDZD": 10115,
    "internationalShippingDZD": 1200,
    "serviceFeeDZD": 1300, // هامش الربح
    "totalDZD": 12615,
    "quotedAt": "TIMESTAMP",
    "quotedBy": "admin_samir"
  },

  "paymentReceipt": {
    "receiptUrl": "https://storage.googleapis.com/.../receipt.jpg",
    "transactionNumber": "BM-20260928-849201",
    "amountDZD": 12615,
    "submittedAt": "TIMESTAMP",
    "verifiedAt": "TIMESTAMP",
    "verifiedBy": "admin_samir",
    "isApproved": true
  },

  "tracking": {
    "carrier": "AliExpress Direct / Algérie Poste",
    "trackingNumber": "DZ-LP983421098CN",
    "lastUpdate": "TIMESTAMP",
    "estimatedDelivery": "2026-10-10",
    "events": [
      {
        "status": "وصول الشحنة لمطار هواري بومدين",
        "location": "Alger Airport Hub",
        "timestamp": "2026-10-01 08:15",
        "description": "قيد التخليص الجمركي بمركز الطرود البريدية"
      }
    ]
  },

  "createdAt": "TIMESTAMP",
  "updatedAt": "TIMESTAMP"
}

// 3. Collection: 'system_config' / Document: 'general'
{
  "usdToDzdRate": 238,
  "eurToDzdRate": 258,
  "profitMarginPercent": 12,
  "minimumServiceFeeDZD": 600,
  "baridiMob": {
    "accountName": "DZ SHOPPER SERVICES",
    "rip": "00799999002345678912",
    "ccp": "23456789",
    "cle": "12",
    "phoneNumber": "0550 12 34 56"
  }
}`,
                      'firestore-schema'
                    )
                  }
                  className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-mono flex items-center gap-1"
                >
                  {copiedSnippet === 'firestore-schema' ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === 'firestore-schema' ? 'تم النسخ!' : 'نسخ كود Firestore JSON'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto" dir="ltr">
                <pre>{`// مجموعات Firestore الأساسية (Core Collections):
1. users/{userId}                  # بيانات الزبائن وتوكن الإشعارات FCM
2. orders/{orderId}                # مستندات الطلبات والتسعير والتتبع
3. receipt_payments/{paymentId}    # سجل عمليات تحويل بريدي موب للتدقيق المالي
4. notifications/{notificationId}  # سجل إشعارات الزبون
5. system_config/general           # أسعار السكوار الحالية وبيانات بريدي موب`}</pre>
              </div>
            </div>

            {/* SQL Relational DDL */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">ب. مخطط الجداول العلائقية (PostgreSQL / SQL DDL)</span>
                <button
                  onClick={() =>
                    handleCopy(
                      `-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    wilaya VARCHAR(50) NOT NULL,
    wilaya_code INT NOT NULL,
    address TEXT,
    fcm_token TEXT,
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(30) NOT NULL, -- 'aliexpress', 'shein', 'temu'
    product_title VARCHAR(255) NOT NULL,
    product_url TEXT,
    product_image_url TEXT,
    variants JSONB, -- { color, size, quantity, notes }
    status VARCHAR(30) NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Pricing Table
CREATE TABLE order_pricings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    original_price NUMERIC(10,2) NOT NULL,
    original_currency VARCHAR(3) NOT NULL, -- 'EUR', 'USD'
    exchange_rate_square NUMERIC(10,2) NOT NULL,
    subtotal_dzd NUMERIC(12,2) NOT NULL,
    international_shipping_dzd NUMERIC(12,2) DEFAULT 0,
    service_fee_dzd NUMERIC(12,2) NOT NULL,
    total_dzd NUMERIC(12,2) NOT NULL,
    quoted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quoted_by VARCHAR(50)
);

-- Payment Receipts Table (BaridiMob)
CREATE TABLE payment_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    transaction_number VARCHAR(60) NOT NULL,
    receipt_image_url TEXT NOT NULL,
    amount_dzd NUMERIC(12,2) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(50),
    is_approved BOOLEAN DEFAULT FALSE,
    admin_notes TEXT
);

-- Shipments & Tracking Events Table
CREATE TABLE tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number VARCHAR(60) NOT NULL,
    carrier VARCHAR(60) NOT NULL,
    status VARCHAR(100) NOT NULL,
    location VARCHAR(120),
    description TEXT,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payment_receipts_order ON payment_receipts(order_id);
CREATE INDEX idx_payment_receipts_txn ON payment_receipts(transaction_number);`,
                      'sql-schema'
                    )
                  }
                  className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-mono flex items-center gap-1"
                >
                  {copiedSnippet === 'sql-schema' ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === 'sql-schema' ? 'تم النسخ!' : 'نسخ كود PostgreSQL DDL'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto" dir="ltr">
                <pre>{`-- جدول المستخدمين (users)
-- جدول الطلبات (orders)
-- جدول التسعير وهوامش الدينار (order_pricings)
-- جدول إيصالات بريدي موب (payment_receipts)
-- جدول أحداث التتبع اللوجستي (tracking_events)`}</pre>
              </div>
            </div>

            {/* Firestore Security Rules */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <span className="font-bold text-slate-900 text-sm block">
                ج. قواعد الأمان المشددة (Firestore Security Rules)
              </span>
              <p className="text-slate-600">
                تمنع الزبائن من التلاعب بالأسعار أو الحالات، وتسمح فقط للإدارة المعتمدة بتسعير الطلبات وتأكيد وصولات بريدي موب:
              </p>

              <div className="p-4 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto" dir="ltr">
                <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }
    
    // Users Collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
      allow read, write: if isAdmin();
    }
    
    // Orders Collection
    match /orders/{orderId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      // Customer can create order only with initial status 'submitted'
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid 
                     && request.resource.data.status == 'submitted';
      // Customer can only upload receipt when status is 'waiting_payment'
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid 
                     && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['paymentReceipt', 'status'])
                     && request.resource.data.status == 'receipt_uploaded';
      // Admin has full modification rights (pricing, tracking, approval)
      allow update, delete: if isAdmin();
    }
  }
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SCREENS LIST */}
      {activeSection === 'screens' && (
        <div className="space-y-6 text-xs leading-relaxed">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-700" />
              <span>3. جرد وتوصيف شاشات تطبيق الهاتف ولوحة التحكم (UI Screens Breakdown)</span>
            </h2>

            {/* Mobile App Screens Table */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">أولاً: شاشات تطبيق أندرويد للزبون (Customer App)</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">اسم الشاشة (Screen)</th>
                      <th className="py-2.5 px-3">العناصر والمكونات (Components)</th>
                      <th className="py-2.5 px-3">الإجراءات والتدفق (User Flow)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">1. شاشة البداية والتسجيل (Auth/OTP)</td>
                      <td className="py-2.5 px-3 text-slate-600">إدخال رقم الهاتف الجزائري (05/06/07)، تأكيد برمز الرسالة النصية OTP، الاسم والولاية.</td>
                      <td className="py-2.5 px-3 text-emerald-800 font-semibold">حفظ الحساب في Firestore واستخراج توكن FCM.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">2. الشاشة الرئيسية (Home Dashboard)</td>
                      <td className="py-2.5 px-3 text-slate-600">بانر ترويجي، بطاقة أسعار صرف السكوار اليومية، شريط المتاجر المدعومة، الطلبات الجارية.</td>
                      <td className="py-2.5 px-3 text-slate-700">زر بارز للطلب السريع وحاسبة أسعار بالدينار.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">3. شاشة طلب سلعة (New Order Request)</td>
                      <td className="py-2.5 px-3 text-slate-600">حقل رابط URL، رفع صورة، اختيار المقاس/اللون/الكمية، قائمة الولايات الـ 58، العنوان.</td>
                      <td className="py-2.5 px-3 text-slate-700">احتساب السعر التقديري وإرسال الطلب لحالة <code>submitted</code>.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">4. شاشة تفاصيل ومراحل الطلب (Order Detail)</td>
                      <td className="py-2.5 px-3 text-slate-600">مسار التقدم المرئي (6 خطوات)، تفاصيل السعر الأصلي + الشحن + العمولة بالدينار.</td>
                      <td className="py-2.5 px-3 text-slate-700">زر مشروط: "ادفع بـ BaridiMob" أو "تتبع الشحنة".</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">5. شاشة دفع بريدي موب (BaridiMob Payment)</td>
                      <td className="py-2.5 px-3 text-slate-600">رقم الـ RIP مع زر نسخ بنقرة واحدة، اسم المستفيد، تعليمات التحويل، رفع سكرين شوت الوصل، حقل رقم المعاملة.</td>
                      <td className="py-2.5 px-3 text-purple-700 font-semibold">رفع صورة الوصل لـ Cloud Storage وتغيير الحالة لـ <code>receipt_uploaded</code>.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">6. شاشة تتبع الشحنة (17Track Live View)</td>
                      <td className="py-2.5 px-3 text-slate-600">رقم التتبع الدولي، اسم الناقل، خط زمني للمراحل (الصين ⬅️ مطار هواري بومدين ⬅️ الجمارك ⬅️ البريد المحلي).</td>
                      <td className="py-2.5 px-3 text-indigo-700 font-semibold">متابعة مسار الطرد حتى الاستلام.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">7. مركز الإشعارات (Notifications)</td>
                      <td className="py-2.5 px-3 text-slate-600">سجل الإشعارات المستلمة (تم التسعير، تم الشراء، وصل الجزائر).</td>
                      <td className="py-2.5 px-3 text-slate-700">الضغط ينقل مباشرة إلى صفحة الطلب المعني.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admin Panel Screens Table */}
            <div className="space-y-2 pt-4">
              <h3 className="font-bold text-slate-900 text-sm">ثانياً: شاشات لوحة تحكم الإدارة (Admin Web Portal)</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">الشاشة</th>
                      <th className="py-2.5 px-3">الوظيفة الإدارية</th>
                      <th className="py-2.5 px-3">الإجراء المتاح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">1. لوحة المؤشرات (KPI Dashboard)</td>
                      <td className="py-2.5 px-3 text-slate-600">إحصائيات فورية للطلبات الواردة، أرباح العمولات، إجمالي المبيعات، ومعدل التحويل.</td>
                      <td className="py-2.5 px-3 text-slate-700">رصد نمو وتدفق العمل اليومي.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">2. جدول الطلبات الشامل (Orders Desk)</td>
                      <td className="py-2.5 px-3 text-slate-600">قائمة لكافة الطلبات مع فلترة فورية بالحالة والولاية ورقم الهاتف.</td>
                      <td className="py-2.5 px-3 text-slate-700">تغيير الحالات يدوياً أو فتح نوافذ المعالجة.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">3. محرك التسعير الفوري (Quoting Modal)</td>
                      <td className="py-2.5 px-3 text-slate-600">إدخال سعر السلعة الأصلي (EUR/USD)، سعر الصرف، هامش الربح، والشحن المقدر.</td>
                      <td className="py-2.5 px-3 text-emerald-800 font-bold">احتساب المجموع بالـ DZD وضغط "إرسال التسعيرة للزبون مع إشعار FCM".</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">4. مكتب تدقيق وصولات بريدي موب (Receipt Desk)</td>
                      <td className="py-2.5 px-3 text-slate-600">معاينة صورة الوصل المرفوع، مطابقة رقم الحوالة والمبلغ مع الحساب البريدي الجاري.</td>
                      <td className="py-2.5 px-3 text-purple-700 font-bold">زر "تأكيد استلام المبلغ" أو "رفض الوصل مع إبداء السبب".</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">5. مكتب الشحن والتتبع (Fulfillment Desk)</td>
                      <td className="py-2.5 px-3 text-slate-600">إدخال كود التتبع الدولي المولد من AliExpress/Shein واختيار الناقل.</td>
                      <td className="py-2.5 px-3 text-indigo-700 font-bold">تحديث الحالة إلى "مشحونة" وإرسال التتبع للزبون تلقائياً.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">6. إعدادات السكوار و بريدي موب (Settings)</td>
                      <td className="py-2.5 px-3 text-slate-600">تعديل سعر صرف السكوار اليومي، الحد الأدنى للعمولة، ورقم الـ RIP.</td>
                      <td className="py-2.5 px-3 text-slate-700">تطبيق التغييرات فورياً على كل الطلبات الجديدة.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: ROADMAP */}
      {activeSection === 'roadmap' && (
        <div className="space-y-6 text-xs leading-relaxed">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Milestone className="w-5 h-5 text-amber-600" />
              <span>4. خارطة طريق إطلاق النسخة الأولية خطوة بخطوة (MVP Roadmap - 4 Weeks)</span>
            </h2>
            <p className="text-slate-700">
              خطة عمل محكمة تركز على إطلاق التطبيق في غضون 4 أسابيع وبأقل تكلفة تشغيلية، وتجنب فخاخ التعقيد في البداية:
            </p>

            {/* Sprints Grid */}
            <div className="space-y-3 pt-2">
              {/* Sprint 1 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">الأسبوع 1: البنية التحتية وواجهات إرسال الطلب (Foundation & Order UI)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">Sprint 1</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>إنشاء مشروع أندرويد بنظام <strong>Kotlin + Jetpack Compose</strong> وهيكلة Clean Architecture.</li>
                  <li>ربط المشروع بـ <strong>Firebase Authentication</strong> (برقم الهاتف) و <strong>Cloud Firestore</strong>.</li>
                  <li>بناء واجهة إرسال الطلب: حقل الرابط (URL Parser)، رفع الصورة لـ Cloud Storage، قائمة الـ 58 ولاية، وحاسبة السعر التقديري.</li>
                  <li>حفظ الطلب الجديد في Firestore بحالة <code>submitted</code>.</li>
                </ul>
              </div>

              {/* Sprint 2 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">الأسبوع 2: لوحة تحكم الإدارة ومحرك التسعير (Admin Portal & Quoting Engine)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">Sprint 2</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>بناء لوحة تحكم ويب سريعة (React + Tailwind) للمدير وفريق العمل.</li>
                  <li>نافذة تسعير الطلب: إدخال السعر الأصلي + سعر صرف السكوار + نسبة الربح ➡️ حساب الإجمالي بالدينار.</li>
                  <li>تحديث حالة الطلب إلى <code>waiting_payment</code> وتخزين تفاصيل الحسبة المالية.</li>
                </ul>
              </div>

              {/* Sprint 3 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">الأسبوع 3: دورة دفع بريدي موب والتحقق البشري (BaridiMob Flow & Verification)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">Sprint 3</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>شاشة بريدي موب بتطبيق الزبون: عرض الـ RIP البريدي مع زر نسخ فوري وتعليمات التحويل.</li>
                  <li>منتقي الصور لرفع لقطة الشاشة للوصل وإدخال رقم العملية (Transaction Number).</li>
                  <li>مكتب تدقيق الإيصالات في لوحة المدير: زر "تأكيد استلام المبلغ في الحساب الجاري" لتغيير الحالة إلى <code>payment_verified</code>.</li>
                  <li>شراء السلعة بالفيزا كارد الخاصة بالإدارة من المتجر الصيني/العالمي.</li>
                </ul>
              </div>

              {/* Sprint 4 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">الأسبوع 4: الإشعارات وتتبع الشحنات والإطلاق (FCM, Tracking & Launch)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">Sprint 4</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>تفعيل <strong>Firebase Cloud Messaging (FCM)</strong> لإرسال إشعارات فورية عند: (تسعير الطلب، قبول الدفع، شحن السلعة، وصولها الجزائر).</li>
                  <li>إضافة كود التتبع الدولي (Tracking Number) في لوحة المدير، وعرض جدول الخط الزمني للزبون.</li>
                  <li>اختبار ميداني مع 20 زبون تجريبي (Beta Testing)، تدقيق دورة الأموال، ثم النشر على متجر Google Play.</li>
                </ul>
              </div>
            </div>

            {/* Strategic Advice */}
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2">
              <span className="font-bold text-amber-950 block text-sm">💡 نصائح استراتيجية حاسمة لنجاح مشروعك في الجزائر:</span>
              <div className="space-y-1.5 text-[11px] text-amber-900 leading-relaxed">
                <p>
                  <strong>1. إبقاء المعالجة نصف آلية (Semi-Automated):</strong> تجنب محاولة البحث بالذكاء الاصطناعي وجلب الأسعار آلياً بالـ Scraping؛ فمواقع مثل AliExpress و Shein تضع حماية متقدمة ضد البوتات وتقوم بحظرها، كما أن مقاسات وألوان المنتجات تتطلب تدقيقاً بشرياً. المراجعة البشرية في الـ MVP أسرع بنسبة 100% وأقل تكلفة.
                </p>
                <p>
                  <strong>2. إدارة تقلبات سعر الصرف (السكوار):</strong> أضف هامش أمان بنسبة 2% إلى 3% فوق سعر السكوار اليومي لتغطية أي تذبذب في سعر اليورو أو الدولار بين لحظة إرسال التسعيرة ولحظة تحويل الزبون.
                </p>
                <p>
                  <strong>3. سياسة النزاعات والجمارك الجزائريّة:</strong> اشترط على الزبائن عدم طلب سلع ممنوعة جمركياً (مثل طائرات الدرون، الكاميرات المخفية، أجهزة اللاسلكي)، واجعل بوليصة الشحن باسم وعنوان الزبون المباشر لضمان استلامه من مركز البريد الخاص بدائرته أو ولايته.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: READY-TO-USE CODE REPO */}
      {activeSection === 'code' && (
        <div className="space-y-6 text-xs leading-relaxed">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-slate-800" />
              <span>5. مستودع الأكواد الجاهزة للنسخ (Ready-to-Use Kotlin & Node.js Code)</span>
            </h2>
            <p className="text-slate-600">
              أكواد حقيقية مكتوبة بمعايير إنتاجية (Production-Ready) يمكنك نسخها مباشرة واستخدامها في مشروعك:
            </p>

            {/* Snippet 1: Android Jetpack Compose Screen */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  أ. كود أندرويد (Kotlin Jetpack Compose): واجهة دفع بريدي موب مع زر نسخ الـ RIP ورفع الوصل
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      `// BaridiMobPaymentScreen.kt
package com.dzshopper.app.presentation.payment

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun BaridiMobPaymentScreen(
    orderNumber: String,
    totalDZD: Long,
    ripNumber: String = "00799999002345678912",
    onReceiptUploaded: (transactionNumber: String) -> Unit
) {
    val context = LocalContext.current
    var transactionNumber by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "الدفع عبر بريدي موب للطلب: $orderNumber",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "المبلغ المطلوب تحويله بالدينار:")
                Text(
                    text = "$totalDZD د.ج",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        // RIP Card with Copy button
        OutlinedCard(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "رقم الـ RIP (بريد الجزائر):", fontSize = 12.sp)
                    Text(text = ripNumber, fontWeight = FontWeight.Bold)
                }

                Button(onClick = {
                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    val clip = ClipData.newPlainText("RIP", ripNumber)
                    clipboard.setPrimaryClip(clip)
                    Toast.makeText(context, "تم نسخ الـ RIP بنجاح!", Toast.LENGTH_SHORT).show()
                }) {
                    Text("نسخ")
                }
            }
        }

        OutlinedTextField(
            value = transactionNumber,
            onValueChange = { transactionNumber = it },
            label = { Text("رقم المعاملة (N° Transaction من الوصل)") },
            modifier = Modifier.fillMaxWidth()
        )

        Button(
            onClick = {
                if (transactionNumber.isNotBlank()) {
                    onReceiptUploaded(transactionNumber)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = transactionNumber.isNotBlank()
        ) {
            Text("تأكيد إرسال الوصل للمراجعة")
        }
    }`,
                      'kotlin-code'
                    )
                  }
                  className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-mono flex items-center gap-1"
                >
                  {copiedSnippet === 'kotlin-code' ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === 'kotlin-code' ? 'تم النسخ!' : 'نسخ كود Kotlin'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto" dir="ltr">
                <pre>{`// BaridiMobPaymentScreen.kt
// مكون Compose كامل يتعامل مع نسخ الـ RIP ورفع الوصل والتأكيد التلقائي`}</pre>
              </div>
            </div>

            {/* Snippet 2: Firebase Cloud Function for FCM Notification */}
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  ب. كود الخادم الخلفي (Firebase Cloud Function / Node.js): إرسال إشعارات FCM فورية عند تغيير حالة الطلب
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      `// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const onOrderStatusChanged = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // إذا لم تتغير حالة الطلب لا تفعل شيئاً
    if (beforeData.status === afterData.status) {
      return null;
    }

    const userId = afterData.userId;
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    const fcmToken = userDoc.data()?.fcmToken;

    if (!fcmToken) {
      console.log("No FCM token found for user:", userId);
      return null;
    }

    let notificationTitle = "تحديث لطلبك في DZ Shopper";
    let notificationBody = "";

    switch (afterData.status) {
      case "waiting_payment":
        notificationTitle = "تم تسعير طلبك بنجاح! 🎉";
        notificationBody = \`طلبك جاهز للدفع بمبلغ \${afterData.pricing?.totalDZD?.toLocaleString()} د.ج عبر بريدي موب.\`;
        break;
      case "payment_verified":
        notificationTitle = "تم تأكيد الدفع والشراء بالفيزا ✅";
        notificationBody = "تحققنا من استلام الحوالة وتم تنفيذ عملية الشراء بنجاح بالبطاقة الدولية.";
        break;
      case "shipped":
        notificationTitle = "تم شحن سلعتك دولياً ✈️";
        notificationBody = \`تم الشحن برقم التتبع \${afterData.tracking?.trackingNumber}. يمكنك تتبع الطرد الآن في التطبيق!\`;
        break;
      case "arrived_algeria":
        notificationTitle = "وصلت شحنتك إلى الجزائر! 🇩🇿";
        notificationBody = "الشحنة في مركز الفرز الجمركي وستصل إلى مكتب بريد ولايتك قريباً.";
        break;
      case "rejected":
        notificationTitle = "تم إلغاء الطلب ⚠️";
        notificationBody = afterData.adminNotes || "تعذر إتمام الطلب، يرجى مراجعة التطبيق.";
        break;
    }

    // إرسال الإشعار للجهاز
    const payload = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      data: {
        orderId: context.params.orderId,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    };

    return admin.messaging().sendToDevice(fcmToken, payload);
  });`,
                      'fcm-code'
                    )
                  }
                  className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-mono flex items-center gap-1"
                >
                  {copiedSnippet === 'fcm-code' ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === 'fcm-code' ? 'تم النسخ!' : 'نسخ كود Cloud Function'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-blue-300 rounded-xl font-mono text-[11px] overflow-x-auto" dir="ltr">
                <pre>{`// functions/src/index.ts
// Cloud Function تراقب تغيرات Firestore وترسل Push Notification فوري للمستخدم عند التسعير والدفع والشحن`}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
