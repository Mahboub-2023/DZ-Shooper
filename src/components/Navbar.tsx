import React from 'react';
import { Smartphone, LayoutDashboard, FileCode2, Coins } from 'lucide-react';

interface NavbarProps {
  activeTab: 'simulator' | 'admin' | 'architecture' | 'rates';
  setActiveTab: (tab: 'simulator' | 'admin' | 'architecture' | 'rates') => void;
  eurRate: number;
  usdRate: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  eurRate,
  usdRate,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Zone 1 & Zone 3 on mobile: Brand Wordmark & Rates */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm shrink-0">
              DZ
            </div>
            <button
              onClick={() => setActiveTab('simulator')}
              className="text-right text-slate-900 hover:text-emerald-700 transition-colors"
            >
              <span className="font-extrabold text-base sm:text-xl tracking-tight block">DZ Shopper</span>
              <span className="text-[10px] sm:text-[11px] text-slate-600 block font-medium">وسيط الشراء والدفع ببريدي موب</span>
            </button>
          </div>

          {/* Quick Rates for Mobile */}
          <div className="flex sm:hidden items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-700 border border-slate-200">
            <Coins className="w-3 h-3 text-amber-600" />
            <span className="text-emerald-800">1€={eurRate}</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-800">1$={usdRate}</span>
          </div>
        </div>

        {/* Zone 2: Navigation Tabs - Full Width on Mobile */}
        <nav className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`w-full sm:w-auto px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'simulator'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 sm:bg-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">محاكي التطبيق</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`w-full sm:w-auto px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'admin'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 sm:bg-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">لوحة الإدارة</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`w-full sm:w-auto px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-center ${
              activeTab === 'architecture'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 sm:bg-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">الهندسة البرمجية</span>
          </button>
        </nav>

        {/* Zone 3: Exchange Rate Indicator (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums text-slate-700 border border-slate-200">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>السكوار:</span>
            <span className="text-emerald-700 font-semibold">1€ = {eurRate} دج</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-700 font-semibold">1$ = {usdRate} دج</span>
          </div>

          <button
            onClick={() => setActiveTab('architecture')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap"
          >
            دليل النظام التقني
          </button>
        </div>
      </div>
    </header>
  );
};
