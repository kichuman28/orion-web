import { ArrowRightIcon } from '../assets/icons';

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orion-lightBg via-white to-orion-lightGray/30"></div>
        
        {/* Animated circles */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-orion-gray/10 to-transparent rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-bl from-orion-gray/5 to-transparent rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/3 right-1/3 w-40 h-40 border border-dashed border-orion-gray/10 rounded-full animate-spin" style={{ animationDuration: '40s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-32 h-32 border border-orion-gray/10 rounded-full animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto relative">
          {/* Light glow effect behind the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-orion-lightGray/30 to-white/50 rounded-2xl blur-lg"></div>
          
          <div className="bg-white rounded-2xl shadow-lg p-10 md:p-14 text-center relative z-10 border border-white/50">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-orion-darkGray">
              Ready to Join <span className="bg-gradient-to-r from-orion-darkGray to-orion-mediumGray text-transparent bg-clip-text">Orion</span>?
            </h2>
            
            <p className="text-xl text-orion-gray mb-8 max-w-2xl mx-auto">
              Be part of the future of trusted academic publishing with our revolutionary verification platform.
            </p>
            
            <div className="flex flex-row gap-6 justify-center">
              <button 
                className="bg-orion-darkGray text-white py-3 px-6 rounded-lg text-base font-medium hover:bg-orion-mediumGray transition-colors duration-300 flex items-center gap-2"
                tabIndex="0"
                aria-label="Start using Orion platform"
              >
                Get Started Now
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              
              <button 
                className="bg-white text-orion-darkGray py-3 px-6 rounded-lg text-base font-medium border border-orion-gray/20 hover:bg-orion-lightBg/50 transition-colors duration-300 flex items-center gap-2"
                tabIndex="0"
                aria-label="Schedule a demo of the Orion platform"
              >
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA; 