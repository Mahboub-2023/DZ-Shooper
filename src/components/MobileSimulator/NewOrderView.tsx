import React, { useState } from 'react';
import { Link2, Image as ImageIcon, Send, Calculator, HelpCircle, Check, Info } from 'lucide-react';
import { PlatformSource, OrderItem, SystemConfig, UserProfile } from '../../types';
import { ALGERIA_WILAYAS } from '../../data/algeriaWilayas';
import { calculateOrderPricing, formatDZD } from '../../utils/currency';

// --- استدعاء مكتبات Firebase السحرية ---
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase'; 
// ----------------------------------------

interface NewOrderViewProps {
  systemConfig: SystemConfig;
  userProfile?: UserProfile;
  onSubmitOrder: (newOrder: Partial<OrderItem>) => void;
  onCancel: () => void;
  initialPrefill?: {
    price?: number;
    currency?: 'EUR' | 'USD';
    shippingDZD?: number;
    quantity?: number;
    wilaya?: string;
  };
}

export const NewOrderView: React.FC<NewOrderViewProps> = ({
  systemConfig,
  userProfile,
  onSubmitOrder,
  onCancel,
  initialPrefill,
}) => {
  const [platform, setPlatform] = useState<PlatformSource>('aliexpress');
  const [productTitle, setProductTitle] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [productImageUrl, setProductImageUrl] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(initialPrefill?.quantity || 1);
  const [notes, setNotes] = useState('');

  const [customerName, setCustomerName] = useState(userProfile?.fullName || 'عبد الصمد بلحاج');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phoneNumber || '0661234567');
  const [customerWilaya, setCustomerWilaya] = useState(
    initialPrefill?.wilaya || userProfile?.wilaya || 'الجزائر العاصمة'
  );
  const [customerAddress, setCustomerAddress] = useState(
    userProfile ? `${userProfile.commune}، ${userProfile.detailedAddress}` : 'باب الزوار، الجزائر'
  );

  const [estimatePrice, setEstimatePrice] = useState<string>(
    initialPrefill?.price ? String(initialPrefill.price) : '25'
  );
  const [estimateCurrency, setEstimateCurrency] = useState<'EUR' | 'USD'>(
    initialPrefill?.currency || 'USD'
  );
  const [estimateShipping, setEstimateShipping] = useState<number>(
    initialPrefill?.shippingDZD ?? 800
  );

  const samplePresets = [
    {
      title: 'ساعة يد رقمية ذكية مقاومة للماء (AliExpress)',
      platform: 'aliexpress' as PlatformSource,
      url: 'https://aliexpress.com/item/smart-watch-waterproof-2026.html',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      color: 'أسود رياضي (Black Sport)',
      size: 'Standard 44mm',
      price: '29.90',
      currency: 'USD' as const,
    },
    {
      title: 'فستان مخملي للمناسبات أنيق (SHEIN)',
      platform: 'shein' as PlatformSource,
      url: 'https://shein.com/item/velvet-evening-dress-ar.html',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
      color: 'أزرق ملكي (Royal Blue)',
      size: 'L (Large)',
      price: '34.00',
      currency: 'EUR' as const,
    },
    {
      title: 'مكبر صوت بلوتوث محمول عالي الدقة (TEMU)',
      platform: 'temu' as PlatformSource,
      url: 'https://temu.com/goods-portable-wireless-bass-speaker.html',
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
      color: 'رمادي فضي (Silver Gray)',
      size: 'One Size',
      price: '18.50',
      currency: 'USD' as const,
    },
  ];

  const handleApplyPreset = (preset: typeof samplePresets[0]) => {
    setPlatform(preset.platform);
    setProductTitle(preset.title);
    setProductUrl(preset.url);
    setProductImageUrl(preset.image);
    setColor(preset.color);
    setSize(preset.size);
    setEstimatePrice(preset.price);
    setEstimateCurrency(preset.currency);
  };

  const parsedPrice = parseFloat(estimatePrice) || 0;
  const activeRate = estimateCurrency === 'EUR' ? systemConfig.eurToDzdRate : systemConfig.usdToDzdRate;
  const estimateResult = calculateOrderPricing(
    parsedPrice * quantity,
    estimateCurrency,
    activeRate,
    systemConfig.profitMarginPercent,
    systemConfig.minimumServiceFeeDZD,
    estimateShipping
  );

  // --- دالة الإرسال الجديدة المربوطة بقاعدة البيانات ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productTitle.trim() && !productUrl.trim()) return;

    // 1. التأكد من تسجيل الدخول
    if (!auth.currentUser) {
      alert("عذراً، يجب عليك تسجيل الدخول أولاً لكي تتمكن من إرسال طلب!");
      return;
    }

    try {
      // 2. تجميع بيانات الطلب
      const orderData = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        platform,
        productTitle: productTitle.trim() || 'سلعة من ' + platform.toUpperCase(),
        productUrl: productUrl.trim(),
        productImageUrl,
        productVariants: {
          color: color.trim() || 'غير محدد',
          size: size.trim() || 'غير محدد',
          quantity,
          notes: notes.trim() || '',
        },
        customerName,
        customerPhone,
        customerWilaya,
        customerAddress,
        estimatedTotalDZD: estimateResult.totalDZD,
        status: 'pending', // حالة الطلب: قيد المراجعة
        createdAt: serverTimestamp(), // التوقيت الفعلي من سيرفر جوجل
      };

      // 3. إرسال الطلب إلى جدول "orders" في Firebase
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      console.log("تم الإرسال بنجاح! كود الطلب:", docRef.id);
      
      alert("تم استلام طلبك بنجاح! سيقوم فريقنا بمراجعته قريباً.");
      
      // إغلاق النافذة بعد النجاح
      onSubmitOrder(orderData as any);

    } catch (error) {
      console.error("حدث خطأ أثناء إرسال الطلب:", error);
      alert("عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.");
    }
  };
  // ---------------------------------------------------

  return (
    <div className="p-4 pb-20 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">طلب سلعة جديدة</h2>
          <p className="text-[11px] text-slate-700">ألصق رابط السلعة أو ارفع صورتها وسنقوم بتسعيرها بالدينار الجزائري</p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-700 hover:text-slate-950 px-2 py-1 rounded-md hover:bg-slate-100"
        >
          إلغاء
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 w-full">
        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-emerald-700" />
          <span>نماذج سريعة للتجربة الفورية بنقرة واحدة:</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-right p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-xs transition-all w-full flex items-center justify-between sm:flex-col sm:items-start"
            >
              <span className="font-bold text-slate-800 block truncate">{preset.title.split(' ')[0]} {preset.title.split(' ')[1]}</span>
              <span className="text-emerald-800 font-mono font-bold">{preset.price} {preset.currency}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs w-full">
        <div className="space-y-1.5 w-full">
          <label className="font-bold text-slate-800 block">الموقع المصدري للسلعة</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
            {[
              { id: 'aliexpress', label: 'AliExpress' },
              { id: 'shein', label: 'SHEIN' },
              { id: 'temu', label: 'TEMU' },
              { id: 'other', label: 'متجر آخر' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPlatform(item.id as PlatformSource)}
                className={`py-2.5 px-2 text-center font-bold text-xs rounded-xl border transition-all w-full ${
                  platform === item.id
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 w-full">
          <label className="font-bold text-slate-800 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>رابط السلعة (URL)</span>
          </label>
          <input
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="مثال: https://aliexpress.com/item/100500..."
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all font-mono"
            dir="ltr"
          />
        </div>

        <div className="space-y-1 w-full">
          <label className="font-bold text-slate-800 block">اسم أو وصف السلعة</label>
          <input
            type="text"
            required
            value={productTitle}
            onChange={(e) => setProductTitle(e.target.value)}
            placeholder="مثال: حذاء رياضي نسائي مقاس 38 لون أبيض"
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
          <div className="space-y-1 w-full">
            <label className="font-bold text-slate-800 block">اللون المفضل</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="مثال: أسود"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
            />
          </div>
          <div className="space-y-1 w-full">
            <label className="font-bold text-slate-800 block">المقاس / السعة</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="مثال: XL أو 128GB"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
            />
          </div>
          <div className="space-y-1 w-full">
            <label className="font-bold text-slate-800 block">الكمية</label>
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white w-full">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center font-bold font-mono py-2 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span>حاسبة التكلفة التقديرية بالدينار</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">سعر الصرف الموازي (السكوار)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-600 block mb-0.5">سعر السلعة التقريبي في الموقع</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  value={estimatePrice}
                  onChange={(e) => setEstimatePrice(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded-md font-mono text-xs font-bold outline-none"
                />
                <select
                  value={estimateCurrency}
                  onChange={(e) => setEstimateCurrency(e.target.value as 'EUR' | 'USD')}
                  className="px-1.5 py-1.5 bg-white border border-emerald-300 rounded-md font-bold text-xs"
                >
                  <option value="USD">USD $</option>
                  <option value="EUR">EUR €</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg p-2 border border-emerald-200 flex flex-col justify-center text-center">
              <span className="text-[10px] text-slate-600 block">التكلفة التقديرية الشاملة:</span>
              <span className="text-sm font-extrabold text-emerald-800 font-mono tabular-nums">
                {formatDZD(estimateResult.totalDZD)}
              </span>
              <span className="text-[9px] text-slate-600 font-sans">تشمل العمولة والشحن التقديري</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-200 pt-3">
          <h3 className="font-bold text-slate-900">بيانات التوصيل في الجزائر</h3>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">الولاية (58 ولاية)</label>
              <select
                value={customerWilaya}
                onChange={(e) => setCustomerWilaya(e.target.value)}
                className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-emerald-600 outline-none"
              >
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w.code} value={w.nameAr}>
                    {w.code} - {w.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">رقم هاتف الاتصال</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="06XXXXXXXX"
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:border-emerald-600 outline-none font-mono"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">العنوان الدقيق / مكتب البريد</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="مثال: الدار البيضاء، شارع أول نوفمبر أو مركز البريد المركزي"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-800 block">ملاحظات إضافية (اختياري)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أي تفاصيل ترغب في التأكد منها قبل الشراء..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-emerald-600 outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs"
        >
          <Send className="w-4 h-4" />
          <span>إرسال الطلب لمراجعة الإدارة وتأكيد السعر</span>
        </button>
      </form>
    </div>
  );
};