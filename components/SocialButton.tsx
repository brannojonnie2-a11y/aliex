
import React from 'react';

interface SocialButtonProps {
  type: 'google' | 'facebook' | 'apple';
  label: string;
  icon: string;
  onClick?: () => void;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ type, label, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-300 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 relative"
    >
      <div className="absolute left-6">
        <img src={icon} alt={`${type} logo`} className="w-6 h-6 object-contain" />
      </div>
      <span className="text-lg font-medium text-[#191919] lowercase tracking-wide">
        {label}
      </span>
    </button>
  );
};
