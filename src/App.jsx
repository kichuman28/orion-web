import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import SplashScreen from './components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {/* Always render the landing page behind the splash screen */}
      <div className="relative z-0">
        <LandingPage />
      </div>
      
      {/* Overlay the splash screen with a higher z-index */}
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
    </>
  );
}

export default App;
