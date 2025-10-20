import { UserPlus, FileCheck, ShoppingCart } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Inscrivez-vous",
      description: "Créez votre compte acheteur ou vendeur en quelques secondes",
      color: "bg-blue-500"
    },
    {
      icon: FileCheck,
      title: "Projets Vérifiés",
      description: "Tous les projets sont certifiés par des organismes accrédités",
      color: "bg-emerald-500"
    },
    {
      icon: ShoppingCart,
      title: "Achetez ou Vendez",
      description: "Transactions sécurisées et instantanées sur la blockchain",
      color: "bg-purple-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl text-gray-900 mb-4">Simple et Rapide</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Commencez à échanger des crédits carbone en 3 étapes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-emerald-300 to-emerald-200 -z-10"></div>
                )}

                {/* Step Number */}
                <div className="relative mb-6">
                  <div className={`w-24 h-24 ${step.color} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600">{index + 1}</span>
                  </div>
                </div>

                <h3 className="text-xl text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
