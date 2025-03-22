import { VerifiedIcon, BlockchainIcon, AIIcon, ResearchIcon } from '../assets/icons';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-gradient-to-br from-white to-orion-lightGray/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orion-gray/10 hover:translate-y-[-5px] group">
    <div className="w-12 h-12 bg-gradient-to-br from-orion-darkGray to-orion-mediumGray rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-orion-darkGray">{title}</h3>
    <p className="text-orion-gray">{description}</p>
  </div>
);

const Features = () => {
  const features = [
    {
      icon: VerifiedIcon,
      title: "Decentralized Verification",
      description: "Papers are verified through a trusted DAO-like committee, ensuring genuine academic research."
    },
    {
      icon: BlockchainIcon,
      title: "Blockchain Security",
      description: "Transparent and immutable record-keeping of verified papers, citations, and references."
    },
    {
      icon: AIIcon,
      title: "Advanced AI Analysis",
      description: "Utilizes generative AI and RAG to provide contextual insights and interactive Q&A."
    },
    {
      icon: ResearchIcon,
      title: "Tokenized Incentives",
      description: "Researchers are rewarded for genuine submissions and participation in the verification process."
    }
  ];

  return (
    <section id="features" className="py-20 relative bg-gradient-to-b from-orion-lightBg to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-3 relative">
            <span className="bg-gradient-to-r from-orion-darkGray to-orion-mediumGray text-transparent bg-clip-text">Cutting-Edge Features</span>
            <div className="w-24 h-1 bg-gradient-to-r from-orion-darkGray to-orion-mediumGray rounded-full mx-auto mt-3"></div>
          </h2>
          <div className="relative">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-orion-lightGray/20 rounded-full filter blur-3xl"></div>
            <p className="text-xl text-orion-gray max-w-2xl mx-auto mt-4 relative z-10">
              Orion combines advanced technologies to create a secure, transparent, and efficient academic verification platform.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title} 
              description={feature.description} 
            />
          ))}
        </div>
      </div>
      
      {/* Enhanced decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orion-darkGray/5 to-transparent rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orion-gray/5 to-transparent rounded-full filter blur-3xl -z-10"></div>
      
      {/* Additional decorative elements */}
      <div className="hidden lg:block absolute top-1/2 left-1/4 w-40 h-40 border border-dashed border-orion-gray/10 rounded-full animate-spin" style={{ animationDuration: '35s' }}></div>
      <div className="hidden lg:block absolute bottom-1/3 right-1/4 w-24 h-24 border border-orion-gray/10 rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
    </section>
  );
};

export default Features; 