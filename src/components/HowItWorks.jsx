const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Submit Your Paper",
      description: "Researchers submit their academic papers along with a small deposit that serves as a stake in the verification process."
    },
    {
      number: "02",
      title: "AI Analysis",
      description: "The platform uses advanced AI to analyze the content, citations, and methodology for authenticity and academic integrity."
    },
    {
      number: "03",
      title: "DAO Committee Review",
      description: "A decentralized committee of academic experts reviews and validates the paper through a transparent process."
    },
    {
      number: "04",
      title: "Blockchain Certification",
      description: "Once verified, the paper receives a blockchain certification, and the researcher's deposit is returned with incentives."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-orion-darkGray to-orion-mediumGray text-white relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/5 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-orion-lightGray/30 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-orion-lightGray/40 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-orion-gray/20 rounded-full animate-ping" style={{ animationDuration: '5s' }}></div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orion-darkGray/50 to-transparent -z-10"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">How Orion Works</h2>
          <p className="text-xl text-orion-lightGray/90 max-w-2xl mx-auto">
            Our streamlined verification process combines advanced technology with human expertise
          </p>
        </div>
        
        <div className="relative">
          {/* Enhanced connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-white/40 via-orion-lightGray/30 to-transparent transform -translate-x-1/2 rounded-full"></div>
          
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center`}>
                <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16'} mb-8 lg:mb-0`}>
                  <div className={`inline-block ${index % 2 === 0 ? 'lg:ml-auto' : ''}`}>
                    <span className="text-7xl font-bold bg-gradient-to-r from-orion-lightGray/10 to-orion-lightGray/30 bg-clip-text text-transparent">{step.number}</span>
                    <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                    <p className="text-orion-lightGray/80 max-w-md">{step.description}</p>
                  </div>
                </div>
                
                <div className="lg:w-0 flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orion-lightBg to-white border-4 border-orion-darkGray z-10 flex items-center justify-center shadow-glow">
                    <div className="w-3 h-3 rounded-full bg-orion-darkGray"></div>
                  </div>
                </div>
                
                <div className="w-full lg:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 