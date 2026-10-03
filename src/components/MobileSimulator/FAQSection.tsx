import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  Sparkles,
  Info,
  DollarSign,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { SystemConfig } from '../../types';

interface FAQItem {
  id: string;
  category: 'workflow' | 'payment' | 'fees' | 'shipping' | 'returns';
  question: string;
  answer: string;
  highlights?: string[];
}

interface FAQSectionProps {
  systemConfig: SystemConfig;
  onNavigateToNewOrder?: () => void;
  isEmbedded?: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  systemConfig,
  onNavigateToNewOrder,
  isEmbedded = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'workflow',
      question: 'كيف يعمل تطبيق DZ Shopper كوسيط للشراء الدولي؟',
      answer:
        'يقوم التطبيق بحل مشكلة عدم امتلاك بطاقة دفع دولية (Visa/Mastercard). ما عليك سوى نسخ رابط المنتج أو رفع صورته من AliExpress أو SHEIN أو TEMU. يقوم فريقنا بحساب التكلفة بالدينار الجزائري وإرسال إشعار فوري لك، وبعد أن تدفع بالعملة المحلية عبر تطبيق بريدي موب (BaridiMob)، نقوم نحن بالشراء بالبطاقة الدولية وشحن السلعة مباشرة إلى عنوانك أو مكتب بريدك المحلي.',
      highlights: ['لا تحتاج لبطاقة بنكية دولية', 'دفع 100% بالدينار الجزائري عبر بريدي موب', 'تتبع الشحنة حتى باب المنزل'],
    },
    {
      id: 'faq-2',
      category: 'fees',
      question: 'كيف يتم احتساب السعر النهائي بالدينار وهل توجد رسوم مخفية؟',
      answer:
        `يتم حساب التكلفة بكل شفافية وفق المعادلة التالية: (سعر المنتج بالعملة الأجنبية × سعر صرف السكوار اليومي المعتمد) + تكلفة الشحن الدولي المقدرة + عمولة الوساطة والخدمة (${systemConfig.profitMarginPercent}% بحد أدنى ${systemConfig.minimumServiceFeeDZD} د.ج للطلبات الصغيرة). المبلغ الذي نرسله لك في الإشعار هو المبلغ الإجمالي النهائي الذي تدفعه دون أي زيادات لاحقة.`,
      highlights: ['سعر الصرف الموازي (سوق السكوار) المحدث يومياً', `عمولة ثابتة وواضحة بنسبة ${systemConfig.profitMarginPercent}%`, 'بدون أي رسوم خفية'],
    },
    {
      id: 'faq-3',
      category: 'payment',
      question: 'كيف تتم عملية الدفع والتحقق عبر بريدي موب (BaridiMob)؟',
      answer:
        'بعد قبولك للتسعيرة، يظهر لك رقم الـ RIP البريدي المكون من 20 رقماً مع زر نسخ بنقرة واحدة. تفتح تطبيق BaridiMob وتقوم بتحويل المبلغ بدقة، ثم تأخذ لقطة شاشة للوصل (Capture d\'écran) وترفعها في التطبيق مع إدخال رقم المعاملة. يقوم المشرف بمطابقة رقم التحويل مع كشف الحساب الجاري والضغط على "تم التأكيد" للبدء الفوري في عملية الشراء.',
      highlights: ['زر نسخ الـ RIP بضغطة زر واحدة', 'رفع لقطة شاشة الوصل مباشرة', 'تأكيد الحوالة والشراء خلال دقائق'],
    },
    {
      id: 'faq-4',
      category: 'shipping',
      question: 'كم يستغرق وصول السلعة إلى الجزائر وأين أستلمها؟',
      answer:
        'تستغرق معظم الشحنات الدولية ما بين 12 إلى 25 يوماً عمل بحسب نوع الشحن (مثلاً: AliExpress Direct أسرع من الشحن الاقتصادي العادي). عند وصول الطرد إلى الجزائر وخضوعه للتخليص الجمركي بمطار هواري بومدين، يتم توجيهه إلى مركز البريد التابع لدائرتك أو بلديتك (Algérie Poste)، أو التوصيل المباشر لباب منزلك مع تسليمك إشعار استلام رسمي.',
      highlights: ['كود تتبع دولي نشط (Tracking Number)', 'إشعارات لحظية بكل محطة يمر بها الطرد', 'استلام آمن عبر بريد الجزائر'],
    },
    {
      id: 'faq-5',
      category: 'returns',
      question: 'ما هي سياسة الاسترجاع واسترداد الأموال في حال لم تصل السلعة؟',
      answer:
        'أموالك محمية بالكامل: إذا ألغيت الطلب قبل إتمام الشراء بالفيزا، يتم استرجاع المبلغ بالكامل إلى حسابك البريدي. أما إذا فُقد الطرد أثناء الشحن الدولي أو لم يصل خلال المدة المحددة للحماية (60 يوماً)، نفتح نزاعاً رسمياً مع المتجر العالمي ونعيد لك كامل المبلغ بالدينار الجزائري فور تأكيد التعويض.',
      highlights: ['ضمان استرداد الأموال 100% في حال عدم استلام السلعة', 'إلغاء مجاني قبل إتمام عملية الشراء', 'متابعة النزاعات الرسمية نيابة عنك'],
    },
    {
      id: 'faq-6',
      category: 'returns',
      question: 'ماذا لو وصلت السلعة تالفة أو غير مطابقة للوصف والمقاس؟',
      answer:
        'في حال وصول سلعة بها كسر أو تالفة أو مخالفة تماماً لما تم طلبه، يرجى التقاط صور واضحة وفتح تذكرة دعم خلال 48 ساعة من الاستلام. نقوم بالتواصل مع البائع لطلب تعويض جزئي أو كلي وإرجاع القيمة لحسابك وفق سياسة حماية المشتري المعتمدة في المتجر المصدر.',
      highlights: ['حماية المشتري ضد التلف أو العيوب المصنعية', 'مهلة 48 ساعة لتقديم البلاغ بالصور'],
    },
    {
      id: 'faq-7',
      category: 'shipping',
      question: 'ما هي السلع الممنوع استيرادها جمركياً في الجزائر؟',
      answer:
        'يمنع القانون والجمارك الجزائرية استيراد بعض السلع مثل: طائرات الدرون (Drones) والكاميرات اللاسلكية المخفية، أجهزة اللاسلكي والتشويش، الأسلحة وأدوات الصيد، ومستحضرات معينة تخضع لرخص خاصة. الطلبات التي تحتوي على سلع محظورة سيتم رفضها تلقائياً مع تنبيه الزبون قبل الشراء.',
      highlights: ['احترام تام لقوانين الجمارك الجزائرية', 'تنبيه مسبق لحماية الزبون من حجز الطرود'],
    },
    {
      id: 'faq-8',
      category: 'workflow',
      question: 'هل يمكنني تعديل المقاس أو اللون بعد إرسال الطلب؟',
      answer:
        'نعم، يمكنك التواصل معنا لتعديل خيارات المقاس أو اللون طالما أن الطلب في حالة "قيد التسعير" أو "بانتظار الدفع". ولكن بمجرد التحقق من وصل بريدي موب وتنفيذ الشراء بالبطاقة الدولية، لا يمكن تعديل الخيارات لأن الشراء تم تثبيته في المتجر الأصلي.',
      highlights: ['إمكانية التعديل متاحة قبل تنفيذ الشراء', 'تأكيد المقاسات في الملاحظات عند إرسال الطلب'],
    },
  ];

  const categories = [
    { id: 'all', label: 'كافة الأسئلة', icon: HelpCircle },
    { id: 'workflow', label: 'آلية العمل', icon: Sparkles },
    { id: 'fees', label: 'الرسوم والسكوار', icon: DollarSign },
    { id: 'payment', label: 'بريدي موب', icon: CreditCard },
    { id: 'shipping', label: 'الشحن والتوصيل', icon: Truck },
    { id: 'returns', label: 'الاسترجاع والضمان', icon: RotateCcw },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div
      className={`space-y-4 text-xs ${
        isEmbedded
          ? 'rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs'
          : 'p-4 pb-20'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>الأسئلة الشائعة ودليل المشتري</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                FAQ
              </span>
            </h2>
            <p className="text-[11px] text-slate-600">
              إجابات واضحة ومفصلة حول آلية الشراء، دفع بريدي موب، الشحن، وسياسة الاسترجاع
            </p>
          </div>
        </div>

        {onNavigateToNewOrder && (
          <button
            onClick={onNavigateToNewOrder}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[11px] font-bold self-start sm:self-auto transition-colors shadow-2xs"
          >
            بدء طلب جديد
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في الأسئلة (مثال: بريدي موب، الشحن، الجمارك، استرجاع الأموال)..."
          className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-none text-xs text-slate-900 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-2 pt-1">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-slate-600 text-xs font-semibold">لم نجد أسئلة تطابق بحثك</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-emerald-800 font-bold hover:underline"
            >
              عرض كافة الأسئلة
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;

            return (
              <div
                key={faq.id}
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Question Trigger */}
                <button
                  type="button"
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-3.5 text-right flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isExpanded ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    ></span>
                    <h3
                      className={`font-bold text-xs sm:text-[13px] leading-snug ${
                        isExpanded ? 'text-emerald-950 font-extrabold' : 'text-slate-900'
                      }`}
                    >
                      {faq.question}
                    </h3>
                  </div>

                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Answer Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-emerald-100/60 space-y-2.5 animate-in fade-in duration-150">
                    <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed">
                      {faq.answer}
                    </p>

                    {/* Highlights bullet points if present */}
                    {faq.highlights && faq.highlights.length > 0 && (
                      <div className="bg-white/80 rounded-lg p-2.5 border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-900 block mb-1">
                          نقاط أساسية:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {faq.highlights.map((h, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 text-[10px] text-slate-700"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Trust & Support Footer Card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">هل لديك استفسار إضافي أو طلب خاص؟</span>
            <span className="text-slate-600">فريق الدعم الجزائري متاح يومياً للإجابة وتسهيل مشترياتك.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="font-mono font-bold text-emerald-800 text-xs" dir="ltr">
            {systemConfig.baridiMobDetails.phoneNumber}
          </span>
        </div>
      </div>
    </div>
  );
};
