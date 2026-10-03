import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Settings,
  HelpCircle,
  FileCheck,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Coins,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { SystemConfig } from '../../types';
import { formatDZD } from '../../utils/currency';

interface AdminHandbookProps {
  systemConfig: SystemConfig;
  pendingQuotesCount: number;
  pendingReceiptsCount: number;
  totalOrdersCount: number;
  onNavigateTab: (tab: 'orders' | 'receipts' | 'profits' | 'settings') => void;
  isDarkMode?: boolean;
}

export const AdminHandbook: React.FC<AdminHandbookProps> = ({
  systemConfig,
  pendingQuotesCount,
  pendingReceiptsCount,
  totalOrdersCount,
  onNavigateTab,
  isDarkMode = false,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const WORKFLOW_STEPS = [
    {
      step: 1,
      title: 'استقبال وفحص طلب السلعة',
      badge: 'الخطوة الأولى',
      icon: Search,
      summary: 'فحص رابط السلعة المرفوع من قبل العميل للتأكد من إمكانية الشحن للجزائر وتوفر المواصفات.',
      details: [
        'افتح رابط السلعة (AliExpress / Shein / Temu) وتأكد أن المتجر يشحن مباشرة إلى الجزائر (Algeria).',
        'تأكد من خيارات الزبون: المقاس (Size)، اللون (Color)، ونوع القابس الكهربائي (EU Plug المتوافق مع الجزائر).',
        'افحص تقييمات البائع (يفضل متجر بتقييم فوق 94% وأكثر من 100 مراجعة إيجابية لتجنب تأخر الشحن).',
        'تأكد من نوع الشحن الدولي المتاح: AliExpress Standard Shipping أو Cainiao هما الأفضل والأكثر موثوقية مع بريد الجزائر.',
      ],
      quickAction: () => onNavigateTab('orders'),
      actionLabel: 'الانتقال لجدول الطلبات',
    },
    {
      step: 2,
      title: 'التسعير الذكي وإرسال الفاتورة بالدينار',
      badge: 'الخطوة الثانية',
      icon: DollarSign,
      summary: 'حساب التكلفة الإجمالية بالدينار الجزائري بناءً على سعر صرف السكوار الموازي وعمولة المنصة.',
      details: [
        `سعر الصرف المعتمد حالياً في النظام: ${systemConfig.usdToDzdRate} دج / $، و ${systemConfig.eurToDzdRate} دج / €.`,
        'أدخل السعر بالدولار كما هو في المتجر + تكلفة الشحن الدولي إن وجدت.',
        `يطبق النظام تلقائياً هامش الخدمة (${systemConfig.profitMarginPercent}% أو بحد أدنى ${formatDZD(systemConfig.minimumServiceFeeDZD)}).`,
        'بمجرد حفظ التسعيرة، يتلقى العميل إشعار دفع (Push Notification) وبريداً رسمياً فورياً بالمبلغ الإجمالي بالدينار وبيانات حسابك البريدي (RIP).',
      ],
      quickAction: () => onNavigateTab('settings'),
      actionLabel: 'تعديل أسعار السكوار',
    },
    {
      step: 3,
      title: 'تحويل الزبون بالدينار عبر بريدي موب',
      badge: 'الخطوة الثالثة',
      icon: Smartphone,
      summary: 'يقوم الزبون بفتح تطبيق BaridiMob الرسمي وإرسال الحوالة إلى رقم RIP المحدد.',
      details: [
        `رقم حسابك البريدي المعروض للعملاء: ${systemConfig.baridiMobDetails.rip}.`,
        'يطلب التطبيق من العميل التقاط صورة شاشة (Screenshot) لنجاح المعاملة في بريدي موب ورفعها في التطبيق.',
        'ينتقل الطلب تلقائياً إلى حالة "وصل بريدي موب مرفوع" ويظهر تنبيه فوري في لوحة مراجعة الإيصالات.',
      ],
      quickAction: () => onNavigateTab('receipts'),
      actionLabel: 'عرض الإيصالات المعلقة',
    },
    {
      step: 4,
      title: 'التدقيق المالي الآمن للوصل ومطابقة الرصيد',
      badge: 'أهم خطوة أمنية 🔒',
      icon: ShieldCheck,
      summary: 'التحقق الصارم من وصول المبلغ الفعلي في حسابك البريدي الجاري قبل شراء أي سلعة.',
      details: [
        '⚠️ القاعدة الذهبية: لا تعتمد أبداً على صورة الوصل وحدها! افتح تطبيق بريدي موب الرسمي في هاتفك أولاً.',
        'طابق المبلغ بالسنتيم والدينار، وتاريخ المعاملة بالدقيقة، ورقم العملية (Numéro de transaction / Référence).',
        'إذا كان المبلغ واصلاً ومطابقاً: اضغط على "تأكيد وصحة الوصل" (Approve).',
        'إذا كان الوصل مشبوهاً أو المبلغ غير واصل: اضغط على "رفض الوصل" مع ذكر السبب ليتم إشعار الزبون.',
      ],
      quickAction: () => onNavigateTab('receipts'),
      actionLabel: 'فتح مكتب تدقيق الإيصالات',
    },
    {
      step: 5,
      title: 'الشراء بالفيزا وتفريغ العنوان اللاتيني',
      badge: 'الخطوة الخامسة',
      icon: CreditCard,
      summary: 'شراء السلعة بالبطاقة الدولية مع تثبيت عنوان شحن الزبون الدقيق في الجزائر.',
      details: [
        'اضغط على زر "شراء تلقائي" (1-Click Auto-Purchase) في سطر الطلب.',
        'يعرض لك النظام عنوان الزبون الجزائري منسقاً بالحروف اللاتينية وفق معايير بريد الجزائر والجمارك (الاسم، الشارع، البلدية، الولاية، والرمز البريدي).',
        'انسخ العنوان وضعه كعنوان شحن في AliExpress / Shein، وادفع باستخدام بطاقتك الدولية (Visa / Paysera / RedotPay / Wise).',
        'وثّق رقم الطلب الأجنبي في النظام لتسهيل المتابعة.',
      ],
      quickAction: () => onNavigateTab('orders'),
      actionLabel: 'الانتقال للشراء التلقائي',
    },
    {
      step: 6,
      title: 'الشحن الدولي وتحديث التتبع الذكي',
      badge: 'الخطوة السادسة',
      icon: Globe,
      summary: 'ربط كود الشحن الدولي وتحديث محطات الطرد آلياً وإشعار العميل عبر إشعارات الدفع.',
      details: [
        'بمجرد شحن السلعة من المصنع بالصين وتوليد رقم التتبع، اضغط على زر "تتبع ذكي" بجانب الطلب.',
        'ألصق رابط التتبع من 17TRACK أو ParcelsApp أو كود الشحنة المباشر، واضغط "جلب آلي".',
        'يجلب النظام خط سير الشحنة (رحلة الطيران الجوي، الوصول لمطار هواري بومدين، الجمارك، ومركز بريد الولاية).',
        'عند التأكيد، يتلقى العميل إشعار دفع (Push Notification) على شاشة هاتفه يوضح له موقع طرده بدقة.',
      ],
      quickAction: () => onNavigateTab('orders'),
      actionLabel: 'تحديث التتبع الذكي للطلبات',
    },
  ];

  const FAQS = [
    {
      q: 'كيف أكتشف محاولات الاحتيال أو الإيصالات المزيفة (Fake BaridiMob Receipts)؟',
      a: 'هناك برامج وتطبيقات منتشرة تقوم بإنشاء صور إيصالات بريدي موب وهمية بأي مبلغ ورقم عملية. لذلك القاعدة الإدارية الصارمة: لا تقبل أي وصل بمجرد النظر إلى الصورة! افتح تطبيقك الخاص BaridiMob، وتوجه إلى "كشف الحساب" (Extrait de compte) أو الإشعارات وتأكد من أن الرصيد قد زاد فعلياً بنفس قيمة الوصل ورقم المرجع قبل الموافقة.',
    },
    {
      q: 'ماذا أفعل إذا تأخرت الشحنة في مركز الفرز الجمركي بمطار هواري بومدين؟',
      a: 'الطرود البريدية العادية (Cainiao / AliExpress Standard) تستغرق عادة من 5 إلى 14 يوماً في مركز الفرز البريدي بمطار هواري بومدين (CNAP Bentalha) للفحص الجمركي الأمني ثم تنقل إلى ولاية العميل. استخدم ميزة "التتبع الذكي" في لوحة الإدارة لاختيار سيناريو "وصلت الجزائر والجمارك" لإشعار العميل بأن شحنته في أرض الوطن وهي في مسار التوزيع العادي، مما يطمئنه ويقلل من استفساراته المتكررة.',
    },
    {
      q: 'كيف أتعامل مع إلغاء الطلب من المتجر أو نفاد السلعة بعد دفع الزبون؟',
      a: 'في حال نفدت السلعة من المتجر الأجنبي بعد أن قام الزبون بالتحويل: ادخل على تفاصيل الطلب، وقم بتغيير الحالة إلى "ملغى / مرفوض" مع كتابة ملاحظة توضح ذلك. ثم قم بإرجاع المبلغ بالدينار للزبون عبر تحويل بريدي موب إلى حسابه (RIP)، واطلب منه تأكيد الاستلام لإغلاق الملف بنزاهة واحترافية.',
    },
    {
      q: 'كيف أتجنب تجميد أو حظر بطاقتي البنكية الدولية (Visa / Paysera / RedotPay)؟',
      a: 'عند الشراء لعدة زبائن في الجزائر، تجنب استخدام بطاقات بنكية غير مرخصة. بطاقات مثل RedotPay و Paysera و Wise تقبل الشحن الدولي المتعدد طالما أن المشتريات مخصصة للاستخدام الشخصي وغير تجارية بالجملة. ضع دائماً اسم الزبون الجزائري ورقم هاتفه كعنوان تسليم لتفادي المساءلة الجمركية.',
    },
    {
      q: 'ما هي نسبة العمولة المثالية التي تحقق ربحاً جيداً وتنافس في السوق الجزائري؟',
      a: 'المعدل الشائع في السوق الجزائري هو بين 7% إلى 12% من قيمة السلعة المحولة بسعر السكوار، مع تحديد عمولة دنيا لا تقل عن 700 إلى 1,000 دج للطلبيات الصغيرة (أقل من 20 دولار) لتغطية مصاريف الاتصالات ورسوم البطاقة الدولية. يمكنك ضبط هذه القيم في تبويب "إعدادات السكوار و بريدي موب" وتجربة محاكاتها في "حاسبة الأرباح".',
    },
  ];

  return (
    <div className={`space-y-6 text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} animate-in fade-in duration-200`}>
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <BookOpen className="w-5 h-5 text-indigo-300" />
            </span>
            <h2 className="text-lg font-black text-white">دليل تشغيل وإدارة المنصة (Admin Operating Handbook)</h2>
          </div>
          <p className="text-xs text-indigo-200/90 mt-1 max-w-2xl leading-relaxed">
            المرجع العملي الشامل لصاحب التطبيق: خطوات التسيير اليومي، بروتوكول الأمان المالي لبريدي موب، إدارة بطاقات الفيزا والعملة الصعبة، والتحكم الذكي بالطلبات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>النظام جاهز للتشغيل</span>
          </span>
        </div>
      </div>

      {/* Quick Navigation Jump Cards */}
      <div className="space-y-2">
        <h3 className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} text-sm flex items-center gap-2`}>
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>روابط الوصول السريع لأقسام لوحة التحكم (Quick Shortcuts)</span>
        </h3>
        <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          انتقل مباشرة إلى أي تبويب تشغيلي لإنجاز المهام وإدارة المعاملات الحية
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Jump 1: Orders */}
          <div
            onClick={() => onNavigateTab('orders')}
            className={`group cursor-pointer rounded-2xl ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-600'
            } border p-4 transition-all hover:shadow-md space-y-2.5`}
          >
            <div className="flex items-center justify-between">
              <span className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-800'} transition-colors`}>
                <Layers className="w-4 h-4" />
              </span>
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {totalOrdersCount} طلب
              </span>
            </div>
            <div>
              <h4 className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-emerald-500 transition-colors`}>
                إدارة وتسعير الطلبات
              </h4>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5 line-clamp-2`}>
                فحص روابط AliExpress/Shein، تسعير السلع، ومتابعة حالات الدفع والشراء.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 pt-1 group-hover:translate-x-[-3px] transition-transform">
              <span>فتح جدول الطلبات</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Jump 2: Receipts */}
          <div
            onClick={() => onNavigateTab('receipts')}
            className={`group cursor-pointer rounded-2xl ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-purple-500' : 'bg-white border-slate-200 hover:border-purple-600'
            } border p-4 transition-all hover:shadow-md space-y-2.5 relative`}
          >
            {pendingReceiptsCount > 0 && (
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-mono font-bold animate-pulse">
                {pendingReceiptsCount} بانتظار التدقيق
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-800'} transition-colors`}>
                <FileCheck className="w-4 h-4" />
              </span>
            </div>
            <div>
              <h4 className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-purple-400 transition-colors`}>
                مراجعة إيصالات بريدي موب
              </h4>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5 line-clamp-2`}>
                تدقيق صور الحوالات وأرقام العمليات وتأكيد وصول المبالغ بالدينار.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400 pt-1 group-hover:translate-x-[-3px] transition-transform">
              <span>فتح مكتب الإيصالات</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Jump 3: Settings */}
          <div
            onClick={() => onNavigateTab('settings')}
            className={`group cursor-pointer rounded-2xl ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-blue-600'
            } border p-4 transition-all hover:shadow-md space-y-2.5`}
          >
            <div className="flex items-center justify-between">
              <span className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-800'} transition-colors`}>
                <Settings className="w-4 h-4" />
              </span>
              <span className={`font-mono text-xs font-bold ${
                isDarkMode ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'text-blue-900 bg-blue-50 border border-blue-200'
              } px-2 py-0.5 rounded-lg`}>
                {systemConfig.usdToDzdRate} دج/$
              </span>
            </div>
            <div>
              <h4 className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-blue-400 transition-colors`}>
                إعدادات السكوار و بريدي موب
              </h4>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5 line-clamp-2`}>
                تحديث أسعار صرف اليورو والدولار، رقم RIP لحسابك، ونسبة العمولة.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-400 pt-1 group-hover:translate-x-[-3px] transition-transform">
              <span>تعديل الصرف والـ RIP</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Jump 4: Profits */}
          <div
            onClick={() => onNavigateTab('profits')}
            className={`group cursor-pointer rounded-2xl ${
              isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-600'
            } border p-4 transition-all hover:shadow-md space-y-2.5`}
          >
            <div className="flex items-center justify-between">
              <span className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-800'} transition-colors`}>
                <Coins className="w-4 h-4" />
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                إحصائيات شهرية
              </span>
            </div>
            <div>
              <h4 className={`font-extrabold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-emerald-400 transition-colors`}>
                حاسبة الأرباح والإحصائيات
              </h4>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5 line-clamp-2`}>
                مراقبة صافي أرباحك الصافية بالدينار، تقارير الشهور المجمعة، ومحاكي الهوامش.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 pt-1 group-hover:translate-x-[-3px] transition-transform">
              <span>عرض تقارير الأرباح</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Interactive Step-by-Step Workflow Guide */}
      <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'} rounded-3xl p-5 sm:p-6 border shadow-2xs space-y-6`}>
        <div>
          <h3 className={`font-extrabold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>دورة حياة الطلب من البداية إلى النهاية (End-to-End Workflow)</span>
          </h3>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>
            اضغط على أي مرحلة لاستعراض الخطوات العملية والإجراءات المطلوبة من المسؤول:
          </p>
        </div>

        {/* Step Selector Horizontal Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {WORKFLOW_STEPS.map((s) => {
            const Icon = s.icon;
            const isSelected = activeStep === s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step)}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-black ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {s.step}
                  </span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-700' : 'text-slate-400'}`} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{s.badge}</span>
                  <span className="text-xs font-extrabold block truncate">{s.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Detailed View Card */}
        {(() => {
          const current = WORKFLOW_STEPS.find((s) => s.step === activeStep) || WORKFLOW_STEPS[0];
          const Icon = current.icon;
          return (
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 p-5 space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-bold">
                        {current.badge}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">{current.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{current.summary}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={current.quickAction}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                >
                  <span>{current.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Step Checklist Items */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 text-xs block">قائمة المهام الإدارية لهذه المرحلة:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {current.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-slate-700 leading-relaxed">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Security & Financial Verification Guide (بروتوكول الأمان المالي) */}
      <div className="rounded-3xl border-2 border-emerald-500/80 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                بروتوكول الأمان المالي والتحقق من حساب بريدي موب يدوياً
              </h3>
              <p className="text-[11px] text-slate-500">
                إجراءات إلزامية لحماية أموالك من الإيصالات المزيفة وضمان وصول الأموال قبل الشراء
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-bold text-xs border border-emerald-300">
            بروتوكول أمني إلزامي 🔒
          </span>
        </div>

        {/* The Golden Rule Alert */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300 flex items-start gap-3 text-amber-950">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <strong className="text-xs font-black block">القاعدة الذهبية لمنسق وسيط التسوق:</strong>
            <p className="text-[11px] leading-relaxed">
              «إياك والشراء بالبطاقة الدولية لمجرد رؤية صورة الوصل المرفوع! برامج تعديل الصور وتطبيقات توليد وصولات بريدي موب الوهمية متوفرة بكثرة. <strong>لا توافق على أي وصل حتى تتأكد بنفسك من أن رصيدك البريدي الفعلي قد زاد بقيمة الحوالة.</strong>»
            </p>
          </div>
        </div>

        {/* 3-Step Verification Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-mono text-xs">
                1
              </span>
              <span>افتح كشف حساب BaridiMob</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              ادخل لتطبيق بريدي موب الرسمي في هاتفك، وافتح قائمة <strong>Extrait de compte</strong> أو إشعارات الحوالات الواردة (Virement reçu).
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-mono text-xs">
                2
              </span>
              <span>طابق رقم العملية والمبلغ</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              طابق <strong>رقم العملية (Numéro de transaction)</strong> المكتوب على الوصل مع الرقم المسجل في حركة الحساب، بالإضافة إلى التوقيت بالساعة والدقيقة.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold">
              <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-mono text-xs">
                3
              </span>
              <span>تأكيد الوصل أو رفضه بالسبب</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              إذا طابقت العملية: اضغط <strong>«تأكيد وصحة الوصل»</strong> للانتقال لمرحلة الشراء. إذا لم يظهر المبلغ: ارفض الطلب مع إشعار الزبون بالمراجعة مع بريده.
            </p>
          </div>
        </div>
      </div>

      {/* Operator FAQ & Troubleshooting */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-4 h-4 text-indigo-700" />
          <h3 className="font-extrabold text-sm text-slate-900">
            الأسئلة الشائعة وحل المشكلات التشغيلية (Operator FAQ & Troubleshooting)
          </h3>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-right font-extrabold text-xs text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-[11px] text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
