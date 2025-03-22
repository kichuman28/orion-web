import { useEffect, useState } from 'react';
import OrionLogo from '../assets/OrionLogo';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Set a timer to trigger the fade out after 2.5 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-orion-darkGray to-black transition-all duration-600 ${fadeOut ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
    >
      <div className="flex flex-col items-center">
        {/* Logo with pulse and float animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-white/10 rounded-full filter blur-xl animate-pulse"></div>
          <div className="animate-float">
            <div className="animate-spin" style={{ animationDuration: '12s' }}>
              <OrionLogo className="w-32 h-32 text-white" />
            </div>
          </div>
        </div>
        
        {/* Brand name with simple styling */}
        <h1 className="text-5xl font-bold mb-8 text-white animate-pulse">
          ORION
        </h1>
        
        {/* Smooth loading bar using CSS animation */}
        <div className="w-64 h-1 bg-orion-gray/30 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full bg-white rounded-full"
            style={{
              animation: "loadingBar 2.5s ease-in-out forwards"
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 