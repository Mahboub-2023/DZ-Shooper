import React, { useState } from 'react';
import { Mail, CheckCircle2, Clock, Eye, Copy, Check, ExternalLink, ArrowRight, Send, Sparkles } from 'lucide-react';
import { SentEmailLog } from '../../types';

interface EmailPreviewModalProps {
  email: SentEmailLog;
  onClose: () => void;
  onResend?: (email: SentEmailLog) => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  email,
  onClose,
  onResend,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'html'>('preview');

  const handleCopySubjectAndSnippet = () => {
    navigator.clipboard.writeText(`الموضوع: ${email.subject}\nإلى: ${email.recipientEmail}\nالتاريخ: ${email.sentAt}\n\n${email.previewSnippet}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 text-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">معاينة البريد الإلكتروني المرسل</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 font-bold text-[10px] border border-emerald-400/40">
                  {email.status === 'delivered' ? '✓ تم التسليم بنجاح' : 'قيد الإرسال'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 mt-0.5 font-mono" dir="ltr">
                To: {email.recipientEmail} ({email.recipientName})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors font-bold text-sm"
          >
            ×
          </button>
        </div>

        {/* Email Meta Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 space-y-2 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <span className="text-slate-500">الموضوع:</span>
              <span className="text-slate-900 font-bold">{email.subject}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{email.sentAt}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'preview'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                شاشة البريد المنسق (Visual)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === 'html'
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                كود HTML الخام
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopySubjectAndSnippet}
              className="px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:bg-white rounded-lg border border-slate-200 flex items-center gap-1 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">تم نسخ النص</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>نسخ ملخص الرسالة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100">
          {activeTab === 'preview' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-xl mx-auto">
              {/* Fake Email Client Top Bar */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="font-semibold text-slate-700">DZ Shopper Notifications</span>
                  <span className="text-slate-400 font-mono">&lt;notifications@dz-shopper.dz&gt;</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">إلى: {email.recipientEmail}</span>
              </div>

              {/* Rendered HTML inside safe container */}
              <div
                className="email-rendered-preview p-2"
                dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
              />
            </div>
          ) : (
            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800" dir="ltr">
              <pre className="whitespace-pre-wrap">{email.bodyHtml}</pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>مرسل بنجاح عبر خادم الإشعارات السحابي (Simulated Cloud SMTP)</span>
          </div>

          <div className="flex items-center gap-2">
            {onResend && (
              <button
                type="button"
                onClick={() => onResend(email)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إعادة إرسال الآن</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
