const Benefits = () => {
  return (
    <section id="benefits" className="py-20 bg-orion-darkGray text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Why Choose Orion</h2>
          <p className="text-xl text-orion-lightGray/80 max-w-2xl mx-auto">
            Orion offers significant advantages for researchers, institutions, and the academic community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-white">Increased Trust</h3>
            <p className="text-orion-lightGray/80">
              Build credibility for your research through our transparent verification process, enhancing citation potential.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-white">Incentivized Publishing</h3>
            <p className="text-orion-lightGray/80">
              Earn tokenized rewards for publishing authentic research and participating in the verification ecosystem.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-white">Reduced Fraud</h3>
            <p className="text-orion-lightGray/80">
              Our multi-layered verification process significantly reduces academic fraud and enhances integrity.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-white">Faster Verification</h3>
            <p className="text-orion-lightGray/80">
              AI-powered initial screening accelerates the verification process without compromising on quality.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-white">Enhanced Discoverability</h3>
            <p className="text-orion-lightGray/80">
              Verified papers enjoy higher visibility and searchability within the academic community.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-white">Permanent Record</h3>
            <p className="text-orion-lightGray/80">
              Blockchain technology ensures your research achievements are permanently and immutably recorded.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits; 