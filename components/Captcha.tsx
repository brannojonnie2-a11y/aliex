
import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Lock } from 'lucide-react';
import { useTranslation } from '../TranslationContext';

interface CaptchaProps {
  onSuccess: () => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateCode = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setCode(newCode);
    setUserInput('');
    setError(false);
  };

  useEffect(() => {
    generateCode();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput === code) {
      setIsLoading(true);
      setTimeout(() => {
        onSuccess();
      }, 800);
    } else {
      setError(true);
      generateCode();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#FFF1F1] rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10 text-[#FF4747]" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('securityCheck')}</h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          {t('securityCheckDesc')}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200 w-full justify-center relative overflow-hidden h-20">
               <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none overflow-hidden text-[8px]">
                 {Array.from({length: 60}).map((_, i) => (
                   <span key={i} className="absolute text-[#FF4747]" style={{ 
                     top: Math.random()*100+'%', 
                     left: Math.random()*100+'%', 
                     transform: `rotate(${Math.random()*360}deg)`,
                     fontWeight: 'bold'
                   }}>
                     {Math.random().toString(36).substring(7)}
                   </span>
                 ))}
               </div>
              <span className="text-4xl font-black tracking-[0.5em] text-[#191919] select-none italic font-mono pl-4">
                {code}
              </span>
              <button 
                type="button" 
                onClick={generateCode}
                className="absolute right-4 p-2 text-[#FF4747] hover:bg-[#FFF1F1] rounded-full transition-colors z-10"
                title={t('refreshCode')}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
              {t('enterCode')}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={userInput}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setUserInput(val);
                setError(false);
              }}
              className={`w-full py-4 text-center text-2xl font-bold tracking-widest bg-gray-50 border-2 rounded-2xl outline-none transition-all ${
                error ? 'border-[#FF4747] bg-[#FFF1F1] text-[#FF4747]' : 'border-gray-100 focus:border-[#FF4747] text-gray-900'
              }`}
              placeholder="----"
              autoFocus
            />
            {error && (
              <p className="text-[#FF4747] text-xs text-center font-medium animate-pulse">
                Verification failed. Please try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={userInput.length !== 4 || isLoading}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              userInput.length === 4 && !isLoading
                ? 'bg-[#FF4747] hover:bg-[#E63939] active:scale-95 shadow-lg shadow-red-100'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5" />
                {t('verifyIdentity')}
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-xs text-gray-400 font-medium">
          {t('protectedBy')}
        </p>
      </div>
    </div>
  );
};
