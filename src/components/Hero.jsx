import { ArrowRightIcon } from '../assets/icons';

const Hero = () => {
  return (
    <section className="pt-32 pb-36 min-h-screen flex items-center relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-orion-darkGray/20 to-orion-gray/5 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-bl from-orion-mediumGray/15 to-orion-gray/10 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-orion-gray/10 to-orion-lightGray/50 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Enhanced Decorative elements */}
        <div className="absolute top-20 right-20 w-40 h-40 border-4 border-dashed border-orion-gray/10 rounded-full animate-spin" style={{ animationDuration: '40s' }}></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 border-2 border-orion-darkGray/5 rounded-full animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-orion-gray/10 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '50s' }}></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 inline-block relative overflow-hidden">
            {/* Premium ORION title with light effect */}
            <div className="relative">
              <span className="font-bold font-quicksand text-orion-darkGray text-8xl md:text-9xl lg:text-[10rem] leading-none inline-block">
                <span className="relative z-10 drop-shadow-lg bg-gradient-to-b from-orion-darkGray via-orion-mediumGray to-orion-gray bg-clip-text text-transparent">ORION</span>
              </span>
              <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-orion-gray/30 to-transparent"></div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-orion-lightGray/20 rounded-full filter blur-2xl"></div>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 font-quicksand text-orion-darkGray">
            Revolutionizing Academic Verification
          </h2>
          
          <p className="text-xl md:text-2xl text-orion-gray mb-10 max-w-2xl mx-auto">
            A decentralized platform leveraging AI and blockchain to ensure the authenticity of scholarly work.
          </p>
          
          <div className="flex flex-row gap-5 justify-center">
            <button 
              className="bg-orion-darkGray text-white py-3 px-6 rounded-lg text-base font-medium hover:bg-orion-mediumGray transition-colors duration-300 flex items-center gap-2"
              tabIndex="0"
              aria-label="Explore the Orion platform"
            >
              Explore Orion
              <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <button 
              className="bg-white text-orion-darkGray py-3 px-6 rounded-lg text-base font-medium 
              border border-orion-gray/20 hover:bg-orion-lightBg/50 transition-colors duration-300
              flex items-center gap-2"
              tabIndex="0"
              aria-label="Learn more about Orion"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 