import OrionLogo from '../assets/OrionLogo';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 py-4">
      <div className="container mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <OrionLogo className="w-8 h-8 text-orion-darkGray" />
            <span className="font-bold text-xl text-orion-darkGray">Orion</span>
          </div>
          
          <nav className="hidden md:flex gap-8 font-medium">
            <a 
              href="#features" 
              className="text-orion-gray hover:text-orion-darkGray transition-colors"
              tabIndex="0"
              aria-label="View features"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-orion-gray hover:text-orion-darkGray transition-colors"
              tabIndex="0"
              aria-label="Learn how it works"
            >
              How It Works
            </a>
            <a 
              href="#benefits" 
              className="text-orion-gray hover:text-orion-darkGray transition-colors"
              tabIndex="0"
              aria-label="View benefits"
            >
              Benefits
            </a>
          </nav>
          
          <div>
            <button 
              className="bg-orion-darkGray text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orion-mediumGray transition-colors duration-300"
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