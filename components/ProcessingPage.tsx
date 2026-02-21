
import React from 'react';
import { useTranslation } from '../TranslationContext';

export const ProcessingPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center max-w-md mx-auto relative shadow-xl p-8 text-center animate-in fade-in duration-700">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner - Updated to orange */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-100 border-t-[#FF8C00] rounded-full animate-spin"></div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{t('processing')}</h3>
          <p className="text-gray-500 text-sm max-w-[240px] mx-auto">
            {t('pleaseWait')}
          </p>
        </div>
      </div>
      
      {/* Brand logo at the bottom */}
      <div className="absolute bottom-12 opacity-30">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/AliExpress_2024.svg/330px-AliExpress_2024.svg.png" 
          alt="AliExpress" 
          className="h-5 grayscale object-contain"
        />
      </div>
    </div>
  );
};
