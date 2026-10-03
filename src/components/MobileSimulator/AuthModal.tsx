import React, { useState } from 'react';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { UserProfile } from '../../types';
import { X, Mail, Lock, Loader2, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ currentUser, isOpen, onClose, onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLoginMode) {
        // محاولة تسجيل الدخول
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess({
          ...currentUser,
          id: userCredential.user.uid,
          email: userCredential.user.email || email,
          fullName: email.split('@')[0], // كحل مؤقت، نأخذ الاسم من الإيميل
        });
      } else {
        // إنشاء حساب جديد
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onLoginSuccess({
          ...currentUser,
          id: userCredential.user.uid,
          email: userCredential.user.email || email,
          fullName: email.split('@')[0],
        });
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('هذا البريد الإلكتروني مستخدم مسبقاً، جرب تسجيل الدخول.');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setErrorMsg('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('كلمة المرور ضعيفة جداً، استخدم 6 أحرف على الأقل.');
      } else {
        setErrorMsg('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* شريط العنوان */}
        <div className="relative bg-emerald-700 p-6 text-center text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white text-emerald-700 rounded-xl mx-auto flex items-center justify-center mb-3 shadow-lg">
            {isLoginMode ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold font-['Cairo']">
            {isLoginMode ? 'مرحباً بعودتك!' : 'إنشاء حساب جديد'}
          </h2>
          <p className="text-emerald-100 text-sm mt-1">
            {isLoginMode ? 'سجل دخولك لمتابعة طلباتك السابقة' : 'سجل الآن وابدأ التسوق معنا'}
          </p>
        </div>

        {/* نموذج الإدخال */}
        <div className="p-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold mb-4 text-center border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني" 
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block pl-3 pr-10 py-3 transition-all"
                dir="ltr"
              />
            </div>

            <div className="relative">
              <Lock className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور" 
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block pl-3 pr-10 py-3 transition-all"
                dir="ltr"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLoginMode ? 'دخول' : 'تسجيل')}
            </button>
          </form>

          {/* تبديل الوضع */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMsg('');
              }}
              className="text-slate-500 text-sm hover:text-emerald-700 font-semibold transition-colors"
            >
              {isLoginMode ? 'ليس لديك حساب؟ أنشئ حساباً الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};