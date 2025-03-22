import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OrionLogo from '../assets/OrionLogo';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  const handleGetStarted = () => {
    navigate('/login');
  };
  
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 py-5">
      <div className="container mx-auto">
        <div className={`transition-all duration-300 px-8 py-4 flex justify-between items-center ${
          scrolled 
            ? "bg-white/90 backdrop-blur-sm rounded-xl shadow-lg" 
            : "bg-transparent"
        }`}>
          <Link 
            to="/" 
            className="flex items-center gap-3"
            tabIndex="0"
            aria-label="Go to home page"
          >
            <OrionLogo className="w-10 h-10 text-orion-darkGray" />
            <span className="font-bold text-2xl text-orion-darkGray">Orion</span>
          </Link>
          
          <nav className="hidden md:flex gap-10 font-medium">
            <a 
              href="#features" 
              className="text-orion-gray hover:text-orion-darkGray transition-colors text-lg"
              tabIndex="0"
              aria-label="View features"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-orion-gray hover:text-orion-darkGray transition-colors text-lg"
              tabIndex="0"
              aria-label="Learn how it works"
            >
              How It Works
            </a>
            <a 
              href="#contact" 
              className="text-orion-gray hover:text-orion-darkGray transition-colors text-lg"
              tabIndex="0"
              aria-label="Contact us"
            >
              Contact
            </a>
          </nav>
          
          <div>
            <button 
              onClick={handleGetStarted}
              className="bg-orion-darkGray text-white py-3 px-6 rounded-lg text-base font-medium hover:bg-orion-mediumGray transition-colors duration-300"
              tabIndex="0"
              aria-label="Get started with Orion"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 