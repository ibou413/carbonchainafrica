import { ShoppingBag, Leaf, Shield, Zap, TrendingUp, Globe } from 'lucide-react';
import { Card } from './ui/card';

export function Benefits() {
  const benefits = [
    {
      icon: ShoppingBag,
      title: "Buyers",
      description: "Offset your carbon footprint with verified credits",
      features: ["Transparent prices", "Digital portfolio", "Authentic certificates"],
      color: "blue"
    },
    {
      icon: Leaf,
      title: "Sellers",
      description: "Monetize your environmental projects",
      features: ["NFT tokenization", "Global access", "Fast payments"],
      color: "emerald"
    }
  ];

  const platformFeatures = [
    {
      icon: Shield,
      title: "Certified Verification",
      description: "Each project is validated by accredited organizations"
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description: "Confirmation in 3-5 seconds thanks to Hedera"
    },
    {
      icon: TrendingUp,
      title: "Market Price",
      description: "Transparent price discovery via the marketplace"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Support African projects that matter"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Benefits */}
        <div className="text-center mb-16">
          <h2 className="text-4xl text-gray-900 mb-4">
            Why CarbonChain Africa?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A simple, secure and transparent marketplace for everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const bgColor = benefit.color === 'blue' ? 'from-blue-50 to-indigo-50' : 'from-emerald-50 to-teal-50';
            const iconColor = benefit.color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500';
            
            return (
              <Card key={index} className={`p-8 bg-gradient-to-br ${bgColor} border-2`}>
                <div className={`w-16 h-16 ${iconColor} rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 mb-6">{benefit.description}</p>
                
                <ul className="space-y-3">
                  {benefit.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-700">
                      <div className={`w-2 h-2 ${iconColor} rounded-full`}></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        {/* Platform Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
